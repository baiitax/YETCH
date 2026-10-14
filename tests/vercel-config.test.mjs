// vercel.json must match the generator, so CSP script hashes never drift from src/inline.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { vercelConfig } from '../scripts/write-vercel-config.mjs';
import { SCRIPT_HASHES } from '../src/server/headers.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('vercel.json matches the generator (run npm run vercel:config after changes)', async () => {
  const onDisk = JSON.parse(await readFile(path.join(ROOT, 'vercel.json'), 'utf8'));
  assert.deepEqual(onDisk, JSON.parse(JSON.stringify(vercelConfig())));
});

test('vercel.json serves static dist output with trailing slashes; only /healthz is rewritten', async () => {
  const cfg = JSON.parse(await readFile(path.join(ROOT, 'vercel.json'), 'utf8'));
  assert.equal(cfg.outputDirectory, 'dist');
  assert.equal(cfg.framework, null);
  assert.equal(cfg.trailingSlash, true);
  assert.deepEqual(cfg.rewrites, [{ source: '/healthz', destination: '/api/healthz' }]);
});

test('CSP in vercel.json contains the current inline-script hashes and no unsafe-inline for scripts', async () => {
  const cfg = JSON.parse(await readFile(path.join(ROOT, 'vercel.json'), 'utf8'));
  const csp = cfg.headers[0].headers.find((h) => h.key === 'Content-Security-Policy').value;
  for (const h of SCRIPT_HASHES) assert.ok(csp.includes(h), `missing ${h}`);
  assert.match(csp, /script-src 'self' /);
  assert.doesNotMatch(csp.match(/script-src[^;]*/)[0], /unsafe-inline/);
});
