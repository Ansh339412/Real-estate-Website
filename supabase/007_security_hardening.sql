-- Run AFTER 001-006. Security hardening pass. Safe to re-run.
-- Rules of thumb used here: least privilege at the GRANT level, RLS on every table,
-- security-sensitive columns controlled by the database (not the browser), and sanitising on the server.

-- 1. Least-privilege table grants (RLS still decides which rows) --------------------------------
revoke all on public.properties, public.favorites, public.profiles from anon, authenticated;
grant select on public.properties to anon, authenticated;                    -- public catalogue
grant insert, update, delete on public.properties to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, bio, avatar_url, role) on public.profiles to authenticated;  -- never id/email/created_at

comment on policy "Anyone can read listings" on public.properties
  is 'Public by design: listings are a public catalogue. No private data lives in this table.';

-- Internal helper functions should not be callable as public API endpoints.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.my_role() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_role() to authenticated;

-- 2. Validation constraints (NOT VALID = enforced for new/changed rows, old rows are left alone) --
alter table public.properties drop constraint if exists properties_zip_chk;
alter table public.properties add constraint properties_zip_chk check (zip ~ '^[0-9]{6}$') not valid;
alter table public.properties drop constraint if exists properties_text_len_chk;
alter table public.properties add constraint properties_text_len_chk check (
  char_length(street) between 3 and 120 and char_length(city) between 2 and 80 and char_length(state) between 2 and 40) not valid;
alter table public.properties drop constraint if exists properties_range_chk;
alter table public.properties add constraint properties_range_chk check (
  price <= 5000000000 and area_sqft <= 1000000 and cardinality(amenities) <= 12) not valid;

alter table public.profiles drop constraint if exists profiles_phone_chk;
alter table public.profiles add constraint profiles_phone_chk check (phone ~ '^([+0-9][0-9 -]{6,18})?$') not valid;
-- Avatars may only point at files in OUR storage bucket (no third-party tracking pixels).
alter table public.profiles drop constraint if exists profiles_avatar_url_check;
alter table public.profiles drop constraint if exists profiles_avatar_url_chk;
alter table public.profiles add constraint profiles_avatar_url_chk check (
  avatar_url is null or avatar_url ~ '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/listing-images/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$') not valid;

-- 3. Server-side guards on listings ---------------------------------------------------------------
-- auth.uid() is NULL for the SQL editor / service role, so admin maintenance there is not blocked.
create or replace function public.guard_property() returns trigger
language plpgsql set search_path = public as $$
declare el jsonb;
begin
  if tg_op = 'UPDATE' then
    if auth.uid() is not null then
      new.id := old.id; new.created_at := old.created_at; new.owner_id := old.owner_id;
      if not public.is_admin() then new.featured := old.featured; end if;
    end if;
  else
    if auth.uid() is not null then
      if (select count(*) from public.properties where owner_id = auth.uid() and created_at > now() - interval '1 hour') >= 10 then
        raise exception 'rate_limit';
      end if;
      new.owner_id := auth.uid();
      new.featured := false;
    end if;
  end if;

  -- Strip markup characters and control characters (defence in depth against stored XSS).
  new.title       := btrim(regexp_replace(new.title,       '[<>]|[\x01-\x1f\x7f]', '', 'g'));
  new.street      := btrim(regexp_replace(new.street,      '[<>]|[\x01-\x1f\x7f]', '', 'g'));
  new.city        := btrim(regexp_replace(new.city,        '[<>]|[\x01-\x1f\x7f]', '', 'g'));
  new.state       := btrim(regexp_replace(new.state,       '[<>]|[\x01-\x1f\x7f]', '', 'g'));
  new.zip         := btrim(regexp_replace(new.zip,         '[<>]|[\x01-\x1f\x7f]', '', 'g'));
  new.description := btrim(regexp_replace(new.description, '[<>]|[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', 'g'));
  new.amenities := array(select c from (select btrim(regexp_replace(a, '[<>]|[\x01-\x1f\x7f]', '', 'g')) as c
                                        from unnest(new.amenities) a) t where c <> '');

  -- Photos must be objects that point at OUR storage bucket.
  if tg_op = 'INSERT' or new.images is distinct from old.images then
    if jsonb_typeof(new.images) <> 'array' then raise exception 'invalid_images'; end if;
    for el in select * from jsonb_array_elements(new.images) loop
      if jsonb_typeof(el) <> 'object'
         or coalesce(el->>'src', '') !~ '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/listing-images/'
         or char_length(coalesce(el->>'alt', '')) > 200 then
        raise exception 'invalid_images';
      end if;
    end loop;
  end if;
  return new;
end $$;

drop trigger if exists guard_property_trg on public.properties;
create trigger guard_property_trg before insert or update on public.properties
  for each row execute function public.guard_property();

-- 4. Server-side guards on profiles ---------------------------------------------------------------
create or replace function public.guard_profile() returns trigger
language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null then
    new.id := old.id; new.email := old.email; new.created_at := old.created_at;
    if not public.is_admin() then new.role := old.role; end if;
  end if;
  if old.role = 'admin' and new.role <> 'admin'
     and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'last_admin';
  end if;
  new.full_name := btrim(regexp_replace(new.full_name, '[<>]|[\x01-\x1f\x7f]', '', 'g'));
  new.phone     := btrim(regexp_replace(new.phone, '[^0-9+ -]', '', 'g'));
  new.bio       := btrim(regexp_replace(new.bio, '[<>]|[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', 'g'));
  return new;
end $$;

drop trigger if exists guard_profile_trg on public.profiles;
create trigger guard_profile_trg before update on public.profiles
  for each row execute function public.guard_profile();

-- 5. Secure error log (written by the site, readable by admins only) -----------------------------------
create table if not exists public.error_logs (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id    uuid default auth.uid() references auth.users(id) on delete set null,
  reference  text not null check (reference ~ '^[A-Z0-9]{5,12}$'),
  level      text not null check (level in ('error','warn','security')),
  code       text not null check (char_length(code) between 1 and 40),
  message    text not null default '' check (char_length(message) <= 300),
  route      text not null default '' check (char_length(route) <= 120)
);
create index if not exists error_logs_created_idx on public.error_logs (created_at desc);
alter table public.error_logs enable row level security;

drop policy if exists "Signed-in users add their own log entries" on public.error_logs;
create policy "Signed-in users add their own log entries" on public.error_logs
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "Admins read logs" on public.error_logs;
create policy "Admins read logs" on public.error_logs for select to authenticated using (public.is_admin());
drop policy if exists "Admins delete logs" on public.error_logs;
create policy "Admins delete logs" on public.error_logs for delete to authenticated using (public.is_admin());

revoke all on public.error_logs from anon, authenticated;
grant insert (reference, level, code, message, route) on public.error_logs to authenticated;
grant select, delete on public.error_logs to authenticated;

-- SECURITY DEFINER so the counter can see the user's own rows even though they cannot SELECT the table.
create or replace function public.throttle_error_logs() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.error_logs where user_id = auth.uid() and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'rate_limit';
  end if;
  return new;
end $$;
revoke execute on function public.throttle_error_logs() from public, anon, authenticated;
drop trigger if exists throttle_error_logs_trg on public.error_logs;
create trigger throttle_error_logs_trg before insert on public.error_logs
  for each row execute function public.throttle_error_logs();

-- 6. Storage: tighter upload rules (own folder, no sub-folders, image extensions only) ----------------
update storage.buckets
   set public = true, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp']
 where id = 'listing-images';

drop policy if exists "Users upload photos to their own folder" on storage.objects;
create policy "Users upload photos to their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-images'
              and (storage.foldername(name))[1] = auth.uid()::text
              and array_length(storage.foldername(name), 1) = 1
              and name ~* '\.(jpg|png|webp)$');
