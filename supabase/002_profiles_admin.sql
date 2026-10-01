-- Run AFTER schema.sql. Adds user profiles, an admin role, and admin moderation rights.

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text not null default '' check (char_length(full_name) <= 80),
  phone      text not null default '' check (char_length(phone) <= 20),
  bio        text not null default '' check (char_length(bio) <= 300),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  role       text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- SECURITY DEFINER helpers read profiles without triggering RLS recursion.
create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public
  as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.my_role() returns text
  language sql stable security definer set search_path = public
  as $$ select role from public.profiles where id = auth.uid() $$;

-- Every new account gets a profile automatically (always as a normal user).
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public
  as $$ begin
    insert into public.profiles (id, email) values (new.id, new.email);
    return new;
  end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles for accounts that already exist.
insert into public.profiles (id, email) select id, email from auth.users on conflict do nothing;

create policy "Read own profile, admins read all" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "Update own profile, role stays locked" on public.profiles
  for update to authenticated using (id = auth.uid())
  with check (id = auth.uid() and role = public.my_role());
create policy "Admins update any profile" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins update any listing" on public.properties
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins delete any listing" on public.properties
  for delete to authenticated using (public.is_admin());
