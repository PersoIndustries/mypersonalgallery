CREATE OR REPLACE FUNCTION public.admin_purge_profile(target_profile text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid;
BEGIN
  SELECT user_id INTO uid FROM public.profiles WHERE id = target_profile FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF uid IS NOT NULL AND public.has_role(uid,'admin') THEN RAISE EXCEPTION 'Administrators cannot be deleted'; END IF;
  IF uid IS NOT NULL AND (EXISTS(SELECT 1 FROM public.billing_invoices WHERE user_id=uid) OR EXISTS(SELECT 1 FROM public.refund_requests WHERE user_id=uid)) THEN
    RAISE EXCEPTION 'Account has billing records';
  END IF;
  DELETE FROM public.objects WHERE museum_id IN (SELECT id FROM public.museums WHERE owner_id = target_profile);
  DELETE FROM public.museums WHERE owner_id = target_profile;
  IF uid IS NOT NULL THEN
    DELETE FROM public.notifications WHERE user_id = uid;
    DELETE FROM public.plan_interests WHERE user_id = uid;
    DELETE FROM public.subscriptions WHERE user_id = uid;
    DELETE FROM public.billing_events WHERE user_id = uid;
    UPDATE public.app_errors SET user_id = NULL WHERE user_id = uid;
  END IF;
  DELETE FROM public.profiles WHERE id = target_profile;
  RETURN uid;
END $$;
REVOKE ALL ON FUNCTION public.admin_purge_profile(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_purge_profile(text) TO service_role;