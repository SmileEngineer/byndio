import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import {
  MIN_REDEEM_POINTS,
  calculatePointsRedemption,
  canGrantDailyLoginPoint,
  getUserBalance,
  grantPoints,
} from '../rewards.js';

const previewRedeemSchema = z.object({
  orderAmount: z.number().positive(),
  requestedPoints: z.number().int().positive().optional(),
});

const router = Router();

router.use(requireAuth);

router.get('/wallet', async (req, res) => {
  try {
    const db = await readDb();
    const user = db.users.find((candidate) => candidate.id === req.auth.sub);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const points = getUserBalance(db, user.id);
    const activity = db.rewardLedger
      .filter((entry) => entry.userId === user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const expiringSoon = activity
      .filter((entry) => entry.points > 0)
      .filter((entry) => {
        const ageDays = (Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return ageDays >= 20 && ageDays <= 30;
      })
      .reduce((sum, entry) => sum + entry.points, 0);

    return res.json({
      points,
      redeemableDiscountRs: Math.floor(points / 10),
      minRedeemPoints: MIN_REDEEM_POINTS,
      expiringSoonPoints: expiringSoon,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/history', async (req, res) => {
  try {
    const db = await readDb();
    const history = db.rewardLedger
      .filter((entry) => entry.userId === req.auth.sub)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ total: history.length, history });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/referral', async (req, res) => {
  try {
    const db = await readDb();
    const user = db.users.find((candidate) => candidate.id === req.auth.sub);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const referrals = db.referrals.filter((referral) => referral.referrerUserId === user.id);
    return res.json({
      referralCode: user.referralCode,
      totalInvites: referrals.length,
      firstPurchaseConverted: referrals.filter((referral) => Boolean(referral.firstPurchaseRewardedAt)).length,
      pendingEmailVerification: referrals.filter(
        (referral) => referral.status === 'pending_email_verification',
      ).length,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/daily-login', async (req, res) => {
  try {
    const result = await updateDb(async (db) => {
      const user = db.users.find((candidate) => candidate.id === req.auth.sub);
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      if (!canGrantDailyLoginPoint(user)) {
        const error = new Error('Daily login reward already claimed today.');
        error.statusCode = 400;
        throw error;
      }

      user.lastDailyLoginRewardAt = new Date().toISOString();
      const entry = grantPoints(db, {
        userId: user.id,
        points: 1,
        type: 'daily_login',
      });

      return {
        entry,
        points: getUserBalance(db, user.id),
      };
    });

    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/profile-complete', async (req, res) => {
  try {
    const result = await updateDb(async (db) => {
      const user = db.users.find((candidate) => candidate.id === req.auth.sub);
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      if (user.profileCompletedRewarded) {
        const error = new Error('Profile completion reward already claimed.');
        error.statusCode = 400;
        throw error;
      }

      user.profileCompletedRewarded = true;
      const entry = grantPoints(db, {
        userId: user.id,
        points: 5,
        type: 'profile_completion',
      });
      return {
        entry,
        points: getUserBalance(db, user.id),
      };
    });

    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/redeem-preview', async (req, res) => {
  try {
    const input = parseBody(previewRedeemSchema, req.body);
    const db = await readDb();
    const availablePoints = getUserBalance(db, req.auth.sub);
    const redemption = calculatePointsRedemption({
      availablePoints,
      orderAmount: input.orderAmount,
      requestedPoints: input.requestedPoints,
    });

    return res.json({
      availablePoints,
      ...redemption,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
