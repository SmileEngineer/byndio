import crypto from 'node:crypto';
import { createInitialState } from './initialState.js';

export const LATEST_DB_VERSION = 2;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureArray(db, key, fallback = []) {
  if (!Array.isArray(db[key])) {
    db[key] = clone(fallback);
    return true;
  }

  return false;
}

function ensureObject(db, key, fallback = {}) {
  if (!db[key] || typeof db[key] !== 'object' || Array.isArray(db[key])) {
    db[key] = clone(fallback);
    return true;
  }

  return false;
}

function normalizeCode(seed) {
  const text = String(seed || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  return text || 'BYN';
}

function inferSubcategory(product) {
  if (product.subcategory) {
    return product.subcategory;
  }

  const name = String(product.name || '').toLowerCase();
  const category = String(product.category || '').toLowerCase();

  if (category === 'fashion') {
    if (name.includes('saree')) {
      return 'Sarees';
    }
    if (name.includes('hoodie')) {
      return 'Hoodies';
    }
    return 'Fashion';
  }

  if (category === 'electronics') {
    if (name.includes('watch')) {
      return 'Wearables';
    }
    if (name.includes('earbud') || name.includes('speaker') || name.includes('audio')) {
      return 'Audio';
    }
    return 'Accessories';
  }

  if (category === 'home') {
    return 'Home Essentials';
  }

  if (category === 'grocery') {
    return 'Pantry';
  }

  return 'General';
}

function ensureUniqueReferralCode(existingCodes, seed) {
  const base = normalizeCode(seed).slice(0, 6);
  let code = base;

  if (!existingCodes.has(code)) {
    existingCodes.add(code);
    return code;
  }

  for (let index = 0; index < 50; index += 1) {
    const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    code = `${base}${suffix}`.slice(0, 10);
    if (!existingCodes.has(code)) {
      existingCodes.add(code);
      return code;
    }
  }

  code = `BYN${Date.now().toString().slice(-6)}`;
  existingCodes.add(code);
  return code;
}

function ensureJobsShape(db) {
  const changed = ensureObject(db, 'jobs', {
    lastPointsExpiryRunAt: null,
    lastOfferActivationRunAt: null,
    lastDropSchedulerRunAt: null,
    lastReferralFraudScanAt: null,
  });

  if (db.jobs.lastPointsExpiryRunAt === undefined) {
    db.jobs.lastPointsExpiryRunAt = null;
    return true;
  }

  if (db.jobs.lastOfferActivationRunAt === undefined) {
    db.jobs.lastOfferActivationRunAt = null;
    return true;
  }

  if (db.jobs.lastDropSchedulerRunAt === undefined) {
    db.jobs.lastDropSchedulerRunAt = null;
    return true;
  }

  if (db.jobs.lastReferralFraudScanAt === undefined) {
    db.jobs.lastReferralFraudScanAt = null;
    return true;
  }

  return changed;
}

export function migrateDb(rawDb) {
  const db = rawDb && typeof rawDb === 'object' ? rawDb : {};
  const initial = createInitialState();
  let changed = false;

  if (!db.meta || typeof db.meta !== 'object') {
    db.meta = {
      version: 1,
      createdAt: new Date().toISOString(),
    };
    changed = true;
  }

  changed = ensureArray(db, 'users', []) || changed;
  changed = ensureArray(db, 'products', clone(initial.products)) || changed;
  changed = ensureArray(db, 'categories', clone(initial.categories)) || changed;
  changed = ensureArray(db, 'offers', clone(initial.offers)) || changed;
  changed = ensureArray(db, 'dropSchedules', clone(initial.dropSchedules)) || changed;
  changed = ensureArray(db, 'trainingCourses', clone(initial.trainingCourses)) || changed;
  changed = ensureArray(db, 'trainingSubscriptions', []) || changed;
  changed = ensureArray(db, 'supportTickets', []) || changed;
  changed = ensureArray(db, 'otpChallenges', []) || changed;
  changed = ensureArray(db, 'paymentIntents', []) || changed;
  changed = ensureArray(db, 'sellerOnboarding', []) || changed;
  changed = ensureArray(db, 'sellerDocuments', []) || changed;
  changed = ensureArray(db, 'rewardLedger', []) || changed;
  changed = ensureArray(db, 'referrals', []) || changed;
  changed = ensureArray(db, 'fraudFlags', []) || changed;
  changed = ensureArray(db, 'auditLogs', []) || changed;
  changed = ensureArray(db, 'orders', []) || changed;
  changed = ensureArray(db, 'rtoCharges', []) || changed;
  changed = ensureArray(db, 'returnRequests', []) || changed;
  changed = ensureArray(db, 'refunds', []) || changed;
  changed = ensureJobsShape(db) || changed;

  const referralCodes = new Set();
  for (const user of db.users) {
    if (!user || typeof user !== 'object') {
      continue;
    }

    if (typeof user.email === 'string') {
      const normalized = user.email.toLowerCase();
      if (user.email !== normalized) {
        user.email = normalized;
        changed = true;
      }
    }

    if (!user.referralCode) {
      user.referralCode = ensureUniqueReferralCode(referralCodes, `${user.name || ''}${user.id || ''}`);
      changed = true;
    } else {
      const normalized = normalizeCode(user.referralCode).slice(0, 10);
      if (user.referralCode !== normalized) {
        user.referralCode = normalized;
        changed = true;
      }
      if (referralCodes.has(user.referralCode)) {
        user.referralCode = ensureUniqueReferralCode(referralCodes, `${user.name || ''}${user.id || ''}`);
        changed = true;
      } else {
        referralCodes.add(user.referralCode);
      }
    }

    if (user.emailVerified === undefined || user.emailVerified === null) {
      user.emailVerified = false;
      changed = true;
    }

    if (user.profileCompletedRewarded === undefined) {
      user.profileCompletedRewarded = false;
      changed = true;
    }

    if (user.lastDailyLoginRewardAt === undefined) {
      user.lastDailyLoginRewardAt = null;
      changed = true;
    }

    if (user.firstPurchaseCompletedAt === undefined) {
      user.firstPurchaseCompletedAt = null;
      changed = true;
    }

    if (user.deviceId === undefined) {
      user.deviceId = null;
      changed = true;
    }

    if (user.googleSub === undefined) {
      user.googleSub = null;
      changed = true;
    }
  }

  for (const product of db.products) {
    if (!product || typeof product !== 'object') {
      continue;
    }

    if (!product.subcategory) {
      product.subcategory = inferSubcategory(product);
      changed = true;
    }

    if (product.nonReturnable === undefined) {
      product.nonReturnable = false;
      changed = true;
    }
  }

  for (const referral of db.referrals) {
    if (!referral || typeof referral !== 'object') {
      continue;
    }

    if (referral.status === undefined) {
      referral.status = referral.signupRewardedAt ? 'active' : 'pending_email_verification';
      changed = true;
    }
  }

  for (const onboarding of db.sellerOnboarding || []) {
    if (!onboarding || typeof onboarding !== 'object') {
      continue;
    }

    if (onboarding.withoutGstDeclarationAccepted === undefined) {
      onboarding.withoutGstDeclarationAccepted = Boolean(onboarding.legalDeclarationAccepted);
      changed = true;
    }
  }

  for (const intent of db.paymentIntents || []) {
    if (!intent || typeof intent !== 'object') {
      continue;
    }

    if (intent.linkedTrainingSubscriptionId === undefined) {
      intent.linkedTrainingSubscriptionId = null;
      changed = true;
    }
  }

  if (db.meta.version !== LATEST_DB_VERSION) {
    db.meta.version = LATEST_DB_VERSION;
    db.meta.migratedAt = new Date().toISOString();
    changed = true;
  }

  return {
    db,
    changed,
  };
}
