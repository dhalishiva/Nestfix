# Nestfix

A home-services marketplace for Indian cities: customers book cleaning, AC repair, salon at home, electricians, plumbers and more in fixed-price time slots, and a professional is assigned automatically. An admin dashboard runs bookings, professionals, prices and offers.

**Live:** https://nestfix-nine.vercel.app

## Stack

- **Frontend:** React 18 + TypeScript + Vite, React Router. Hand-written CSS with light and dark themes.
- **Backend:** Supabase (Postgres, Auth, Realtime). All business rules live in Postgres functions, so prices, slots and bookings can't be faked from the browser.
- **Hosting:** Vercel, deployed on every push to `main`.

## What works

| Area | Features |
|---|---|
| Browse | Categories, services, search, service details, city picker |
| Cart | Server-priced cart, coupons with live eligibility, free visit over ₹999 |
| Auth | Email + password sign up and log in, password reset |
| Checkout | Saved addresses, live slot availability for the next 7 days, payment choice (online payment is simulated) |
| Bookings | Auto-assigned professional, start PIN, live status, reschedule, cancel with refund rules, rating, book again |
| Admin | Overview, all bookings with filters, assign or reassign pros, move jobs through on the way → started (PIN check) → completed, cancel with refund, manage pros, prices and offers |

## Business rules (in `supabase/migrations/…_functions.sql`)

- **Pricing:** `price_cart` computes item total, MRP savings, coupon discount and a ₹49 visit fee waived at ₹999+.
- **Coupons:** `FIRST20` (20% up to ₹300, first booking, min ₹299), `NEST100` (₹100 off over ₹499), `SAVE250` (₹250 off over ₹2,499).
- **Slots:** hourly from 8 AM to 7 PM, today plus 6 days, at least 90 minutes ahead, and the job must finish by 9 PM. A slot is open only if an active professional in that city has all the needed skills and is free for the full job length.
- **Booking:** `create_booking` re-prices on the server, locks the city and day to prevent double-booking, and assigns the best free professional.
- **Changes:** free reschedule or cancel up to 3 hours before the slot. Later cancellations of prepaid bookings keep ₹100.
- **Status flow:** confirmed → pro assigned → on the way → in progress (needs the customer's PIN) → completed.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL and anon key
npm run dev
```

## Database

Migrations are in `supabase/migrations`, applied in order:

1. `reset` clears objects from earlier versions
2. `schema` creates tables, Row Level Security and the new-user trigger
3. `functions` adds pricing, slots, booking and admin functions
4. `seed` loads 5 cities, 11 categories, 36 services, 3 coupons and 60 sample professionals

The catalog, ratings and professionals are sample data. Replace them before going live.

### Make someone an admin

After the person signs up, run this in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'person@example.com');
```

### Supabase Auth settings

In **Authentication → URL Configuration**, set the Site URL to `https://nestfix-nine.vercel.app` and add `https://nestfix-nine.vercel.app/**` to Redirect URLs, so confirmation and reset links come back to the site.

## Not built yet

- Real payments (Razorpay), SMS/WhatsApp notifications, phone OTP login
- A separate app for professionals (for now, admins move jobs through each status)
