import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import { addAuditLog } from '../audit.js';
import {
  calculatePointsEarnedFromPurchase,
  calculatePointsRedemption,
  getUserBalance,
  grantPoints,
} from '../rewards.js';
import { isServiceableProduct } from '../location.js';

const itemSchema = z.object({
  productId: z.string().min(3),
  quantity: z.number().int().min(1).max(20),
});

const previewSchema = z.object({
  items: z.array(itemSchema).min(1),
  usePoints: z.boolean().default(false),
  requestedPoints: z.number().int().positive().optional(),
});

const checkoutSchema = previewSchema.extend({
  paymentMethod: z.enum(['UPI', 'CARD', 'NET_BANKING', 'COD']),
  paymentIntentId: z.string().min(3).optional(),
  address: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(6),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    line1: z.string().min(4),
  }),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    'placed',
    'verified_for_shipping',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'rto',
  ]),
  note: z.string().trim().max(500).optional(),
  rtoReason: z.enum(['customer_rejected', 'delivery_failed', 'wrong_address', 'other']).optional(),
});

const sellerVerificationSchema = z.object({
  productId: z.string().min(3),
  imageUrl: z.string().url(),
  note: z.string().trim().max(300).optional(),
});

const router = Router();
const SHIPPING_READY_STATUSES = new Set(['shipped', 'out_for_delivery', 'delivered', 'rto']);
const ORDER_STATUS_TRANSITIONS = {
  placed: ['verified_for_shipping', 'cancelled'],
  verified_for_shipping: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'rto'],
  out_for_delivery: ['delivered', 'rto'],
  delivered: [],
  cancelled: [],
  rto: [],
  return_requested: [],
  returned_refunded: [],
};

function canTransitionOrderStatus(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) {
    return true;
  }

  const next = ORDER_STATUS_TRANSITIONS[currentStatus];
  if (!Array.isArray(next)) {
    return false;
  }

  return next.includes(nextStatus);
}

function assertOrderServiceability(db, items, address) {
  const location = {
    city: String(address.city || '').trim(),
    pincode: String(address.pincode || '').trim(),
  };

  const productsById = new Map((db.products || []).map((product) => [product.id, product]));
  for (const item of items) {
    const product = productsById.get(item.productId);
    if (!product) {
      const error = new Error(`Product not found: ${item.productId}`);
      error.statusCode = 404;
      throw error;
    }

    if (!isServiceableProduct(product, location)) {
      const error = new Error(
        `Product "${product.name}" is not serviceable for ${location.city} (${location.pincode}).`,
      );
      error.statusCode = 400;
      throw error;
    }
  }
}

function hasVerification(item) {
  return Array.isArray(item?.sellerVerification) && item.sellerVerification.length > 0;
}

function ensureVerificationBeforeShipping(order) {
  for (const item of order.items || []) {
    if (!hasVerification(item)) {
      return item;
    }
  }

  return null;
}

function createRtoCharges(db, order, reason, actorUserId) {
  if (!Array.isArray(db.rtoCharges)) {
    db.rtoCharges = [];
  }

  const existingBySeller = new Map(
    (db.rtoCharges || [])
      .filter((entry) => entry.orderId === order.id)
      .map((entry) => [entry.sellerId, entry]),
  );

  const sellers = new Set((order.items || []).map((item) => item.sellerId));
  const subtotal = Math.max(
    1,
    Number(
      order?.pricing?.subtotal ||
        (order.items || []).reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
    ),
  );
  const orderDeliveryCharge = Number(order?.pricing?.deliveryCharge || 0);

  const chargeEntries = [];
  for (const sellerId of sellers) {
    const sellerLineTotal = (order.items || [])
      .filter((item) => item.sellerId === sellerId)
      .reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);

    if (sellerLineTotal <= 0) {
      continue;
    }

    const allocatedForward = Math.max(
      20,
      Math.round(((orderDeliveryCharge > 0 ? orderDeliveryCharge : 40) * sellerLineTotal) / subtotal),
    );
    const sellerOnboarding = (db.sellerOnboarding || []).find(
      (entry) => entry.userId === sellerId && entry.status === 'submitted',
    );
    const hasGST = Boolean(sellerOnboarding?.hasGST);
    const totalChargeRs = allocatedForward * 2;

    const existing = existingBySeller.get(sellerId);
    if (existing) {
      existing.reason = reason || existing.reason || 'other';
      existing.forwardShippingRs = allocatedForward;
      existing.returnShippingRs = allocatedForward;
      existing.totalChargeRs = totalChargeRs;
      existing.rule = hasGST ? 'gst_all_india' : 'without_gst_local';
      existing.sellerHasGST = hasGST;
      existing.status = 'due';
      existing.updatedAt = new Date().toISOString();
      chargeEntries.push(existing);
      continue;
    }

    const created = {
      id: crypto.randomUUID(),
      orderId: order.id,
      orderNumber: order.orderNumber,
      sellerId,
      sellerHasGST: hasGST,
      rule: hasGST ? 'gst_all_india' : 'without_gst_local',
      reason: reason || 'other',
      forwardShippingRs: allocatedForward,
      returnShippingRs: allocatedForward,
      totalChargeRs,
      status: 'due',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      raisedByUserId: actorUserId,
    };
    db.rtoCharges.push(created);
    chargeEntries.push(created);
  }

  return chargeEntries;
}

function buildOrderPreview(db, userId, input) {
  const productsById = new Map(db.products.map((product) => [product.id, product]));
  const items = input.items.map((item) => {
    const product = productsById.get(item.productId);
    if (!product) {
      const error = new Error(`Product not found: ${item.productId}`);
      error.statusCode = 404;
      throw error;
    }
    if (product.stock < item.quantity) {
      const error = new Error(`Insufficient stock for product: ${product.name}`);
      error.statusCode = 400;
      throw error;
    }

    return {
      productId: product.id,
      name: product.name,
      sellerId: product.sellerId,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: product.price * item.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const marketplaceDiscount = Math.round(subtotal * 0.08);
  const deliveryCharge = subtotal >= 499 ? 0 : 40;

  const availablePoints = getUserBalance(db, userId);
  const pointsSummary = input.usePoints
    ? calculatePointsRedemption({
        availablePoints,
        orderAmount: subtotal,
        requestedPoints: input.requestedPoints,
      })
    : { pointsApplied: 0, discountRupees: 0, reason: null };

  const totalPayable = Math.max(
    0,
    subtotal - marketplaceDiscount - pointsSummary.discountRupees + deliveryCharge,
  );

  return {
    items,
    pricing: {
      subtotal,
      marketplaceDiscount,
      deliveryCharge,
      pointsDiscount: pointsSummary.discountRupees,
      totalPayable,
    },
    points: {
      availablePoints,
      ...pointsSummary,
    },
  };
}

function isSellerInOrder(order, sellerId) {
  return (order.items || []).some((item) => item.sellerId === sellerId);
}

router.use(requireAuth);

router.post('/preview', async (req, res) => {
  try {
    const input = parseBody(previewSchema, req.body);
    const db = await readDb();
    const preview = buildOrderPreview(db, req.auth.sub, input);
    return res.json(preview);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    const input = parseBody(checkoutSchema, req.body);

    const result = await updateDb(async (db) => {
      const user = db.users.find((candidate) => candidate.id === req.auth.sub);
      if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      const preview = buildOrderPreview(db, user.id, input);
      assertOrderServiceability(db, preview.items, input.address);

      let paymentIntent = null;
      if (input.paymentMethod !== 'COD') {
        if (!input.paymentIntentId) {
          const error = new Error('paymentIntentId is required for non-COD payment methods.');
          error.statusCode = 400;
          throw error;
        }

        paymentIntent = (db.paymentIntents || []).find((entry) => entry.id === input.paymentIntentId);
        if (!paymentIntent || paymentIntent.userId !== user.id) {
          const error = new Error('Payment intent not found.');
          error.statusCode = 404;
          throw error;
        }

        if (paymentIntent.status !== 'succeeded') {
          const error = new Error('Payment intent is not confirmed as succeeded.');
          error.statusCode = 400;
          throw error;
        }

        if (paymentIntent.amountRs < preview.pricing.totalPayable) {
          const error = new Error('Payment intent amount is lower than payable order total.');
          error.statusCode = 400;
          throw error;
        }

        if (paymentIntent.linkedOrderId) {
          const error = new Error('Payment intent already used for another order.');
          error.statusCode = 400;
          throw error;
        }

        if (paymentIntent.linkedTrainingSubscriptionId) {
          const error = new Error('Payment intent already linked to a training subscription.');
          error.statusCode = 400;
          throw error;
        }

        const context = String(paymentIntent.context || '')
          .trim()
          .toLowerCase();
        if (context && !['checkout', 'order'].includes(context)) {
          const error = new Error(
            `Payment intent context "${paymentIntent.context}" is not valid for order checkout.`,
          );
          error.statusCode = 400;
          throw error;
        }
      }

      const order = {
        id: crypto.randomUUID(),
        orderNumber: `BYN-${Date.now().toString().slice(-8)}`,
        userId: user.id,
        status: 'placed',
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === 'COD' ? 'pending_cod' : 'paid',
        paymentIntentId: paymentIntent ? paymentIntent.id : null,
        paymentProviderRef: paymentIntent ? paymentIntent.providerRef : null,
        address: input.address,
        items: preview.items.map((item) => ({
          ...item,
          sellerVerification: [],
        })),
        pricing: preview.pricing,
        pointsSummary: preview.points,
        statusHistory: [
          {
            status: 'placed',
            actorUserId: user.id,
            note: null,
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deliveredAt: null,
      };

      for (const item of preview.items) {
        const product = db.products.find((candidate) => candidate.id === item.productId);
        product.stock -= item.quantity;
      }

      if (preview.points.pointsApplied > 0) {
        grantPoints(db, {
          userId: user.id,
          points: -preview.points.pointsApplied,
          type: 'redeem_checkout',
          source: order.id,
          metadata: {
            rupeeValue: preview.points.discountRupees,
          },
        });
      }

      const purchaseEarnedPoints = calculatePointsEarnedFromPurchase(preview.pricing.subtotal);
      if (purchaseEarnedPoints > 0) {
        grantPoints(db, {
          userId: user.id,
          points: purchaseEarnedPoints,
          type: 'purchase_reward',
          source: order.id,
        });
      }

      if (!user.firstPurchaseCompletedAt) {
        user.firstPurchaseCompletedAt = new Date().toISOString();
        grantPoints(db, {
          userId: user.id,
          points: 20,
          type: 'first_purchase_bonus',
          source: order.id,
        });

        const referral = db.referrals.find(
          (entry) =>
            entry.referredUserId === user.id &&
            !entry.firstPurchaseRewardedAt &&
            entry.status === 'active',
        );
        if (referral) {
          referral.firstPurchaseRewardedAt = new Date().toISOString();
          grantPoints(db, {
            userId: referral.referrerUserId,
            points: 20,
            type: 'referral_first_purchase_referrer',
            source: user.id,
          });
          grantPoints(db, {
            userId: referral.referredUserId,
            points: 10,
            type: 'referral_first_purchase_referred',
            source: referral.referrerUserId,
          });
        }
      }

      if (paymentIntent) {
        paymentIntent.linkedOrderId = order.id;
      }

      db.orders.push(order);
      addAuditLog(db, {
        actorUserId: user.id,
        action: 'order_created',
        entityType: 'order',
        entityId: order.id,
        metadata: {
          orderNumber: order.orderNumber,
          paymentMethod: order.paymentMethod,
          totalPayable: order.pricing.totalPayable,
        },
      });

      return {
        order,
        walletPoints: getUserBalance(db, user.id),
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/mine', async (req, res) => {
  try {
    const db = await readDb();
    const orders = db.orders
      .filter((order) => order.userId === req.auth.sub)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json({ total: orders.length, orders });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/seller', requireRoles('seller', 'admin'), async (req, res) => {
  try {
    const db = await readDb();
    const orders = db.orders
      .filter((order) => (req.auth.role === 'admin' ? true : isSellerInOrder(order, req.auth.sub)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ total: orders.length, orders });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/:orderId/seller-verification', requireRoles('seller', 'admin'), async (req, res) => {
  try {
    const input = parseBody(sellerVerificationSchema, req.body);

    const result = await updateDb(async (db) => {
      const order = (db.orders || []).find((entry) => entry.id === req.params.orderId);
      if (!order) {
        const error = new Error('Order not found.');
        error.statusCode = 404;
        throw error;
      }

      const item = (order.items || []).find((entry) => entry.productId === input.productId);
      if (!item) {
        const error = new Error('Product not found in this order.');
        error.statusCode = 404;
        throw error;
      }

      if (req.auth.role !== 'admin' && item.sellerId !== req.auth.sub) {
        const error = new Error('You can only add verification for your own product items.');
        error.statusCode = 403;
        throw error;
      }

      if (!Array.isArray(item.sellerVerification)) {
        item.sellerVerification = [];
      }

      const verification = {
        id: crypto.randomUUID(),
        imageUrl: input.imageUrl,
        note: input.note || null,
        sellerId: req.auth.role === 'admin' ? item.sellerId : req.auth.sub,
        createdAt: new Date().toISOString(),
      };
      item.sellerVerification.push(verification);

      order.status = 'verified_for_shipping';
      order.updatedAt = new Date().toISOString();
      if (!Array.isArray(order.statusHistory)) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status: 'verified_for_shipping',
        actorUserId: req.auth.sub,
        note: `Verification uploaded for ${input.productId}`,
        createdAt: new Date().toISOString(),
      });

      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'seller_verification_uploaded',
        entityType: 'order',
        entityId: order.id,
        metadata: {
          productId: input.productId,
        },
      });

      return {
        order,
        verification,
      };
    });

    return res.status(201).json(result);
  } catch (error) {
    return sendError(res, error);
  }
});

router.patch('/:orderId/status', requireRoles('seller', 'admin'), async (req, res) => {
  try {
    const input = parseBody(updateOrderStatusSchema, req.body);

    const result = await updateDb(async (db) => {
      const order = (db.orders || []).find((entry) => entry.id === req.params.orderId);
      if (!order) {
        const error = new Error('Order not found.');
        error.statusCode = 404;
        throw error;
      }

      if (req.auth.role !== 'admin' && !isSellerInOrder(order, req.auth.sub)) {
        const error = new Error('You can only update orders containing your products.');
        error.statusCode = 403;
        throw error;
      }

      if (!canTransitionOrderStatus(order.status, input.status)) {
        const error = new Error(
          `Invalid order status transition from "${order.status}" to "${input.status}".`,
        );
        error.statusCode = 400;
        throw error;
      }

      if (input.status === 'rto' && !input.rtoReason) {
        const error = new Error(
          'rtoReason is required for RTO status updates (customer_rejected, delivery_failed, wrong_address, other).',
        );
        error.statusCode = 400;
        throw error;
      }

      if (SHIPPING_READY_STATUSES.has(input.status)) {
        const pendingVerificationItem = ensureVerificationBeforeShipping(order);
        if (pendingVerificationItem) {
          const error = new Error(
            `Seller verification image is required before shipping. Missing for product ${pendingVerificationItem.productId}.`,
          );
          error.statusCode = 400;
          throw error;
        }
      }

      order.status = input.status;
      order.updatedAt = new Date().toISOString();
      if (input.status === 'delivered') {
        order.deliveredAt = new Date().toISOString();
      }

      let rtoCharges = [];
      if (input.status === 'rto') {
        rtoCharges = createRtoCharges(db, order, input.rtoReason, req.auth.sub);
      }

      if (!Array.isArray(order.statusHistory)) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status: input.status,
        actorUserId: req.auth.sub,
        note: input.note || null,
        rtoReason: input.rtoReason || null,
        createdAt: new Date().toISOString(),
      });

      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'order_status_updated',
        entityType: 'order',
        entityId: order.id,
        metadata: {
          status: input.status,
          rtoReason: input.rtoReason || null,
          rtoCharges: rtoCharges.map((entry) => ({
            id: entry.id,
            sellerId: entry.sellerId,
            totalChargeRs: entry.totalChargeRs,
          })),
        },
      });

      return order;
    });

    return res.json({ order: result });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
