import crypto from 'node:crypto';

export const MIN_REDEEM_POINTS = 100;
export const POINTS_TO_RUPEE_DIVISOR = 10;
export const MAX_REDEEM_PERCENT = 0.15;

export function getUserBalance(db, userId) {
  return db.rewardLedger
    .filter((entry) => entry.userId === userId)
    .reduce((sum, entry) => sum + entry.points, 0);
}

export function grantPoints(db, { userId, points, type, source = null, metadata = {} }) {
  if (!points) {
    return null;
  }

  const entry = {
    id: crypto.randomUUID(),
    userId,
    points,
    type,
    source,
    metadata,
    createdAt: new Date().toISOString(),
  };

  db.rewardLedger.push(entry);
  return entry;
}

export function canGrantDailyLoginPoint(user) {
  if (!user.lastDailyLoginRewardAt) {
    return true;
  }

  const lastDate = new Date(user.lastDailyLoginRewardAt).toDateString();
  const today = new Date().toDateString();
  return lastDate !== today;
}

export function calculatePointsRedemption({ availablePoints, orderAmount, requestedPoints = null }) {
  const maxDiscountRupees = Math.floor(orderAmount * MAX_REDEEM_PERCENT);
  const maxPointsByOrder = maxDiscountRupees * POINTS_TO_RUPEE_DIVISOR;
  const redeemableCap = Math.min(availablePoints, maxPointsByOrder);

  if (redeemableCap < MIN_REDEEM_POINTS) {
    return {
      pointsApplied: 0,
      discountRupees: 0,
      reason: 'Minimum 100 points required to redeem.',
    };
  }

  const normalizedRequest = requestedPoints
    ? Math.max(MIN_REDEEM_POINTS, Math.floor(requestedPoints))
    : redeemableCap;

  const pointsApplied = Math.min(normalizedRequest, redeemableCap);
  const discountRupees = Math.floor(pointsApplied / POINTS_TO_RUPEE_DIVISOR);

  return {
    pointsApplied,
    discountRupees,
    reason: null,
  };
}

export function calculatePointsEarnedFromPurchase(orderAmount) {
  return Math.floor(orderAmount / 50);
}
