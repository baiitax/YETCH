// Static build: renders every public page in English and Arabic into dist/.
// Fails loudly if any bilingual field is missing its translation.
import { mkdir, writeFile, rm, cp, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE } from '../src/site.mjs';
import { INLINE } from '../src/inline.mjs';
import { renderPage, pagePath, absUrl, T } from '../src/render.mjs';
import { corePages } from '../src/content/core.mjs';
import { servicePages, industriesOverview, industryPages } from '../src/content/solutions.mjs';
import { legalPages, utilityPages } from '../src/content/legal.mjs';
import { FORMS } from '../src/forms.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

// ---------- i18n completeness audit ----------
export function auditBilingual(node, where = 'root', problems = []) {
  if (Array.isArray(node)) {
    node.forEach((n, i) => auditBilingual(n, `${where}[${i}]`, problems));
    return problems;
  }
  if (node && typeof node === 'object') {
    const keys = Object.keys(node);
    if (keys.includes('en') || keys.includes('ar')) {
      if (!keys.includes('en') || !keys.includes('ar')) {
        problems.push(`${where}: missing ${keys.includes('en') ? 'ar' : 'en'} translation`);
      } else {
        const { en, ar } = node;
        const empty = (v) => v === '' || v === null || v === undefined;
        if (empty(en) || empty(ar)) problems.push(`${where}: empty translation`);
        if (Array.isArray(en) !== Array.isArray(ar)) problems.push(`${where}: en/ar shape mismatch`);
        else if (Array.isArray(en) && en.length !== ar.length) problems.push(`${where}: en has ${en.length} items, ar has ${ar.length}`);
        if (typeof en === 'string' && typeof ar === 'string' && !/[\u0600-\u06FF]/.test(ar) && !/^\[|^[A-Z0-9 .,:'"()%+\-–—&/]+$/.test(ar) && ar === en) {
          problems.push(`${where}: Arabic text is identical to English`);
        }
        return problems; // do not recurse into translation objects
      }
    }
    for (const k of keys) auditBilingual(node[k], `${where}.${k}`, problems);
  }
  return problems;
}

// ---------- page registry ----------
const allPages = [...corePages, ...servicePages, industriesOverview, ...industryPages, ...legalPages];
const registry = Object.fromEntries(allPages.map((p) => [p.slug, p]));

const INDUSTRY_NAV = [
  { slug: 'industries/real-estate', label: { en: 'Real Estate', ar: 'العقارات' } },
  { slug: 'industries/professional-services', label: { en: 'Professional Services', ar: 'الخدمات المهنية' } },
  { slug: 'industries/home-services', label: { en: 'Home & Commercial Services', ar: 'خدمات المنازل والأعمال' } },
  { slug: 'industries/b2b-distribution', label: { en: 'B2B & Distribution', ar: 'الموردون والتوزيع' } },
  { slug: 'industries/retail-ecommerce', label: { en: 'Retail & E-commerce', ar: 'التجزئة والتجارة الإلكترونية' } },
];
const ctx = {
  registry,
  industryLinks: (lang) => INDUSTRY_NAV.map((l) => ({ slug: l.slug, label: T(l.label, lang) })),
};

// Every nav/footer/sitemap target must exist in the registry.
function assertLinkTargets() {
  const needed = ['', 'services', 'how-it-works', 'pricing', 'resources', 'about', 'consultation', 'get-started', 'contact', 'faq', 'measurement', 'industries', 'privacy', 'cookies', 'terms', 'service-agreement', 'data-processing', 'advertising-disclaimer', ...INDUSTRY_NAV.map((l) => l.slug)];
  const missing = needed.filter((s) => !registry[s]);
  if (missing.length) throw new Error(`Missing page definitions: ${missing.join(', ')}`);
}

// ---------- build ----------
async function writeHtml(relPath, html) {
  const full = path.join(DIST, relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, html, 'utf8');
}

async function main() {
  const problems = auditBilingual(allPages, 'pages');
  if (problems.length) {
    console.error('Bilingual audit failed:\n' + problems.map((p) => '  - ' + p).join('\n'));
    process.exit(1);
  }
  assertLinkTargets();

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // Static assets
  await mkdir(path.join(DIST, 'assets'), { recursive: true });
  await cp(path.join(ROOT, 'src', 'styles.css'), path.join(DIST, 'assets', 'styles.css'));
  await cp(path.join(ROOT, 'src', 'app.js'), path.join(DIST, 'assets', 'app.js'));
  if (existsSync(path.join(ROOT, 'public'))) await cp(path.join(ROOT, 'public'), path.join(DIST, 'assets'), { recursive: true });

  const built = [];
  for (const page of allPages) {
    for (const lang of SITE.langs) {
      const html = renderPage(page, lang, ctx);
      const rel = page.slug === '' ? `${lang}/index.html` : `${lang}/${page.slug}/index.html`;
      await writeHtml(rel, html);
      built.push({ lang, page });
    }
  }

  // Form schemas for browser-side UX validation (server remains authoritative)
  await writeFile(path.join(DIST, 'assets', 'forms.json'), JSON.stringify(FORMS), 'utf8');

  // Utility pages (served by server for 404 / maintenance)
  for (const lang of SITE.langs) {
    await writeHtml(`${lang}/404/index.html`, renderPage(utilityPages.notFound, lang, ctx));
    await writeHtml(`${lang}/maintenance/index.html`, renderPage(utilityPages.maintenance, lang, ctx));
  }

  // Root: language negotiation fallback (the server also redirects)
  await writeHtml('index.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=/en/"><link rel="canonical" href="${SITE.origin}/en/"><title>${SITE.brandName.en}</title></head><body><a href="/en/">English</a> · <a href="/ar/">العربية</a><script>${INLINE.rootRedirect}</script></body></html>`);

  // robots.txt
  const robots = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /en/404/\nDisallow: /ar/404/\nDisallow: /en/maintenance/\nDisallow: /ar/maintenance/\nDisallow: /en/subscription-confirmation/\nDisallow: /ar/subscription-confirmation/\n\nSitemap: ${SITE.origin.replace(/\/$/, '')}/sitemap.xml\n`;
  await writeFile(path.join(DIST, 'robots.txt'), robots, 'utf8');

  // sitemap.xml with hreflang alternates (indexable pages only)
  const indexable = allPages.filter((p) => !p.noindex);
  const urls = indexable
    .map((p) => {
      const alt = SITE.langs
        .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absUrl(l, p.slug)}"/>`)
        .join('\n');
      return SITE.langs
        .map((l) => `  <url>\n    <loc>${absUrl(l, p.slug)}</loc>\n${alt}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${absUrl('en', p.slug)}"/>\n  </url>`)
        .join('\n');
    })
    .join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap, 'utf8');

  console.log(`Built ${built.length} page variants + 404/maintenance for ${SITE.langs.join(' and ')}.`);
  console.log(`Logical pages: ${allPages.length}. Sitemap URLs: ${indexable.length * SITE.langs.length}.`);
}

// Export for tests
export { allPages, registry, ctx, INDUSTRY_NAV };

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
