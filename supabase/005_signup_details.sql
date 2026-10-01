-- Run AFTER 002_profiles_admin.sql. The sign-up form now sends name, phone and bio;
-- this copies them into the new user's profile. The role is NEVER read from user input.
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public
  as $$ begin
    insert into public.profiles (id, email, full_name, phone, bio)
    values (
      new.id,
      new.email,
      left(coalesce(trim(new.raw_user_meta_data ->> 'full_name'), ''), 80),
      left(coalesce(trim(new.raw_user_meta_data ->> 'phone'), ''), 20),
      left(coalesce(trim(new.raw_user_meta_data ->> 'bio'), ''), 300)
    );
    return new;
  end $$;
