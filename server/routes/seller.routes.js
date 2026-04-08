import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import { addAuditLog } from '../audit.js';

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const draftOnboardingSchema = z.object({
  businessName: z.string().trim().min(2).max(160).optional(),
  ownerName: z.string().trim().min(2).max(120).optional(),
  hasGST: z.boolean().optional(),
  gstNumber: z.string().trim().max(30).optional(),
  sellAllIndia: z.boolean().optional(),
  state: z.string().trim().min(2).max(80).optional(),
  city: z.string().trim().min(2).max(80).optional(),
  pincode: z.string().trim().min(4).max(10).optional(),
  annualTurnoverLakh: z.number().nonnegative().max(10000).optional(),
  withoutGstDeclarationAccepted: z.boolean().optional(),
  legalDeclarationAccepted: z.boolean().optional(),
  responsibilitiesAccepted: z.boolean().optional(),
  supportChannel: z.enum(['chat', 'email', 'whatsapp']).optional(),
});

const submitOnboardingSchema = z.object({
  businessName: z.string().trim().min(2).max(160),
  ownerName: z.string().trim().min(2).max(120),
  hasGST: z.boolean(),
  gstNumber: z.string().trim().max(30).optional(),
  sellAllIndia: z.boolean().default(false),
  state: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  pincode: z.string().trim().min(4).max(10),
  annualTurnoverLakh: z.number().nonnegative().max(10000),
  withoutGstDeclarationAccepted: z.boolean().optional(),
  legalDeclarationAccepted: z.boolean(),
  responsibilitiesAccepted: z.boolean(),
  supportChannel: z.enum(['chat', 'email', 'whatsapp']),
});

const uploadDocumentSchema = z.object({
  type: z.enum(['gst_certificate', 'legal_declaration', 'packaging_verification', 'kyc', 'other']),
  imageUrl: z.string().url(),
  note: z.string().trim().max(300).optional(),
  linkedOrderId: z.string().trim().optional(),
});

const router = Router();
router.use(requireAuth, requireRoles('seller', 'admin'));

function validateSubmitPayload(input) {
  const withoutGstDeclarationAccepted = input.hasGST
    ? true
    : Boolean(input.withoutGstDeclarationAccepted ?? input.legalDeclarationAccepted);

  if (!input.hasGST && input.sellAllIndia) {
    const error = new Error('Without GST you can only sell within your state.');
    error.statusCode = 400;
    throw error;
  }

  if (input.hasGST) {
    if (!input.gstNumber) {
      const error = new Error('GST number is required when GST is enabled.');
      error.statusCode = 400;
      throw error;
    }

    if (!GST_REGEX.test(input.gstNumber.toUpperCase())) {
      const error = new Error('Invalid GST number format.');
      error.statusCode = 400;
      throw error;
    }
  }

  if (!input.hasGST && input.annualTurnoverLakh >= 40) {
    const error = new Error(
      'Annual turnover at or above Rs 40 lakh requires GST registration to continue selling.',
    );
    error.statusCode = 400;
    throw error;
  }

  if (!input.hasGST && !withoutGstDeclarationAccepted) {
    const error = new Error(
      'Without GST, seller must confirm turnover below Rs 40 lakh and state-only selling declaration.',
    );
    error.statusCode = 400;
    throw error;
  }

  if (!input.legalDeclarationAccepted || !input.responsibilitiesAccepted) {
    const error = new Error('Legal declaration and responsibilities acceptance are mandatory.');
    error.statusCode = 400;
    throw error;
  }
}

function calculateRtoRisk(rtoOrders, totalOrders) {
  if (totalOrders === 0) {
    return 'low';
  }

  const ratio = rtoOrders / totalOrders;
  if (ratio >= 0.2) {
    return 'high';
  }
  if (ratio >= 0.08) {
    return 'medium';
  }
  return 'low';
}

async function upsertOnboarding(db, userId, payload, status) {
  const existing = db.sellerOnboarding.find((entry) => entry.userId === userId);

  const next = {
    ...(existing || {}),
    ...payload,
    hasGST:
      payload.hasGST !== undefined
        ? Boolean(payload.hasGST)
        : existing
          ? Boolean(existing.hasGST)
          : false,
    sellAllIndia:
      payload.sellAllIndia !== undefined
        ? Boolean(payload.sellAllIndia)
        : existing
          ? Boolean(existing.sellAllIndia)
          : false,
    updatedAt: new Date().toISOString(),
    userId,
    status,
  };

  if (existing) {
    Object.assign(existing, next);
    return existing;
  }

  const created = {
    id: `seller-onboard-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    createdAt: new Date().toISOString(),
    ...next,
  };
  db.sellerOnboarding.push(created);
  return created;
}

router.post('/onboarding/draft', async (req, res) => {
  try {
    const input = parseBody(draftOnboardingSchema, req.body);

    const onboarding = await updateDb(async (db) => {
      const record = await upsertOnboarding(db, req.auth.sub, input, 'draft');
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'seller_onboarding_draft_saved',
        entityType: 'sellerOnboarding',
        entityId: record.id,
      });
      return record;
    });

    return res.status(201).json({
      onboarding,
      message: 'Draft saved. You can continue later.',
    });
  } catch (error) {
    return sendError(res, error);
  }
});

async function submitOnboarding(req, res) {
  try {
    const parsed = parseBody(submitOnboardingSchema, req.body);
    const input = {
      ...parsed,
      gstNumber: parsed.gstNumber ? parsed.gstNumber.toUpperCase() : undefined,
    };
    validateSubmitPayload(input);

    const onboarding = await updateDb(async (db) => {
      const record = await upsertOnboarding(db, req.auth.sub, input, 'submitted');
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'seller_onboarding_submitted',
        entityType: 'sellerOnboarding',
        entityId: record.id,
        metadata: {
          hasGST: record.hasGST,
          sellAllIndia: record.sellAllIndia,
        },
      });
      return record;
    });

    return res.status(201).json({
      onboarding,
      gstScope: onboarding.hasGST ? 'all_india' : 'state_only',
      upgradeAlert: !onboarding.hasGST && onboarding.annualTurnoverLakh >= 32,
      turnoverLimit: {
        currentLakh: onboarding.annualTurnoverLakh,
        limitLakh: 40,
      },
      rtoRule: onboarding.hasGST
        ? 'Seller pays both-side logistics RTO charges for all-India deliveries.'
        : 'Seller pays forward and return shipping for local RTO cases.',
    });
  } catch (error) {
    return sendError(res, error);
  }
}

router.post('/onboarding/submit', submitOnboarding);

router.post('/onboarding', submitOnboarding);

router.get('/onboarding/me', async (req, res) => {
  try {
    const db = await readDb();
    const onboarding = db.sellerOnboarding.find((entry) => entry.userId === req.auth.sub);
    return res.json({ onboarding: onboarding || null });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/documents', async (req, res) => {
  try {
    const input = parseBody(uploadDocumentSchema, req.body);

    const document = await updateDb(async (db) => {
      const orderExists = input.linkedOrderId
        ? (db.orders || []).some((order) => order.id === input.linkedOrderId)
        : true;
      if (!orderExists) {
        const error = new Error('Linked order not found.');
        error.statusCode = 404;
        throw error;
      }

      const created = {
        id: crypto.randomUUID(),
        userId: req.auth.sub,
        type: input.type,
        imageUrl: input.imageUrl,
        note: input.note || null,
        linkedOrderId: input.linkedOrderId || null,
        createdAt: new Date().toISOString(),
      };

      db.sellerDocuments.push(created);
      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'seller_document_uploaded',
        entityType: 'sellerDocument',
        entityId: created.id,
        metadata: {
          type: created.type,
        },
      });
      return created;
    });

    return res.status(201).json({ document });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/documents', async (req, res) => {
  try {
    const db = await readDb();
    const documents = (db.sellerDocuments || [])
      .filter((entry) => entry.userId === req.auth.sub)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({
      total: documents.length,
      documents,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const db = await readDb();
    const myProducts = db.products.filter((product) => product.sellerId === req.auth.sub);
    const productIds = new Set(myProducts.map((product) => product.id));

    const sellerOrders = db.orders.filter((order) =>
      order.items.some((item) => productIds.has(item.productId)),
    );

    const revenue = sellerOrders.reduce((sum, order) => {
      const sellerLineTotal = order.items
        .filter((item) => productIds.has(item.productId))
        .reduce((itemSum, item) => itemSum + item.lineTotal, 0);
      return sum + sellerLineTotal;
    }, 0);

    const rtoOrders = sellerOrders.filter((order) => order.status === 'rto').length;
    const rtoRiskMeter = calculateRtoRisk(rtoOrders, sellerOrders.length);
    const sellerRtoCharges = (db.rtoCharges || []).filter((entry) => entry.sellerId === req.auth.sub);
    const rtoChargesDueRs = sellerRtoCharges
      .filter((entry) => entry.status !== 'settled')
      .reduce((sum, entry) => sum + Number(entry.totalChargeRs || 0), 0);
    const rtoChargesSettledRs = sellerRtoCharges
      .filter((entry) => entry.status === 'settled')
      .reduce((sum, entry) => sum + Number(entry.totalChargeRs || 0), 0);

    const onboarding = db.sellerOnboarding.find((entry) => entry.userId === req.auth.sub) || null;

    return res.json({
      metrics: {
        products: myProducts.length,
        orders: sellerOrders.length,
        revenue,
        rtoOrders,
        rtoChargesDueRs,
      },
      rtoRiskMeter,
      rtoCharges: {
        total: sellerRtoCharges.length,
        dueRs: rtoChargesDueRs,
        settledRs: rtoChargesSettledRs,
        recent: sellerRtoCharges
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 5),
      },
      onboardingSummary: onboarding
        ? {
            status: onboarding.status || 'submitted',
            hasGST: onboarding.hasGST,
            sellAllIndia: onboarding.sellAllIndia,
            annualTurnoverLakh: onboarding.annualTurnoverLakh || 0,
            turnoverLimitLakh: 40,
            upgradeAlert: !onboarding.hasGST && (onboarding.annualTurnoverLakh || 0) >= 32,
            supportChannel: onboarding.supportChannel || null,
          }
        : null,
      training: {
        activeSubscriptions: (db.trainingSubscriptions || []).filter(
          (entry) => entry.userId === req.auth.sub && entry.status === 'active',
        ).length,
      },
      support: {
        openTickets: (db.supportTickets || []).filter(
          (entry) => entry.userId === req.auth.sub && ['open', 'in_progress'].includes(entry.status),
        ).length,
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
