// Production-style Node server. Zero dependencies.
//   - Serves the static build in ./dist
//   - POST /api/enquiry: validated, rate-limited, stored, notified; truthful responses
//   - Maintenance mode (MAINTENANCE=1): 503 with Retry-After and noindex pages
// Configure with environment variables; see .env.example.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createHash, randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateSubmission } from './src/server/validate.mjs';
import { createStore, makeReference, notifyWebhook, createRateLimiter } from './src/server/submissions.mjs';
import { INLINE } from './src/inline.mjs';
import { SITE } from './src/site.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const MAINTENANCE = process.env.MAINTENANCE === '1';
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const NOTIFY_WEBHOOK_URL = process.env.NOTIFY_WEBHOOK_URL || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
const HSTS = process.env.HSTS === '1';
const FRAME_ANCESTORS = process.env.FRAME_ANCESTORS || "'self' https:";
const MAX_BODY_BYTES = 16 * 1024;

const store = createStore(DATA_DIR);
const limiter = createRateLimiter({ max: Number(process.env.RATE_LIMIT_MAX || 5), windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000) });
setInterval(() => limiter.sweep(), 60 * 1000).unref();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

// ---------- CSP and security headers ----------
function sha256(s) {
  return "'sha256-" + createHash('sha256').update(s, 'utf8').digest('base64') + "'";
}
const SCRIPT_HASHES = [sha256(INLINE.jsClass), sha256(INLINE.rootRedirect)];

function securityHeaders(extra = {}) {
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${SCRIPT_HASHES.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data:",
    "connect-src 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    `frame-ancestors ${FRAME_ANCESTORS}`,
  ].join('; ');
  const h = {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    ...extra,
  };
  if (HSTS) h['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  return h;
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Length': Buffer.byteLength(payload), ...securityHeaders(), ...headers });
  res.end(payload);
}

function sendJson(res, status, obj, headers = {}) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
}

async function sendFile(res, file, status = 200, extraHeaders = {}) {
  const data = await readFile(file);
  const ext = path.extname(file).toLowerCase();
  const isAsset = file.includes(`${path.sep}assets${path.sep}`);
  const cache = isAsset ? 'public, max-age=3600' : 'no-cache';
  send(res, status, data, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache, ...extraHeaders });
}

async function exists(p) {
  try { return (await stat(p)).isFile(); } catch { return false; }
}

function clientIp(req) {
  if (TRUST_PROXY) {
    const xff = req.headers['x-forwarded-for'];
    if (xff) return String(xff).split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        // Do not destroy the socket here: the client must receive the 413.
        // Remaining bytes are discarded and the connection is closed after the response.
        reject(Object.assign(new Error('too_large'), { code: 'too_large' }));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sameOriginOk(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser clients; CSRF risk is limited because we require JSON below
  const host = req.headers.host;
  try {
    const o = new URL(origin);
    if (o.host === host) return true;
    if (ALLOWED_ORIGINS.includes(origin)) return true;
  } catch {}
  return false;
}

// ---------- API ----------
async function handleEnquiry(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method_not_allowed' }, { Allow: 'POST' });
  if (MAINTENANCE) return sendJson(res, 503, { ok: false, error: 'maintenance' }, { 'Retry-After': '3600' });
  if (!sameOriginOk(req)) return sendJson(res, 403, { ok: false, error: 'origin_not_allowed' });

  const ctype = String(req.headers['content-type'] || '').toLowerCase();
  if (!ctype.startsWith('application/json')) return sendJson(res, 415, { ok: false, error: 'unsupported_media_type' });

  const ip = clientIp(req);
  const rl = limiter.check(ip, 'enquiry');
  if (!rl.allowed) return sendJson(res, 429, { ok: false, error: 'rate_limited' }, { 'Retry-After': String(rl.retryAfterSec) });

  let raw;
  try {
    raw = await readBody(req);
  } catch (err) {
    if (err.code === 'too_large') {
      res.setHeader('Connection', 'close');
      return sendJson(res, 413, { ok: false, error: 'too_large' });
    }
    return sendJson(res, 400, { ok: false, error: 'bad_request' });
  }

  let parsed;
  try { parsed = JSON.parse(raw); } catch { return sendJson(res, 400, { ok: false, error: 'invalid_json' }); }

  const result = validateSubmission(parsed);
  if (!result.ok) {
    if (result.fields) return sendJson(res, 400, { ok: false, error: 'validation', fields: result.fields });
    return sendJson(res, result.status || 400, { ok: false, error: result.error || 'invalid' });
  }

  // Store first: a submission is only confirmed once it is durably recorded.
  const reference = makeReference();
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

  try {
    await store.append(record);
  } catch (err) {
    console.error(`[enquiry] storage failure: ${err.code || err.name}`); // no personal data in logs
    return sendJson(res, 500, { ok: false, error: 'storage_failed' });
  }

  const note = await notifyWebhook(record, { url: NOTIFY_WEBHOOK_URL });
  if (note.status !== 'sent' && NOTIFY_WEBHOOK_URL) console.error(`[enquiry] notification pending (${note.reason}) ref=${reference}`);

  return sendJson(res, 200, { ok: true, reference, notification: note.status === 'sent' ? 'sent' : 'pending' });
}

// ---------- pages ----------
function pickLangFromHeader(h = '') {
  const first = String(h).split(',')[0].trim().toLowerCase();
  return first.startsWith('ar') ? 'ar' : 'en';
}

async function servePage(req, res, urlPath, method) {
  const head = method === 'HEAD';
  const parts = urlPath.split('/').filter(Boolean);

  // Root: language negotiation
  if (urlPath === '/') {
    const lang = pickLangFromHeader(req.headers['accept-language']);
    res.writeHead(302, { Location: `/${lang}/`, Vary: 'Accept-Language', ...securityHeaders(), 'Cache-Control': 'no-cache' });
    return res.end();
  }

  // Bare /en or /ar
  if (parts.length === 1 && (parts[0] === 'en' || parts[0] === 'ar') && !urlPath.endsWith('/')) {
    res.writeHead(301, { Location: `/${parts[0]}/`, ...securityHeaders() });
    return res.end();
  }

  // Static assets and well-known files
  if (parts[0] === 'assets' || urlPath === '/robots.txt' || urlPath === '/sitemap.xml') {
    const file = path.normalize(path.join(DIST, urlPath));
    if (!file.startsWith(DIST + path.sep)) return send(res, 400, 'Bad request', { 'Content-Type': 'text/plain' });
    if (await exists(file)) {
      if (head) { res.writeHead(200, securityHeaders()); return res.end(); }
      return sendFile(res, file);
    }
    return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  if (parts[0] === 'healthz') return sendJson(res, 200, { ok: true });

  const lang = parts[0] === 'ar' ? 'ar' : parts[0] === 'en' ? 'en' : null;
  if (!lang) {
    // Unknown root path: English 404
    const notFound = path.join(DIST, 'en', '404', 'index.html');
    return sendFile(res, notFound, 404, { 'Cache-Control': 'no-store' });
  }

  // Maintenance mode for all HTML pages
  if (MAINTENANCE) {
    const maint = path.join(DIST, lang, 'maintenance', 'index.html');
    return sendFile(res, maint, 503, { 'Retry-After': '3600', 'Cache-Control': 'no-store' });
  }

  const rest = parts.slice(1).join('/');
  const langRoot = path.join(DIST, lang);
  const c = path.normalize(path.join(langRoot, rest, 'index.html'));
  if (c.startsWith(langRoot + path.sep)) {
    if (await exists(c)) {
      // Trailing-slash canonicalisation: /en/pricing -> /en/pricing/
      if (rest !== '' && !urlPath.endsWith('/')) {
        res.writeHead(301, { Location: `${urlPath}/`, ...securityHeaders() });
        return res.end();
      }
      if (head) { res.writeHead(200, securityHeaders({ 'Content-Type': 'text/html; charset=utf-8' })); return res.end(); }
      return sendFile(res, c);
    }
  }
  return sendFile(res, path.join(DIST, lang, '404', 'index.html'), 404, { 'Cache-Control': 'no-store' });
}

// ---------- server ----------
const server = http.createServer(async (req, res) => {
  const started = Date.now();
  const url = new URL(req.url, 'http://local');
  const pathname = decodeURIComponent(url.pathname);
  try {
    if (pathname === '/api/enquiry') await handleEnquiry(req, res);
    else if (req.method !== 'GET' && req.method !== 'HEAD') sendJson(res, 405, { ok: false, error: 'method_not_allowed' }, { Allow: 'GET, HEAD' });
    else await servePage(req, res, pathname, req.method);
  } catch (err) {
    console.error(`[server] unhandled error on ${req.method} ${pathname}: ${err && err.name}`);
    if (!res.headersSent) sendJson(res, 500, { ok: false, error: 'server_error' });
  } finally {
    if (process.env.LOG_REQUESTS === '1') console.log(`${req.method} ${pathname} ${res.statusCode} ${Date.now() - started}ms`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`${SITE.brandName.en} site listening on http://${HOST}:${PORT}${MAINTENANCE ? ' [MAINTENANCE MODE]' : ''}`);
  if (!NOTIFY_WEBHOOK_URL) console.log('Notification webhook not configured: submissions are stored and marked notification pending.');
});

export { validateSubmission };
