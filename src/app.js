/* Progressive enhancement only. Every page works without this script:
   links, details/summary accordions and native form submission fallbacks are in the HTML. */
(function () {
  'use strict';

  var html = document.documentElement;
  var lang = (html.getAttribute('lang') || 'en').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
  var isAr = lang === 'ar';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var MSG = {
    en: {
      required: 'This field is required.',
      select: 'Please choose an option.',
      email: 'Enter a valid email address, for example name@company.com.',
      phone: 'Enter a phone number with country code, for example +966 5X XXX XXXX.',
      url: 'Enter a valid web address starting with https://',
      min: 'Please enter at least {n} characters.',
      max: 'Please keep this under {n} characters.',
      mustBeTrue: 'You need to confirm this to continue.',
      group: 'Select at least one option.',
      enum: 'Please choose one of the listed options.',
      unknown: 'Please check this field.',
      step: 'Step',
      of: 'of',
      progress: 'Progress',
      submitting: 'Submitting…',
      submit: 'Submit',
      success: 'Your enquiry has been received.',
      successBody: 'We will review the information you provided. This is not a confirmation of a booking, a subscription or an active service.',
      ref: 'Reference',
      notifPending: 'Our team notification is pending configuration; we will review your submission manually.',
      notifSent: 'Our team has been notified.',
      errorsTitle: 'Please correct the highlighted fields.',
      network: 'We could not send your submission. Please check your connection and try again. Your information has not been lost from this form.',
      server: 'Something went wrong on our side. Please try again later.',
      rate: 'Too many submissions were received from your connection. Please wait a few minutes and try again.',
      unavailable: 'The service is temporarily unavailable. Please try again shortly.',
      review: 'Review your answers before submitting.',
      noResults: 'No questions match your search. Try different words or contact us.',
      noArticles: 'No articles match your search.',
      countOne: '1 result',
      countMany: '{n} results',
      all: 'All',
      refLabel: 'Reference'
    },
    ar: {
      required: 'هذا الحقل مطلوب.',
      select: 'يرجى اختيار خيار.',
      email: 'أدخل بريداً إلكترونياً صالحاً، مثل name@company.com.',
      phone: 'أدخل رقم هاتف مع رمز الدولة، مثل ‎+966 5X XXX XXXX.',
      url: 'أدخل عنواناً إلكترونياً صالحاً يبدأ بـ https://',
      min: 'يرجى إدخال {n} أحرف على الأقل.',
      max: 'يرجى ألا يتجاوز النص {n} حرفاً.',
      mustBeTrue: 'يجب تأكيد هذا البند للمتابعة.',
      group: 'اختر خياراً واحداً على الأقل.',
      enum: 'يرجى اختيار أحد الخيارات المعروضة.',
      unknown: 'يرجى مراجعة هذا الحقل.',
      step: 'الخطوة',
      of: 'من',
      progress: 'التقدم',
      submitting: 'جارٍ الإرسال…',
      submit: 'إرسال',
      success: 'تم استلام استفسارك.',
      successBody: 'سنراجع المعلومات التي قدمتها. هذا لا يعني تأكيد حجز أو اشتراك أو تفعيل خدمة.',
      ref: 'رقم المرجع',
      notifPending: 'إشعار الفريق قيد الإعداد، وسنراجع طلبك يدوياً.',
      notifSent: 'تم إخطار فريقنا.',
      errorsTitle: 'يرجى تصحيح الحقول المحددة.',
      network: 'تعذّر إرسال طلبك. يرجى التحقق من الاتصال والمحاولة مرة أخرى. لم تُفقد بياناتك من هذا النموذج.',
      server: 'حدث خطأ من جهتنا. يرجى المحاولة لاحقاً.',
      rate: 'وردت طلبات كثيرة من اتصالك. يرجى الانتظار بضع دقائق ثم المحاولة مجدداً.',
      unavailable: 'الخدمة غير متاحة مؤقتاً. يرجى المحاولة مرة أخرى بعد قليل.',
      review: 'راجع إجاباتك قبل الإرسال.',
      noResults: 'لا توجد أسئلة تطابق بحثك. جرّب كلمات أخرى أو تواصل معنا.',
      noArticles: 'لا توجد مقالات تطابق بحثك.',
      countOne: 'نتيجة واحدة',
      countMany: '{n} نتيجة',
      all: 'الكل',
      refLabel: 'رقم المرجع'
    }
  };
  var T = MSG[lang];

  function fmtNum(n) {
    try { return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-GB').format(n); } catch (e) { return String(n); }
  }
  function tpl(s, n) { return s.replace('{n}', fmtNum(n)); }

  // ---------- reveal on scroll ----------
  function revealAll() {
    document.querySelectorAll('.reveal, [data-animate-workflow]').forEach(function (el) { el.classList.add('is-visible'); });
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal, [data-animate-workflow]').forEach(function (el) { io.observe(el); });
  } else {
    revealAll();
  }

  // ---------- mega menu ----------
  var megas = document.querySelectorAll('[data-mega]');
  function closeMegas(except) {
    megas.forEach(function (li) {
      if (li === except) return;
      var btn = li.querySelector('[data-mega-toggle]');
      var panel = li.querySelector('.mega');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
      li.classList.remove('is-open');
    });
  }
  megas.forEach(function (li) {
    var btn = li.querySelector('[data-mega-toggle]');
    var panel = li.querySelector('.mega');
    if (!btn || !panel) return;
    function open(v) {
      closeMegas(li);
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      panel.hidden = !v;
      li.classList.toggle('is-open', v);
    }
    btn.addEventListener('click', function () { open(panel.hidden); });
    // Hover opens on fine pointers only; click still works everywhere.
    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      li.addEventListener('pointerenter', function () { open(true); });
      li.addEventListener('pointerleave', function () { open(false); });
    }
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); }
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('[data-mega]')) closeMegas(null);
  });

  // ---------- mobile drawer ----------
  var drawerBtn = document.querySelector('[data-drawer-toggle]');
  var drawer = document.querySelector('[data-drawer]');
  function setDrawer(open) {
    if (!drawerBtn || !drawer) return;
    drawerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.hidden = !open;
    var label = drawerBtn.querySelector('[data-menu-label]');
    if (label) label.textContent = open ? T_NAV.close : T_NAV.open;
    if (open) document.body.classList.add('drawer-open'); else document.body.classList.remove('drawer-open');
  }
  var T_NAV = isAr ? { open: 'فتح القائمة', close: 'إغلاق القائمة' } : { open: 'Open menu', close: 'Close menu' };
  if (drawerBtn && drawer) {
    drawerBtn.addEventListener('click', function () { setDrawer(drawer.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!drawer.hidden) { setDrawer(false); drawerBtn.focus(); }
        closeMegas(null);
      }
    });
    // Close the drawer after navigating within it (page change makes this moot, but anchors need it).
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setDrawer(false); });
    // Reset when resizing to desktop.
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (m) { if (m.matches) setDrawer(false); });
  }

  // ---------- FAQ / article filter ----------
  document.querySelectorAll('[data-faq-search]').forEach(function (root) {
    var input = root.querySelector('[data-faq-input]');
    var chips = root.querySelectorAll('[data-cat-chip]');
    var count = root.querySelector('[data-faq-count]');
    var section = root.closest('section') || document;
    var list = section.querySelector('[data-faq-list]');
    var empty = section.querySelector('[data-faq-empty]');
    var items = list ? list.querySelectorAll('[data-faq-item]') : [];
    var cat = '';
    function apply() {
      var q = (input.value || '').trim().toLowerCase();
      var shown = 0;
      items.forEach(function (it) {
        var okText = !q || (it.getAttribute('data-search') || '').indexOf(q) !== -1;
        var okCat = !cat || it.getAttribute('data-cat') === cat;
        var ok = okText && okCat;
        it.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.classList.toggle('hidden', shown > 0);
      if (count) count.textContent = shown === 1 ? T.countOne : tpl(T.countMany, shown);
    }
    input.addEventListener('input', apply);
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        cat = c.getAttribute('data-cat-chip') || '';
        chips.forEach(function (x) { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        apply();
      });
    });
    apply();
  });

  // ---------- forms ----------
  var schemaPromise = null;
  function loadSchema() {
    if (!schemaPromise) {
      schemaPromise = fetch('/assets/forms.json', { credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .catch(function () { return null; });
    }
    return schemaPromise;
  }

  function fieldEls(form, name) {
    return form.querySelectorAll('[name="' + name + '"]');
  }

  function errorBox(form, name) {
    return form.querySelector('#f-' + form.getAttribute('data-form') + '-' + name + '-error');
  }

  // Message text for a code. min/max messages need the field's own limit.
  function msgFor(form, name, code) {
    var f = form.__fields && form.__fields[name];
    var n = f ? (code === 'min' ? f.min : code === 'max' ? f.max : 0) : 0;
    return T[code] !== undefined ? tpl(T[code], n || 0) : T.unknown;
  }

  function setFieldError(form, name, code) {
    var box = errorBox(form, name);
    var controls = fieldEls(form, name);
    var msg = code ? msgFor(form, name, code) : '';
    controls.forEach(function (c) {
      if (code) c.setAttribute('aria-invalid', 'true'); else c.removeAttribute('aria-invalid');
    });
    if (box) {
      box.textContent = msg;
      box.hidden = !code;
    }
  }

  function clearErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });
    form.querySelectorAll('.field-error').forEach(function (b) { b.textContent = ''; b.hidden = true; });
    var sum = form.querySelector('[data-form-summary]');
    if (sum) sum.hidden = true;
  }

  function getValue(form, f) {
    if (f.type === 'checkbox-group') {
      return Array.prototype.map.call(fieldEls(form, f.name), function (c) { return c.checked ? c.value : null; }).filter(Boolean);
    }
    if (f.type === 'checkbox') {
      var c = form.querySelector('[name="' + f.name + '"]');
      return c && c.checked ? 'true' : '';
    }
    var el = form.querySelector('[name="' + f.name + '"]');
    return el ? String(el.value || '').trim() : '';
  }

  // Mirrors server rules (src/server/validate.mjs). The server remains authoritative.
  function checkField(f, v) {
    if (f.type === 'checkbox-group') {
      if (f.required && (!v || !v.length)) return 'group';
      return null;
    }
    if (f.type === 'checkbox') {
      if (f.required && f.mustBeTrue && v !== 'true') return 'mustBeTrue';
      return null;
    }
    if (f.required && !v) return f.type === 'select' ? 'select' : 'required';
    if (!v) return null;
    if (f.type === 'select') {
      var ok = (f.options || []).some(function (o) { return o.value === v; });
      return ok ? null : 'enum';
    }
    if (f.min && v.length < f.min) return { code: 'min', n: f.min };
    if (f.max && v.length > f.max) return { code: 'max', n: f.max };
    if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'email';
    if (f.pattern === 'phone' && !/^\+[1-9][0-9]{6,14}$/.test(v.replace(/[\s-]/g, ''))) return 'phone';
    if (f.type === 'url') {
      try { var u = new URL(v); if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'url'; } catch (e) { return 'url'; }
    }
    return null;
  }

  function validateFields(form, schema, fields) {
    clearErrors(form);
    var problems = [];
    fields.forEach(function (f) {
      var v = getValue(form, f);
      var res = checkField(f, v);
      if (res) {
        var code = typeof res === 'string' ? res : res.code;
        setFieldError(form, f.name, code);
        problems.push({ name: f.name, code: code });
      }
    });
    return problems;
  }

  function summarize(form, problems) {
    var sum = form.querySelector('[data-form-summary]');
    var list = form.querySelector('[data-form-summary-list]');
    if (!sum || !list) return;
    list.textContent = '';
    problems.forEach(function (p) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#f-' + form.getAttribute('data-form') + '-' + p.name;
      a.textContent = (labelOf(form, p.name) || p.name) + ': ' + msgFor(form, p.name, p.code);
      li.appendChild(a);
      list.appendChild(li);
    });
    sum.hidden = false;
    sum.focus();
  }

  function labelOf(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return '';
    var fs = el.closest('fieldset');
    if (fs && fs.querySelector('legend')) return fs.querySelector('legend').textContent.replace(/\(.*?\)/g, '').trim();
    var lab = form.querySelector('label[for="' + el.id + '"]');
    return lab ? lab.textContent.replace(/\(.*?\)/g, '').trim() : '';
  }

  function collect(form, schema) {
    var data = {};
    var fields = schema.fields || (schema.steps || []).reduce(function (a, s) { return a.concat(s.fields); }, []);
    fields.forEach(function (f) { data[f.name] = getValue(form, f); });
    data.formType = form.querySelector('[name="formType"]').value;
    data.lang = lang;
    var hp = form.querySelector('[name="company_fax"]');
    data.company_fax = hp ? hp.value : '';
    return data;
  }

  function setStatus(form, text, kind) {
    var st = form.querySelector('[data-form-status]');
    if (!st) return;
    st.textContent = text || '';
    st.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  function showSuccess(form, body) {
    var ok = form.querySelector('[data-success]');
    if (!ok) return;
    ok.querySelector('[data-success-ref]').textContent = body.reference || '';
    var notice = ok.querySelector('[data-success-notice]');
    notice.textContent = body.notification === 'sent' ? T.notifSent : T.notifPending;
    form.querySelectorAll('.form-fields, .form-actions, .wizard-step, .progress-wrap, [data-form-summary], [data-form-status], .form-status, .hp').forEach(function (el) { el.hidden = true; });
    ok.hidden = false;
    ok.focus();
    try { ok.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); } catch (e) {}
  }

  function submitForm(form, schema, submitBtn) {
    var fields = schema.fields || (schema.steps || []).reduce(function (a, s) { return a.concat(s.fields); }, []);
    var problems = validateFields(form, schema, fields);
    if (problems.length) {
      summarize(form, problems);
      setStatus(form, T.errorsTitle, 'error');
      var first = form.querySelector('[aria-invalid="true"]');
      if (first && first.focus) first.focus();
      return;
    }
    var original = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.textContent = T.submitting;
    setStatus(form, '', '');

    fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(collect(form, schema))
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) { return { status: r.status, body: body }; });
    }).then(function (res) {
      var b = res.body || {};
      if (res.status === 200 && b.ok) {
        showSuccess(form, b);
        return;
      }
      if (res.status === 400 && b.fields) {
        var probs = Object.keys(b.fields).map(function (k) { return { name: k, code: b.fields[k] }; });
        probs.forEach(function (p) { setFieldError(form, p.name, p.code); });
        summarize(form, probs);
        setStatus(form, T.errorsTitle, 'error');
        return;
      }
      if (res.status === 429) return setStatus(form, T.rate, 'error');
      if (res.status === 503) return setStatus(form, T.unavailable, 'error');
      setStatus(form, T.server, 'error');
    }).catch(function () {
      setStatus(form, T.network, 'error');
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.textContent = original;
    });
  }

  function wizard(form, schema) {
    var steps = Array.prototype.slice.call(form.querySelectorAll('.wizard-step'));
    var pills = form.querySelectorAll('[data-step-pill]');
    var bar = form.querySelector('[data-progress] span');
    var barWrap = form.querySelector('[data-progress]');
    var progressText = form.querySelector('[data-progress-text]');
    var current = 0;
    var total = steps.length;

    // Prefill plan from ?package=
    var pkg = new URLSearchParams(window.location.search).get('package');
    if (pkg) {
      var sel = form.querySelector('[name="preferredPackage"]');
      if (sel && Array.prototype.some.call(sel.options, function (o) { return o.value === pkg; })) sel.value = pkg;
    }

    function stepFields(i) {
      var s = schema.steps[i];
      return s.review ? [] : s.fields;
    }

    function show(i) {
      current = i;
      steps.forEach(function (s, idx) { s.hidden = idx !== i; });
      pills.forEach(function (p, idx) {
        p.classList.toggle('is-current', idx === i);
        p.classList.toggle('is-done', idx < i);
      });
      var pct = Math.round(((i + 1) / total) * 100);
      if (bar) bar.style.width = pct + '%';
      if (barWrap) barWrap.setAttribute('aria-valuenow', String(i + 1));
      if (progressText) progressText.textContent = fmtNum(i + 1) + ' / ' + fmtNum(total);
      if (schema.steps[i].review) fillReview();
      var heading = steps[i].querySelector('legend .h4');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: false }); }
      setStatus(form, '', '');
    }

    function fillReview() {
      var list = form.querySelector('[data-review-list]');
      if (!list) return;
      list.textContent = '';
      schema.steps.forEach(function (s, si) {
        if (s.review) return;
        s.fields.forEach(function (f) {
          var v = getValue(form, f);
          if (f.type === 'checkbox' || f.type === 'checkbox-group') {
            if (f.type === 'checkbox' && !v) return;
            if (f.type === 'checkbox-group' && !v.length) return;
          }
          var display;
          if (Array.isArray(v)) {
            display = v.map(function (val) {
              var o = (f.options || []).filter(function (x) { return x.value === val; })[0];
              return o ? (isAr ? o.label.ar : o.label.en) : val;
            }).join(isAr ? '، ' : ', ');
          } else if (f.type === 'select') {
            var opt = (f.options || []).filter(function (x) { return x.value === v; })[0];
            display = opt ? (isAr ? opt.label.ar : opt.label.en) : '';
          } else if (f.type === 'checkbox') {
            display = v ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No');
          } else {
            display = v;
          }
          if (!display) return;
          var wrap = document.createElement('div');
          var dt = document.createElement('dt');
          dt.textContent = isAr ? (f.label.ar || '') : (f.label.en || '');
          var dd = document.createElement('dd');
          dd.textContent = display;
          wrap.appendChild(dt); wrap.appendChild(dd);
          list.appendChild(wrap);
        });
      });
    }

    form.querySelectorAll('[data-next]').forEach(function (b) {
      b.addEventListener('click', function () {
        var probs = validateFields(form, schema, stepFields(current));
        if (probs.length) {
          summarize(form, probs);
          setStatus(form, T.errorsTitle, 'error');
          var first = form.querySelector('.wizard-step:not([hidden]) [aria-invalid="true"]');
          if (first) first.focus();
          return;
        }
        show(Math.min(current + 1, total - 1));
      });
    });
    form.querySelectorAll('[data-prev]').forEach(function (b) {
      b.addEventListener('click', function () { clearErrors(form); show(Math.max(current - 1, 0)); });
    });
    pills.forEach(function (p, idx) {
      p.style.cursor = 'pointer';
      p.addEventListener('click', function () { if (idx <= current) show(idx); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[data-submit]');
      // Validate every step before submitting; jump to the first invalid one.
      for (var i = 0; i < total - 1; i++) {
        var probs = validateFields(form, schema, stepFields(i));
        if (probs.length) {
          show(i);
          summarize(form, probs);
          setStatus(form, T.errorsTitle, 'error');
          return;
        }
      }
      var finalFields = schema.steps[total - 1].fields;
      var fp = validateFields(form, schema, finalFields);
      if (fp.length) { summarize(form, fp); setStatus(form, T.errorsTitle, 'error'); return; }
      submitForm(form, { fields: schema.steps.reduce(function (a, s) { return a.concat(s.fields); }, []) }, btn);
    });

    show(0);
  }

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    loadSchema().then(function (all) {
      if (!all) return;
      var id = form.getAttribute('data-form');
      var schema = all[id];
      if (!schema) return;
      // Index fields by name so messages can use each field's limits.
      var index = {};
      (schema.fields || []).concat((schema.steps || []).reduce(function (a, s) { return a.concat(s.fields); }, [])).forEach(function (f) { index[f.name] = f; });
      form.__fields = index;
      if (form.hasAttribute('data-wizard')) {
        wizard(form, schema);
        return;
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitForm(form, schema, form.querySelector('[data-submit]'));
      });
    });
  });
})();
