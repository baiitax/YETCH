import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, stat, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { makeReference, createStore, createRateLimiter, notifyWebhook } from '../src/server/submissions.mjs';

test('reference has ENQ-YYYYMMDD-XXXXXX shape with unambiguous characters', () => {
  const ref = makeReference(new Date('2026-10-14T10:00:00Z'));
  assert.match(ref, /^ENQ-20261014-[A-HJ-NP-Z2-9]{6}$/);
});

test('store appends JSON lines with owner-only permissions', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'enq-'));
  try {
    const store = createStore(path.join(dir, 'data'));
    await store.append({ reference: 'ENQ-1', status: 'new' });
    await store.append({ reference: 'ENQ-2', status: 'new' });
    const lines = (await readFile(path.join(dir, 'data', 'submissions.jsonl'), 'utf8')).trim().split('\n');
    assert.equal(lines.length, 2);
    assert.equal(JSON.parse(lines[1]).reference, 'ENQ-2');
    const mode = (await stat(path.join(dir, 'data', 'submissions.jsonl'))).mode & 0o777;
    assert.equal(mode, 0o600);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('rate limiter allows up to max per window then blocks with Retry-After', () => {
  const rl = createRateLimiter({ max: 2, windowMs: 60_000, salt: 'test' });
  assert.equal(rl.check('1.2.3.4', 'enquiry').allowed, true);
  assert.equal(rl.check('1.2.3.4', 'enquiry').allowed, true);
  const blocked = rl.check('1.2.3.4', 'enquiry');
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSec > 0 && blocked.retryAfterSec <= 60);
  assert.equal(rl.check('5.6.7.8', 'enquiry').allowed, true);
});

test('webhook without URL reports pending, never sent', async () => {
  const r = await notifyWebhook({ reference: 'ENQ-1' }, { url: '' });
  assert.notEqual(r.status, 'sent');
});

test('webhook failure reports pending instead of throwing', async () => {
  const fail = async () => { throw new Error('network down'); };
  const r = await notifyWebhook({ reference: 'ENQ-1' }, { url: 'https://hooks.example.invalid/x', fetchImpl: fail });
  assert.notEqual(r.status, 'sent');
});
