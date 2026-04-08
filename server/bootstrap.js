import crypto from 'node:crypto';
import { updateDb } from './db.js';
import { hashPassword } from './auth.js';
import { runAllCoreJobs } from './jobs.js';

async function ensureUser(db, userDefinition) {
  const existing = db.users.find((user) => user.email.toLowerCase() === userDefinition.email.toLowerCase());
  if (existing) {
    return existing;
  }

  const user = {
    id: userDefinition.id || crypto.randomUUID(),
    name: userDefinition.name,
    email: userDefinition.email.toLowerCase(),
    phone: userDefinition.phone || '',
    role: userDefinition.role,
    passwordHash: await hashPassword(userDefinition.password),
    referralCode: userDefinition.referralCode,
    referredByCode: null,
    profileCompletedRewarded: false,
    lastDailyLoginRewardAt: null,
    firstPurchaseCompletedAt: null,
    emailVerified: true,
    deviceId: userDefinition.deviceId || null,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  return user;
}

export async function runBootstrap() {
  await updateDb(async (db) => {
    await ensureUser(db, {
      id: 'admin-1',
      name: 'BYNDIO Admin',
      email: 'admin@byndio.local',
      phone: '9000000001',
      role: 'admin',
      password: 'Admin@123',
      referralCode: 'ADMIN50',
    });

    await ensureUser(db, {
      id: 'seller-hyd-1',
      name: 'Hyd Local Seller',
      email: 'seller-hyd@byndio.local',
      phone: '9000000002',
      role: 'seller',
      password: 'Seller@123',
      referralCode: 'HYDSELL50',
    });

    await ensureUser(db, {
      id: 'seller-mum-1',
      name: 'Mumbai Seller',
      email: 'seller-mum@byndio.local',
      phone: '9000000003',
      role: 'seller',
      password: 'Seller@123',
      referralCode: 'MUMSELL50',
    });

    await ensureUser(db, {
      id: 'seller-pune-1',
      name: 'Pune Seller',
      email: 'seller-pune@byndio.local',
      phone: '9000000004',
      role: 'seller',
      password: 'Seller@123',
      referralCode: 'PUNESELL50',
    });

    runAllCoreJobs(db);
  });
}
