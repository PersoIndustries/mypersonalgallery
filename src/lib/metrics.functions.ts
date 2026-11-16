import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { averageVisitSeconds, hasPaidAccess, planSchema, requireAdminRole } from './platform-rules';

export type MuseumStats = { locked: true } | { locked: false; total: number; last7: number; avgSeconds: number; days: { day: string; views: number }[] };

export const getMuseumStats = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({ museumId: z.string().min(1) }).parse(i)).handler(async ({ data, context }): Promise<MuseumStats> => {
  setResponseHeader('Cache-Control', 'no-store');
  const db = context.supabase as any;
  const [sub, role] = await Promise.all([
    db.from('subscriptions').select('plan,status').eq('user_id', context.userId).maybeSingle(),
    db.rpc('has_role', { _user_id: context.userId, _role: 'admin' }),
  ]);
  if (!hasPaidAccess(sub.data) && role.data !== true) return { locked: true };
  const rows = await db.from('museum_daily_metrics').select('day,views,total_duration_seconds,timed_visits').eq('museum_id', data.museumId).order('day', { ascending: false }).limit(1000);
  if (rows.error) throw new Error('Unable to load statistics');
  const list = (rows.data ?? []) as { day: string; views: number; total_duration_seconds: number; timed_visits: number }[];
  const today = new Date(); const days: { day: string; views: number }[] = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i)).toISOString().slice(0, 10); days.push({ day: d, views: list.find((r) => r.day === d)?.views ?? 0 }); }
  const sec = list.reduce((n, r) => n + Number(r.total_duration_seconds), 0); const timed = list.reduce((n, r) => n + r.timed_visits, 0);
  return { locked: false, total: list.reduce((n, r) => n + r.views, 0), last7: days.reduce((n, d) => n + d.views, 0), avgSeconds: averageVisitSeconds(sec, timed), days };
});

export const adminSetUserPlan = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((i) => z.object({ userId: z.string().uuid(), plan: planSchema }).parse(i)).handler(async ({ data, context }) => {
  setResponseHeader('Cache-Control', 'no-store');
  const role = await (context.supabase as any).rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  requireAdminRole(!role.error && role.data);
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const existing = await supabaseAdmin.from('subscriptions').select('stripe_subscription_id').eq('user_id', data.userId).maybeSingle();
  if (existing.data?.stripe_subscription_id) throw new Error('This plan is managed by a payment subscription');
  const { error } = await supabaseAdmin.from('subscriptions').upsert({ user_id: data.userId, plan: data.plan, status: data.plan === 'free' ? 'inactive' : 'active', monthly_amount_minor: 0 }, { onConflict: 'user_id' });
  if (error) throw new Error('Unable to update plan');
});
