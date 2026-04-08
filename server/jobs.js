import crypto from 'node:crypto';
import { addFraudFlag } from './audit.js';

const POINTS_EXPIRY_DAYS = 30;

function toTimestamp(value) {
  const parsed = value ? new Date(value).getTime() : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function buildCreditLots(entries) {
  const lots = [];

  for (const entry of entries) {
    if (entry.points > 0) {
      lots.push({
        entryId: entry.id,
        remaining: entry.points,
        createdAt: entry.createdAt,
        type: entry.type,
      });
      continue;
    }

    if (entry.points < 0) {
      let toConsume = Math.abs(entry.points);
      for (const lot of lots) {
        if (toConsume <= 0) {
          break;
        }
        if (lot.remaining <= 0) {
          continue;
        }

        const consumed = Math.min(lot.remaining, toConsume);
        lot.remaining -= consumed;
        toConsume -= consumed;
      }
    }
  }

  return lots;
}

export function runPointsExpiryJob(db, { now = new Date() } = {}) {
  const byUser = new Map();
  for (const entry of db.rewardLedger || []) {
    if (!byUser.has(entry.userId)) {
      byUser.set(entry.userId, []);
    }
    byUser.get(entry.userId).push(entry);
  }

  const nowTs = now.getTime();
  const expiryMs = POINTS_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  let expiredUsers = 0;
  let expiredPoints = 0;

  for (const [userId, entries] of byUser.entries()) {
    entries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const lots = buildCreditLots(entries);

    const expirable = lots.filter((lot) => {
      const lotTs = toTimestamp(lot.createdAt);
      return lotTs !== null && nowTs - lotTs >= expiryMs && lot.remaining > 0;
    });

    const pointsToExpire = expirable.reduce((sum, lot) => sum + lot.remaining, 0);
    if (pointsToExpire <= 0) {
      continue;
    }

    db.rewardLedger.push({
      id: crypto.randomUUID(),
      userId,
      points: -pointsToExpire,
      type: 'points_expiry',
      source: 'scheduler_monthly',
      metadata: {
        expiredCreditIds: expirable.map((lot) => lot.entryId),
      },
      createdAt: now.toISOString(),
    });

    expiredUsers += 1;
    expiredPoints += pointsToExpire;
  }

  if (!db.jobs || typeof db.jobs !== 'object') {
    db.jobs = {};
  }
  db.jobs.lastPointsExpiryRunAt = now.toISOString();

  return {
    job: 'points_expiry',
    expiredUsers,
    expiredPoints,
  };
}

function computeWindowActive({ startAt, endAt }, nowTs) {
  const startTs = toTimestamp(startAt);
  const endTs = toTimestamp(endAt);

  const started = startTs === null || startTs <= nowTs;
  const notEnded = endTs === null || endTs >= nowTs;
  return started && notEnded;
}

export function runOfferActivationJob(db, { now = new Date() } = {}) {
  const nowTs = now.getTime();
  let changedCount = 0;

  for (const offer of db.offers || []) {
    const active = computeWindowActive(offer, nowTs);
    if (offer.active !== active) {
      offer.active = active;
      changedCount += 1;
    }
  }

  if (!db.jobs || typeof db.jobs !== 'object') {
    db.jobs = {};
  }
  db.jobs.lastOfferActivationRunAt = now.toISOString();

  return {
    job: 'offer_activation',
    updatedOffers: changedCount,
  };
}

export function runDropSchedulerJob(db, { now = new Date() } = {}) {
  const nowTs = now.getTime();
  let changedCount = 0;

  for (const drop of db.dropSchedules || []) {
    const active = computeWindowActive(
      {
        startAt: drop.startsAt,
        endAt: drop.endsAt,
      },
      nowTs,
    );

    if (drop.active !== active) {
      drop.active = active;
      changedCount += 1;
    }
  }

  if (!db.jobs || typeof db.jobs !== 'object') {
    db.jobs = {};
  }
  db.jobs.lastDropSchedulerRunAt = now.toISOString();

  return {
    job: 'drop_scheduler',
    updatedDrops: changedCount,
  };
}

export function runReferralFraudScanJob(db, { now = new Date() } = {}) {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const nowTs = now.getTime();
  let flagged = 0;

  const referralsByReferrer = new Map();
  for (const referral of db.referrals || []) {
    if (!referralsByReferrer.has(referral.referrerUserId)) {
      referralsByReferrer.set(referral.referrerUserId, []);
    }
    referralsByReferrer.get(referral.referrerUserId).push(referral);
  }

  for (const [referrerUserId, referrals] of referralsByReferrer.entries()) {
    const olderPending = referrals.filter((referral) => {
      const createdTs = toTimestamp(referral.createdAt);
      const firstPurchase = Boolean(referral.firstPurchaseRewardedAt);
      return createdTs !== null && nowTs - createdTs >= sevenDaysMs && !firstPurchase;
    });

    if (olderPending.length < 5) {
      continue;
    }

    addFraudFlag(db, {
      userId: referrerUserId,
      type: 'referral_no_purchase_pattern',
      severity: 'high',
      reason: 'High volume referrals without first purchase conversion after 7 days.',
      metadata: {
        referralsChecked: referrals.length,
        noPurchaseCount: olderPending.length,
      },
    });
    flagged += 1;
  }

  if (!db.jobs || typeof db.jobs !== 'object') {
    db.jobs = {};
  }
  db.jobs.lastReferralFraudScanAt = now.toISOString();

  return {
    job: 'referral_fraud_scan',
    flaggedReferrers: flagged,
  };
}

export function runAllCoreJobs(db, { now = new Date() } = {}) {
  return {
    pointsExpiry: runPointsExpiryJob(db, { now }),
    offerActivation: runOfferActivationJob(db, { now }),
    dropScheduler: runDropSchedulerJob(db, { now }),
    referralFraudScan: runReferralFraudScanJob(db, { now }),
  };
}
