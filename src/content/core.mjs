// Core public pages. Every visible string is bilingual: { en, ar }.
// Arabic is professionally drafted; it still requires native-speaker editorial review (see docs/CONTENT_PUBLICATION_CHECKLIST.md).
import { sar } from '../render.mjs';
import { PLANS } from '../site.mjs';

const P = (en, ar) => ({ en, ar });

const priceLine = (id) => {
  const p = PLANS.find((x) => x.id === id);
  return { en: `${sar(p.price, 'en')} / month${p.priceFrom ? ' (from)' : ''}`, ar: `${p.priceFrom ? 'ابتداءً من ' : ''}${sar(p.price, 'ar')} / شهرياً` };
};

export const corePages = [
  // ---------------- HOME ----------------
  {
    slug: '',
    active: 'home',
    title: P('Digital Growth Operations for Saudi Businesses', 'عمليات النمو الرقمي للشركات في السعودية'),
    description: P(
      'Campaign management, lead tracking and coordinated follow-up in one organized growth service for Saudi businesses. Transparent fees; advertising budgets stay under your control.',
      'إدارة الحملات وتتبع العملاء المحتملين وتنسيق المتابعة ضمن خدمة نمو متكاملة للشركات في السعودية. رسوم واضحة، وتبقى الميزانية الإعلانية تحت سيطرتك.'
    ),
    homeTitle: P('Make Every Marketing Enquiry Count | YECH', 'اجعل كل استفسار تسويقي فرصة تستحق المتابعة | YECH'),
    sections: [
      {
        type: 'hero',
        visual: 'dashboard',
        eyebrow: P('YECH MARKETING OPERATIONS · FOR SAUDI BUSINESSES', 'YECH Marketing Operations · للشركات في السعودية'),
        title: P('Make Every Marketing Enquiry Count.', 'اجعل كل استفسار تسويقي فرصة تستحق المتابعة.'),
        lead: P(
          'Campaign management, lead tracking and coordinated follow-up in one organized growth service. Understand where enquiries come from, which prospects meet your criteria, and what happens next.',
          'إدارة الحملات وتتبع العملاء المحتملين وتنسيق المتابعة ضمن خدمة نمو متكاملة. تعرّف على مصادر الاستفسارات، وحدد العملاء الذين يستوفون معاييرك، وتابع الخطوات التالية بوضوح.'
        ),
        actions: [
          { label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation', variant: 'primary' },
          { label: P('Explore Our Services', 'اكتشف خدماتنا'), to: 'services', variant: 'ghost' },
        ],
        trust: P(
          ['Transparent service fees.', 'Client-controlled advertising budgets.', 'Clearly defined lead criteria.'],
          ['رسوم خدمة واضحة.', 'ميزانيات إعلانية تحت سيطرة العميل.', 'معايير محددة لتأهيل العملاء المحتملين.']
        ),
      },
      {
        type: 'cards',
        columns: 3,
        title: P('Marketing Activity Is Not the Same as Commercial Progress.', 'النشاط التسويقي لا يعني بالضرورة تحقيق تقدم تجاري.'),
        intro: P('These are common patterns we design the service around. They are not statistics; every business will differ.', 'هذه أنماط شائعة نصمم الخدمة في ضوئها. ليست إحصاءات، ولكل نشاط تجاري ظروفه.'),
        items: [
          { icon: 'layers', title: P('Campaigns and enquiries sit in different places', 'الحملات والاستفسارات موزعة على أماكن مختلفة'), text: P('Ad platforms, inboxes, phone logs and spreadsheets rarely tell one connected story.', 'منصات الإعلان وصناديق البريد وسجلات المكالمات والجداول لا تروي قصة واحدة مترابطة غالباً.') },
          { icon: 'funnel', title: P('Priority is unclear', 'الأولوية غير واضحة'), text: P('Without agreed criteria, it is hard to know which enquiries deserve attention first.', 'بدون معايير متفق عليها يصعب معرفة أي الاستفسارات تستحق الاهتمام أولاً.') },
          { icon: 'clock', title: P('Follow-up becomes inconsistent', 'تصبح المتابعة غير منتظمة'), text: P('Good enquiries can wait too long for a response when nobody owns the next step.', 'قد تنتظر استفسارات جيدة وقتاً طويلاً للرد عندما لا يكون هناك مسؤول واضح عن الخطوة التالية.') },
          { icon: 'chart', title: P('Reporting focuses on clicks', 'التقارير تركز على النقرات'), text: P('Clicks and impressions are useful signals, but they do not show qualified demand or commercial milestones.', 'النقرات والظهور مؤشرات مفيدة، لكنها لا تُظهر الطلب المؤهل ولا المراحل التجارية.') },
          { icon: 'users', title: P('Ownership of the next action is unclear', 'المسؤولية عن الخطوة التالية غير محددة'), text: P('Marketing, sales and operations can each assume that someone else is following up.', 'قد يفترض التسويق والمبيعات والعمليات أن جهة أخرى تتولى المتابعة.') },
        ],
      },
      {
        type: 'workflow',
        id: 'home-workflow',
        title: P('One Connected Workflow From Campaign to Conversion.', 'مسار واحد مترابط من الحملة إلى التحويل.'),
        intro: P('Six connected stages. Each stage has an owner, agreed criteria and a measurable output.', 'ست مراحل مترابطة. لكل مرحلة مسؤول ومعايير متفق عليها ومخرج قابل للقياس.'),
        caption: P('Illustrative process. Stage timing depends on onboarding, approvals and platform permissions.', 'مسار توضيحي. يعتمد توقيت كل مرحلة على الإعداد والاعتمادات وصلاحيات المنصات.'),
        stages: [
          { title: P('Plan', 'خطّط'), text: P('Goals, audience, offer, budget', 'الأهداف والجمهور والعرض والميزانية') },
          { title: P('Launch', 'أطلق'), text: P('Approved campaigns', 'حملات معتمدة') },
          { title: P('Capture', 'استقبل'), text: P('Enquiries organized', 'تنظيم الاستفسارات') },
          { title: P('Qualify', 'أهّل'), text: P('Agreed criteria', 'معايير متفق عليها') },
          { title: P('Follow up', 'تابِع'), text: P('Owners and reminders', 'مسؤولون وتذكيرات') },
          { title: P('Measure and improve', 'قِس وحسّن'), text: P('Evidence-based review', 'مراجعة قائمة على الأدلة') },
        ],
      },
      {
        type: 'cards',
        columns: 3,
        title: P('Core Services', 'الخدمات الأساسية'),
        intro: P('Six capabilities that work together. Each links to the detailed service page.', 'ست قدرات تعمل معاً. كل قدرة ترتبط بصفحة الخدمة التفصيلية.'),
        items: [
          { icon: 'target', title: P('Campaign Management', 'إدارة الحملات الإعلانية'), text: P('Planning, setup, monitoring and optimization within an approved budget.', 'التخطيط والإعداد والمراقبة والتحسين ضمن ميزانية معتمدة.'), bullets: P(['Objectives and audience definition', 'Budget limits you approve', 'Change log and review'], ['تحديد الأهداف والجمهور', 'حدود ميزانية تعتمدها', 'سجل تغييرات ومراجعة']), to: 'services/campaign-management' },
          { icon: 'pen', title: P('Content and Creative Coordination', 'تنسيق المحتوى والإبداع'), text: P('Coordinating copy and creative approvals with your team and any production partners.', 'تنسيق النصوص والتصاميم والاعتمادات مع فريقك وأي شركاء إنتاج.'), bullets: P(['Copy and creative briefs', 'Approval workflow', 'Version control'], ['موجزات النصوص والتصاميم', 'مسار الاعتماد', 'التحكم في الإصدارات']), to: 'services/campaign-management' },
          { icon: 'merge', title: P('Lead Capture and Organization', 'استقبال الاستفسارات وتنظيمها'), text: P('Bringing enquiries from agreed sources into one organized record.', 'جمع الاستفسارات من المصادر المتفق عليها في سجل منظم واحد.'), bullets: P(['Source tagging', 'Duplicate handling rules', 'Consent fields where relevant'], ['وسم المصادر', 'قواعد معالجة المكرر', 'حقول الموافقة عند اللزوم']), to: 'services/lead-management' },
          { icon: 'check', title: P('Lead Qualification', 'تأهيل العملاء المحتملين'), text: P('Applying qualification criteria that you agree before launch.', 'تطبيق معايير التأهيل التي توافق عليها قبل الإطلاق.'), bullets: P(['Client-defined criteria', 'Status and reason codes', 'Unknown status is recorded'], ['معايير يحددها العميل', 'رموز الحالة والسبب', 'تسجيل الحالات غير المعروفة']), to: 'services/lead-management' },
          { icon: 'clock', title: P('Follow-Up Coordination', 'تنسيق المتابعة'), text: P('Assigning owners, reminders and overdue alerts so the next action is clear.', 'تحديد المسؤولين والتذكيرات وتنبيهات المهام المتأخرة لتتضح الخطوة التالية.'), bullets: P(['Next-action ownership', 'Response-time monitoring', 'Contact attempt log'], ['مسؤولية الخطوة التالية', 'مراقبة زمن الاستجابة', 'سجل محاولات التواصل']), to: 'services/follow-up' },
          { icon: 'chart', title: P('Analytics and Recommendations', 'التحليلات والتوصيات'), text: P('Reports that separate advertising spend, service fees and lead outcomes.', 'تقارير تفصل الإنفاق الإعلاني ورسوم الخدمة ونتائج العملاء المحتملين.'), bullets: P(['Defined metric methodology', 'Data completeness notes', 'Evidence-based recommendations'], ['منهجية مؤشرات معرّفة', 'ملاحظات اكتمال البيانات', 'توصيات قائمة على الأدلة']), to: 'services/analytics' },
        ],
      },
      {
        type: 'steps',
        title: P('كيف نعمل معك؟', 'كيف نعمل معك؟'),
        intro: P('Four steps from first conversation to ongoing review.', 'أربع خطوات من أول حديث حتى المراجعة المستمرة.'),
        items: [
          { title: P('Understand your business and acquisition goals.', 'نفهم نشاطك التجاري وأهدافك.'), text: P('A consultation to review your current enquiry sources, offer and goals.', 'استشارة لمراجعة مصادر الاستفسارات الحالية والعرض والأهداف.') },
          { title: P('Agree on audience, offer, budget and qualification rules.', 'نتفق على الجمهور المستهدف والعرض والميزانية ومعايير التأهيل.'), text: P('Documented in a scope questionnaire and statement of work before launch.', 'تُوثّق في استبيان النطاق وبيان العمل قبل الإطلاق.') },
          { title: P('Launch and manage approved campaigns.', 'نطلق الحملات المعتمدة ونديرها.'), text: P('Within the budget and change-approval process you agree to.', 'ضمن الميزانية وآلية اعتماد التغييرات التي توافق عليها.') },
          { title: P('Review lead quality, follow-up and commercial progress.', 'نراجع جودة العملاء والمتابعة والتقدم التجاري.'), text: P('Regular reporting, with recommendations based on the data available.', 'تقارير دورية مع توصيات مبنية على البيانات المتاحة.') },
        ],
      },
      {
        type: 'cards',
        columns: 5,
        title: P('Industries', 'القطاعات'),
        intro: P('Each sector page explains how the workflow can be adapted. We do not claim validated results in any sector yet.', 'تشرح كل صفحة قطاع كيف يمكن تكييف المسار. لا ندّعي نتائج مثبتة في أي قطاع حتى الآن.'),
        items: [
          { icon: 'building', title: P('Real Estate', 'العقارات'), to: 'industries/real-estate', linkLabel: P('View solution', 'عرض الحل') },
          { icon: 'briefcase', title: P('Professional Services', 'الخدمات المهنية'), to: 'industries/professional-services', linkLabel: P('View solution', 'عرض الحل') },
          { icon: 'wrench', title: P('Home and Commercial Services', 'خدمات المنازل والأعمال'), to: 'industries/home-services', linkLabel: P('View solution', 'عرض الحل') },
          { icon: 'truck', title: P('B2B and Distribution', 'الموردون والتوزيع'), to: 'industries/b2b-distribution', linkLabel: P('View solution', 'عرض الحل') },
          { icon: 'cart', title: P('Retail and E-commerce', 'التجزئة والتجارة الإلكترونية'), to: 'industries/retail-ecommerce', linkLabel: P('View solution', 'عرض الحل') },
        ],
      },
      {
        type: 'prose',
        title: P('Your Advertising Budget Stays Yours.', 'ميزانيتك الإعلانية تبقى تحت سيطرتك.'),
        paragraphs: P(
          [
            'You pay advertising platforms directly. Our service fee is billed separately.',
            'You control your advertising accounts. Budget changes follow an approval process agreed in advance.',
            'Performance reports distinguish advertising costs from service fees, so you can see both clearly.',
          ],
          [
            'تدفع للمنصات الإعلانية مباشرةً، بينما تُحاسب على خدمة الإدارة بشكل منفصل.',
            'تحتفظ بالتحكم في حساباتك الإعلانية، وتُنفذ تغييرات الميزانية وفق آلية اعتماد متفق عليها مسبقاً.',
            'تفصل التقارير بين تكاليف الإعلان ورسوم الخدمة، لتتضح الصورة لك بالكامل.',
          ]
        ),
        bullets: P(
          ['Client pays advertising platforms directly', 'Service fee is separate and disclosed in advance', 'Client controls the advertising account', 'Budget changes require agreed approval', 'Reports separate advertising costs from fees'],
          ['العميل يدفع للمنصات الإعلانية مباشرةً', 'رسوم الخدمة منفصلة ومعلنة مسبقاً', 'العميل يتحكم في الحساب الإعلاني', 'تغييرات الميزانية تتطلب اعتماداً متفقاً عليه', 'التقارير تفصل تكاليف الإعلان عن الرسوم']
        ),
      },
      {
        type: 'dashboard',
        title: P('Reporting preview', 'معاينة التقارير'),
        intro: P('A sample of the reporting layout. Every figure below is illustrative. Results depend on available data and agreed definitions.', 'عينة من تخطيط التقارير. جميع الأرقام أدناه توضيحية. وتعتمد النتائج على البيانات المتاحة والتعريفات المتفق عليها.'),
      },
      {
        type: 'cards',
        columns: 3,
        title: P('Pricing preview', 'معاينة الأسعار'),
        intro: P('Configurable launch pricing, subject to final commercial approval. Advertising spend is excluded.', 'أسعار إطلاق قابلة للتعديل، وتخضع للاعتماد التجاري النهائي. الإنفاق الإعلاني غير مشمول.'),
        items: [
          { title: PLANS[0].name, text: PLANS[0].positioning, linkLabel: priceLine('essential'), to: 'pricing' },
          { title: PLANS[1].name, text: PLANS[1].positioning, linkLabel: priceLine('growth'), to: 'pricing' },
          { title: PLANS[2].name, text: PLANS[2].positioning, linkLabel: priceLine('managed-growth-plus'), to: 'pricing' },
        ],
      },
      {
        type: 'accordion',
        id: 'home-faq',
        title: P('Frequently asked questions', 'الأسئلة الشائعة'),
        openFirst: true,
        items: [
          { q: P('Is advertising spend included?', 'هل الإنفاق الإعلاني مشمول؟'), a: P('No. Advertising spend is paid directly by you to the relevant advertising platforms. Our service fee is charged separately, and any additional expenses are disclosed in advance.', 'لا. تدفع الإنفاق الإعلاني مباشرةً إلى المنصات المعنية، وتُحاسب على رسوم الخدمة بشكل منفصل. ونوضح أي مصروفات إضافية قبل اعتمادها.') },
          { q: P('Do you guarantee sales?', 'هل تضمنون المبيعات؟'), a: P('No. We manage the agreed marketing and lead operations process and report measurable outcomes. Sales depend on factors including your offer, pricing, sales team, market conditions and customer decisions.', 'لا نضمن عدداً محدداً من المبيعات. ندير العمليات التسويقية وإدارة العملاء المتفق عليها ونقيس النتائج المتاحة، بينما تتأثر المبيعات بعوامل متعددة، منها العرض والأسعار وفريق المبيعات وظروف السوق وقرارات العملاء.') },
          { q: P('Who owns the advertising accounts?', 'من يمتلك الحسابات الإعلانية؟'), a: P('Our preferred arrangement is for you to own and control your advertising accounts while granting us the access required to perform the agreed work.', 'نفضّل أن تحتفظ بملكية حساباتك الإعلانية والتحكم فيها، مع منحنا الصلاحيات اللازمة لتنفيذ الأعمال المتفق عليها.') },
          { q: P('What is a qualified lead?', 'ما هو العميل المحتمل المؤهل؟'), a: P('A qualified lead is an enquiry that meets the criteria agreed with your business before the campaign starts. The criteria depend on your industry and commercial objectives.', 'العميل المحتمل المؤهل هو استفسار يستوفي المعايير التي نتفق عليها مع نشاطك التجاري قبل بدء الحملة. وتختلف هذه المعايير حسب القطاع والأهداف التجارية.') },
          { q: P('Can you work with our existing CRM or messaging workflow?', 'هل يمكنكم العمل مع نظام إدارة العملاء أو مسار المراسلة الحالي؟'), a: P('We assess your current tools during onboarding. Integration depends on technical compatibility, available permissions, platform support and the agreed scope. Where a direct integration is unavailable, an approved alternative may be used.', 'نراجع أدواتك الحالية أثناء بدء التعاون. ويعتمد الربط على التوافق التقني والصلاحيات المتاحة ودعم المنصات ونطاق العمل المتفق عليه. وإذا تعذر الربط المباشر، فقد نستخدم بديلاً مناسباً بعد اعتماده.') },
        ],
        cta: { title: P('See all answers', 'اطلع على جميع الإجابات'), text: P('Searchable FAQ covering pricing, advertising, data and contracts.', 'أسئلة شائعة قابلة للبحث تغطي الأسعار والإعلانات والبيانات والعقود.'), actions: [{ label: P('Open the FAQ', 'افتح الأسئلة الشائعة'), to: 'faq', variant: 'ghost' }] },
      },
      {
        type: 'cta',
        title: P('Ready to Make Your Marketing More Measurable?', 'هل أنت مستعد لجعل نتائجك التسويقية أكثر وضوحاً؟'),
        text: P('Tell us about your business, your current acquisition process and the outcomes you want to improve. We will assess whether our service is a suitable fit.', 'أخبرنا عن نشاطك التجاري وآلية اكتساب العملاء الحالية والنتائج التي ترغب في تحسينها. سنقيّم مدى ملاءمة خدماتنا لاحتياجاتك.'),
        actions: [{ label: P('Discuss Your Growth Goals', 'ناقش أهداف نموك معنا'), to: 'consultation', variant: 'primary' }],
      },
    ],
  },

  // ---------------- HOW IT WORKS ----------------
  {
    slug: 'how-it-works',
    active: 'how',
    title: P('How It Works', 'آلية العمل'),
    description: P('How our service works from business discovery to reporting: what we do, what you provide, what is produced, what is measured and what can cause delays.', 'كيف تعمل خدمتنا من فهم النشاط التجاري حتى التقارير: ما نقوم به، وما تقدمه، والمخرجات، وما يُقاس، وما قد يسبب تأخيراً.'),
    sections: [
      {
        type: 'intro',
        eyebrow: P('Service lifecycle', 'دورة حياة الخدمة'),
        title: P('كيف تعمل خدمتنا؟', 'كيف تعمل خدمتنا؟'),
        lead: P(
          'We follow a clear process that starts with understanding your business and ends with reviewing results and recommendations, with responsibilities for each party defined at every stage.',
          'نتبع عملية واضحة تبدأ بفهم نشاطك التجاري وتنتهي بمراجعة النتائج والتوصيات، مع تحديد مسؤوليات كل طرف في كل مرحلة.'
        ),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
      {
        type: 'workflow',
        id: 'hiw-flow',
        title: P('Process diagram', 'مخطط العملية'),
        stages: [
          { title: P('1. Business discovery', '1. فهم النشاط') },
          { title: P('2. Goals and baseline', '2. الأهداف والخط الأساسي') },
          { title: P('3. Campaign and offer planning', '3. تخطيط الحملة والعرض') },
          { title: P('4. Approval and launch', '4. الاعتماد والإطلاق') },
          { title: P('5. Lead capture', '5. استقبال الاستفسارات') },
          { title: P('6. Qualification and routing', '6. التأهيل والتوجيه') },
          { title: P('7. Follow-up coordination', '7. تنسيق المتابعة') },
          { title: P('8. Reporting and improvement', '8. التقارير والتحسين') },
        ],
        caption: P('Onboarding and integration steps are not instantaneous. Timing depends on the items listed in each row below.', 'الإعداد والربط ليسا فوريين. يعتمد التوقيت على البنود المذكورة في كل صف أدناه.'),
      },
      {
        type: 'table',
        title: P('What happens at each step', 'ما يحدث في كل مرحلة'),
        intro: P('For every step: what we do, what you provide, what is produced, what can be measured and what can delay it.', 'لكل مرحلة: ما نقوم به، وما تقدمه، والمخرجات، وما يمكن قياسه، وما قد يؤخرها.'),
        headers: P(['Step', 'What we do', 'What you provide', 'What is produced', 'What can be measured', 'What can delay it'], ['المرحلة', 'ما نقوم به', 'ما تقدمه', 'المخرجات', 'ما يمكن قياسه', 'ما قد يؤخرها']),
        rows: [
          P(['1. Business discovery', 'Review business model, offer, sales process and current channels.', 'Overview of products, pricing approach, existing sales process, contacts for approvals.', 'Discovery summary', 'Completeness of information received', 'Unavailable stakeholders; unclear offer'], ['1. فهم النشاط', 'مراجعة نموذج النشاط والعرض وعملية البيع والقنوات الحالية.', 'نظرة عامة على المنتجات وطريقة التسعير وعملية البيع الحالية وجهات الاعتماد.', 'ملخص الاكتشاف', 'اكتمال المعلومات المستلمة', 'غياب أصحاب القرار؛ عرض غير واضح']),
          P(['2. Goals and baseline', 'Agree goals, KPIs and the definition of a valid and qualified lead.', 'Historic enquiry data, CRM exports if available, approved lead criteria.', 'KPI sheet and baseline note', 'Baseline availability', 'Missing historic data; disagreement on definitions'], ['2. الأهداف والخط الأساسي', 'الاتفاق على الأهداف ومؤشرات الأداء وتعريف العميل المحتمل الصالح والمؤهل.', 'بيانات الاستفسارات السابقة، وتصدير نظام إدارة العملاء إن وُجد، ومعايير التأهيل المعتمدة.', 'ورقة مؤشرات وملاحظة الخط الأساسي', 'توفر بيانات الأساس', 'نقص البيانات التاريخية؛ اختلاف التعريفات']),
          P(['3. Campaign and offer planning', 'Draft audience, channel, budget and creative plan for approval.', 'Target customer profile, service areas, offer details, budget range, approved claims.', 'Campaign plan and budget proposal', 'Plan approval date', 'Creative approval cycles; legal review of claims'], ['3. تخطيط الحملة والعرض', 'إعداد مسودة الجمهور والقنوات والميزانية والخطة الإبداعية للاعتماد.', 'ملف العميل المستهدف، مناطق الخدمة، تفاصيل العرض، نطاق الميزانية، الادعاءات المعتمدة.', 'خطة الحملة واقتراح الميزانية', 'تاريخ اعتماد الخطة', 'دورات اعتماد التصاميم؛ المراجعة القانونية للادعاءات']),
          P(['4. Approval and launch', 'Set up campaigns, tracking and lead routing after written approval.', 'Access granted to the advertising account via platform permissions; approved creatives.', 'Live campaigns and tracking checklist', 'Launch date; tracking test results', 'Platform permission delays; policy reviews by platforms'], ['4. الاعتماد والإطلاق', 'إعداد الحملات والتتبع وتوجيه العملاء المحتملين بعد الاعتماد الكتابي.', 'منح الصلاحيات للحساب الإعلاني وفق آليات المنصة؛ التصاميم المعتمدة.', 'حملات منشورة وقائمة فحص التتبع', 'تاريخ الإطلاق؛ نتائج اختبار التتبع', 'تأخر الصلاحيات؛ مراجعات السياسات من المنصات']),
          P(['5. Lead capture', 'Route enquiries from agreed sources into one organized record.', 'Access to forms or inboxes in scope; confirmed contact points.', 'Enquiry records with source tags', 'Enquiries received; share with complete source data', 'Untracked calls, messaging apps or offline enquiries']  ,['5. استقبال الاستفسارات', 'توجيه الاستفسارات من المصادر المتفق عليها إلى سجل منظم واحد.', 'الوصول إلى النماذج أو صناديق البريد ضمن النطاق؛ نقاط تواصل مؤكدة.', 'سجلات استفسارات مع وسم المصدر', 'عدد الاستفسارات؛ نسبة السجلات ذات مصدر مكتمل', 'مكالمات أو رسائل غير متتبعة أو استفسارات غير مسجلة']),
          P(['6. Qualification and routing', 'Apply agreed criteria, mark duplicates and route to the owner.', 'Confirmed owners and sales contacts; definitions of statuses and reasons.', 'Qualification status per lead with reason codes', 'Share of valid and qualified leads', 'Unclear criteria; slow owner confirmation']  ,['6. التأهيل والتوجيه', 'تطبيق المعايير المتفق عليها، ووسم المكرر، وتوجيه السجل إلى المسؤول.', 'تأكيد المسؤولين ونقاط البيع؛ تعريفات الحالات وأسبابها.', 'حالة التأهيل لكل عميل مع رموز السبب', 'نسبة العملاء الصالحين والمؤهلين', 'معايير غير واضحة؛ بطء تأكيد المسؤول']),
          P(['7. Follow-up coordination', 'Set reminders, monitor response times, flag overdue tasks, log contact attempts.', 'Working hours, response expectations, team members assigned to follow-up.', 'Follow-up tasks and contact logs', 'Response time; follow-up completion rate', 'Staff availability; sales team capacity; consent restrictions']  ,['7. تنسيق المتابعة', 'ضبط التذكيرات ومراقبة زمن الاستجابة وتمييز المهام المتأخرة وتوثيق المحاولات.', 'ساعات العمل وتوقعات الاستجابة وأعضاء الفريق المكلفون بالمتابعة.', 'مهام متابعة وسجلات تواصل', 'زمن الاستجابة؛ نسبة إكمال المتابعة', 'توفر الفريق؛ طاقة فريق المبيعات؛ قيود الموافقة']),
          P(['8. Reporting and improvement', 'Report on agreed metrics and recommend changes with the evidence available.', 'Timely access to sales milestones where you want them measured.', 'Monthly report and recommendations', 'Reporting completeness; recommendations accepted', 'Missing sales data; attribution gaps']  ,['8. التقارير والتحسين', 'إعداد تقارير وفق المؤشرات المتفق عليها وتقديم توصيات بالأدلة المتاحة.', 'وصول منتظم إلى مراحل المبيعات عند الرغبة في قياسها.', 'تقرير شهري وتوصيات', 'اكتمال التقرير؛ التوصيات المعتمدة', 'نقص بيانات المبيعات؛ فجوات الإسناد']),
        ],
      },
      {
        type: 'checklist',
        title: P('What we need from you', 'ما نحتاجه منك'),
        intro: P('Having these ready shortens onboarding. Tick the items as you prepare them.', 'توفر هذه العناصر يختصر مدة الإعداد. ضع علامة على العناصر عند تجهيزها.'),
        items: P(
          ['A named decision-maker and a day-to-day contact', 'Your offer, pricing approach and service areas', 'Approved claims and anything you cannot say in advertising', 'Your advertising budget range and approval process', 'Access to advertising accounts, granted by you through platform permissions', 'Existing enquiry sources and any historic lead data', 'Qualification criteria written in your own terms', 'Preferred follow-up hours and the team responsible for response'],
          ['مسؤول قرار وجهة اتصال يومية', 'عرضك وطريقة التسعير ومناطق الخدمة', 'الادعاءات المعتمدة وأي شيء لا يمكن ذكره في الإعلانات', 'نطاق ميزانيتك الإعلانية وآلية الاعتماد', 'صلاحيات الوصول للحسابات الإعلانية تمنحها أنت عبر آليات المنصات', 'مصادر الاستفسارات الحالية وأي بيانات تاريخية للعملاء المحتملين', 'معايير التأهيل مكتوبة بلغتكم التجارية', 'ساعات المتابعة المفضلة والفريق المسؤول عن الرد']
        ),
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('Timing and dependencies', 'التوقيت والاعتماديات'),
        text: P('We do not promise instant onboarding, activation or integration. Campaign start dates depend on your approvals, platform review processes, tracking setup and the availability of the information listed above.', 'لا نعد بإعداد أو تفعيل أو ربط فوري. تعتمد مواعيد بدء الحملات على اعتماداتك ومراجعات المنصات وإعداد التتبع وتوفر المعلومات المذكورة أعلاه.'),
      },
      {
        type: 'cta',
        title: P('Ready to start the discovery step?', 'هل أنت مستعد لبدء مرحلة الفهم؟'),
        text: P('Book a consultation to discuss whether this process fits your business.', 'احجز استشارة لمناقشة مدى ملاءمة هذه العملية لنشاطك التجاري.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }, { label: P('Start the scope questionnaire', 'ابدأ استبيان النطاق'), to: 'get-started', variant: 'ghost' }],
      },
    ],
  },

  // ---------------- SERVICES OVERVIEW ----------------
  {
    slug: 'services',
    active: 'services',
    title: P('Services', 'الخدمات'),
    description: P('Campaign management, lead management and qualification, follow-up coordination, and analytics: how the service areas connect into one workflow.', 'إدارة الحملات وإدارة العملاء المحتملين وتأهيلهم وتنسيق المتابعة والتحليلات: كيف ترتبط خدمات العمل في مسار واحد.'),
    sections: [
      {
        type: 'intro',
        title: P('Everything Needed to Manage the Lead Generation Workflow.', 'خدمات متكاملة لإدارة رحلة اكتساب العملاء'),
        lead: P('Four service areas, one connected workflow. Each area has defined inputs, outputs and measures, and the boundary between managed work and client-owned decisions is stated clearly.', 'أربع مجالات خدمة في مسار مترابط واحد. لكل مجال مدخلات ومخرجات ومقاييس محددة، والحد الفاصل بين العمل المُدار وقرارات العميل مُعلن بوضوح.'),
        actions: [{ label: P('Discuss Your Growth Goals', 'ناقش أهداف نموك معنا'), to: 'consultation' }],
      },
      {
        type: 'cards',
        columns: 2,
        title: P('Service areas', 'مجالات الخدمة'),
        items: [
          { icon: 'target', title: P('Campaign Management', 'إدارة الحملات الإعلانية'), text: P('Planning, setup, budget controls, optimization and reporting for approved campaigns. Creative coordination is included here.', 'التخطيط والإعداد وضوابط الميزانية والتحسين والتقارير للحملات المعتمدة. يشمل تنسيق الإبداع.'), to: 'services/campaign-management', linkLabel: P('Campaign details', 'تفاصيل الحملات') },
          { icon: 'merge', title: P('Lead Management and Qualification', 'إدارة العملاء المحتملين وتأهيلهم'), text: P('Capturing enquiries from agreed sources, checking validity, handling duplicates and applying your qualification criteria.', 'استقبال الاستفسارات من المصادر المتفق عليها والتحقق من صلاحيتها ومعالجة المكرر وتطبيق معايير التأهيل.'), to: 'services/lead-management', linkLabel: P('Lead management details', 'تفاصيل إدارة العملاء') },
          { icon: 'clock', title: P('Follow-Up Coordination', 'تنسيق المتابعة'), text: P('Owners, reminders, response-time monitoring, overdue alerts and contact logs. Direct sales conversations are excluded unless contracted.', 'المسؤولون والتذكيرات ومراقبة زمن الاستجابة وتنبيهات المهام المتأخرة وسجلات التواصل. المحادثات البيعية المباشرة غير مشمولة ما لم تُتعاقد عليها.'), to: 'services/follow-up', linkLabel: P('Follow-up details', 'تفاصيل المتابعة') },
          { icon: 'chart', title: P('Analytics and Reporting', 'التحليلات وتقارير الأداء'), text: P('Metrics that separate marketing activity, lead quality and commercial outcomes, with methodology and data-completeness notes.', 'مؤشرات تفصل النشاط التسويقي وجودة العملاء والنتائج التجارية، مع منهجية وملاحظات عن اكتمال البيانات.'), to: 'services/analytics', linkLabel: P('Analytics details', 'تفاصيل التحليلات') },
        ],
      },
      {
        type: 'table',
        title: P('How the service areas depend on each other', 'كيف تعتمد مجالات الخدمة على بعضها'),
        headers: P(['Area', 'Feeds into', 'Depends on'], ['المجال', 'يغذي', 'يعتمد على']),
        rows: [
          P(['Campaign Management', 'Lead capture and volume', 'Approved offer, budget and audience'], ['إدارة الحملات', 'حجم الاستفسارات واستقبالها', 'عرض معتمد وميزانية وجمهور']),
          P(['Lead Management', 'Follow-up queues and qualification reports', 'Campaign source tags; agreed criteria'], ['إدارة العملاء المحتملين', 'قوائم المتابعة وتقارير التأهيل', 'وسوم المصادر من الحملات؛ معايير متفق عليها']),
          P(['Follow-Up Coordination', 'Response and completion metrics', 'Your team capacity and contact consent'], ['تنسيق المتابعة', 'مؤشرات الاستجابة والإكمال', 'طاقة فريقك وموافقات التواصل']),
          P(['Analytics', 'Decisions on budget and process changes', 'Data from all three areas and your sales records'], ['التحليلات', 'قرارات الميزانية وتعديل العمليات', 'بيانات المجالات الثلاثة وسجلات مبيعاتك']),
        ],
      },
      {
        type: 'links',
        title: P('Explore each service', 'استكشف كل خدمة'),
        items: [
          { to: 'services/campaign-management', label: P('Campaign Management', 'إدارة الحملات الإعلانية'), text: P('Lifecycle, budget controls and cost categories', 'دورة الحياة وضوابط الميزانية وفئات التكلفة') },
          { to: 'services/lead-management', label: P('Lead Management and Qualification', 'إدارة العملاء المحتملين وتأهيلهم'), text: P('Pipeline statuses and qualification rules', 'حالات المسار وقواعد التأهيل') },
          { to: 'services/follow-up', label: P('Follow-Up Coordination', 'تنسيق المتابعة'), text: P('Ownership, reminders and consent controls', 'المسؤولية والتذكيرات وضوابط الموافقة') },
          { to: 'services/analytics', label: P('Analytics and Reporting', 'التحليلات وتقارير الأداء'), text: P('Metric definitions and methodology', 'تعريفات المؤشرات والمنهجية') },
          { to: 'measurement', label: P('Results and Measurement Methodology', 'منهجية القياس والنتائج'), text: P('What we measure, what we do not, and why', 'ما الذي نقيسه وما الذي لا نقيسه ولماذا') },
          { to: 'pricing', label: P('Pricing and Plans', 'الأسعار والباقات'), text: P('Provisional packages and exclusions', 'باقات مبدئية والمستثنيات') },
        ],
      },
      {
        type: 'cta',
        title: P('Not sure which service area you need?', 'لست متأكداً من مجال الخدمة الذي تحتاجه؟'),
        text: P('Start with a consultation. We will look at your current enquiry flow and suggest a scope, or tell you if our service is not the right fit.', 'ابدأ باستشارة. سننظر في مسار الاستفسارات الحالي ونقترح نطاقاً، أو نخبرك إن لم تكن خدمتنا مناسبة.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },

  // ---------------- PRICING ----------------
  {
    slug: 'pricing',
    active: 'pricing',
    title: P('Pricing and Plans', 'الأسعار والباقات'),
    description: P('Provisional monthly service packages: Essential, Growth and Managed Growth Plus. Advertising spend and third-party expenses are excluded. Final pricing is subject to commercial approval.', 'باقات خدمة شهرية مبدئية: الأساسية والنمو والنمو المتقدم. الإنفاق الإعلاني والمصروفات الخارجية غير مشمولة. الأسعار النهائية تخضع للاعتماد التجاري.'),
    sections: [
      {
        type: 'intro',
        eyebrow: P('Configurable launch pricing · subject to final commercial approval', 'أسعار إطلاق قابلة للتعديل · تخضع للاعتماد التجاري النهائي'),
        title: P('Transparent packages. Advertising spend billed separately.', 'باقات واضحة. الإنفاق الإعلاني يُدفع بشكل منفصل.'),
        lead: P('Compare the service packages below. Each package lists what is included and what is excluded. Scope is confirmed in a statement of work before any subscription.', 'قارن بين الباقات أدناه. تبين كل باقة ما يشمله وما هو مستثنى. يتم تأكيد النطاق في بيان عمل قبل أي اشتراك.'),
      },
      { type: 'pricing', title: P('Monthly service packages', 'باقات الخدمة الشهرية'), intro: P('Service fees only. Advertising spend is paid directly to the platforms.', 'رسوم الخدمة فقط. يُدفع الإنفاق الإعلاني مباشرةً للمنصات.') },
      {
        type: 'table',
        title: P('Package comparison', 'مقارنة الباقات'),
        intro: P('A summary of the main differences. The statement of work defines the exact scope.', 'ملخص أهم الفروقات. يحدد بيان العمل النطاق الدقيق.'),
        headers: P(['Feature', 'Essential', 'Growth', 'Managed Growth Plus'], ['الميزة', 'الأساسية', 'النمو', 'النمو المتقدم']),
        rows: [
          P(['Campaign scope', 'Defined scope', 'Broader agreed scope', 'Expanded agreed scope'], ['نطاق الحملات', 'نطاق محدد', 'نطاق متفق عليه أوسع', 'نطاق موسع متفق عليه']),
          P(['Content and creative allowance', 'Basic allowance', 'Higher allowance', 'Higher creative allowance'], ['مخصصات المحتوى والإبداع', 'مخصصات أساسية', 'مخصصات أعلى', 'مخصصات إبداعية أعلى']),
          P(['Lead tracking', 'Included', 'Included', 'Included'], ['تتبع العملاء المحتملين', 'مشمول', 'مشمول', 'مشمول']),
          P(['Qualification criteria', 'Agreed criteria', 'Agreed criteria', 'Agreed criteria and more complex workflows'], ['معايير التأهيل', 'معايير متفق عليها', 'معايير متفق عليها', 'معايير متفق عليها ومسارات أكثر تعقيداً']),
          P(['Lead routing and status tracking', 'Not included', 'Included', 'More complex workflows'], ['توجيه العملاء وتتبع الحالات', 'غير مشمول', 'مشمول', 'مسارات أكثر تعقيداً']),
          P(['Follow-up monitoring', 'Reminders and monitoring', 'Monitoring', 'Monitoring with escalation support'], ['مراقبة المتابعة', 'تذكيرات ومراقبة', 'مراقبة', 'مراقبة مع دعم التصعيد']),
          P(['Reporting', 'Monthly', 'Regular, with recommendations', 'Additional reporting and review'], ['التقارير', 'شهرية', 'دورية مع توصيات', 'تقارير ومراجعات إضافية']),
          P(['Performance review', 'Not included', 'Scheduled review', 'Additional review'], ['مراجعة الأداء', 'غير مشمولة', 'مراجعة مجدولة', 'مراجعة إضافية']),
          P(['Support', 'Defined allowance', 'Defined allowance', 'Defined support and escalation'], ['الدعم', 'مخصصات محددة', 'مخصصات محددة', 'دعم وتصعيد محددان']),
          P(['Optional workflow enhancements', 'Available on request', 'Available on request', 'Approved enhancements available'], ['تحسينات اختيارية لمسار العمل', 'متاحة عند الطلب', 'متاحة عند الطلب', 'تحسينات معتمدة متاحة']),
        ],
        note: P('"Not included" means not part of the standard package; it may be scoped separately. Nothing here indicates unlimited campaigns, creatives or support.', '"غير مشمول" يعني أنه ليس جزءاً من الباقة القياسية، ويمكن تحديد نطاقه بشكل منفصل. لا يعني ذلك عدداً غير محدود من الحملات أو التصاميم أو الدعم.'),
      },
      {
        type: 'accordion',
        id: 'pricing-questions',
        title: P('Pricing questions', 'أسئلة حول الأسعار'),
        items: [
          { q: P('Is advertising spend included in these prices?', 'هل الإنفاق الإعلاني مشمول في هذه الأسعار؟'), a: P('No. Advertising spend is paid directly to advertising platforms and is not included in any package.', 'لا. يُدفع الإنفاق الإعلاني مباشرةً للمنصات الإعلانية ولا يشمله أي باقة.') },
          { q: P('Are there setup fees?', 'هل توجد رسوم إعداد؟'), a: P('Not at launch as shown here. If setup fees are introduced for a specific scope, they will be disclosed clearly before you commit.', 'ليست هناك رسوم إعداد في هذه الأسعار المعروضة. إن فُرضت رسوم إعداد لنطاق محدد فستُوضح بجلاء قبل الالتزام.') },
          { q: P('Do you offer annual pricing?', 'هل تقدمون تسعيراً سنوياً؟'), a: P('Only if commercially approved. No annual discount is currently published.', 'فقط إذا اعتُمد تجارياً. لا يوجد حالياً أي خصم سنوي منشور.') },
          { q: P('What does "From" mean on Managed Growth Plus?', 'ماذا تعني كلمة "ابتداءً من" في باقة النمو المتقدم؟'), a: P('The starting fee applies to the baseline scope. Final pricing depends on the campaign, reporting and workflow complexity agreed in the statement of work.', 'تنطبق الرسوم الابتدائية على النطاق الأساسي. يعتمد السعر النهائي على تعقيد الحملات والتقارير ومسارات العمل المتفق عليها في بيان العمل.') },
          { q: P('Can I change packages later?', 'هل يمكنني تغيير الباقة لاحقاً؟'), a: P('Package changes are documented as scope changes and agreed in writing before they take effect.', 'تُوثّق تغييرات الباقة كتغييرات في النطاق وتُتفق كتابياً قبل سريانها.') },
        ],
      },
      {
        type: 'notice',
        tone: 'info',
        title: P('Not sure which package fits?', 'لست متأكداً من الباقة المناسبة؟'),
        text: P('Complete the scope questionnaire. We will review your answers and recommend a scope, or explain that a different arrangement may be needed. Submitting it does not start a subscription.', 'أكمل استبيان النطاق. سنراجع إجاباتك ونقترح نطاقاً، أو نوضح أن ترتيباً مختلفاً قد يكون مطلوباً. إرسال الاستبيان لا يبدأ اشتراكاً.'),
      },
      {
        type: 'cta',
        title: P('Request a proposal', 'اطلب عرضاً مناسباً لاحتياجاتك'),
        text: P('Share your business context. We confirm scope and final pricing before any subscription.', 'شاركنا سياق نشاطك التجاري. نؤكد النطاق والسعر النهائي قبل أي اشتراك.'),
        actions: [{ label: P('Start the scope questionnaire', 'ابدأ استبيان النطاق'), to: 'get-started' }, { label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation', variant: 'ghost' }],
      },
    ],
  },

  // ---------------- MEASUREMENT ----------------
  {
    slug: 'measurement',
    active: 'about',
    title: P('Results and Measurement Methodology', 'منهجية القياس والنتائج'),
    description: P('What we measure, what we do not, and why: lead definitions, metric formulas, attribution limits and the illustrative example rules.', 'ما الذي نقيسه وما الذي لا نقيسه ولماذا: تعريفات العملاء المحتملين ومعادلات المؤشرات وحدود الإسناد.'),
    sections: [
      {
        type: 'intro',
        title: P('Understand What We Measure, What We Don’t, and Why.', 'افهم ما نقيسه، وما لا نقيسه، ولماذا.'),
        lead: P('Measurement only helps when everyone uses the same definitions. This page explains how we define and calculate results, and where the evidence stops.', 'لا يفيد القياس إلا عندما يستخدم الجميع التعريفات نفسها. تشرح هذه الصفحة كيف نعرّف النتائج ونحسبها، وأين تتوقف الأدلة.'),
      },
      {
        type: 'prose',
        title: P('Principles', 'المبادئ'),
        paragraphs: P(
          [
            'Lead definitions are agreed with you before launch. Platform-reported metrics may differ from CRM or sales records, because they count different things at different times.',
            'Duplicate handling follows documented rules. Qualification depends on criteria specific to your business, not on a universal standard.',
            'Sales outcomes require appropriate data from your side. Attribution is not always complete: enquiries from untracked calls, messaging apps, offline interactions or repeat customers can be missed.',
            'External market conditions, pricing, your sales process and competitor activity all affect outcomes. A campaign report describes what happened in the data, not what would have happened otherwise.',
          ],
          [
            'تُتفق تعريفات العملاء المحتملين معك قبل الإطلاق. وقد تختلف الأرقام المعروضة من المنصات الإعلانية عن سجلات نظام إدارة العملاء أو المبيعات، لأنها تحسب أشياء مختلفة في أوقات مختلفة.',
            'تتبع معالجة المكرر قواعد موثقة. ويعتمد التأهيل على معايير خاصة بنشاطك التجاري، وليس على معيار عام واحد.',
            'تتطلب نتائج المبيعات بيانات مناسبة من جهتك. ولا يكون الإسناد كاملاً دائماً: فقد تفوتنا استفسارات من مكالمات غير متتبعة أو تطبيقات مراسلة أو تفاعلات خارج الإنترنت أو عملاء متكررون.',
            'تؤثر ظروف السوق والتسعير وعملية البيع لديك ونشاط المنافسين في النتائج. يصف تقرير الحملة ما حدث في البيانات، وليس ما كان سيحدث لو لم تحدث الحملة.',
          ]
        ),
      },
      {
        type: 'table',
        id: 'metric-definitions',
        title: P('Metric definitions', 'تعريفات المؤشرات'),
        intro: P('Each metric is defined before reporting. Formulas show how the number is calculated.', 'يُعرّف كل مؤشر قبل التقرير. وتوضح المعادلات طريقة الحساب.'),
        headers: P(['Metric', 'Definition', 'Formula / rule'], ['المؤشر', 'التعريف', 'المعادلة / القاعدة']),
        rows: [
          P(['Enquiry', 'Any contact received through an agreed source.', 'Count of unique records per agreed source.'], ['استفسار', 'أي تواصل يصل عبر مصدر متفق عليه.', 'عدد السجلات الفريدة لكل مصدر متفق عليه.']),
          P(['Valid lead', 'An enquiry that passes basic validity checks (for example: real contact details, not spam, not a duplicate).', 'Valid leads ÷ enquiries, shown as a share.'], ['عميل محتمل صالح', 'استفسار يجتاز فحوصات الصلاحية الأساسية (مثلاً: بيانات تواصل حقيقية، ليس بريداً مزعجاً، ليس مكرراً).', 'العملاء الصالحون ÷ الاستفسارات، معروضة كنسبة.']),
          P(['Qualified lead', 'A valid lead that meets the criteria agreed for your business.', 'Qualified leads = count of records with status "Qualified" under the agreed rules.'], ['عميل محتمل مؤهل', 'عميل صالح يستوفي المعايير المتفق عليها لنشاطك التجاري.', 'العملاء المؤهلون = عدد السجلات بحالة "مؤهل" وفق القواعد المتفق عليها.']),
          P(['Cost per valid lead', 'Advertising spend divided by valid leads in the same period.', 'Advertising spend ÷ valid leads. N/A if valid leads = 0.'], ['تكلفة العميل الصالح', 'الإنفاق الإعلاني مقسوماً على العملاء الصالحين في الفترة نفسها.', 'الإنفاق الإعلاني ÷ العملاء الصالحون. تُعرض "غير متاح" إذا كان العدد صفراً.']),
          P(['Cost per qualified lead', 'Advertising spend divided by qualified leads in the same period.', 'Advertising spend ÷ qualified leads. N/A if qualified leads = 0.'], ['تكلفة العميل المؤهل', 'الإنفاق الإعلاني مقسوماً على العملاء المؤهلين في الفترة نفسها.', 'الإنفاق الإعلاني ÷ العملاء المؤهلون. تُعرض "غير متاح" إذا كان العدد صفراً.']),
          P(['Follow-up completion', 'Share of assigned follow-up tasks completed within the agreed response window.', 'Completed on time ÷ assigned tasks.'], ['اكتمال المتابعة', 'نسبة مهام المتابعة المكلفة التي أُنجزت ضمن فترة الاستجابة المتفق عليها.', 'المهام المنجزة في وقتها ÷ المهام المكلفة.']),
          P(['Appointments / quotations', 'Milestones recorded in your CRM or agreed tracking method.', 'Count of recorded milestones; not inferred.'], ['المواعيد / عروض الأسعار', 'مراحل مسجلة في نظام إدارة العملاء أو الطريقة المتفق عليها للتتبع.', 'عدد المراحل المسجلة؛ لا يُستنتج.']),
          P(['Recorded sales', 'Sales the business confirms in its records.', 'Shown only when sales data is provided. Otherwise not reported.'], ['المبيعات المسجلة', 'المبيعات التي يؤكدها النشاط التجاري في سجلاته.', 'تُعرض فقط عند توفر بيانات المبيعات. وإلا لا تُعرض.']),
          P(['Data completeness', 'Share of records with the fields needed for the metrics above.', 'Complete records ÷ total records, per field.'], ['اكتمال البيانات', 'نسبة السجلات التي تحتوي على الحقول اللازمة للمؤشرات أعلاه.', 'السجلات المكتملة ÷ إجمالي السجلات، لكل حقل.']),
        ],
      },
      {
        type: 'notice',
        tone: 'info',
        title: P('Service fees and all-in cost', 'رسوم الخدمة والتكلفة الشاملة'),
        text: P('Advertising spend and service fees are always shown separately. Where relevant, an additional "all-in acquisition cost" can be calculated by adding the service fee to advertising spend, and it will be labelled as such.', 'يُعرض الإنفاق الإعلاني ورسوم الخدمة دائماً بشكل منفصل. وعند الحاجة يمكن حساب "تكلفة اكتساب شاملة" بإضافة رسوم الخدمة إلى الإنفاق الإعلاني، وستُوسم بوضوح.'),
      },
      {
        type: 'table',
        id: 'example',
        title: P('Example calculation', 'مثال على الحساب'),
        caption: P('Illustrative example — not actual customer results.', 'مثال توضيحي — لا يمثل نتائج فعلية لعميل.'),
        intro: P('Illustrative example — not actual customer results. Fictional numbers, used only to show how the formulas work.', 'مثال توضيحي — لا يمثل نتائج فعلية لعميل. أرقام خيالية لتوضيح طريقة عمل المعادلات فقط.'),
        headers: P(['Input or result (fictional)', 'Value', 'How it is calculated'], ['المدخل أو النتيجة (خيالية)', 'القيمة', 'طريقة الحساب']),
        rows: [
          P(['Advertising spend (fictional, paid to platforms)', 'SAR 25,600', 'Input from the platform invoice'], ['الإنفاق الإعلاني (خيالي، يُدفع للمنصات)', '25,600 ر.س', 'مدخل من فاتورة المنصة']),
          P(['Enquiries (fictional)', '412', 'Unique records from tagged sources'], ['الاستفسارات (خيالية)', '412', 'سجلات فريدة من مصادر موسومة']),
          P(['Qualified leads (fictional)', '119', 'Records with "Qualified" status under agreed rules'], ['العملاء المؤهلون (خياليون)', '119', 'سجلات بحالة "مؤهل" وفق القواعد المتفق عليها']),
          P(['Cost per qualified lead (fictional)', 'SAR 215', '25,600 ÷ 119 ≈ 215'], ['تكلفة العميل المؤهل (خيالية)', '215 ر.س', '25,600 ÷ 119 ≈ 215']),
          P(['Service fee (fictional, shown separately)', 'SAR 3,000', 'Not included in cost per qualified lead'], ['رسوم الخدمة (خيالية، تُعرض منفصلة)', '3,000 ر.س', 'غير مُضمّنة في تكلفة العميل المؤهل']),
          P(['Zero-qualified-lead case', 'N/A', 'If qualified leads = 0, the division is not performed and the result is shown as N/A'], ['حالة صفر عملاء مؤهلين', 'غير متاح', 'إذا كان عدد العملاء المؤهلين صفراً لا تُجرى القسمة وتُعرض النتيجة "غير متاح"']),
        ],
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('Why results can differ', 'لماذا قد تختلف النتائج'),
        items: P(
          ['Calls, messaging apps and offline conversations are not always tracked.', 'Some enquiries come from repeat customers or referrals.', 'Platform reporting windows and CRM timestamps can differ.', 'Sales cycles can be longer than the reporting period.', 'Unknown status is recorded as "Status unknown" rather than assumed.'],
          ['المكالمات وتطبيقات المراسلة والمحادثات خارج الإنترنت ليست دائماً متتبعة.', 'بعض الاستفسارات تأتي من عملاء متكررين أو إحالات.', 'قد تختلف نوافذ التقارير في المنصات وتوقيتات نظام إدارة العملاء.', 'قد تكون دورات البيع أطول من فترة التقرير.', 'تُسجل الحالة غير المعروفة كـ"حالة غير معروفة" ولا تُفترض.']
        ),
      },
      {
        type: 'notice',
        tone: 'info',
        title: P('Case studies', 'دراسات الحالة'),
        text: P('We do not publish testimonials, case studies or campaign results at this stage. Any future case study will state the period, baseline, spend, sample size where relevant, measurement method, limitations and the customer’s written authorization.', 'لا ننشر حالياً شهادات أو دراسات حالة أو نتائج حملات. وستذكر أي دراسة حالة مستقبلية الفترة والخط الأساسي والإنفاق وحجم العينة عند الاقتضاء وطريقة القياس والقيود وموافقة العميل الكتابية.'),
      },
      {
        type: 'cta',
        title: P('Want to see how these definitions would apply to your business?', 'هل ترغب في معرفة كيف تُطبَّق هذه التعريفات على نشاطك التجاري؟'),
        text: P('We define these together during scoping, before any campaign launches.', 'نحددها معاً خلال مرحلة تحديد النطاق، قبل إطلاق أي حملة.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },

  // ---------------- ABOUT ----------------
  {
    slug: 'about',
    active: 'about',
    title: P('About Us', 'من نحن'),
    description: P('Our mission and operating principles: a more organized, measurable and accountable approach to customer acquisition, with transparency about data and account ownership.', 'مهمتنا ومبادئ تشغيلنا: نهج أكثر تنظيماً ووضوحاً ومساءلة لاكتساب العملاء، مع شفافية حول البيانات وملكية الحسابات.'),
    sections: [
      {
        type: 'intro',
        title: P('About Us', 'من نحن'),
        lead: P('We are YECH Marketing Operations, a digital marketing operations service for Saudi businesses. We combine campaign management with structured lead operations, so you can see what happens between advertising spend and commercial outcomes.', 'نحن YECH Marketing Operations، خدمة عمليات تسويق رقمي للشركات في السعودية. نجمع بين إدارة الحملات والعمليات المنظمة للعملاء المحتملين، لتعرف ما يحدث بين الإنفاق الإعلاني والنتائج التجارية.'),
      },
      {
        type: 'notice',
        tone: 'info',
        title: P('Planned: YECH Marketing OS', 'مخطط: YECH Marketing OS'),
        text: P('YECH Marketing OS is a software platform we intend to develop for lead tracking and follow-up. It is not available today. No pricing, features or launch date have been confirmed.', 'YECH Marketing OS منصة برمجية نعتزم تطويرها لتتبع العملاء المحتملين والمتابعة. وهي غير متاحة حالياً، ولم يتم تأكيد أي أسعار أو ميزات أو موعد إطلاق.'),
      },
      {
        type: 'cards',
        columns: 3,
        title: P('Our mission', 'مهمتنا'),
        items: [
          { icon: 'target', title: P('Mission', 'المهمة'), text: P('To help businesses build a more organized, measurable and accountable customer-acquisition process.', 'مساعدة الشركات على بناء عملية أكثر تنظيماً ووضوحاً وقابلية للقياس والمساءلة لاكتساب العملاء.') },
          { icon: 'layers', title: P('Our approach', 'نهجنا'), text: P('Agree definitions first, run approved campaigns, record what happens to each enquiry, and report only what the data supports.', 'نتفق على التعريفات أولاً، ثم ندير الحملات المعتمدة، ونسجل ما يحدث لكل استفسار، ونعرض ما تدعمه البيانات فقط.') },
          { icon: 'users', title: P('People and technology', 'الأشخاص والتقنية'), text: P('Marketing specialists make the judgments. Structured software keeps records, reminders and reports consistent.', 'يتخذ المتخصصون في التسويق القرارات. وتحافظ البرمجيات المنظمة على السجلات والتذكيرات والتقارير متسقة.') },
        ],
      },
      {
        type: 'prose',
        title: P('How we combine people and technology', 'كيف نجمع بين الأشخاص والتقنية'),
        paragraphs: P(
          ['Campaign strategy, creative judgement and qualification decisions stay with people who understand your market. Software handles the repeatable parts: organizing enquiries, applying your rules, sending reminders and assembling reports.', 'We do not replace your sales team. Follow-up coordination helps your team see what is due and who owns it; direct sales conversations are your responsibility unless separately contracted.'],
          ['تبقى استراتيجية الحملات والحكم الإبداعي وقرارات التأهيل مع أشخاص يفهمون سوقك. أما البرمجيات فتتولى الأجزاء المتكررة: تنظيم الاستفسارات، وتطبيق قواعدك، وإرسال التذكيرات، وإعداد التقارير.', 'لا نحل محل فريق المبيعات لديك. ويساعد تنسيق المتابعة فريقك على رؤية المهام المستحقة ومسؤوليها؛ أما المحادثات البيعية المباشرة فهي مسؤوليتكم ما لم تُتعاقد عليها منفصلة.']
        ),
      },
      {
        type: 'cards',
        columns: 3,
        title: P('Operating principles', 'مبادئ التشغيل'),
        items: [
          { title: P('Clear before launch', 'وضوح قبل الإطلاق'), text: P('Definitions, budgets and approvals are written down before campaigns start.', 'تُكتب التعريفات والميزانيات والاعتمادات قبل بدء الحملات.') },
          { title: P('Evidence over claims', 'الدليل قبل الادعاء'), text: P('We do not promise sales volumes or guaranteed returns. We report measurable outcomes and their limits.', 'لا نعد بعدد مبيعات أو عائد مضمون. نعرض النتائج القابلة للقياس وحدودها.') },
          { title: P('Accountability', 'المساءلة'), text: P('Every change is logged, every lead has a status, and unknown statuses are recorded as unknown.', 'تُسجل كل تغييرات، ولكل عميل حالة، وتُسجل الحالات غير المعروفة كذلك.') },
        ],
      },
      {
        type: 'prose',
        title: P('Transparency, data and account ownership', 'الشفافية والبيانات وملكية الحسابات'),
        paragraphs: P(
          ['You pay advertising platforms directly and receive a separate service fee. We aim to keep ownership and control of your advertising accounts with you, while granting the access required for the agreed work.', 'Your lead data is processed to deliver the agreed service. We collect only what is required, explain how it is processed in our Data Processing Information, and support deletion or export requests as described there.'],
          ['تدفع للمنصات الإعلانية مباشرةً وتتلقى رسوم خدمة منفصلة. نهدف إلى أن تبقى ملكية حساباتك الإعلانية وتحكمها بيدك، مع منحنا الصلاحيات اللازمة للعمل المتفق عليه.', 'تُعالج بيانات عملائك المحتملين لتقديم الخدمة المتفق عليها. نجمع فقط ما هو لازم، ونشرح طريقة معالجتها في معلومات معالجة البيانات، ونلتزم بطلبات الحذف أو التصدير كما هو موضح هناك.']
        ),
      },
      {
        type: 'cards',
        columns: 2,
        title: P('Who we work best with', 'مع من نعمل بأفضل شكل'),
        intro: P('Businesses that already receive enquiries and want more structure. This is a guide, not a guarantee of fit.', 'شركات تستقبل استفسارات بالفعل وترغب في مزيد من التنظيم. هذا توجيه لا ضمان للملاءمة.'),
        items: [
          { title: P('Owners and marketing managers', 'أصحاب الأعمال ومديرو التسويق'), text: P('Who want a clear view of what their advertising produces, and who owns the next step.', 'يريدون رؤية واضحة لما تنتجه إعلاناتهم، ومن يتولى الخطوة التالية.') },
          { title: P('Sales and commercial leaders', 'قادة المبيعات والتجارة'), text: P('Who want enquiries to be qualified against agreed criteria before they reach the sales team.', 'يريدون تأهيل الاستفسارات وفق معايير متفق عليها قبل وصولها لفريق المبيعات.') },
        ],
      },
      {
        type: 'notice',
        tone: 'info',
        title: P('About this page', 'عن هذه الصفحة'),
        text: P('Founding date, team, office location, certifications and client portfolio are not published yet. They will be added only once verified by the business.', 'لم تُنشر بعد تاريخ التأسيس والفريق وموقع المكتب والشهادات ومحفظة العملاء. ستُضاف فقط بعد التحقق منها من قبل النشاط التجاري.'),
      },
      {
        type: 'cta',
        title: P('Talk to us about your acquisition process', 'تحدث معنا عن عملية اكتساب العملاء لديك'),
        text: P('A short consultation is the best way to see whether we are a suitable fit.', 'الاستشارة القصيرة أفضل طريقة لمعرفة مدى ملاءمتنا لك.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }, { label: P('Contact Us', 'تواصل معنا'), to: 'contact', variant: 'ghost' }],
      },
    ],
  },

  // ---------------- RESOURCES ----------------
  {
    slug: 'resources',
    active: 'resources',
    title: P('Resources and Insights', 'الموارد والمقالات'),
    description: P('Educational guides on lead generation, qualification, follow-up and marketing measurement. Editorial topics in preparation; not yet published.', 'أدلة تعليمية حول توليد العملاء المحتملين وتأهيلهم والمتابعة وقياس التسويق. مواضيع تحريرية قيد الإعداد ولم تُنشر بعد.'),
    sections: [
      {
        type: 'intro',
        title: P('Resources and Insights', 'الموارد والمقالات'),
        lead: P('Practical guides on campaigns, enquiries and measurement. These are proposed editorial topics. Articles are published only after editorial and expert review.', 'أدلة عملية حول الحملات والاستفسارات والقياس. هذه مواضيع تحريرية مقترحة. لا تُنشر المقالات إلا بعد المراجعة التحريرية والمهنية.'),
      },
      {
        type: 'articles',
        id: 'article-list',
        title: P('Editorial topics', 'المواضيع التحريرية'),
        intro: P('Search by keyword or filter by category. Titles below are proposed topics, not existing published articles.', 'ابحث بكلمة مفتاحية أو صفِّ حسب التصنيف. العناوين أدناه مواضيع مقترحة، وليست مقالات منشورة.'),
        categories: P(['Lead Generation', 'Campaign Management', 'Lead Qualification', 'Follow-Up Operations', 'Marketing Measurement', 'Saudi Business Marketing', 'Data and Privacy', 'Industry Guides'], ['توليد العملاء المحتملين', 'إدارة الحملات', 'تأهيل العملاء المحتملين', 'عمليات المتابعة', 'قياس التسويق', 'التسويق للأعمال في السعودية', 'البيانات والخصوصية', 'أدلة القطاعات']),
        items: [
          { title: P('How to Define a Qualified Lead for Your Business', 'كيف تحدد العميل المحتمل المؤهل لنشاطك التجاري'), category: P('Lead Qualification', 'تأهيل العملاء المحتملين'), summary: P('A framework for writing criteria that sales and marketing can both apply.', 'إطار لكتابة معايير يمكن للمبيعات والتسويق تطبيقها معاً.') },
          { title: P('Cost per Lead vs Cost per Qualified Lead', 'تكلفة العميل مقابل تكلفة العميل المؤهل'), category: P('Marketing Measurement', 'قياس التسويق'), summary: P('Why the two metrics answer different questions, and when each is useful.', 'لماذا تجيب المؤشرات عن أسئلة مختلفة، ومتى يكون كل منها مفيداً.') },
          { title: P('Why Advertising Clicks Do Not Equal Sales', 'لماذا لا تعني النقرات الإعلانية مبيعات'), category: P('Marketing Measurement', 'قياس التسويق'), summary: P('Reading the funnel from impression to commercial milestone.', 'قراءة مسار التحويل من الظهور حتى المرحلة التجارية.') },
          { title: P('How to Organize Enquiries From Multiple Channels', 'كيف تنظم الاستفسارات القادمة من قنوات متعددة'), category: P('Lead Generation', 'توليد العملاء المحتملين'), summary: P('Source tagging, ownership and duplicate rules.', 'وسم المصادر والمسؤولية وقواعد المكرر.') },
          { title: P('A Practical Follow-Up Framework for Sales Teams', 'إطار عملي للمتابعة لفرق المبيعات'), category: P('Follow-Up Operations', 'عمليات المتابعة'), summary: P('Response windows, reminders and escalation.', 'فترات الاستجابة والتذكيرات والتصعيد.') },
          { title: P('What to Prepare Before Hiring a Marketing Operations Provider', 'ما الذي تُعده قبل التعاقد مع مزود عمليات تسويق'), category: P('Saudi Business Marketing', 'التسويق للأعمال في السعودية'), summary: P('A checklist for scoping, approvals and data access.', 'قائمة مراجعة للنطاق والاعتمادات والوصول للبيانات.') },
          { title: P('How to Separate Advertising Spend From Agency Fees', 'كيف تفصل الإنفاق الإعلاني عن رسوم الوكالة'), category: P('Campaign Management', 'إدارة الحملات'), summary: P('Presenting both costs clearly in budgets and reports.', 'عرض التكلفتين بوضوح في الميزانيات والتقارير.') },
          { title: P('How to Assess Lead Quality Without Guesswork', 'كيف تقيّم جودة العملاء المحتملين دون تخمين'), category: P('Lead Qualification', 'تأهيل العملاء المحتملين'), summary: P('Using agreed rules, sample reviews and status codes.', 'استخدام قواعد متفق عليها ومراجعات العينات ورموز الحالة.') },
          { title: P('Building a Better Lead Pipeline for Real Estate Businesses', 'بناء مسار أفضل للعملاء المحتملين لشركات العقار'), category: P('Industry Guides', 'أدلة القطاعات'), summary: P('Stages from enquiry to viewing, adapted to property enquiries.', 'مراحل من الاستفسار حتى المعاينة، مكيفة لاستفسارات العقار.') },
          { title: P('Marketing Measurement When Customers Contact You Offline', 'قياس التسويق عندما يتواصل العملاء معك خارج الإنترنت'), category: P('Marketing Measurement', 'قياس التسويق'), summary: P('Handling calls, walk-ins and referrals in your data.', 'التعامل مع المكالمات والزيارات المباشرة والإحالات في بياناتك.') },
        ],
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('Editorial status', 'الحالة التحريرية'),
        text: P('No article is published yet. Each article will include verified author details, publication and update dates, sources for factual claims, a reading time and an Arabic version reviewed for meaning.', 'لم تُنشر أي مقالة بعد. ستتضمن كل مقالة بيانات مؤلف موثقة وتواريخ النشر والتحديث ومصادر للادعاءات الواقعية ومدة قراءة ونسخة عربية مراجعة للمعنى.'),
      },
    ],
  },

  // ---------------- FAQ ----------------
  {
    slug: 'faq',
    active: '',
    title: P('Frequently Asked Questions', 'الأسئلة الشائعة'),
    description: P('Answers on advertising spend, guarantees, ad account ownership, qualified leads, integrations, onboarding, contracts, cancellation, data and reporting.', 'إجابات حول الإنفاق الإعلاني والضمانات وملكية الحسابات الإعلانية والعملاء المؤهلين والتكاملات والإعداد والعقود والإلغاء والبيانات والتقارير.'),
    sections: [
      {
        type: 'intro',
        title: P('Frequently Asked Questions', 'الأسئلة الشائعة'),
        lead: P('Answers to the questions we hear most. If yours is not here, contact us.', 'إجابات على الأسئلة التي نسمعها أكثر من غيرها. إذا لم يكن سؤالك هنا، تواصل معنا.'),
      },
      {
        type: 'faq',
        title: P('Browse questions', 'تصفح الأسئلة'),
        items: [
          { category: P('Advertising', 'الإعلانات'), q: P('Is advertising spend included?', 'هل الإنفاق الإعلاني مشمول؟'), a: P('No. Advertising spend is paid directly by you to the relevant advertising platforms. Our service fee is charged separately, and any additional expenses are disclosed in advance.', 'لا. تدفع الإنفاق الإعلاني مباشرةً إلى المنصات المعنية، وتُحاسب على رسوم الخدمة بشكل منفصل. ونوضح أي مصروفات إضافية قبل اعتمادها.') },
          { category: P('Advertising', 'الإعلانات'), q: P('Who owns the advertising accounts?', 'من يمتلك الحسابات الإعلانية؟'), a: P('Our preferred arrangement is for you to own and control your advertising accounts while granting us the access required to perform the agreed work.', 'نفضّل أن تحتفظ بملكية حساباتك الإعلانية والتحكم فيها، مع منحنا الصلاحيات اللازمة لتنفيذ الأعمال المتفق عليها.') },
          { category: P('Advertising', 'الإعلانات'), q: P('Who approves budget changes?', 'من يعتمد تغييرات الميزانية؟'), a: P('You do. Budget limits and material campaign changes are approved by you in writing according to the process in your statement of work.', 'أنت. تُعتمد حدود الميزانية والتغييرات الجوهرية في الحملات كتابياً من جهتك وفق الإجراء المحدد في بيان العمل.') },
          { category: P('Services', 'الخدمات'), q: P('Do you guarantee sales?', 'هل تضمنون المبيعات؟'), a: P('No. We manage the agreed marketing and lead operations process and report measurable outcomes. Sales depend on factors including your offer, pricing, sales team, market conditions and customer decisions.', 'لا نضمن عدداً محدداً من المبيعات. ندير العمليات التسويقية وإدارة العملاء المتفق عليها ونقيس النتائج المتاحة، بينما تتأثر المبيعات بعوامل متعددة، منها العرض والأسعار وفريق المبيعات وظروف السوق وقرارات العملاء.') },
          { category: P('Lead Quality', 'جودة العملاء'), q: P('What is a qualified lead?', 'ما هو العميل المحتمل المؤهل؟'), a: P('A qualified lead is an enquiry that meets the criteria agreed with your business before the campaign starts. The criteria depend on your industry and commercial objectives.', 'العميل المحتمل المؤهل هو استفسار يستوفي المعايير التي نتفق عليها مع نشاطك التجاري قبل بدء الحملة. وتختلف هذه المعايير حسب القطاع والأهداف التجارية.'), links: [{ to: 'measurement', label: P('Read the measurement methodology', 'اقرأ منهجية القياس') }] },
          { category: P('Lead Quality', 'جودة العملاء'), q: P('What happens to an enquiry that does not meet the criteria?', 'ماذا يحدث للاستفسار الذي لا يستوفي المعايير؟'), a: P('It is recorded with a status and a reason code, such as "Not qualified" or "Status unknown". Disputes about a status are reviewed against the agreed rules.', 'يُسجل بحالة ورمز سبب، مثل "غير مؤهل" أو "حالة غير معروفة". تُراجع الاعتراضات على الحالة وفق القواعد المتفق عليها.') },
          { category: P('Reporting', 'التقارير'), q: P('How often will I receive reports?', 'كم مرة سأتلقى التقارير؟'), a: P('Reporting frequency depends on your package. Essential includes monthly reporting. Higher packages include regular reporting and scheduled reviews as stated in the package scope.', 'يعتمد تكرار التقارير على الباقة. تشمل الباقة الأساسية تقريراً شهرياً. وتشمل الباقات الأعلى تقارير دورية ومراجعات مجدولة كما هو محدد في نطاق الباقة.') },
          { category: P('Reporting', 'التقارير'), q: P('Why does the sales number not match my CRM?', 'لماذا لا يطابق رقم المبيعات نظام إدارة العملاء لدي؟'), a: P('Platform data, CRM records and sales records measure different events at different times. We explain the differences in each report and do not report sales unless sales data is provided.', 'تقيس بيانات المنصات وسجلات نظام إدارة العملاء وسجلات المبيعات أحداثاً مختلفة في أوقات مختلفة. نشرح الفروقات في كل تقرير، ولا نعرض أرقام المبيعات ما لم تُقدَّم بياناتها.') },
          { category: P('Onboarding', 'الإعداد'), q: P('Can you work with our existing systems?', 'هل يمكنكم العمل مع أنظمتنا الحالية؟'), a: P('We assess your current tools during onboarding. Integration depends on technical compatibility, available permissions, platform support and the agreed scope. Where a direct integration is unavailable, an approved alternative may be used.', 'نراجع أدواتك الحالية أثناء بدء التعاون. ويعتمد الربط على التوافق التقني والصلاحيات المتاحة ودعم المنصات ونطاق العمل المتفق عليه. وإذا تعذر الربط المباشر، فقد نستخدم بديلاً مناسباً بعد اعتماده.') },
          { category: P('Onboarding', 'الإعداد'), q: P('How long does onboarding take?', 'كم تستغرق مرحلة الإعداد؟'), a: P('It depends on approvals, access to accounts, the availability of historic data and any platform review. We do not promise a fixed timeline before scope is confirmed.', 'يعتمد ذلك على الاعتمادات والوصول للحسابات وتوفر البيانات التاريخية وأي مراجعة من المنصات. لا نعد بجدول زمني ثابت قبل تأكيد النطاق.') },
          { category: P('Onboarding', 'الإعداد'), q: P('What do you need from me?', 'ماذا تحتاجون مني؟'), a: P('A decision-maker, your offer and approved claims, your budget approach, access granted through platform permissions, and your qualification criteria. The full list is on the How It Works page.', 'صانع قرار، وعرضك والادعاءات المعتمدة، وطريقة ميزانيتك، والصلاحيات الممنوحة عبر آليات المنصات، ومعايير التأهيل لديك. القائمة الكاملة في صفحة آلية العمل.'), links: [{ to: 'how-it-works', label: P('See how it works', 'اطلع على آلية العمل') }] },
          { category: P('Services', 'الخدمات'), q: P('Do you make sales calls for us?', 'هل تجرون المكالمات البيعية نيابةً عنا؟'), a: P('Not in the base service. Follow-up coordination monitors and organizes the work. Call-centre and direct sales conversations are excluded unless expressly contracted.', 'ليس ضمن الخدمة الأساسية. يراقب تنسيق المتابعة العمل وينظمه. مراكز الاتصال والمحادثات البيعية المباشرة مستثناة ما لم تُتعاقد عليها صراحةً.') },
          { category: P('Services', 'الخدمات'), q: P('Do you collect advertising account passwords?', 'هل تطلبون كلمات مرور الحسابات الإعلانية؟'), a: P('No. Access is granted through the platform’s authorization mechanisms. We do not ask for passwords through forms or chat.', 'لا. يُمنح الوصول عبر آليات التفويض الخاصة بالمنصة. لا نطلب كلمات المرور عبر النماذج أو المحادثات.') },
          { category: P('Contracts', 'العقود'), q: P('Is there a contract?', 'هل توجد اتفاقية؟'), a: P('Yes. Scope, fees, responsibilities and approvals are set out in a statement of work and the service agreement. This website is not the contract. The Service Agreement Overview describes the main terms in plain language, subject to legal review.', 'نعم. يحدد النطاق والرسوم والمسؤوليات والاعتمادات في بيان عمل واتفاقية الخدمة. هذا الموقع ليس العقد. تصف نظرة عامة على اتفاقية الخدمة الشروط الرئيسية بلغة مبسطة، وتخضع للمراجعة القانونية.'), links: [{ to: 'service-agreement', label: P('Service Agreement Overview', 'ملخص اتفاقية الخدمة') }] },
          { category: P('Contracts', 'العقود'), q: P('How do I cancel?', 'كيف ألغي الخدمة؟'), a: P('Cancellation terms, notice periods and the handover of accounts and data are defined in your service agreement. Those terms are pending legal review and will be published once approved.', 'تُحدد شروط الإلغاء ومدد الإشعار وتسليم الحسابات والبيانات في اتفاقية الخدمة. هذه الشروط بانتظار المراجعة القانونية وستُنشر بعد اعتمادها.') },
          { category: P('Data and Privacy', 'البيانات والخصوصية'), q: P('How is lead data handled and how long is it kept?', 'كيف تُعالج بيانات العملاء المحتملين وكم تُحفظ؟'), a: P('Lead data is processed to deliver the agreed service, with access limited to authorized staff. Retention periods and deletion procedures are described in Data Processing Information and will be finalized after legal review.', 'تُعالج بيانات العملاء المحتملين لتقديم الخدمة المتفق عليها، مع قصر الوصول على الموظفين المصرح لهم. وتوضح معلومات معالجة البيانات فترات الحفظ وإجراءات الحذف، وستُعتمد بعد المراجعة القانونية.'), links: [{ to: 'data-processing', label: P('Data Processing Information', 'معلومات معالجة البيانات') }, { to: 'privacy', label: P('Privacy Policy', 'سياسة الخصوصية') }] },
          { category: P('Language', 'اللغة'), q: P('Can I work in Arabic?', 'هل يمكنني العمل بالعربية؟'), a: P('Yes. The website is available in Arabic and English. Preferred communication language is captured in the enquiry form. Service reports and written agreements will follow the language agreed for each engagement.', 'نعم. الموقع متاح بالعربية والإنجليزية. تُسجل لغة التواصل المفضلة في نموذج الاستفسار. وستتبع التقارير والاتفاقيات المكتوبة اللغة المتفق عليها لكل تعاقد.') },
        ],
        cta: { title: P('Still have a question?', 'ما زال لديك سؤال؟'), text: P('Send us your question or book a short consultation.', 'أرسل سؤالك أو احجز استشارة قصيرة.'), actions: [{ label: P('Contact Us', 'تواصل معنا'), to: 'contact', variant: 'ghost' }, { label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }] },
      },
    ],
  },

  // ---------------- CONTACT ----------------
  {
    slug: 'contact',
    active: '',
    title: P('Contact Us', 'تواصل معنا'),
    description: P('Contact our team about your marketing and lead-management challenges. Our form asks only for the information needed to respond.', 'تواصل مع فريقنا بخصوص تحدياتك التسويقية وإدارة العملاء المحتملين. يطلب النموذج المعلومات اللازمة للرد فقط.'),
    sections: [
      {
        type: 'intro',
        title: P('Contact Us', 'تواصل معنا'),
        lead: P('Tell us about your business and the challenges you face in acquiring customers. We will review your needs to identify the right next step.', 'أخبرنا عن نشاطك التجاري والتحديات التي تواجهها في اكتساب العملاء، وسنراجع احتياجاتك لتحديد الخطوة المناسبة.'),
      },
      {
        type: 'form',
        formId: 'contact',
        title: P('Tell us about your business', 'أخبرنا عن نشاطك التجاري'),
        intro: P('Tell us about your business and the challenges you face in acquiring customers. We will review your needs to identify the right next step.', 'أخبرنا عن نشاطك التجاري والتحديات التي تواجهها في اكتساب العملاء، وسنراجع احتياجاتك لتحديد الخطوة المناسبة.'),
        bullets: P(['We never ask for advertising account passwords or payment details.', 'Submitting this form does not start a subscription.', 'Fields marked required must be completed before we can review your message.'], ['لن نطلب أبداً كلمات مرور الحسابات الإعلانية أو بيانات الدفع.', 'إرسال هذا النموذج لا يبدأ أي اشتراك.', 'الحقول المطلوبة يجب تعبئتها قبل مراجعة رسالتك.']),
        aside: P('Contact details such as email, phone and office address will be shown here once the business has confirmed them. Until then, please use this form.', 'ستظهر بيانات التواصل مثل البريد الإلكتروني والهاتف وعنوان المكتب هنا بعد أن يؤكدها النشاط التجاري. وإلى ذلك الحين، يرجى استخدام هذا النموذج.'),
      },
    ],
  },

  // ---------------- CONSULTATION ----------------
  {
    slug: 'consultation',
    active: '',
    title: P('Book a Consultation', 'احجز استشارة'),
    description: P('Request a consultation to discuss your marketing goals, enquiry sources, qualification and follow-up process. Requests are reviewed manually; booking is confirmed by our team.', 'اطلب استشارة لمناقشة أهدافك التسويقية ومصادر الاستفسارات والتأهيل وعملية المتابعة. تُراجع الطلبات يدوياً ويؤكد فريقنا الموعد.'),
    sections: [
      {
        type: 'intro',
        title: P('Book a Consultation', 'احجز استشارة'),
        lead: P('Discuss your marketing goals, your current lead-management process and your tracking and follow-up needs, so we can assess whether our service fits your business.', 'ناقش أهدافك التسويقية وآلية إدارة العملاء الحالية واحتياجاتك في التتبع والمتابعة، لنقيّم مدى ملاءمة خدماتنا لنشاطك التجاري.'),
      },
      {
        type: 'cards',
        columns: 2,
        title: P('What we will discuss', 'ما الذي سنناقشه'),
        intro: P('A suggested agenda for a 30-minute discussion. The length and format may vary.', 'جدول مقترح لنقاش مدته 30 دقيقة تقريباً. قد تختلف المدة والشكل.'),
        items: [
          { icon: 'target', title: P('1. Your business and acquisition goals', '1. نشاطك التجاري وأهداف اكتساب العملاء'), text: P('What you sell, to whom, and what a good enquiry looks like.', 'ماذا تبيع ولمن، وكيف يبدو الاستفسار الجيد.') },
          { icon: 'chat', title: P('2. Current campaigns and enquiry sources', '2. الحملات الحالية ومصادر الاستفسارات'), text: P('Where enquiries come from today, and what gets lost.', 'من أين تأتي الاستفسارات اليوم، وما الذي يضيع منها.') },
          { icon: 'check', title: P('3. Lead qualification and follow-up process', '3. التأهيل وعملية المتابعة'), text: P('How enquiries are judged and who responds, and how fast.', 'كيف تُقيَّم الاستفسارات ومن يرد عليها وبأي سرعة.') },
          { icon: 'layers', title: P('4. Reporting and integration needs', '4. احتياجات التقارير والربط'), text: P('Which tools you use and which numbers you need to see.', 'الأدوات التي تستخدمها والأرقام التي تحتاج إلى رؤيتها.') },
          { icon: 'flag', title: P('5. Potential scope and next steps', '5. النطاق المحتمل والخطوات التالية'), text: P('Whether a package fits, or whether a different arrangement is better.', 'هل تناسبك باقة، أم أن ترتيباً آخر أفضل.') },
        ],
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('Booking status', 'حالة الحجز'),
        text: P('An online calendar is not yet connected. Submitting this form sends a request only. We will confirm a date and time by email or phone; until we do, your consultation is not booked.', 'لم يُربط تقويم إلكتروني بعد. إرسال هذا النموذج يرسل طلباً فقط. سنؤكد التاريخ والوقت بالبريد الإلكتروني أو الهاتف؛ وحتى ذلك الحين لا تكون استشارتك محجوزة.'),
      },
      {
        type: 'cards',
        columns: 2,
        title: P('Who this is for', 'لمن هذه الاستشارة'),
        items: [
          { title: P('Suitable', 'مناسبة'), text: P('Businesses already receiving enquiries or running advertising, who want clearer process and reporting.', 'نشاطات تستقبل استفسارات أو تعلن بالفعل، وتريد عملية وتقارير أوضح.'), bullets: P(['Enquiries come through forms, phone, messaging or social channels', 'Someone can make decisions about scope and budget'], ['تصل الاستفسارات عبر النماذج أو الهاتف أو المراسلة أو التواصل الاجتماعي', 'يوجد من يتخذ قرارات النطاق والميزانية']) },
          { title: P('Less suitable right now', 'قد لا تكون مناسبة الآن'), text: P('We may not be the right fit if you need a single action, such as a one-off ad setup, or a business that cannot share lead data.', 'قد لا نكون الخيار المناسب إن احتجت إلى إجراء واحد مثل إعداد إعلان لمرة واحدة، أو كان نشاطك لا يستطيع مشاركة بيانات العملاء المحتملين.') },
        ],
      },
      { type: 'form', formId: 'consultation', title: P('Request a consultation', 'اطلب استشارة'), intro: P('Requests are reviewed by our team. We will contact you using the method you choose.', 'تُراجع طلباتك من قبل فريقنا. سنتواصل معك بالطريقة التي تختارها.') },
    ],
  },

  // ---------------- GET STARTED ----------------
  {
    slug: 'get-started',
    active: '',
    title: P('Get Started', 'ابدأ الآن'),
    description: P('Start the scope questionnaire for our service: business information, goals, current setup and service requirements. Submitting does not activate a subscription.', 'ابدأ استبيان النطاق لخدمتنا: معلومات النشاط والأهداف والإعداد الحالي ومتطلبات الخدمة. الإرسال لا يُفعّل أي اشتراك.'),
    sections: [
      {
        type: 'intro',
        title: P('Start your scope questionnaire', 'ابدأ استبيان النطاق'),
        lead: P('Five short steps. Your answers help us prepare a proposed scope. We will review the details and confirm the final scope and pricing before any subscription.', 'خمس خطوات قصيرة. تساعدنا إجاباتك على إعداد نطاق مقترح. سنراجع التفاصيل ونؤكد النطاق والأسعار النهائية قبل أي اشتراك.'),
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('What happens after you submit', 'ماذا يحدث بعد الإرسال؟'),
        items: P(['Your enquiry is recorded and a reference number is issued.', 'Our team reviews the information and contacts you to clarify the next steps.', 'No service is activated and no payment is taken at this stage.', 'Subscription status is only shown once payment and onboarding steps are complete.'], ['تُسجل استفساراتك ويصدر رقم مرجعي.', 'يراجع فريقنا المعلومات ويتواصل معك لتوضيح الخطوات التالية.', 'لا تُفعَّل أي خدمة ولا يُحصّل أي دفع في هذه المرحلة.', 'لا تظهر حالة الاشتراك إلا بعد اكتمال الدفع وخطوات الإعداد.']),
      },
      {
        type: 'form',
        formId: 'get-started',
        title: P('Scope questionnaire', 'استبيان النطاق'),
        intro: P('Please answer as fully as you can. You can go back to change any answer before submitting.', 'يرجى الإجابة بأكبر قدر من التفصيل. يمكنك الرجوع لتعديل أي إجابة قبل الإرسال.'),
        bullets: P(['Do not include advertising account passwords.', 'Advertising spend is paid directly to platforms and is not part of the service fee.'], ['لا تُدرج كلمات مرور الحسابات الإعلانية.', 'الإنفاق الإعلاني يُدفع مباشرةً للمنصات ولا يدخل ضمن رسوم الخدمة.']),
        aside: P('Provisional prices are shown on the review step. Final scope and pricing require review and approval.', 'تُعرض الأسعار المبدئية في خطوة المراجعة. النطاق والسعر النهائيان يتطلبان المراجعة والاعتماد.'),
      },
    ],
  },

  // ---------------- SUBSCRIPTION CONFIRMATION (status explainer) ----------------
  {
    slug: 'subscription-confirmation',
    active: '',
    noindex: true,
    title: P('Subscription Status', 'حالة الاشتراك'),
    description: P('Understand the difference between an enquiry, a consultation request, a proposal, a payment and an active service.', 'افهم الفرق بين الاستفسار وطلب الاستشارة والعرض والدفع والخدمة المفعّلة.'),
    sections: [
      {
        type: 'intro',
        title: P('Where does your request stand?', 'أين وصل طلبك؟'),
        lead: P('Each stage below is a separate state. A form submission never means a subscription is active. This page is a status reference; it does not show personal order details.', 'كل مرحلة أدناه حالة مستقلة. إرسال النموذج لا يعني أبداً أن الاشتراك مفعّل. هذه الصفحة مرجع للحالات، ولا تعرض تفاصيل طلبك الشخصية.'),
      },
      {
        type: 'table',
        title: P('Status definitions', 'تعريفات الحالات'),
        headers: P(['Status', 'What it means', 'Is the service active?'], ['الحالة', 'ماذا تعني', 'هل الخدمة مفعّلة؟']),
        rows: [
          P(['Enquiry submitted', 'We have received your form. A reference number has been issued.', 'No'], ['تم إرسال الاستفسار', 'استلمنا نموذجك وصدر رقم مرجعي.', 'لا']),
          P(['Consultation requested', 'We have received a request. Booking is confirmed only after our team responds.', 'No'], ['تم طلب الاستشارة', 'استلمنا طلباً. لا يُعد الحجز مؤكداً إلا بعد رد فريقنا.', 'لا']),
          P(['Consultation booked', 'A date and time have been confirmed by our team.', 'No'], ['تم حجز الاستشارة', 'أكد فريقنا التاريخ والوقت.', 'لا']),
          P(['Proposal accepted', 'You have accepted a written proposal and statement of work.', 'No, not yet'], ['تم قبول العرض', 'قبلت عرضاً مكتوباً وبيان عمل.', 'لا بعد']),
          P(['Payment pending', 'A payment has been requested but not yet confirmed.', 'No'], ['الدفع معلق', 'طُلب الدفع ولم يُؤكد بعد.', 'لا']),
          P(['Payment confirmed', 'The payment has been confirmed by the payment process.', 'Not necessarily; onboarding must also complete'], ['تم تأكيد الدفع', 'أكدت عملية الدفع استلام المبلغ.', 'ليس بالضرورة؛ يجب إكمال الإعداد أيضاً']),
          P(['Service activated', 'Onboarding is complete and the service is live.', 'Yes'], ['تم تفعيل الخدمة', 'اكتمل الإعداد وأصبحت الخدمة قائمة.', 'نعم']),
        ],
        note: P('Payment processing is not connected in this version of the website. Payment-related statuses will be shown only once a payment provider is configured and verified.', 'لم يُربط نظام معالجة الدفع في هذه النسخة من الموقع. ولن تظهر حالات الدفع إلا بعد إعداد مزود دفع والتحقق منه.'),
      },
      {
        type: 'notice',
        tone: 'info',
        title: P('Need an update?', 'تحتاج إلى تحديث؟'),
        text: P('Use the contact form and include your reference number. We will not confirm any status by reading it from a shared link.', 'استخدم نموذج التواصل وأدرج رقم المرجع. لن نؤكد أي حالة بناءً على رابط مشترك.'),
      },
    ],
  },
];
