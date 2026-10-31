import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Json } from '@/integrations/supabase/types';
import { onboardingSchema, type Onboarding } from './onboarding';
import { requireAdminRole } from './platform-rules';

export const getOnboarding = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader('Cache-Control', 'no-store');
  const { data, error } = await context.supabase.from('profiles').select('preferences').eq('user_id', context.userId).maybeSingle();
  if (error) throw new Error('Unable to load onboarding');
  const prefs = (data?.preferences ?? {}) as Record<string, unknown>;
  const parsed = onboardingSchema.safeParse(prefs['onboarding'] ?? {});
  return (parsed.success ? parsed.data : {}) as Onboarding;
});

export const updateOnboarding = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(input => onboardingSchema.parse(input)).handler(async ({ data, context }) => {
  setResponseHeader('Cache-Control', 'no-store');
  const { data: row, error } = await context.supabase.from('profiles').select('preferences').eq('user_id', context.userId).single();
  if (error) throw new Error('Unable to load onboarding');
  const prefs = (row.preferences ?? {}) as Record<string, Json>;
  const current = onboardingSchema.safeParse(prefs['onboarding'] ?? {});
  const next = { ...(current.success ? current.data : {}), ...data };
  const { error: saveError } = await context.supabase.from('profiles').update({ preferences: { ...prefs, onboarding: next } as Json }).eq('user_id', context.userId).select('id').single();
  if (saveError) throw new Error('Unable to save onboarding');
  return next as Onboarding;
});

export type OnboardingFunnel = { signups: number; confirmed: number; first_museum: number; first_object: number; published: number; shared: number; plans_seen: number };
export const getOnboardingFunnel = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  setResponseHeader('Cache-Control', 'no-store');
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  requireAdminRole(!role.error && role.data);
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.rpc('admin_onboarding_funnel' as never);
  if (error) throw new Error('Unable to load funnel');
  return data as unknown as OnboardingFunnel;
});
