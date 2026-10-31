create or replace function public.admin_onboarding_funnel()
returns jsonb language sql stable security definer set search_path = public as $$
  with p as (select pr.id, pr.user_id, pr.preferences from public.profiles pr where pr.user_id is not null)
  select jsonb_build_object(
    'signups', (select count(*) from p),
    'confirmed', (select count(*) from p join auth.users u on u.id = p.user_id where u.email_confirmed_at is not null),
    'first_museum', (select count(*) from p where exists (select 1 from public.museums m where m.owner_id = p.id)),
    'first_object', (select count(*) from p where exists (select 1 from public.museums m join public.objects o on o.museum_id = m.id where m.owner_id = p.id)),
    'published', (select count(*) from p where exists (select 1 from public.museums m where m.owner_id = p.id and m.is_public)),
    'shared', (select count(*) from p where coalesce((p.preferences->'onboarding'->>'shared')::boolean, false)),
    'plans_seen', (select count(*) from p where coalesce((p.preferences->'onboarding'->>'plansSeen')::boolean, false))
  );
$$;
revoke all on function public.admin_onboarding_funnel() from public, anon, authenticated;
grant execute on function public.admin_onboarding_funnel() to service_role;