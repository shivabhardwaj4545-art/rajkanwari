import { Router } from 'express';
import db from '../db/client.js';

export const bannersRouter = Router();

/**
 * GET /api/banners/active
 * Returns banners within the scheduled time window, ordered by display_order
 */
bannersRouter.get('/active', async (_req, res, next) => {
  try {
    const now = new Date().toISOString();
    const rows = await db
      .prepare(`
        SELECT
          id, title, subtitle, image_url, cta_text, cta_link, text_alignment,
          COALESCE(text_color, 'white') as text_color,
          COALESCE(offer_category, 'None') as offer_category,
          COALESCE(gradient_style, 'dark_vignette') as gradient_style,
          display_order, starts_at, ends_at
        FROM banners
        WHERE is_active = 1
          AND (starts_at IS NULL OR starts_at <= ?)
          AND (ends_at IS NULL OR ends_at >= ?)
        ORDER BY display_order ASC
      `)
      .all(now, now);

    return res.json({ data: rows });
  } catch (err) {
    return next(err);
  }
});
