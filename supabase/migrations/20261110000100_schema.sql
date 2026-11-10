-- Nestfix core schema: catalog, customers, professionals, bookings.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text check (phone is null or phone ~ '^[6-9][0-9]{9}$'),
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------- catalog ----------
create table public.cities (
  id text primary key,
  name text not null,
  sort int not null default 0,
  is_active boolean not null default true
);

create table public.categories (
  id text primary key,
  name text not null,
  icon text not null,
  hue text not null,
  tagline text not null default '',
  sort int not null default 0,
  is_active boolean not null default true
);

create table public.services (
  id text primary key,
  category_id text not null references public.categories (id),
  sub text not null,
  name text not null,
  description text not null default '',
  price int not null check (price >= 0),
  mrp int not null check (mrp >= 0),
  duration_min int not null check (duration_min between 10 and 720),
  rating numeric(2,1) not null default 4.8,
  review_count int not null default 0,
  includes text[] not null default '{}',
  excludes text[] not null default '{}',
  is_bestseller boolean not null default false,
  is_active boolean not null default true,
  sort int not null default 0
);
create index services_category_idx on public.services (category_id, sort);

create table public.coupons (
  code text primary key check (code = upper(code)),
  title text not null,
  description text not null,
  kind text not null check (kind in ('flat', 'pct')),
  value int not null check (value > 0),
  max_discount int,
  min_order int not null default 0,
  first_order_only boolean not null default false,
  is_active boolean not null default true,
  sort int not null default 0
);

-- ---------- professionals ----------
create table public.pros (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  city_id text not null references public.cities (id),
  skills text[] not null,
  rating numeric(2,1) not null default 4.8,
  ratings_count int not null default 0,
  jobs_done int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index pros_city_idx on public.pros (city_id) where is_active;

-- ---------- customer data ----------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label text not null default 'Home' check (label in ('Home', 'Work', 'Other')),
  house text not null check (length(trim(house)) between 3 and 160),
  area text not null check (length(trim(area)) between 2 and 160),
  landmark text check (landmark is null or length(landmark) <= 120),
  city_id text not null references public.cities (id),
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  created_at timestamptz not null default now()
);
create index addresses_user_idx on public.addresses (user_id);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  customer_name text not null default '',
  customer_email text not null default '',
  status text not null check (status in ('confirmed', 'pro_assigned', 'en_route', 'in_progress', 'completed', 'cancelled')),
  scheduled_date date not null,
  slot_time time not null,
  span_hours int not null default 1,
  city_id text not null references public.cities (id),
  address jsonb not null,
  item_total int not null,
  mrp_total int not null,
  discount int not null default 0,
  visit_fee int not null default 0,
  total int not null,
  coupon_code text,
  payment_method text not null check (payment_method in ('upi', 'card', 'cash')),
  payment_status text not null check (payment_status in ('pending', 'paid', 'refunded', 'partially_refunded', 'void')),
  refund_amount int not null default 0,
  cancel_fee int not null default 0,
  cancel_reason text,
  pro_id uuid references public.pros (id),
  start_pin text not null,
  rating int check (rating between 1 and 5),
  review_tags text[],
  review_comment text,
  rated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bookings_user_idx on public.bookings (user_id, created_at desc);
create index bookings_slot_idx on public.bookings (city_id, scheduled_date) where status <> 'cancelled';
create index bookings_pro_idx on public.bookings (pro_id, scheduled_date) where status <> 'cancelled';

create table public.booking_items (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  service_id text not null references public.services (id),
  name text not null,
  unit_price int not null,
  unit_mrp int not null,
  qty int not null check (qty between 1 and 20),
  duration_min int not null
);
create index booking_items_booking_idx on public.booking_items (booking_id);

create table public.booking_events (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings (id) on delete cascade,
  status text not null,
  note text,
  actor uuid,
  created_at timestamptz not null default now()
);
create index booking_events_booking_idx on public.booking_events (booking_id, created_at);

-- ---------- helpers ----------
create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
grant execute on function private.is_admin() to anon, authenticated;

create or replace function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger bookings_touch before update on public.bookings
  for each row execute function private.touch_updated_at();

create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.services enable row level security;
alter table public.coupons enable row level security;
alter table public.pros enable row level security;
alter table public.addresses enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.booking_events enable row level security;

-- profiles: read/update own; admins read all. Role can never be changed from the client.
create policy "profiles read own or admin" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy "profiles update own" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- catalog: everyone reads active rows; admins manage everything
create policy "cities public read" on public.cities for select to anon, authenticated using (is_active or (select private.is_admin()));
create policy "categories public read" on public.categories for select to anon, authenticated using (is_active or (select private.is_admin()));
create policy "services public read" on public.services for select to anon, authenticated using (is_active or (select private.is_admin()));
create policy "coupons public read" on public.coupons for select to anon, authenticated using (is_active or (select private.is_admin()));
create policy "services admin write" on public.services for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "coupons admin write" on public.coupons for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
revoke insert, update, delete on public.cities, public.categories from anon, authenticated;
revoke insert, delete on public.services, public.coupons from anon, authenticated;
revoke update on public.services, public.coupons from anon;

-- pros: logged-in users see active pros (name, rating) and the pro on their own bookings; admins manage
create policy "pros read" on public.pros for select to authenticated using (is_active or (select private.is_admin()));
create policy "pros admin insert" on public.pros for insert to authenticated with check ((select private.is_admin()));
create policy "pros admin update" on public.pros for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
revoke all on public.pros from anon;
revoke delete on public.pros from authenticated;

-- addresses: owner only
create policy "addresses owner" on public.addresses for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.addresses from anon;

-- bookings: read own (or admin). All writes go through security-definer functions.
create policy "bookings read own or admin" on public.bookings for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "booking items read" on public.booking_items for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = (select auth.uid()) or (select private.is_admin()))));
create policy "booking events read" on public.booking_events for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_id and (b.user_id = (select auth.uid()) or (select private.is_admin()))));
revoke all on public.bookings, public.booking_items, public.booking_events from anon;
revoke insert, update, delete on public.bookings, public.booking_items, public.booking_events from authenticated;

-- live booking status for customers
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.bookings;
  end if;
end $$;
