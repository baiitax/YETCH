// Local production-style server. Zero dependencies.
//   - Serves the static build in ./dist
//   - POST /api/enquiry: validated, rate-limited, stored in DATA_DIR, notified
//   - Maintenance mode (MAINTENANCE=1): 503 with Retry-After and noindex pages
// Run with: npm start. Configure with environment variables; see .env.example.
// (On Vercel this file is not used: the site is static and api/*.js are the functions.)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE } from '../src/site.mjs';
import { loadConfig } from '../src/server/config.mjs';
import { send, sendJson, securityHeaders } from '../src/server/http.mjs';
import { createStore, createRateLimiter } from '../src/server/submissions.mjs';
import { createEnquiryHandler } from '../src/server/enquiry.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const config = loadConfig();

const store = createStore(config.dataDir || path.join(ROOT, 'data'));
const limiter = createRateLimiter({ max: config.rateLimitMax, windowMs: config.rateLimitWindowMs });
setInterval(() => limiter.sweep(), 60 * 1000).unref();
const handleEnquiry = createEnquiryHandler({ store, limiter, config });

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

async function sendFile(res, file, status = 200, extraHeaders = {}) {
  const data = await readFile(file);
  const ext = path.extname(file).toLowerCase();
  const isAsset = file.includes(`${path.sep}assets${path.sep}`);
  const cache = isAsset ? 'public, max-age=3600' : 'no-cache';
  send(res, config, status, data, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cache, ...extraHeaders });
}

async function exists(p) {
  try { return (await stat(p)).isFile(); } catch { return false; }
}

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
    res.writeHead(302, { Location: `/${lang}/`, Vary: 'Accept-Language', ...securityHeaders(config), 'Cache-Control': 'no-cache' });
    return res.end();
  }

  // Bare /en or /ar
  if (parts.length === 1 && (parts[0] === 'en' || parts[0] === 'ar') && !urlPath.endsWith('/')) {
    res.writeHead(301, { Location: `/${parts[0]}/`, ...securityHeaders(config) });
    return res.end();
  }

  // Static assets and well-known files
  if (parts[0] === 'assets' || urlPath === '/robots.txt' || urlPath === '/sitemap.xml') {
    const file = path.normalize(path.join(DIST, urlPath));
    if (!file.startsWith(DIST + path.sep)) return send(res, config, 400, 'Bad request', { 'Content-Type': 'text/plain' });
    if (await exists(file)) {
      if (head) { res.writeHead(200, securityHeaders(config)); return res.end(); }
      return sendFile(res, file);
    }
    return send(res, config, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }

  if (parts[0] === 'healthz') return sendJson(res, config, 200, { ok: true });

  const lang = parts[0] === 'ar' ? 'ar' : parts[0] === 'en' ? 'en' : null;
  if (!lang) return sendFile(res, path.join(DIST, 'en', '404', 'index.html'), 404, { 'Cache-Control': 'no-store' });

  // Maintenance mode for all HTML pages
  if (config.maintenance) {
    return sendFile(res, path.join(DIST, lang, 'maintenance', 'index.html'), 503, { 'Retry-After': '3600', 'Cache-Control': 'no-store' });
  }

  const rest = parts.slice(1).join('/');
  const langRoot = path.join(DIST, lang);
  const c = path.normalize(path.join(langRoot, rest, 'index.html'));
  if (c.startsWith(langRoot + path.sep) && (await exists(c))) {
    // Trailing-slash canonicalisation: /en/pricing -> /en/pricing/
    if (rest !== '' && !urlPath.endsWith('/')) {
      res.writeHead(301, { Location: `${urlPath}/`, ...securityHeaders(config) });
      return res.end();
    }
    if (head) { res.writeHead(200, securityHeaders(config, { 'Content-Type': 'text/html; charset=utf-8' })); return res.end(); }
    return sendFile(res, c);
  }
  return sendFile(res, path.join(DIST, lang, '404', 'index.html'), 404, { 'Cache-Control': 'no-store' });
}

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  const url = new URL(req.url, 'http://local');
  const pathname = decodeURIComponent(url.pathname);
  try {
    if (pathname === '/api/enquiry') await handleEnquiry(req, res);
    else if (req.method !== 'GET' && req.method !== 'HEAD') sendJson(res, config, 405, { ok: false, error: 'method_not_allowed' }, { Allow: 'GET, HEAD' });
    else await servePage(req, res, pathname, req.method);
  } catch (err) {
    console.error(`[server] unhandled error on ${req.method} ${pathname}: ${err && err.name}`);
    if (!res.headersSent) sendJson(res, config, 500, { ok: false, error: 'server_error' });
  } finally {
    if (config.logRequests) console.log(`${req.method} ${pathname} ${res.statusCode} ${Date.now() - started}ms`);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`${SITE.brandName.en} site listening on http://${HOST}:${PORT}${config.maintenance ? ' [MAINTENANCE MODE]' : ''}`);
  if (!config.notifyWebhookUrl) console.log('Notification webhook not configured: submissions are stored and marked notification pending.');
});
