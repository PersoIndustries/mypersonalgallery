CREATE OR REPLACE FUNCTION public.assign_initial_free_plan()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.user_id IS NOT NULL THEN
  INSERT INTO public.subscriptions(user_id,plan,status,monthly_amount_minor)
  VALUES(NEW.user_id,'free','inactive',0) ON CONFLICT(user_id) DO NOTHING;
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.assign_initial_free_plan() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER profiles_initial_free_plan AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.assign_initial_free_plan();
INSERT INTO public.subscriptions(user_id,plan,status,monthly_amount_minor)
SELECT user_id,'free','inactive',0 FROM public.profiles WHERE user_id IS NOT NULL
ON CONFLICT(user_id) DO NOTHING;