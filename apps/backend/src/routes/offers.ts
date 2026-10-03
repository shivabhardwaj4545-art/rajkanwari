import { Router } from 'express';
import db from '../db/client.js';

export const offersRouter = Router();

/**
 * GET /api/offers/active
 * Returns currently active promotional offers
 */
offersRouter.get('/active', async (_req, res, next) => {
  try {
    const now = new Date().toISOString();
    const rows = (await db
      .prepare(`
        SELECT
          id, name, code, COALESCE(offer_category, 'Festive Offer') as offer_category,
          type, value, max_discount, min_cart_value,
          starts_at, ends_at, banner_image_url, priority,
          scope, scope_ids
        FROM offers
        WHERE is_active = 1
          AND (starts_at IS NULL OR starts_at <= ?)
          AND (ends_at IS NULL OR ends_at >= ?)
        ORDER BY priority DESC
      `)
      .all(now, now)) as any[];

    const formatted = rows.map((r) => {
      let scopeIds: string[] = [];
      try {
        scopeIds = typeof r.scope_ids === 'string' ? JSON.parse(r.scope_ids || '[]') : r.scope_ids || [];
      } catch {
        scopeIds = [];
      }

      return {
        ...r,
        value: Number(r.value),
        max_discount: r.max_discount !== null ? Number(r.max_discount) : null,
        min_cart_value: Number(r.min_cart_value),
        scope_ids: scopeIds,
      };
    });

    return res.json({ data: formatted });
  } catch (err) {
    return next(err);
  }
});
