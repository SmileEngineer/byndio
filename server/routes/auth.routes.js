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
  confirmPassword: z.string().min(8).max(128),
  phone: z.string().min(6).max(20),
  role: z.enum(['buyer', 'seller']).default('buyer'),
  referralCode: z.string().trim().toUpperCase().optional(),
  deviceId: z.string().trim().min(2).max(200).optional(),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['confirmPassword'],
      message: 'Confirm password must match password.',
    });
  }
});

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(120).optional(),
  email: z.string().trim().min(3).max(120).optional(),
  password: z.string().min(1),
});

const googleAuthSchema = z.object({
  idToken: z.string().trim().min(20),
  role: z.enum(['buyer', 'seller']).default('buyer'),
});

const router = Router();
const GOOGLE_CLIENT_ID = String(process.env.GOOGLE_CLIENT_ID || '').trim();

function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function resolveLoginIdentifier(input) {
  return String(input.identifier || input.email || '').trim();
}

function findUserByIdentifier(db, identifier) {
  const normalizedIdentifier = String(identifier || '').trim();
  if (!normalizedIdentifier) {
    return null;
  }

  if (normalizedIdentifier.includes('@')) {
    return db.users.find(
      (candidate) => candidate.email.toLowerCase() === normalizedIdentifier.toLowerCase(),
    );
  }

  const phone = normalizePhone(normalizedIdentifier);
  if (!phone) {
    return null;
  }

  return db.users.find((candidate) => normalizePhone(candidate.phone) === phone);
}

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

async function verifyGoogleIdToken(idToken) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
      {
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const error = new Error('Invalid Google token.');
      error.statusCode = 401;
      throw error;
    }

    const payload = await response.json();
    const aud = String(payload.aud || '');
    const email = String(payload.email || '').toLowerCase();
    const emailVerified = String(payload.email_verified || '').toLowerCase() === 'true';

    if (!aud || aud !== GOOGLE_CLIENT_ID) {
      const error = new Error('Google token audience mismatch.');
      error.statusCode = 401;
      throw error;
    }

    if (!email || !emailVerified) {
      const error = new Error('Google account email is not verified.');
      error.statusCode = 401;
      throw error;
    }

    return {
      email,
      name: String(payload.name || '').trim() || 'Google User',
      sub: String(payload.sub || ''),
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Google token verification timed out.');
      timeoutError.statusCode = 504;
      throw timeoutError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
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

      const normalizedPhone = normalizePhone(input.phone);
      if (normalizedPhone) {
        const existingPhone = db.users.find(
          (user) => normalizePhone(user.phone) === normalizedPhone,
        );
        if (existingPhone) {
          const error = new Error('Phone number already registered.');
          error.statusCode = 409;
          throw error;
        }
      }

      if (input.deviceId) {
        const existingDeviceUser = db.users.find((user) => user.deviceId === input.deviceId);
        if (existingDeviceUser) {
          addFraudFlag(db, {
            userId: existingDeviceUser.id,
            type: 'same_device_multi_account_attempt',
            severity: 'high',
            reason: 'Registration blocked because same device attempted multiple accounts.',
            metadata: {
              deviceId: input.deviceId,
              ip,
              attemptedEmail: input.email.toLowerCase(),
            },
          });
          const error = new Error('Registration blocked: same device cannot create multiple accounts.');
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
        phone: normalizedPhone || '',
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
    const identifier = resolveLoginIdentifier(input);
    if (!identifier) {
      const error = new Error('Email or phone is required.');
      error.statusCode = 400;
      throw error;
    }
    const db = await readDb();
    const user = findUserByIdentifier(db, identifier);

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

router.post('/google', async (req, res) => {
  try {
    if (!GOOGLE_CLIENT_ID) {
      const error = new Error('Google authentication is not configured on server.');
      error.statusCode = 500;
      throw error;
    }

    const input = parseBody(googleAuthSchema, req.body);
    const profile = await verifyGoogleIdToken(input.idToken);

    const result = await updateDb(async (db) => {
      let user = db.users.find(
        (candidate) => candidate.email.toLowerCase() === profile.email.toLowerCase(),
      );

      const isNewUser = !user;
      if (!user) {
        user = {
          id: crypto.randomUUID(),
          name: profile.name,
          email: profile.email,
          phone: '',
          role: input.role,
          passwordHash: await hashPassword(crypto.randomBytes(32).toString('hex')),
          referralCode: makeReferralCode(db, profile.name),
          referredByCode: null,
          profileCompletedRewarded: false,
          lastDailyLoginRewardAt: null,
          firstPurchaseCompletedAt: null,
          emailVerified: true,
          deviceId: null,
          googleSub: profile.sub || null,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);

        grantPoints(db, {
          userId: user.id,
          points: 50,
          type: 'signup_bonus',
          source: 'google_register',
        });
      } else {
        user.emailVerified = true;
        if (!user.googleSub && profile.sub) {
          user.googleSub = profile.sub;
        }
      }

      addAuditLog(db, {
        actorUserId: user.id,
        action: isNewUser ? 'user_registered_google' : 'user_login_google',
        entityType: 'user',
        entityId: user.id,
        metadata: {
          role: user.role,
          emailVerified: user.emailVerified,
        },
      });

      return {
        token: createToken(user),
        user: sanitizeUser(user),
        wallet: {
          points: getUserBalance(db, user.id),
        },
      };
    });

    return res.json(result);
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
