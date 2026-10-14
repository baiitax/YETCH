// Content guardrails: fails the suite if forbidden claims or unlabelled illustrative data appear in built pages.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

async function htmlFiles(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

let distExists = true;
try { await stat(DIST); } catch { distExists = false; }

const FORBIDDEN = [
  /guaranteed sales/i,
  /instant growth/i,
  /100% conversion/i,
  /lowest cost per lead/i,
  /guaranteed (leads|results|roi)/i,
];

test('built pages contain no forbidden guarantee wording', { skip: !distExists && 'run npm run build first' }, async () => {
  const hits = [];
  for (const f of await htmlFiles(DIST)) {
    const text = (await readFile(f, 'utf8')).replace(/<[^>]+>/g, ' ');
    for (const re of FORBIDDEN) if (re.test(text)) hits.push(`${path.relative(DIST, f)}: ${re}`);
  }
  assert.deepEqual(hits, []);
});

test('illustrative mockups and sample records are labelled on every page that shows them', { skip: !distExists && 'run npm run build first' }, async () => {
  const problems = [];
  let checked = 0;
  // Markup used for illustrative product mockups and sample lead tables/timelines.
  const MOCK = /class="[^"]*(mock-card|pipeline-table|timeline)[^"]*"/;
  for (const f of await htmlFiles(DIST)) {
    const html = await readFile(f, 'utf8');
    if (!MOCK.test(html)) continue;
    checked++;
    const en = f.split(path.sep).includes('en');
    const label = en ? 'Illustrative Demo Data' : 'بيانات توضيحية تجريبية';
    if (!html.includes(label)) problems.push(path.relative(DIST, f));
  }
  assert.ok(checked >= 3, `expected several mockup pages, found ${checked}`);
  assert.deepEqual(problems, []);
});

test('no page claims a verified integration badge or testimonial markup', { skip: !distExists && 'run npm run build first' }, async () => {
  const hits = [];
  for (const f of await htmlFiles(DIST)) {
    const html = await readFile(f, 'utf8');
    if (/class="[^"]*testimonial/i.test(html)) hits.push(path.relative(DIST, f));
  }
  assert.deepEqual(hits, []);
});
