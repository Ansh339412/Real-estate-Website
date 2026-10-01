-- Run AFTER 002. Lets SIGNED-IN visitors see a listing owner's contact details, one listing at a time.
-- profiles stays private: there is still no way to list or browse other people's profiles.
create or replace function public.get_listing_contact(p_property_id uuid)
returns table (full_name text, phone text, email text, avatar_url text)
language sql stable security definer set search_path = public
as $$
  select pr.full_name, pr.phone, pr.email, pr.avatar_url
  from public.properties p
  join public.profiles pr on pr.id = p.owner_id
  where p.id = p_property_id
    and auth.uid() is not null;   -- anonymous visitors get nothing
$$;

revoke all on function public.get_listing_contact(uuid) from public, anon;
grant execute on function public.get_listing_contact(uuid) to authenticated;
