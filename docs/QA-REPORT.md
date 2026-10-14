# QA Report — v1 build (pre-launch)

Date of build verification: 2026-10-14. Environment: Node 20.20.2, npm 10.8.2, Linux sandbox. No browser, no Lighthouse and no assistive-technology tooling were available.

## 1. What was verified and how

| Area | Method | Result |
| --- | --- | --- |
| JavaScript syntax (all `.mjs`, `app.js`) | `node --check` | Pass |
| Static build (56 HTML pages, EN + AR; 404 and maintenance) | `npm run build` | Pass. Bilingual completeness audit passes. |
| Internal links, anchors, metadata, hreflang, language switch | `npm run check` (`scripts/check-links.mjs`, 4,536 links over 61 HTML files) | Pass |
| Validation rules, reference format, store permissions, rate limiter, webhook fallbacks | `npm test` (`tests/validate.test.mjs`, `tests/submissions.test.mjs`) | Pass (14 tests) |
| Content guardrails (forbidden guarantee wording; illustrative data labelled on every mockup page; no testimonial markup) | `tests/site-content.test.mjs` | Pass |
| Routing: `/` language negotiation, trailing slashes, 404 for unknown pages and languages | Live `curl` against `scripts/serve.mjs` | Pass |
| Security headers (CSP with script hashes, nosniff, referrer policy) | Live `curl` | Pass |
| Path traversal in `/assets/` | Live `curl` with encoded `..` | 400, pass |
| Enquiry API: empty body, invalid email and phone, short text, honeypot, credential-like field, unknown form, invalid JSON, wrong content type, cross-origin, method not allowed | Live `curl` | Pass. Each returns the documented status and machine code. |
| Enquiry API: valid contact submission (Arabic) | Live `curl` | 200, reference issued, `notification: pending`. Email normalised to lowercase, phone to `+966501234567`. |
| Storage: JSON lines written; file mode 0600; directory 0700 | Inspected file system | Pass |
| Rate limiting (max 2, window 10 min) | Second instance with `RATE_LIMIT_MAX=2` | Pass: third request 429 with `Retry-After: 600` |
| Maintenance mode | Second instance with `MAINTENANCE=1` | Pass: pages and API return 503 with `Retry-After: 3600`; `/healthz` stays 200 |
| Origin allowlist | Second instance with `ALLOWED_ORIGINS` | Pass: allowed origin 200, other origin 403 |
| Oversize body (over 16 KB) | Live `curl` | Pass after fix: returns 413 `too_large` (the first version dropped the socket) |
| Form hook contract between `app.js` and rendered HTML | Static check of every selector and `id` against `dist/` | Pass: every selector that app.js queries, the error-box IDs, honeypot name, `formType` inputs and step legends are present on the expected pages |

Defects found and fixed during this verification:

1. Legal pages were built as a flat list, not typed sections. Fixed in `legal.mjs` and `render.mjs`.
2. Shared form fields (privacy acknowledgement, phone, name) lacked a `name` property, so the server reported `undefined: mustBeTrue`. Fixed in `forms.mjs` by naming every shared field.
3. Contact page had no `<h1>`. Added an intro section.
4. Oversize request dropped the connection instead of returning 413. Fixed in the local server (now `scripts/serve.mjs`).
5. Timeline sample lacked the required "Illustrative Demo Data" label. Added a `demo` flag and badge.
6. Missing `favicon.svg` and `og-default.svg`. Added to `public/`.
7. A redundant ternary in the consent mapping. Simplified.
8. A dashboard-label test that matched no pages was rewritten to target the real mockup markup.

## 2. What has NOT been verified (gaps)

These must be closed before launch. They are not claimed as passing.

- **Client-side JavaScript in a real browser.** The mega menu, mobile drawer, FAQ filter, wizard navigation, client validation and success state were reviewed by reading the code and checking the markup they target. They were not executed. Required: a browser test pass in Chromium, Firefox and Safari, including iOS Safari and Android Chrome.
- **Visual design and RTL layout.** Not inspected in a browser. Required: review at 320 px, 768 px, 1024 px and 1440 px in both languages, including mirrored icons, arrows and progress bars.
- **WCAG 2.2 AA.** Only the intent is built in (semantic landmarks, labels, `aria-invalid` and error boxes, focus styles, reduced-motion support). No automated scan (axe, Pa11y) or manual screen-reader testing was run. Target contrast values for the palette have not been measured.
- **Performance.** No Lighthouse or Core Web Vitals measurement. The page weight is small (no frameworks, no images except the SVG favicon and social image), but this is unmeasured.
- **Arabic language quality.** Arabic copy was written to be professionally localised, but has not been reviewed by a native Saudi marketing editor or Arabic-speaking legal counsel.
- **Legal drafts.** These are drafts with bracketed placeholders. They are not legal advice and require review by qualified Saudi counsel (Arabic and English), including data-protection review under the Saudi Personal Data Protection Law.
- **Load and abuse testing.** Rate limiting is in-memory and per process. It is not shared across instances. Not load-tested.
- **Webhook delivery.** Only the "not configured" and failure fallbacks were tested. Delivery to a real endpoint was not tested because none is configured.

## 3. Known issues accepted for v1

- `style-src` includes `'unsafe-inline'` because the design uses inline `style` attributes for stagger timing and widths. Moving these to classes would allow a strict `style-src 'self'`.
- Google Fonts is loaded from `fonts.googleapis.com` and `fonts.gstatic.com`. This sends visitors' IP addresses to Google. Decision needed: self-host the fonts (recommended before launch) or keep the external load and disclose it in the cookie notice. Until decided, the page falls back to system fonts if the request fails.
- Failed webhook notifications are logged only when a webhook is configured and are not retried.
- The Organization and Service structured data is emitted only when verified flags are set. The brand is a placeholder, so these are currently off.
- `consent.noticeVersion` is `draft-2026-10-14`. Update it when counsel approves the notices.

## 4. Recommended launch gate

1. Browser test pass for the form wizard, navigation and the success path against a running server.
2. Accessibility scan plus manual keyboard and screen-reader check in both languages.
3. Responsive and RTL visual review.
4. Lighthouse run on the home page, pricing and one service page.
5. Counsel sign-off on every legal page, with the placeholders replaced.
6. Native Arabic editorial review.
7. Configured webhook or CRM destination under a processor agreement, tested end to end.

## 5. Vercel deployment fix (second build)

**Symptom:** every request to the Vercel deployment returned 500 with "Invalid export found in module /var/task/server.mjs. The default export must be a function or server."

**Cause:** Vercel detects a root `server.mjs` as the application's serverless entry point. That file starts a long-running Node HTTP server and has no default export, so the function crashed on every request.

**Fix:**
- The local server moved to `scripts/serve.mjs`. There is no `server.*` file in the repository root.
- Vercel serves `dist/` as static output (`vercel.json`: `outputDirectory: dist`, `framework: null`).
- `api/enquiry.js` and `api/healthz.js` export default handlers. The enquiry logic is shared with the local server (`src/server/enquiry.mjs`).
- CSP and security headers are generated into `vercel.json` from the same script hashes (`npm run vercel:config`). `tests/vercel-config.test.mjs` fails if they drift.
- `dist/404.html` is written for Vercel's unmatched-path handling.

**Truthfulness on Vercel:** the function has no persistent disk. It reports success only when `NOTIFY_WEBHOOK_URL` accepts the record. With no destination configured, it returns 503.

**Verification:** 28 tests pass (`tests/enquiry-modes.test.mjs` covers the serverless and local modes with the same guarantees). The local server was smoke-tested live. The Vercel function files load and export handlers. **A live deployment was not tested from this environment.** After redeploying, check `/en/`, `/ar/`, `/robots.txt`, `/api/healthz`, a 404 page, and an enquiry against a test destination.
