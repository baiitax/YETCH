# Content Publication Checklist

Do not publish the site (or remove the `noindex` placeholder) until every item below is closed or explicitly accepted by the business owner.

## A. Identity and contact (placeholders in `src/site.mjs`)

- [ ] Confirm the trading brand name in English and Arabic. Currently `[Brand Name]` / `[اسم العلامة]`.
- [ ] Set the production origin. Currently `https://example.invalid`. This drives canonical URLs, hreflang, sitemap and robots.
- [ ] Provide contact channels (`email`, `phone`, `whatsapp`, `address`). They are `null` and not displayed until set. Do not invent an address.
- [ ] Confirm the enquiry handling owner and response-time promise. The site currently promises no response time.

## B. Legal entity and compliance (placeholders in `src/site.mjs` and `src/content/legal.mjs`)

- [ ] Legal entity name (EN and AR).
- [ ] Commercial Registration (CR) number. Not invented; placeholder only.
- [ ] VAT registration number, if applicable. Placeholder only.
- [ ] Saudi establishment status.
- [ ] Privacy request channel and responsible contact.
- [ ] Subprocessors and hosting locations (for the Data Processing Agreement).
- [ ] Data retention periods for enquiries and client data.
- [ ] Cross-border transfer locations.
- [ ] Liability, governing law, dispute mechanism and minimum term or cancellation terms.
- [ ] Counsel review of all six legal drafts in English and Arabic. The drafts carry a "draft" status banner until approved. Update `legalReviewStatus` and remove the banner only after sign-off.
- [ ] Update `consent.noticeVersion` after approval.

## C. Commercial content

- [ ] Confirm provisional prices: Essential SAR 1,500, Growth SAR 3,000, Managed Growth Plus from SAR 5,000, all per month, excluding advertising spend. Confirm the VAT position and the included scope lists.
- [ ] Confirm that each plan's included items match what the team can actually deliver.
- [ ] Confirm the minimum term and cancellation wording.
- [ ] Confirm that no claim appears without evidence. Forbidden wording (e.g. "guaranteed sales", "instant growth", "100% conversion", "lowest cost per lead") is checked by the test suite but must also be checked by a human editor.

## D. Proof points (none are included in v1)

- [ ] Testimonials: only add with written permission from a named client, with the client's approval of the exact wording.
- [ ] Client logos: only with written permission.
- [ ] Statistics: only with source data and methodology. Illustrative figures stay labelled **Illustrative Demo Data** / **بيانات توضيحية تجريبية**.
- [ ] Certifications, partner or platform badges: show only if verified. Do not claim universal platform support.
- [ ] Case studies: none in v1.

## E. Imagery

- [ ] Photography is pending. No stock or client photos are used. Replace the illustrative mockups only with approved assets, and keep the illustrative label where they show sample data.
- [ ] Confirm alt text for every new image in both languages.

## F. Arabic

- [ ] Native Arabic editorial review of all pages, including UI strings in `src/ui.mjs`.
- [ ] Check RTL rendering of numbers, currency (SAR), dates and mixed English terms.

## G. Forms and operations

- [ ] Configure `NOTIFY_WEBHOOK_URL` to a real destination under a processor agreement, or accept that submissions are handled manually from `data/submissions.jsonl`. Document the choice.
- [ ] Test one real end-to-end submission in each form (contact, consultation, get-started) and confirm the reference and the record.
- [ ] Confirm the consultation booking method. Scheduling is **pending configuration**. Do not add a booking embed until it is verified.
- [ ] Authentication and client portal: **pending**. No sign-in or sign-up pages exist, and none should be added until a real auth backend exists.
- [ ] Set `HSTS=1` only after HTTPS is live.
- [ ] Set `FRAME_ANCESTORS` appropriately for production.
- [ ] Set a data backup and retention routine for `DATA_DIR`.

## H. Technical sign-off

- [ ] Browser test pass for the form wizard, navigation and success path.
- [ ] Accessibility scan and manual check in both languages.
- [ ] Responsive and RTL visual review.
- [ ] Lighthouse results recorded.
- [ ] Decision on Google Fonts: self-host, or keep and disclose.
- [ ] Remove `noindex` only after the above are complete. Confirm the sitemap and robots.txt in production.
