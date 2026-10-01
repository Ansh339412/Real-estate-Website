# Hearth & Key: Real Estate Listing Site

React + TypeScript + Vite + Tailwind + Framer Motion, with an optional Supabase (PostgreSQL) backend.

## Run locally
```bash
npm install
npm run dev
```
The website needs a Supabase project (below). Without one it shows a "Database not connected" screen. There is no sample data: every listing is created by a signed-in user.

## Connect the real database (Supabase)
1. Create a free project at supabase.com.
2. SQL Editor: run `supabase/schema.sql`, then `supabase/002_profiles_admin.sql`, then `supabase/004_image_storage.sql` (photo bucket), then `supabase/005_signup_details.sql` (saves sign-up details to profiles), then `supabase/006_owner_contact.sql` (owner contact for signed-in visitors), then `supabase/007_security_hardening.sql` (security hardening).
3. Copy `.env.example` to `.env.local` and fill in the Project URL and anon key (Project Settings > API).
4. Authentication > Providers: keep Email enabled.
5. Restart `npm run dev`. Sign up, add a listing, save homes.

## Sign-up flow
Sign-up collects name, phone, bio, email and password. Keep **Confirm email** ON (the Supabase default). After confirming and signing in, people are invited to add a profile photo from their gallery (they can skip it, or change it later on the Profile page).

## Admin account
1. Supabase > Authentication > Users > **Add user**: email `hakikatsingh099@gmail.com`, a strong password of your choice, and tick **Auto Confirm User**.
2. SQL Editor: run `supabase/003_make_admin.sql` (promotes that email to admin).
3. Sign in on the site as that user. An **Admin** link appears in the header (users, roles, all listings).
The password is never stored in this project. Admin rights live in the database (`profiles.role`) and are enforced by Row Level Security, not by hidden pages.

## Deploy to GitHub Pages
1. Push to a GitHub repo (`main` branch). Settings > Pages > Source: **GitHub Actions**.
2. For the database version, add repo secrets (Settings > Secrets and variables > Actions): `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The build needs them; without them the site shows the setup screen.
3. In Supabase, Authentication > URL Configuration: set Site URL to your `https://<user>.github.io/<repo>/`.

## Architecture
- `repositories/`: one `PropertyRepository` interface with a Supabase implementation, so the data source can be swapped without touching components.
- `context/`: Auth, Properties (shared cache), Favorites (optimistic updates), Filters.
- `lib/validation.ts`: zod schemas used by every form.
- `components/routing/ProtectedRoute.tsx`: route guard. Pages are lazy-loaded.

## Security
- Postgres Row Level Security: anyone can read listings; only signed-in users create; only owners edit or delete; favorites are private per user; users cannot mark listings as featured.
- Database CHECK constraints repeat the validation rules, so bad data is rejected even if the client is bypassed.
- Inputs validated with zod; image links must be https; React escapes all output; strict Content-Security-Policy in the production build.
- The anon key is meant to be public. Never put the `service_role` key in this project.
