# YECH — Bilingual Marketing Operations Website (v1)

Public website for YECH. The initial service is **YECH Marketing Operations**; the future software platform, **YECH Marketing OS**, is planned and not yet available. English and Arabic (RTL-correct), about 28 logical pages rendered in both languages (56 HTML pages), a server-validated enquiry API, and legal drafts that are clearly marked as drafts.

> **Status: pre-launch build.** Contact channels, legal entity details, legal text, pricing approval, photography and enquiry destination are placeholders. See `docs/CONTENT-PUBLICATION-CHECKLIST.md` before publishing anything.

## Why there is no framework

The brief suggested Next.js. This build uses **plain Node.js 20 with zero npm dependencies**, for three reasons:

1. The build and test environment had no browser and no package registry access, so a dependency-free toolchain was the only one that could be built, run and verified end to end.
2. The site is almost entirely static content. Pre-rendering it to HTML with a small builder gives clean URLs, hreflang and sitemaps without a runtime framework.
3. It runs anywhere Node 20 runs, with no build chain to maintain. If the team later prefers Next.js, the content model in `src/content/` and the validation in `src/forms.mjs` port directly.

## Quick start

```bash
node --version          # must be >= 20
npm run build           # renders dist/ (EN + AR) and forms.json
npm run check           # verifies links, anchors, hreflang, language switch and metadata
npm test                # unit tests and content guardrails
npm start               # serves dist/ and /api/enquiry on PORT (default 3000)
```

Open `http://localhost:3000/` (redirects to `/en/` or `/ar/` based on `Accept-Language`).

## Project layout

| Path | Purpose |
| --- | --- |
| `src/site.mjs` | Central configuration: brand placeholders, contact (null until confirmed), legal entity placeholders, review status, plans and pricing disclosures. |
| `src/ui.mjs` | All interface strings, English and Arabic. |
| `src/forms.mjs` | Form schema shared by the builder, the browser and the server. |
| `src/content/core.mjs` | Core pages: home, how it works, pricing, measurement, about, resources, FAQ, contact, consultation, get started, confirmation. |
| `src/content/solutions.mjs` | Four service pages, industries overview and five sector pages. |
| `src/content/legal.mjs` | Legal drafts (privacy, cookies, terms, service agreement, data processing, advertising disclaimer) and the 404 and maintenance pages. |
| `src/render.mjs` | Pure HTML renderer for every section type. |
| `src/styles.css` | Design system ("Glassphomiris"): glass surfaces, palette, RTL, focus states, reduced motion. |
| `src/app.js` | Progressive enhancement: reveal animations, mega menu, mobile drawer, FAQ filter, form engine. The site works without it. |
| `src/inline.mjs` | The only inline scripts. Their hashes are added to the Content-Security-Policy at startup. |
| `src/server/validate.mjs` | **Authoritative** server-side validation. Returns machine codes, never prose. |
| `src/server/submissions.mjs` | Reference numbers, JSON-lines store, webhook adapter, rate limiter. |
| `server.mjs` | Zero-dependency HTTP server: static files, language redirects, security headers, enquiry API, maintenance mode. |
| `scripts/build.mjs` | Static build and audits (i18n completeness, link targets, structured data). |
| `scripts/check-links.mjs` | Post-build verification of the generated site. |
| `public/` | Static assets copied as-is (favicon, default social image). |
| `tests/` | `node:test` suites: validation, submission store, rate limiter, content guardrails. |
| `docs/` | QA report, publication checklist, integration setup. |

## Routes

- `/en/…` and `/ar/…` for every page. English stable slugs, Arabic content, for example `/ar/services/lead-management/`.
- `/` redirects to the preferred language. `/en` and `/ar` redirect to trailing-slash URLs.
- `/robots.txt`, `/sitemap.xml` (both languages with hreflang alternates), `/healthz`.
- `POST /api/enquiry` — the only write endpoint.

## Enquiry API contract

`POST /api/enquiry` with `Content-Type: application/json`:

| Status | Body | Meaning |
| --- | --- | --- |
| 200 | `{"ok":true,"reference":"ENQ-20261014-XXXXXX","notification":"sent"\|"pending"}` | Stored. Success is shown only on this response. |
| 400 | `{"ok":false,"error":"validation","fields":{"workEmail":"email"}}` | Field-level machine codes: `required`, `select`, `enum`, `group`, `mustBeTrue`, `min`, `max`, `email`, `phone`, `url`, `unknown`. |
| 400 | `{"ok":false,"error":"rejected"}` | Honeypot filled. No detail is returned. |
| 400 | `{"ok":false,"error":"forbidden_field"}` | A credential or payment-like field was submitted. These are never accepted. |
| 403 | `origin_not_allowed` | Cross-origin browser request. |
| 413 | `too_large` | Body over 16 KB. |
| 415 | `unsupported_media_type` | Not JSON. |
| 429 | `rate_limited` + `Retry-After` | Too many attempts from one client. |
| 500 | `storage_failed` | Not stored. The user is told the enquiry was not received. |
| 503 | `maintenance` + `Retry-After: 3600` | Maintenance mode. |

**Ordering guarantee:** the record is written to storage before any notification is attempted. A submission is only reported as received once it is stored.

## Environment variables

See `.env.example`. Key points:

- `DATA_DIR` holds `submissions.jsonl` (mode 0600) in a 0700 directory. Keep it outside the public web root and back it up under your retention policy.
- `NOTIFY_WEBHOOK_URL` is **pending configuration**. Until it is set, every submission is marked `notification: pending` and stored for manual handling. The site never claims that a team has been notified unless the webhook accepted the record.
- `MAINTENANCE=1` puts the site into maintenance mode.
- `TRUST_PROXY=1` only behind a proxy you control.
- `HSTS=1` only once HTTPS is in place for the production domain.

## Security posture

- Strict Content-Security-Policy: `script-src 'self'` plus hashes of the two inline scripts. No `unsafe-inline` for scripts. Styles allow `'unsafe-inline'` for the stylesheet's inline attributes; see the QA report.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive Permissions-Policy, and `frame-ancestors` (defaults to `'self' https:` so the platform preview works; set `FRAME_ANCESTORS='none'` in production if the site is never embedded).
- Static file serving is confined to `dist/`; path traversal returns 400.
- Logs contain no personal data.
- No analytics, advertising pixels or third-party scripts are loaded. The only external request is the Google Fonts stylesheet (see the QA report for the decision to self-host).
- No sign-in, sign-up or account pages exist. No advertising account passwords are collected.

## Content rules that are enforced

- Figures and examples are labelled **Illustrative Demo Data** / **بيانات توضيحية تجريبية**. A test fails if a mockup page lacks the label.
- Forbidden guarantee wording (for example "guaranteed sales") fails the content test.
- Every bilingual field needs both `en` and `ar`. The build fails otherwise.
- Pricing is shown as provisional and excludes advertising spend.
- Legal pages carry a draft status and must not be published until counsel has reviewed the text, including the Arabic version.

## Known limitations (v1)

- No browser-based visual, accessibility-tool or Lighthouse testing was possible in the build environment. See `docs/QA-REPORT.md`.
- Failed webhook notifications are not retried. The JSON-lines store is the system of record.
- No admin interface exists yet. Submissions are read from the JSON-lines file.
- Scheduling, CRM integration, payments and analytics are not implemented. They are listed in the integration guide as pending configuration.
