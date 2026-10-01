# Database security tests

These run against a throw-away local PostgreSQL (NOT your Supabase project).
`00_supabase_stubs.sql` creates stand-ins for Supabase's `auth`/`storage` schemas and roles.

```bash
createdb t
psql -d t -f 00_supabase_stubs.sql
for f in ../schema.sql ../002_profiles_admin.sql ../004_image_storage.sql ../005_signup_details.sql ../006_owner_contact.sql ../007_security_hardening.sql; do psql -d t -f $f; done
psql -d t -f 01_rls_and_guards.sql | grep -E "PASS|FAIL"
```
Every line should start with PASS. The tests act as owner, other signed-in user, anonymous visitor and admin.
