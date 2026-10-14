import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseWith, leadCreateSchema, taskSchema, proposalSchema, opportunityUpdateSchema, resetPasswordSchema } from '@/lib/validation/schemas';

const base = {
  first_name: 'Sara',
  email: 'Sara@Alpha.test',
  phone: '',
  source: 'referral',
  estimated_value: '1500',
};

describe('lead input', () => {
  it('normalises and stores the original source', () => {
    const r = parseWith(leadCreateSchema, base);
    assert.equal(r.ok, true);
    if (!r.ok) return;
    assert.equal(r.data.email_normalized, 'sara@alpha.test');
    assert.equal(r.data.original_source, 'referral');
    assert.equal(r.data.estimated_value_minor, 150000n);
  });

  it('requires at least one way to contact the lead', () => {
    const r = parseWith(leadCreateSchema, { ...base, email: '' });
    assert.equal(r.ok, false);
  });

  it('rejects a value with more than two decimals and a bad phone number', () => {
    const r = parseWith(leadCreateSchema, { ...base, estimated_value: '12.345', phone: '12' });
    assert.equal(r.ok, false);
    if (r.ok) return;
    assert.ok(r.errors.estimated_value);
    assert.ok(r.errors.phone);
  });

  it('rejects an unknown source', () => {
    const r = parseWith(leadCreateSchema, { ...base, source: 'bought_list' });
    assert.equal(r.ok, false);
  });
});

describe('follow-up input', () => {
  it('converts the local due time to an ISO instant and requires a link', () => {
    const ok = parseWith(taskSchema, { title: 'Call Omar', due_local: '2026-10-15T10:00', lead_id: '10000000-0000-4000-8000-000000000002' });
    assert.equal(ok.ok, true);
    if (ok.ok) assert.equal(ok.data.due_at, '2026-10-15T07:00:00.000Z');
    const unlinked = parseWith(taskSchema, { title: 'Call Omar', due_local: '2026-10-15T10:00' });
    assert.equal(unlinked.ok, false);
  });
});

describe('proposal input', () => {
  const good = {
    opportunity_id: '20000000-0000-4000-8000-000000000001',
    title: 'Growth proposal',
    service_package: 'growth',
    scope_of_work: 'Monthly marketing operations for one brand.',
    monthly_fee: '3000',
    setup_fee: '0',
  };

  it('stores fees as minor units and accepts a fee at the package price', () => {
    const r = parseWith(proposalSchema, good);
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.data.recurring_fee_minor, 300000n);
  });

  it('rejects a monthly fee below the package starting price', () => {
    const r = parseWith(proposalSchema, { ...good, monthly_fee: '2500' });
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.errors.monthly_fee, /starts at/);
  });

  it('does not include advertising spend in any fee field', () => {
    const r = parseWith(proposalSchema, good);
    assert.equal(r.ok && Object.keys(r.data).some((k) => k.includes('ad_')), false);
  });
});

describe('opportunity input', () => {
  it('requires a loss reason when the deal is lost, and a final value when it is won', () => {
    const lost = parseWith(opportunityUpdateSchema, { stage: 'closed_lost', amount: '', probability_pct: '', next_action: '', loss_reason: '', final_value: '', expected_close_date: '' });
    assert.equal(lost.ok, false);
    const won = parseWith(opportunityUpdateSchema, { stage: 'closed_won', amount: '', probability_pct: '', next_action: '', loss_reason: '', final_value: '', expected_close_date: '' });
    assert.equal(won.ok, false);
    const wonOk = parseWith(opportunityUpdateSchema, { stage: 'closed_won', amount: '', probability_pct: '', next_action: '', loss_reason: '', final_value: '1500', expected_close_date: '' });
    assert.equal(wonOk.ok, true);
  });

  it('keeps probability within 0 to 100', () => {
    const r = parseWith(opportunityUpdateSchema, { stage: 'negotiation', amount: '', probability_pct: '150', next_action: '', loss_reason: '', final_value: '', expected_close_date: '' });
    assert.equal(r.ok, false);
  });
});

describe('password input', () => {
  it('requires matching passwords that meet the policy', () => {
    assert.equal(parseWith(resetPasswordSchema, { password: 'correct horse battery', confirm: 'different horse battery' }).ok, false);
    assert.equal(parseWith(resetPasswordSchema, { password: 'correct horse battery', confirm: 'correct horse battery' }).ok, true);
  });
});
