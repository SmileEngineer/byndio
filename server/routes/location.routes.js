import { Router } from 'express';
import { z } from 'zod';
import { readDb } from '../db.js';
import { parseBody, sendError } from '../http.js';
import {
  isServiceableProduct,
  listLocationIndex,
  resolveByPincode,
  resolveNearestLocation,
  searchLocations,
} from '../location.js';

const manualLocationSchema = z.object({
  pincode: z.string().trim().min(4).max(10).optional(),
  query: z.string().trim().min(2).max(80).optional(),
});

const serviceabilitySchema = z.object({
  city: z.string().trim().min(2).max(80),
  pincode: z.string().trim().min(4).max(10),
  productIds: z.array(z.string().min(3)).optional(),
});

const router = Router();

router.get('/index', (_req, res) => {
  return res.json({
    locations: listLocationIndex(),
  });
});

router.get('/resolve', (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);

    const resolved = resolveNearestLocation(lat, lng);
    if (!resolved) {
      const error = new Error('Unable to resolve location for coordinates.');
      error.statusCode = 400;
      throw error;
    }

    return res.json({
      location: resolved,
      source: 'coordinate_lookup',
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/manual', (req, res) => {
  try {
    const input = parseBody(manualLocationSchema, req.body);

    if (!input.pincode && !input.query) {
      const error = new Error('Provide pincode or query for manual location selection.');
      error.statusCode = 400;
      throw error;
    }

    const byPincode = input.pincode ? resolveByPincode(input.pincode) : null;
    if (byPincode) {
      return res.json({
        location: byPincode,
        suggestions: [],
      });
    }

    const suggestions = searchLocations(input.query || input.pincode || '');
    return res.json({
      location: suggestions[0] || null,
      suggestions,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/search', (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json({ suggestions: [] });
    }

    const suggestions = searchLocations(query);
    return res.json({ suggestions });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/serviceability', async (req, res) => {
  try {
    const input = parseBody(serviceabilitySchema, req.body);
    const db = await readDb();
    const location = {
      city: input.city,
      pincode: input.pincode,
    };

    let products = db.products || [];
    if (Array.isArray(input.productIds) && input.productIds.length > 0) {
      const productIds = new Set(input.productIds);
      products = products.filter((product) => productIds.has(product.id));
    }

    const result = products.map((product) => ({
      productId: product.id,
      serviceable: isServiceableProduct(product, location),
      deliveryTimeHours: product.deliveryTimeHours,
      localSeller: Boolean(product.localSeller),
    }));

    return res.json({
      location,
      serviceability: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
