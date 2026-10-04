-- Run AFTER 007. Adds 'commercial' as a property type (offices, shops, showrooms). Safe to re-run.
alter table public.properties drop constraint if exists properties_type_check;
alter table public.properties add constraint properties_type_check
  check (type in ('house','apartment','condo','villa','land','commercial'));
