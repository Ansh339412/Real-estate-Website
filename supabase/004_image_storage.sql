-- Run AFTER 002_profiles_admin.sql. Creates the public photo bucket and its access rules.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "Anyone can view listing photos" on storage.objects
  for select using (bucket_id = 'listing-images');

-- Files must live in a folder named after the uploader's user id.
create policy "Users upload photos to their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete their own photos, admins delete any" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-images' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
