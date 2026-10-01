-- Run once in Supabase: SQL Editor > New query > paste > Run.
create extension if not exists pgcrypto;

create table public.properties (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references auth.users(id) on delete set null default auth.uid(),
  title       text not null check (char_length(title) between 5 and 100),
  description text not null check (char_length(description) between 20 and 2000),
  price       numeric(12,2) not null check (price > 0),
  status      text not null check (status in ('for-sale','for-rent')),
  type        text not null check (type in ('house','apartment','condo','villa','land')),
  bedrooms    int  not null check (bedrooms between 0 and 20),
  bathrooms   numeric(3,1) not null check (bathrooms between 0 and 20),
  area_sqft   int  not null check (area_sqft > 0),
  street      text not null,
  city        text not null,
  state       text not null,
  zip         text not null,
  images      jsonb not null default '[]'
              check (jsonb_typeof(images) = 'array' and jsonb_array_length(images) between 1 and 8),
  amenities   text[] not null default '{}',
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index properties_owner_idx on public.properties (owner_id);
create index properties_city_idx  on public.properties (lower(city));
create index properties_price_idx on public.properties (price);

create table public.favorites (
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, property_id)
);

-- Row Level Security: the database itself enforces who can do what.
alter table public.properties enable row level security;
alter table public.favorites  enable row level security;

create policy "Anyone can read listings" on public.properties
  for select using (true);
create policy "Signed-in users create their own listings" on public.properties
  for insert to authenticated with check (owner_id = auth.uid() and featured = false);
create policy "Owners update their listings" on public.properties
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid() and featured = false);
create policy "Owners delete their listings" on public.properties
  for delete to authenticated using (owner_id = auth.uid());

create policy "Users read their favorites"   on public.favorites for select to authenticated using (user_id = auth.uid());
create policy "Users add their favorites"    on public.favorites for insert to authenticated with check (user_id = auth.uid());
create policy "Users remove their favorites" on public.favorites for delete to authenticated using (user_id = auth.uid());
