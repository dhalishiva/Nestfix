-- Runs under `supabase test db` with pgTAP available in local Supabase.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select plan(12);

select has_table('public','profiles','profiles exists');
select has_table('public','bookings','bookings exists');
select has_table('public','slot_holds','slot holds exist');
select has_table('public','pro_offers','pro job offers exist');
select has_table('public','settings','config exists');
select is((select count(*)::int from pg_tables where schemaname='public' and tablename in
  ('profiles','cities','serviceable_pincodes','categories','subcategories','services','city_service_prices',
   'addresses','carts','cart_items','coupons','coupon_redemptions','pros','pro_documents',
   'pro_availability','pro_time_off','bookings','booking_items','booking_events','payments','refunds',
   'reviews','pro_earnings','payouts','notifications','support_tickets','settings','slot_holds','pro_offers')),
   29,'all 29 application tables exist');
select ok((select bool_and(rowsecurity) from pg_tables where schemaname='public'
   and tablename in ('profiles','cities','serviceable_pincodes','categories','subcategories',
    'services','city_service_prices','addresses','carts','cart_items','coupons','coupon_redemptions',
    'pros','pro_documents','pro_availability','pro_time_off','bookings','booking_items',
    'booking_events','payments','refunds','reviews','pro_earnings','payouts','notifications',
    'support_tickets','settings','slot_holds','pro_offers')),'all application tables have RLS');
select ok((select count(*)=29 from (select tablename from pg_policies where schemaname='public'
  group by tablename) p),'all 29 tables have policies');
select is((select count(*)::int from public.cities),5,'five cities seeded');
select is((select count(*)::int from public.categories),11,'eleven categories seeded');
select ok((select count(*)>=35 from public.services),'at least 35 services seeded');
select ok((select count(*)=3 from public.coupons),'three coupons seeded');
select * from finish();
rollback;
