// Central configuration. Every value marked PLACEHOLDER must be confirmed
// by the business before launch. Nothing here is a verified business fact.

export const SITE = {
  // PLACEHOLDER: brand identity (confirm before launch)
  // Company brand. Product names below are used in both languages in Latin script.
  brandName: { en: 'YECH', ar: 'YECH' },
  tagline: {
    en: 'Turn Marketing Activity Into Measurable Growth.',
    ar: 'حوّل أنشطتك التسويقية إلى نمو قابل للقياس.',
  },
  // Product naming. The service is offered now (subject to the confirmation steps in the
  // publication checklist). The software platform is planned only and must not be
  // presented as available.
  offerings: {
    service: {
      name: { en: 'YECH Marketing Operations', ar: 'YECH Marketing Operations' },
      status: 'available',
    },
    platform: {
      name: { en: 'YECH Marketing OS', ar: 'YECH Marketing OS' },
      status: 'planned',
    },
  },

  // Commercial Engine sign-in address. PROPOSED: engine.yech.sa, not yet registered or deployed.
  // Set ENGINE_LOGIN_URL at build time once the domain resolves. Until then the Login link is a placeholder.
  engineLoginUrl: (typeof process !== 'undefined' && process.env && process.env.ENGINE_LOGIN_URL) || 'https://engine.yech.sa/login',

  // PLACEHOLDER: production domain (used for canonical URLs, hreflang, sitemap).
  origin: 'https://example.invalid',
  defaultLang: 'en',
  langs: ['en', 'ar'],

  // PLACEHOLDER: real contact details. Leave null until supplied and confirmed.
  // The site does NOT display any contact channel while these are null.
  contact: {
    email: null,
    phone: null,
    whatsapp: null,
    address: null,
  },

  // PLACEHOLDER: legal entity details. Confirm with the business and counsel.
  legalEntity: {
    name: { en: '[Legal entity name — to be confirmed]', ar: '[اسم الكيان القانوني — يُحدد لاحقاً]' },
    crNumber: '[CR number — to be confirmed]',
    vatNumber: '[VAT number — to be confirmed]',
    establishmentStatus: '[Saudi establishment status — to be confirmed]',
    privacyContact: '[Privacy request channel — to be confirmed]',
  },

  // Every legal page shows this status until counsel approves the text.
  legalReviewStatus: 'draft',

  // v1 loads NO analytics or marketing scripts.
  analytics: { enabled: false },
};

// Provisional commercial test prices (SAR, excl. advertising spend).
// Configurable here; subject to final commercial approval.
export const PLANS = [
  {
    id: 'essential',
    price: 1500,
    currency: 'SAR',
    period: 'month',
    priceFrom: false,
    name: { en: 'Essential', ar: 'الباقة الأساسية' },
    positioning: {
      en: 'For businesses that need a structured, manageable lead-generation workflow.',
      ar: 'للشركات التي تحتاج إلى مسار واضح ومنظم لتوليد العملاء المحتملين وإدارته.',
    },
    included: {
      en: ['Defined campaign scope', 'Basic content and creative allowance', 'Lead tracking', 'Agreed qualification criteria', 'Follow-up reminders and monitoring', 'Monthly reporting', 'Defined support allowance'],
      ar: ['نطاق حملات محدد', 'مخصصات أساسية للمحتوى والتصميم', 'تتبع العملاء المحتملين', 'معايير تأهيل متفق عليها', 'تذكيرات المتابعة ومراقبتها', 'تقرير شهري', 'مخصصات دعم محددة'],
    },
  },
  {
    id: 'growth',
    price: 3000,
    currency: 'SAR',
    period: 'month',
    priceFrom: false,
    highlighted: true,
    name: { en: 'Growth', ar: 'باقة النمو' },
    positioning: {
      en: 'For businesses seeking recurring campaign management and more active lead operations.',
      ar: 'للشركات التي تبحث عن إدارة مستمرة للحملات وعمليات أكثر نشاطاً للعملاء المحتملين.',
    },
    included: {
      en: ['Broader agreed campaign scope', 'Higher content and optimization allowance', 'Lead routing and status tracking', 'Follow-up monitoring', 'Regular reporting and recommendations', 'Scheduled performance review'],
      ar: ['نطاق حملات متفق عليه أوسع', 'مخصصات أعلى للمحتوى والتحسين', 'توجيه العملاء المحتملين وتتبع حالاتهم', 'مراقبة المتابعة', 'تقارير دورية وتوصيات', 'مراجعة أداء مجدولة'],
    },
  },
  {
    id: 'managed-growth-plus',
    price: 5000,
    currency: 'SAR',
    period: 'month',
    priceFrom: true,
    name: { en: 'Managed Growth Plus', ar: 'باقة النمو المتقدم' },
    positioning: {
      en: 'For businesses with greater campaign, reporting or operational complexity.',
      ar: 'للشركات ذات المتطلبات الأعلى في الحملات أو التقارير أو العمليات التشغيلية.',
    },
    included: {
      en: ['Expanded agreed campaign scope', 'Higher creative allowance', 'More complex lead workflows', 'Additional reporting and review', 'Defined support and escalation', 'Optional approved workflow enhancements'],
      ar: ['نطاق حملات موسع متفق عليه', 'مخصصات إبداعية أعلى', 'مسارات عملاء محتملين أكثر تعقيداً', 'تقارير ومراجعات إضافية', 'دعم وتصعيد محددان', 'تحسينات اختيارية لمسار العمل بعد اعتمادها'],
    },
  },
];

export const PLAN_DISCLOSURES = {
  en: [
    'Advertising spend is excluded. You pay advertising platforms directly.',
    'Third-party expenses are excluded unless explicitly included in the statement of work.',
    'Taxes are handled according to applicable requirements.',
    'Custom integrations may incur additional charges.',
    'Setup fees, if introduced, will be disclosed clearly before you commit.',
    'Package scope is confirmed in the statement of work.',
    'All prices are provisional and subject to final commercial approval.',
  ],
  ar: [
    'الإنفاق الإعلاني غير مشمول. تدفع للمنصات الإعلانية مباشرةً.',
    'المصروفات الخارجية غير مشمولة ما لم تُذكر صراحةً في بيان العمل.',
    'تُعالج الضرائب وفق المتطلبات المعمول بها.',
    'قد تترتب رسوم إضافية على التكاملات المخصصة.',
    'إن فُرضت رسوم إعداد فستُوضح بجلاء قبل الالتزام.',
    'يتم تأكيد نطاق الباقة في بيان العمل.',
    'جميع الأسعار مبدئية وتخضع للاعتماد التجاري النهائي.',
  ],
};
