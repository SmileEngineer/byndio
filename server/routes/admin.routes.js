import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import { addAuditLog } from '../audit.js';
import {
  runAllCoreJobs,
  runDropSchedulerJob,
  runOfferActivationJob,
  runPointsExpiryJob,
  runReferralFraudScanJob,
} from '../jobs.js';

const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  parentId: z.string().trim().nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(100),
});

const updateCategorySchema = categorySchema.partial();

const offerSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(3).max(400),
  kind: z.enum(['banner', 'category', 'coupon', 'popup']),
  active: z.boolean().default(true),
  startAt: z.string().datetime().nullable().optional(),
  endAt: z.string().datetime().nullable().optional(),
  appliesToTags: z.array(z.string().trim().min(1).max(50)).default([]),
});

const updateOfferSchema = offerSchema.partial();

const dropSchema = z.object({
  title: z.string().trim().min(3).max(120),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  productIds: z.array(z.string().min(3)).min(1),
  active: z.boolean().default(true),
});

const updateDropSchema = dropSchema.partial();

const resolveFraudFlagSchema = z.object({
  note: z.string().trim().max(500).optional(),
});

const runJobSchema = z.object({
  job: z.enum(['points_expiry', 'offer_activation', 'drop_scheduler', 'referral_fraud_scan', 'all']),
});

const router = Router();
router.use(requireAuth, requireRoles('admin'));

function sortCategories(categories) {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

router.get('/categories', async (_req, res) => {
  try {
    const db = await readDb();
    return res.json({
      total: (db.categories || []).length,
      categories: sortCategories(db.categories || []),
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/categories', async (req, res) => {
  try {
    const input = parseBody(categorySchema, req.body);

    const result = await updateDb(async (db) => {
      const duplicate = (db.categories || []).find(
        (entry) => entry.slug.toLowerCase() === input.slug.toLowerCase(),
      );
      if (duplicate) {
        const error = new Error('Category slug already exists.');
        error.statusCode = 409;
        throw error;
      }

      const category = {
        id: `cat-${input.slug}-${Date.now().toString().slice(-6)}`,
        ...input,
      };
      db.categories.push(category);

      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'admin_category_created',
        entityType: 'category',
        entityId: category.id,
      });

      return category;
    });

    return res.status(201).json({ category: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.patch('/categories/:categoryId', async (req, res) => {
  try {
    const input = parseBody(updateCategorySchema, req.body);

    const result = await updateDb(async (db) => {
      const category = (db.categories || []).find((entry) => entry.id === req.params.categoryId);
      if (!category) {
        const error = new Error('Category not found.');
        error.statusCode = 404;
        throw error;
      }

      Object.assign(category, input);
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'admin_category_updated',
        entityType: 'category',
        entityId: category.id,
      });
      return category;
    });

    return res.json({ category: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.delete('/categories/:categoryId', async (req, res) => {
  try {
    const result = await updateDb(async (db) => {
      const category = (db.categories || []).find((entry) => entry.id === req.params.categoryId);
      if (!category) {
        const error = new Error('Category not found.');
        error.statusCode = 404;
        throw error;
      }

      category.active = false;
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'admin_category_deactivated',
        entityType: 'category',
        entityId: category.id,
      });
      return category;
    });

    return res.json({ category: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/offers', async (_req, res) => {
  try {
    const db = await readDb();
    const offers = [...(db.offers || [])].sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0));
    return res.json({
      total: offers.length,
      offers,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/offers', async (req, res) => {
  try {
    const input = parseBody(offerSchema, req.body);

    const result = await updateDb(async (db) => {
      const offer = {
        id: `offer-${Date.now().toString().slice(-8)}-${crypto.randomBytes(2).toString('hex')}`,
        ...input,
        createdAt: new Date().toISOString(),
      };
      db.offers.push(offer);
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'admin_offer_created',
        entityType: 'offer',
        entityId: offer.id,
      });
      return offer;
    });

    return res.status(201).json({ offer: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.patch('/offers/:offerId', async (req, res) => {
  try {
    const input = parseBody(updateOfferSchema, req.body);

    const result = await updateDb(async (db) => {
      const offer = (db.offers || []).find((entry) => entry.id === req.params.offerId);
      if (!offer) {
        const error = new Error('Offer not found.');
        error.statusCode = 404;
        throw error;
      }

      Object.assign(offer, input);
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'admin_offer_updated',
        entityType: 'offer',
        entityId: offer.id,
      });
      return offer;
    });

    return res.json({ offer: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.delete('/offers/:offerId', async (req, res) => {
  try {
    const result = await updateDb(async (db) => {
      const offer = (db.offers || []).find((entry) => entry.id === req.params.offerId);
      if (!offer) {
        const error = new Error('Offer not found.');
        error.statusCode = 404;
        throw error;
      }

      offer.active = false;
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'admin_offer_deactivated',
        entityType: 'offer',
        entityId: offer.id,
      });
      return offer;
    });

    return res.json({ offer: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/drop-schedules', async (_req, res) => {
  try {
    const db = await readDb();
    const dropSchedules = [...(db.dropSchedules || [])].sort(
      (a, b) => new Date(a.startsAt) - new Date(b.startsAt),
    );
    return res.json({
      total: dropSchedules.length,
      dropSchedules,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/drop-schedules', async (req, res) => {
  try {
    const input = parseBody(dropSchema, req.body);

    const result = await updateDb(async (db) => {
      const productsById = new Set((db.products || []).map((product) => product.id));
      const invalidProduct = input.productIds.find((productId) => !productsById.has(productId));
      if (invalidProduct) {
        const error = new Error(`Invalid product id in drop schedule: ${invalidProduct}`);
        error.statusCode = 400;
        throw error;
      }

      const schedule = {
        id: `drop-${Date.now().toString().slice(-8)}`,
        ...input,
        createdAt: new Date().toISOString(),
      };
      db.dropSchedules.push(schedule);
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'admin_drop_schedule_created',
        entityType: 'dropSchedule',
        entityId: schedule.id,
      });
      return schedule;
    });

    return res.status(201).json({ dropSchedule: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.patch('/drop-schedules/:dropId', async (req, res) => {
  try {
    const input = parseBody(updateDropSchema, req.body);

    const result = await updateDb(async (db) => {
      const schedule = (db.dropSchedules || []).find((entry) => entry.id === req.params.dropId);
      if (!schedule) {
        const error = new Error('Drop schedule not found.');
        error.statusCode = 404;
        throw error;
      }

      if (input.productIds) {
        const productsById = new Set((db.products || []).map((product) => product.id));
        const invalidProduct = input.productIds.find((productId) => !productsById.has(productId));
        if (invalidProduct) {
          const error = new Error(`Invalid product id in drop schedule: ${invalidProduct}`);
          error.statusCode = 400;
          throw error;
        }
      }

      Object.assign(schedule, input);
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'admin_drop_schedule_updated',
        entityType: 'dropSchedule',
        entityId: schedule.id,
      });
      return schedule;
    });

    return res.json({ dropSchedule: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.delete('/drop-schedules/:dropId', async (req, res) => {
  try {
    const result = await updateDb(async (db) => {
      const schedule = (db.dropSchedules || []).find((entry) => entry.id === req.params.dropId);
      if (!schedule) {
        const error = new Error('Drop schedule not found.');
        error.statusCode = 404;
        throw error;
      }

      schedule.active = false;
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'admin_drop_schedule_deactivated',
        entityType: 'dropSchedule',
        entityId: schedule.id,
      });
      return schedule;
    });

    return res.json({ dropSchedule: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/audit-logs', async (req, res) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit || 100)));
    const db = await readDb();
    const logs = [...(db.auditLogs || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
    return res.json({
      total: logs.length,
      logs,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/fraud-flags', async (req, res) => {
  try {
    const unresolvedOnly = String(req.query.unresolvedOnly || 'true').toLowerCase() !== 'false';
    const db = await readDb();
    let flags = [...(db.fraudFlags || [])];
    if (unresolvedOnly) {
      flags = flags.filter((flag) => !flag.resolvedAt);
    }
    flags.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      total: flags.length,
      flags,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/fraud-flags/:flagId/resolve', async (req, res) => {
  try {
    const input = parseBody(resolveFraudFlagSchema, req.body);

    const result = await updateDb(async (db) => {
      const flag = (db.fraudFlags || []).find((entry) => entry.id === req.params.flagId);
      if (!flag) {
        const error = new Error('Fraud flag not found.');
        error.statusCode = 404;
        throw error;
      }

      flag.resolvedAt = new Date().toISOString();
      flag.resolvedByUserId = req.auth.sub;
      flag.resolutionNote = input.note || 'Resolved by admin.';
      return flag;
    });

    return res.json({ flag: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/jobs/run', async (req, res) => {
  try {
    const input = parseBody(runJobSchema, req.body);

    const result = await updateDb(async (db) => {
      let report;
      if (input.job === 'all') {
        report = runAllCoreJobs(db);
      } else if (input.job === 'points_expiry') {
        report = runPointsExpiryJob(db);
      } else if (input.job === 'offer_activation') {
        report = runOfferActivationJob(db);
      } else if (input.job === 'drop_scheduler') {
        report = runDropSchedulerJob(db);
      } else {
        report = runReferralFraudScanJob(db);
      }

      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'admin_job_run',
        entityType: 'job',
        entityId: input.job,
        metadata: {
          report,
        },
      });

      return report;
    });

    return res.json({
      job: input.job,
      report: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/jobs/status', async (_req, res) => {
  try {
    const db = await readDb();
    return res.json({
      jobs: db.jobs || {},
    });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
