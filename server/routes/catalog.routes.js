import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../auth.js';
import { readDb, updateDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import { addAuditLog } from '../audit.js';
import { runDropSchedulerJob, runOfferActivationJob } from '../jobs.js';

const createProductSchema = z.object({
  name: z.string().min(2).max(180),
  brand: z.string().min(2).max(120),
  category: z.string().min(2).max(80),
  subcategory: z.string().min(2).max(80).optional(),
  description: z.string().min(4).max(1000),
  price: z.number().positive(),
  mrp: z.number().positive(),
  rating: z.number().min(0).max(5).default(4),
  reviews: z.number().int().min(0).default(0),
  stock: z.number().int().min(0).default(10),
  localSeller: z.boolean().default(true),
  deliveryTimeHours: z.number().positive().default(4),
  commissionRate: z.number().min(0).max(0.5).default(0.1),
  serviceCities: z.array(z.string().min(2)).min(1),
  servicePincodes: z.array(z.string().min(3)).min(1),
  image: z.string().url(),
  tags: z.array(z.string()).default([]),
  nonReturnable: z.boolean().default(false),
});

const router = Router();

function applySort(products, sort) {
  const list = [...products];
  switch (sort) {
    case 'price_asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return list.sort((a, b) => b.price - a.price);
    case 'rating_desc':
      return list.sort((a, b) => b.rating - a.rating);
    case 'delivery_fast':
      return list.sort((a, b) => a.deliveryTimeHours - b.deliveryTimeHours);
    default:
      return list.sort((a, b) => b.reviews - a.reviews);
  }
}

function buildCategoryPayload(categories) {
  const activeCategories = categories.filter((entry) => entry.active !== false);
  const roots = activeCategories
    .filter((entry) => !entry.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const childrenByParent = new Map();

  for (const category of activeCategories) {
    if (!category.parentId) {
      continue;
    }
    if (!childrenByParent.has(category.parentId)) {
      childrenByParent.set(category.parentId, []);
    }
    childrenByParent.get(category.parentId).push(category);
  }

  const tree = roots.map((root) => ({
    ...root,
    subcategories: (childrenByParent.get(root.id) || []).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    ),
  }));

  return {
    roots,
    tree,
    flat: activeCategories.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
  };
}

router.get('/categories', async (_req, res) => {
  try {
    const db = await readDb();
    const categories = buildCategoryPayload(db.categories || []);
    return res.json(categories);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/offers', async (req, res) => {
  try {
    const activeOnly = String(req.query.activeOnly || 'true').toLowerCase() !== 'false';

    const offers = await updateDb(async (db) => {
      runOfferActivationJob(db);
      const list = activeOnly ? db.offers.filter((offer) => offer.active) : [...db.offers];
      return list.sort((a, b) => new Date(b.startAt || 0) - new Date(a.startAt || 0));
    });

    return res.json({
      total: offers.length,
      offers,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/drop-schedules', async (req, res) => {
  try {
    const activeOnly = String(req.query.activeOnly || 'true').toLowerCase() !== 'false';

    const dropSchedules = await updateDb(async (db) => {
      runDropSchedulerJob(db);
      const list = activeOnly
        ? db.dropSchedules.filter((schedule) => schedule.active)
        : [...db.dropSchedules];
      return list.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
    });

    return res.json({
      total: dropSchedules.length,
      dropSchedules,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/feed', async (_req, res) => {
  try {
    const feed = await updateDb(async (db) => {
      runOfferActivationJob(db);
      runDropSchedulerJob(db);

      const categoryPayload = buildCategoryPayload(db.categories || []);
      const activeOffers = (db.offers || []).filter((offer) => offer.active);
      const activeDropSchedules = (db.dropSchedules || []).filter((drop) => drop.active);
      const productsById = new Map((db.products || []).map((product) => [product.id, product]));
      const activeDropProducts = activeDropSchedules.flatMap((drop) =>
        drop.productIds.map((productId) => productsById.get(productId)).filter(Boolean),
      );

      return {
        topMenu: categoryPayload.roots.map((category) => ({
          key: category.slug,
          label: category.name,
        })),
        categories: categoryPayload.tree,
        offers: activeOffers,
        dropDeals: activeDropProducts,
        quickFilters: ['Trending', 'Under 999', 'New', 'Top Rated'],
      };
    });

    return res.json(feed);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/products', async (req, res) => {
  try {
    const db = await readDb();
    const category = String(req.query.category || '').trim();
    const subcategory = String(req.query.subcategory || '').trim();
    const city = String(req.query.city || '').trim();
    const pincode = String(req.query.pincode || '').trim();
    const query = String(req.query.q || '').trim().toLowerCase();
    const tag = String(req.query.tag || '').trim().toLowerCase();
    const localOnly = String(req.query.localOnly || '').toLowerCase() === 'true';
    const dropDealOnly = String(req.query.dropDealOnly || '').toLowerCase() === 'true';
    const minPrice = Number(req.query.minPrice || 0);
    const maxPrice = Number(req.query.maxPrice || Number.MAX_SAFE_INTEGER);
    const sort = String(req.query.sort || 'relevance');

    let products = db.products.filter((product) => product.stock > 0);

    if (category) {
      products = products.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase(),
      );
    }

    if (subcategory) {
      products = products.filter(
        (product) => String(product.subcategory || '').toLowerCase() === subcategory.toLowerCase(),
      );
    }

    if (city) {
      products = products.filter((product) =>
        product.serviceCities.some((serviceCity) => serviceCity.toLowerCase() === city.toLowerCase()),
      );
    }

    if (pincode) {
      products = products.filter((product) => product.servicePincodes.includes(pincode));
    }

    if (localOnly) {
      products = products.filter((product) => product.localSeller);
    }

    if (query) {
      products = products.filter((product) =>
        `${product.name} ${product.brand} ${product.category} ${product.subcategory || ''} ${
          product.description
        }`
          .toLowerCase()
          .includes(query),
      );
    }

    if (tag) {
      products = products.filter((product) =>
        (product.tags || []).some((entry) => String(entry).toLowerCase() === tag),
      );
    }

    if (dropDealOnly) {
      products = products.filter((product) =>
        (product.tags || []).some((entry) => String(entry).toLowerCase() === 'drop-deal'),
      );
    }

    products = products.filter((product) => product.price >= minPrice && product.price <= maxPrice);
    products = applySort(products, sort);

    return res.json({
      total: products.length,
      products,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/products/:productId', async (req, res) => {
  try {
    const db = await readDb();
    const product = db.products.find((candidate) => candidate.id === req.params.productId);
    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }
    return res.json({ product });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/my-products', requireAuth, requireRoles('seller', 'admin'), async (req, res) => {
  try {
    const db = await readDb();
    const products = db.products.filter((product) => product.sellerId === req.auth.sub);
    return res.json({ total: products.length, products });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/products', requireAuth, requireRoles('seller', 'admin'), async (req, res) => {
  try {
    const input = parseBody(createProductSchema, req.body);
    const result = await updateDb(async (db) => {
      const categoryExists = (db.categories || []).some(
        (entry) => entry.active !== false && entry.name.toLowerCase() === input.category.toLowerCase(),
      );
      if (!categoryExists) {
        const error = new Error('Invalid category. Create category first from admin panel.');
        error.statusCode = 400;
        throw error;
      }

      const product = {
        id: `prod-${Math.random().toString(36).slice(2, 10)}`,
        ...input,
        subcategory: input.subcategory || 'General',
        sellerId: req.auth.sub,
        createdAt: new Date().toISOString(),
      };
      db.products.push(product);

      addAuditLog(db, {
        actorUserId: req.auth.sub,
        action: 'product_created',
        entityType: 'product',
        entityId: product.id,
      });

      return product;
    });

    return res.status(201).json({ product: result });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
