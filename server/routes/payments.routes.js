import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import { addAuditLog } from '../audit.js';

const createIntentSchema = z.object({
  amountRs: z.number().positive().max(200000),
  currency: z.literal('INR').default('INR'),
  method: z.enum(['UPI', 'CARD', 'NET_BANKING', 'WALLET']),
  context: z.string().trim().max(120).optional(),
});

const confirmIntentSchema = z.object({
  status: z.enum(['succeeded', 'failed']).default('succeeded'),
  providerRef: z.string().trim().max(120).optional(),
  failureReason: z.string().trim().max(180).optional(),
});

const router = Router();
router.use(requireAuth);

router.post('/intents', async (req, res) => {
  try {
    const input = parseBody(createIntentSchema, req.body);

    const result = await updateDb(async (db) => {
      const user = db.users.find((candidate) => candidate.id === req.auth.sub);
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      const intent = {
        id: crypto.randomUUID(),
        userId: user.id,
        amountRs: Math.round(input.amountRs),
        currency: input.currency,
        method: input.method,
        context: input.context || 'checkout',
        provider: 'mock_gateway',
        clientSecret: `cs_${crypto.randomBytes(12).toString('hex')}`,
        providerRef: null,
        status: 'created',
        failureReason: null,
        linkedOrderId: null,
        linkedTrainingSubscriptionId: null,
        createdAt: new Date().toISOString(),
        confirmedAt: null,
      };

      db.paymentIntents.push(intent);
      addAuditLog(db, {
        actorUserId: user.id,
        action: 'payment_intent_created',
        entityType: 'paymentIntent',
        entityId: intent.id,
        metadata: {
          method: intent.method,
          amountRs: intent.amountRs,
        },
      });

      return intent;
    });

    return res.status(201).json({ intent: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/intents/:intentId/confirm', async (req, res) => {
  try {
    const input = parseBody(confirmIntentSchema, req.body);

    const result = await updateDb(async (db) => {
      const intent = db.paymentIntents.find((entry) => entry.id === req.params.intentId);
      if (!intent || intent.userId !== req.auth.sub) {
        const error = new Error('Payment intent not found.');
        error.statusCode = 404;
        throw error;
      }

      if (intent.status === 'succeeded') {
        return intent;
      }

      if (intent.status === 'failed') {
        const error = new Error('This payment intent has already failed.');
        error.statusCode = 400;
        throw error;
      }

      intent.status = input.status;
      intent.providerRef = input.providerRef || `txn_${crypto.randomBytes(8).toString('hex')}`;
      intent.failureReason = input.status === 'failed' ? input.failureReason || 'Payment failed.' : null;
      intent.confirmedAt = new Date().toISOString();

      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'payment_intent_confirmed',
        entityType: 'paymentIntent',
        entityId: intent.id,
        metadata: {
          status: intent.status,
          providerRef: intent.providerRef,
        },
      });

      return intent;
    });

    return res.json({ intent: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/intents/mine', async (req, res) => {
  try {
    const db = await readDb();
    const intents = (db.paymentIntents || [])
      .filter((entry) => entry.userId === req.auth.sub)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      total: intents.length,
      intents,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/intents/:intentId', async (req, res) => {
  try {
    const db = await readDb();
    const intent = (db.paymentIntents || []).find((entry) => entry.id === req.params.intentId);
    if (!intent || intent.userId !== req.auth.sub) {
      const error = new Error('Payment intent not found.');
      error.statusCode = 404;
      throw error;
    }

    return res.json({ intent });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
