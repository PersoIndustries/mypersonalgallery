CREATE TABLE IF NOT EXISTS public.museum_daily_metrics (
  museum_id text NOT NULL REFERENCES public.museums(id) ON DELETE CASCADE,
  day date NOT NULL,
  views integer NOT NULL DEFAULT 0,
  total_duration_seconds bigint NOT NULL DEFAULT 0,
  timed_visits integer NOT NULL DEFAULT 0,
  PRIMARY KEY (museum_id, day)
);
GRANT SELECT ON public.museum_daily_metrics TO authenticated;
GRANT ALL ON public.museum_daily_metrics TO service_role;
ALTER TABLE public.museum_daily_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY museum_metrics_owner_read ON public.museum_daily_metrics FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.museums m WHERE m.id = museum_id AND (m.owner_id = auth.uid()::text OR public.has_role(auth.uid(),'admin'))));

CREATE OR REPLACE FUNCTION public.record_museum_visit(target_museum text, new_visit boolean, seconds integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE s integer := greatest(0, least(coalesce(seconds,0), 900));
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.museums WHERE id = target_museum AND is_public) THEN RETURN; END IF;
  IF NOT new_visit AND s = 0 THEN RETURN; END IF;
  INSERT INTO public.museum_daily_metrics(museum_id, day, views, total_duration_seconds, timed_visits)
  VALUES (target_museum, (now() AT TIME ZONE 'UTC')::date, CASE WHEN new_visit THEN 1 ELSE 0 END, s, CASE WHEN s > 0 THEN 1 ELSE 0 END)
  ON CONFLICT (museum_id, day) DO UPDATE SET
    views = museum_daily_metrics.views + EXCLUDED.views,
    total_duration_seconds = museum_daily_metrics.total_duration_seconds + EXCLUDED.total_duration_seconds,
    timed_visits = museum_daily_metrics.timed_visits + EXCLUDED.timed_visits;
END $$;
REVOKE ALL ON FUNCTION public.record_museum_visit(text, boolean, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_museum_visit(text, boolean, integer) TO service_role;