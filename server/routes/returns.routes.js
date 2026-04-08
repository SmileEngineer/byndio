import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import { addAuditLog } from '../audit.js';

const RETURN_WINDOW_DAYS = 7;

const createReturnSchema = z.object({
  orderId: z.string().min(3),
  productId: z.string().min(3),
  reason: z.enum(['damaged', 'wrong_item', 'quality_issue']),
  details: z.string().trim().max(600).optional(),
  mediaUrls: z.array(z.string().url()).max(5).default([]),
});

const updateReturnStatusSchema = z.object({
  status: z.enum([
    'pickup_scheduled',
    'picked_up',
    'seller_verified',
    'approved',
    'rejected',
    'refund_initiated',
    'refund_completed',
  ]),
  note: z.string().trim().max(600).optional(),
  verificationMedia: z.array(z.string().url()).max(5).optional(),
  refundDestination: z.enum(['source_payment_method', 'wallet']).optional(),
});

const statusTransitions = {
  requested: ['pickup_scheduled', 'rejected'],
  pickup_scheduled: ['picked_up', 'rejected'],
  picked_up: ['seller_verified', 'rejected'],
  seller_verified: ['approved', 'rejected'],
  approved: ['refund_initiated'],
  refund_initiated: ['refund_completed'],
  refund_completed: [],
  rejected: [],
};

const router = Router();
router.use(requireAuth);

function addReturnTimeline(returnRequest, status, note, actorUserId) {
  if (!Array.isArray(returnRequest.timeline)) {
    returnRequest.timeline = [];
  }

  returnRequest.timeline.push({
    id: crypto.randomUUID(),
    status,
    note: note || null,
    actorUserId,
    createdAt: new Date().toISOString(),
  });
}

function resolveReturnAmount(order, productId) {
  const item = (order.items || []).find((entry) => entry.productId === productId);
  return item ? item.lineTotal : 0;
}

router.post('/request', async (req, res) => {
  try {
    const input = parseBody(createReturnSchema, req.body);

    const result = await updateDb(async (db) => {
      const order = (db.orders || []).find((entry) => entry.id === input.orderId);
      if (!order || order.userId !== req.auth.sub) {
        const error = new Error('Order not found for this user.');
        error.statusCode = 404;
        throw error;
      }

      const product = (db.products || []).find((entry) => entry.id === input.productId);
      if (!product) {
        const error = new Error('Product not found.');
        error.statusCode = 404;
        throw error;
      }

      const orderItem = (order.items || []).find((item) => item.productId === input.productId);
      if (!orderItem) {
        const error = new Error('This product is not part of the selected order.');
        error.statusCode = 400;
        throw error;
      }

      if (product.nonReturnable) {
        const error = new Error('This item is marked non-returnable.');
        error.statusCode = 400;
        throw error;
      }

      const deliveredAt = order.deliveredAt || order.createdAt;
      const daysSinceDelivery =
        (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
        const error = new Error('Return window expired. Returns are allowed within 7 days of delivery.');
        error.statusCode = 400;
        throw error;
      }

      const existing = (db.returnRequests || []).find(
        (entry) =>
          entry.orderId === order.id &&
          entry.productId === input.productId &&
          !['rejected', 'refund_completed'].includes(entry.status),
      );
      if (existing) {
        return existing;
      }

      const returnRequest = {
        id: crypto.randomUUID(),
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        sellerId: orderItem.sellerId,
        productId: input.productId,
        reason: input.reason,
        details: input.details || null,
        mediaUrls: input.mediaUrls,
        status: 'requested',
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addReturnTimeline(returnRequest, 'requested', input.details, req.auth.sub);

      order.status = 'return_requested';
      db.returnRequests.push(returnRequest);

      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'return_requested',
        entityType: 'returnRequest',
        entityId: returnRequest.id,
        metadata: {
          orderId: order.id,
          productId: input.productId,
          reason: input.reason,
        },
      });

      return returnRequest;
    });

    return res.status(201).json({ returnRequest: result });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/mine', async (req, res) => {
  try {
    const db = await readDb();
    const returnRequests = (db.returnRequests || [])
      .filter((entry) => entry.userId === req.auth.sub)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json({
      total: returnRequests.length,
      returnRequests,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/seller', requireRoles('seller', 'admin'), async (req, res) => {
  try {
    const db = await readDb();
    const returnRequests = (db.returnRequests || [])
      .filter((entry) => (req.auth.role === 'admin' ? true : entry.sellerId === req.auth.sub))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json({
      total: returnRequests.length,
      returnRequests,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.patch('/:returnId/status', requireRoles('seller', 'admin'), async (req, res) => {
  try {
    const input = parseBody(updateReturnStatusSchema, req.body);

    const result = await updateDb(async (db) => {
      const returnRequest = (db.returnRequests || []).find((entry) => entry.id === req.params.returnId);
      if (!returnRequest) {
        const error = new Error('Return request not found.');
        error.statusCode = 404;
        throw error;
      }

      if (req.auth.role !== 'admin' && returnRequest.sellerId !== req.auth.sub) {
        const error = new Error('You can only manage return requests for your products.');
        error.statusCode = 403;
        throw error;
      }

      const nextStates = statusTransitions[returnRequest.status] || [];
      if (!nextStates.includes(input.status)) {
        const error = new Error(
          `Invalid status transition from "${returnRequest.status}" to "${input.status}".`,
        );
        error.statusCode = 400;
        throw error;
      }

      returnRequest.status = input.status;
      returnRequest.updatedAt = new Date().toISOString();
      if (input.verificationMedia) {
        returnRequest.verificationMedia = input.verificationMedia;
      }
      addReturnTimeline(returnRequest, input.status, input.note, req.auth.sub);

      const order = (db.orders || []).find((entry) => entry.id === returnRequest.orderId);

      if (input.status === 'approved' || input.status === 'refund_initiated') {
        let refund = (db.refunds || []).find((entry) => entry.returnRequestId === returnRequest.id);
        if (!refund) {
          const amountRs = order ? resolveReturnAmount(order, returnRequest.productId) : 0;
          refund = {
            id: crypto.randomUUID(),
            returnRequestId: returnRequest.id,
            orderId: returnRequest.orderId,
            userId: returnRequest.userId,
            productId: returnRequest.productId,
            amountRs,
            destination: input.refundDestination || 'source_payment_method',
            status: 'initiated',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: null,
          };
          db.refunds.push(refund);
        } else {
          refund.status = 'initiated';
          refund.updatedAt = new Date().toISOString();
        }
        returnRequest.status = 'refund_initiated';
      }

      if (input.status === 'refund_completed') {
        const refund = (db.refunds || []).find((entry) => entry.returnRequestId === returnRequest.id);
        if (!refund) {
          const error = new Error('Refund record not found for this return request.');
          error.statusCode = 400;
          throw error;
        }

        refund.status = 'completed';
        refund.updatedAt = new Date().toISOString();
        refund.completedAt = new Date().toISOString();
      }

      if (order) {
        order.status = returnRequest.status === 'rejected' ? 'delivered' : 'return_requested';
      }

      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'return_status_updated',
        entityType: 'returnRequest',
        entityId: returnRequest.id,
        metadata: {
          status: returnRequest.status,
        },
      });

      return {
        returnRequest,
        refund:
          (db.refunds || []).find((entry) => entry.returnRequestId === returnRequest.id) || null,
      };
    });

    return res.json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/refunds/mine', async (req, res) => {
  try {
    const db = await readDb();
    const refunds = (db.refunds || [])
      .filter((entry) => entry.userId === req.auth.sub)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json({
      total: refunds.length,
      refunds,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
