// Legal and trust pages: STRUCTURED DRAFTS ONLY.
// They are not legal advice and must not be published until a qualified legal
// professional reviews them (Arabic text: a Saudi-qualified Arabic-speaking reviewer).
// Bracketed fields are placeholders. Do not fill in CR, VAT, address or licence details
// unless the business has provided and verified them.

const P = (en, ar) => ({ en, ar });
const DRAFT_DATE = '2026-10-14';
const LE = P('[Legal entity name — to be confirmed]', '[اسم الكيان القانوني — يُحدد لاحقاً]');

const sec = (id, title, paragraphs, bullets) => ({
  id,
  title,
  paragraphs,
  bullets,
});

const rawLegalPages = [
  {
    slug: 'privacy',
    active: '',
    title: P('Privacy Policy', 'سياسة الخصوصية'),
    description: P('Draft privacy policy: controller details, data categories, purposes, recipients, retention, rights, security, transfers and cookies. Pending legal review.', 'مسودة سياسة الخصوصية: بيانات المسؤول عن المعالجة وفئات البيانات والأغراض والمستلمون والحفظ والحقوق والأمن والنقل والكوكيز. بانتظار المراجعة القانونية.'),
    sections: [
      sec('controller', P('1. Controller', '1. المسؤول عن المعالجة'), P(
        ['The entity responsible for your personal data is [Legal entity name — to be confirmed]. Registration details: [CR number — to be confirmed]. Address: [Registered address — to be confirmed].'],
        ['الكيان المسؤول عن بياناتك الشخصية هو [اسم الكيان القانوني — يُحدد لاحقاً]. بيانات التسجيل: [رقم السجل التجاري — يُحدد لاحقاً]. العنوان: [العنوان المسجل — يُحدد لاحقاً].']
      )),
      sec('data-collected', P('2. Personal data we collect', '2. البيانات الشخصية التي نجمعها'), P(
        ['We collect the information you submit through our forms: name, business name, work email, phone number (optional), industry, language preference, and the content of your enquiry. We do not ask for passwords, payment card numbers or national identity numbers through our forms.', 'Our servers may record technical information needed to operate the site and prevent abuse, such as request time and general error information. This is kept to the minimum needed.'],
        ['نجمع المعلومات التي تقدمها عبر نماذجنا: الاسم واسم النشاط التجاري والبريد الإلكتروني للعمل ورقم الهاتف (اختياري) والقطاع وتفضيل اللغة ومحتوى استفسارك. لا نطلب كلمات المرور أو أرقام البطاقات أو أرقام الهوية الوطنية عبر نماذجنا.', 'قد تسجل خوادمنا معلومات تقنية لازمة لتشغيل الموقع ومنع إساءة الاستخدام، مثل وقت الطلب ومعلومات الأخطاء العامة. وتُحفظ بالحد الأدنى اللازم.']
      )),
      sec('purposes', P('3. Purposes and legal basis', '3. الأغراض والأساس النظامي'), P(
        ['We use personal data to respond to your enquiry, to arrange a consultation you request, to prepare a proposal, and, where you have opted in, to send marketing emails.', 'The legal basis for each purpose (for example consent, contract steps requested by you, or legitimate interests) must be confirmed by counsel under the applicable Saudi framework, including the Personal Data Protection Law. [Legal basis mapping — pending legal review].'],
        ['نستخدم البيانات الشخصية للرد على استفسارك، وترتيب الاستشارة التي تطلبها، وإعداد عرض، وإرسال الرسائل التسويقية عند موافقتك عليها.', 'يجب أن يؤكد المستشار القانوني الأساس النظامي لكل غرض وفق الإطار النظامي السعودي المعمول به، بما في ذلك نظام حماية البيانات الشخصية. [ربط الأسس النظامية — بانتظار المراجعة القانونية].']
      )),
      sec('recipients', P('4. Recipients and service providers', '4. المستلمون ومقدمو الخدمات'), P(
        ['We share data only with authorized staff and service providers that help us operate the site and respond to enquiries (for example email delivery and hosting). A current list of categories will be maintained and reviewed. [Named subprocessors — to be confirmed before launch].'],
        ['نشارك البيانات فقط مع الموظفين المصرح لهم ومقدمي الخدمات الذين يساعدوننا في تشغيل الموقع والرد على الاستفسارات (مثل خدمات البريد الإلكتروني والاستضافة). ستُحدّث قائمة الفئات وتُراجع بانتظام. [مقدمو المعالجة الفرعية بالأسماء — يُحددون قبل الإطلاق].']
      )),
      sec('retention', P('5. Retention', '5. مدة الاحتفاظ'), P(
        ['Enquiry records are retained for the period set in the Data Processing Information. [Retention periods — pending legal review and business confirmation].'],
        ['تُحفظ سجلات الاستفسارات للمدة المحددة في معلومات معالجة البيانات. [مدد الاحتفاظ — بانتظار المراجعة القانونية وتأكيد النشاط].']
      )),
      sec('rights', P('6. Your rights', '6. حقوقك'), P(
        ['Subject to applicable law, you may request access to, correction of, or deletion of your personal data, and you may withdraw consent for marketing at any time. The exact rights and response procedure will be confirmed by counsel.'],
        ['وفق النظام المعمول به، يحق لك طلب الاطلاع على بياناتك الشخصية أو تصحيحها أو حذفها، ويحق لك سحب موافقتك على التسويق في أي وقت. وسيؤكد المستشار القانوني الحقوق الدقيقة وإجراءات الرد.']
      )),
      sec('contact', P('7. Privacy requests', '7. طلبات الخصوصية'), P(
        ['Send privacy requests to: [Privacy request channel — to be confirmed]. We do not publish a privacy inbox until one is confirmed and monitored.'],
        ['أرسل طلبات الخصوصية إلى: [قناة طلبات الخصوصية — يُحدد لاحقاً]. لن ننشر بريداً مخصصاً للخصوصية إلا بعد تأكيده ومتابعته.']
      )),
      sec('security', P('8. Security', '8. الأمن'), P(
        ['We use access controls, server-side validation, rate limiting on public forms and transport encryption. No system is completely secure; we will notify affected individuals and authorities where required by law. [Security measures — to be verified in the deployment environment].'],
        ['نستخدم ضوابط الوصول والتحقق من البيانات على الخادم وتحديد معدل الطلبات على النماذج العامة والتشفير أثناء النقل. لا يوجد نظام آمن تماماً، وسنُخطر المتأثرين والجهات المختصة عند اقتضاء النظام ذلك. [إجراءات الأمن — تُتحقق في بيئة النشر].']
      )),
      sec('transfers', P('9. International transfers', '9. النقل الدولي'), P(
        ['If any provider stores or processes data outside the Kingdom, the transfer will be identified here and must meet applicable requirements. [Transfer locations — pending confirmation of hosting and providers].'],
        ['إذا خزن أي مزود البيانات أو عالجها خارج المملكة، سيُذكر ذلك هنا ويجب أن يستوفي المتطلبات المعمول بها. [مواقع النقل — بانتظار تأكيد الاستضافة والمزودين].']
      )),
      sec('cookies', P('10. Cookies and analytics', '10. ملفات تعريف الارتباط والتحليلات'), P(
        ['See our Cookie Policy. In this version the site does not load analytics or marketing cookies.'],
        ['راجع سياسة ملفات تعريف الارتباط. في هذه النسخة لا يحمّل الموقع ملفات تحليلية أو تسويقية.']
      )),
    ],
  },

  {
    slug: 'cookies',
    active: '',
    title: P('Cookie Policy', 'سياسة ملفات تعريف الارتباط'),
    description: P('Draft cookie policy describing the technical storage used on this website and how choices are managed. Pending legal review.', 'مسودة سياسة ملفات تعريف الارتباط تصف التخزين التقني المستخدم في هذا الموقع وكيفية إدارة الخيارات. بانتظار المراجعة القانونية.'),
    sections: [
      sec('what', P('1. What we use', '1. ما الذي نستخدمه'), P(
        ['In this version, the website uses no analytics, advertising or social-media cookies or scripts. Only technical storage is used where the browser needs it, for example to keep the form you are completing or remember your language choice.', 'We do not describe any cookie as strictly necessary unless it is genuinely required to deliver the function you requested.'],
        ['في هذه النسخة لا يستخدم الموقع أي ملفات تعريف ارتباط أو نصوص تحليلية أو إعلانية أو لمنصات التواصل. يُستخدم التخزين التقني فقط عندما يحتاجه المتصفح، مثل الاحتفاظ بالنموذج الذي تكمله أو تذكر اختيار لغتك.', 'لا نصف أي ملف بأنه ضروري بشكل صارم ما لم يكن مطلوباً فعلاً لتقديم الوظيفة التي طلبتها.']
      )),
      sec('table', P('2. Inventory', '2. الجرد'), P(
        ['Current inventory: no third-party cookies. Any cookie added in future (for example for analytics) will be listed here with its purpose, duration and provider, and will not load until the consent setting allows it.', '[Inventory — to be updated before each release that adds scripts.]'],
        ['الجرد الحالي: لا توجد ملفات تعريف ارتباط من طرف ثالث. أي ملف يُضاف مستقبلاً (مثل التحليلات) سيُدرج هنا مع غرضه ومدته ومزوده، ولن يُحمّل قبل أن يسمح إعداد الموافقة بذلك.', '[الجرد — يُحدَّث قبل كل إصدار يضيف نصوصاً جديدة.]']
      )),
      sec('choices', P('3. Your choices', '3. خياراتك'), P(
        ['You can clear site storage in your browser settings at any time. Blocking technical storage may affect form completion or language selection.', 'When analytics or marketing scripts are added, a consent control will be provided that is as easy to refuse as to accept.'],
        ['يمكنك مسح تخزين الموقع من إعدادات متصفحك في أي وقت. وقد يؤثر حجب التخزين التقني على إكمال النماذج أو اختيار اللغة.', 'عند إضافة نصوص تحليلية أو تسويقية سيتوفر خيار موافقة يكون رفضه بنفس سهولة قبوله.']
      )),
      sec('changes', P('4. Changes', '4. التغييرات'), P(
        ['We will update this policy when the cookies or similar technologies we use change. [Review date — pending legal review].'],
        ['سنحدّث هذه السياسة عند تغيّر ملفات تعريف الارتباط أو التقنيات المماثلة التي نستخدمها. [تاريخ المراجعة — بانتظار المراجعة القانونية].']
      )),
    ],
  },

  {
    slug: 'terms',
    active: '',
    title: P('Terms of Service', 'شروط الاستخدام'),
    description: P('Draft website terms of use covering intellectual property, disclaimers, third-party links, liability and disputes. Pending legal review.', 'مسودة شروط استخدام الموقع: الملكية الفكرية والإخلاء والروابط الخارجية والمسؤولية والنزاعات. بانتظار المراجعة القانونية.'),
    sections: [
      sec('use', P('1. Use of the website', '1. استخدام الموقع'), P(
        ['This website provides information about our services and allows you to send enquiries. It does not, by itself, create a contract for services, and submitting a form does not start a subscription or activate a service.'],
        ['يقدم هذا الموقع معلومات عن خدماتنا ويتيح لك إرسال الاستفسارات. ولا ينشئ الموقع بذاته عقداً للخدمات، كما أن إرسال النموذج لا يبدأ اشتراكاً ولا يفعّل خدمة.']
      )),
      sec('ip', P('2. Intellectual property', '2. الملكية الفكرية'), P(
        ['The content, design, brand elements and code of this website are owned by [Legal entity name — to be confirmed] or used under licence. You may not copy or reuse them except as permitted by law or written permission.'],
        ['المحتوى والتصميم وعناصر العلامة والشيفرة في هذا الموقع مملوكة لـ[اسم الكيان القانوني — يُحدد لاحقاً] أو مستخدمة بموجب ترخيص. لا يجوز نسخها أو إعادة استخدامها إلا بما يجيزه النظام أو بإذن كتابي.']
      )),
      sec('disclaimers', P('3. Disclaimers', '3. إخلاء المسؤولية'), P(
        ['Content is provided for general information. Illustrative dashboards, sample data and example calculations are not customer results. Nothing on this site is a guarantee of sales, revenue, return on advertising spend or lead volume. See the Advertising and Performance Disclaimer.'],
        ['يُقدَّم المحتوى لأغراض المعلومات العامة. لوحات التوضيح والبيانات النموذجية والحسابات التوضيحية ليست نتائج عملاء. ولا يشكل أي شيء في هذا الموقع ضماناً لمبيعات أو إيرادات أو عائد على الإنفاق الإعلاني أو عدد العملاء المحتملين. راجع إخلاء المسؤولية عن الإعلانات والأداء.']
      )),
      sec('links', P('4. Third-party links', '4. الروابط الخارجية'), P(
        ['Links to third-party websites are provided for convenience. We do not control those sites and are not responsible for their content or practices.'],
        ['تُقدَّم الروابط إلى مواقع الغير للتيسير. ولا نتحكم في تلك المواقع ولسنا مسؤولين عن محتواها أو ممارساتها.']
      )),
      sec('liability', P('5. Limitation of liability', '5. تحديد المسؤولية'), P(
        ['To the extent permitted by applicable law, we are not liable for indirect or consequential losses arising from use of this website. [Liability wording — pending legal review; must comply with mandatory provisions of Saudi law.]'],
        ['بقدر ما يسمح به النظام المعمول به، لسنا مسؤولين عن الخسائر غير المباشرة أو التبعية الناتجة عن استخدام هذا الموقع. [صياغة تحديد المسؤولية — بانتظار المراجعة القانونية، ويجب أن تتوافق مع الأحكام الإلزامية في النظام السعودي.]']
      )),
      sec('law', P('6. Governing law and disputes', '6. القانون الواجب التطبيق والنزاعات'), P(
        ['These terms are governed by the laws of the Kingdom of Saudi Arabia. [Dispute resolution mechanism — pending legal review.]'],
        ['تخضع هذه الشروط لأنظمة المملكة العربية السعودية. [آلية تسوية النزاعات — بانتظار المراجعة القانونية.]']
      )),
      sec('changes', P('7. Changes to these terms', '7. تعديل هذه الشروط'), P(
        ['We may update these terms. The date of the current version will be shown on this page once approved.'],
        ['قد نحدّث هذه الشروط. وسيظهر تاريخ النسخة الحالية في هذه الصفحة بعد اعتمادها.']
      )),
    ],
  },

  {
    slug: 'service-agreement',
    active: '',
    title: P('Service Agreement Overview', 'ملخص اتفاقية الخدمة'),
    description: P('Overview of the commercial relationship: responsibilities, deliverables, fees, account ownership, approvals, cancellation and lead-quality definitions. Not the contract itself.', 'نظرة عامة على العلاقة التجارية: المسؤوليات والمخرجات والرسوم وملكية الحسابات والاعتمادات والإلغاء وتعريفات جودة العملاء. ليست العقد نفسه.'),
    sections: [
      sec('status', P('1. Status of this overview', '1. وضع هذا الملخص'), P(
        ['This overview explains how a service engagement is typically structured. It is not the contract. The binding terms are in the signed statement of work and service agreement, which take precedence.'],
        ['يشرح هذا الملخص الطريقة المعتادة لهيكلة التعاقد على الخدمة. وهو ليس العقد. الشروط الملزمة موجودة في بيان العمل واتفاقية الخدمة الموقعين، وهما المرجع عند التعارض.']
      )),
      sec('scope', P('2. Scope and statement of work', '2. النطاق وبيان العمل'), P(
        ['Each engagement has a statement of work that defines the campaign scope, lead criteria, reporting frequency, support allowance, responsibilities and any excluded items. Provisional package prices apply to the scope confirmed in that statement.'],
        ['لكل تعاقد بيان عمل يحدد نطاق الحملات ومعايير العملاء ووتيرة التقارير ومخصصات الدعم والمسؤوليات وأي بنود مستثناة. تنطبق الأسعار المبدئية للباقات على النطاق المؤكد في ذلك البيان.']
      )),
      sec('fees', P('3. Fees', '3. الرسوم'), P(
        ['Service fees are charged separately from advertising-platform spend. Advertising spend is paid directly to the platforms. Third-party production, optional software and any setup fees are disclosed in advance and are excluded unless stated in the statement of work. Taxes are handled according to applicable requirements. [Payment terms, invoicing and VAT treatment — pending legal and finance review.]'],
        ['تُحمّل رسوم الخدمة بشكل منفصل عن الإنفاق لدى المنصات الإعلانية. يُدفع الإنفاق الإعلاني مباشرةً للمنصات. تُعلن مسبقاً تكاليف الإنتاج الخارجي والبرمجيات الاختيارية وأي رسوم إعداد، وهي مستثناة ما لم تُذكر في بيان العمل. تُعالج الضرائب وفق المتطلبات المعمول بها. [شروط الدفع والفوترة ومعالجة ضريبة القيمة المضافة — بانتظار مراجعة قانونية ومالية.]']
      )),
      sec('accounts', P('4. Advertising account ownership and access', '4. ملكية الحسابات الإعلانية والوصول إليها'), P(
        ['Our preferred arrangement is that you own and control your advertising accounts. You grant access for the agreed work through platform permission mechanisms and can withdraw that access. We do not request account passwords.'],
        ['ترتيبنا المفضل أن تملك حساباتك الإعلانية وتتحكم بها. تمنح الصلاحيات للعمل المتفق عليه عبر آليات المنصات، ويمكنك سحبها في أي وقت. لا نطلب كلمات المرور.']
      )),
      sec('approvals', P('5. Approvals and budget changes', '5. الاعتمادات وتغييرات الميزانية'), P(
        ['You approve advertising budgets and material campaign changes in writing, according to the process in the statement of work. Changes made without approval are not permitted except where needed to stop a clear compliance or safety issue, which will be reported to you immediately.'],
        ['تعتمد أنت الميزانيات الإعلانية والتغييرات الجوهرية في الحملات كتابياً وفق الإجراء الوارد في بيان العمل. لا يُسمح بتغييرات دون اعتماد إلا عند الحاجة لإيقاف مشكلة واضحة تتعلق بالامتثال أو السلامة، وستُبلّغ بها فوراً.']
      )),
      sec('responsibilities', P('6. Responsibilities', '6. المسؤوليات'), P(
        ['You are responsible for: the accuracy of the information and claims you provide, the legal basis for the personal data you share with us, your product, pricing and offer, and your sales conduct.', 'We are responsible for: performing the agreed services with reasonable care, following the approved budget and process, keeping records of changes, and reporting results with their limitations.'],
        ['أنت مسؤول عن: دقة المعلومات والادعاءات التي تقدمها، والأساس النظامي للبيانات الشخصية التي تشاركها معنا، ومنتجك وأسعارك وعرضك، وسلوك فريق المبيعات لديك.', 'نحن مسؤولون عن: تنفيذ الخدمات المتفق عليها بعناية معقولة، واتباع الميزانية والإجراء المعتمدين، وحفظ سجلات التغييرات، وعرض النتائج مع حدودها.']
      )),
      sec('deliverables', P('7. Deliverables', '7. المخرجات'), P(
        ['Deliverables are those listed in the statement of work, such as campaign setups, lead records, follow-up task logs and periodic reports. Deliverables not listed are out of scope.'],
        ['المخرجات هي ما يرد في بيان العمل، مثل إعداد الحملات وسجلات العملاء وسجلات مهام المتابعة والتقارير الدورية. أي مخرج غير مذكور يعد خارج النطاق.']
      )),
      sec('lead-quality', P('8. Lead-quality definitions', '8. تعريفات جودة العملاء'), P(
        ['Definitions of enquiry, valid lead, qualified lead, duplicate and unknown status are agreed in writing before launch and documented in the statement of work. The Measurement page describes the default definitions.'],
        ['تُتفق تعريفات الاستفسار والعميل الصالح والعميل المؤهل والمكرر والحالة غير المعروفة كتابياً قبل الإطلاق، وتُوثّق في بيان العمل. وتصف صفحة القياس التعريفات الافتراضية.']
      )),
      sec('term', P('9. Term, cancellation and handover', '9. المدة والإلغاء والتسليم'), P(
        ['[Minimum term, notice period, cancellation fees, refund rules, and handover of accounts, assets and data — pending legal review. This section will be completed before any subscription is offered.]'],
        ['[الحد الأدنى للمدة ومدة الإشعار ورسوم الإلغاء وقواعد الاسترداد وتسليم الحسابات والأصول والبيانات — بانتظار المراجعة القانونية. سيُستكمل هذا القسم قبل عرض أي اشتراك.]']
      )),
      sec('disputes', P('10. Disputes', '10. النزاعات'), P(
        ['[Dispute escalation and resolution — pending legal review.]'],
        ['[تصعيد النزاعات وتسويتها — بانتظار المراجعة القانونية.]']
      )),
    ],
  },

  {
    slug: 'data-processing',
    active: '',
    title: P('Data Processing Information', 'معلومات معالجة البيانات'),
    description: P('How lead data is handled: processing instructions, access controls, subprocessors, retention, deletion, export and incident response. Pending legal review.', 'كيفية التعامل مع بيانات العملاء المحتملين: تعليمات المعالجة وضوابط الوصول والمعالجات الفرعية والحفظ والحذف والتصدير والاستجابة للحوادث. بانتظار المراجعة القانونية.'),
    sections: [
      sec('roles', P('1. Roles', '1. الأدوار'), P(
        ['When you send us lead data to run your campaigns and lead operations, you are generally the controller and we act as your processor, processing data only on your documented instructions. The final roles will be confirmed in the data processing terms. [Controller/processor roles — pending legal review.]'],
        ['عندما ترسل لنا بيانات العملاء المحتملين لتشغيل حملاتك وعمليات العملاء، فأنت عادةً المسؤول عن المعالجة ونحن نعمل كمعالج نيابةً عنك، ونعالج البيانات وفق تعليماتك الموثقة فقط. تُؤكد الأدوار النهائية في شروط معالجة البيانات. [أدوار المسؤول والمعالج — بانتظار المراجعة القانونية.]']
      )),
      sec('categories', P('2. Data categories', '2. فئات البيانات'), P(
        ['Typical categories are contact details, enquiry content, source tags, qualification answers, status and follow-up notes. We ask you to avoid sensitive personal data unless it is necessary and lawful.'],
        ['تشمل الفئات المعتادة بيانات التواصل ومحتوى الاستفسار ووسوم المصدر وإجابات التأهيل والحالة وملاحظات المتابعة. نطلب منك تجنب البيانات الشخصية الحساسة إلا عندما تكون ضرورية ومشروعة.']
      )),
      sec('instructions', P('3. Processing instructions', '3. تعليمات المعالجة'), P(
        ['We process lead data only to perform the agreed service: organizing enquiries, applying your criteria, coordinating follow-up, producing reports and managing consent and opt-out status.'],
        ['نعالج بيانات العملاء المحتملين فقط لتنفيذ الخدمة المتفق عليها: تنظيم الاستفسارات وتطبيق معاييرك وتنسيق المتابعة وإعداد التقارير وإدارة حالات الموافقة وإلغاء الاشتراك.']
      )),
      sec('access', P('4. Access controls', '4. ضوابط الوصول'), P(
        ['Access is limited to authorized staff who need it for the service, using individual accounts, least privilege and audit logging of administrative actions. [Access-control implementation — to be verified in the deployment environment.]'],
        ['يقتصر الوصول على الموظفين المصرح لهم الذين يحتاجون إليه للخدمة، باستخدام حسابات فردية ومبدأ أقل الصلاحيات وتسجيل تدقيق للإجراءات الإدارية. [تنفيذ ضوابط الوصول — يُتحقق منه في بيئة النشر.]']
      )),
      sec('subprocessors', P('5. Subprocessors', '5. المعالجات الفرعية'), P(
        ['We use providers for hosting, email delivery and any CRM or scheduling tools you approve. A list of subprocessors, their locations and purposes will be provided on request and before data is shared with them. [Subprocessor list — pending confirmation of providers.]'],
        ['نستخدم مزودين للاستضافة وإرسال البريد وأي أدوات لإدارة العملاء أو الجدولة توافق عليها. ستُقدَّم قائمة المعالجات الفرعية ومواقعها وأغراضها عند الطلب، وقبل مشاركة البيانات معها. [قائمة المعالجات الفرعية — بانتظار تأكيد المزودين.]']
      )),
      sec('retention', P('6. Retention and deletion', '6. الحفظ والحذف'), P(
        ['Retention periods depend on the agreement and the purpose. On termination, data is returned or deleted as the agreement specifies, subject to legal retention obligations. [Retention schedule — pending legal review and business confirmation.]'],
        ['تعتمد مدد الحفظ على الاتفاق والغرض. وعند الإنهاء تُعاد البيانات أو تُحذف وفق الاتفاق، مع مراعاة التزامات الحفظ النظامية. [جدول الحفظ — بانتظار المراجعة القانونية وتأكيد النشاط.]']
      )),
      sec('export', P('7. Export and portability', '7. التصدير وإمكانية النقل'), P(
        ['Lead records can be exported in a common format on request, subject to identity checks and the agreement. [Export procedure — to be implemented and tested before launch.]'],
        ['يمكن تصدير سجلات العملاء بصيغة شائعة عند الطلب، رهناً بالتحقق من الهوية والاتفاق. [إجراء التصدير — يُنفذ ويُختبر قبل الإطلاق.]']
      )),
      sec('incidents', P('8. Security incidents', '8. الحوادث الأمنية'), P(
        ['We will notify you without undue delay of a personal data breach affecting your lead data, with the information needed for you to meet your own obligations. [Notification timeline — pending legal review.]'],
        ['سنُخطرك دون تأخير لا مبرر له بأي خرق للبيانات الشخصية يؤثر على بيانات عملائك المحتملين، مع المعلومات اللازمة لتفي بالتزاماتك. [الإطار الزمني للإخطار — بانتظار المراجعة القانونية.]']
      )),
    ],
  },

  {
    slug: 'advertising-disclaimer',
    active: '',
    title: P('Advertising and Performance Disclaimer', 'إخلاء المسؤولية عن الإعلانات والأداء'),
    description: P('Why marketing performance depends on factors outside our control, and why historical or illustrative metrics are not guarantees. Pending legal review.', 'لماذا يعتمد أداء التسويق على عوامل خارج نطاق سيطرتنا، ولماذا لا تُعد المؤشرات التاريخية أو التوضيحية ضماناً. بانتظار المراجعة القانونية.'),
    sections: [
      sec('no-guarantee', P('1. No guarantee of outcomes', '1. لا ضمان للنتائج'), P(
        ['We do not guarantee sales, revenue, lead volumes, cost per lead, return on advertising spend, ranking, delivery or approval of any advertisement by a platform.'],
        ['لا نضمن المبيعات أو الإيرادات أو أعداد العملاء المحتملين أو تكلفة العميل أو العائد على الإنفاق الإعلاني أو الترتيب أو تسليم أي إعلان أو موافقة المنصة عليه.']
      )),
      sec('factors', P('2. Factors outside our control', '2. عوامل خارج نطاق سيطرتنا'), P(
        ['Performance depends on factors including your offer and pricing, sales process and team, market conditions, competitor activity, seasonality, platform policies and algorithm changes, consumer decisions, and data quality.'],
        ['يعتمد الأداء على عوامل تشمل عرضك وتسعيرك وعملية البيع وفريقها وظروف السوق ونشاط المنافسين والموسمية وسياسات المنصات وتغيرات خوارزمياتها وقرارات المستهلكين وجودة البيانات.']
      )),
      sec('illustrative', P('3. Illustrative and historical metrics', '3. المؤشرات التوضيحية والتاريخية'), P(
        ['Dashboards, sample records and example calculations on this website use fictional or illustrative data. They show how reports are structured and are not customer results. Past or illustrative metrics do not guarantee future outcomes.'],
        ['تستخدم لوحات التقارير والسجلات النموذجية وأمثلة الحسابات على هذا الموقع بيانات خيالية أو توضيحية. وهي تبين كيفية تنظيم التقارير، وليست نتائج عملاء. ولا تضمن المؤشرات السابقة أو التوضيحية نتائج مستقبلية.']
      )),
      sec('attribution', P('4. Attribution and data limits', '4. حدود الإسناد والبيانات'), P(
        ['Not all enquiries and sales can be attributed to a specific campaign. Calls, messaging apps, offline interactions and repeat customers may be missing or misattributed. Platform-reported figures may differ from your CRM and sales records.'],
        ['لا يمكن إسناد كل الاستفسارات والمبيعات إلى حملة محددة. قد تكون المكالمات وتطبيقات المراسلة والتفاعلات خارج الإنترنت والعملاء المتكررون ناقصة أو منسوبة بشكل خاطئ. وقد تختلف الأرقام المعروضة من المنصات عن سجلاتك ومبيعاتك.']
      )),
      sec('responsibility', P('5. Your responsibilities', '5. مسؤولياتك'), P(
        ['You are responsible for the claims in your advertising, for compliance with advertising rules that apply to your sector, and for the accuracy of your offer and pricing.'],
        ['أنت مسؤول عن الادعاءات في إعلاناتك، وعن الامتثال لقواعد الإعلان المنطبقة على قطاعك، وعن دقة عرضك وأسعارك.']
      )),
      sec('case-studies', P('6. Case studies and testimonials', '6. دراسات الحالة والشهادات'), P(
        ['No testimonials or case studies are published at present. Any future case study will state the period, baseline, spend, sample size where relevant, method, limitations and the customer’s written authorization.'],
        ['لا تُنشر حالياً أي شهادات أو دراسات حالة. وستذكر أي دراسة حالة مستقبلية الفترة والخط الأساسي والإنفاق وحجم العينة عند الاقتضاء والطريقة والقيود وموافقة العميل الكتابية.']
      )),
    ],
  },
];

// Each legal page renders as one typed section (see renderers.legal in render.mjs).
export const legalPages = rawLegalPages.map((p) => ({
  ...p,
  sections: [{ type: 'legal', title: p.title, draftDate: DRAFT_DATE, sections: p.sections }],
}));

export const utilityPages = {
  notFound: {
    slug: '404',
    active: '',
    noindex: true,
    noAlternates: true,
    noMobileCta: true,
    title: P('Page not found', 'الصفحة غير موجودة'),
    description: P("We couldn't find that page. Return to the homepage or explore our services.", 'لم نتمكن من العثور على هذه الصفحة. يمكنك العودة إلى الصفحة الرئيسية أو استكشاف خدماتنا.'),
    sections: [
      {
        type: 'intro',
        title: P("We couldn't find that page.", 'لم نتمكن من العثور على هذه الصفحة.'),
        lead: P('Return to the homepage or explore our services.', 'يمكنك العودة إلى الصفحة الرئيسية أو استكشاف خدماتنا.'),
      },
      {
        type: 'links',
        title: P('Where would you like to go?', 'إلى أين تود الذهاب؟'),
        items: [
          { to: '', label: P('Home', 'الرئيسية'), text: P('Start from the beginning', 'ابدأ من البداية') },
          { to: 'services', label: P('Services', 'الخدمات'), text: P('Campaigns, leads, follow-up and analytics', 'الحملات والعملاء المحتملون والمتابعة والتحليلات') },
          { to: 'pricing', label: P('Pricing', 'الأسعار'), text: P('Provisional packages and exclusions', 'باقات مبدئية والمستثنيات') },
          { to: 'contact', label: P('Contact', 'تواصل معنا'), text: P('Send us a message', 'أرسل لنا رسالة') },
        ],
      },
    ],
  },

  maintenance: {
    slug: 'maintenance',
    active: '',
    noindex: true,
    noAlternates: true,
    noMobileCta: true,
    title: P('Temporarily unavailable', 'الخدمة غير متاحة مؤقتاً'),
    description: P('We are making improvements. Please try again shortly.', 'نعمل على إجراء تحسينات. يرجى المحاولة مرة أخرى بعد قليل.'),
    sections: [
      {
        type: 'intro',
        title: P("We're making improvements.", 'نعمل على إجراء تحسينات.'),
        lead: P('Please try again shortly.', 'يرجى المحاولة مرة أخرى بعد قليل.'),
      },
    ],
  },
};
