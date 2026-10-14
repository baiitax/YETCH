// POST /api/enquiry. Shared by the local server and the Vercel function.
//
// Truthfulness rules:
//   - 200 {ok:true} is returned only after the submission is durably recorded.
//   - With local storage (DATA_DIR): store first, then notify (notification may be "pending").
//   - Without local storage (serverless): the notification destination IS the record.
//     If no destination is configured, or it does not accept the record, the response is 503.
//     Nothing is reported as received in that case.
import { validateSubmission } from './validate.mjs';
import { makeReference, notifyWebhook } from './submissions.mjs';
import { readBody, sameOriginOk, sendJson, clientIp } from './http.mjs';

export function createEnquiryHandler({ store = null, limiter, config, notify = notifyWebhook, makeRef = makeReference }) {
  return async function handleEnquiry(req, res) {
    if (req.method !== 'POST') return sendJson(res, config, 405, { ok: false, error: 'method_not_allowed' }, { Allow: 'POST' });
    if (config.maintenance) return sendJson(res, config, 503, { ok: false, error: 'maintenance' }, { 'Retry-After': '3600' });
    if (!store && !config.notifyWebhookUrl) {
      return sendJson(res, config, 503, { ok: false, error: 'storage_not_configured' }, { 'Retry-After': '3600' });
    }
    if (!sameOriginOk(req, config)) return sendJson(res, config, 403, { ok: false, error: 'origin_not_allowed' });

    const ctype = String(req.headers['content-type'] || '').toLowerCase();
    if (!ctype.startsWith('application/json')) return sendJson(res, config, 415, { ok: false, error: 'unsupported_media_type' });

    const rl = limiter.check(clientIp(req, config), 'enquiry');
    if (!rl.allowed) return sendJson(res, config, 429, { ok: false, error: 'rate_limited' }, { 'Retry-After': String(rl.retryAfterSec) });

    let raw;
    try {
      raw = await readBody(req);
    } catch (err) {
      if (err.code === 'too_large') {
        res.setHeader('Connection', 'close');
        return sendJson(res, config, 413, { ok: false, error: 'too_large' });
      }
      return sendJson(res, config, 400, { ok: false, error: 'bad_request' });
    }

    let parsed;
    try { parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return sendJson(res, config, 400, { ok: false, error: 'invalid_json' }); }

    const result = validateSubmission(parsed);
    if (!result.ok) {
      if (result.fields) return sendJson(res, config, 400, { ok: false, error: 'validation', fields: result.fields });
      return sendJson(res, config, result.status || 400, { ok: false, error: result.error || 'invalid' });
    }

    const reference = makeRef();
    const record = {
      reference,
      receivedAt: new Date().toISOString(),
      formType: result.formType,
      lang: result.lang,
      data: result.data,
      consent: {
        privacyNoticeAcknowledged: !!result.data.privacyAck,
        marketingOptIn: !!result.data.marketingOptIn,
        noticeVersion: 'draft-2026-10-14', // update when the Privacy Policy is approved
      },
      status: 'new',
    };

    if (store) {
      try {
        await store.append(record);
      } catch (err) {
        console.error(`[enquiry] storage failure: ${err.code || err.name}`); // no personal data in logs
        return sendJson(res, config, 500, { ok: false, error: 'storage_failed' });
      }
      const note = await notify(record, { url: config.notifyWebhookUrl });
      if (note.status !== 'sent' && config.notifyWebhookUrl) console.error(`[enquiry] notification pending (${note.reason}) ref=${reference}`);
      return sendJson(res, config, 200, { ok: true, reference, notification: note.status === 'sent' ? 'sent' : 'pending' });
    }

    // Serverless: the configured destination must accept the record.
    const note = await notify(record, { url: config.notifyWebhookUrl });
    if (note.status !== 'sent') {
      console.error(`[enquiry] destination did not accept record (${note.reason}) ref=${reference}`);
      return sendJson(res, config, 503, { ok: false, error: 'delivery_failed' }, { 'Retry-After': '300' });
    }
    return sendJson(res, config, 200, { ok: true, reference, notification: 'sent' });
  };
}
