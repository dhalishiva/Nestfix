# Nestfix — Indian home-services marketplace

**Current state (10 November 2026): deployed customer catalog MVP; full booking marketplace is NOT complete.**

- **Live production:** https://nestfix-nine.vercel.app (Vercel reports READY)
- **Repository:** https://github.com/dhalishiva/Nestfix
- **Database:** Supabase project `qbishtwkusrjffpfpbnf`, 29 RLS-enabled tables.
- **Stack:** Next.js 15, TypeScript, Tailwind CSS, Supabase Postgres/Auth, Zustand, Zod, Vitest, Playwright.

## Implemented and deployed

- Original branded responsive homepage using the real Supabase service catalog, with service search and category filtering.
- Service detail routes (`/services/[slug]`) with description, duration, inclusions, exclusions, pricing and cart controls.
- Device-persistent guest cart (`/cart`) with steppers, line totals, indicative visit fee and GST.
- Phone OTP sign-in UI (`/login`) using Supabase Auth; **delivery requires configuring an SMS provider in Supabase**.
- Customer saved-address list, add/edit/delete, PIN-code serviceability checks (`/addresses`); requires a verified user.
- Protected informational pro and admin screens (real management features not implemented).
- Database migrations, RLS policies, storage buckets, and seeded reference data.

## Verified infrastructure

- Vercel production deployment `dpl_H5NQ1VgSPwaaq4byhp6LFSqj47uk` completed with a successful Next.js build, deployment state **READY**.
- Supabase migrations `initial_schema` and `rls_storage` applied.
- Supabase seeded **5 cities, 35 PIN codes, 11 categories, 46 services**.
- **29 of 29** application tables have RLS enabled; Supabase security advisor reported zero findings at the time of inspection.

## Not yet implemented

**Do not take payments or accept real bookings yet.** The complete job slot engine, payment holds, professional eligibility and assignments, checkout, booking state transitions, cancellations/refunds, reviews, earnings, admin CRUD, notifications, Razorpay live integration, real pro onboarding, E2E booking coverage, and production hardening are still unfinished. The current cart displays estimated prices and deliberately does **not** create bookings or collect payments.

No production SMS service, Razorpay secrets, or service-role key has been configured. In production, onboarding verified professionals and privileged admin account setup are also pending. Local demo identity seeding is intentionally prohibited against hosted Supabase.

## Local installation

Requires Node 22+, pnpm 9.15.4, network access, local Supabase CLI and Docker.

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
cp .env.example .env.local
# Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# For local Supabase only:
supabase start
supabase db reset
pnpm dev
```

## Testing

```bash
pnpm test:static
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
```

No complete customer booking-to-pro-payment-to-review Playwright test has passed. A successful Vercel build alone does not establish end-to-end functional completeness.

## Deployment and credentials

Production on Vercel is Git-connected to the `main` branch. It has public Supabase URL and publishable key configured. **Never expose a Supabase service-role key or Razorpay secret as a `NEXT_PUBLIC_*` variable.** Configure Supabase Auth phone SMS delivery under the project dashboard before advertising sign-in as operational.

For a full specification, see the original Nestfix request accompanying the project. Implement server-side booking state and pricing/availability verification before enabling checkout.
