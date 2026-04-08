import fs from 'node:fs/promises';
import path from 'node:path';
import { createInitialState } from './data/initialState.js';
import { migrateDb } from './data/migrate.js';

const dataDir = path.resolve(process.cwd(), 'server', 'data');
const dbPath = path.resolve(dataDir, 'db.json');
const tempDbPath = path.resolve(dataDir, 'db.tmp.json');

let queue = Promise.resolve();
let initialized = false;

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

export async function readDb() {
  await ensureDbFile();
  const raw = await fs.readFile(dbPath, 'utf8');
  const parsed = JSON.parse(raw);
  const { db, changed } = migrateDb(parsed);
  if (changed) {
    await writeDb(db);
  }
  return db;
}

export async function writeDb(db) {
  await ensureDbFile();
  await fs.writeFile(tempDbPath, JSON.stringify(db, null, 2), 'utf8');
  await fs.rename(tempDbPath, dbPath);
}

export async function updateDb(mutator) {
  queue = queue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  });

  return queue;
}

export { dbPath };
