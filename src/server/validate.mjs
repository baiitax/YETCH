// Server-side validation. Authoritative: the browser checks are only UX.
// Returns machine-readable codes (not prose) so the browser localizes messages.
import { FORMS, FORBIDDEN_FIELD_NAMES, HONEYPOT_FIELD, allFields } from '../forms.mjs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+[1-9][0-9]{6,14}$/;
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function cleanText(v) {
  return String(v).replace(CONTROL_RE, '').replace(/\r\n?/g, '\n').trim();
}

// Returns { ok: true, formType, lang, data } or { ok: false, status, fields?, error? }
export function validateSubmission(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, status: 400, error: 'invalid_body' };
  }

  // Refuse anything that looks like a credential or payment field, outright.
  for (const key of Object.keys(body)) {
    if (FORBIDDEN_FIELD_NAMES.some((f) => f.toLowerCase() === key.toLowerCase())) {
      return { ok: false, status: 400, error: 'forbidden_field' };
    }
  }

  const formType = body.formType;
  const form = Object.prototype.hasOwnProperty.call(FORMS, formType) ? FORMS[formType] : null;
  if (!form) return { ok: false, status: 400, error: 'unknown_form' };

  const lang = body.lang === 'ar' ? 'ar' : 'en';

  // Honeypot: a filled hidden field marks an automated submission. Reject truthfully, store nothing.
  if (body[HONEYPOT_FIELD] && String(body[HONEYPOT_FIELD]).trim() !== '') {
    return { ok: false, status: 400, error: 'rejected' };
  }

  const fields = allFields(form);
  const data = {};
  const errors = {};

  for (const f of fields) {
    const raw = body[f.name];

    if (f.type === 'checkbox-group') {
      const list = Array.isArray(raw) ? raw : raw === undefined || raw === '' ? [] : [raw];
      const allowed = new Set((f.options || []).map((o) => o.value));
      const values = [];
      let bad = false;
      for (const v of list) {
        const s = cleanText(v);
        if (!allowed.has(s)) bad = true;
        else if (!values.includes(s)) values.push(s);
      }
      if (bad) { errors[f.name] = 'enum'; continue; }
      if (f.required && values.length === 0) { errors[f.name] = 'group'; continue; }
      data[f.name] = values;
      continue;
    }

    if (f.type === 'checkbox') {
      const on = raw === true || raw === 'true' || raw === 'on';
      if (f.required && f.mustBeTrue && !on) { errors[f.name] = 'mustBeTrue'; continue; }
      data[f.name] = on;
      continue;
    }

    if (raw !== undefined && typeof raw !== 'string') {
      errors[f.name] = 'unknown';
      continue;
    }

    let value = cleanText(raw ?? '');

    if (value === '') {
      if (f.required) errors[f.name] = f.type === 'select' ? 'select' : 'required';
      else data[f.name] = '';
      continue;
    }

    if (f.type === 'select') {
      if (!(f.options || []).some((o) => o.value === value)) { errors[f.name] = 'enum'; continue; }
      data[f.name] = value;
      continue;
    }

    if (f.min && value.length < f.min) { errors[f.name] = 'min'; continue; }
    if (f.max && value.length > f.max) { errors[f.name] = 'max'; continue; }

    if (f.type === 'email') {
      if (!EMAIL_RE.test(value)) { errors[f.name] = 'email'; continue; }
      value = value.toLowerCase();
    }

    if (f.pattern === 'phone') {
      const normalized = value.replace(/[\s-]/g, '');
      if (!PHONE_RE.test(normalized)) { errors[f.name] = 'phone'; continue; }
      value = normalized;
    }

    if (f.type === 'url') {
      try {
        const u = new URL(value);
        if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('scheme');
        value = u.toString();
      } catch {
        errors[f.name] = 'url';
        continue;
      }
    }

    data[f.name] = value;
  }

  if (Object.keys(errors).length) {
    return { ok: false, status: 400, fields: errors };
  }

  return { ok: true, formType, lang, data };
}
