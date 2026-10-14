// Content-Security-Policy and security headers. Used by the local server at runtime
// and by scripts/write-vercel-config.mjs to generate vercel.json.
import { createHash } from 'node:crypto';
import { INLINE } from '../inline.mjs';

export function sha256Source(s) {
  return "'sha256-" + createHash('sha256').update(s, 'utf8').digest('base64') + "'";
}

// The only inline scripts in the site. Hashes change if src/inline.mjs changes;
// vercel.json must then be regenerated (tests/vercel-config.test.mjs enforces this).
export const SCRIPT_HASHES = [sha256Source(INLINE.jsClass), sha256Source(INLINE.rootRedirect)];

export function buildCsp({ frameAncestors = "'self' https:" } = {}) {
  return [
    "default-src 'self'",
    `script-src 'self' ${SCRIPT_HASHES.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data:",
    "connect-src 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    `frame-ancestors ${frameAncestors}`,
  ].join('; ');
}

// Headers that do not depend on the deployment (HSTS is added only when enabled).
export function staticSecurityHeaders({ frameAncestors } = {}) {
  return {
    'Content-Security-Policy': buildCsp({ frameAncestors }),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
  };
}
