import { beforeEach, describe, expect, it } from 'vitest';
import db from '../db/client.js';
import { calculateCart } from './pricing.js';

function createTestDb() {
  return db;
}

describe('Offer & Pricing Engine (calculateCart)', () => {
  beforeEach(async () => {
    // Disable any pre-existing auto offers or test offers to isolate unit tests
    await db.prepare("UPDATE offers SET is_active = 0 WHERE code IS NULL OR id LIKE 'ofr_test_%'").run();
  });

  it('handles empty cart correctly with zero totals and no shipping', async () => {
    const testDb = createTestDb();
    const result = await calculateCart([], 'usr_cust_01', undefined, testDb);

    expect(result.items).toHaveLength(0);
    expect(result.subtotal_mrp_paise).toBe(0);
    expect(result.subtotal_paise).toBe(0);
    expect(result.total_discount_paise).toBe(0);
    expect(result.shipping_paise).toBe(0);
    expect(result.tax_paise).toBe(0);
    expect(result.total_paise).toBe(0);
  });

  it('calculates percent discount with a cap (max_discount enforced)', async () => {
    const testDb = createTestDb();

    await testDb.prepare(`
      INSERT INTO offers (
        id, name, code, type, value, max_discount, min_cart_value,
        starts_at, ends_at, is_active, stackable, priority
      ) VALUES (
        'ofr_test_cap', '50% Capped', 'TEST_HALF50', 'percent', 50, 100000, 0,
        '2020-01-01', '2099-01-01', 1, 1, 10
      ) ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, is_active = 1, type = EXCLUDED.type, value = EXCLUDED.value, max_discount = EXCLUDED.max_discount
    `).run();

    const result = await calculateCart([{ variant_id: 'var_prd_01_1', quantity: 1 }], 'usr_cust_01', 'TEST_HALF50', testDb);

    expect(result.coupon).toBeDefined();
    expect(result.coupon?.discount_paise).toBeLessThanOrEqual(100000);
  });

  it('rejects flat discount below minimum cart value', async () => {
    const testDb = createTestDb();

    await testDb.prepare(`
      INSERT INTO offers (
        id, name, code, type, value, min_cart_value,
        starts_at, ends_at, is_active, stackable, priority
      ) VALUES (
        'ofr_test_min', 'Flat 500 Off', 'TEST_FLAT500', 'flat', 50000, 15000000,
        '2020-01-01', '2099-01-01', 1, 1, 10
      ) ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, min_cart_value = EXCLUDED.min_cart_value, is_active = 1
    `).run();

    const result = await calculateCart([{ variant_id: 'var_prd_01_1', quantity: 1 }], 'usr_cust_01', 'TEST_FLAT500', testDb);

    expect(result.coupon).toBeUndefined();
    expect(result.coupon_error).toBeDefined();
  });

  it('ignores expired offers', async () => {
    const testDb = createTestDb();

    await testDb.prepare(`
      INSERT INTO offers (
        id, name, code, type, value,
        starts_at, ends_at, is_active, stackable, priority
      ) VALUES (
        'ofr_test_expired', 'Expired Promo', 'TEST_EXPIRED20', 'percent', 20,
        '2020-01-01', '2021-01-01', 1, 1, 10
      ) ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, ends_at = EXCLUDED.ends_at, is_active = 1
    `).run();

    const result = await calculateCart([{ variant_id: 'var_prd_01_1', quantity: 1 }], 'usr_cust_01', 'TEST_EXPIRED20', testDb);

    expect(result.coupon).toBeUndefined();
  });

  it('rejects coupon when usage limit is exhausted', async () => {
    const testDb = createTestDb();

    await testDb.prepare(`
      INSERT INTO offers (
        id, name, code, type, value,
        starts_at, ends_at, is_active, usage_limit, used_count, priority
      ) VALUES (
        'ofr_test_exhausted', 'Soldout Promo', 'TEST_LIMIT10', 'percent', 20,
        '2020-01-01', '2099-01-01', 1, 10, 10, 10
      ) ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, usage_limit = EXCLUDED.usage_limit, used_count = EXCLUDED.used_count, is_active = 1
    `).run();

    const result = await calculateCart([{ variant_id: 'var_prd_01_1', quantity: 1 }], 'usr_cust_01', 'TEST_LIMIT10', testDb);

    expect(result.coupon).toBeUndefined();
  });

  it('rejects coupon when per-user limit is already consumed', async () => {
    const testDb = createTestDb();

    await testDb.prepare(`
      INSERT INTO offers (
        id, name, code, type, value,
        starts_at, ends_at, is_active, per_user_limit, priority
      ) VALUES (
        'ofr_test_peruser', 'Once Per User', 'TEST_ONCE10', 'percent', 10,
        '2020-01-01', '2099-01-01', 1, 1, 10
      ) ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, per_user_limit = EXCLUDED.per_user_limit, is_active = 1
    `).run();

    await testDb.prepare(`
      INSERT INTO offer_redemptions (id, offer_id, user_id, order_id)
      VALUES ('red_test_1', 'ofr_test_peruser', 'usr_cust_01', 'ord_001')
      ON CONFLICT (id) DO NOTHING
    `).run();

    const result = await calculateCart([{ variant_id: 'var_prd_01_1', quantity: 1 }], 'usr_cust_01', 'TEST_ONCE10', testDb);

    expect(result.coupon).toBeUndefined();
  });

  it('enforces non-stackable conflict (rejects coupon if non-stackable auto-offer applied)', async () => {
    const testDb = createTestDb();

    await testDb.prepare(`
      INSERT INTO offers (
        id, name, code, type, value,
        starts_at, ends_at, is_active, stackable, priority
      ) VALUES (
        'ofr_test_auto_nostack', 'Auto Heritage 10%', NULL, 'percent', 10,
        '2020-01-01', '2099-01-01', 1, 0, 100
      ) ON CONFLICT (id) DO UPDATE SET stackable = 0, is_active = 1
    `).run();

    await testDb.prepare(`
      INSERT INTO offers (
        id, name, code, type, value,
        starts_at, ends_at, is_active, stackable, priority
      ) VALUES (
        'ofr_test_coupon', 'Extra 5% Coupon', 'TEST_EXTRA5', 'percent', 5,
        '2020-01-01', '2099-01-01', 1, 1, 10
      ) ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, is_active = 1
    `).run();

    const result = await calculateCart([{ variant_id: 'var_prd_01_1', quantity: 1 }], 'usr_cust_01', 'TEST_EXTRA5', testDb);

    expect(result.coupon).toBeUndefined();
  });

  it('applies free shipping offer and waives shipping fee', async () => {
    const testDb = createTestDb();

    await testDb.prepare(`
      INSERT INTO products (id, category_id, name, slug, description, fabric, occasion, gender, mrp, discount_percent, sku, images, is_active)
      VALUES ('prd_test_small', 'cat_anarkali', 'Dupatta', 'dupatta-freeship-test', 'Silk Dupatta', 'Silk', 'Festive', 'women', 100000, 0, 'SKU-SM-FS-TEST', '[]', 1)
      ON CONFLICT (id) DO NOTHING;
    `).run();

    await testDb.prepare(`
      INSERT INTO product_variants (id, product_id, variant_sku, size, color, stock, is_active)
      VALUES ('var_test_small', 'prd_test_small', 'SKU-SM-VAR-FS-TEST', 'FREE_SIZE', 'Gold', 10, 1)
      ON CONFLICT (id) DO NOTHING;
    `).run();

    await testDb.prepare(`
      INSERT INTO offers (
        id, name, code, type, value,
        starts_at, ends_at, is_active, stackable, priority
      ) VALUES (
        'ofr_test_freeship', 'Complimentary Shipping', 'TEST_FREESHIP', 'free_shipping', 0,
        '2020-01-01', '2099-01-01', 1, 1, 10
      ) ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, is_active = 1
    `).run();

    const freeShipResult = await calculateCart([{ variant_id: 'var_test_small', quantity: 1 }], 'usr_cust_01', 'TEST_FREESHIP', testDb);
    expect(freeShipResult.shipping_paise).toBe(0);
    expect(freeShipResult.coupon).toBeDefined();
    expect(freeShipResult.coupon?.code).toBe('TEST_FREESHIP');
  });
});
