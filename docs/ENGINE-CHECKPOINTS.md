# YECH Commercial Engine: Phase Checkpoints

Each checkpoint lists what was built, what was verified, and what remains open. "Build-verified" means `next build` and `tsc` pass. It does not mean the feature was run against a live backend.

Verification at this checkpoint (latest run):

| Check | Result |
| --- | --- |
| `npm test` (unit) | 39 of 39 pass |
| `npm run test:db` (RLS, triggers, demo path) | 42 of 42 pass |
| `npx tsc --noEmit` | exit 0 |
| `next build` | exit 0 (25 routes) |
| Website `npm run build`, `npm test`, `npm run check` | exit 0; 28 tests pass; no broken links |

## Phase 1: Foundation and authentication
- **Built:** Next.js 15 app shell; Supabase SSR clients; middleware; login page with a "not configured" state; `profiles` table with privilege-protection trigger; `audit_events` and its trigger; role model and capability map.
- **Verified:** Runtime (earlier session): protected routes redirect to `/login?status=unconfigured`; `/login` returns 200 with the not-configured state; security headers present. Database: profile privilege trigger, RLS.
- **Open:** Live Supabase sign-in and session refresh not yet exercised. Confirm `engine.yech.sa` before wiring the public Login link.

## Phase 2: Leads, companies, dashboard
- **Built:** Leads with enforced status lifecycle (qualifying requires recorded evidence); companies and contacts; activities; dashboard limited to real records.
- **Verified:** Build. Demo path steps for lead creation and qualification pass in the database test.
- **Open:** Runtime UI pass against a live project.

## Phase 3: Opportunities, follow-ups
- **Built:** Opportunity pipeline with configurable stages; amounts per currency (SAR default, no FX rates); weighted values with floor division, skipping items without a probability; follow-ups where overdue is computed from `due_at`.
- **Verified:** Build. Demo path steps for conversion, opportunity, and follow-up pass in the database test.
- **Open:** Runtime UI pass.

## Phase 4: Proposals and outcomes
- **Built:** Proposal lifecycle (draft → internal review → approved → sent → accepted/rejected/expired/superseded/withdrawn). Acceptance is a manual record only: manager role, at least 10 characters of evidence, optional accepted-by name. No e-signature. "Sent" records the channel entered; the app sends nothing. Closed-won requires an accepted proposal, enforced in both the UI and the database.
- **Verified:** Build. Database test covers approval, acceptance, and won. The earlier proposal-approval failure is fixed.
- **Open:** `expired` and `superseded` transitions are not guarded in the database. Proposal revisions are not implemented.

## Phase 5: Customers and onboarding
- **Built:** Idempotent closed-won handover that creates a customer and a 12-item onboarding checklist once. Onboarding staff update item state and notes. Customer status (`onboarding`, `active`, `paused`, `ended`) changes require `customers.write`. A won deal never sets a paid status.
- **Verified:** Build. Database test covers handover, idempotency (same customer ID on second call), onboarding updates, and onboarding being blocked from deal edits.
- **Open:** Runtime UI pass. Handover ownership is not guarded in the database.

## Phase 6: Reports, audit, team, settings
- **Built:** Reports with documented formulas. Qualified-to-won = won ÷ qualified. Acceptance rate = accepted ÷ sent, with open proposals kept in the denominator. Averages and pipeline values per currency. N/A on zero denominators. Read-only audit page filtered by entity. Team page: role and activation changes via RLS; invitations via a server-only admin client, which shows "not configured" without the service-role key or a valid public URL. Settings page shows configuration status and the role-capability matrix, never secrets.
- **Verified:** Build. Database test checks report figures and that a manager cannot read the audit log, while a founder can.
- **Open:** Invitation and password-reset flow not runtime-tested (needs Supabase configured). Cohort conversion uses at most 1,000 lead IDs; reports cap at 5,000 rows.

## Cross-cutting
- **Public website Login link:** Added to the header and mobile drawer. It points to `SITE.engineLoginUrl`, which defaults to the **proposed** `https://engine.yech.sa/login`. The domain is not yet registered, so the link leads nowhere until DNS and deployment are in place. Override with `ENGINE_LOGIN_URL` at build time.
- **Still outstanding:** Deploy the Engine as a separate Vercel project with Root Directory `engine`; live Supabase runtime test of the full demo path in a browser; domain confirmation; legal review of any customer-facing terms by Saudi counsel.
