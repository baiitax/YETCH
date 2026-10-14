// Checks the built site in ./dist:
//  - every internal href/src resolves to a built file
//  - every #fragment resolves to an id on the target page
//  - every page has a canonical, lang/dir, and reciprocal hreflang alternates
//  - the language switch on each page points to the equivalent page in the other language
// Exit code 1 on any failure.
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function urlToFile(urlPath) {
  let p = urlPath.split('#')[0].split('?')[0];
  if (p.endsWith('/')) p += 'index.html';
  return path.join(DIST, p);
}

const idCache = new Map();
async function idsOf(file) {
  if (!idCache.has(file)) {
    const html = await readFile(file, 'utf8');
    idCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idCache.get(file);
}

const problems = [];
const files = await walk(DIST);
let linkCount = 0;

for (const file of files) {
  const rel = path.relative(DIST, file);
  const html = await readFile(file, 'utf8');
  const pageUrl = '/' + rel.replace(/index\.html$/, '').replace(/\\/g, '/');

  // Metadata sanity (the root file is a redirect shell and is exempt)
  if (rel === 'index.html') { /* redirect shell */ } else {
  if (!/<html lang="(en|ar)" dir="(ltr|rtl)"/.test(html)) problems.push(`${rel}: missing lang/dir on <html>`);
  if (!/<link rel="canonical" href="[^"]+"/.test(html)) problems.push(`${rel}: missing canonical`);
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${rel}: missing title`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) problems.push(`${rel}: missing description`);
  const h1 = [...html.matchAll(/<h1[\s>]/g)].length;
  if (h1 !== 1) problems.push(`${rel}: expected exactly one <h1>, found ${h1}`);
  }

  // Internal links
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|javascript:|data:)/.test(href)) continue;
    if (href.startsWith('//')) continue;
    if (href.startsWith('/') === false && !href.startsWith('#')) {
      // relative links are not used in this build
      problems.push(`${rel}: relative link "${href}"`);
      continue;
    }
    linkCount++;
    const [pathPart, frag] = href.split('#');
    let targetFile;
    let targetRel;
    if (pathPart === '') {
      targetFile = file;
      targetRel = rel;
    } else {
      if (pathPart.includes('?')) { /* query is ignored for file lookup */ }
      targetFile = urlToFile(pathPart.split('?')[0]);
      targetRel = path.relative(DIST, targetFile);
      if (!existsSync(targetFile)) {
        // Assets are served directly from dist/assets
        if (pathPart.startsWith('/assets/') && existsSync(path.join(DIST, pathPart))) continue;
        if (pathPart === '/robots.txt' || pathPart === '/sitemap.xml') continue;
        problems.push(`${rel}: broken link ${href}`);
        continue;
      }
    }
    if (frag && targetFile.endsWith('.html')) {
      const ids = await idsOf(targetFile);
      if (!ids.has(decodeURIComponent(frag))) problems.push(`${rel}: missing anchor #${frag} on ${targetRel}`);
    }
  }
}

// Language alternates and language switch correctness on every page
for (const file of files) {
  const rel = path.relative(DIST, file);
  if (rel === 'index.html' || rel.includes('404') || rel.includes('maintenance')) continue;
  const html = await readFile(file, 'utf8');
  const lang = rel.split(path.sep)[0];
  if (!['en', 'ar'].includes(lang)) continue;
  const other = lang === 'en' ? 'ar' : 'en';
  const alt = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]);
  const alts = Object.fromEntries(alt);
  if (!alts.en || !alts.ar || !alts['x-default']) problems.push(`${rel}: incomplete hreflang set`);
  const switchMatch = html.match(/data-lang-switch="[^"]+"[^>]*href="([^"]+)"|href="([^"]+)"[^>]*data-lang-switch/);
  const switchHref = switchMatch ? (switchMatch[1] || switchMatch[2]) : null;
  const expectedPrefix = `/${other}/`;
  if (!switchHref || !switchHref.startsWith(expectedPrefix)) problems.push(`${rel}: language switch does not point to ${expectedPrefix}`);
  else {
    const target = urlToFile(switchHref);
    if (!existsSync(target)) problems.push(`${rel}: language switch target missing (${switchHref})`);
  }
}

console.log(`Checked ${files.length} HTML files and ${linkCount} internal links.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('No broken internal links, anchors, metadata or language-switch problems found.');
