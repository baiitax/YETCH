# YECH Commercial Engine

Internal commercial operations workspace for YECH: leads, companies, opportunities, follow-ups, proposals, customers, reports, and audit. Built with Next.js 15 (App Router), TypeScript, Supabase Auth and Postgres, and zod.

**Status:** Phases 1 to 6 are built. Database tests pass against the migrations. Runtime checks against a live Supabase project are still pending. See `docs/ENGINE-CHECKPOINTS.md` for the evidence and the open items.

**Not included in this release:** public registration, social login, AI features, autonomous outreach, payments or invoicing, e-signatures, and any claim that YECH Marketing OS is operational.

## Roles

| Role | Summary |
| --- | --- |
| founder | Full access. Manages staff roles and activation. Reads the audit trail. |
| commercial_manager | Reviews and approves proposals, records acceptance, assigns leads, closes deals. |
| sales_executive | Works leads, opportunities, follow-ups, and proposal drafts. |
| onboarding | Updates customer onboarding checklists. Cannot edit deals. |
| reviewer | Read-only access to permitted records. |

Permissions are enforced in three places: server actions (`src/lib/authz.ts`), Postgres row-level security, and database triggers. Hiding a button is not a security control.

## Local setup

```bash
cd engine
npm install
cp .env.example .env.local      # then fill in your own values
npm run dev                     # http://localhost:3100
```

Without Supabase values, the login page shows a "not configured" state and protected routes redirect there. This is intentional. No default password or fake backend exists.

## Supabase setup

1. Create a Supabase project. Use a region appropriate to your data-residency decision (to be confirmed by YECH).
2. Apply the migrations in order using the SQL editor or the Supabase CLI:
   1. `supabase/migrations/0001_foundation.sql`
   2. `supabase/migrations/0002_commercial.sql`
3. In Authentication settings, **disable public sign-ups**. Staff accounts come only from invitation or admin provisioning.
4. Set the Site URL and redirect allow-list to the engine origin, including `/auth/callback`.
5. Copy the URL and anon key into `.env.local`. Copy the service-role key only if you want the invitation feature, and keep it server-side.

### Creating the first founder (once)

1. In Authentication, create a user with an email you control. Set the password yourself. Do not use a shared or default password.
2. In the SQL editor (trusted session, no app JWT), run:

   ```sql
   update public.profiles
      set role = 'founder', is_active = true
    where email = 'founder@your-domain.example';
   ```

   The protect-privileges trigger allows this only in a trusted SQL session. The application cannot do it.

Every later account starts inactive with the lowest role. A founder activates it and sets its role on the Team page.

## Tests

```bash
npm test          # unit tests (domain rules, money, validation, permissions)
npm run test:db   # database tests: RLS, triggers, and the end-to-end demo path (uses a local embedded Postgres)
npm run typecheck
npm run build
```

The database tests run inside rolled-back transactions and create only synthetic test users.

## Demo path (what the tests cover)

login → dashboard → create lead → qualify (evidence required) → opportunity → follow-up → proposal draft → internal review → manager approval → recorded acceptance → closed-won → customer handover (idempotent) → onboarding checklist → report figures → founder reads audit trail.

## Deployment (separate Vercel project)

- Create a new Vercel project with **Root Directory = `engine`**. The website is a separate project at the repository root.
- Set the environment variables from `.env.example` in Vercel's project settings. Do not commit them.
- Domain: `engine.yech.sa` is **proposed**, not yet registered. Confirm the domain before wiring the public site's Login link. The website reads `ENGINE_LOGIN_URL` at build time.

## Known limitations

- `expired` and `superseded` proposal transitions are not guarded in the database.
- The won-opportunity handover does not yet check ownership in the database.
- Activities RLS has no dedicated test.
- Proposal revisions (new version rows) are not implemented. Only the `superseded` status is reachable.
- Reports cap at 5,000 rows, and the cohort conversion query uses at most 1,000 lead IDs. The UI shows an error notice when truncated.
- Staff invitation and password reset are not runtime-tested. They need a configured Supabase project and a valid public URL.
- Payment status is not recorded. A won deal never sets a paid status.

## Data rules

- Money is stored as whole minor units in integers, never floats. Amounts are shown per currency. There are no hard-coded exchange rates.
- Advertising spend is excluded from all packages and from any figure shown here.
- Audit events are written by triggers and are read-only for ordinary users.
- Illustrative data is for development and staging only and must be labelled. Do not seed fabricated customers or metrics into production.
