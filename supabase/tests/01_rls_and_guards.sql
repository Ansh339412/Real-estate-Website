\set ON_ERROR_STOP off
\pset pager off
create or replace function pg_temp.ok(label text, sql text) returns void language plpgsql as $$
begin execute sql; raise notice 'PASS(ran)  %', label; exception when others then raise notice 'FAIL(err)  % -> %', label, sqlerrm; end $$;
create or replace function pg_temp.blocked(label text, sql text) returns void language plpgsql as $$
begin execute sql; raise notice 'FAIL(ran)  % (should have been blocked)', label; exception when others then raise notice 'PASS(blocked) % -> %', label, sqlerrm; end $$;
create or replace function pg_temp.eq(label text, got text, want text) returns void language plpgsql as $$
begin if got is not distinct from want then raise notice 'PASS  % = %', label, got; else raise notice 'FAIL  % got [%] want [%]', label, got, want; end if; end $$;

insert into auth.users (id,email,raw_user_meta_data) values
 ('aaaaaaaa-0000-0000-0000-000000000001','a@x.co','{"full_name":"Alice <b>Owner</b>","phone":"+91 98765 43210","bio":"hi"}'),
 ('bbbbbbbb-0000-0000-0000-000000000002','b@x.co','{"full_name":"Bob","role":"admin"}'),
 ('cccccccc-0000-0000-0000-000000000003','hakikatsingh099@gmail.com','{}');
select pg_temp.eq('signup metadata cannot set role', (select role from profiles where email='b@x.co'), 'user');
update profiles set role='admin' where lower(email)='hakikatsingh099@gmail.com';   -- SQL-editor style promotion (no auth.uid)
select pg_temp.eq('manual admin promotion works', (select role from profiles where email='hakikatsingh099@gmail.com'), 'admin');

-- ---- act as Alice
set role authenticated; select set_config('request.jwt.claim.sub','aaaaaaaa-0000-0000-0000-000000000001',false);
select pg_temp.ok('alice inserts listing (sanitised, own storage image)', $q$
 insert into properties (title,description,price,status,type,bedrooms,bathrooms,area_sqft,street,city,state,zip,images,amenities)
 values ('Nice <script>alert(1)</script> home','A lovely long description here',4850000,'for-sale','house',3,2,1500,'12 Main Road','Jalandhar','Punjab','144001',
 '[{"src":"https://abc.supabase.co/storage/v1/object/public/listing-images/aaaaaaaa-0000-0000-0000-000000000001/11111111-1111-1111-1111-111111111111.jpg","alt":"x"}]','{Garage,"<b>Pool</b>"," "}') $q$);
select pg_temp.eq('title sanitised', (select title from properties limit 1), 'Nice scriptalert(1)/script home');
select pg_temp.eq('amenities cleaned', (select amenities::text from properties limit 1), '{Garage,bPool/b}');
select pg_temp.blocked('external image URL rejected', $q$
 insert into properties (title,description,price,status,type,bedrooms,bathrooms,area_sqft,street,city,state,zip,images)
 values ('Tracker house','A lovely long description here',100,'for-sale','house',1,1,100,'12 Main Road','Jalandhar','Punjab','144001','[{"src":"https://evil.example/pixel.png","alt":"x"}]') $q$);
select pg_temp.blocked('5-digit PIN rejected', $q$
 insert into properties (title,description,price,status,type,bedrooms,bathrooms,area_sqft,street,city,state,zip,images)
 values ('Bad pin house','A lovely long description here',100,'for-sale','house',1,1,100,'12 Main Road','Jalandhar','Punjab','14400','[{"src":"https://abc.supabase.co/storage/v1/object/public/listing-images/x","alt":"x"}]') $q$);
update properties set owner_id='bbbbbbbb-0000-0000-0000-000000000002', featured=true;
select pg_temp.eq('owner_id + featured cannot be changed', (select owner_id::text||featured::text from properties limit 1), 'aaaaaaaa-0000-0000-0000-000000000001false');
update profiles set role='admin', full_name='Alice <i>A</i>' where id='aaaaaaaa-0000-0000-0000-000000000001';
select pg_temp.eq('role cannot self-escalate', (select role from profiles where id='aaaaaaaa-0000-0000-0000-000000000001'), 'user');
select pg_temp.eq('profile name sanitised', (select full_name from profiles where id='aaaaaaaa-0000-0000-0000-000000000001'), 'Alice iA/i');
select pg_temp.blocked('email column not updatable', $q$ update profiles set email='hakikatsingh099@gmail.com' where id='aaaaaaaa-0000-0000-0000-000000000001' $q$);
select pg_temp.eq('alice sees only her own profile', (select count(*)::text from profiles), '1');
select pg_temp.ok('alice writes an error log', $q$ insert into error_logs (reference,level,code,message,route) values ('ABCD2345','error','http_500','boom','#/x') $q$);
select pg_temp.eq('alice cannot read logs', (select count(*)::text from error_logs), '0');
select pg_temp.blocked('alice cannot forge log author', $q$ insert into error_logs (user_id,reference,level,code) values ('bbbbbbbb-0000-0000-0000-000000000002','ABCD2345','error','x') $q$);
do $$ declare i int; begin for i in 1..9 loop
 insert into properties (title,description,price,status,type,bedrooms,bathrooms,area_sqft,street,city,state,zip,images)
 values ('House number '||i,'A lovely long description here',100,'for-sale','house',1,1,100,'12 Main Road','Jalandhar','Punjab','144001',
 '[{"src":"https://abc.supabase.co/storage/v1/object/public/listing-images/a/b.jpg","alt":"x"}]'); end loop; end $$;
select pg_temp.blocked('11th listing in an hour is rate limited', $q$
 insert into properties (title,description,price,status,type,bedrooms,bathrooms,area_sqft,street,city,state,zip,images)
 values ('House eleven','A lovely long description here',100,'for-sale','house',1,1,100,'12 Main Road','Jalandhar','Punjab','144001',
 '[{"src":"https://abc.supabase.co/storage/v1/object/public/listing-images/a/b.jpg","alt":"x"}]') $q$);
select pg_temp.ok('alice uploads to own folder', $q$ insert into storage.objects (bucket_id,name) values ('listing-images','aaaaaaaa-0000-0000-0000-000000000001/p.jpg') $q$);
select pg_temp.blocked('upload to another user folder', $q$ insert into storage.objects (bucket_id,name) values ('listing-images','bbbbbbbb-0000-0000-0000-000000000002/p.jpg') $q$);
select pg_temp.blocked('upload into sub-folder', $q$ insert into storage.objects (bucket_id,name) values ('listing-images','aaaaaaaa-0000-0000-0000-000000000001/x/p.jpg') $q$);
select pg_temp.blocked('upload .exe', $q$ insert into storage.objects (bucket_id,name) values ('listing-images','aaaaaaaa-0000-0000-0000-000000000001/p.exe') $q$);
reset role;

-- ---- act as Bob (another signed-in user)
set role authenticated; select set_config('request.jwt.claim.sub','bbbbbbbb-0000-0000-0000-000000000002',false);
select pg_temp.eq('bob CAN read owner contact', (select full_name||'|'||phone||'|'||email from get_listing_contact((select id from properties where title like 'Nice%'))), 'Alice iA/i|+91 98765 43210|a@x.co');
select pg_temp.eq('bob cannot list other profiles', (select count(*)::text from profiles), '1');
delete from properties where owner_id='aaaaaaaa-0000-0000-0000-000000000001';
select pg_temp.eq('bob cannot delete alices listings', (select count(*)::text from properties), '10');
update properties set price=1;
select pg_temp.eq('bob cannot edit alices listings', (select count(*)::text from properties where price=1), '0');
update profiles set role='admin' where id='bbbbbbbb-0000-0000-0000-000000000002';
select pg_temp.eq('bob self-promotion is neutralised by the trigger', (select role from profiles where id='bbbbbbbb-0000-0000-0000-000000000002'), 'user');
reset role;
select pg_temp.eq('bob still user', (select role from profiles where email='b@x.co'), 'user');

-- ---- anonymous visitor
set role anon; select set_config('request.jwt.claim.sub','',false);
select pg_temp.eq('anon can browse listings', (select count(*)::text from properties), '10');
select pg_temp.blocked('anon cannot read profiles', $q$ select * from profiles $q$);
select pg_temp.blocked('anon cannot call contact function', $q$ select * from get_listing_contact((select id from properties limit 1)) $q$);
select pg_temp.blocked('anon cannot insert listing', $q$ insert into properties (title) values ('x') $q$);
select pg_temp.blocked('anon cannot call handle_new_user', $q$ select public.handle_new_user() $q$);
reset role;

-- ---- admin
set role authenticated; select set_config('request.jwt.claim.sub','cccccccc-0000-0000-0000-000000000003',false);
select pg_temp.eq('admin reads all profiles', (select count(*)::text from profiles), '3');
select pg_temp.eq('admin reads logs', (select count(*)::text from error_logs), '1');
update properties set featured=true where title='House number 1';
select pg_temp.eq('admin can feature a listing', (select count(*)::text from properties where featured), '1');
select pg_temp.blocked('cannot remove the last admin', $q$ update profiles set role='user' where id='cccccccc-0000-0000-0000-000000000003' $q$);
delete from properties where title='House number 2';
select pg_temp.eq('admin can delete any listing', (select count(*)::text from properties), '9');
reset role;
