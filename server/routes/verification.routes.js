import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import { addAuditLog } from '../audit.js';
import { getUserBalance, grantPoints } from '../rewards.js';

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

const requestOtpSchema = z.object({
  channel: z.enum(['email', 'phone']),
  target: z.string().trim().min(3).max(200).optional(),
  purpose: z
    .enum(['signup', 'login', 'checkout', 'seller_onboarding', 'email_verification'])
    .default('email_verification'),
});

const verifyOtpSchema = z.object({
  challengeId: z.string().min(3),
  code: z.string().trim().length(6),
});

const router = Router();

function hashOtp(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function finalizePendingReferralRewards(db, user) {
  const pendingReferrals = (db.referrals || []).filter(
    (referral) =>
      referral.referredUserId === user.id &&
      !referral.signupRewardedAt &&
      referral.status === 'pending_email_verification',
  );

  for (const referral of pendingReferrals) {
    referral.signupRewardedAt = new Date().toISOString();
    referral.status = 'active';

    grantPoints(db, {
      userId: referral.referrerUserId,
      points: 50,
      type: 'referral_signup_referrer',
      source: user.id,
    });
    grantPoints(db, {
      userId: user.id,
      points: 50,
      type: 'referral_signup_referred',
      source: referral.referrerUserId,
    });
  }
}

router.post('/otp/request', requireAuth, async (req, res) => {
  try {
    const input = parseBody(requestOtpSchema, req.body);

    const result = await updateDb(async (db) => {
      const user = db.users.find((candidate) => candidate.id === req.auth.sub);
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();
      const target = input.target || (input.channel === 'email' ? user.email : user.phone);

      if (!target) {
        const error = new Error('Target is required for OTP challenge.');
        error.statusCode = 400;
        throw error;
      }

      const challenge = {
        id: crypto.randomUUID(),
        userId: user.id,
        channel: input.channel,
        target,
        purpose: input.purpose,
        codeHash: hashOtp(code),
        maxAttempts: OTP_MAX_ATTEMPTS,
        attempts: 0,
        verifiedAt: null,
        createdAt: new Date().toISOString(),
        expiresAt,
      };

      db.otpChallenges.push(challenge);
      addAuditLog(db, {
        actorUserId: user.id,
        action: 'otp_challenge_requested',
        entityType: 'otpChallenge',
        entityId: challenge.id,
        metadata: {
          channel: challenge.channel,
          purpose: challenge.purpose,
        },
      });

      return {
        challengeId: challenge.id,
        channel: challenge.channel,
        target: challenge.target,
        expiresAt: challenge.expiresAt,
        debugCode: process.env.NODE_ENV === 'production' ? undefined : code,
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/otp/verify', requireAuth, async (req, res) => {
  try {
    const input = parseBody(verifyOtpSchema, req.body);

    const result = await updateDb(async (db) => {
      const user = db.users.find((candidate) => candidate.id === req.auth.sub);
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      const challenge = db.otpChallenges.find((entry) => entry.id === input.challengeId);
      if (!challenge || challenge.userId !== user.id) {
        const error = new Error('OTP challenge not found.');
        error.statusCode = 404;
        throw error;
      }

      if (challenge.verifiedAt) {
        return {
          challengeId: challenge.id,
          verifiedAt: challenge.verifiedAt,
          walletPoints: getUserBalance(db, user.id),
        };
      }

      if (new Date(challenge.expiresAt).getTime() < Date.now()) {
        const error = new Error('OTP challenge expired.');
        error.statusCode = 400;
        throw error;
      }

      if (challenge.attempts >= challenge.maxAttempts) {
        const error = new Error('OTP attempts exceeded.');
        error.statusCode = 429;
        throw error;
      }

      challenge.attempts += 1;
      const codeHash = hashOtp(input.code);
      if (codeHash !== challenge.codeHash) {
        const error = new Error('Invalid OTP code.');
        error.statusCode = 400;
        throw error;
      }

      challenge.verifiedAt = new Date().toISOString();

      if (challenge.channel === 'email' || challenge.purpose === 'email_verification') {
        user.emailVerified = true;
        finalizePendingReferralRewards(db, user);
      }

      addAuditLog(db, {
        actorUserId: user.id,
        action: 'otp_challenge_verified',
        entityType: 'otpChallenge',
        entityId: challenge.id,
        metadata: {
          purpose: challenge.purpose,
        },
      });

      return {
        challengeId: challenge.id,
        verifiedAt: challenge.verifiedAt,
        emailVerified: user.emailVerified,
        walletPoints: getUserBalance(db, user.id),
      };
    });

    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/otp/history', requireAuth, async (req, res) => {
  try {
    const db = await readDb();
    const challenges = (db.otpChallenges || [])
      .filter((entry) => entry.userId === req.auth.sub)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      total: challenges.length,
      challenges: challenges.map((challenge) => ({
        id: challenge.id,
        channel: challenge.channel,
        target: challenge.target,
        purpose: challenge.purpose,
        attempts: challenge.attempts,
        maxAttempts: challenge.maxAttempts,
        createdAt: challenge.createdAt,
        expiresAt: challenge.expiresAt,
        verifiedAt: challenge.verifiedAt,
      })),
    });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
