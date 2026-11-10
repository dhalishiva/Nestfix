-- Nestfix business logic. Prices, slots and bookings are always computed here, never trusted from the client.

-- ---------- time helpers (all scheduling happens in India time) ----------
create or replace function private.ist_now() returns timestamp
language sql stable set search_path = '' as $$ select (now() at time zone 'Asia/Kolkata') $$;

-- Returns null when the slot is bookable, otherwise a reason code.
create or replace function private.slot_problem(p_date date, p_time time, p_span int) returns text
language plpgsql stable set search_path = '' as $$
declare v_today date := (private.ist_now())::date;
begin
  if p_date is null or p_time is null then return 'invalid'; end if;
  if p_date < v_today or p_date > v_today + 6 then return 'out_of_range'; end if;
  if extract(minute from p_time) <> 0 or extract(second from p_time) <> 0
     or extract(hour from p_time) < 8 or extract(hour from p_time) > 19 then return 'invalid'; end if;
  if (p_date + p_time) < private.ist_now() + interval '90 minutes' then return 'too_soon'; end if;
  if extract(hour from p_time) + p_span > 21 then return 'too_late'; end if;
  return null;
end $$;

create or replace function private.slot_message(p_code text, p_span int) returns text
language sql immutable set search_path = '' as $$
  select case p_code
    when 'out_of_range' then 'Pick a date within the next 7 days.'
    when 'invalid' then 'Pick one of the listed time slots.'
    when 'too_soon' then 'That slot is too soon. Pick a time at least 90 minutes from now.'
    when 'too_late' then 'This booking takes about ' || p_span || ' hours and would run past 9 PM. Pick an earlier slot.'
    when 'no_pro' then 'No single professional in your city offers all of these services. Book them separately.'
    when 'full' then 'That time slot was just taken. Please pick another.'
    else 'That slot is not available.' end
$$;

-- Best free professional for a job, or null.
create or replace function private.pick_pro(
  p_city text, p_cats text[], p_date date, p_time time, p_span int,
  p_exclude_booking uuid default null, p_prefer uuid default null
) returns uuid
language sql stable security definer set search_path = '' as $$
  select p.id
  from public.pros p
  where p.is_active and p.city_id = p_city and p.skills @> p_cats
    and not exists (
      select 1 from public.bookings b
      where b.pro_id = p.id and b.status <> 'cancelled' and b.scheduled_date = p_date
        and (p_exclude_booking is null or b.id <> p_exclude_booking)
        and b.slot_time < p_time + make_interval(hours => p_span)
        and p_time < b.slot_time + make_interval(hours => b.span_hours))
  order by (p.id is not distinct from p_prefer) desc,
           p.rating desc,
           (select count(*) from public.bookings b2 where b2.pro_id = p.id and b2.scheduled_date = p_date and b2.status <> 'cancelled'),
           random()
  limit 1
$$;

-- ---------- pricing ----------
create or replace function public.price_cart(p_items jsonb, p_coupon text default null)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_lines jsonb; v_item int; v_mrp int; v_dur int; v_count int;
  v_first boolean; v_coupons jsonb := '[]'::jsonb; v_applied jsonb := null;
  v_code text := nullif(upper(trim(coalesce(p_coupon, ''))), '');
  v_disc int := 0; v_fee int; c record; v_ok boolean; v_amt int; v_reason text;
begin
  with req as (
    select e ->> 'id' as id, least(20, sum(greatest(1, coalesce((e ->> 'qty')::int, 1)))) as qty
    from jsonb_array_elements(case when jsonb_typeof(p_items) = 'array' then p_items else '[]'::jsonb end) e
    group by 1
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', s.id, 'name', s.name, 'category_id', s.category_id, 'qty', r.qty,
           'price', s.price, 'mrp', greatest(s.mrp, s.price), 'duration_min', s.duration_min)
           order by s.category_id, s.sort), '[]'::jsonb),
         coalesce(sum(s.price * r.qty), 0), coalesce(sum(greatest(s.mrp, s.price) * r.qty), 0),
         coalesce(sum(s.duration_min * r.qty), 0), coalesce(sum(r.qty), 0)
    into v_lines, v_item, v_mrp, v_dur, v_count
  from req r join public.services s on s.id = r.id and s.is_active;

  v_first := auth.uid() is null or not exists (
    select 1 from public.bookings where user_id = auth.uid() and status <> 'cancelled');

  for c in select * from public.coupons where is_active order by sort, code loop
    v_amt := case when c.kind = 'flat' then c.value
                  else least(coalesce(c.max_discount, 2147483647), (v_item * c.value) / 100) end;
    v_amt := least(v_amt, v_item);
    v_ok := true; v_reason := null;
    if v_item = 0 then v_ok := false; v_reason := 'empty';
    elsif c.first_order_only and not v_first then v_ok := false; v_reason := 'first_order';
    elsif v_item < c.min_order then v_ok := false; v_reason := 'min_order';
    end if;
    v_coupons := v_coupons || jsonb_build_object(
      'code', c.code, 'title', c.title, 'description', c.description, 'ok', v_ok,
      'amount', case when v_ok then v_amt else 0 end, 'reason', v_reason,
      'need', greatest(0, c.min_order - v_item));
    if c.code = v_code then
      v_applied := jsonb_build_object('code', c.code, 'ok', v_ok, 'amount', case when v_ok then v_amt else 0 end,
                                      'reason', v_reason, 'need', greatest(0, c.min_order - v_item));
      if v_ok then v_disc := v_amt; end if;
    end if;
  end loop;
  if v_code is not null and v_applied is null then
    v_applied := jsonb_build_object('code', v_code, 'ok', false, 'amount', 0, 'reason', 'invalid', 'need', 0);
  end if;

  v_fee := case when v_item > 0 and v_item < 999 then 49 else 0 end;

  return jsonb_build_object(
    'lines', v_lines, 'count', v_count, 'item_total', v_item, 'mrp_total', v_mrp,
    'discount', v_disc, 'visit_fee', v_fee, 'free_visit_at', 999,
    'total', v_item - v_disc + v_fee, 'duration_min', v_dur,
    'span_hours', greatest(1, ceil(v_dur / 60.0)::int),
    'categories', coalesce((select jsonb_agg(distinct x ->> 'category_id') from jsonb_array_elements(v_lines) x), '[]'::jsonb),
    'coupon', v_applied, 'coupons', v_coupons, 'first_order', v_first);
end $$;

-- ---------- slots ----------
create or replace function public.available_slots(p_city text, p_date date, p_items jsonb)
returns table (slot_time time, available boolean, reason text)
language plpgsql stable security definer set search_path = '' as $$
declare v_cats text[]; v_dur int; v_span int; v_any boolean; h int; v_t time; v_prob text;
begin
  select array_agg(distinct s.category_id), coalesce(sum(s.duration_min * greatest(1, coalesce((e ->> 'qty')::int, 1))), 60)
    into v_cats, v_dur
  from jsonb_array_elements(case when jsonb_typeof(p_items) = 'array' then p_items else '[]'::jsonb end) e
  join public.services s on s.id = e ->> 'id' and s.is_active;
  v_cats := coalesce(v_cats, '{}');
  v_span := greatest(1, ceil(v_dur / 60.0)::int);
  v_any := exists (select 1 from public.pros p where p.is_active and p.city_id = p_city and p.skills @> v_cats);

  for h in 8..19 loop
    v_t := make_time(h, 0, 0);
    v_prob := private.slot_problem(p_date, v_t, v_span);
    if v_prob is null and not v_any then v_prob := 'no_pro'; end if;
    if v_prob is null and private.pick_pro(p_city, v_cats, p_date, v_t, v_span) is null then v_prob := 'full'; end if;
    slot_time := v_t; available := v_prob is null; reason := v_prob;
    return next;
  end loop;
end $$;

-- ---------- customer actions ----------
create or replace function public.create_booking(
  p_items jsonb, p_address_id uuid, p_date date, p_time time, p_coupon text, p_payment text
) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid(); v_addr public.addresses; v_q jsonb; v_cats text[]; v_span int;
  v_prob text; v_pro uuid; v_pro_name text; v_code text; v_id uuid; v_email text; v_name text;
begin
  if v_uid is null then raise exception 'Please log in to book.'; end if;
  if p_payment is null or p_payment not in ('upi', 'card', 'cash') then raise exception 'Choose a payment method.'; end if;
  select * into v_addr from public.addresses where id = p_address_id and user_id = v_uid;
  if not found then raise exception 'Add an address before booking.'; end if;

  v_q := public.price_cart(p_items, p_coupon);
  if (v_q ->> 'count')::int = 0 then raise exception 'Your cart is empty.'; end if;
  if nullif(trim(coalesce(p_coupon, '')), '') is not null and not coalesce((v_q -> 'coupon' ->> 'ok')::boolean, false) then
    raise exception 'The coupon % can no longer be applied. Remove it and try again.', upper(trim(p_coupon));
  end if;

  select array_agg(distinct x ->> 'category_id') into v_cats from jsonb_array_elements(v_q -> 'lines') x;
  v_span := (v_q ->> 'span_hours')::int;
  v_prob := private.slot_problem(p_date, p_time, v_span);
  if v_prob is not null then raise exception '%', private.slot_message(v_prob, v_span); end if;

  -- one booking at a time per city and day, so two customers can't take the same last professional
  perform pg_advisory_xact_lock(hashtext(v_addr.city_id || p_date::text));
  if not exists (select 1 from public.pros p where p.is_active and p.city_id = v_addr.city_id and p.skills @> v_cats) then
    raise exception '%', private.slot_message('no_pro', v_span);
  end if;
  v_pro := private.pick_pro(v_addr.city_id, v_cats, p_date, p_time, v_span);
  if v_pro is null then raise exception '%', private.slot_message('full', v_span); end if;
  select name into v_pro_name from public.pros where id = v_pro;

  loop
    v_code := 'NF' || lpad(floor(random() * 1000000)::int::text, 6, '0');
    exit when not exists (select 1 from public.bookings where code = v_code);
  end loop;
  select email into v_email from auth.users where id = v_uid;
  select full_name into v_name from public.profiles where id = v_uid;

  insert into public.bookings (
    code, user_id, customer_name, customer_email, status, scheduled_date, slot_time, span_hours, city_id, address,
    item_total, mrp_total, discount, visit_fee, total, coupon_code, payment_method, payment_status, pro_id, start_pin)
  values (
    v_code, v_uid, coalesce(v_name, ''), coalesce(v_email, ''), 'pro_assigned', p_date, p_time, v_span, v_addr.city_id,
    jsonb_build_object('label', v_addr.label, 'house', v_addr.house, 'area', v_addr.area, 'landmark', v_addr.landmark,
                       'pincode', v_addr.pincode, 'city', (select name from public.cities where id = v_addr.city_id)),
    (v_q ->> 'item_total')::int, (v_q ->> 'mrp_total')::int, (v_q ->> 'discount')::int, (v_q ->> 'visit_fee')::int,
    (v_q ->> 'total')::int, case when (v_q ->> 'discount')::int > 0 then v_q -> 'coupon' ->> 'code' end,
    p_payment, case when p_payment = 'cash' then 'pending' else 'paid' end, v_pro,
    lpad(floor(1000 + random() * 9000)::int::text, 4, '0'))
  returning id into v_id;

  insert into public.booking_items (booking_id, service_id, name, unit_price, unit_mrp, qty, duration_min)
  select v_id, x ->> 'id', x ->> 'name', (x ->> 'price')::int, (x ->> 'mrp')::int, (x ->> 'qty')::int, (x ->> 'duration_min')::int
  from jsonb_array_elements(v_q -> 'lines') x;

  insert into public.booking_events (booking_id, status, note, actor) values
    (v_id, 'confirmed', case when p_payment = 'cash' then 'Booking placed. Pay after the service.' else 'Booking placed and paid.' end, v_uid),
    (v_id, 'pro_assigned', v_pro_name || ' will do this job.', null);

  return jsonb_build_object('id', v_id, 'code', v_code);
end $$;

create or replace function public.cancel_booking(p_id uuid, p_reason text)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare b public.bookings; v_late boolean; v_fee int := 0; v_refund int := 0; v_ps text;
begin
  select * into b from public.bookings where id = p_id and user_id = auth.uid() for update;
  if not found then raise exception 'Booking not found.'; end if;
  if b.status not in ('confirmed', 'pro_assigned', 'en_route') then raise exception 'This booking can no longer be cancelled.'; end if;
  if nullif(trim(coalesce(p_reason, '')), '') is null then raise exception 'Tell us why you are cancelling.'; end if;

  v_late := (b.scheduled_date + b.slot_time) - private.ist_now() < interval '3 hours';
  if b.payment_status = 'paid' then
    v_fee := case when v_late then least(100, b.total) else 0 end;
    v_refund := b.total - v_fee;
    v_ps := case when v_fee > 0 then 'partially_refunded' else 'refunded' end;
  else
    v_ps := 'void';
  end if;

  update public.bookings set status = 'cancelled', cancel_reason = left(trim(p_reason), 200),
    cancel_fee = v_fee, refund_amount = v_refund, payment_status = v_ps
  where id = p_id;
  insert into public.booking_events (booking_id, status, note, actor)
  values (p_id, 'cancelled', 'Cancelled by customer: ' || left(trim(p_reason), 200)
          || case when v_refund > 0 then '. Refund of ₹' || v_refund || ' started.' else '.' end, auth.uid());
  return jsonb_build_object('refund', v_refund, 'fee', v_fee);
end $$;

create or replace function public.reschedule_booking(p_id uuid, p_date date, p_time time)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare b public.bookings; v_cats text[]; v_prob text; v_pro uuid; v_name text;
begin
  select * into b from public.bookings where id = p_id and user_id = auth.uid() for update;
  if not found then raise exception 'Booking not found.'; end if;
  if b.status not in ('confirmed', 'pro_assigned') then raise exception 'This booking can no longer be rescheduled.'; end if;
  if (b.scheduled_date + b.slot_time) - private.ist_now() < interval '3 hours' then
    raise exception 'Rescheduling closes 3 hours before the slot. You can still cancel.';
  end if;
  if p_date = b.scheduled_date and p_time = b.slot_time then raise exception 'Pick a different time.'; end if;
  v_prob := private.slot_problem(p_date, p_time, b.span_hours);
  if v_prob is not null then raise exception '%', private.slot_message(v_prob, b.span_hours); end if;

  perform pg_advisory_xact_lock(hashtext(b.city_id || p_date::text));
  select array_agg(distinct s.category_id) into v_cats
  from public.booking_items i join public.services s on s.id = i.service_id where i.booking_id = p_id;
  v_pro := private.pick_pro(b.city_id, v_cats, p_date, p_time, b.span_hours, p_id, b.pro_id);
  if v_pro is null then raise exception '%', private.slot_message('full', b.span_hours); end if;
  select name into v_name from public.pros where id = v_pro;

  update public.bookings set scheduled_date = p_date, slot_time = p_time, pro_id = v_pro, status = 'pro_assigned' where id = p_id;
  insert into public.booking_events (booking_id, status, note, actor)
  values (p_id, 'rescheduled',
          'Moved to ' || to_char(p_date + p_time, 'Dy DD Mon, HH12:MI AM')
          || case when v_pro is distinct from b.pro_id then '. Now with ' || v_name || '.' else '.' end, auth.uid());
  return jsonb_build_object('pro_changed', v_pro is distinct from b.pro_id);
end $$;

create or replace function public.rate_booking(p_id uuid, p_rating int, p_tags text[], p_comment text)
returns void
language plpgsql volatile security definer set search_path = '' as $$
declare b public.bookings;
begin
  select * into b from public.bookings where id = p_id and user_id = auth.uid() for update;
  if not found then raise exception 'Booking not found.'; end if;
  if b.status <> 'completed' then raise exception 'You can rate a service after it is completed.'; end if;
  if b.rating is not null then raise exception 'You have already rated this service.'; end if;
  if p_rating is null or p_rating not between 1 and 5 then raise exception 'Pick a rating from 1 to 5 stars.'; end if;

  update public.bookings set rating = p_rating, review_tags = (coalesce(p_tags, '{}'))[1:6],
    review_comment = nullif(left(trim(coalesce(p_comment, '')), 500), ''), rated_at = now()
  where id = p_id;
  if b.pro_id is not null then
    update public.pros set rating = round(((rating * ratings_count) + p_rating) / (ratings_count + 1.0), 1),
      ratings_count = ratings_count + 1 where id = b.pro_id;
  end if;
  insert into public.booking_events (booking_id, status, note, actor)
  values (p_id, 'rated', 'Rated ' || p_rating || ' out of 5.', auth.uid());
end $$;

-- ---------- admin actions ----------
create or replace function public.admin_update_status(p_id uuid, p_status text, p_pin text default null)
returns void
language plpgsql volatile security definer set search_path = '' as $$
declare b public.bookings; v_ok boolean; v_note text;
begin
  if not private.is_admin() then raise exception 'Only admins can do this.'; end if;
  select * into b from public.bookings where id = p_id for update;
  if not found then raise exception 'Booking not found.'; end if;

  v_ok := case
    when p_status = 'en_route' then b.status = 'pro_assigned'
    when p_status = 'in_progress' then b.status in ('pro_assigned', 'en_route')
    when p_status = 'completed' then b.status = 'in_progress'
    when p_status = 'cancelled' then b.status in ('confirmed', 'pro_assigned', 'en_route')
    else false end;
  if not v_ok then raise exception 'A booking that is % cannot move to %.', replace(b.status, '_', ' '), replace(p_status, '_', ' '); end if;
  if b.pro_id is null and p_status <> 'cancelled' then raise exception 'Assign a professional first.'; end if;
  if p_status = 'in_progress' and coalesce(p_pin, '') <> b.start_pin then
    raise exception 'The start PIN does not match. Ask the customer for the 4-digit PIN.';
  end if;

  if p_status = 'completed' then
    update public.bookings set status = 'completed', payment_status = case when payment_status = 'pending' then 'paid' else payment_status end where id = p_id;
    update public.pros set jobs_done = jobs_done + 1 where id = b.pro_id;
    v_note := case when b.payment_status = 'pending' then 'Service completed. ₹' || b.total || ' collected.' else 'Service completed.' end;
  elsif p_status = 'cancelled' then
    update public.bookings set status = 'cancelled', cancel_reason = 'Cancelled by Nestfix',
      refund_amount = case when payment_status = 'paid' then total else 0 end,
      payment_status = case when payment_status = 'paid' then 'refunded' else 'void' end where id = p_id;
    v_note := case when b.payment_status = 'paid' then 'Cancelled by Nestfix. Full refund of ₹' || b.total || ' started.' else 'Cancelled by Nestfix.' end;
  else
    update public.bookings set status = p_status where id = p_id;
    v_note := case p_status when 'en_route' then 'Professional is on the way.' else 'Work started after PIN check.' end;
  end if;
  insert into public.booking_events (booking_id, status, note, actor) values (p_id, p_status, v_note, auth.uid());
end $$;

create or replace function public.admin_eligible_pros(p_id uuid)
returns table (id uuid, name text, rating numeric, jobs_done int, is_free boolean)
language plpgsql stable security definer set search_path = '' as $$
declare b public.bookings; v_cats text[];
begin
  if not private.is_admin() then raise exception 'Only admins can do this.'; end if;
  select * into b from public.bookings where bookings.id = p_id;
  select array_agg(distinct s.category_id) into v_cats
  from public.booking_items i join public.services s on s.id = i.service_id where i.booking_id = p_id;
  return query
    select p.id, p.name, p.rating, p.jobs_done,
      not exists (select 1 from public.bookings x where x.pro_id = p.id and x.id <> p_id and x.status <> 'cancelled'
                  and x.scheduled_date = b.scheduled_date
                  and x.slot_time < b.slot_time + make_interval(hours => b.span_hours)
                  and b.slot_time < x.slot_time + make_interval(hours => x.span_hours))
    from public.pros p
    where p.is_active and p.city_id = b.city_id and p.skills @> v_cats
    order by 5 desc, p.rating desc;
end $$;

create or replace function public.admin_assign_pro(p_id uuid, p_pro uuid)
returns void
language plpgsql volatile security definer set search_path = '' as $$
declare b public.bookings; v_free boolean; v_name text;
begin
  if not private.is_admin() then raise exception 'Only admins can do this.'; end if;
  select * into b from public.bookings where id = p_id for update;
  if not found then raise exception 'Booking not found.'; end if;
  if b.status not in ('confirmed', 'pro_assigned') then raise exception 'You can only reassign before the professional leaves.'; end if;
  select e.is_free, e.name into v_free, v_name from public.admin_eligible_pros(p_id) e where e.id = p_pro;
  if v_name is null then raise exception 'This professional does not offer these services in this city.'; end if;
  if not v_free then raise exception '% already has a job at this time.', v_name; end if;
  update public.bookings set pro_id = p_pro, status = 'pro_assigned' where id = p_id;
  insert into public.booking_events (booking_id, status, note, actor) values (p_id, 'pro_assigned', v_name || ' will do this job.', auth.uid());
end $$;

-- ---------- permissions ----------
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

revoke execute on function public.price_cart(jsonb, text) from public;
revoke execute on function public.available_slots(text, date, jsonb) from public;
revoke execute on function public.create_booking(jsonb, uuid, date, time, text, text) from public, anon;
revoke execute on function public.cancel_booking(uuid, text) from public, anon;
revoke execute on function public.reschedule_booking(uuid, date, time) from public, anon;
revoke execute on function public.rate_booking(uuid, int, text[], text) from public, anon;
revoke execute on function public.admin_update_status(uuid, text, text) from public, anon;
revoke execute on function public.admin_eligible_pros(uuid) from public, anon;
revoke execute on function public.admin_assign_pro(uuid, uuid) from public, anon;

grant execute on function public.price_cart(jsonb, text) to anon, authenticated;
grant execute on function public.available_slots(text, date, jsonb) to anon, authenticated;
grant execute on function public.create_booking(jsonb, uuid, date, time, text, text) to authenticated;
grant execute on function public.cancel_booking(uuid, text) to authenticated;
grant execute on function public.reschedule_booking(uuid, date, time) to authenticated;
grant execute on function public.rate_booking(uuid, int, text[], text) to authenticated;
grant execute on function public.admin_update_status(uuid, text, text) to authenticated;
grant execute on function public.admin_eligible_pros(uuid) to authenticated;
grant execute on function public.admin_assign_pro(uuid, uuid) to authenticated;
