-- Verify no public write path to bookings/payments and no direct self-promotion privilege.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(9);
select ok(not has_table_privilege('anon','public.bookings','INSERT'),'anon cannot create bookings');
select ok(not has_table_privilege('authenticated','public.bookings','INSERT'),'customer cannot bypass booking workflow');
select ok(not has_table_privilege('authenticated','public.payments','UPDATE'),'customer cannot forge payment capture');
select ok(not has_table_privilege('authenticated','public.bookings','UPDATE'),'customer cannot forge booking status');
select ok(not has_column_privilege('authenticated','public.profiles','role','UPDATE'),'cannot self-promote');
select ok(not has_column_privilege('authenticated','public.profiles','phone','UPDATE'),'cannot change verified phone');
select ok(has_column_privilege('authenticated','public.profiles','name','UPDATE'),'can change display name');
select ok(not has_table_privilege('anon','public.pro_documents','SELECT'),'pro docs private');
select ok(not has_table_privilege('anon','public.profiles','SELECT'),'profile phone private');
select * from finish();
rollback;
