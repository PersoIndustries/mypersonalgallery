import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { requireAdminRole } from './platform-rules';
import { completedUtcWeek, refundRequestSchema, refundReviewSchema } from './billing-rules';
import { z } from 'zod';
const pageSchema = z.object({ page: z.number().int().min(0).max(1000).default(0) });
export const getBillingHistory = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => pageSchema.parse(input)).handler(async ({ context, data }) => {
  setResponseHeader('Cache-Control', 'no-store');
  const [invoices, requests] = await Promise.all([
    context.supabase.from('billing_invoices').select('*').eq('user_id', context.userId).order('created_at', { ascending: false }).order('id').range(data.page * 20, data.page * 20 + 20),
    context.supabase.from('refund_requests').select('*').eq('user_id', context.userId).order('created_at', { ascending: false }).limit(100),
  ]);
  if (invoices.error || requests.error) throw new Error('Unable to load billing');
  return { invoices: (invoices.data ?? []).slice(0, 20), requests: requests.data ?? [], hasMore: (invoices.data?.length ?? 0) > 20 };
});
export const requestRefund = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => refundRequestSchema.parse(input)).handler(async ({ context, data }) => {
  setResponseHeader('Cache-Control', 'no-store');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const result = await supabaseAdmin.rpc('request_invoice_refund', { actor: context.userId, invoice: data.invoiceId, explanation: data.reason });
  if (result.error) throw new Error('Unable to request refund');
  return result.data;
});
export const reviewRefund = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => refundReviewSchema.parse(input)).handler(async ({ context, data }) => {
  setResponseHeader('Cache-Control', 'no-store');
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' }); requireAdminRole(!role.error && role.data);
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const result = await supabaseAdmin.rpc('review_invoice_refund', { actor: context.userId, request: data.id, decision: data.decision, note: data.note });
  if (result.error) throw new Error('Unable to review refund');
});
export const getAdminBilling = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => pageSchema.parse(input)).handler(async ({ context, data }) => {
  setResponseHeader('Cache-Control', 'no-store');
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' }); requireAdminRole(!role.error && role.data);
  const [subscriptions, requests, days] = await Promise.all([
    context.supabase.from('subscriptions').select('user_id,plan,status,currency,monthly_amount_minor,updated_at').order('updated_at', { ascending: false }).order('user_id').range(data.page * 20, data.page * 20 + 20),
    context.supabase.from('refund_requests').select('*').order('created_at', { ascending: false }).order('id').range(data.page * 20, data.page * 20 + 20),
    context.supabase.from('daily_platform_summaries').select('*').order('day', { ascending: false }).limit(90),
  ]);
  if (subscriptions.error || requests.error || days.error) throw new Error('Unable to load billing');
  const week = completedUtcWeek(new Date());
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const accounts = await supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).not('user_id', 'is', null).gte('created_at', `${week.start}T00:00:00Z`).lt('created_at', `${week.end}T00:00:00Z`);
  if (accounts.error) throw new Error('Unable to load billing');
  return { subscriptions: (subscriptions.data ?? []).slice(0,20), requests: (requests.data ?? []).slice(0,20), days: days.data ?? [], hasMore: (subscriptions.data?.length ?? 0) > 20 || (requests.data?.length ?? 0) > 20, week: { ...week, newAccounts: accounts.count ?? 0, coveredDays: (days.data ?? []).filter(d => d.day >= week.start && d.day < week.end).length } };
});