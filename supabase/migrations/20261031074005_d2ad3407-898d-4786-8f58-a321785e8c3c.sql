CREATE TABLE public.notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
 kind text NOT NULL,
 data jsonb NOT NULL DEFAULT '{}'::jsonb,
 read_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notifications TO authenticated;
GRANT UPDATE (read_at) ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_own_read ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY notifications_own_update ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX notifications_unread ON public.notifications(user_id) WHERE read_at IS NULL;
CREATE TRIGGER notifications_updated BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE FUNCTION public.notify_collector_event() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE recipient uuid; event_kind text; event_data jsonb := '{}'::jsonb;
BEGIN
 IF TG_TABLE_NAME = 'profiles' THEN
  recipient := NEW.user_id; event_kind := 'welcome';
 ELSIF TG_TABLE_NAME = 'museums' THEN
  SELECT user_id INTO recipient FROM public.profiles WHERE id = NEW.owner_id;
  event_data := jsonb_build_object('museumId', NEW.id, 'title', NEW.title);
  IF TG_OP = 'INSERT' THEN event_kind := 'museum_created';
  ELSIF OLD.is_public IS DISTINCT FROM NEW.is_public THEN event_kind := CASE WHEN NEW.is_public THEN 'museum_published' ELSE 'museum_private' END;
  ELSE RETURN NEW; END IF;
 ELSIF TG_TABLE_NAME = 'plan_interests' THEN
  IF TG_OP = 'UPDATE' THEN IF OLD.plan IS NOT DISTINCT FROM NEW.plan THEN RETURN NEW; END IF; END IF;
  recipient := NEW.user_id; event_kind := 'plan_interest'; event_data := jsonb_build_object('plan', NEW.plan);
 END IF;
 IF recipient IS NOT NULL THEN INSERT INTO public.notifications(user_id,kind,data) VALUES (recipient,event_kind,event_data); END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.notify_collector_event() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.notify_collector_event() TO service_role;
CREATE TRIGGER profiles_notify AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.notify_collector_event();
CREATE TRIGGER museums_notify AFTER INSERT OR UPDATE OF is_public ON public.museums FOR EACH ROW EXECUTE FUNCTION public.notify_collector_event();
CREATE TRIGGER plan_interest_notify AFTER INSERT OR UPDATE OF plan ON public.plan_interests FOR EACH ROW EXECUTE FUNCTION public.notify_collector_event();