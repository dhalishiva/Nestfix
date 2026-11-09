-- Supabase Data API access is opt-in. No unauthenticated writes.
-- Using service_role for server-owned mutations is intentional; never expose its key to browsers.
do $$ declare t text; begin
 foreach t in array array[
  'cities','serviceable_pincodes','profiles','categories','subcategories','services','city_service_prices',
  'addresses','carts','cart_items','coupons','coupon_redemptions','pros','pro_documents',
  'pro_availability','pro_time_off','bookings','booking_items','booking_events','pro_offers',
  'slot_holds','payments','refunds','reviews','pro_earnings','payouts','notifications','support_tickets','settings'
 ] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on table public.%I from public, anon, authenticated',t);
  execute format('grant select on table public.%I to authenticated',t);
  execute format('create policy "admin_all" on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',t);
 end loop;
end $$;

-- Public catalog. Rows not active remain available to admins only.
grant select on public.cities, public.serviceable_pincodes,public.categories,public.subcategories,
 public.services,public.city_service_prices,public.coupons,public.reviews,public.settings to anon;
create policy cities_browse on public.cities for select to anon,authenticated using (is_active);
create policy pincodes_browse on public.serviceable_pincodes for select to anon,authenticated
 using (exists(select 1 from public.cities c where c.id=city_id and c.is_active));
create policy categories_browse on public.categories for select to anon,authenticated using(is_active);
create policy subcategories_browse on public.subcategories for select to anon,authenticated
 using(exists(select 1 from public.categories c where c.id=category_id and c.is_active));
create policy services_browse on public.services for select to anon,authenticated using(
 is_active and exists(select 1 from public.subcategories sc join public.categories c on c.id=sc.category_id where sc.id=subcategory_id and c.is_active)
);
create policy prices_browse on public.city_service_prices for select to anon,authenticated
 using(exists(select 1 from public.cities c where c.id=city_id and c.is_active)
  and exists(select 1 from public.services s where s.id=service_id and s.is_active));
create policy coupons_browse on public.coupons for select to anon,authenticated
 using(is_active and valid_from <= now() and valid_to >= now());
create policy reviews_public on public.reviews for select to anon,authenticated using(is_published);
create policy settings_public on public.settings for select to anon,authenticated using(is_public);

-- Catalog administration is only through server-verified/admin RLS.
grant insert,update,delete on public.cities,public.serviceable_pincodes,public.categories,
 public.subcategories,public.services,public.city_service_prices,public.coupons,public.settings to authenticated;

-- Profile: never grant direct UPDATE on role, phone, blocked flag, or ID.
grant update(name,avatar_url,city_id) on public.profiles to authenticated;
create policy profiles_self_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profiles_self_edit on public.profiles for update to authenticated
 using(id=(select auth.uid()) and not is_blocked)
 with check(id=(select auth.uid()) and not is_blocked);

-- Personal address book, including actual geocoordinates, is private.
grant insert,update,delete on public.addresses to authenticated;
create policy addresses_self_read on public.addresses for select to authenticated using(user_id=(select auth.uid()));
create policy addresses_self_insert on public.addresses for insert to authenticated with check(
 user_id=(select auth.uid()) and exists(select 1 from public.serviceable_pincodes s where s.city_id=addresses.city_id and s.pincode=addresses.pincode)
);
create policy addresses_self_update on public.addresses for update to authenticated
 using(user_id=(select auth.uid())) with check(user_id=(select auth.uid())
 and exists(select 1 from public.serviceable_pincodes s where s.city_id=addresses.city_id and s.pincode=addresses.pincode));
create policy addresses_self_delete on public.addresses for delete to authenticated using(user_id=(select auth.uid()));

-- Cart ownership via the parent relationship; guest cart lives in localStorage.
grant insert,update,delete on public.carts,public.cart_items to authenticated;
create policy carts_self_read on public.carts for select to authenticated using(user_id=(select auth.uid()));
create policy carts_self_insert on public.carts for insert to authenticated with check(user_id=(select auth.uid()));
create policy carts_self_update on public.carts for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy carts_self_delete on public.carts for delete to authenticated using(user_id=(select auth.uid()));
create policy cart_items_self_read on public.cart_items for select to authenticated using(
 exists(select 1 from public.carts c where c.id=cart_id and c.user_id=(select auth.uid())));
create policy cart_items_self_insert on public.cart_items for insert to authenticated with check(
 exists(select 1 from public.carts c where c.id=cart_id and c.user_id=(select auth.uid())));
create policy cart_items_self_update on public.cart_items for update to authenticated
 using(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=(select auth.uid())))
 with check(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=(select auth.uid())));
create policy cart_items_self_delete on public.cart_items for delete to authenticated using(
 exists(select 1 from public.carts c where c.id=cart_id and c.user_id=(select auth.uid())));

-- Pros: self read, public listing isn't permitted (phone/bank details must not leak).
-- Approval, skills, ratings, bank references and service radius are server-controlled.
grant update(is_online) on public.pros to authenticated;
create policy pros_self_read on public.pros for select to authenticated using(id=(select auth.uid()));
create policy pros_self_online on public.pros for update to authenticated
 using(id=(select auth.uid()) and status='active') with check(id=(select auth.uid()) and status='active');
grant insert on public.pro_documents to authenticated;
create policy pro_documents_self_read on public.pro_documents for select to authenticated using(pro_id=(select auth.uid()));
create policy pro_documents_self_insert on public.pro_documents for insert to authenticated
 with check(pro_id=(select auth.uid()) and status='pending');
grant insert,update,delete on public.pro_availability,public.pro_time_off to authenticated;
create policy pro_availability_self_read on public.pro_availability for select to authenticated using(pro_id=(select auth.uid()));
create policy pro_availability_self_insert on public.pro_availability for insert to authenticated with check(pro_id=(select auth.uid()));
create policy pro_availability_self_update on public.pro_availability for update to authenticated using(pro_id=(select auth.uid())) with check(pro_id=(select auth.uid()));
create policy pro_availability_self_delete on public.pro_availability for delete to authenticated using(pro_id=(select auth.uid()));
create policy pro_time_off_self_read on public.pro_time_off for select to authenticated using(pro_id=(select auth.uid()));
create policy pro_time_off_self_insert on public.pro_time_off for insert to authenticated with check(pro_id=(select auth.uid()));
create policy pro_time_off_self_update on public.pro_time_off for update to authenticated using(pro_id=(select auth.uid())) with check(pro_id=(select auth.uid()));
create policy pro_time_off_self_delete on public.pro_time_off for delete to authenticated using(pro_id=(select auth.uid()));

-- Customer sees own bookings. Pro sees booking/address snapshot ONLY while actually assigned
-- and active (not when merely offered, and not after completed/cancelled).
-- Raw customer phone is in profiles, inaccessible to pros: future masked-call route mediates contact.
create policy bookings_customer_read on public.bookings for select to authenticated using(user_id=(select auth.uid()));
create policy bookings_pro_active_read on public.bookings for select to authenticated using(
 pro_id=(select auth.uid()) and status in ('pro_assigned','en_route','in_progress'));
create policy booking_items_customer_read on public.booking_items for select to authenticated using(
 exists(select 1 from public.bookings b where b.id=booking_id and b.user_id=(select auth.uid())));
create policy booking_items_pro_active_read on public.booking_items for select to authenticated using(
 exists(select 1 from public.bookings b where b.id=booking_id and b.pro_id=(select auth.uid())
 and b.status in ('pro_assigned','en_route','in_progress')));
create policy booking_events_customer_read on public.booking_events for select to authenticated using(
 exists(select 1 from public.bookings b where b.id=booking_id and b.user_id=(select auth.uid())));
create policy booking_events_pro_active_read on public.booking_events for select to authenticated using(
 exists(select 1 from public.bookings b where b.id=booking_id and b.pro_id=(select auth.uid())
 and b.status in ('pro_assigned','en_route','in_progress')));
create policy offers_pro_read on public.pro_offers for select to authenticated using(pro_id=(select auth.uid()));
create policy slot_holds_owner_read on public.slot_holds for select to authenticated using(user_id=(select auth.uid()));
create policy coupon_redemptions_owner_read on public.coupon_redemptions for select to authenticated using(user_id=(select auth.uid()));
create policy payments_customer_read on public.payments for select to authenticated using(
 exists(select 1 from public.bookings b where b.id=booking_id and b.user_id=(select auth.uid())));
create policy refunds_customer_read on public.refunds for select to authenticated using(
 exists(select 1 from public.payments p join public.bookings b on b.id=p.booking_id
  where p.id=refunds.payment_id and b.user_id=(select auth.uid())));
-- No client writes to booking/payment/offer/hold/event/redemption tables. Use validated server actions.

-- Reviews may be posted/edited by the actual booking customer only after completed status.
grant insert on public.reviews to authenticated;
grant update(rating,tags,comment) on public.reviews to authenticated;
create policy reviews_owner_read on public.reviews for select to authenticated using(user_id=(select auth.uid()));
create policy reviews_owner_insert on public.reviews for insert to authenticated with check(
 user_id=(select auth.uid()) and exists(select 1 from public.bookings b
 where b.id=reviews.booking_id and b.user_id=(select auth.uid()) and b.pro_id=reviews.pro_id and b.status='completed'));
create policy reviews_owner_edit on public.reviews for update to authenticated
 using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy earnings_pro_read on public.pro_earnings for select to authenticated using(pro_id=(select auth.uid()));
create policy payouts_pro_read on public.payouts for select to authenticated using(pro_id=(select auth.uid()));

-- Notifications are server-written; customer/pro can mark theirs as read, not forge content.
grant update(read_at) on public.notifications to authenticated;
create policy notifications_owner_read on public.notifications for select to authenticated using(user_id=(select auth.uid()));
create policy notifications_owner_mark_read on public.notifications for update to authenticated
 using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
-- Tickets are append-only to customers. Admin writes notes and status.
grant insert on public.support_tickets to authenticated;
create policy tickets_owner_read on public.support_tickets for select to authenticated using(user_id=(select auth.uid()));
create policy tickets_owner_insert on public.support_tickets for insert to authenticated with check(
 user_id=(select auth.uid()) and
 (booking_id is null or exists(select 1 from public.bookings b where b.id=booking_id and b.user_id=(select auth.uid())))
);

-- Keep storage for identity documents private and require per-pro folder prefix.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('pro-documents','pro-documents',false,10485760,array['image/jpeg','image/png','application/pdf'])
on conflict (id) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('service-images','service-images',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "pro_document_insert" on storage.objects for insert to authenticated with check(
 bucket_id='pro-documents' and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.pros p where p.id=(select auth.uid())));
create policy "pro_document_select" on storage.objects for select to authenticated using(
 bucket_id='pro-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "admin_storage_all" on storage.objects for all to authenticated
 using((select private.is_admin()) and bucket_id in ('pro-documents','service-images'))
 with check((select private.is_admin()) and bucket_id in ('pro-documents','service-images'));

-- Only the intended public tables are exposed to anon; service_role bypasses RLS server-side.
