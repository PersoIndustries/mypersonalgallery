INSERT INTO public.dev_tasks(id,payload) VALUES
('platform-68',jsonb_build_object(
  'id','platform-68',
  'title','Add Moon Collector branding to Google OAuth',
  'description','Upload the final Moon Collector logo in Google Cloud Branding and submit the app for brand verification. Keep Google sign-in available while the review is pending; no sensitive scopes are requested.',
  'area','Auth','priority','P2','status','todo','impact',3,'effort',2,'rank',98,'createdAt','2026-11-19'
)) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.dev_tasks(id,payload) VALUES
('platform-69',jsonb_build_object(
  'id','platform-69',
  'title','Apply Moon Collector branding to Supabase auth emails',
  'description','Configure a verified custom SMTP sender, then style the signup, recovery and other authentication templates with the Moon Collector visual identity. Verify sender details, subjects, language and working signup and password-reset links. Requires an owned domain and an external email provider.',
  'area','Auth','priority','P1','status','todo','impact',4,'effort',3,'rank',99,'createdAt','2026-11-19'
)) ON CONFLICT (id) DO NOTHING;