// Submission storage, notification adapter and in-memory rate limiting.
// v1 storage is an append-only JSON Lines file (owner-only permissions).
// Replace with a database + backups before high-volume use (see docs/INTEGRATIONS.md).
import { mkdir, appendFile, chmod } from 'node:fs/promises';
import { randomBytes, createHash } from 'node:crypto';
import path from 'node:path';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no look-alikes (0/O, 1/I)

export function makeReference(now = new Date()) {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const bytes = randomBytes(6);
  let code = '';
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `ENQ-${y}${m}${d}-${code}`;
}

export function createStore(dataDir) {
  const file = path.join(dataDir, 'submissions.jsonl');
  let ready = null;
  async function init() {
    if (!ready) {
      ready = (async () => {
        await mkdir(dataDir, { recursive: true, mode: 0o700 });
        try { await chmod(dataDir, 0o700); } catch {}
      })();
    }
    return ready;
  }
  return {
    file,
    async append(record) {
      await init();
      const line = JSON.stringify(record) + '\n';
      await appendFile(file, line, { encoding: 'utf8', mode: 0o600 });
    },
  };
}

// Notification adapter. Configure NOTIFY_WEBHOOK_URL to forward to an automation tool
// (for example an n8n, Make or Zapier webhook that sends the email). Without it, the
// submission is still stored and the response says notification is pending.
export async function notifyWebhook(record, { url, timeoutMs = 5000, fetchImpl = fetch } = {}) {
  if (!url) return { status: 'pending', reason: 'not_configured' };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'website-enquiry',
        reference: record.reference,
        formType: record.formType,
        lang: record.lang,
        receivedAt: record.receivedAt,
        data: record.data,
      }),
      signal: ctrl.signal,
    });
    if (res.ok) return { status: 'sent' };
    return { status: 'pending', reason: `http_${res.status}` };
  } catch (err) {
    return { status: 'pending', reason: err && err.name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

// Fixed-window rate limiter keyed by a salted hash of the client address.
// Raw IP addresses are never stored.
export function createRateLimiter({ windowMs = 10 * 60 * 1000, max = 5, salt = randomBytes(16).toString('hex') } = {}) {
  const hits = new Map();
  function keyFor(ip) {
    return createHash('sha256').update(salt + '|' + (ip || 'unknown')).digest('hex');
  }
  return {
    check(ip, bucket) {
      const now = Date.now();
      const key = keyFor(ip) + '|' + bucket;
      const entry = hits.get(key);
      if (!entry || now - entry.start > windowMs) {
        hits.set(key, { start: now, count: 1 });
        return { allowed: true };
      }
      entry.count += 1;
      if (entry.count > max) {
        return { allowed: false, retryAfterSec: Math.ceil((windowMs - (now - entry.start)) / 1000) };
      }
      return { allowed: true };
    },
    // Periodic cleanup so the map does not grow without bound.
    sweep() {
      const now = Date.now();
      for (const [k, v] of hits) if (now - v.start > windowMs) hits.delete(k);
    },
  };
}
