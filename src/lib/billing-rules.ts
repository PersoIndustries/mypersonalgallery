import { z } from 'zod';
export const BILLING_CONNECTED = false;
export const WEEKLY_REPORT_RECIPIENT = 'carlosperaltasorolla@gmail.com';
export const refundRequestSchema = z.object({ invoiceId: z.string().uuid(), reason: z.string().trim().min(10).max(2000) }).strict();
export const refundReviewSchema = z.object({ id: z.string().uuid(), decision: z.enum(['approved_pending_provider', 'rejected']), note: z.string().trim().min(3).max(2000) }).strict();
export function invoiceDocumentUrl(value: string | null) {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && (url.hostname === 'invoice.stripe.com' || url.hostname === 'pay.stripe.com') ? url.href : null; } catch { return null; }
}
export function refundable(invoice: { status: string; environment: string; amount_paid_minor: number; amount_refunded_minor: number }) {
  return invoice.environment === 'live' && invoice.status === 'paid' && invoice.amount_paid_minor > invoice.amount_refunded_minor;
}
export function completedUtcWeek(now: Date) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  end.setUTCDate(end.getUTCDate() - (end.getUTCDay() + 6) % 7);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 7);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}