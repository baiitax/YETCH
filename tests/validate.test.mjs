import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSubmission } from '../src/server/validate.mjs';

const validContact = {
  formType: 'contact',
  lang: 'en',
  enquiryType: 'consultation',
  name: 'Omar Test',
  businessName: 'Test Co',
  workEmail: 'Omar@Example.com',
  preferredLanguage: 'en',
  industry: 'other',
  challenge: 'We want to organise enquiries and follow-up.',
  privacyAck: 'true',
};

test('accepts a valid contact submission and normalises email', () => {
  const r = validateSubmission(validContact);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.formType, 'contact');
  assert.equal(r.data.workEmail, 'omar@example.com');
  assert.equal(r.data.privacyAck, true);
});

test('reports machine codes for missing required fields', () => {
  const r = validateSubmission({ formType: 'contact', lang: 'en' });
  assert.equal(r.ok, false);
  assert.equal(r.status, 400);
  assert.equal(r.fields.name, 'required');
  assert.equal(r.fields.privacyAck, 'mustBeTrue');
});

test('rejects malformed email and phone', () => {
  const r = validateSubmission({ ...validContact, workEmail: 'nope', phone: '12' });
  assert.equal(r.fields.workEmail, 'email');
  assert.equal(r.fields.phone, 'phone');
});

test('normalises a valid Saudi mobile number to +digits', () => {
  const r = validateSubmission({ ...validContact, phone: '+966 50 123 4567' });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.data.phone, '+966501234567');
});

test('filled honeypot is rejected without field detail', () => {
  const r = validateSubmission({ ...validContact, company_fax: 'http://spam' });
  assert.equal(r.ok, false);
  assert.equal(r.error, 'rejected');
});

test('credential-like fields are refused outright', () => {
  const r = validateSubmission({ ...validContact, adPassword: 'hunter2' });
  assert.equal(r.error, 'forbidden_field');
});

test('unknown form type and non-object bodies are refused', () => {
  assert.equal(validateSubmission({ formType: 'admin' }).error, 'unknown_form');
  assert.equal(validateSubmission(null).status, 400);
  assert.equal(validateSubmission([]).status, 400);
});

test('group values must come from the allowed options', () => {
  const r = validateSubmission({ formType: 'get-started', lang: 'en', goals: ['world-domination'] });
  assert.equal(r.fields.goals, 'enum');
});

test('Arabic language flag is preserved', () => {
  const r = validateSubmission({ ...validContact, lang: 'ar' });
  assert.equal(r.lang, 'ar');
});
