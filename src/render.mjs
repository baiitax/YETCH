// HTML rendering for the static site. Pure functions: page data + language -> HTML string.
import { SITE, PLANS, PLAN_DISCLOSURES } from './site.mjs';
import { UI } from './ui.mjs';
import { FORMS, HONEYPOT_FIELD } from './forms.mjs';
import { INLINE } from './inline.mjs';

// ---------- helpers ----------
export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Resolve a bilingual value: {en, ar} -> string for the current language.
export function T(x, lang) {
  if (x && typeof x === 'object' && !Array.isArray(x) && ('en' in x || 'ar' in x)) {
    return x[lang] ?? x.en;
  }
  return x;
}

export function fmt(n, lang) {
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : 'en-GB').format(n);
}

export function sar(n, lang) {
  return lang === 'ar' ? `${fmt(n, lang)} ر.س` : `SAR ${fmt(n, lang)}`;
}

// Canonical page path for a language + slug. '' is the homepage.
export function pagePath(lang, slug) {
  return `/${lang}/${slug ? slug + '/' : ''}`;
}

export function absUrl(lang, slug) {
  return SITE.origin.replace(/\/$/, '') + pagePath(lang, slug);
}

const ICONS = {
  chart: 'M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-6',
  target: 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
  funnel: 'M3 4h18l-7 9v6l-4 2v-8z',
  chat: 'M4 5h16v11H9l-5 4z',
  clock: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 7v5l3 2',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  search: 'M11 11m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M20 20l-4.5-4.5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  building: 'M4 21V5h10v16M14 9h6v12M4 21h16M8 9h2M8 13h2M8 17h2',
  briefcase: 'M3 7h18v13H3zM9 7V4h6v3',
  wrench: 'M14.5 6.5a4 4 0 0 0 4.9 4.9l-8.4 8.4a2 2 0 0 1-2.8-2.8zM15 4l5 5',
  truck: 'M3 7h11v9H3zM14 10h4l3 3v3h-7zM6.5 18.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M17.5 18.5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0',
  cart: 'M3 4h2l2 11h10l2-8H7M9.5 19.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0M17.5 19.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
  pen: 'M4 20l4-1 11-11-3-3L5 16zM14 6l3 3',
  check: 'M5 12l4 4 10-10',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  globe: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  lock: 'M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6',
  users: 'M9 8m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M3 20c0-3 3-5 6-5s6 2 6 5M17 9m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M16 14c3 0 5 2 5 4',
  calendar: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  flag: 'M5 21V4M5 4h12l-2 4 2-4M5 8h12l-2 4 2 4H5',
  alert: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M12 8v5M12 16v.5',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
  mail: 'M3 5h18v14H3zM3 7l9 6 9-6',
  merge: 'M6 4v6a4 4 0 0 0 4 4h4M18 20v-6a4 4 0 0 0-4-4h-4M6 4l-2 2M6 4l2 2M18 20l-2-2M18 20l2-2',
  route: 'M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M18 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0M6 17c0-6 12-4 12-10',
  note: 'M5 4h14v16H5zM9 8h6M9 12h6M9 16h4',
};

export function icon(name, cls = '') {
  const d = ICONS[name] || ICONS.layers;
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
}

// ---------- link + button helpers ----------
function linkTo(slug, lang) {
  return pagePath(lang, slug);
}

function btn(action, lang, ui) {
  const label = T(action.label, lang);
  const href = action.href ?? linkTo(action.to, lang);
  const variant = action.variant || 'primary';
  return `<a class="btn btn-${variant}" href="${esc(href)}">${esc(label)}${variant === 'primary' || variant === 'ghost' ? icon('arrow', 'icon-sm dir-flip') : ''}</a>`;
}

// ---------- shell pieces ----------
function header(page, lang, ctx) {
  const ui = UI[lang];
  const other = ui.otherLang.code;
  const active = page.active || '';
  const cur = (k) => (active === k ? ' aria-current="page"' : '');
  const solutionsActive = ['services', 'industries'].includes(active) ? ' is-active' : '';
  const slugPath = (slug) => linkTo(slug, lang);
  const otherPath = (slug) => linkTo(slug, other);
  const brand = T(SITE.brandName, lang);

  return `
<a class="skip-link" href="#main">${esc(ui.skip)}</a>
<header class="site-header" data-header>
  <div class="container nav-row glass">
    <a class="brand" href="${slugPath('')}" aria-label="${esc(brand)} — ${esc(ui.nav.home)}">
      <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32"><rect x="2" y="2" width="28" height="28" rx="8" fill="#203D69"/><path d="M8 21 L14 14 L18 18 L24 10" stroke="#20B7A4" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="10" r="2.4" fill="#D7AF65"/></svg></span>
      <span class="brand-text">${esc(brand)}</span>
    </a>

    <nav class="primary-nav" aria-label="${esc(ui.nav.mainNav)}">
      <ul class="nav-list">
        <li><a href="${slugPath('')}" class="nav-link"${cur('home')}>${esc(ui.nav.home)}</a></li>
        <li class="has-mega${solutionsActive}" data-mega>
          <button type="button" class="nav-link nav-button" aria-expanded="false" aria-controls="mega-solutions" data-mega-toggle>${esc(ui.nav.solutions)}<span class="caret" aria-hidden="true"></span></button>
          <div id="mega-solutions" class="mega glass" hidden>
            <div class="mega-grid">
              <div>
                <p class="mega-heading">${esc(ui.menu.servicesHeading)}</p>
                <ul class="mega-list">
                  <li><a href="${slugPath('services')}">${esc(ui.nav.solutionsOverview)}</a></li>
                  <li><a href="${slugPath('services/campaign-management')}">${esc(ui.menu.campaign)}</a></li>
                  <li><a href="${slugPath('services/lead-management')}">${esc(ui.menu.lead)}</a></li>
                  <li><a href="${slugPath('services/follow-up')}">${esc(ui.menu.followup)}</a></li>
                  <li><a href="${slugPath('services/analytics')}">${esc(ui.menu.analytics)}</a></li>
                </ul>
              </div>
              <div>
                <p class="mega-heading">${esc(ui.menu.industriesHeading)}</p>
                <ul class="mega-list">
                  ${ctx.industryLinks(lang).map((l) => `<li><a href="${slugPath(l.slug)}">${esc(l.label)}</a></li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </li>
        <li><a href="${slugPath('how-it-works')}" class="nav-link"${cur('how')}>${esc(ui.nav.how)}</a></li>
        <li><a href="${slugPath('pricing')}" class="nav-link"${cur('pricing')}>${esc(ui.nav.pricing)}</a></li>
        <li><a href="${slugPath('resources')}" class="nav-link"${cur('resources')}>${esc(ui.nav.resources)}</a></li>
        <li><a href="${slugPath('about')}" class="nav-link"${cur('about')}>${esc(ui.nav.about)}</a></li>
      </ul>
    </nav>

    <div class="nav-actions">
      <div class="lang-switch" role="group" aria-label="${esc(ui.nav.langSwitch)}">
        <a href="${otherPath(page.slug)}" lang="${UI[other].htmlLang}" hreflang="${other}" data-lang-switch="${other}" class="lang-link">${esc(ui.otherLang.label)}</a>
      </div>
      <a class="nav-login" href="${esc(SITE.engineLoginUrl)}" rel="noopener">${esc(ui.nav.loginCta)}</a>
      <a class="btn btn-ghost btn-sm" href="${slugPath('get-started')}">${esc(ui.nav.secondaryCta)}</a>
      <a class="btn btn-primary btn-sm" href="${slugPath('consultation')}">${esc(ui.nav.primaryCta)}</a>
      <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-drawer" data-drawer-toggle>
        <span class="sr-only" data-menu-label>${esc(ui.nav.menuOpen)}</span>
        <span class="bars" aria-hidden="true"></span>
      </button>
    </div>
  </div>

  <div id="mobile-drawer" class="drawer glass" hidden data-drawer>
    <nav aria-label="${esc(ui.nav.mobileNav)}">
      <ul class="drawer-list">
        <li><a href="${slugPath('')}">${esc(ui.nav.home)}</a></li>
        <li><a href="${slugPath('services')}">${esc(ui.nav.solutions)}</a></li>
        <li class="drawer-sub">
          <a href="${slugPath('services/campaign-management')}">${esc(ui.menu.campaign)}</a>
          <a href="${slugPath('services/lead-management')}">${esc(ui.menu.lead)}</a>
          <a href="${slugPath('services/follow-up')}">${esc(ui.menu.followup)}</a>
          <a href="${slugPath('services/analytics')}">${esc(ui.menu.analytics)}</a>
          ${ctx.industryLinks(lang).map((l) => `<a href="${slugPath(l.slug)}">${esc(l.label)}</a>`).join('')}
        </li>
        <li><a href="${slugPath('how-it-works')}">${esc(ui.nav.how)}</a></li>
        <li><a href="${slugPath('pricing')}">${esc(ui.nav.pricing)}</a></li>
        <li><a href="${slugPath('resources')}">${esc(ui.nav.resources)}</a></li>
        <li><a href="${slugPath('about')}">${esc(ui.nav.about)}</a></li>
        <li><a href="${slugPath('faq')}">${esc(ui.footer.support)} — FAQ</a></li>
        <li><a href="${slugPath('contact')}">${esc(ui.buttons.contactUs)}</a></li>
      </ul>
      <div class="drawer-actions">
        <a class="btn btn-primary" href="${slugPath('consultation')}">${esc(ui.nav.primaryCta)}</a>
        <a class="btn btn-ghost" href="${slugPath('get-started')}">${esc(ui.nav.secondaryCta)}</a>
        <a class="nav-login" href="${esc(SITE.engineLoginUrl)}" rel="noopener">${esc(ui.nav.loginCta)}</a>
        <a class="lang-link" href="${otherPath(page.slug)}" lang="${UI[other].htmlLang}" hreflang="${other}">${esc(ui.otherLang.label)}</a>
      </div>
    </nav>
  </div>
</header>`;
}

function breadcrumbs(page, lang, ctx) {
  if (!page.crumbs || page.crumbs.length === 0) return '';
  const ui = UI[lang];
  const items = [{ slug: '', label: T(ui.nav.home, lang) }, ...page.crumbs.map((s) => ({ slug: s, label: T(ctx.registry[s].title, lang) })), { slug: page.slug, label: T(page.title, lang), current: true }];
  return `<nav class="breadcrumbs" aria-label="${esc(ui.nav.breadcrumb)}"><ol>${items
    .map((it) => (it.current ? `<li aria-current="page">${esc(it.label)}</li>` : `<li><a href="${linkTo(it.slug, lang)}">${esc(it.label)}</a></li>`))
    .join('')}</ol></nav>`;
}

function footer(lang, ctx) {
  const ui = UI[lang];
  const f = ui.footer;
  const L = (slug) => linkTo(slug, lang);
  const contactBlock = SITE.contact.email || SITE.contact.phone
    ? `<ul class="plain">${SITE.contact.email ? `<li><a href="mailto:${esc(SITE.contact.email)}" dir="ltr">${esc(SITE.contact.email)}</a></li>` : ''}${SITE.contact.phone ? `<li><a href="tel:${esc(SITE.contact.phone)}" dir="ltr">${esc(SITE.contact.phone)}</a></li>` : ''}</ul>`
    : `<p class="muted small">${esc(f.contactPending)}</p>`;
  return `
<footer class="site-footer">
  <div class="container footer-grid glass">
    <div class="footer-brand">
      <p class="brand-text">${esc(T(SITE.brandName, lang))}</p>
      <p class="muted">${esc(f.tagline)}</p>
      <p class="small placeholder-note">${esc(f.placeholderNotice)}</p>
    </div>
    <nav aria-label="${esc(f.services)}">
      <h2 class="h6">${esc(f.services)}</h2>
      <ul class="plain">
        <li><a href="${L('services')}">${esc(ui.nav.solutionsOverview)}</a></li>
        <li><a href="${L('services/campaign-management')}">${esc(ui.menu.campaign)}</a></li>
        <li><a href="${L('services/lead-management')}">${esc(ui.menu.lead)}</a></li>
        <li><a href="${L('services/follow-up')}">${esc(ui.menu.followup)}</a></li>
        <li><a href="${L('services/analytics')}">${esc(ui.menu.analytics)}</a></li>
      </ul>
    </nav>
    <nav aria-label="${esc(f.industries)}">
      <h2 class="h6">${esc(f.industries)}</h2>
      <ul class="plain">
        <li><a href="${L('industries')}">${esc(ui.nav.solutionsOverview)}</a></li>
        ${ctx.industryLinks(lang).map((l) => `<li><a href="${L(l.slug)}">${esc(l.label)}</a></li>`).join('')}
      </ul>
    </nav>
    <nav aria-label="${esc(f.company)}">
      <h2 class="h6">${esc(f.company)}</h2>
      <ul class="plain">
        <li><a href="${L('about')}">${esc(ui.nav.about)}</a></li>
        <li><a href="${L('pricing')}">${esc(ui.nav.pricing)}</a></li>
        <li><a href="${L('measurement')}">${lang === 'ar' ? 'منهجية القياس والنتائج' : 'Results and Measurement'}</a></li>
        <li><a href="${L('how-it-works')}">${esc(ui.nav.how)}</a></li>
        <li><a href="${L('resources')}">${esc(ui.nav.resources)}</a></li>
        <li><a href="${L('faq')}">${lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</a></li>
      </ul>
    </nav>
    <nav aria-label="${esc(f.support)}">
      <h2 class="h6">${esc(f.support)}</h2>
      <ul class="plain">
        <li><a href="${L('consultation')}">${esc(ui.buttons.bookConsultation)}</a></li>
        <li><a href="${L('get-started')}">${esc(ui.buttons.getStarted)}</a></li>
        <li><a href="${L('contact')}">${esc(ui.buttons.contactUs)}</a></li>
      </ul>
      <h2 class="h6 mt">${esc(f.contactTitle)}</h2>
      ${contactBlock}
    </nav>
    <nav aria-label="${esc(f.legal)}">
      <h2 class="h6">${esc(f.legal)}</h2>
      <ul class="plain">
        <li><a href="${L('privacy')}">${lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a></li>
        <li><a href="${L('cookies')}">${lang === 'ar' ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}</a></li>
        <li><a href="${L('terms')}">${lang === 'ar' ? 'شروط الاستخدام' : 'Terms of Service'}</a></li>
        <li><a href="${L('service-agreement')}">${lang === 'ar' ? 'ملخص اتفاقية الخدمة' : 'Service Agreement Overview'}</a></li>
        <li><a href="${L('data-processing')}">${lang === 'ar' ? 'معالجة البيانات' : 'Data Processing Information'}</a></li>
        <li><a href="${L('advertising-disclaimer')}">${lang === 'ar' ? 'إخلاء مسؤولية الإعلانات والأداء' : 'Advertising and Performance Disclaimer'}</a></li>
      </ul>
    </nav>
  </div>
  <div class="container footer-bottom">
    <p class="small muted">© ${new Date().getFullYear()} ${esc(T(SITE.brandName, lang))}. ${esc(f.rights)}</p>
    <p class="small muted">${esc(ui.cookie.text)} <a href="${L('cookies')}">${esc(ui.cookie.link)}</a></p>
  </div>
</footer>`;
}

// ---------- section renderers ----------
function sectionHeading(title, intro, lang, cls = '') {
  if (!title && !intro) return '';
  return `<div class="section-head ${cls}">${title ? `<h2 class="reveal">${esc(T(title, lang))}</h2>` : ''}${intro ? `<p class="lead reveal">${esc(T(intro, lang))}</p>` : ''}</div>`;
}

const renderers = {
  hero(s, lang, ctx) {
    const ui = UI[lang];
    const visual = s.visual === 'dashboard' ? renderDashboard(lang, ui) : '';
    return `
<section class="hero${s.visual ? ' hero-has-visual' : ''}" aria-labelledby="hero-title">
  <div class="container hero-grid">
    <div class="hero-copy">
      ${s.eyebrow ? `<p class="eyebrow hero-reveal" style="--d:0s">${esc(T(s.eyebrow, lang))}</p>` : ''}
      <h1 id="hero-title" class="hero-title"><span class="hero-reveal" style="--d:.08s">${esc(T(s.title, lang))}</span></h1>
      ${s.lead ? `<p class="hero-lead hero-reveal" style="--d:.2s">${esc(T(s.lead, lang))}</p>` : ''}
      ${s.actions ? `<div class="btn-row hero-reveal" style="--d:.3s">${s.actions.map((a) => btn(a, lang, ui)).join('')}</div>` : ''}
      ${s.trust ? `<ul class="trust-list hero-reveal" style="--d:.38s" aria-label="${lang === 'ar' ? 'ضمانات الثقة' : 'Trust commitments'}">${T(s.trust, lang).map((t) => `<li>${icon('check', 'icon-sm')}<span>${esc(t)}</span></li>`).join('')}</ul>` : ''}
    </div>
    ${visual ? `<div class="hero-visual">${visual}</div>` : ''}
  </div>
</section>`;
  },

  intro(s, lang) {
    return `
<section class="page-intro">
  <div class="container">
    ${s.eyebrow ? `<p class="eyebrow">${esc(T(s.eyebrow, lang))}</p>` : ''}
    <h1 class="page-title reveal">${esc(T(s.title, lang))}</h1>
    ${s.lead ? `<p class="lead reveal">${esc(T(s.lead, lang))}</p>` : ''}
    ${s.actions ? `<div class="btn-row">${s.actions.map((a) => btn(a, lang, UI[lang])).join('')}</div>` : ''}
  </div>
</section>`;
  },

  cards(s, lang) {
    const cols = s.columns || 3;
    return `
<section class="section">
  <div class="container">
    ${sectionHeading(s.title, s.intro, lang)}
    <div class="card-grid cols-${cols}">
      ${s.items
        .map(
          (it, i) => `
      <article class="glass-card reveal" style="--i:${i}">
        ${it.icon ? `<span class="icon-tile">${icon(it.icon)}</span>` : ''}
        <h3 class="h4">${esc(T(it.title, lang))}</h3>
        ${it.text ? `<p>${esc(T(it.text, lang))}</p>` : ''}
        ${it.bullets ? `<ul class="check-list">${T(it.bullets, lang).map((b) => `<li>${icon('check', 'icon-sm')}<span>${esc(b)}</span></li>`).join('')}</ul>` : ''}
        ${it.to ? `<a class="text-link" href="${linkTo(it.to, lang)}">${esc(T(it.linkLabel, lang) || (lang === 'ar' ? 'اعرف المزيد' : 'Learn more'))} ${icon('arrow', 'icon-sm dir-flip')}</a>` : ''}
      </article>`
        )
        .join('')}
    </div>
  </div>
</section>`;
  },

  steps(s, lang) {
    return `
<section class="section">
  <div class="container">
    ${sectionHeading(s.title, s.intro, lang)}
    <ol class="step-list">
      ${s.items
        .map(
          (it, i) => `<li class="glass-card step reveal" style="--i:${i}"><span class="step-num" aria-hidden="true">${fmt(i + 1, lang)}</span><div><h3 class="h4">${esc(T(it.title, lang))}</h3>${it.text ? `<p>${esc(T(it.text, lang))}</p>` : ''}</div></li>`
        )
        .join('')}
    </ol>
  </div>
</section>`;
  },

  workflow(s, lang) {
    const stages = s.stages.map((st, i) => `
      <li class="stage" style="--s:${i}">
        <span class="stage-dot" aria-hidden="true">${fmt(i + 1, lang)}</span>
        <span class="stage-label">${esc(T(st.title, lang))}</span>
        ${st.text ? `<span class="stage-text">${esc(T(st.text, lang))}</span>` : ''}
      </li>`).join('');
    return `
<section class="section" aria-labelledby="wf-${s.id || 'x'}">
  <div class="container">
    ${sectionHeading(s.title, s.intro, lang).replace('<h2 ', `<h2 id="wf-${s.id || 'x'}" `)}
    <div class="workflow glass-panel reveal" data-animate-workflow>
      <ol class="workflow-track">${stages}</ol>
      ${s.caption ? `<p class="small muted caption">${esc(T(s.caption, lang))}</p>` : ''}
    </div>
  </div>
</section>`;
  },

  prose(s, lang) {
    const paras = (T(s.paragraphs, lang) || []).map((p) => `<p>${esc(p)}</p>`).join('');
    const bullets = s.bullets ? `<ul class="check-list">${T(s.bullets, lang).map((b) => `<li>${icon('check', 'icon-sm')}<span>${esc(b)}</span></li>`).join('')}</ul>` : '';
    return `
<section class="section">
  <div class="container narrow">
    ${sectionHeading(s.title, null, lang)}
    <div class="prose glass-card reveal">${paras}${bullets}</div>
  </div>
</section>`;
  },

  table(s, lang) {
    const ui = UI[lang];
    const head = T(s.headers, lang).map((h) => `<th scope="col">${esc(h)}</th>`).join('');
    const rows = s.rows
      .map((r) => `<tr>${T(r, lang).map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`)
      .join('');
    return `
<section class="section">
  <div class="container">
    ${sectionHeading(s.title, s.intro, lang)}
    <div class="table-wrap glass-card reveal" role="region" aria-label="${esc(T(s.title, lang) || '')}" tabindex="0">
      <table class="data-table">
        ${s.caption ? `<caption>${esc(T(s.caption, lang))}</caption>` : ''}
        <thead><tr>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${s.note ? `<p class="small muted">${esc(T(s.note, lang))}</p>` : ''}
  </div>
</section>`;
  },

  accordion(s, lang) {
    const ui = UI[lang];
    return `
<section class="section" id="${esc(s.id || 'accordion')}">
  <div class="container narrow">
    ${sectionHeading(s.title, s.intro, lang)}
    <div class="accordion" data-accordion>
      ${s.items
        .map(
          (it, i) => `
      <details class="acc-item glass-card reveal"${i === 0 && s.openFirst ? ' open' : ''}>
        <summary>${esc(T(it.q, lang))}</summary>
        <div class="acc-body">${(T(it.a, lang) + '').split('\n').map((p) => `<p>${esc(p)}</p>`).join('')}${it.links ? `<p>${it.links.map((l) => `<a class="text-link" href="${linkTo(l.to, lang)}">${esc(T(l.label, lang))}</a>`).join(' · ')}</p>` : ''}</div>
      </details>`
        )
        .join('')}
    </div>
    ${s.cta ? renderCtaBlock(s.cta, lang) : ''}
  </div>
</section>`;
  },

  faq(s, lang) {
    const ui = UI[lang];
    const cats = [...new Set(s.items.map((i) => T(i.category, lang)))];
    const items = s.items
      .map(
        (it, i) => `
      <details class="acc-item glass-card" data-faq-item data-search="${esc((T(it.q, lang) + ' ' + T(it.a, lang)).toLowerCase())}" data-cat="${esc(T(it.category, lang))}">
        <summary>${esc(T(it.q, lang))}</summary>
        <div class="acc-body">${(T(it.a, lang) + '').split('\n').map((p) => `<p>${esc(p)}</p>`).join('')}${it.links ? `<p>${it.links.map((l) => `<a class="text-link" href="${linkTo(l.to, lang)}">${esc(T(l.label, lang))}</a>`).join(' · ')}</p>` : ''}</div>
      </details>`
      )
      .join('');
    return `
<section class="section" id="faq-list">
  <div class="container narrow">
    ${sectionHeading(s.title, s.intro, lang)}
    <form class="faq-search glass-card" role="search" data-faq-search onsubmit="return false">
      <label for="faq-q" class="field-label">${esc(ui.a11y.faqSearchLabel)}</label>
      <input id="faq-q" type="search" class="input" placeholder="${esc(ui.a11y.faqSearch)}" autocomplete="off" data-faq-input>
      <div class="chips" role="group" aria-label="${lang === 'ar' ? 'التصنيفات' : 'Categories'}">
        <button type="button" class="chip is-on" data-cat-chip="">${lang === 'ar' ? 'الكل' : 'All'}</button>
        ${cats.map((c) => `<button type="button" class="chip" data-cat-chip="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
      <p class="small muted" aria-live="polite" data-faq-count></p>
    </form>
    <div class="accordion" data-faq-list>${items}</div>
    <p class="hidden" data-faq-empty>${esc(ui.a11y.faqNoResults)}</p>
    ${s.cta ? renderCtaBlock(s.cta, lang) : ''}
  </div>
</section>`;
  },

  articles(s, lang) {
    const ui = UI[lang];
    const cats = T(s.categories, lang);
    const items = s.items
      .map(
        (it, i) => `
      <li class="article-card glass-card reveal" style="--i:${i % 6}" data-faq-item data-search="${esc((T(it.title, lang) + ' ' + T(it.summary, lang) + ' ' + T(it.category, lang)).toLowerCase())}" data-cat="${esc(T(it.category, lang))}">
        <p class="eyebrow">${esc(T(it.category, lang))}</p>
        <h3 class="h5">${esc(T(it.title, lang))}</h3>
        <p>${esc(T(it.summary, lang))}</p>
        <p class="article-meta"><span class="status status-warn">${esc(ui.labels.draft)}</span> <span class="tag">${esc(ui.labels.comingSoon)}</span></p>
      </li>`
      )
      .join('');
    return `
<section class="section" id="articles">
  <div class="container">
    ${sectionHeading(s.title, s.intro, lang)}
    <form class="faq-search glass-card" role="search" data-faq-search onsubmit="return false">
      <label for="article-q" class="field-label">${esc(ui.a11y.articleSearchLabel)}</label>
      <input id="article-q" type="search" class="input" placeholder="${esc(ui.a11y.articleSearch)}" autocomplete="off" data-faq-input>
      <div class="chips" role="group" aria-label="${lang === 'ar' ? 'التصنيفات' : 'Categories'}">
        <button type="button" class="chip is-on" data-cat-chip="">${lang === 'ar' ? 'الكل' : 'All'}</button>
        ${cats.map((c) => `<button type="button" class="chip" data-cat-chip="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
      <p class="small muted" aria-live="polite" data-faq-count></p>
    </form>
    <ul class="article-grid" data-faq-list>${items}</ul>
    <p class="hidden" data-faq-empty>${esc(ui.a11y.articleNoResults)}</p>
  </div>
</section>`;
  },

  cta(s, lang) {
    return `<section class="section">${renderCtaBlock(s, lang)}</section>`;
  },

  notice(s, lang) {
    const tone = s.tone || 'info';
    return `
<section class="section-tight">
  <div class="container">
    <aside class="notice notice-${tone} glass-card" role="note" aria-label="${esc(T(s.title, lang) || '')}">
      ${icon(tone === 'warning' ? 'alert' : 'note', 'icon')}
      <div>
        ${s.title ? `<p class="notice-title">${esc(T(s.title, lang))}</p>` : ''}
        ${s.text ? `<p>${esc(T(s.text, lang))}</p>` : ''}
        ${s.items ? `<ul class="check-list">${T(s.items, lang).map((b) => `<li><span>${esc(b)}</span></li>`).join('')}</ul>` : ''}
      </div>
    </aside>
  </div>
</section>`;
  },

  dashboard(s, lang) {
    return `
<section class="section">
  <div class="container">
    ${sectionHeading(s.title, s.intro, lang)}
    ${renderDashboard(lang, UI[lang], { wide: true })}
    <p class="small muted caption">${esc(UI[lang].labels.illustrativeNote)}</p>
  </div>
</section>`;
  },

  pipeline(s, lang) {
    return `
<section class="section">
  <div class="container">
    ${sectionHeading(s.title, s.intro, lang)}
    ${renderPipeline(lang, s)}
  </div>
</section>`;
  },

  timeline(s, lang) {
    return `
<section class="section">
  <div class="container narrow">
    ${sectionHeading(s.title, s.intro, lang)}
    ${s.demo ? `<p class="demo-badge">${esc(UI[lang].labels.illustrative)}</p>` : ''}
    <ol class="timeline">
      ${s.items
        .map(
          (it, i) => `<li class="tl-item reveal" style="--i:${i}"><span class="tl-when">${esc(T(it.when, lang))}</span><div class="glass-card tl-card"><h3 class="h5">${esc(T(it.title, lang))}</h3><p>${esc(T(it.text, lang))}</p>${it.tags ? `<p class="tags">${T(it.tags, lang).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</p>` : ''}</div></li>`
        )
        .join('')}
    </ol>
    ${s.caption ? `<p class="small muted caption">${esc(T(s.caption, lang))}</p>` : ''}
  </div>
</section>`;
  },

  pricing(s, lang) {
    const ui = UI[lang];
    const cards = PLANS.map((p, i) => {
      const name = T(p.name, lang);
      const included = T(p.included, lang);
      const from = p.priceFrom ? (lang === 'ar' ? 'ابتداءً من' : 'From') : '';
      return `
      <article class="plan glass-card${p.highlighted ? ' is-highlighted' : ''} reveal" style="--i:${i}" data-plan="${p.id}">
        ${p.highlighted ? `<p class="plan-badge">${lang === 'ar' ? 'الأكثر طلباً للمقارنة' : 'Most compared'}</p>` : ''}
        <h3 class="h4">${esc(name)}</h3>
        <p class="plan-price"><span class="price-from">${esc(from)}</span><span class="price-value">${esc(sar(p.price, lang))}</span><span class="price-period">/ ${lang === 'ar' ? 'شهرياً' : 'month'}</span></p>
        <p class="badge-outline">${esc(lang === 'ar' ? 'الإنفاق الإعلاني غير مشمول' : 'Advertising spend not included')}</p>
        <p>${esc(T(p.positioning, lang))}</p>
        <details class="plan-details">
          <summary>${esc(ui.buttons.whatsIncluded)}</summary>
          <ul class="check-list">${included.map((b) => `<li>${icon('check', 'icon-sm')}<span>${esc(b)}</span></li>`).join('')}</ul>
        </details>
        <div class="plan-actions">
          <a class="btn btn-primary btn-block" href="${linkTo('get-started', lang)}?package=${p.id}" data-select-plan="${p.id}">${esc(ui.buttons.selectPlan)}</a>
          <a class="btn btn-ghost btn-block" href="${linkTo('consultation', lang)}">${esc(ui.buttons.bookConsultation)}</a>
        </div>
      </article>`;
    }).join('');
    const disclosures = PLAN_DISCLOSURES[lang].map((d) => `<li>${icon('check', 'icon-sm')}<span>${esc(d)}</span></li>`).join('');
    return `
<section class="section" aria-labelledby="plans-title">
  <div class="container">
    ${sectionHeading(s.title, s.intro, lang).replace('<h2 ', '<h2 id="plans-title" ')}
    <div class="plan-grid">${cards}</div>
    <aside class="notice notice-info glass-card" role="note">
      ${icon('alert', 'icon')}
      <div>
        <p class="notice-title">${lang === 'ar' ? 'ملاحظة حول الإنفاق الإعلاني' : 'About advertising expenditure'}</p>
        <p>${esc(lang === 'ar' ? 'تعكس الأسعار رسوم الخدمة المقترحة، ولا تشمل الإنفاق المدفوع للمنصات الإعلانية أو المصروفات الخارجية ما لم يُذكر خلاف ذلك صراحةً.' : 'Prices reflect the proposed service fee. They do not include advertising spend paid to platforms, or external expenses unless explicitly stated.')}</p>
        <ul class="check-list disclosures">${disclosures}</ul>
      </div>
    </aside>
  </div>
</section>`;
  },

  form(s, lang) {
    const form = FORMS[s.formId];
    return `
<section class="section" id="form">
  <div class="container form-layout">
    <div class="form-aside">
      ${sectionHeading(s.title, s.intro, lang).replace('<h2 ', '<h2 id="form-title" ')}
      ${s.bullets ? `<ul class="check-list">${T(s.bullets, lang).map((b) => `<li>${icon('check', 'icon-sm')}<span>${esc(b)}</span></li>`).join('')}</ul>` : ''}
      ${s.aside ? `<aside class="notice notice-info glass-card" role="note"><p>${esc(T(s.aside, lang))}</p></aside>` : ''}
    </div>
    <div class="form-card glass-card">
      ${renderForm(form, lang)}
    </div>
  </div>
</section>`;
  },

  links(s, lang) {
    return `
<section class="section">
  <div class="container">
    ${sectionHeading(s.title, s.intro, lang)}
    <ul class="link-cards">
      ${s.items
        .map((it) => `<li><a class="glass-card link-card" href="${linkTo(it.to, lang)}"><span class="link-card-title">${esc(T(it.label, lang))}</span>${it.text ? `<span class="muted">${esc(T(it.text, lang))}</span>` : ''}${icon('arrow', 'icon-sm dir-flip')}</a></li>`)
        .join('')}
    </ul>
  </div>
</section>`;
  },

  status(s, lang) {
    return renderers.table(s, lang);
  },

  checklist(s, lang) {
    return `
<section class="section">
  <div class="container narrow">
    ${sectionHeading(s.title, s.intro, lang)}
    <ul class="checklist glass-card">
      ${T(s.items, lang).map((b) => `<li><label><input type="checkbox" class="checklist-input"><span>${esc(b)}</span></label></li>`).join('')}
    </ul>
  </div>
</section>`;
  },

  article_placeholder(s, lang) {
    return `
<section class="section">
  <div class="container narrow">
    <div class="glass-card placeholder-card reveal">
      <p class="eyebrow">${esc(UI[lang].labels.comingSoon)}</p>
      <h2 class="h4">${esc(T(s.title, lang))}</h2>
      <p>${esc(T(s.text, lang))}</p>
    </div>
  </div>
</section>`;
  },

  html(s, lang) {
    return `<section class="section"><div class="container narrow">${T(s.html, lang)}</div></section>`;
  },

  legal(s, lang) {
    const ui = UI[lang];
    const sections = s.sections
      .map((sec) => `
      <section class="legal-section" id="${esc(sec.id)}">
        <h2 class="h4">${esc(T(sec.title, lang))}</h2>
        ${(T(sec.paragraphs, lang) || []).map((p) => `<p>${esc(p)}</p>`).join('')}
        ${sec.bullets ? `<ul>${T(sec.bullets, lang).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
      </section>`)
      .join('');
    const toc = s.sections.map((sec) => `<li><a href="#${esc(sec.id)}">${esc(T(sec.title, lang))}</a></li>`).join('');
    return `
<section class="section">
  <div class="container legal-head"><h1 class="page-title">${esc(T(s.title, lang))}</h1></div>
  <div class="container legal-layout">
    <aside class="legal-toc glass-card" aria-label="${lang === 'ar' ? 'محتويات الصفحة' : 'On this page'}">
      <p class="eyebrow">${lang === 'ar' ? 'محتويات الصفحة' : 'On this page'}</p>
      <ol>${toc}</ol>
    </aside>
    <article class="legal-body">
      <aside class="notice notice-warning glass-card" role="note">
        ${icon('alert', 'icon')}
        <div>
          <p class="notice-title">${esc(ui.labels.draft)}</p>
          <p>${lang === 'ar' ? 'هذه مسودة تنظيمية غير منشورة قانونياً. الحقول بين الأقواس المعقوفة عناصر نائبة يجب استكمالها. يجب مراجعتها من قبل مختص قانوني مؤهل قبل النشر.' : 'This is an unpublished structured draft. Bracketed fields are placeholders to be completed. Qualified legal review is required before publication.'}</p>
          <p class="small muted">${lang === 'ar' ? 'آخر تحديث للمسودة:' : 'Draft last updated:'} <time datetime="${esc(s.draftDate)}">${esc(s.draftDate)}</time></p>
        </div>
      </aside>
      ${sections}
    </article>
  </div>
</section>`;
  },
};

export function renderCtaBlock(s, lang) {
  const ui = UI[lang];
  return `
<div class="cta-band glass-panel reveal">
  <div class="cta-copy">
    <h2 class="h3">${esc(T(s.title, lang))}</h2>
    ${s.text ? `<p>${esc(T(s.text, lang))}</p>` : ''}
  </div>
  <div class="btn-row">${(s.actions || [{ label: ui.buttons.bookConsultation, to: 'consultation', variant: 'primary' }]).map((a) => btn(a, lang, ui)).join('')}</div>
</div>`;
}

// ---------- illustrative product mockups ----------
export function renderDashboard(lang, ui, opts = {}) {
  const L = lang === 'ar';
  const f = (n) => fmt(n, lang);
  const labels = L
    ? { title: 'لوحة عمليات التسويق', campaigns: 'أداء الحملات', pipeline: 'مسار العملاء المحتملين', tasks: 'مهام المتابعة', flow: 'من المصدر إلى العميل المحتمل', metricsTitle: 'مؤشرات الأداء', demo: ui.labels.illustrative }
    : { title: 'Marketing operations', campaigns: 'Campaign performance', pipeline: 'Lead pipeline', tasks: 'Follow-up tasks', flow: 'Source-to-lead flow', metricsTitle: 'Reporting metrics', demo: ui.labels.illustrative };
  const metrics = L
    ? [
        ['الاستفسارات المستلمة', f(412)],
        ['العملاء المحتملون الصالحون', f(268)],
        ['العملاء المؤهلون', f(119)],
        ['تكلفة العميل المؤهل', sar(215, lang)],
        ['اكتمال المتابعة', `${f(87)}٪`],
        ['المواعيد / عروض الأسعار', f(46)],
        ['المبيعات المسجلة عند توفر البيانات', '—'],
      ]
    : [
        ['Enquiries Received', f(412)],
        ['Valid Leads', f(268)],
        ['Qualified Leads', f(119)],
        ['Cost per Qualified Lead', sar(215, lang)],
        ['Follow-Up Completion', `${f(87)}%`],
        ['Appointments / Quotes', f(46)],
        ['Recorded Sales, When Available', '—'],
      ];
  const stages = L
    ? [['استفسار جديد', 48], ['تم التواصل', 36], ['مؤهل', 24], ['موعد محدد', 12], ['تم الإغلاق', 5]]
    : [['New enquiry', 48], ['Contact attempted', 36], ['Qualified', 24], ['Appointment set', 12], ['Closed', 5]];
  const tasks = L
    ? [['متابعة اتصال مستحق اليوم', 'مستحق', 'warn'], ['إرسال عرض سعر', 'مكتمل', 'ok'], ['تأكيد الموعد', 'متأخر', 'err']]
    : [['Call-back due today', 'Due', 'warn'], ['Send requested quote', 'Done', 'ok'], ['Confirm appointment', 'Overdue', 'err']];
  const flow = L
    ? ['حملة بحث', 'نموذج الموقع', 'تأهيل', 'متابعة', 'موعد']
    : ['Search campaign', 'Website form', 'Qualification', 'Follow-up', 'Appointment'];
  const bars = [62, 74, 58, 81, 69, 90, 77];

  return `
<div class="mockup glass-panel${opts.wide ? ' mockup-wide' : ''} float" role="img" aria-label="${esc((L ? 'معاينة تصميمية للوحة عمليات التسويق. ' : 'Design preview of a marketing operations dashboard. ') + labels.demo)}">
  <div class="mockup-bar">
    <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="mockup-title">${esc(labels.title)}</span>
    <span class="demo-badge">${esc(labels.demo)}</span>
  </div>
  <div class="mockup-grid">
    <div class="mock-card mock-campaign">
      <p class="mock-label">${esc(labels.campaigns)}</p>
      <div class="bars" aria-hidden="true">${bars.map((b, i) => `<span style="--h:${b}%;--d:${i * 0.06}s"></span>`).join('')}</div>
      <p class="mock-note">${L ? 'بيانات توضيحية' : 'Illustrative'}</p>
    </div>
    <div class="mock-card mock-pipeline">
      <p class="mock-label">${esc(labels.pipeline)}</p>
      <ul class="pipe">${stages.map(([n, v], i) => `<li><span class="pipe-name">${esc(n)}</span><span class="pipe-bar" style="--w:${v * 1.6}%;--d:${i * 0.1}s"></span><span class="pipe-val">${f(v)}</span></li>`).join('')}</ul>
    </div>
    <div class="mock-card mock-tasks">
      <p class="mock-label">${esc(labels.tasks)}</p>
      <ul class="task-list">${tasks.map(([n, s, t]) => `<li><span>${esc(n)}</span><span class="status status-${t}">${esc(s)}</span></li>`).join('')}</ul>
    </div>
    <div class="mock-card mock-flow">
      <p class="mock-label">${esc(labels.flow)}</p>
      <ol class="flow">${flow.map((n) => `<li>${esc(n)}</li>`).join('')}</ol>
    </div>
    <div class="mock-card mock-metrics">
      <p class="mock-label">${esc(labels.metricsTitle)}</p>
      <dl class="metric-grid">${metrics.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    </div>
  </div>
  <p class="mock-footer">${esc(ui.labels.illustrativeNote)}</p>
</div>`;
}

export function renderPipeline(lang, s) {
  const L = lang === 'ar';
  const statuses = s.statuses
    ? T(s.statuses, lang)
    : L
      ? ['استفسار جديد', 'تم التواصل', 'مؤهل', 'موعد', 'عرض سعر', 'تم الإغلاق', 'غير مؤهل', 'حالة غير معروفة']
      : ['New enquiry', 'Contact attempted', 'Qualified', 'Appointment', 'Quotation', 'Closed', 'Not qualified', 'Status unknown'];
  const records = L
    ? [
        ['LD-1001', 'مثال: عميل عقاري — شقق بحي تجريبي', 'مصدر: نموذج إلكتروني', 'مؤهل', 'مستحقة اليوم'],
        ['LD-1002', 'مثال: شركة خدمات مهنية — طلب استشارة', 'مصدر: مكالمة هاتفية', 'تم التواصل', 'تحتاج متابعة'],
        ['LD-1003', 'مثال: مورّد — طلب عرض سعر', 'مصدر: بريد إلكتروني', 'عرض سعر', 'بانتظار الرد'],
        ['LD-1004', 'مثال: استفسار مكرر', 'مصدر: نموذج إلكتروني', 'حالة غير معروفة', 'مراجعة الهوية'],
      ]
    : [
        ['LD-1001', 'Example: property buyer — 2-bed unit, preferred district', 'Source: website form', 'Qualified', 'Call due today'],
        ['LD-1002', 'Example: consultancy — service scope request', 'Source: phone call', 'Contact attempted', 'Follow-up needed'],
        ['LD-1003', 'Example: distributor — bulk quote request', 'Source: email', 'Quotation', 'Awaiting reply'],
        ['LD-1004', 'Example: repeated enquiry from same contact', 'Source: website form', 'Status unknown', 'Duplicate review'],
      ];
  return `
<div class="pipeline glass-panel reveal">
  <p class="demo-badge pipeline-badge">${esc(UI[lang].labels.illustrative)}</p>
  <div class="pipeline-scroll" role="region" tabindex="0" aria-label="${L ? 'مسار العملاء المحتملين التوضيحي' : 'Illustrative lead pipeline'}">
    <table class="pipeline-table">
      <thead><tr><th scope="col">${L ? 'المعرّف' : 'Record'}</th><th scope="col">${L ? 'الوصف' : 'Summary'}</th><th scope="col">${L ? 'المصدر' : 'Source'}</th><th scope="col">${L ? 'الحالة' : 'Status'}</th><th scope="col">${L ? 'الخطوة التالية' : 'Next action'}</th></tr></thead>
      <tbody>
        ${records.map((r) => `<tr><td dir="ltr">${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td><span class="status status-info">${esc(r[3])}</span></td><td>${esc(r[4])}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>
  <div class="status-legend" aria-label="${L ? 'الحالات' : 'Statuses'}">
    ${statuses.map((st) => `<span class="tag">${esc(st)}</span>`).join('')}
  </div>
  <p class="small muted">${esc(UI[lang].labels.illustrativeNote)}</p>
</div>`;
}

// ---------- forms ----------
function fieldId(form, name) {
  return `f-${form.id}-${name}`;
}

function renderField(form, f, lang) {
  const ui = UI[lang];
  const id = fieldId(form, f.name);
  const label = T(f.label, lang);
  const help = f.help ? T(f.help, lang) : '';
  const reqMark = f.required ? ` <span class="req-mark">${esc(ui.forms.requiredMark)}</span>` : '';
  const errId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = [help ? helpId : '', errId].filter(Boolean).join(' ');
  const common = `data-field-name="${esc(f.name)}" data-required="${f.required ? '1' : '0'}"`;
  const reqAttr = f.required ? ' required aria-required="true"' : '';

  if (f.type === 'checkbox') {
    return `
    <div class="field field-check" ${common}>
      <label class="check-label" for="${id}">
        <input type="checkbox" id="${id}" name="${esc(f.name)}" value="true"${reqAttr} aria-describedby="${describedBy}">
        <span>${esc(label)}${reqMark}</span>
      </label>
      <p class="field-error" id="${errId}" hidden></p>
    </div>`;
  }

  if (f.type === 'checkbox-group') {
    return `
    <fieldset class="field fieldset" ${common}>
      <legend class="field-label">${esc(label)}${reqMark}</legend>
      <div class="check-grid">
        ${f.options.map((o, i) => `<label class="check-label"><input type="checkbox" name="${esc(f.name)}" value="${esc(o.value)}" id="${id}-${i}"><span>${esc(T(o.label, lang))}</span></label>`).join('')}
      </div>
      <p class="field-error" id="${errId}" hidden></p>
    </fieldset>`;
  }

  let control = '';
  if (f.type === 'select') {
    control = `<select class="input" id="${id}" name="${esc(f.name)}"${reqAttr} aria-describedby="${describedBy}">
        <option value="">${esc(ui.forms.selectPlaceholder)}</option>
        ${f.options.map((o) => `<option value="${esc(o.value)}">${esc(T(o.label, lang))}</option>`).join('')}
      </select>`;
  } else if (f.type === 'textarea') {
    control = `<textarea class="input" id="${id}" name="${esc(f.name)}" rows="4"${f.max ? ` maxlength="${f.max}"` : ''}${reqAttr} aria-describedby="${describedBy}"></textarea>`;
  } else {
    const dir = f.type === 'email' || f.type === 'tel' || f.type === 'url' ? ' dir="ltr"' : '';
    control = `<input class="input" id="${id}" type="${f.type === 'text' ? 'text' : f.type}" name="${esc(f.name)}"${f.max ? ` maxlength="${f.max}"` : ''}${f.autocomplete ? ` autocomplete="${f.autocomplete}"` : ''}${reqAttr} aria-describedby="${describedBy}"${dir}${f.pattern === 'phone' ? ' inputmode="tel"' : ''}>`;
  }

  return `
    <div class="field" ${common}>
      <label class="field-label" for="${id}">${esc(label)}${reqMark}</label>
      ${control}
      ${help ? `<p class="field-help" id="${helpId}">${esc(help)}</p>` : ''}
      <p class="field-error" id="${errId}" hidden></p>
    </div>`;
}

export function renderForm(form, lang) {
  const ui = UI[lang];
  const common = `<input type="hidden" name="formType" value="${form.id}"><input type="hidden" name="lang" value="${lang}">
    <div class="hp" aria-hidden="true"><label>Leave this field empty<input type="text" name="${HONEYPOT_FIELD}" tabindex="-1" autocomplete="off"></label></div>`;
  const status = `
    <div class="form-summary" tabindex="-1" data-form-summary hidden role="alert"><p class="notice-title">${esc(ui.forms.errorsTitle)}</p><ul data-form-summary-list></ul></div>
    <div class="form-status" role="status" aria-live="polite" data-form-status></div>`;

  if (form.steps) {
    const total = form.steps.length;
    const stepper = form.steps
      .map((s, i) => `<li class="step-pill" data-step-pill="${i}"><span class="pill-num">${fmt(i + 1, lang)}</span><span>${esc(T(s.title, lang))}</span></li>`)
      .join('');
    const panels = form.steps
      .map((s, i) => {
        const isReview = !!s.review;
        return `
      <fieldset class="wizard-step" data-step="${i}" ${i === 0 ? '' : 'hidden'}>
        <legend class="wizard-legend"><span class="muted small">${esc(ui.labels.step)} ${fmt(i + 1, lang)} ${esc(ui.labels.of)} ${fmt(total, lang)}</span><span class="h4">${esc(T(s.title, lang))}</span></legend>
        ${isReview ? `<div class="review-box glass-panel" data-review-box><p class="muted small">${lang === 'ar' ? 'راجع إجاباتك قبل الإرسال.' : 'Review your answers before submitting.'}</p><dl class="review-list" data-review-list></dl></div>` : ''}
        ${s.fields.map((f) => renderField(form, f, lang)).join('')}
        <div class="wizard-actions">
          ${i > 0 ? `<button type="button" class="btn btn-ghost" data-prev>${esc(ui.buttons.back)}</button>` : '<span></span>'}
          ${i < total - 1 ? `<button type="button" class="btn btn-primary" data-next>${esc(ui.buttons.next)}</button>` : `<button type="submit" class="btn btn-primary" data-submit>${esc(ui.buttons.submit)}</button>`}
        </div>
      </fieldset>`;
      })
      .join('');
    return `
  <form class="enquiry-form wizard" novalidate data-form="${form.id}" data-endpoint="/api/enquiry" data-wizard aria-labelledby="form-title">
    ${common}
    <div class="progress-wrap">
      <p class="small muted" id="wizard-progress-label">${esc(ui.labels.progress)}: <span data-progress-text>${fmt(1, lang)} / ${fmt(total, lang)}</span></p>
      <div class="progress" role="progressbar" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="1" aria-labelledby="wizard-progress-label" data-progress><span style="width:${100 / total}%"></span></div>
      <ol class="step-pills" aria-hidden="true">${stepper}</ol>
    </div>
    ${status}
    ${panels}
    <div class="success" data-success tabindex="-1" hidden>${successMarkup(lang)}</div>
  </form>`;
  }

  return `
  <form class="enquiry-form" novalidate data-form="${form.id}" data-endpoint="/api/enquiry" aria-labelledby="form-title">
    ${common}
    ${status}
    <div class="form-fields">
      ${form.fields.map((f) => renderField(form, f, lang)).join('')}
    </div>
    <div class="form-actions">
      <button type="submit" class="btn btn-primary" data-submit>${esc(ui.buttons.submit)}</button>
      <p class="small muted">${lang === 'ar' ? 'لا نطلب كلمات مرور حسابات إعلانية أو بيانات بطاقات ائتمان في هذا النموذج.' : 'This form never asks for advertising account passwords or payment card details.'}</p>
    </div>
    <div class="success" data-success tabindex="-1" hidden>${successMarkup(lang)}</div>
  </form>`;
}

function successMarkup(lang) {
  const ui = UI[lang];
  return `<p class="eyebrow">${lang === 'ar' ? 'تم الاستلام' : 'Received'}</p><h3 class="h4" data-success-title>${esc(ui.forms.successTitle)}</h3><p>${esc(ui.forms.successBody)}</p><p class="ref-line">${esc(ui.forms.referenceLabel)}: <strong dir="ltr" data-success-ref></strong></p><p class="small muted" data-success-notice></p><p><a class="text-link" href="${linkTo('', lang)}">${esc(ui.buttons.home)}</a></p>`;
}

// ---------- page shell ----------
export function renderPage(page, lang, ctx) {
  const ui = UI[lang];
  const other = ui.otherLang.code;
  const title = T(page.title, lang);
  const description = T(page.description, lang);
  const fullTitle = page.homeTitle ? T(page.homeTitle, lang) : `${title} | ${T(SITE.brandName, lang)}`;
  const canonical = absUrl(lang, page.slug);
  const noindex = page.noindex || page.status === 'noindex';
  const alternates = page.noAlternates
    ? ''
    : `<link rel="alternate" hreflang="en" href="${absUrl('en', page.slug)}"><link rel="alternate" hreflang="ar" href="${absUrl('ar', page.slug)}"><link rel="alternate" hreflang="x-default" href="${absUrl('en', page.slug)}">`;

  const schema = [];
  if (page.schema) schema.push(page.schema(lang));
  if (page.crumbs && page.crumbs.length) {
    const items = [{ slug: '', label: T(ui.nav.home, lang) }, ...page.crumbs.map((s) => ({ slug: s, label: T(ctx.registry[s].title, lang) })), { slug: page.slug, label: title }];
    schema.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.label, item: absUrl(lang, it.slug) })),
    });
  }

  const body = page.sections.map((s) => {
    const fn = renderers[s.type];
    if (!fn) throw new Error(`Unknown section type "${s.type}" on ${page.slug}`);
    return fn(s, lang, ctx);
  }).join('\n');

  const isFormPage = page.sections.some((s) => s.type === 'form');
  const noFormsMobileCta = isFormPage || page.noMobileCta;
  const ogImage = `${SITE.origin.replace(/\/$/, '')}/assets/og-default.svg`;

  return `<!doctype html>
<html lang="${ui.htmlLang}" dir="${ui.dir}" data-page="${esc(page.slug || 'home')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow">'}
<link rel="canonical" href="${canonical}">
${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(T(SITE.brandName, lang))}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${lang === 'ar' ? 'ar_SA' : 'en_GB'}">
<meta property="og:locale:alternate" content="${lang === 'ar' ? 'en_GB' : 'ar_SA'}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="theme-color" content="#101A2C">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/styles.css">
<script>${INLINE.jsClass}</script>
${schema.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body class="${ui.dir === 'rtl' ? 'is-rtl' : 'is-ltr'}">
${header(page, lang, ctx)}
<main id="main" tabindex="-1">
${breadcrumbs(page, lang, ctx)}
${body}
</main>
${footer(lang, ctx)}
${noFormsMobileCta ? '' : `<div class="mobile-cta" aria-label="${lang === 'ar' ? 'إجراء سريع' : 'Quick action'}"><a class="btn btn-primary btn-block" href="${linkTo('consultation', lang)}">${esc(ui.nav.primaryCta)}</a></div>`}
<script src="/assets/app.js" defer></script>
</body>
</html>
`;
}

export { renderers };
