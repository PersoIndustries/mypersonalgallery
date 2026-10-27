import { createServerFn } from '@tanstack/react-start';
import { setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { diagnosticSchema, planSchema, requireAdminRole } from './platform-rules';
export const assertAdmin = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 setResponseHeader('Cache-Control','no-store');
 const result=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});requireAdminRole(!result.error && result.data);return true;
});
export const getAdminMetrics = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 setResponseHeader('Cache-Control','no-store');
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});requireAdminRole(!role.error && role.data);
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data,error}=await supabaseAdmin.rpc('admin_platform_metrics');if(error)throw new Error('Unable to load metrics');return data as {accounts:number;new_accounts_30d:number;museums:number;public_museums:number;objects:number;open_errors:number;errors_7d:number;open_tasks:number;active_subscriptions:number;plan_interests:Record<string,number>;mrr_by_currency:Record<string,number>;countries:Record<string,number>};
});
export const getBilling = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 setResponseHeader('Cache-Control','no-store');
 const [interest,subscription]=await Promise.all([context.supabase.from('plan_interests').select('plan').eq('user_id',context.userId).maybeSingle(),context.supabase.from('subscriptions').select('plan,status').eq('user_id',context.userId).maybeSingle()]);
 if(interest.error||subscription.error)throw new Error('Unable to load plan');return {interest:interest.data?.plan??null,subscription:subscription.data??{plan:'free',status:'inactive'}};
});
export const selectPlan = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>planSchema.parse(input)).handler(async({data,context})=>{
 const {error}=await context.supabase.from('plan_interests').upsert({user_id:context.userId,plan:data});if(error)throw new Error('Unable to save selection');return {plan:data,paymentsEnabled:false};
});
export const reportAppError = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>diagnosticSchema.parse(input)).handler(async({data,context})=>{
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const result=await supabaseAdmin.rpc('report_app_error',{reporter:context.userId,error_category:data.category,error_path:data.path,error_fingerprint:data.fingerprint});return !result.error && result.data===true;
});
export const getAdminErrors = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 setResponseHeader('Cache-Control','no-store');
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});requireAdminRole(!role.error && role.data);
 const {data,error}=await context.supabase.from('app_errors').select('id,category,path,fingerprint,resolved,created_at').order('created_at',{ascending:false}).limit(100);if(error)throw new Error('Unable to load diagnostics');return data??[];
});
export const resolveAdminError = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({id:z.string().uuid(),resolved:z.boolean()}).parse(input)).handler(async({data,context})=>{
 const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});requireAdminRole(!role.error && role.data);
 const {error}=await context.supabase.from('app_errors').update({resolved:data.resolved}).eq('id',data.id).select('id').single();if(error)throw new Error('Unable to update diagnostic');
});