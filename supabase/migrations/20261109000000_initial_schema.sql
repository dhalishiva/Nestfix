-- Nestfix phase 1: schema, checks, indexes and lifecycle audit storage.
-- Postgres 15+; all timestamps are timestamptz. Slots are local Asia/Kolkata dates/times.
create schema if not exists private;
create extension if not exists pg_trgm with schema extensions;

create type public.profile_role as enum ('customer','pro','admin');
create type public.pro_status as enum ('pending','active','suspended');
create type public.kyc_status as enum ('pending','approved','rejected');
create type public.doc_type as enum ('aadhaar','pan','photo','certificate');
create type public.doc_status as enum ('pending','approved','rejected');
create type public.booking_status as enum ('pending_payment','confirmed','pro_assigned','en_route','in_progress','completed','cancelled','refunded');
create type public.payment_method as enum ('upi','card','cash');
create type public.payment_status as enum ('pending','captured','failed','refunded','partially_refunded');
create type public.coupon_type as enum ('flat','percent');
create type public.refund_status as enum ('pending','processed','failed');
create type public.payout_status as enum ('pending','processing','paid','failed');
create type public.ticket_status as enum ('open','in_progress','resolved','closed');
create type public.offer_status as enum ('offered','accepted','rejected','expired');

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique, slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.serviceable_pincodes (
  id uuid primary key default gen_random_uuid(), city_id uuid not null references public.cities(id) on delete cascade,
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(city_id,pincode)
);
create index serviceable_pincodes_pin_idx on public.serviceable_pincodes(pincode);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '' check (char_length(name)<=120),
  phone text unique check (phone is null or phone ~ '^\+91[6-9][0-9]{9}$'),
  role public.profile_role not null default 'customer', avatar_url text,
  city_id uuid references public.cities(id),is_blocked boolean not null default false,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index profiles_city_idx on public.profiles(city_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),slug text not null unique check(slug ~ '^[a-z0-9-]+$'),
  name text not null,icon text not null,colour text not null default '#e5efe5',
  sort_order int not null default 0,is_active boolean not null default true,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.subcategories (
  id uuid primary key default gen_random_uuid(),category_id uuid not null references public.categories(id),
  name text not null,sort_order int not null default 0,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(category_id,name)
);
create index subcategories_category_idx on public.subcategories(category_id,sort_order);

create table public.services (
  id uuid primary key default gen_random_uuid(),subcategory_id uuid not null references public.subcategories(id),
  slug text not null unique check(slug ~ '^[a-z0-9-]+$'),name text not null,description text not null default '',
  price int not null check(price>=0),mrp int not null check(mrp>=price),
  duration_minutes int not null check(duration_minutes between 15 and 720),
  includes text[] not null default '{}',excludes text[] not null default '{}',
  image_url text,is_active boolean not null default true,
  rating_avg numeric(3,2) not null default 0 check(rating_avg between 0 and 5),
  rating_count int not null default 0 check(rating_count>=0),tags text[] not null default '{}',
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index services_subcategory_idx on public.services(subcategory_id);
create index services_search_idx on public.services using gin ((name || ' ' || description) extensions.gin_trgm_ops);
create index categories_search_idx on public.categories using gin (name extensions.gin_trgm_ops);
create table public.city_service_prices (
  id uuid primary key default gen_random_uuid(),city_id uuid not null references public.cities(id),
  service_id uuid not null references public.services(id),
  price int not null check(price>=0),mrp int not null check(mrp>=price),
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(city_id,service_id)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null check(label in ('Home','Work','Other')),
  house text not null,area text not null,landmark text,pincode text not null check(pincode ~ '^[0-9]{6}$'),
  city_id uuid not null references public.cities(id),lat double precision check(lat between -90 and 90),
  lng double precision check(lng between -180 and 180),is_default boolean not null default false,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check ((lat is null)=(lng is null))
);
create index addresses_user_idx on public.addresses(user_id);
create unique index addresses_one_default_idx on public.addresses(user_id) where is_default;

create table public.carts (
  id uuid primary key default gen_random_uuid(),user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),cart_id uuid not null references public.carts(id) on delete cascade,
  service_id uuid not null references public.services(id),qty int not null check(qty between 1 and 20),
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(cart_id,service_id)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),code text not null unique check(code ~ '^[A-Z0-9_-]{3,30}$'),
  type public.coupon_type not null,value numeric(10,2) not null check(value>0),
  max_discount int check(max_discount>=0),min_order int not null default 0 check(min_order>=0),
  first_order_only boolean not null default false,valid_from timestamptz not null,
  valid_to timestamptz not null check(valid_to>valid_from),
  usage_limit int check(usage_limit>0),per_user_limit int not null default 1 check(per_user_limit>0),
  city_ids uuid[] not null default '{}',category_ids uuid[] not null default '{}',is_active boolean not null default true,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check ((type='percent' and value<=100) or type='flat')
);

create table public.pros (
  id uuid primary key references public.profiles(id) on delete cascade,
  status public.pro_status not null default 'pending',city_id uuid not null references public.cities(id),
  skills uuid[] not null default '{}',rating_avg numeric(3,2) not null default 0 check(rating_avg between 0 and 5),
  jobs_completed int not null default 0 check(jobs_completed>=0),kyc_status public.kyc_status not null default 'pending',
  bank_details_reference text,home_lat double precision check(home_lat between -90 and 90),
  home_lng double precision check(home_lng between -180 and 180),
  service_radius_km int not null default 10 check(service_radius_km between 1 and 100),
  is_online boolean not null default false,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check((home_lat is null)=(home_lng is null))
);
create index pros_city_active_idx on public.pros(city_id,status) where status='active';
create index pros_skills_idx on public.pros using gin(skills);
create table public.pro_documents (
  id uuid primary key default gen_random_uuid(),pro_id uuid not null references public.pros(id) on delete cascade,
  type public.doc_type not null,storage_path text not null unique,
  status public.doc_status not null default 'pending',
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check (split_part(storage_path,'/',1)=pro_id::text)
);
create index pro_documents_pro_idx on public.pro_documents(pro_id);
create table public.pro_availability (
  id uuid primary key default gen_random_uuid(),pro_id uuid not null references public.pros(id) on delete cascade,
  weekday int not null check(weekday between 0 and 6),start_time time not null,end_time time not null,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check(end_time>start_time),unique(pro_id,weekday,start_time,end_time)
);
create index pro_availability_lookup_idx on public.pro_availability(pro_id,weekday);
create table public.pro_time_off (
  id uuid primary key default gen_random_uuid(),pro_id uuid not null references public.pros(id) on delete cascade,
  date date not null,reason text,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(pro_id,date)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),code text not null unique check(code ~ '^NF[0-9]{6,12}$'),
  user_id uuid not null references public.profiles(id),address_snapshot jsonb not null,
  city_id uuid not null references public.cities(id),scheduled_date date not null,
  slot_start time not null,slot_end time not null,status public.booking_status not null default 'pending_payment',
  pro_id uuid references public.pros(id),subtotal int not null default 0 check(subtotal>=0),
  mrp_total int not null default 0 check(mrp_total>=0),discount int not null default 0 check(discount>=0),
  visit_fee int not null default 0 check(visit_fee>=0),tax int not null default 0 check(tax>=0),
  total int not null default 0 check(total>=0),
  payment_method public.payment_method not null,payment_status public.payment_status not null default 'pending',
  start_pin text not null check(start_pin ~ '^[0-9]{4}$'),
  cancel_reason text,cancelled_by uuid references public.profiles(id),notes text,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check(slot_end>slot_start),check(total=subtotal-discount+visit_fee+tax),
  check(discount<=subtotal+visit_fee)
);
create index bookings_customer_status_idx on public.bookings(user_id,status,scheduled_date desc);
create index bookings_pro_slots_idx on public.bookings(pro_id,scheduled_date,slot_start,slot_end);
create index bookings_ops_idx on public.bookings(city_id,status,scheduled_date);
create table public.booking_items (
  id uuid primary key default gen_random_uuid(),booking_id uuid not null references public.bookings(id) on delete cascade,
  service_id uuid not null references public.services(id),name text not null,
  unit_price int not null check(unit_price>=0),qty int not null check(qty between 1 and 20),
  duration_minutes int not null check(duration_minutes>0),
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index booking_items_booking_idx on public.booking_items(booking_id);
create table public.booking_events (
  id uuid primary key default gen_random_uuid(),booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status public.booking_status,to_status public.booking_status not null,
  actor_id uuid references public.profiles(id),note text,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index booking_events_booking_created_idx on public.booking_events(booking_id,created_at);
create table public.pro_offers (
  id uuid primary key default gen_random_uuid(),booking_id uuid not null references public.bookings(id) on delete cascade,
  pro_id uuid not null references public.pros(id),status public.offer_status not null default 'offered',
  expires_at timestamptz not null,responded_at timestamptz,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  unique(booking_id,pro_id)
);
create index pro_offers_pending_idx on public.pro_offers(pro_id,expires_at) where status='offered';
create table public.slot_holds (
  id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,
  address_id uuid not null references public.addresses(id),city_id uuid not null references public.cities(id),
  pro_id uuid not null references public.pros(id),scheduled_date date not null,
  slot_start time not null,slot_end time not null,expires_at timestamptz not null,
  booking_id uuid references public.bookings(id) on delete set null,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check(slot_end>slot_start)
);
create index slot_holds_pro_idx on public.slot_holds(pro_id,scheduled_date,slot_start,slot_end,expires_at);
create index slot_holds_owner_idx on public.slot_holds(user_id,expires_at);

create table public.payments (
  id uuid primary key default gen_random_uuid(),booking_id uuid not null references public.bookings(id),
  provider text not null check(provider in ('razorpay','mock')),
  provider_order_id text unique,provider_payment_id text unique,
  amount int not null check(amount>=0),status public.payment_status not null default 'pending',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index payments_booking_idx on public.payments(booking_id);
create table public.refunds (
  id uuid primary key default gen_random_uuid(),payment_id uuid not null references public.payments(id),
  amount int not null check(amount>0),status public.refund_status not null default 'pending',
  provider_refund_id text unique,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index refunds_payment_idx on public.refunds(payment_id);
create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),coupon_id uuid not null references public.coupons(id),
  user_id uuid not null references public.profiles(id),booking_id uuid not null unique references public.bookings(id),
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index coupon_redemptions_coupon_idx on public.coupon_redemptions(coupon_id);
create index coupon_redemptions_user_idx on public.coupon_redemptions(user_id,coupon_id);
create table public.reviews (
  id uuid primary key default gen_random_uuid(),booking_id uuid not null unique references public.bookings(id),
  user_id uuid not null references public.profiles(id),pro_id uuid not null references public.pros(id),
  rating int not null check(rating between 1 and 5),tags text[] not null default '{}',
  comment text not null default '',is_published boolean not null default true,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index reviews_pro_idx on public.reviews(pro_id,is_published,created_at desc);
create table public.payouts (
  id uuid primary key default gen_random_uuid(),pro_id uuid not null references public.pros(id),
  period_start date not null,period_end date not null,amount int not null check(amount>=0),
  status public.payout_status not null default 'pending',paid_at timestamptz,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check(period_end>=period_start),unique(pro_id,period_start,period_end)
);
create table public.pro_earnings (
  id uuid primary key default gen_random_uuid(),pro_id uuid not null references public.pros(id),
  booking_id uuid not null unique references public.bookings(id),gross int not null check(gross>=0),
  commission int not null check(commission>=0),net int not null check(net>=0),
  payout_id uuid references public.payouts(id),
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check(net=gross-commission)
);
create index pro_earnings_pro_idx on public.pro_earnings(pro_id,created_at desc);
create table public.notifications (
  id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,title text not null,body text not null,data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index notifications_unread_idx on public.notifications(user_id,created_at desc) where read_at is null;
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),booking_id uuid references public.bookings(id),
  user_id uuid not null references public.profiles(id),type text not null,message text not null,
  status public.ticket_status not null default 'open',admin_note text,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create index support_tickets_status_idx on public.support_tickets(status,created_at);
create table public.settings (
  key text primary key,value jsonb not null,is_public boolean not null default false,
  description text not null default '',
  created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);

-- Updated_at is enforced in the database, not supplied by clients.
create or replace function private.touch_updated_at() returns trigger
language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end $$;
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'cities','serviceable_pincodes','profiles','categories','subcategories','services','city_service_prices',
    'addresses','carts','cart_items','coupons','pros','pro_documents','pro_availability','pro_time_off',
    'bookings','booking_items','booking_events','pro_offers','slot_holds','payments','refunds','coupon_redemptions',
    'reviews','payouts','pro_earnings','notifications','support_tickets','settings'
  ] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()',tbl);
  end loop;
end $$;

-- Create a customer profile after OTP signup. App never grants users the right to change role.
create or replace function private.on_auth_user_created() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,phone,role)
 values(new.id,case when new.phone ~ '^\+91[6-9][0-9]{9}$' then new.phone else null end,'customer')
 on conflict(id) do nothing;
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function private.on_auth_user_created();

-- Security-definer helper avoids recursive profiles RLS policies. Function stays in private schema.
create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin' and not is_blocked);
$$;
revoke all on schema private from public,anon,authenticated;
grant usage on schema private to authenticated;
revoke all on function private.is_admin() from public,anon,authenticated;
grant execute on function private.is_admin() to authenticated;
revoke all on function private.on_auth_user_created() from public,anon,authenticated;
revoke all on function private.touch_updated_at() from public,anon,authenticated;
