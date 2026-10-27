<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Persist catalogue data in Supabase through validated TanStack server functions with user-scoped RLS; browser storage is only for appearance settings, never identity or permissions.
- Keep private curator and admin routes under the integration-managed `_authenticated` layout; verify admin privileges using `public.user_roles` on the server.
- Preserve legacy catalogue IDs and complete object records in JSON payloads; auth-linked profiles use the auth UUID as their profile ID, while seeded curator profiles have no login identity.
- Keep the museum React context in a component-free module so hot reload preserves provider/consumer identity; initialize missing catalogue state with empty arrays during loader transitions.
- Use the official HTTPS npm registry for dependency downloads and lockfile URLs so installs do not depend on an internal cache hostname.
- Public catalogue reads use bounded edge caching and TanStack Query caching; private responses are never shared, and public mutations invalidate cached data.
- Cache only public image requests in a size- and age-bounded service worker; never cache signed storage URLs or account responses.
- Billing interest is separate from authoritative subscriptions; only a future verified payment service may modify subscription entitlements.
- Administrator aggregates use privileged reads only after a server-side user_roles check; sanitized authenticated error reporting is rate-limited in PostgreSQL.
- Localize explicit default-interface strings through English/Spanish JSON dictionaries and a component-free language context; never pass user-authored catalogue values to the translator.
- Format selected DEV tasks in a pure export module using current complete records; selection and clipboard previews remain transient and never change persisted task statuses.
