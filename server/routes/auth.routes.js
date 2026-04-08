import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { createToken, hashPassword, requireAuth, sanitizeUser, verifyPassword } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import { getUserBalance, grantPoints } from '../rewards.js';
import { addAuditLog, addFraudFlag } from '../audit.js';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().min(6).max(20).optional(),
  role: z.enum(['buyer', 'seller']).default('buyer'),
  referralCode: z.string().trim().toUpperCase().optional(),
  deviceId: z.string().trim().min(2).max(200).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const router = Router();

function makeReferralCode(db, seedName) {
  const seed = seedName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'BYN';
  const existing = new Set(db.users.map((user) => user.referralCode));

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const code = `${seed}${suffix}`.slice(0, 10);
    if (!existing.has(code)) {
      return code;
    }
  }

  return `BYN${Date.now().toString().slice(-6)}`;
}

function grantReferralSignupRewards(db, referral) {
  if (referral.signupRewardedAt) {
    return;
  }

  referral.signupRewardedAt = new Date().toISOString();
  referral.status = 'active';

  grantPoints(db, {
    userId: referral.referrerUserId,
    points: 50,
    type: 'referral_signup_referrer',
    source: referral.referredUserId,
  });
  grantPoints(db, {
    userId: referral.referredUserId,
    points: 50,
    type: 'referral_signup_referred',
    source: referral.referrerUserId,
  });
}

router.post('/register', async (req, res) => {
  try {
    const input = parseBody(registerSchema, req.body);
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';

    const result = await updateDb(async (db) => {
      const existingEmail = db.users.find(
        (user) => user.email.toLowerCase() === input.email.toLowerCase(),
      );
      if (existingEmail) {
        const error = new Error('Email already registered.');
        error.statusCode = 409;
        throw error;
      }

      if (input.deviceId && input.referralCode) {
        const deviceAlreadyUsed = db.users.some((user) => user.deviceId === input.deviceId);
        if (deviceAlreadyUsed) {
          addFraudFlag(db, {
            type: 'same_device_referral_attempt',
            severity: 'high',
            reason: 'Referral blocked because same device attempted multiple referral signups.',
            metadata: {
              deviceId: input.deviceId,
              ip,
            },
          });
          const error = new Error('Referral blocked: same device cannot create multiple referral accounts.');
          error.statusCode = 400;
          throw error;
        }
      }

      const recentIpReferrals = db.referrals.filter((referral) => {
        const ageMs = Date.now() - new Date(referral.createdAt).getTime();
        return referral.registeredIp === ip && ageMs < 24 * 60 * 60 * 1000;
      });
      if (input.referralCode && recentIpReferrals.length >= 3) {
        addFraudFlag(db, {
          type: 'high_referral_velocity_ip',
          severity: 'high',
          reason: 'Referral blocked due to high referral velocity from same IP in 24h.',
          metadata: {
            ip,
            referralsIn24h: recentIpReferrals.length,
          },
        });
        const error = new Error('Referral blocked: too many signups from the same IP in 24h.');
        error.statusCode = 429;
        throw error;
      }

      const passwordHash = await hashPassword(input.password);
      const user = {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        email: input.email.toLowerCase(),
        phone: input.phone || '',
        role: input.role,
        passwordHash,
        referralCode: makeReferralCode(db, input.name),
        referredByCode: null,
        profileCompletedRewarded: false,
        lastDailyLoginRewardAt: null,
        firstPurchaseCompletedAt: null,
        emailVerified: false,
        deviceId: input.deviceId || null,
        createdAt: new Date().toISOString(),
      };

      db.users.push(user);
      grantPoints(db, {
        userId: user.id,
        points: 50,
        type: 'signup_bonus',
        source: 'register',
      });

      if (input.referralCode) {
        const referrer = db.users.find((candidate) => candidate.referralCode === input.referralCode);
        if (!referrer) {
          const error = new Error('Invalid referral code.');
          error.statusCode = 400;
          throw error;
        }

        if (referrer.id === user.id) {
          const error = new Error('Self-referral is not allowed.');
          error.statusCode = 400;
          throw error;
        }

        const duplicateReferral = db.referrals.find((referral) => referral.referredUserId === user.id);
        if (!duplicateReferral) {
          const referral = {
            id: crypto.randomUUID(),
            referralCode: input.referralCode,
            referrerUserId: referrer.id,
            referredUserId: user.id,
            registeredIp: String(ip),
            createdAt: new Date().toISOString(),
            signupRewardedAt: null,
            firstPurchaseRewardedAt: null,
            status: 'pending_email_verification',
          };
          db.referrals.push(referral);

          user.referredByCode = input.referralCode;

          if (recentIpReferrals.length >= 2) {
            addFraudFlag(db, {
              userId: referrer.id,
              referralId: referral.id,
              type: 'referral_velocity_warning',
              severity: 'medium',
              reason: 'Multiple referred signups from same IP in short period.',
              metadata: {
                ip,
                referralsIn24h: recentIpReferrals.length + 1,
              },
            });
          }

          if (user.emailVerified) {
            grantReferralSignupRewards(db, referral);
          }
        }
      }

      addAuditLog(db, {
        actorUserId: user.id,
        action: 'user_registered',
        entityType: 'user',
        entityId: user.id,
        metadata: {
          role: user.role,
          hasReferral: Boolean(input.referralCode),
          emailVerified: user.emailVerified,
        },
      });

      const token = createToken(user);
      return {
        token,
        user: sanitizeUser(user),
        wallet: {
          points: getUserBalance(db, user.id),
        },
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const input = parseBody(loginSchema, req.body);
    const db = await readDb();
    const user = db.users.find((candidate) => candidate.email.toLowerCase() === input.email.toLowerCase());

    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const validPassword = await verifyPassword(input.password, user.passwordHash);
    if (!validPassword) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    return res.json({
      token: createToken(user),
      user: sanitizeUser(user),
      wallet: {
        points: getUserBalance(db, user.id),
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const db = await readDb();
    const user = db.users.find((candidate) => candidate.id === req.auth.sub);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return res.json({
      user: sanitizeUser(user),
      wallet: { points: getUserBalance(db, user.id) },
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/verify-email', requireAuth, async (req, res) => {
  try {
    const result = await updateDb(async (db) => {
      const user = db.users.find((candidate) => candidate.id === req.auth.sub);
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }
      user.emailVerified = true;

      const pendingReferrals = db.referrals.filter(
        (referral) =>
          referral.referredUserId === user.id &&
          !referral.signupRewardedAt &&
          referral.status === 'pending_email_verification',
      );
      for (const referral of pendingReferrals) {
        grantReferralSignupRewards(db, referral);
      }

      addAuditLog(db, {
        actorUserId: user.id,
        action: 'email_verified',
        entityType: 'user',
        entityId: user.id,
      });

      return { user: sanitizeUser(user) };
    });

    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
