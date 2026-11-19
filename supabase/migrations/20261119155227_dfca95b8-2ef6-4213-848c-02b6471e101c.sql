CREATE OR REPLACE FUNCTION public.handle_new_curator() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE handle text; country_code text; provider text; display_name text;
BEGIN
  provider = coalesce(NEW.raw_app_meta_data->>'provider','email');
  country_code = upper(coalesce(NEW.raw_user_meta_data->>'country',''));
  IF country_code !~ '^[A-Z]{2}$' THEN
    IF provider = 'email' THEN RAISE EXCEPTION 'Country is required'; END IF;
    country_code = NULL;
  END IF;
  display_name = coalesce(nullif(NEW.raw_user_meta_data->>'name',''), nullif(NEW.raw_user_meta_data->>'full_name',''), 'Collector');
  handle = lower(regexp_replace(coalesce(nullif(NEW.raw_user_meta_data->>'username',''), split_part(coalesce(NEW.email,''),'@',1), 'collector'),'[^a-zA-Z0-9_-]','','g'));
  IF length(handle) < 3 THEN handle = 'collector'; END IF;
  handle = left(handle, 30);
  IF EXISTS(SELECT 1 FROM public.profiles WHERE username=handle) THEN handle = handle||'-'||substr(NEW.id::text,1,8); END IF;
  INSERT INTO public.profiles(id,user_id,name,username,country,avatar)
  VALUES(NEW.id::text, NEW.id, display_name, handle, country_code, coalesce(nullif(NEW.raw_user_meta_data->>'avatar_url',''), ''));
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.handle_new_curator() FROM PUBLIC, anon, authenticated;