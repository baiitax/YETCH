// Enquiry handler in both deployment modes, exercised with minimal request/response doubles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEnquiryHandler } from '../src/server/enquiry.mjs';
import { createRateLimiter } from '../src/server/submissions.mjs';
import { loadConfig } from '../src/server/config.mjs';

const body = {
  formType: 'contact', lang: 'en', enquiryType: 'service', name: 'Omar Test', businessName: 'Test Co',
  workEmail: 'omar@example.com', preferredLanguage: 'en', industry: 'other',
  challenge: 'We want to organise enquiries and follow-up.', privacyAck: 'true',
};

function fakeReq(payload = body, headers = {}) {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json', host: 'yech.example', ...headers },
    body: JSON.stringify(payload), // pre-parsed transport body, as on Vercel
    socket: { remoteAddress: '203.0.113.7' },
  };
}

function fakeRes() {
  const res = {
    statusCode: 0, headers: {}, payload: '', headersSent: false,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    writeHead(status, h = {}) { this.statusCode = status; Object.assign(this.headers, Object.fromEntries(Object.entries(h).map(([k, v]) => [k.toLowerCase(), v]))); this.headersSent = true; },
    end(p = '') { this.payload = p; },
    json() { return JSON.parse(this.payload); },
  };
  return res;
}

const baseConfig = (over = {}) => ({ ...loadConfig({}), ...over });
const limiter = () => createRateLimiter({ max: 100, windowMs: 60_000, salt: 'test' });

test('serverless: no destination configured -> 503, never reports receipt', async () => {
  const handle = createEnquiryHandler({ store: null, limiter: limiter(), config: baseConfig({ notifyWebhookUrl: '' }) });
  const res = fakeRes();
  await handle(fakeReq(), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.json().error, 'storage_not_configured');
  assert.equal(res.json().ok, false);
});

test('serverless: destination accepts the record -> 200 sent', async () => {
  let delivered = null;
  const notify = async (record) => { delivered = record; return { status: 'sent' }; };
  const handle = createEnquiryHandler({ store: null, limiter: limiter(), config: baseConfig({ notifyWebhookUrl: 'https://hooks.example/x' }), notify });
  const res = fakeRes();
  await handle(fakeReq(), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().notification, 'sent');
  assert.match(res.json().reference, /^ENQ-\d{8}-[A-Z0-9]{6}$/);
  assert.equal(delivered.data.workEmail, 'omar@example.com');
});

test('serverless: destination rejects or fails -> 503 delivery_failed, not 200', async () => {
  const notify = async () => ({ status: 'pending', reason: 'http_500' });
  const handle = createEnquiryHandler({ store: null, limiter: limiter(), config: baseConfig({ notifyWebhookUrl: 'https://hooks.example/x' }), notify });
  const res = fakeRes();
  await handle(fakeReq(), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.json().error, 'delivery_failed');
});

test('local mode: stored, then reported pending when no webhook -> 200 pending', async () => {
  const stored = [];
  const store = { append: async (r) => { stored.push(r); } };
  const handle = createEnquiryHandler({ store, limiter: limiter(), config: baseConfig({ notifyWebhookUrl: '' }) });
  const res = fakeRes();
  await handle(fakeReq(), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().notification, 'pending');
  assert.equal(stored.length, 1);
});

test('local mode: storage failure -> 500, never 200', async () => {
  const store = { append: async () => { throw Object.assign(new Error('disk full'), { code: 'ENOSPC' }); } };
  const handle = createEnquiryHandler({ store, limiter: limiter(), config: baseConfig({ notifyWebhookUrl: '' }) });
  const res = fakeRes();
  await handle(fakeReq(), res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.json().error, 'storage_failed');
});

test('invalid submission returns field codes and is not stored', async () => {
  let stored = 0;
  const store = { append: async () => { stored++; } };
  const handle = createEnquiryHandler({ store, limiter: limiter(), config: baseConfig({ notifyWebhookUrl: '' }) });
  const res = fakeRes();
  await handle(fakeReq({ formType: 'contact', lang: 'en' }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.json().fields.workEmail, 'required');
  assert.equal(stored, 0);
});

test('cross-origin, wrong content type and GET are refused', async () => {
  const handle = createEnquiryHandler({ store: null, limiter: limiter(), config: baseConfig({ notifyWebhookUrl: 'https://hooks.example/x' }), notify: async () => ({ status: 'sent' }) });
  let res = fakeRes();
  await handle(fakeReq(body, { origin: 'https://evil.example' }), res);
  assert.equal(res.statusCode, 403);
  res = fakeRes();
  await handle(fakeReq(body, { 'content-type': 'text/plain' }), res);
  assert.equal(res.statusCode, 415);
  res = fakeRes();
  await handle({ ...fakeReq(), method: 'GET' }, res);
  assert.equal(res.statusCode, 405);
});

test('maintenance returns 503 with Retry-After', async () => {
  const handle = createEnquiryHandler({ store: null, limiter: limiter(), config: baseConfig({ maintenance: true, notifyWebhookUrl: 'https://hooks.example/x' }) });
  const res = fakeRes();
  await handle(fakeReq(), res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.headers['retry-after'], '3600');
});
