// Shared form schemas. Used by (a) the static page builder to render fields,
// (b) the browser for UX validation, and (c) the server, which is authoritative.
// Keep this file free of browser or Node-only APIs.

export const INDUSTRY_OPTIONS = [
  { value: 'real-estate', label: { en: 'Real estate and property services', ar: 'العقارات وخدمات الملكية' } },
  { value: 'professional-services', label: { en: 'Professional and business services', ar: 'الخدمات المهنية والأعمال' } },
  { value: 'home-services', label: { en: 'Home and commercial services', ar: 'خدمات المنازل والأعمال' } },
  { value: 'b2b-distribution', label: { en: 'B2B suppliers and distributors', ar: 'الموردون والموزعون (B2B)' } },
  { value: 'retail-ecommerce', label: { en: 'Retail and e-commerce', ar: 'التجزئة والتجارة الإلكترونية' } },
  { value: 'hospitality-local', label: { en: 'Hospitality and local services', ar: 'الضيافة والخدمات المحلية' } },
  { value: 'other', label: { en: 'Other', ar: 'أخرى' } },
];

const LANG_OPTIONS = [
  { value: 'en', label: { en: 'English', ar: 'English' } },
  { value: 'ar', label: { en: 'Arabic', ar: 'العربية' } },
];

const CONTACT_METHOD_OPTIONS = [
  { value: 'email', label: { en: 'Email', ar: 'البريد الإلكتروني' } },
  { value: 'phone', label: { en: 'Phone', ar: 'الهاتف' } },
  { value: 'either', label: { en: 'Either', ar: 'أيهما مناسب' } },
];

const BUDGET_OPTIONS = [
  { value: 'under-5k', label: { en: 'Under SAR 5,000 / month', ar: 'أقل من 5,000 ر.س شهرياً' } },
  { value: '5k-15k', label: { en: 'SAR 5,000 – 15,000 / month', ar: 'من 5,000 إلى 15,000 ر.س شهرياً' } },
  { value: '15k-50k', label: { en: 'SAR 15,000 – 50,000 / month', ar: 'من 15,000 إلى 50,000 ر.س شهرياً' } },
  { value: 'over-50k', label: { en: 'Over SAR 50,000 / month', ar: 'أكثر من 50,000 ر.س شهرياً' } },
  { value: 'not-sure', label: { en: 'Not sure yet / prefer not to say', ar: 'غير متأكد بعد / أفضل عدم الإفصاح' } },
];

const commonDefs = {
  name: { label: { en: 'Full name', ar: 'الاسم الكامل' }, type: 'text', required: true, min: 2, max: 100, autocomplete: 'name' },
  businessName: { label: { en: 'Business name', ar: 'اسم النشاط التجاري' }, type: 'text', required: true, min: 2, max: 150, autocomplete: 'organization' },
  workEmail: { label: { en: 'Work email', ar: 'البريد الإلكتروني للعمل' }, type: 'email', required: true, max: 254, autocomplete: 'email' },
  phone: {
    label: { en: 'Phone (with country code)', ar: 'الهاتف (مع رمز الدولة)' },
    help: { en: 'Example format: +966 5X XXX XXXX', ar: 'مثال على الصيغة: ‎+966 5X XXX XXXX' },
    type: 'tel', required: false, max: 20, pattern: 'phone', autocomplete: 'tel',
  },
  industry: { label: { en: 'Industry', ar: 'القطاع' }, type: 'select', required: true, options: INDUSTRY_OPTIONS },
  preferredLanguage: { label: { en: 'Preferred language', ar: 'اللغة المفضلة' }, type: 'select', required: true, options: LANG_OPTIONS },
  preferredContact: { label: { en: 'Preferred contact method', ar: 'طريقة التواصل المفضلة' }, type: 'select', required: false, options: CONTACT_METHOD_OPTIONS },
  websiteUrl: { label: { en: 'Website (optional)', ar: 'الموقع الإلكتروني (اختياري)' }, type: 'url', required: false, max: 300, autocomplete: 'url' },
  privacyAck: { label: { en: 'I have read the Privacy Policy and agree that my details may be used to respond to my enquiry.', ar: 'قرأتُ سياسة الخصوصية وأوافق على استخدام بياناتي للرد على استفساري.' }, type: 'checkbox', required: true, mustBeTrue: true },
  marketingOptIn: { label: { en: 'Optional: send me occasional marketing emails. I can withdraw consent at any time.', ar: 'اختياري: أرغب في تلقي رسائل تسويقية بالبريد الإلكتروني من وقت لآخر. يمكنني سحب موافقتي في أي وقت.' }, type: 'checkbox', required: false },
};

// Each shared field carries its own name so every form can reuse it.
const common = Object.fromEntries(Object.entries(commonDefs).map(([name, def]) => [name, { name, ...def }]));

export const FORMS = {
  contact: {
    id: 'contact',
    submitTo: 'contact',
    fields: [
      { name: 'enquiryType', label: { en: 'Enquiry category', ar: 'تصنيف الاستفسار' }, type: 'select', required: true, options: [
        { value: 'consultation', label: { en: 'Consultation request', ar: 'طلب استشارة' } },
        { value: 'service', label: { en: 'Service enquiry', ar: 'استفسار عن الخدمة' } },
        { value: 'pricing', label: { en: 'Pricing question', ar: 'سؤال عن الأسعار' } },
        { value: 'partnership', label: { en: 'Partnership or other', ar: 'شراكة أو أخرى' } },
      ] },
      common.name, common.businessName, common.workEmail, common.phone, common.preferredLanguage, common.industry,
      { name: 'challenge', label: { en: 'Current marketing challenge', ar: 'التحدي التسويقي الحالي' }, type: 'textarea', required: true, min: 10, max: 1500 },
      common.websiteUrl, common.preferredContact, common.privacyAck, common.marketingOptIn,
    ],
  },

  consultation: {
    id: 'consultation',
    submitTo: 'consultation',
    fields: [
      common.name, common.businessName, common.workEmail, common.phone, common.preferredLanguage, common.industry,
      { name: 'currentSources', label: { en: 'Current enquiry sources', ar: 'مصادر الاستفسارات الحالية' }, type: 'textarea', required: false, max: 600,
        help: { en: 'For example: search ads, social ads, website forms, phone calls, messaging apps.', ar: 'مثلاً: الإعلانات البحثية، إعلانات التواصل الاجتماعي، نماذج الموقع، المكالمات، تطبيقات المراسلة.' } },
      { name: 'challenge', label: { en: 'What would you like to improve?', ar: 'ما الذي ترغب في تحسينه؟' }, type: 'textarea', required: true, min: 10, max: 1500 },
      { name: 'budgetRange', label: { en: 'Approximate monthly advertising budget (optional)', ar: 'الميزانية الإعلانية الشهرية التقريبية (اختياري)' }, type: 'select', required: false, options: BUDGET_OPTIONS,
        help: { en: 'Advertising spend is paid directly to platforms and is not part of the service fee.', ar: 'يُدفع الإنفاق الإعلاني مباشرةً للمنصات، ولا يشمله رسم الخدمة.' } },
      { name: 'timeWindow', label: { en: 'Preferred time window (optional, a request only)', ar: 'الفترة الزمنية المفضلة (اختياري، طلب فقط)' }, type: 'text', required: false, max: 200,
        help: { en: 'This is a request. We will confirm a time by email or phone once our team has reviewed it.', ar: 'هذا طلب فقط. سنؤكد الموعد بالبريد الإلكتروني أو الهاتف بعد مراجعة فريقنا لطلبك.' } },
      common.preferredContact, common.privacyAck, common.marketingOptIn,
    ],
  },

  'get-started': {
    id: 'get-started',
    submitTo: 'get-started',
    steps: [
      { id: 'business', title: { en: 'Business information', ar: 'معلومات النشاط' }, fields: [
        common.businessName, common.name, common.workEmail, common.phone,
        common.websiteUrl, common.industry,
        { name: 'serviceArea', label: { en: 'Business location or service area', ar: 'موقع النشاط أو منطقة الخدمة' }, type: 'text', required: true, min: 2, max: 200 },
        common.preferredLanguage,
      ] },
      { id: 'goals', title: { en: 'Business goals', ar: 'أهداف النشاط' }, fields: [
        { name: 'goals', label: { en: 'What do you want to improve? (select all that apply)', ar: 'ما الذي ترغب في تحسينه؟ (اختر ما ينطبق)' }, type: 'checkbox-group', required: true, options: [
          { value: 'qualified-enquiries', label: { en: 'More qualified enquiries', ar: 'استفسارات مؤهلة أكثر' } },
          { value: 'lead-tracking', label: { en: 'Better lead tracking', ar: 'تتبع أفضل للعملاء المحتملين' } },
          { value: 'faster-followup', label: { en: 'Faster follow-up', ar: 'متابعة أسرع' } },
          { value: 'campaign-reporting', label: { en: 'Improved campaign reporting', ar: 'تحسين تقارير الحملات' } },
          { value: 'conversion-visibility', label: { en: 'Better visibility into conversion outcomes', ar: 'رؤية أوضح للنتائج التجارية' } },
          { value: 'other', label: { en: 'Other', ar: 'أخرى' } },
        ] },
        { name: 'goalsOther', label: { en: 'Please describe (if Other)', ar: 'يرجى التوضيح (إذا اخترت أخرى)' }, type: 'text', required: false, max: 300 },
      ] },
      { id: 'current', title: { en: 'Current marketing setup', ar: 'الإعداد التسويقي الحالي' }, fields: [
        { name: 'channels', label: { en: 'Advertising channels currently used', ar: 'قنوات الإعلان المستخدمة حالياً' }, type: 'checkbox-group', required: false, options: [
          { value: 'search', label: { en: 'Search advertising', ar: 'الإعلانات البحثية' } },
          { value: 'social', label: { en: 'Social advertising', ar: 'إعلانات التواصل الاجتماعي' } },
          { value: 'video', label: { en: 'Video advertising', ar: 'الإعلانات المرئية' } },
          { value: 'marketplace', label: { en: 'Marketplace or listing platforms', ar: 'منصات السوق أو الإدراج' } },
          { value: 'none', label: { en: 'None currently', ar: 'لا شيء حالياً' } },
          { value: 'other', label: { en: 'Other', ar: 'أخرى' } },
        ] },
        { name: 'budgetRange', label: { en: 'Approximate monthly advertising budget (optional)', ar: 'الميزانية الإعلانية الشهرية التقريبية (اختياري)' }, type: 'select', required: false, options: BUDGET_OPTIONS },
        { name: 'crmTools', label: { en: 'Current CRM or lead-management tools (optional)', ar: 'أدوات إدارة العملاء أو المحتملين الحالية (اختياري)' }, type: 'text', required: false, max: 300 },
        { name: 'leadSources', label: { en: 'Existing lead sources (optional)', ar: 'مصادر العملاء المحتملين الحالية (اختياري)' }, type: 'text', required: false, max: 300 },
        { name: 'followUpProcess', label: { en: 'How is follow-up handled today?', ar: 'كيف تتم المتابعة حالياً؟' }, type: 'select', required: true, options: [
          { value: 'none', label: { en: 'No defined process', ar: 'لا توجد عملية محددة' } },
          { value: 'informal', label: { en: 'Informal, handled by individuals', ar: 'غير رسمية، يتولاها أفراد' } },
          { value: 'defined', label: { en: 'Defined, but tracked manually', ar: 'محددة، ولكن تُتابع يدوياً' } },
          { value: 'system', label: { en: 'Defined and tracked in a system', ar: 'محددة ومتابعة في نظام' } },
        ] },
      ] },
      { id: 'service', title: { en: 'Service requirements', ar: 'متطلبات الخدمة' }, fields: [
        { name: 'preferredPackage', label: { en: 'Preferred package (provisional)', ar: 'الباقة المفضلة (مبدئياً)' }, type: 'select', required: true, options: [
          { value: 'essential', label: { en: 'Essential — SAR 1,500 / month', ar: 'الباقة الأساسية — 1,500 ر.س شهرياً' } },
          { value: 'growth', label: { en: 'Growth — SAR 3,000 / month', ar: 'باقة النمو — 3,000 ر.س شهرياً' } },
          { value: 'managed-growth-plus', label: { en: 'Managed Growth Plus — from SAR 5,000 / month', ar: 'باقة النمو المتقدم — من 5,000 ر.س شهرياً' } },
          { value: 'not-sure', label: { en: 'Not sure — please advise', ar: 'غير متأكد — نرجو الاستشارة' } },
        ] },
        { name: 'startTimeframe', label: { en: 'Desired start timeframe', ar: 'الإطار الزمني المرغوب للبدء' }, type: 'select', required: true, options: [
          { value: 'within-month', label: { en: 'Within the next month', ar: 'خلال الشهر القادم' } },
          { value: 'one-to-three', label: { en: 'In 1 to 3 months', ar: 'خلال 1 إلى 3 أشهر' } },
          { value: 'later', label: { en: 'More than 3 months', ar: 'أكثر من 3 أشهر' } },
          { value: 'exploring', label: { en: 'Still exploring', ar: 'ما زلنا نستكشف' } },
        ] },
        { name: 'integrations', label: { en: 'Systems you may need connected (we will confirm feasibility)', ar: 'أنظمة قد تحتاج إلى ربطها (سنؤكد إمكانية ذلك)' }, type: 'checkbox-group', required: false, options: [
          { value: 'crm', label: { en: 'CRM system', ar: 'نظام إدارة العملاء' } },
          { value: 'website-forms', label: { en: 'Website enquiry forms', ar: 'نماذج الاستفسار في الموقع' } },
          { value: 'messaging', label: { en: 'Messaging or phone workflow', ar: 'مسار المراسلة أو الهاتف' } },
          { value: 'spreadsheets', label: { en: 'Spreadsheets for manual tracking', ar: 'جداول بيانات للتتبع اليدوي' } },
          { value: 'none', label: { en: 'None yet', ar: 'لا شيء بعد' } },
        ] },
        { name: 'operationalRequirements', label: { en: 'Additional operational requirements (optional)', ar: 'متطلبات تشغيلية إضافية (اختياري)' }, type: 'textarea', required: false, max: 1000 },
      ] },
      { id: 'review', title: { en: 'Review and acknowledge', ar: 'المراجعة والإقرار' }, review: true, fields: [
        common.privacyAck,
        { name: 'scopeAck', label: { en: 'I understand that advertising spend is paid directly to platforms, that the service fee is separate, and that final scope and pricing are confirmed in a statement of work.', ar: 'أفهم أن الإنفاق الإعلاني يُدفع مباشرةً للمنصات، وأن رسم الخدمة منفصل، وأن النطاق والأسعار النهائية تُؤكد في بيان العمل.' }, type: 'checkbox', required: true, mustBeTrue: true },
        { name: 'noActivationAck', label: { en: 'I understand that submitting this form does not activate a service or create a paid subscription.', ar: 'أفهم أن إرسال هذا النموذج لا يُفعّل أي خدمة ولا ينشئ اشتراكاً مدفوعاً.' }, type: 'checkbox', required: true, mustBeTrue: true },
        common.marketingOptIn,
      ] },
    ],
  },
};

// Field names that must never be accepted from the public form (e.g. credentials).
export const FORBIDDEN_FIELD_NAMES = ['password', 'adPassword', 'accountPassword', 'token', 'cardNumber', 'iban'];

export const HONEYPOT_FIELD = 'company_fax';

export function allFields(form) {
  if (form.fields) return form.fields;
  return form.steps.flatMap((s) => s.fields);
}
