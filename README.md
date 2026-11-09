# Nestfix — home-services marketplace

**Phase 1 deliverable (2026-11-09).** Original India-focused home-services brand. The UI is an interactive, accessible **foundation**, not yet the working booking marketplace. Phase 2 is next, but has not been started.

## Stack

Next.js **15.5.29** App Router, TypeScript, Tailwind CSS + shadcn/ui-compatible components, lucide-react, `next-themes`, TanStack Query, Supabase Postgres/Auth/Storage/Realtime, Zod, Framer Motion (reserved for later sheet transitions), Zustand (reserved for cart), Vitest, Playwright, pnpm. INR / `en-IN`; time zone `Asia/Kolkata`; `+91` phone numbers.

## Prerequisites

- Node.js 22+, pnpm 9.15.4 (`corepack enable`; `corepack prepare pnpm@9.15.4 --activate`).
- Supabase CLI v2 or v3, Docker Desktop or another supported local container engine, and a working internet connection for first install. See `supabase --help` for available commands.
- Postgres/Supabase local runtime for schema and RLS integration tests.

## Install and start

```bash
pnpm install                    # creates pnpm-lock.yaml (commit it)
cp .env.example .env.local
supabase start                  # local DB/Auth/Storage; requires Docker
supabase status                 # copy URL, anon/public key and service-role key into .env.local
supabase db reset              # apply migrations + catalog seed.sql
pnpm seed:accounts             # optional, LOCAL ONLY; creates 20 demo pros, reviews and admin
pnpm dev                       # http://localhost:3000
```

Set `ADMIN_PHONE` to **your verified India mobile number** before `seed:accounts`; it creates a phone-OTP admin user and assigns the `admin` role. The script refuses to run outside localhost. `seed.sql` itself is standalone and idempotent; it loads public catalog data but deliberately does **not** insert directly into Supabase Auth tables. Don't send SMS to synthetic demo numbers or use demo users in hosted environments. For production, onboard real pros via verified KYC and real phone authentication.

`GET /api/health` returns a minimal health response even without a database. `/pro` and `/admin` are deliberately **fail-closed** when Supabase is unconfigured; with Supabase configured they require a matching `profiles.role`. Customer-facing pages render without credentials during Phase 1.

## Run checks

```bash
pnpm test:static            # dependency-free Node security/scaffold assertions
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
supabase test db              # SQL assertions in supabase/tests/
supabase db lint              # local lint (verify CLI command via --help)
```

`pnpm test:e2e` will be extended for the full book/pro/refund journey in Phase 7. The current Playwright suite checks the Phase 1 shell only; the main workflows do not exist yet. Dependency-free `node --test tests/static.test.mjs` is also supplied. Always execute these after installing dependencies and starting Docker. **This generated package could not be runtime-tested in the authoring environment because npm registry DNS resolution failed and pnpm/Supabase CLI/DB are not available.** There is no generated lockfile until the first successful `pnpm install`; avoid deploying until dependencies, schema and tests are successfully verified.

## Security model

- `public` tables have RLS enabled individually. `private.is_admin()` uses a locked-down private schema instead of recursive profile policies. Catalog browsing is public only for active rows. Profiles have **no self-service UPDATE grant for role, phone or is_blocked**.
- Address, cart, booking, payment, review, notification and payout access is owner-scoped. A pro only sees a booking's `address_snapshot` while **assigned and active** (`pro_assigned`, `en_route`, `in_progress`); being offered a job does not reveal a customer's details. Customer phone is never granted to pros via the `profiles` table. A future server-side masked-call provider will handle contact.
- Booking/payment/offer/slot-hold state changes are **server-only**. Future checkout actions must check Supabase Auth, run Zod validation, compute prices, reserve availability transactionally and enforce transitions atomically; do not replace this with client-side `.insert()` calls.
- Supabase `service_role` is for trusted server code and local account seeding only, not client components. Demo accounts are only for local development. Pro documents live in a private Storage bucket with a per-user path policy. Service images have a public-read bucket but admin-only writes.
- The schema stores prices as **whole INR rupees**, as in the spec. For Razorpay, Phase 6 must convert final INR totals to paise at API boundaries, with tested integer arithmetic; do not submit rupee values as paise.
- `profiles.role` is the authority for access checks, not user-editable auth metadata. Middleware validates roles server-side using `auth.getUser()`.
- The SQL migration requires `pg_trgm`; search indexes are set up for Phase 2's typo-tolerant search.

## Database files

- `supabase/migrations/20261109000000_initial_schema.sql` — 29 core tables, constraints, indexes, private role helper, auth signup trigger, timestamps.
- `supabase/migrations/20261109000001_rls_storage.sql` — RLS + grants for each table, two Storage buckets and object policies.
- `supabase/seed.sql` — 5 cities (Noida, Delhi, Gurugram, Bengaluru, Mumbai), 35 serviceable PIN codes, 11 categories, 46 price-listed services, city override, 3 coupons and configuration defaults.
- `scripts/seed-accounts.ts` — 20 local active pros (4 per city) with Monday–Saturday availability, one local customer, sample bookings/reviews, one admin user from `ADMIN_PHONE`.

To verify table/policy coverage:

```sql
select tablename, rowsecurity from pg_tables where schemaname='public' order by tablename;
select tablename, count(*) as policies from pg_policies where schemaname='public' group by tablename order by tablename;
```

## Config keys

| Variable | Availability | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser/public | Auth/session/Data API |
| `SUPABASE_SERVICE_ROLE_KEY` | server secret | privileged actions/demo seed |
| `ADMIN_PHONE` | server secret | demo admin bootstrap |
| `PAYMENTS_PROVIDER=mock` | server | Phase 3 mock checkout; Phase 6 Razorpay |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | server secret | Phase 6 payments |
| `NOTIFIER_PROVIDER=console`, `MSG91_AUTH_KEY` | server secret | Phase 6 notifications |
| `GEOCODER_PROVIDER=mock`, `GOOGLE_MAPS_API_KEY` | server | Phase 3 address geocoding |
| `CRON_SECRET` | server secret | Phase 6 jobs |
| `NEXT_PUBLIC_SITE_URL` | browser/public | absolute URLs and metadata |

## Design system

Deep green primary and warm off-white canvas, with a genuine dark palette; Bricolage Grotesque for display and Figtree for body, using Next font optimization. Keyboard focus rings, min 44px hit areas, mobile-first responsive layouts, and reduced-motion support. The theme toggle persists user preference. Components use Radix UI/shadcn-style primitives and typed variants. These are intentionally **original Nestfix** colours, layout, and copy.

## Status by build phase

| Phase | Status |
| --- | --- |
| 1 — Scaffold, tokens/themes/components, SQL schema/RLS/seeds | **Files implemented; runtime validation pending dependency install + local DB** |
| 2 — Catalog/search/details/cart | Not started |
| 3 — OTP/address/slots/checkout/bookings | Not started |
| 4 — Pro PWA/onboarding/offers/lifecycle/earnings | Not started |
| 5 — Admin dashboards | Not started |
| 6 — Razorpay/webhooks/refunds/notifications/cron | Not started |
| 7 — SEO/PWA/Lighthouse/E2E/docs hardening | Not started |

### Stubbed by design

The homepage is a branded Phase 1 landing shell with a working light/dark toggle, not a fake interactive catalog. `/pro` and `/admin` have role guards and clearly marked informational pages, not dead controls. The API health endpoint works independently. Real OTP login, slot scheduling, cart, purchasing, pro onboarding, admin CRUD and provider integrations are deferred to their specified phases.

### Known verification gaps

No dependency lockfile, TypeScript build, browser run, live Postgres migration, Supabase advisor output, Playwright run or Lighthouse score can be claimed until the project is installed and run in a Node+Docker development environment. The dependency-free static checks pass (5/5), as does TypeScript/TSX syntax parsing (0 syntax errors). The SQL `supabase test db` suite is supplied for the initial security checks but has not been executed here. Prior to public launch, additionally implement server-side rate limits, transactional double-booking prevention, audited status transitions, billing/tax handling and payment webhook idempotency.