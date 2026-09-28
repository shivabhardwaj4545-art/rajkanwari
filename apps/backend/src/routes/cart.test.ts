import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../index.js';

describe('Cart API Endpoints (/api/cart/*)', () => {
  let createdVariantId: string = 'var_prd_01_1';

  it('fetches initial empty or existing guest cart', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cart_id');
    expect(res.body).toHaveProperty('breakdown');
  });

  it('adds an item to cart and then deletes it by variant_id', async () => {
    const agent = request.agent(app);

    // 1. Add item to cart
    const addRes = await agent
      .post('/api/cart/items')
      .send({ variant_id: createdVariantId, quantity: 2 });
    expect(addRes.status).toBe(200);
    expect(addRes.body.breakdown.items.some((it: any) => it.variant_id === createdVariantId)).toBe(true);

    // 2. Delete item from cart using variant_id
    const delRes = await agent.delete(`/api/cart/items/${createdVariantId}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body.breakdown.items.some((it: any) => it.variant_id === createdVariantId)).toBe(false);
  });

  it('updates item quantity and deletes when quantity is set to 0', async () => {
    const agent = request.agent(app);

    // 1. Add item
    await agent.post('/api/cart/items').send({ variant_id: createdVariantId, quantity: 1 });

    // 2. Update quantity to 3 using variant_id
    const patchRes1 = await agent
      .patch(`/api/cart/items/${createdVariantId}`)
      .send({ quantity: 3 });
    expect(patchRes1.status).toBe(200);
    const updatedItem = patchRes1.body.breakdown.items.find((it: any) => it.variant_id === createdVariantId);
    expect(updatedItem?.quantity).toBe(3);

    // 3. Update quantity to 0 -> should delete item
    const patchRes2 = await agent
      .patch(`/api/cart/items/${createdVariantId}`)
      .send({ quantity: 0 });
    expect(patchRes2.status).toBe(200);
    expect(patchRes2.body.breakdown.items.some((it: any) => it.variant_id === createdVariantId)).toBe(false);
  });
});
