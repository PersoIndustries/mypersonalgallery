import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BILLING_CONNECTED, WEEKLY_REPORT_RECIPIENT, completedUtcWeek, refundable, refundReviewSchema, refundRequestSchema, invoiceDocumentUrl } from '../billing-rules';
test('Stripe stays disconnected', () => assert.equal(BILLING_CONNECTED, false));
test('weekly operational report has only Carlos as recipient', () => assert.equal(WEEKLY_REPORT_RECIPIENT, 'carlosperaltasorolla@gmail.com'));
test('weekly reports cover a completed UTC Monday to Monday week', () => assert.deepEqual(completedUtcWeek(new Date('2026-11-02T00:01:00Z')), { start: '2026-10-26', end: '2026-11-02' }));
test('refund approval cannot mark money as refunded or change entitlements', () => {
  assert.equal(refundReviewSchema.safeParse({ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', decision: 'refunded', note: 'Approved' }).success, false);
  assert.equal(refundRequestSchema.safeParse({ invoiceId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', reason: 'Request refund please', user_id: 'other' }).success, false);
});
test('only paid live invoices with remaining money permit requests', () => {
  const invoice = { status: 'paid', environment: 'live', amount_paid_minor: 1000, amount_refunded_minor: 300 };
  assert.equal(refundable(invoice), true); assert.equal(refundable({ ...invoice, environment: 'sandbox' }), false); assert.equal(refundable({ ...invoice, amount_refunded_minor: 1000 }), false);
});
test('invoice documents permit only provider HTTPS hosts', () => {
  assert.equal(invoiceDocumentUrl('https://invoice.stripe.com/i/test'), 'https://invoice.stripe.com/i/test');
  assert.equal(invoiceDocumentUrl('javascript:alert(1)'), null); assert.equal(invoiceDocumentUrl('https://invoice.stripe.com.evil.example/i'), null);
});