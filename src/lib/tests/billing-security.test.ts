import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
test('anonymous callers cannot invoke service-only refund actions', async () => {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY']; assert.ok(url); assert.ok(key);
  const client = createClient(url, key, { auth: { persistSession: false } });
  const actor = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  const result = await client.rpc('request_invoice_refund', { actor, invoice: actor, explanation: 'Please refund my invoice' });
  assert.ok(result.error); assert.match(result.error.message, /permission denied/);
  const review = await client.rpc('review_invoice_refund', { actor, request: actor, decision: 'refunded', note: 'Unauthorized review' });
  assert.ok(review.error); assert.match(review.error.message, /permission denied/);
});