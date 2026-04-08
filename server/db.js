import fs from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';
import { createInitialState } from './data/initialState.js';
import { migrateDb } from './data/migrate.js';

const dataDir = path.resolve(process.cwd(), 'server', 'data');
const dbPath = path.resolve(dataDir, 'db.json');
const tempDbPath = path.resolve(dataDir, 'db.tmp.json');

const DATABASE_URL = process.env.DATABASE_URL || '';
const DB_STATE_TABLE = process.env.DB_STATE_TABLE || 'byndio_app_state';
const DB_STATE_KEY = process.env.DB_STATE_KEY || 'main';

const usePostgres = Boolean(DATABASE_URL);

let queue = Promise.resolve();
let initialized = false;
let pgPool = null;

function getPgPool() {
  if (!usePostgres) {
    return null;
  }

  if (pgPool) {
    return pgPool;
  }

  pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.PGSSL === 'disable' ? false : { rejectUnauthorized: false },
  });

  return pgPool;
}

function stateTableSql() {
  return `"${DB_STATE_TABLE.replace(/"/g, '""')}"`;
}

async function ensurePostgresState() {
  if (initialized) {
    return;
  }

  const pool = getPgPool();
  const tableName = stateTableSql();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const existing = await pool.query(`SELECT id FROM ${tableName} WHERE id = $1 LIMIT 1`, [DB_STATE_KEY]);
  if (existing.rowCount === 0) {
    const initial = createInitialState();
    await pool.query(
      `INSERT INTO ${tableName} (id, data, updated_at) VALUES ($1, $2::jsonb, NOW())`,
      [DB_STATE_KEY, JSON.stringify(initial)],
    );
  }

  initialized = true;
}

async function ensureDbFile() {
  if (initialized) {
    return;
  }

  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dbPath);
  } catch {
    const initial = createInitialState();
    await fs.writeFile(dbPath, JSON.stringify(initial, null, 2), 'utf8');
  }

  initialized = true;
}

async function readDbFile() {
  await ensureDbFile();
  const raw = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(raw);
}

async function writeDbFile(db) {
  await ensureDbFile();
  await fs.writeFile(tempDbPath, JSON.stringify(db, null, 2), 'utf8');
  await fs.rename(tempDbPath, dbPath);
}

async function readDbPostgres() {
  await ensurePostgresState();
  const pool = getPgPool();
  const tableName = stateTableSql();

  const result = await pool.query(`SELECT data FROM ${tableName} WHERE id = $1 LIMIT 1`, [DB_STATE_KEY]);
  if (result.rowCount === 0) {
    const initial = createInitialState();
    await pool.query(
      `INSERT INTO ${tableName} (id, data, updated_at) VALUES ($1, $2::jsonb, NOW())`,
      [DB_STATE_KEY, JSON.stringify(initial)],
    );
    return initial;
  }

  return result.rows[0].data;
}

async function writeDbPostgres(db) {
  await ensurePostgresState();
  const pool = getPgPool();
  const tableName = stateTableSql();

  await pool.query(
    `UPDATE ${tableName} SET data = $2::jsonb, updated_at = NOW() WHERE id = $1`,
    [DB_STATE_KEY, JSON.stringify(db)],
  );
}

async function withMigratedState(rawDb, writer) {
  const { db, changed } = migrateDb(rawDb);
  if (changed) {
    await writer(db);
  }
  return db;
}

export async function readDb() {
  if (usePostgres) {
    const rawDb = await readDbPostgres();
    return withMigratedState(rawDb, writeDbPostgres);
  }

  const rawDb = await readDbFile();
  return withMigratedState(rawDb, writeDbFile);
}

export async function writeDb(db) {
  if (usePostgres) {
    await writeDbPostgres(db);
    return;
  }

  await writeDbFile(db);
}

async function updateDbPostgres(mutator) {
  await ensurePostgresState();
  const pool = getPgPool();
  const tableName = stateTableSql();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT data FROM ${tableName} WHERE id = $1 FOR UPDATE`,
      [DB_STATE_KEY],
    );

    let db = result.rowCount === 0 ? createInitialState() : result.rows[0].data;
    const migrated = migrateDb(db);
    db = migrated.db;

    const mutatorResult = await mutator(db);
    await client.query(
      `
        INSERT INTO ${tableName} (id, data, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `,
      [DB_STATE_KEY, JSON.stringify(db)],
    );
    await client.query('COMMIT');
    return mutatorResult;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateDbFile(mutator) {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}

export async function updateDb(mutator) {
  queue = queue.then(async () => {
    if (usePostgres) {
      return updateDbPostgres(mutator);
    }

    return updateDbFile(mutator);
  });

  return queue;
}

export { dbPath, usePostgres };
