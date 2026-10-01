-- Run AFTER the admin account exists and its email is confirmed
-- (Supabase > Authentication > Users > Add user, with "Auto Confirm User" ticked).
-- Promotion is a deliberate manual step so nobody can gain admin by signing up with an email.
update public.profiles set role = 'admin' where lower(email) = 'hakikatsingh099@gmail.com';
