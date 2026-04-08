import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import { addAuditLog } from '../audit.js';

const subscribeSchema = z.object({
  courseId: z.string().min(3),
  months: z.number().int().min(1).max(12).default(1),
  paymentIntentId: z.string().min(3).optional(),
});

const router = Router();

router.get('/courses', async (_req, res) => {
  try {
    const db = await readDb();
    const courses = (db.trainingCourses || [])
      .filter((course) => course.active)
      .sort((a, b) => a.monthlyPriceRs - b.monthlyPriceRs);

    return res.json({
      total: courses.length,
      courses,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.use(requireAuth, requireRoles('seller', 'admin'));

router.get('/subscriptions/me', async (req, res) => {
  try {
    const db = await readDb();
    const subscriptions = (db.trainingSubscriptions || [])
      .filter((subscription) => subscription.userId === req.auth.sub)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      total: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/subscriptions', async (req, res) => {
  try {
    const input = parseBody(subscribeSchema, req.body);

    const result = await updateDb(async (db) => {
      const course = (db.trainingCourses || []).find(
        (entry) => entry.id === input.courseId && entry.active,
      );
      if (!course) {
        const error = new Error('Training course not found.');
        error.statusCode = 404;
        throw error;
      }

      const activeSubscription = (db.trainingSubscriptions || []).find(
        (entry) =>
          entry.userId === req.auth.sub &&
          entry.courseId === input.courseId &&
          entry.status === 'active' &&
          new Date(entry.endsAt).getTime() > Date.now(),
      );

      if (activeSubscription) {
        return activeSubscription;
      }

      const now = new Date();
      const endsAt = new Date(now);
      endsAt.setMonth(endsAt.getMonth() + input.months);
      const amountRs = course.monthlyPriceRs * input.months;

      let paymentIntent = null;
      if (amountRs > 0) {
        if (!input.paymentIntentId) {
          const error = new Error('paymentIntentId is required to activate a paid training subscription.');
          error.statusCode = 400;
          throw error;
        }

        paymentIntent = (db.paymentIntents || []).find((entry) => entry.id === input.paymentIntentId);
        if (!paymentIntent || paymentIntent.userId !== req.auth.sub) {
          const error = new Error('Payment intent not found for this user.');
          error.statusCode = 404;
          throw error;
        }
        if (paymentIntent.status !== 'succeeded') {
          const error = new Error('Payment intent must be succeeded before activating subscription.');
          error.statusCode = 400;
          throw error;
        }
        if (paymentIntent.amountRs < amountRs) {
          const error = new Error('Payment intent amount is lower than training subscription fee.');
          error.statusCode = 400;
          throw error;
        }
        if (paymentIntent.linkedOrderId) {
          const error = new Error('Payment intent already linked to an order and cannot be reused.');
          error.statusCode = 400;
          throw error;
        }
        if (paymentIntent.linkedTrainingSubscriptionId) {
          const error = new Error(
            'Payment intent already linked to another training subscription and cannot be reused.',
          );
          error.statusCode = 400;
          throw error;
        }
      }

      const subscription = {
        id: crypto.randomUUID(),
        userId: req.auth.sub,
        courseId: course.id,
        courseTitle: course.title,
        months: input.months,
        amountRs,
        status: 'active',
        paymentIntentId: paymentIntent ? paymentIntent.id : null,
        paymentStatus: amountRs > 0 ? 'paid' : 'free',
        createdAt: now.toISOString(),
        startsAt: now.toISOString(),
        endsAt: endsAt.toISOString(),
        cancelledAt: null,
      };

      if (paymentIntent) {
        paymentIntent.linkedTrainingSubscriptionId = subscription.id;
      }

      db.trainingSubscriptions.push(subscription);
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'training_subscription_created',
        entityType: 'trainingSubscription',
        entityId: subscription.id,
        metadata: {
          courseId: course.id,
          months: input.months,
          amountRs: subscription.amountRs,
          paymentIntentId: subscription.paymentIntentId,
        },
      });

      return subscription;
    });

    return res.status(201).json({ subscription: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/subscriptions/:subscriptionId/cancel', async (req, res) => {
  try {
    const result = await updateDb(async (db) => {
      const subscription = (db.trainingSubscriptions || []).find(
        (entry) => entry.id === req.params.subscriptionId,
      );

      if (!subscription || subscription.userId !== req.auth.sub) {
        const error = new Error('Subscription not found.');
        error.statusCode = 404;
        throw error;
      }

      if (subscription.status === 'cancelled') {
        return subscription;
      }

      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date().toISOString();

      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'training_subscription_cancelled',
        entityType: 'trainingSubscription',
        entityId: subscription.id,
      });

      return subscription;
    });

    return res.json({ subscription: result });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
