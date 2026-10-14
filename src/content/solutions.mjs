// Service detail pages and industry pages. All strings bilingual.
// Industry pages explain how the workflow can be adapted; they do NOT claim
// validated sector results. Example criteria are labelled as examples.

const P = (en, ar) => ({ en, ar });

const svcSchema = (name, desc) => (lang) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: typeof name === 'string' ? name : name[lang],
  description: typeof desc === 'string' ? desc : desc[lang],
  serviceType: 'Digital marketing operations',
});

const ILLUSTRATIVE_EXAMPLE = P('Illustrative example — not actual customer results.', 'مثال توضيحي — لا يمثل نتائج فعلية لعميل.');

// ---------- SERVICE PAGES ----------
export const servicePages = [
  {
    slug: 'services/campaign-management',
    active: 'services',
    crumbs: ['services'],
    title: P('Campaign Management', 'إدارة الحملات الإعلانية'),
    description: P('Campaign planning, audience and offer definition, creative coordination, budget controls, monitoring, reporting and handover. Advertising spend is paid directly to platforms.', 'تخطيط الحملات وتحديد الجمهور والعرض وتنسيق الإبداع وضوابط الميزانية والمراقبة والتقارير والتسليم. الإنفاق الإعلاني يُدفع مباشرةً للمنصات.'),
    schema: svcSchema(P('Campaign Management', 'إدارة الحملات الإعلانية'), P('Planning, setup, monitoring and reporting of approved advertising campaigns within a client-approved budget.', 'تخطيط الحملات الإعلانية المعتمدة وإعدادها ومراقبتها وإعداد تقاريرها ضمن ميزانية يوافق عليها العميل.')),
    sections: [
      {
        type: 'intro',
        title: P('Campaign Management', 'إدارة الحملات الإعلانية'),
        lead: P('We plan approved campaigns, manage them, monitor their performance within a budget you approve, record changes and review results against agreed indicators.', 'نخطط للحملات المعتمدة ونديرها ونراقب أداءها ضمن ميزانية يوافق عليها العميل، مع توثيق التغييرات ومراجعة النتائج وفق مؤشرات متفق عليها.'),
        actions: [{ label: P('Discuss a campaign plan', 'ناقش خطة حملة'), to: 'consultation' }],
      },
      {
        type: 'workflow',
        id: 'campaign-lifecycle',
        title: P('Campaign lifecycle', 'دورة حياة الحملة'),
        stages: [
          { title: P('Objectives', 'الأهداف') },
          { title: P('Audience and offer', 'الجمهور والعرض') },
          { title: P('Creative and copy', 'الإبداع والنصوص') },
          { title: P('Setup and tracking', 'الإعداد والتتبع') },
          { title: P('Budget approval', 'اعتماد الميزانية') },
          { title: P('Monitor and optimize', 'المراقبة والتحسين') },
          { title: P('Report', 'التقرير') },
          { title: P('Pause or hand over', 'الإيقاف أو التسليم') },
        ],
        caption: P('Each change to budget or material campaign settings requires your approval before it is applied.', 'يتطلب كل تغيير في الميزانية أو في إعدادات الحملة الجوهرية موافقتك قبل تطبيقه.'),
      },
      {
        type: 'cards',
        columns: 2,
        title: P('What the service covers', 'ما تغطيه الخدمة'),
        items: [
          { title: P('Objectives and planning', 'الأهداف والتخطيط'), text: P('Agreeing what a campaign should achieve, and how success will be recorded.', 'الاتفاق على ما يجب أن تحققه الحملة، وكيفية توثيق النجاح.'), bullets: P(['Objective and KPI definitions', 'Channel and timing plan', 'Measurement plan agreed before launch'], ['تحديد الأهداف ومؤشرات الأداء', 'خطة القنوات والتوقيت', 'خطة قياس متفق عليها قبل الإطلاق']) },
          { title: P('Audience and offer definition', 'تحديد الجمهور والعرض'), text: P('Turning your market knowledge into targeting and messaging that you can approve.', 'تحويل معرفتك بالسوق إلى استهداف ورسائل يمكنك اعتمادها.'), bullets: P(['Target segments and exclusions', 'Offer and claim review', 'Locations and service areas'], ['شرائح الجمهور المستهدفة والاستثناءات', 'مراجعة العرض والادعاءات', 'المواقع ومناطق الخدمة']) },
          { title: P('Creative and copy coordination', 'تنسيق الإبداع والنصوص'), text: P('Briefs, drafts, approvals and version control, including work from your team or external producers.', 'الموجزات والمسودات والاعتمادات والتحكم في الإصدارات، سواء من فريقك أو من منتجين خارجيين.'), bullets: P(['Creative briefs', 'Approval log', 'Asset version control'], ['موجزات الإبداع', 'سجل الاعتمادات', 'التحكم في إصدارات الملفات']) },
          { title: P('Campaign setup', 'إعداد الحملة'), text: P('Building campaigns, ad groups and tracking inside platforms where you have granted access.', 'بناء الحملات والمجموعات الإعلانية والتتبع داخل المنصات التي منحتنا فيها الصلاحية.'), bullets: P(['Setup checklist', 'Tracking test before launch', 'Naming conventions for source tagging'], ['قائمة فحص الإعداد', 'اختبار التتبع قبل الإطلاق', 'قواعد تسمية لوسم المصادر']) },
          { title: P('Budget controls', 'ضوابط الميزانية'), text: P('Limits you set and approve. We do not exceed them, and we ask before material changes.', 'حدود تحددها وتعتمدها. لا نتجاوزها، ونستأذن قبل التغييرات الجوهرية.'), bullets: P(['Daily and monthly budget limits set by you', 'Change approval workflow', 'Spend reported separately from fees'], ['حدود يومية وشهرية تحددها أنت', 'مسار اعتماد التغييرات', 'الإنفاق مُبلّغ عنه بشكل منفصل عن الرسوم']) },
          { title: P('Monitoring and optimization', 'المراقبة والتحسين'), text: P('Regular reviews of delivery, enquiry flow and cost indicators, with recommendations based on evidence.', 'مراجعات دورية للتوصيل وتدفق الاستفسارات ومؤشرات التكلفة، مع توصيات مبنية على الأدلة.'), bullets: P(['Scheduled reviews by package', 'Recommendations with reasoning', 'Changes logged'], ['مراجعات مجدولة حسب الباقة', 'توصيات مع أسبابها', 'تسجيل التغييرات']) },
          { title: P('Reporting', 'التقارير'), text: P('Reports that show advertising spend, enquiries and lead outcomes, with the service fee shown separately.', 'تقارير تعرض الإنفاق الإعلاني والاستفسارات ونتائج العملاء، مع عرض رسوم الخدمة بشكل منفصل.'), bullets: P(['Monthly report at minimum', 'Data completeness notes', 'Definitions appendix'], ['تقرير شهري على الأقل', 'ملاحظات اكتمال البيانات', 'ملحق التعريفات']) },
          { title: P('Pause and handover', 'الإيقاف والتسليم'), text: P('Campaigns can be paused on request. At the end of an engagement, we hand over the account, assets and documentation as set out in the agreement.', 'يمكن إيقاف الحملات عند الطلب. وعند انتهاء التعاقد نسلم الحساب والأصول والوثائق وفق الاتفاق.'), bullets: P(['Pause procedure', 'Asset and documentation handover', 'Access removal checklist'], ['إجراءات الإيقاف', 'تسليم الأصول والوثائق', 'قائمة إزالة الصلاحيات']) },
        ],
      },
      {
        type: 'table',
        id: 'cost-categories',
        title: P('Who pays for what', 'من يدفع مقابل ماذا'),
        intro: P('We distinguish four cost categories in every plan and report. None of them are interchangeable.', 'نميز أربع فئات تكلفة في كل باقة وتقرير. ولا يمكن استبدال أي منها بالأخرى.'),
        headers: P(['Cost category', 'Who pays', 'Included in service fee?', 'Example'], ['فئة التكلفة', 'من يدفع', 'مشمولة في رسوم الخدمة؟', 'مثال']),
        rows: [
          P(['Service management fee', 'You, to us', 'Not applicable (this is the fee)', 'Monthly package fee'], ['رسوم إدارة الخدمة', 'أنت، لنا', 'لا ينطبق (هذه الرسوم نفسها)', 'رسوم الباقة الشهرية']),
          P(['Advertising-platform expenditure', 'You, directly to the platform', 'No', 'Media spend on each campaign'], ['الإنفاق لدى المنصات الإعلانية', 'أنت، مباشرة للمنصة', 'لا', 'قيمة الإعلانات على كل حملة']),
          P(['Third-party production costs', 'You, to the producer', 'No, unless explicitly included', 'Photography, video, or design by an external studio'], ['تكاليف الإنتاج لأطراف ثالثة', 'أنت، للمنتج', 'لا، إلا إن ذُكرت صراحةً', 'تصوير أو فيديو أو تصميم من استوديو خارجي']),
          P(['Optional software and tracking costs', 'You, to the software provider', 'No, unless stated in scope', 'Paid CRM seats, call-tracking or form tools'], ['تكاليف البرمجيات والتتبع الاختيارية', 'أنت، لمزود البرمجيات', 'لا، إلا إن ذُكرت في النطاق', 'مقاعد نظام إدارة عملاء مدفوعة أو أدوات تتبع المكالمات والنماذج']),
        ],
      },
      {
        type: 'notice',
        tone: 'info',
        title: P('Account ownership and integrations', 'ملكية الحساب والتكاملات'),
        items: P(
          ['Our preferred arrangement: you own and control the advertising account and grant access for the agreed work.', 'Access is granted through each platform’s permission mechanisms. We do not ask for account passwords.', 'Integration badges are shown only for integrations that are implemented and authorized. None is displayed in this version.'],
          ['ترتيبنا المفضل: تملك الحساب الإعلاني وتتحكم به، وتمنحنا الصلاحيات للعمل المتفق عليه.', 'تُمنح الصلاحيات عبر آليات كل منصة. لا نطلب كلمات المرور.', 'تُعرض شارات التكامل فقط للتكاملات المنفذة والمعتمدة. لا توجد شارة معروضة في هذه النسخة.']
        ),
      },
      {
        type: 'cta',
        title: P('Plan a campaign with clear budget approvals', 'خطط لحملة بموافقات ميزانية واضحة'),
        text: P('Start with a consultation to define objectives, audience, offer and approval rules.', 'ابدأ باستشارة لتحديد الأهداف والجمهور والعرض وقواعد الاعتماد.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },

  {
    slug: 'services/lead-management',
    active: 'services',
    crumbs: ['services'],
    title: P('Lead Management and Qualification', 'إدارة العملاء المحتملين وتأهيلهم'),
    description: P('Organize enquiries, check validity, handle duplicates, apply agreed qualification criteria and route each opportunity to the right next step.', 'تنظيم الاستفسارات والتحقق من صلاحيتها ومعالجة المكرر وتطبيق معايير التأهيل المتفق عليها وتوجيه كل فرصة إلى الخطوة المناسبة.'),
    schema: svcSchema(P('Lead Management and Qualification', 'إدارة العملاء المحتملين وتأهيلهم'), P('Enquiry capture, validity checks, duplicate handling and qualification against client-agreed criteria.', 'استقبال الاستفسارات والتحقق من صلاحيتها ومعالجة المكرر والتأهيل وفق معايير يتفق عليها العميل.')),
    sections: [
      {
        type: 'intro',
        title: P('Know Which Enquiries Meet Your Business Criteria.', 'اعرف أي الاستفسارات تستوفي معايير نشاطك التجاري.'),
        lead: P('Lead management turns scattered enquiries into records with a status, an owner and a reason. Qualification uses criteria you agree in advance, so the sales team sees what matters first.', 'تحوّل إدارة العملاء المحتملين الاستفسارات المتفرقة إلى سجلات لها حالة ومسؤول وسبب. ويعتمد التأهيل على معايير تتفق عليها مسبقاً، ليرى فريق المبيعات ما يهم أولاً.'),
      },
      {
        type: 'workflow',
        id: 'lead-lifecycle',
        title: P('Lead lifecycle', 'دورة حياة العميل المحتمل'),
        stages: [
          { title: P('Enquiry received', 'استلام الاستفسار') },
          { title: P('Validity checked', 'فحص الصلاحية') },
          { title: P('Duplicate handling', 'معالجة المكرر') },
          { title: P('Qualification assessment', 'تقييم التأهيل') },
          { title: P('Assignment', 'التوجيه') },
          { title: P('Follow-up', 'المتابعة') },
          { title: P('Appointment, quotation or milestone', 'موعد أو عرض سعر أو مرحلة') },
          { title: P('Sale recorded where available', 'تسجيل البيع عند توفر البيانات') },
        ],
        caption: P('The final stage is only recorded where your sales data is provided to us. We do not infer sales from enquiries.', 'تُسجل المرحلة الأخيرة فقط حيث تُزودنا بيانات مبيعاتك. ولا نستنتج المبيعات من الاستفسارات.'),
      },
      {
        type: 'pipeline',
        title: P('Interactive pipeline mockup', 'نموذج تفاعلي لمسار العملاء'),
        intro: P('Four fictional sample records showing statuses and next actions. Names, sources and numbers are invented for illustration.', 'أربعة سجلات خيالية تعرض الحالات والخطوات التالية. الأسماء والمصادر والأرقام مختلقة للتوضيح.'),
      },
      {
        type: 'cards',
        columns: 2,
        title: P('Configurable qualification rules', 'قواعد تأهيل قابلة للتعديل'),
        intro: P('Examples only, not universal criteria. Your rules are written for your business, reviewed by you, and applied consistently.', 'أمثلة فقط، وليست معايير عامة. تُكتب قواعدك لنشاطك، وتراجعها أنت، وتُطبَّق باتساق.'),
        items: [
          { title: P('Example: real estate', 'مثال: العقارات'), text: P('Criteria fields that a property business might agree to use.', 'حقول معايير قد يتفق عليها نشاط عقاري.'), bullets: P(['Preferred location', 'Property type', 'Budget range', 'Purchase or rental intent', 'Intended timeframe'], ['الموقع المفضل', 'نوع العقار', 'نطاق الميزانية', 'نية الشراء أو الإيجار', 'الإطار الزمني المقصود']) },
          { title: P('Example: professional services', 'مثال: الخدمات المهنية'), text: P('Criteria fields that an advisory or B2B service firm might agree to use.', 'حقول معايير قد تتفق عليها شركة استشارية أو خدمات B2B.'), bullets: P(['Service required', 'Scope', 'Relevant location or jurisdiction', 'Budget fit', 'Readiness to engage'], ['الخدمة المطلوبة', 'النطاق', 'الموقع أو الاختصاص ذو الصلة', 'ملاءمة الميزانية', 'الجاهزية للتعاقد']) },
        ],
      },
      {
        type: 'table',
        title: P('Status and reason codes', 'رموز الحالة والسبب'),
        intro: P('Every record has one status and, where relevant, one reason code. "Status unknown" is a valid status.', 'لكل سجل حالة واحدة، وعند الاقتضاء رمز سبب واحد. و"حالة غير معروفة" حالة صالحة.'),
        headers: P(['Status', 'Meaning', 'Example reason code'], ['الحالة', 'المعنى', 'مثال على رمز السبب']),
        rows: [
          P(['New enquiry', 'Received, not yet reviewed', '—'], ['استفسار جديد', 'وصل ولم يُراجع بعد', '—']),
          P(['Duplicate', 'Matches an existing record under the agreed rule', 'Same contact details within the agreed window'], ['مكرر', 'يطابق سجلاً موجوداً وفق القاعدة المتفق عليها', 'بيانات التواصل نفسها ضمن الفترة المتفق عليها']),
          P(['Qualified', 'Meets the agreed criteria', 'Criteria met (list)'], ['مؤهل', 'يستوفي المعايير المتفق عليها', 'المعايير مستوفاة (القائمة)']),
          P(['Not qualified', 'Does not meet the agreed criteria', 'Outside service area; budget mismatch'], ['غير مؤهل', 'لا يستوفي المعايير المتفق عليها', 'خارج منطقة الخدمة؛ عدم توافق الميزانية']),
          P(['Status unknown', 'Not yet established; needs review', 'Contact not reached; information missing'], ['حالة غير معروفة', 'لم تُحدد بعد؛ تحتاج إلى مراجعة', 'لم يتم الوصول للعميل؛ معلومات ناقصة']),
        ],
      },
      {
        type: 'prose',
        title: P('Disputes and unknown status', 'الاعتراضات والحالة غير المعروفة'),
        paragraphs: P(
          [
            'If you disagree with a status, the record shows the reason code and the criteria used. We review the case against the agreed rules and record the outcome, including who decided and when.',
            'When information is missing or no contact could be made, we record the lead as "Status unknown" instead of assuming it is qualified or not. Unknown records are reviewed in the regular report, so they do not quietly distort the numbers.',
          ],
          [
            'إذا اعترضت على حالة ما، يُظهر السجل رمز السبب والمعايير المستخدمة. نراجع الحالة وفق القواعد المتفق عليها ونسجل النتيجة، بما في ذلك من اتخذ القرار ومتى.',
            'عندما تكون المعلومات ناقصة أو لم يُتمكن من التواصل، نسجل العميل بحالة "حالة غير معروفة" بدلاً من افتراض أنه مؤهل أو غير مؤهل. وتُراجع السجلات غير المعروفة في التقرير الدوري حتى لا تشوه الأرقام بصمت.',
          ]
        ),
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('Boundaries', 'الحدود'),
        text: P('Qualification follows the criteria you agree. We do not guarantee that any qualified lead will buy, sign or pay. Duplicate and validity rules are documented before launch, and where data is incomplete we say so.', 'يتبع التأهيل المعايير التي توافق عليها. ولا نضمن أن أي عميل مؤهل سيشتري أو يوقع أو يدفع. تُوثّق قواعد الصلاحية والمكرر قبل الإطلاق، وعندما تكون البيانات ناقصة نوضح ذلك.'),
      },
      {
        type: 'cta',
        title: P('Define your qualification criteria with us', 'حدد معايير التأهيل معنا'),
        text: P('We provide a template to write your criteria before we set anything up.', 'نوفر نموذجاً لكتابة معاييرك قبل أي إعداد.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },

  {
    slug: 'services/follow-up',
    active: 'services',
    crumbs: ['services'],
    title: P('Follow-Up Coordination', 'تنسيق متابعة العملاء المحتملين'),
    description: P('Lead assignment, reminders, response-time monitoring, overdue alerts, contact logs and consent-aware communication. Direct sales conversations are excluded unless contracted.', 'توجيه العملاء وتذكيرات المتابعة ومراقبة زمن الاستجابة وتنبيهات المهام المتأخرة وسجلات التواصل والتواصل المراعي للموافقات. المحادثات البيعية المباشرة مستثناة ما لم تُتعاقد عليها.'),
    schema: svcSchema(P('Follow-Up Coordination', 'تنسيق المتابعة'), P('Coordination and monitoring of lead follow-up tasks, reminders and response times. Direct sales calls are excluded unless contracted.', 'تنسيق ومراقبة مهام متابعة العملاء المحتملين والتذكيرات وأزمنة الاستجابة. المكالمات البيعية المباشرة مستثناة ما لم تُتعاقد عليها.')),
    sections: [
      {
        type: 'intro',
        title: P('Help Every Lead Reach the Next Step.', 'ساعد كل عميل محتمل على الوصول إلى الخطوة التالية.'),
        lead: P('We help your team respond in time, see who owns the next action, watch for overdue tasks and keep a record of every contact attempt.', 'نساعد فريقك على الرد في الوقت المناسب، ورؤية المسؤول عن الخطوة التالية، ومراقبة المهام المتأخرة، والاحتفاظ بسجل لكل محاولة تواصل.'),
      },
      {
        type: 'cards',
        columns: 3,
        title: P('What the service includes', 'ما تشمله الخدمة'),
        items: [
          { title: P('Lead assignment', 'توجيه العملاء'), text: P('Each lead is routed to a named owner under rules you approve.', 'يُوجَّه كل عميل إلى مسؤول محدد وفق قواعد تعتمدها.') },
          { title: P('Follow-up reminders', 'تذكيرات المتابعة'), text: P('Reminders for due tasks, scheduled by status and time since enquiry.', 'تذكيرات بالمهام المستحقة، مجدولة حسب الحالة والوقت منذ الاستفسار.') },
          { title: P('Response-time monitoring', 'مراقبة زمن الاستجابة'), text: P('Time from enquiry to first contact attempt, compared with the window you agreed.', 'الوقت من الاستفسار حتى أول محاولة تواصل، مقارنة بالفترة التي اتفقتم عليها.') },
          { title: P('Overdue task alerts', 'تنبيهات المهام المتأخرة'), text: P('Alerts when a task passes its due time without a logged action.', 'تنبيهات عندما تتجاوز مهمة موعدها دون إجراء مسجل.') },
          { title: P('Contact attempt logs', 'سجلات محاولات التواصل'), text: P('Date, channel and outcome of each attempt, in one place.', 'التاريخ والقناة والنتيجة لكل محاولة، في مكان واحد.') },
          { title: P('Escalation', 'التصعيد'), text: P('Unhandled enquiries are escalated to a named manager after the agreed period.', 'تُصعَّد الاستفسارات غير المعالجة إلى مدير محدد بعد الفترة المتفق عليها.') },
        ],
      },
      {
        type: 'timeline',
        demo: true,
        title: P('A fictional lead, from enquiry to appointment', 'مثال خيالي: عميل من الاستفسار حتى الموعد'),
        intro: P('An illustrative sequence. "Lead A-204" is invented. Times and outcomes are examples only.', 'تسلسل توضيحي. "العميل A-204" مختلق. الأوقات والنتائج أمثلة فقط.'),
        caption: P('Illustrative example — not actual customer results.', 'مثال توضيحي — لا يمثل نتائج فعلية لعميل.'),
        items: [
          { when: P('Day 0, 09:12', 'اليوم 0، 09:12'), title: P('Enquiry received', 'استلام الاستفسار'), text: P('Form submitted with a service question. Source tagged. Duplicate check passed.', 'أُرسل النموذج مع سؤال عن الخدمة. وُسم المصدر. اجتاز فحص المكرر.') },
          { when: P('Day 0, 09:20', 'اليوم 0، 09:20'), title: P('Assigned and qualified against criteria', 'تم التوجيه والتأهيل وفق المعايير'), text: P('Routed to the sales coordinator. Criteria check: service required, location and timeframe recorded.', 'وُجّه إلى منسق المبيعات. فحص المعايير: الخدمة المطلوبة والموقع والإطار الزمني مسجلة.'), tags: P(['Status: Qualified', 'Owner: Coordinator'], ['الحالة: مؤهل', 'المسؤول: المنسق']) },
          { when: P('Day 0, 11:00', 'اليوم 0، 11:00'), title: P('First contact attempt', 'أول محاولة تواصل'), text: P('Call not answered. Attempt logged. Reminder set for 14:00.', 'لم يُرد أحد على المكالمة. سُجلت المحاولة. ضُبط تذكير عند 14:00.') },
          { when: P('Day 0, 14:00', 'اليوم 0، 14:00'), title: P('Reminder and second attempt', 'تذكير ومحاولة ثانية'), text: P('Reminder fired. Email sent with the client’s approved template, which includes an opt-out line.', 'انطلق التذكير. أُرسل بريد بالقالب المعتمد من العميل، ويتضمن رابط إلغاء الاشتراك.'), tags: P(['Consent: marketing opt-in recorded', 'Opt-out available'], ['الموافقة: تسجيل موافقة التسويق', 'إلغاء الاشتراك متاح']) },
          { when: P('Day 1, 10:30', 'اليوم 1، 10:30'), title: P('Contact made and appointment set', 'تم التواصل وتحديد موعد'), text: P('Coordinator reached the prospect. Appointment recorded for the following week. Status updated.', 'تواصل المنسق مع العميل المحتمل. سُجل موعد للأسبوع التالي. حُدّثت الحالة.'), tags: P(['Status: Appointment set'], ['الحالة: موعد محدد']) },
        ],
      },
      {
        type: 'cards',
        columns: 2,
        title: P('Communication consent and opt-out controls', 'ضوابط الموافقة على التواصل وإلغاء الاشتراك'),
        intro: P('Consent is recorded with its source and date. Every outbound message must respect the status recorded for that contact.', 'تُسجل الموافقة مع مصدرها وتاريخها. ويجب أن تحترم كل رسالة صادرة الحالة المسجلة لتلك الجهة.'),
        items: [
          { title: P('Consent recorded per contact', 'تسجيل الموافقة لكل جهة'), text: P('Where a lead gives consent to be contacted for marketing, the source, date and wording are stored.', 'عندما يوافق العميل على التواصل التسويقي، يُحفظ المصدر والتاريخ والصياغة.') },
          { title: P('Opt-out honored', 'احترام إلغاء الاشتراك'), text: P('Opt-out requests are logged and suppress future marketing contact. Suppression is checked before each send.', 'تُسجل طلبات إلغاء الاشتراك وتمنع التواصل التسويقي المستقبلي. ويُفحص الاستثناء قبل كل إرسال.') },
          { title: P('Channel rules', 'قواعد القنوات'), text: P('Channels such as messaging apps or SMS are used only where permitted and where the contact has agreed to them.', 'تُستخدم قنوات مثل تطبيقات المراسلة أو الرسائل النصية فقط حيث تكون مسموحة وحيث وافق العميل عليها.') },
          { title: P('Your responsibility', 'مسؤوليتك'), text: P('You remain responsible for the legal basis of the data you provide and for the content of messages you approve.', 'تظل مسؤولاً عن الأساس القانوني للبيانات التي تقدمها وعن محتوى الرسائل التي تعتمدها.') },
        ],
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('What this service does not include', 'ما لا تشمله هذه الخدمة'),
        text: P('The base service coordinates and monitors follow-up. Direct sales conversations, call-centre operations and negotiation are excluded unless expressly contracted and scoped in writing.', 'تنسق الخدمة الأساسية المتابعة وتراقبها. المحادثات البيعية المباشرة وعمليات مراكز الاتصال والتفاوض مستثناة ما لم تُتعاقد عليها صراحةً وتُحدد نطاقها كتابياً.'),
      },
      {
        type: 'cta',
        title: P('See how follow-up fits your team', 'اطلع على كيفية ملاءمة المتابعة لفريقك'),
        text: P('We will map your current follow-up process in the consultation.', 'سنرسم عملية المتابعة الحالية لديك خلال الاستشارة.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },

  {
    slug: 'services/analytics',
    active: 'services',
    crumbs: ['services'],
    title: P('Analytics and Reporting', 'التحليلات وتقارير الأداء'),
    description: P('Metrics that separate advertising activity, lead quality, sales activity and commercial outcomes, with clear formulas, N/A rules and attribution limits.', 'مؤشرات تفصل النشاط الإعلاني وجودة العملاء وأنشطة المبيعات والنتائج التجارية، مع معادلات واضحة وقواعد "غير متاح" وحدود الإسناد.'),
    schema: svcSchema(P('Analytics and Reporting', 'التحليلات وتقارير الأداء'), P('Reporting on advertising spend, enquiries, lead quality, follow-up and recorded commercial outcomes.', 'تقارير عن الإنفاق الإعلاني والاستفسارات وجودة العملاء والمتابعة والنتائج التجارية المسجلة.')),
    sections: [
      {
        type: 'intro',
        title: P('Measure More Than Clicks.', 'قِس أكثر من النقرات.'),
        lead: P('We turn the data available to you into reports that show advertising spend, lead quality, follow-up and recorded commercial results, with the methodology stated.', 'نحوّل البيانات المتاحة إلى تقارير واضحة تعرض الإنفاق الإعلاني وجودة العملاء ومؤشرات المتابعة والنتائج التجارية المسجلة، مع بيان المنهجية.'),
        actions: [{ label: P('Read the measurement methodology', 'اقرأ منهجية القياس'), to: 'measurement', variant: 'ghost' }],
      },
      {
        type: 'table',
        title: P('Four different things to measure', 'أربعة أمور مختلفة يجب قياسها'),
        headers: P(['Layer', 'Question it answers', 'Example measure'], ['المستوى', 'السؤال الذي يجيب عنه', 'مثال على المقياس']),
        rows: [
          P(['Marketing activity', 'Is the campaign running and reaching people?', 'Impressions, clicks, spend'], ['النشاط التسويقي', 'هل الحملة تعمل وتصل إلى الناس؟', 'الظهور والنقرات والإنفاق']),
          P(['Lead quality', 'Are the enquiries the kind we want?', 'Valid and qualified leads'], ['جودة العملاء', 'هل الاستفسارات من النوع المطلوب؟', 'العملاء الصالحون والمؤهلون']),
          P(['Sales activity', 'Is our team acting on the leads?', 'Follow-up completion, appointments, quotations'], ['نشاط المبيعات', 'هل يتصرف الفريق بناءً على العملاء؟', 'اكتمال المتابعة والمواعيد وعروض الأسعار']),
          P(['Commercial outcomes', 'Did the business gain revenue or contracts?', 'Recorded sales, revenue where verified'], ['النتائج التجارية', 'هل حقق النشاط إيرادات أو عقوداً؟', 'المبيعات المسجلة، والإيرادات عند التحقق منها']),
        ],
      },
      {
        type: 'dashboard',
        title: P('Dashboard layout', 'تخطيط لوحة التقارير'),
        intro: P('A sample layout of metrics this service can report. All figures are illustrative demo data.', 'عينة من تخطيط المؤشرات التي يمكن أن تعرضها هذه الخدمة. جميع الأرقام بيانات توضيحية تجريبية.'),
      },
      {
        type: 'table',
        id: 'methodology',
        title: P('Metric methodology', 'منهجية المؤشرات'),
        intro: P('Each metric is defined before reporting starts. The full definitions are on the Measurement page.', 'يُعرّف كل مؤشر قبل بدء التقارير. التعريفات الكاملة في صفحة القياس.'),
        headers: P(['Metric', 'Formula or rule'], ['المؤشر', 'المعادلة أو القاعدة']),
        rows: [
          P(['Advertising expenditure', 'Sum of platform spend, from platform invoices or reports'], ['الإنفاق الإعلاني', 'مجموع إنفاق المنصات من الفواتير أو التقارير']),
          P(['Enquiries', 'Unique records from agreed sources'], ['الاستفسارات', 'سجلات فريدة من مصادر متفق عليها']),
          P(['Valid leads', 'Enquiries that pass validity rules'], ['العملاء الصالحون', 'الاستفسارات التي تجتاز قواعد الصلاحية']),
          P(['Qualified leads', 'Valid leads that meet the agreed criteria'], ['العملاء المؤهلون', 'عملاء صالحون يستوفون المعايير المتفق عليها']),
          P(['Cost per valid lead', 'Advertising expenditure ÷ valid leads (N/A if zero)'], ['تكلفة العميل الصالح', 'الإنفاق الإعلاني ÷ العملاء الصالحين (غير متاح إن كان الصفر)']),
          P(['Cost per qualified lead', 'Advertising expenditure ÷ qualified leads (N/A if zero)'], ['تكلفة العميل المؤهل', 'الإنفاق الإعلاني ÷ العملاء المؤهلين (غير متاح إن كان الصفر)']),
          P(['Follow-up completion', 'Tasks completed within the agreed window ÷ tasks assigned'], ['اكتمال المتابعة', 'المهام المنجزة ضمن الفترة المتفق عليها ÷ المهام المكلفة']),
          P(['Appointments and quotations', 'Count of milestones recorded in the agreed system'], ['المواعيد وعروض الأسعار', 'عدد المراحل المسجلة في النظام المتفق عليه']),
          P(['Recorded sales', 'Count or value supplied by you; not estimated'], ['المبيعات المسجلة', 'العدد أو القيمة التي تزودنا بها؛ لا تُقدَّر']),
          P(['Revenue, where verified', 'Only when verified against your records'], ['الإيرادات، عند التحقق منها', 'فقط عند التحقق منها مقابل سجلاتك']),
          P(['Data completeness', 'Complete records ÷ total records, per required field'], ['اكتمال البيانات', 'السجلات المكتملة ÷ إجمالي السجلات، لكل حقل مطلوب']),
        ],
      },
      {
        type: 'notice',
        tone: 'info',
        title: P('Fees, N/A, and the all-in view', 'الرسوم وقاعدة "غير متاح" والعرض الشامل'),
        items: P(
          ['Service fees are shown separately from advertising spend.', 'If an optional "all-in acquisition cost" is shown, it adds the service fee to advertising spend and is labelled as such.', 'If the number of qualified leads is zero, the cost per qualified lead is shown as N/A. The division is not performed.'],
          ['تُعرض رسوم الخدمة بشكل منفصل عن الإنفاق الإعلاني.', 'إذا عُرضت "تكلفة اكتساب شاملة" اختيارياً، فإنها تضيف رسوم الخدمة إلى الإنفاق الإعلاني وتُوسم بذلك.', 'إذا كان عدد العملاء المؤهلين صفراً، تُعرض تكلفة العميل المؤهل كـ"غير متاح". ولا تُجرى القسمة.']
        ),
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('Attribution limits', 'حدود الإسناد'),
        items: P(
          ['Enquiries from untracked calls, messaging apps or offline conversations may not be attributed to a campaign.', 'Repeat customers and referrals can appear as new enquiries, or not at all.', 'Platform attribution windows differ from CRM timestamps.', 'Reports state the limits of each figure rather than presenting a single number as complete.'],
          ['قد لا تُنسب الاستفسارات القادمة من مكالمات غير متتبعة أو تطبيقات مراسلة أو محادثات خارج الإنترنت إلى حملة.', 'قد يظهر العملاء المتكررون والإحالات كاستفسارات جديدة، أو لا يظهرون مطلقاً.', 'تختلف نوافذ الإسناد في المنصات عن توقيتات نظام إدارة العملاء.', 'توضح التقارير حدود كل رقم بدلاً من عرض رقم واحد على أنه مكتمل.']
        ),
      },
      {
        type: 'cta',
        title: P('Ask us what your reports would show', 'اسألنا عما ستعرضه تقاريرك'),
        text: P('We will review which data you have and what can be reported with confidence.', 'سنراجع البيانات المتوفرة لديك وما يمكن الإبلاغ عنه بثقة.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },
];

// ---------- INDUSTRY OVERVIEW ----------
export const industriesOverview = {
  slug: 'industries',
  active: 'industries',
  title: P('Industries', 'القطاعات'),
  description: P('How the growth workflow adapts to real estate, professional services, home and commercial services, B2B distribution, and retail and e-commerce.', 'كيف يتكيف مسار النمو مع العقارات والخدمات المهنية وخدمات المنازل والأعمال والتوزيع B2B والتجزئة والتجارة الإلكترونية.'),
  sections: [
    {
      type: 'intro',
      title: P('Adapt the Growth Workflow to Your Business.', 'حلول تسويقية تناسب طبيعة نشاطك التجاري.'),
      lead: P('The same workflow runs in every sector, but the enquiry sources, qualification criteria and milestones differ. We do not claim proven results in any sector yet; each page explains how the workflow would be adapted.', 'المسار نفسه يعمل في كل قطاع، لكن مصادر الاستفسارات ومعايير التأهيل والمراحل تختلف. لا ندّعي نتائج مثبتة في أي قطاع حتى الآن؛ وكل صفحة توضح كيف يُكيّف المسار.'),
    },
    {
      type: 'table',
      title: P('Five sectors at a glance', 'خمسة قطاعات في لمحة'),
      headers: P(['Sector', 'Typical enquiry source', 'Example qualification criteria', 'Follow-up workflow', 'Commercial milestone', 'Measurement challenge'], ['القطاع', 'مصدر الاستفسار المعتاد', 'أمثلة على معايير التأهيل', 'مسار المتابعة', 'المرحلة التجارية', 'تحدي القياس']),
      rows: [
        P(['Real Estate', 'Website forms, property portals you use, phone calls', 'Location, property type, budget, intent, timeframe', 'Contact, viewing reminder, feedback', 'Viewing completed; negotiation', 'Viewings happen offline; long decision cycles'], ['العقارات', 'نماذج الموقع، منصات العقار التي تستخدمها، المكالمات', 'الموقع ونوع العقار والميزانية والنية والإطار الزمني', 'تواصل، تذكير بالمعاينة، متابعة الملاحظات', 'اكتمال المعاينة؛ التفاوض', 'المعاينات تتم خارج الإنترنت؛ دورات قرار طويلة']),
        P(['Professional Services', 'Website forms, referrals, LinkedIn or search, events', 'Service scope, jurisdiction, budget fit, readiness', 'Qualification call, consultation, proposal follow-up', 'Consultation held; proposal accepted', 'Long sales cycles; referrals not always recorded'], ['الخدمات المهنية', 'نماذج الموقع والإحالات والبحث أو الشبكات المهنية والفعاليات', 'نطاق الخدمة والاختصاص والملاءمة المالية والجاهزية', 'مكالمة تأهيل، استشارة، متابعة العرض', 'عقد الاستشارة؛ قبول العرض', 'دورات بيع طويلة؛ الإحالات لا تُسجل دائماً']),
        P(['Home and Commercial Services', 'Search, map listings you use, phone and messaging', 'Service area, job type, urgency, quotation requirement', 'Quote follow-up, booking confirmation', 'Booking confirmed; job completed', 'Phone and messaging enquiries; seasonal demand'], ['خدمات المنازل والأعمال', 'البحث، قوائم الخرائط التي تستخدمها، الهاتف والمراسلة', 'منطقة الخدمة ونوع المهمة والاستعجال ومتطلب عرض السعر', 'متابعة عرض السعر، تأكيد الحجز', 'تأكيد الحجز؛ اكتمال المهمة', 'استفسارات هاتفية ورسائل؛ طلب موسمي']),
        P(['B2B and Distribution', 'Search, trade channels, email, marketplace or directory listings', 'Business account type, purchase requirement, volume, location', 'Quotation follow-up, account reviews, repeat enquiries', 'Quote requested; proposal sent; order received', 'Procurement cycles; orders may come via other channels'], ['الموردون والتوزيع B2B', 'البحث، القنوات التجارية، البريد الإلكتروني، قوائم السوق أو الدليل', 'نوع حساب الأعمال، متطلب الشراء، الكمية، الموقع', 'متابعة عروض الأسعار، مراجعة الحسابات، الاستفسارات المتكررة', 'طلب عرض؛ إرسال مقترح؛ استلام طلب', 'دورات شراء طويلة؛ قد تأتي الطلبات عبر قنوات أخرى']),
        P(['Retail and E-commerce', 'Search, social, marketplace, website, store enquiries', 'Product interest, purchase intent, segment (where lawful)', 'Abandoned-enquiry follow-up, repeat-customer outreach where consented', 'Recorded purchase (where data is available)', 'Online attribution depends on tracking, consent and transaction data'], ['التجزئة والتجارة الإلكترونية', 'البحث والتواصل الاجتماعي والسوق الإلكترونية والموقع واستفسارات المتجر', 'الاهتمام بالمنتج، نية الشراء، الشريحة (حيثما يجيز القانون)', 'متابعة الاستفسارات غير المكتملة، والتواصل مع العملاء المتكررين عند الموافقة', 'عملية شراء مسجلة (عند توفر البيانات)', 'يعتمد الإسناد الإلكتروني على التتبع والموافقة وبيانات المعاملات']),
      ],
      note: P('Illustrative sector guidance. These are typical patterns, not validated results for any specific business.', 'إرشادات قطاعية توضيحية. هذه أنماط شائعة، وليست نتائج مثبتة لأي نشاط تجاري محدد.'),
    },
    {
      type: 'links',
      title: P('Explore a sector', 'استكشف قطاعاً'),
      items: [
        { to: 'industries/real-estate', label: P('Real Estate', 'العقارات'), text: P('Property enquiries from first contact to viewing', 'استفسارات العقار من أول تواصل حتى المعاينة') },
        { to: 'industries/professional-services', label: P('Professional Services', 'الخدمات المهنية'), text: P('Scope-based qualification and proposals', 'تأهيل قائم على النطاق والعروض') },
        { to: 'industries/home-services', label: P('Home and Commercial Services', 'خدمات المنازل والأعمال'), text: P('Service area checks, quotes and bookings', 'فحص منطقة الخدمة والعروض والحجوزات') },
        { to: 'industries/b2b-distribution', label: P('B2B and Distribution', 'الموردون والتوزيع'), text: P('Requirement tracking and quotation follow-up', 'تتبع المتطلبات ومتابعة عروض الأسعار') },
        { to: 'industries/retail-ecommerce', label: P('Retail and E-commerce', 'التجزئة والتجارة الإلكترونية'), text: P('Product promotion and attribution limits', 'ترويج المنتجات وحدود الإسناد') },
      ],
    },
  ],
};

// ---------- INDUSTRY PAGES ----------
// Shared shape: intro, journey diagram, qualification/fields, statuses, follow-up, measurement, claims notice, CTA.
export const industryPages = [
  {
    slug: 'industries/real-estate',
    active: 'industries',
    crumbs: ['industries'],
    title: P('Real Estate Solutions', 'حلول العقارات'),
    homeTitle: null,
    description: P('Organize property enquiries from first contact to viewing: campaign planning by location and property type, enquiry capture, buyer and tenant qualification, viewing coordination and follow-up.', 'تنظيم استفسارات العقار من أول تواصل حتى المعاينة: تخطيط الحملات حسب الموقع ونوع العقار، واستقبال الاستفسارات، وتأهيل المشترين والمستأجرين، وتنسيق المعاينات والمتابعة.'),
    sections: [
      {
        type: 'intro',
        title: P('Organize Property Enquiries From First Contact to Viewing.', 'نظّم استفسارات العقار من أول تواصل حتى المعاينة.'),
        lead: P('Property enquiries arrive from many places and move through several stages. We set up the campaign, capture each enquiry, apply the qualification criteria you agree, and keep viewing and follow-up tasks visible.', 'تصل استفسارات العقار من أماكن متعددة وتمر بمراحل عدة. نعد الحملة، ونستقبل كل استفسار، ونطبق معايير التأهيل التي تتفق عليها، ونُبقي مهام المعاينة والمتابعة ظاهرة.'),
        actions: [{ label: P('Discuss your property pipeline', 'ناقش مسار العقارات لديك'), to: 'consultation' }],
      },
      {
        type: 'cards',
        columns: 3,
        title: P('What we configure', 'ما نقوم بإعداده'),
        items: [
          { title: P('Property campaign planning', 'تخطيط حملات العقار'), text: P('Campaigns organized by project, district or property type, with a budget you approve.', 'حملات منظمة حسب المشروع أو الحي أو نوع العقار، بميزانية تعتمدها.') },
          { title: P('Location and property-type segmentation', 'تقسيم حسب الموقع ونوع العقار'), text: P('Source tags per project so you can see which listings or districts generate enquiries.', 'وسوم مصدر لكل مشروع لترى أي المشاريع أو الأحياء تولّد الاستفسارات.') },
          { title: P('Enquiry capture', 'استقبال الاستفسارات'), text: P('Forms, calls and messages routed into one record, with duplicate checks.', 'النماذج والمكالمات والرسائل تُوجَّه إلى سجل واحد مع فحص المكرر.') },
          { title: P('Buyer and tenant qualification', 'تأهيل المشترين والمستأجرين'), text: P('Criteria for buying or renting, set by you and applied consistently.', 'معايير الشراء أو الإيجار التي تحددها وتُطبَّق باتساق.') },
          { title: P('Viewing coordination', 'تنسيق المعاينات'), text: P('Viewing requests tracked as tasks with owners and reminders.', 'طلبات المعاينة تُتابع كمهام لها مسؤولون وتذكيرات.') },
          { title: P('Follow-up reminders', 'تذكيرات المتابعة'), text: P('Reminders after a viewing and when a status has not changed for too long.', 'تذكيرات بعد المعاينة، وعندما تبقى الحالة دون تغيير لفترة طويلة.') },
        ],
      },
      {
        type: 'workflow',
        id: 're-statuses',
        title: P('Illustrative lead statuses', 'حالات توضيحية للعميل المحتمل'),
        intro: P('An example status path. Your statuses should be agreed during onboarding.', 'مثال على مسار الحالات. يجب الاتفاق على حالاتك خلال الإعداد.'),
        caption: P('Illustrative status path — not a universal standard.', 'مسار توضيحي للحالات — وليس معياراً عاماً.'),
        stages: [
          { title: P('New Enquiry', 'استفسار جديد') },
          { title: P('Contact Attempted', 'تم محاولة التواصل') },
          { title: P('Qualified', 'مؤهل') },
          { title: P('Viewing Scheduled', 'تم تحديد المعاينة') },
          { title: P('Viewing Completed', 'اكتملت المعاينة') },
          { title: P('Negotiation', 'التفاوض') },
          { title: P('Won / Lost', 'تم الإغلاق / لم يتم') },
        ],
      },
      {
        type: 'table',
        title: P('Example qualification fields', 'حقول تأهيل توضيحية'),
        intro: P('Examples. Each business sets its own fields and definitions.', 'أمثلة. يحدد كل نشاط حقوله وتعريفاته الخاصة.'),
        headers: P(['Field', 'Example value'], ['الحقل', 'قيمة توضيحية']),
        rows: [
          P(['Preferred location', 'Specific districts or project names'], ['الموقع المفضل', 'أحياء محددة أو أسماء مشاريع']),
          P(['Property type', 'Apartment, villa, office, land'], ['نوع العقار', 'شقة، فيلا، مكتب، أرض']),
          P(['Budget range', 'Range agreed with the business'], ['نطاق الميزانية', 'نطاق يتفق عليه النشاط']),
          P(['Purchase or rental intent', 'Buy, rent, or invest'], ['نية الشراء أو الإيجار', 'شراء أو إيجار أو استثمار']),
          P(['Intended timeframe', 'Within 3 months, 3–6 months, later'], ['الإطار الزمني المقصود', 'خلال 3 أشهر، 3–6 أشهر، لاحقاً']),
        ],
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('What we do not claim', 'ما لا ندّعيه'),
        items: P(['No access to your property listings or inventory is included unless a specific integration is agreed and implemented.', 'We do not claim results in real estate or any property segment.', 'Viewing and transaction milestones are recorded only when you provide them.'], ['لا يشمل الوصول إلى قوائم العقارات أو المخزون إلا إذا اتُفق على تكامل محدد وتم تنفيذه.', 'لا ندّعي نتائج في العقارات أو في أي شريحة منه.', 'تُسجل معالم المعاينة والصفقات فقط عندما تزودنا بها.']),
      },
      {
        type: 'cta',
        title: P('Map your property enquiry flow', 'ارسم مسار استفسارات العقار لديك'),
        text: P('We will look at your current process and recommend the simplest version to start with.', 'سننظر في عمليتك الحالية ونقترح أبسط نسخة للبدء بها.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },

  {
    slug: 'industries/professional-services',
    active: 'industries',
    crumbs: ['industries'],
    title: P('Professional Services Solutions', 'حلول الخدمات المهنية'),
    description: P('Qualify enquiries for consultancies, advisory firms and B2B service providers by scope, location, budget fit and readiness, with a clear path from consultation to proposal.', 'تأهيل استفسارات الشركات الاستشارية ومقدمي الخدمات المهنية وB2B حسب النطاق والموقع والملاءمة المالية والجاهزية، مع مسار واضح من الاستشارة إلى العرض.'),
    sections: [
      {
        type: 'intro',
        title: P('Qualify Enquiries Against Your Scope, Not Just Your Inbox.', 'أهّل الاستفسارات وفق نطاق خدماتك، لا وفق صندوق الوارد فقط.'),
        lead: P('For advisory and professional firms, the difficult part is not getting an enquiry; it is deciding which enquiries fit your scope. We help you set the criteria, record each decision and coordinate the follow-up that leads to a consultation or proposal.', 'بالنسبة للشركات الاستشارية والمهنية، الصعوبة ليست في الحصول على استفسار، بل في تحديد الاستفسارات التي تناسب نطاق خدماتك. نساعدك على وضع المعايير وتسجيل كل قرار وتنسيق المتابعة التي تقود إلى استشارة أو عرض.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
      {
        type: 'workflow',
        id: 'ps-journey',
        title: P('Client journey', 'رحلة العميل'),
        stages: [
          { title: P('Enquiry', 'استفسار') },
          { title: P('Qualification', 'تأهيل') },
          { title: P('Consultation', 'استشارة') },
          { title: P('Proposal', 'عرض') },
          { title: P('Decision', 'قرار') },
          { title: P('Engagement', 'تعاقد') },
        ],
        caption: P('Decisions and engagements are made by you and the prospect. We coordinate the process; we do not guarantee any client or contract.', 'القرارات والتعاقدات تتخذها أنت والعميل المحتمل. نحن ننسق العملية، ولا نضمن أي عميل أو عقد.'),
      },
      {
        type: 'cards',
        columns: 2,
        title: P('How qualification filters enquiries', 'كيف يفرز التأهيل الاستفسارات'),
        items: [
          { title: P('Service scope', 'نطاق الخدمة'), text: P('Is the requested work within what your firm offers?', 'هل العمل المطلوب ضمن ما تقدمه شركتك؟') },
          { title: P('Location or jurisdiction', 'الموقع أو الاختصاص'), text: P('Is the client in an area or jurisdiction you serve?', 'هل العميل في منطقة أو اختصاص تخدمه؟') },
          { title: P('Budget fit', 'ملاءمة الميزانية'), text: P('Is the expected budget within the range you can serve?', 'هل الميزانية المتوقعة ضمن النطاق الذي تستطيع خدمته؟') },
          { title: P('Readiness to engage', 'الجاهزية للتعاقد'), text: P('Has the prospect defined the need and the decision timeline?', 'هل حدد العميل المحتمل الحاجة والإطار الزمني للقرار؟') },
        ],
      },
      {
        type: 'table',
        title: P('Stage-by-stage coordination', 'تنسيق كل مرحلة'),
        headers: P(['Stage', 'What we coordinate', 'What you decide'], ['المرحلة', 'ما ننسقه', 'ما تقرره أنت']),
        rows: [
          P(['Enquiry', 'Capture, duplicate check, source tag', 'Criteria and owner'], ['استفسار', 'الاستقبال وفحص المكرر ووسم المصدر', 'المعايير والمسؤول']),
          P(['Qualification', 'Apply criteria, record reason codes', 'Whether to pursue'], ['تأهيل', 'تطبيق المعايير وتسجيل رموز السبب', 'هل تتابع الفرصة']),
          P(['Consultation', 'Booking request and reminders', 'Consultation content and fee approach'], ['استشارة', 'طلب الحجز والتذكيرات', 'محتوى الاستشارة وطريقة الرسوم']),
          P(['Proposal', 'Follow-up on proposal status', 'Commercial terms'], ['عرض', 'متابعة حالة العرض', 'الشروط التجارية']),
          P(['Decision and engagement', 'Record outcome if shared with us', 'Acceptance and contract'], ['قرار وتعاقد', 'تسجيل النتيجة عند مشاركتها معنا', 'القبول والعقد']),
        ],
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('Professional and regulatory limits', 'حدود مهنية وتنظيمية'),
        text: P('Some professional services are subject to rules on advertising and client solicitation. Confirm that your advertising and qualification approach complies with the rules that apply to your profession before launch. We do not provide that legal advice.', 'بعض الخدمات المهنية تخضع لقواعد الإعلان والتواصل مع العملاء. تأكد قبل الإطلاق من أن نهجك في الإعلان والتأهيل يتوافق مع القواعد المنطبقة على مهنتك. ولا نقدم هذه النصيحة القانونية.'),
      },
      {
        type: 'cta',
        title: P('Define your scope criteria', 'حدد معايير نطاق خدماتك'),
        text: P('We will help you draft criteria you can apply consistently.', 'نساعدك على صياغة معايير يمكنك تطبيقها باتساق.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },

  {
    slug: 'industries/home-services',
    active: 'industries',
    crumbs: ['industries'],
    title: P('Home and Commercial Services Solutions', 'حلول خدمات المنازل والأعمال'),
    description: P('Coordinate enquiries for maintenance, cleaning, repair and facility services: service-area checks, job details, quotations, bookings and completion follow-up.', 'تنسيق استفسارات الصيانة والتنظيف والإصلاح وخدمات المرافق: فحص منطقة الخدمة وتفاصيل المهمة وعروض الأسعار والحجوزات ومتابعة الإنجاز.'),
    sections: [
      {
        type: 'intro',
        title: P('Turn Enquiries Into Booked Jobs, With Clear Owners.', 'حوّل الاستفسارات إلى مهام محجوزة، بمسؤوليات واضحة.'),
        lead: P('Service businesses often lose enquiries in phone calls and messages. We structure the enquiry flow around service area, job type and quotation requirements, so every request has an owner and a next step.', 'تفقد شركات الخدمات كثيراً من الاستفسارات في المكالمات والرسائل. نبني مسار الاستفسار حول منطقة الخدمة ونوع المهمة ومتطلبات عرض السعر، ليكون لكل طلب مسؤول وخطوة تالية.'),
        actions: [{ label: P('Discuss your service flow', 'ناقش مسار الخدمة لديك'), to: 'consultation' }],
      },
      {
        type: 'workflow',
        id: 'hs-flow',
        title: P('Enquiry to completion', 'من الاستفسار حتى الإنجاز'),
        stages: [
          { title: P('Enquiry', 'استفسار') },
          { title: P('Service area check', 'فحص منطقة الخدمة') },
          { title: P('Job details', 'تفاصيل المهمة') },
          { title: P('Quote', 'عرض السعر') },
          { title: P('Booking', 'الحجز') },
          { title: P('Completion', 'الإنجاز') },
        ],
      },
      {
        type: 'table',
        title: P('Configurable fields', 'حقول قابلة للتهيئة'),
        intro: P('These fields are set during onboarding. Examples only.', 'تُحدد هذه الحقول خلال الإعداد. أمثلة فقط.'),
        headers: P(['Field', 'Purpose', 'Example option'], ['الحقل', 'الغرض', 'مثال على الخيار']),
        rows: [
          P(['Service area', 'Confirm you cover the location', 'Districts or postcodes you serve'], ['منطقة الخدمة', 'تأكيد أنك تغطي الموقع', 'أحياء أو رموز بريدية تخدمها']),
          P(['Availability', 'Match the request with a slot', 'Working hours and lead time'], ['التوفر', 'مطابقة الطلب بموعد متاح', 'ساعات العمل ومدة الإشعار المسبق']),
          P(['Job type', 'Route to the right team', 'Maintenance, repair, cleaning, facility'], ['نوع المهمة', 'التوجيه للفريق المناسب', 'صيانة، إصلاح، تنظيف، مرافق']),
          P(['Quotation requirement', 'Decide whether a site visit is needed', 'Quote from description or after site visit'], ['متطلب عرض السعر', 'تحديد الحاجة لزيارة الموقع', 'عرض من الوصف أو بعد زيارة الموقع']),
        ],
      },
      {
        type: 'checklist',
        title: P('Before a quote is sent', 'قبل إرسال عرض السعر'),
        intro: P('Each quote request is checked against these items. Confirm them with your team.', 'يُفحص كل طلب عرض سعر وفق هذه البنود. أكّدها مع فريقك.'),
        items: P(['Location is inside the service area', 'Job type and scope are described', 'Access or site visit requirement is known', 'Preferred time window is recorded', 'Owner for the quote is assigned'], ['الموقع داخل منطقة الخدمة', 'نوع المهمة ونطاقها موصوف', 'متطلبات الوصول أو زيارة الموقع معروفة', 'الفترة الزمنية المفضلة مسجلة', 'تم تعيين مسؤول عرض السعر']),
      },
      {
        type: 'notice',
        tone: 'info',
        title: P('Measurement note', 'ملاحظة حول القياس'),
        text: P('Many service enquiries arrive by phone or messaging. Calls not logged in the system cannot be attributed to a campaign. We recommend a simple logging habit, and we show data completeness in every report.', 'تصل كثير من استفسارات الخدمات عبر الهاتف أو المراسلة. والمكالمات غير المسجلة في النظام لا يمكن إسنادها إلى حملة. نوصي بعادة تسجيل بسيطة، ونعرض اكتمال البيانات في كل تقرير.'),
      },
      {
        type: 'cta',
        title: P('Set up your service-area rules', 'ضع قواعد منطقة خدمتك'),
        text: P('We will confirm which areas and job types to target before any campaign goes live.', 'نؤكد المناطق وأنواع المهام المستهدفة قبل إطلاق أي حملة.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },

  {
    slug: 'industries/b2b-distribution',
    active: 'industries',
    crumbs: ['industries'],
    title: P('B2B and Distribution Solutions', 'حلول الموردين والتوزيع B2B'),
    description: P('Track product and service enquiries from businesses: account qualification, requirement tracking, volume and location criteria, quotation follow-up and repeat-enquiry monitoring.', 'تتبع استفسارات المنتجات والخدمات من الشركات: تأهيل الحسابات وتتبع المتطلبات ومعايير الكمية والموقع ومتابعة عروض الأسعار ومراقبة الاستفسارات المتكررة.'),
    sections: [
      {
        type: 'intro',
        title: P('Track Business Enquiries From Requirement to Proposal.', 'تتبّع استفسارات الشركات من المتطلب حتى العرض.'),
        lead: P('B2B enquiries are longer and more specific. We help you record the requirement, the volume, the location and the quotation status, and keep each open proposal visible until it is won, lost or closed.', 'استفسارات B2B أطول وأكثر تحديداً. نساعدك على تسجيل المتطلب والكمية والموقع وحالة عرض السعر، وإبقاء كل عرض مفتوح ظاهراً حتى يُربح أو يُخسر أو يُغلق.'),
        actions: [{ label: P('Discuss your B2B pipeline', 'ناقش مسار B2B لديك'), to: 'consultation' }],
      },
      {
        type: 'workflow',
        id: 'b2b-flow',
        title: P('Opportunity pipeline (example)', 'مسار الفرص (مثال)'),
        stages: [
          { title: P('Enquiry', 'استفسار') },
          { title: P('Business details reviewed', 'مراجعة بيانات النشاط') },
          { title: P('Requirement confirmed', 'تأكيد المتطلب') },
          { title: P('Quote requested', 'طلب عرض سعر') },
          { title: P('Proposal sent', 'إرسال العرض') },
          { title: P('Negotiation', 'التفاوض') },
          { title: P('Won / Lost', 'تم الإغلاق / لم يتم') },
        ],
        caption: P('"Business details reviewed" means you check the account against your own criteria. We do not verify business registration or creditworthiness unless that check is explicitly contracted and supported.', 'تعني "مراجعة بيانات النشاط" أنك تتحقق من الحساب وفق معاييرك. ولا نتحقق من السجل التجاري أو الجدارة الائتمانية ما لم يُتعاقد على ذلك صراحةً وتكن الجهة المنفذة مدعومة.'),
      },
      {
        type: 'cards',
        columns: 2,
        title: P('What we track', 'ما نتابعه'),
        items: [
          { title: P('Product and service enquiries', 'استفسارات المنتجات والخدمات'), text: P('Each request is recorded with product or service type and source.', 'يُسجل كل طلب مع نوع المنتج أو الخدمة ومصدره.') },
          { title: P('Business account qualification', 'تأهيل حساب الأعمال'), text: P('Criteria you set for account type, sector and fit.', 'معايير تحددها لنوع الحساب والقطاع والملاءمة.') },
          { title: P('Purchase requirement tracking', 'تتبع متطلبات الشراء'), text: P('Requirements, specifications and deadlines captured per opportunity.', 'المتطلبات والمواصفات والمواعيد النهائية لكل فرصة.') },
          { title: P('Volume and location qualification', 'تأهيل الكمية والموقع'), text: P('Minimum volumes and delivery areas defined in your criteria.', 'حدود الكمية الدنيا ومناطق التوصيل وفق معاييرك.') },
          { title: P('Quotation follow-up', 'متابعة عروض الأسعار'), text: P('Reminders and status checks for each open quote.', 'تذكيرات وفحوص للحالة لكل عرض مفتوح.') },
          { title: P('Repeat enquiry monitoring', 'مراقبة الاستفسارات المتكررة'), text: P('Repeat contacts linked to the same account, where data allows.', 'تواصلات متكررة مرتبطة بالحساب نفسه عندما تسمح البيانات.') },
        ],
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('Limits', 'حدود'),
        items: P(['Orders placed outside tracked channels will not appear in the pipeline unless you record them.', 'Repeat-enquiry monitoring depends on matching contact details; some repeats will be missed.', 'We do not claim proven results in B2B or distribution.'], ['الطلبات التي تُقدم خارج القنوات المتتبعة لن تظهر في المسار ما لم تسجلها.', 'تعتمد مراقبة الاستفسارات المتكررة على مطابقة بيانات التواصل؛ وقد تفوت بعض التكرارات.', 'لا ندّعي نتائج مثبتة في B2B أو التوزيع.']),
      },
      {
        type: 'cta',
        title: P('Map your quotation process', 'ارسم عملية عروض الأسعار لديك'),
        text: P('Share your current steps and we will suggest how to track them.', 'شاركنا خطواتك الحالية ونقترح طريقة لتتبعها.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },

  {
    slug: 'industries/retail-ecommerce',
    active: 'industries',
    crumbs: ['industries'],
    title: P('Retail and E-commerce Solutions', 'حلول التجزئة والتجارة الإلكترونية'),
    description: P('Campaign management, product promotion, purchase-intent capture, lawful segmentation and conversion tracking where supported. Attribution depends on tracking, consent and transaction data.', 'إدارة الحملات وترويج المنتجات واستقبال نية الشراء والتقسيم المشروع وتتبع التحويلات حيث يُدعم ذلك. ويعتمد الإسناد على التتبع والموافقة وبيانات المعاملات.'),
    sections: [
      {
        type: 'intro',
        title: P('Connect Product Interest to Measurable Purchase Activity.', 'اربط اهتمام العملاء بالمنتجات بنشاط شراء قابل للقياس.'),
        lead: P('Retail and online businesses have a lot of activity but often unclear attribution. We plan the campaigns, capture purchase-intent signals you approve, and report what the data can and cannot show.', 'لدى نشاطات التجزئة والتجارة الإلكترونية نشاط كبير غالباً، لكن الإسناد غير واضح في الغالب. نخطط للحملات، ونستقبل إشارات نية الشراء التي تعتمدها، ونعرض ما تستطيع البيانات إظهاره وما لا تستطيع.'),
        actions: [{ label: P('Discuss your product campaigns', 'ناقش حملات منتجاتك'), to: 'consultation' }],
      },
      {
        type: 'cards',
        columns: 3,
        title: P('What the service covers', 'ما تغطيه الخدمة'),
        items: [
          { title: P('Campaign management', 'إدارة الحملات'), text: P('Planning and running approved campaigns within your budget.', 'تخطيط الحملات المعتمدة وإدارتها ضمن ميزانيتك.') },
          { title: P('Product and offer promotion', 'ترويج المنتجات والعروض'), text: P('Promotion plans for products and offers you have approved, with claims reviewed.', 'خطط ترويج للمنتجات والعروض المعتمدة مع مراجعة الادعاءات.') },
          { title: P('Enquiry or purchase-intent capture', 'استقبال الاستفسارات ونية الشراء'), text: P('Enquiries, cart-related or product-page actions captured where your setup supports it.', 'الاستفسارات والإجراءات المرتبطة بالسلة أو صفحة المنتج عندما يدعمها إعدادك.') },
          { title: P('Lead and customer segmentation', 'تقسيم العملاء المحتملين والعملاء'), text: P('Segments created only where lawful and consented, with purpose recorded.', 'شرائح تُنشأ فقط حيث يجيز القانون وتوجد موافقة، مع تسجيل الغرض.') },
          { title: P('Conversion-event tracking', 'تتبع أحداث التحويل'), text: P('Tracking events set up where your platform and site support them.', 'أحداث تتبع تُضبط حيث تدعمها منصتك وموقعك.') },
          { title: P('Repeat-customer analysis', 'تحليل العملاء المتكررين'), text: P('Repeat patterns analysed where transaction data is available to us.', 'أنماط التكرار تُحلَّل عندما تتوفر بيانات المعاملات لدينا.') },
        ],
      },
      {
        type: 'notice',
        tone: 'warning',
        title: P('Attribution depends on the setup', 'الإسناد يعتمد على الإعداد'),
        text: P('Online sales attribution depends on tracking implementation, platform support, consent requirements and the availability of transaction data. Without those, we report enquiries and activity, and we do not report sales or revenue as campaign results.', 'يعتمد إسناد المبيعات الإلكترونية على تنفيذ التتبع ودعم المنصات ومتطلبات الموافقة وتوفر بيانات المعاملات. وبدون ذلك، نعرض الاستفسارات والنشاط، ولا نعرض المبيعات أو الإيرادات كنتائج للحملة.'),
      },
      {
        type: 'checklist',
        title: P('Data you may need to provide', 'بيانات قد تحتاج إلى تزويدنا بها'),
        items: P(['Confirmation of the tracking you have in place', 'Consent approach for marketing messages', 'Transaction summary exports, if you want sales reported', 'Product and offer calendar, with approved claims', 'Who approves promotions and discounts'], ['تأكيد التتبع المطبق لديك', 'طريقة الموافقة على الرسائل التسويقية', 'ملخصات تصدير المعاملات، إن أردت الإبلاغ عن المبيعات', 'تقويم المنتجات والعروض مع الادعاءات المعتمدة', 'من يعتمد العروض والخصومات']),
      },
      {
        type: 'cta',
        title: P('Check your tracking before you spend', 'تحقق من التتبع قبل الإنفاق'),
        text: P('In the consultation we review the data you have so expectations match what can be measured.', 'في الاستشارة نراجع البيانات المتوفرة لديك حتى تتطابق التوقعات مع ما يمكن قياسه.'),
        actions: [{ label: P('Book a Consultation', 'احجز استشارة'), to: 'consultation' }],
      },
    ],
  },
];
