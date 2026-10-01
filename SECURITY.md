# Security summary

This site is a static React front end talking directly to Supabase. There is no custom server, so the
**database rules (Row Level Security, grants, triggers, storage policies) are the real security boundary**.
Nothing here makes a website "100% secure"; this lists what was done and what you must still configure.

## Implemented in this project
- **Row Level Security on every table** (`properties`, `profiles`, `favorites`, `error_logs`) plus least-privilege `GRANT`s.
  Anonymous visitors can only read listings. The only `USING (true)` policy is public listing read, documented in SQL.
- **Ownership and sensitive columns are controlled by the database**: owner, id, created date, `featured`, `role` and profile `email`
  cannot be changed by the browser (triggers + column-level grants). Nobody can promote themselves to admin. The last admin cannot be removed.
- **Owner contact** is returned by a `SECURITY DEFINER` function, one listing at a time, only to signed-in users. Profiles still cannot be browsed.
- **Validation twice**: zod in the browser, CHECK constraints and triggers in the database (lengths, 6-digit PIN, price/area ranges, https image URLs
  that must point at this project's storage bucket). `<`, `>` and control characters are stripped server-side.
- **Rate limits**: max 10 new listings per user per hour and 60 error-log writes per hour (database); sign-in/sign-up attempt throttling in the browser.
- **Storage**: bucket limited to JPG/PNG/WebP, 5 MB; uploads only into your own folder, no sub-folders, image extensions only; the browser also
  checks the real file signature. Deleting a listing removes its photos.
- **Secrets**: only the public anon key is used. `scripts/security-check.mjs` runs after every build and fails it if a service-role key,
  secret key or private key appears in source or build output. `.env*` files are git-ignored.
- **Headers**: strict CSP (meta tag in the build), referrer policy, frame-busting script, and a `public/_headers` file with HSTS,
  `X-Content-Type-Options`, `X-Frame-Options`, `Permissions-Policy`, COOP and `frame-ancestors`.
- **Errors**: users only see friendly 401/403/404/429/500/offline/generic pages and a short reference code. Raw database/auth messages are mapped
  to safe text. A global error boundary catches crashes. Logs are redacted (emails, phones, tokens, ids, passwords) and stored in `error_logs`
  (admin-only read).
- **Auth**: PKCE flow, vague sign-in errors (no account enumeration), logout clears in-memory profile state.

## You still need to do (dashboard / hosting)
1. Supabase > Authentication: keep **Confirm email ON**; set the **Site URL** and **Redirect URLs** to your real address only.
2. Supabase > Authentication > Rate Limits: keep or tighten sign-in, sign-up and email limits. Enable **CAPTCHA** (Turnstile/hCaptcha) for sign-up if you see abuse.
3. Supabase > Authentication > Policies: require a longer password and enable leaked-password protection if your plan allows it. Set a short JWT expiry if desired.
4. Run `supabase/002`, `004`, `005`, `006`, `007` in order, then create the admin user and run `003`.
5. **Hosting**: GitHub Pages cannot send HTTP headers. Use Netlify or Cloudflare Pages (they read `public/_headers`) or put Cloudflare in front,
   to get real HSTS, `X-Frame-Options` and `frame-ancestors`. On GitHub Pages enable "Enforce HTTPS".
6. Periodically delete old rows from `error_logs` (admin can delete) and review Supabase logs.

## Known limits (be honest about them)
- Listing owners' phone and email are visible to **any signed-in user** by design (that is the contact feature). Sign-up and profile pages say so.
- Browser-side throttling can be bypassed; the real protection is Supabase rate limits plus the database triggers.
- Photos are in a **public** bucket (listing photos and avatars are public content). Do not store private documents there.
- CORS and API-level rate limiting for Supabase's own endpoints are managed by Supabase, not by this project.
- There is no password-reset screen yet; if you add one, rate-limit it and keep the response identical for known and unknown emails.
- The CSP meta tag cannot express `frame-ancestors`; the `_headers` file does, on hosts that support it.
