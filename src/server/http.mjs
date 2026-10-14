// Small HTTP helpers shared by the local server and the Vercel functions.
import { MAX_BODY_BYTES } from './config.mjs';
import { staticSecurityHeaders } from './headers.mjs';

export function securityHeaders(config, extra = {}) {
  const h = { ...staticSecurityHeaders({ frameAncestors: config.frameAncestors }), ...extra };
  if (config.hsts) h['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  return h;
}

export function send(res, config, status, body, headers = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Length': Buffer.byteLength(payload), ...securityHeaders(config), ...headers });
  res.end(payload);
}

export function sendJson(res, config, status, obj, headers = {}) {
  send(res, config, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
}

export function clientIp(req, config) {
  if (config.trustProxy) {
    const xff = req.headers['x-forwarded-for'];
    if (xff) return String(xff).split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function sameOriginOk(req, config) {
  const origin = req.headers.origin;
  if (!origin) return true; // non-browser clients; JSON content type is still required
  try {
    const o = new URL(origin);
    if (o.host === req.headers.host) return true;
    if (config.allowedOrigins.includes(origin)) return true;
  } catch {}
  return false;
}

// Reads the JSON body as a string, enforcing the size limit.
// Vercel may have already consumed the stream and set req.body; use that when present.
export function readBody(req, maxBytes = MAX_BODY_BYTES) {
  if (req.body !== undefined && req.body !== null) {
    const text = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(text) > maxBytes) return Promise.reject(Object.assign(new Error('too_large'), { code: 'too_large' }));
    return Promise.resolve(text);
  }
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > maxBytes) {
        // Do not destroy the socket: the client must receive the 413.
        reject(Object.assign(new Error('too_large'), { code: 'too_large' }));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
