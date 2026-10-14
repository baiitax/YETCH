# Integration Setup

This build integrates with nothing by default. Every integration below is **pending configuration**. None is shown to visitors as available until it is verified in your environment.

## 0. Vercel (current hosting target)

- Vercel serves `dist/` statically and runs `api/enquiry.js` for enquiries. The Vercel filesystem is not durable, so **`NOTIFY_WEBHOOK_URL` is required** there. The destination is the record store. Without it, enquiries return 503 and are not reported as received.
- Set environment variables in Project Settings. Do not put webhook URLs in `vercel.json` or source control.
- After changing `src/inline.mjs` or the security headers, run `npm run vercel:config` and commit `vercel.json`.
- Maintenance mode is not available as an environment switch on the static site.

## 1. Enquiry storage (local server only)

- Local server (`npm start`): records are appended to `DATA_DIR/submissions.jsonl`, one JSON object per line. Vercel does not use this store.
- Directory mode 0700, file mode 0600. Owned by the service user.
- Each record contains: `reference`, `receivedAt`, `formType`, `lang`, `data` (validated and normalised), `consent` (privacy acknowledgement, marketing opt-in, notice version) and `status: "new"`.
- Recommended: store `DATA_DIR` on an encrypted volume outside the web root, back it up, and apply your retention schedule.

Reading records (example):

```bash
node -e "for (const l of require('fs').readFileSync('data/submissions.jsonl','utf8').trim().split('\n')) { const r = JSON.parse(l); console.log(r.reference, r.formType, r.receivedAt, r.data.workEmail) }"
```

## 2. Notification webhook (pending configuration)

Set `NOTIFY_WEBHOOK_URL` to an HTTPS endpoint you control or contract with.

- The server sends `POST` with `Content-Type: application/json`:

  ```json
  {
    "source": "website-enquiry",
    "reference": "ENQ-20261014-XXXXXX",
    "formType": "contact",
    "lang": "en",
    "receivedAt": "2026-10-14T10:00:00.000Z",
    "data": { "...": "validated fields" }
  }
  ```

- The request times out after 5 seconds. Any non-2xx response, timeout or network error leaves the submission stored and marked pending. The visitor is then told the enquiry was received, but not that a team has been notified.
- The payload contains personal data. Use HTTPS only, and make sure the destination is covered by a data processing agreement and your retention rules.
- Failed notifications are not retried in v1. Build a retry or export job before relying on the webhook for time-sensitive enquiries.

Suggested destinations (choose one, after the business has confirmed the tool and contract): a shared mailbox via an automation service, a CRM intake endpoint, or a helpdesk API. Do not add a destination that is not contracted.

## 3. Hosting and transport

- Run `npm run build` to render `dist/`, then `npm start` under a process manager.
- Put a TLS-terminating reverse proxy in front. Set `TRUST_PROXY=1` only if that proxy overwrites `X-Forwarded-For`.
- Set `HSTS=1` once the production domain is HTTPS-only.
- Health check: `GET /healthz` returns `200` with `{"ok":true}`.
- Maintenance: set `MAINTENANCE=1` and restart, or handle at the proxy. The API returns 503 with `Retry-After: 3600`.

## 4. Fonts (decision pending)

The site currently loads Inter and IBM Plex Sans Arabic from Google Fonts. Options:

1. **Self-host (recommended):** download the font files under their licences into `public/fonts/`, reference them locally, and remove the Google Fonts origins from the CSP.
2. **Keep and disclose:** keep the external request and describe it in the cookie notice. The request exposes visitor IP addresses to Google.

## 5. Analytics and marketing tags (not included)

v1 loads no analytics. `SITE.analytics.enabled` is `false`. Before adding any tag:

- Obtain consent under your cookie notice, and make sure it is blocked until consent.
- Add the origin to the CSP `script-src` explicitly. Do not use `unsafe-inline`.
- Document the tag in the cookie notice.

## 6. Scheduling, CRM, payments, authentication (all pending)

| Integration | Status | Rule |
| --- | --- | --- |
| Consultation booking | Pending | No booking embed until a scheduling tool is chosen and verified. |
| CRM | Pending | Use the webhook adapter, or a dedicated adapter after the CRM is chosen. |
| Payments and subscriptions | Pending | The Get Started form does not take payment. Confirmation pages say no subscription is active. |
| Client sign-in or portal | Pending | No sign-in or sign-up pages until a real auth backend exists. |
| Advertising accounts | Not supported | Never collect advertising account passwords. |

## 7. Security configuration checklist

- [ ] `DATA_DIR` outside the web root, not world-readable.
- [ ] `ALLOWED_ORIGINS` empty unless a specific cross-origin client is needed.
- [ ] `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW_MS` set for expected traffic. The limiter is per process, so run one instance or share state before scaling out.
- [ ] No secrets in source control. `.env` is git-ignored. The webhook URL is treated as a secret if it contains a token.
- [ ] Logs reviewed: request logs (`LOG_REQUESTS=1`) include method, path, status and timing only.
