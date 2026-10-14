import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseMoneyToMinor, formatMinor, minorToInput, sumByCurrency } from '@/lib/domain/money';
import { normalizeEmail, normalizePhone } from '@/lib/domain/contact';
import { canLeadMove, canOpportunityMove, canProposalMove, LEAD_STATUSES } from '@/lib/domain/lifecycle';
import { can, ROLES, CAPABILITIES, ROLE_CAPABILITIES, type Role } from '@/lib/domain/rbac';
import { ratio, leadFunnel, sourceBreakdown, proposalAcceptance, averageWonValue, pipeline } from '@/lib/domain/metrics';
import { taskTimeState, localInputToIso, dayKey } from '@/lib/domain/time';
import { safeNextPath, passwordProblem } from '@/lib/security';

describe('money', () => {
  it('parses decimal SAR text into exact halalas', () => {
    assert.equal(parseMoneyToMinor('1500'), 150000n);
    assert.equal(parseMoneyToMinor('1,500.5'), 150050n);
    assert.equal(parseMoneyToMinor('1500.00'), 150000n);
    assert.equal(parseMoneyToMinor('0.1'), 10n);
    assert.equal(parseMoneyToMinor('0'), 0n);
  });

  it('rejects text that is not a money amount', () => {
    for (const bad of ['', '1.234', '-5', '12e3', 'SAR 100', '1,50,0.5x', '.5']) {
      assert.equal(parseMoneyToMinor(bad), null, `should reject ${JSON.stringify(bad)}`);
    }
  });

  it('caps amounts so minor units stay exact in JavaScript numbers', () => {
    assert.equal(parseMoneyToMinor('9999999999999'), 999999999999900n);
    assert.equal(parseMoneyToMinor('99999999999999'), null, '14 whole digits is over the cap');
    assert.ok(Number(parseMoneyToMinor('9999999999999')!) < Number.MAX_SAFE_INTEGER);
  });

  it('keeps precision that floating point would lose', () => {
    // 0.1 + 0.2 is not exactly 0.3 in floating point; in minor units it is exact.
    const total = sumByCurrency([
      { amountMinor: parseMoneyToMinor('0.1')!, currency: 'SAR' },
      { amountMinor: parseMoneyToMinor('0.2')!, currency: 'SAR' },
    ]);
    assert.equal(total.SAR, 30n);
  });

  it('formats and converts back to form input', () => {
    assert.equal(formatMinor(150000n), 'SAR 1,500.00');
    assert.equal(formatMinor(123456789n), 'SAR 1,234,567.89');
    assert.equal(formatMinor(-5n), '-SAR 0.05');
    assert.equal(minorToInput(150050n), '1500.50');
    assert.equal(minorToInput(null), '');
  });

  it('never mixes currencies in a sum', () => {
    const totals = sumByCurrency([
      { amountMinor: 100n, currency: 'SAR' },
      { amountMinor: 200n, currency: 'USD' },
      { amountMinor: 50n, currency: 'SAR' },
    ]);
    assert.deepEqual(totals, { SAR: 150n, USD: 200n });
  });
});

describe('contact normalisation', () => {
  it('normalises email case and whitespace, and rejects malformed addresses', () => {
    assert.equal(normalizeEmail('  Sara@Alpha.TEST '), 'sara@alpha.test');
    assert.equal(normalizeEmail('not-an-email'), null);
    assert.equal(normalizeEmail('a b@x.test'), null);
    assert.equal(normalizeEmail(''), null);
  });

  it('normalises Saudi and international phone numbers to E.164', () => {
    assert.equal(normalizePhone('05 1234 5678'), '+966512345678');
    assert.equal(normalizePhone('+966 50 000 0002'), '+966500000002');
    assert.equal(normalizePhone('009665 0000 0003'), '+966500000003');
    assert.equal(normalizePhone('966500000004'), '+966500000004', 'Saudi country code without plus is read as international');
    assert.equal(normalizePhone('500000004'), null, 'a bare national number without a country code is ambiguous');
    assert.equal(normalizePhone('abc'), null);
    assert.equal(normalizePhone('+0123'), null);
  });
});

describe('lifecycle', () => {
  it('forbids qualifying a lead straight from new', () => {
    assert.equal(canLeadMove('new', 'qualified'), false);
    assert.equal(canLeadMove('contacted', 'qualified'), true);
  });

  it('treats converted and disqualified-final states as the lifecycle requires', () => {
    assert.equal(canLeadMove('converted_customer', 'new'), false);
    assert.equal(canLeadMove('disqualified', 'nurture'), true);
    assert.equal(LEAD_STATUSES.length, 10);
  });

  it('only reaches won from a late open stage, and never reopens a won deal', () => {
    assert.equal(canOpportunityMove('qualification', 'closed_won'), false);
    assert.equal(canOpportunityMove('negotiation', 'closed_won'), true);
    assert.equal(canOpportunityMove('closed_won', 'negotiation'), false);
  });

  it('follows the proposal path and keeps accepted as a final record', () => {
    assert.equal(canProposalMove('draft', 'approved'), false, 'drafts must go through review');
    assert.equal(canProposalMove('internal_review', 'approved'), true);
    assert.equal(canProposalMove('sent', 'accepted'), true);
    assert.equal(canProposalMove('accepted', 'rejected'), false);
  });
});

describe('role capabilities', () => {
  it('denies everything to signed-out or inactive users', () => {
    assert.equal(can(null, 'leads.read'), false);
    assert.equal(can(undefined, 'leads.read'), false);
  });

  it('gives only founders user management and the audit log', () => {
    for (const role of ROLES) {
      const expected = role === 'founder';
      assert.equal(can(role, 'users.manage'), expected, `${role} users.manage`);
      assert.equal(can(role, 'audit.read'), expected, `${role} audit.read`);
    }
  });

  it('keeps proposal approval and acceptance away from sales', () => {
    assert.equal(can('sales_executive', 'proposals.approve'), false);
    assert.equal(can('sales_executive', 'proposals.record_acceptance'), false);
    assert.equal(can('commercial_manager', 'proposals.approve'), true);
  });

  it('lets only founders and managers reassign leads', () => {
    for (const role of ROLES) {
      assert.equal(can(role, 'leads.assign'), role === 'founder' || role === 'commercial_manager', role);
    }
  });

  it('makes reviewers read-only', () => {
    const writes = [...ROLE_CAPABILITIES.reviewer].filter((c) => /\.(write|convert|delete|approve|close_won|update|manage)$/.test(c));
    assert.deepEqual(writes, []);
  });

  it('defines every capability used by a role', () => {
    for (const role of ROLES as readonly Role[]) {
      for (const cap of ROLE_CAPABILITIES[role]) assert.ok(CAPABILITIES.includes(cap));
    }
  });
});

describe('metrics', () => {
  it('shows N/A instead of dividing by zero', () => {
    const r = ratio(3, 0);
    assert.equal(r.percent, null);
    assert.equal(r.display, 'N/A');
    assert.equal(ratio(1, 4).display, '25.0%');
  });

  it('computes the lead funnel for the cohort in the window, with N/A when no lead was qualified', () => {
    const from = new Date('2026-10-01T00:00:00Z');
    const to = new Date('2026-11-01T00:00:00Z');
    const empty = leadFunnel([], from, to);
    assert.equal(empty.qualifiedToWonRate.display, 'N/A');
    assert.equal(empty.qualificationRate.display, 'N/A');

    const sample = leadFunnel(
      [
        { createdAt: new Date('2026-10-05T00:00:00Z'), qualifiedAt: new Date('2026-10-06T00:00:00Z'), hasWonOpportunity: true },
        { createdAt: new Date('2026-10-07T00:00:00Z'), qualifiedAt: null, hasWonOpportunity: false },
        { createdAt: new Date('2026-09-30T00:00:00Z'), qualifiedAt: new Date('2026-09-30T00:00:00Z'), hasWonOpportunity: true },
      ],
      from,
      to,
    );
    assert.equal(sample.totalLeads, 2);
    assert.equal(sample.qualifiedLeads, 1);
    assert.equal(sample.qualificationRate.display, '50.0%');
    assert.equal(sample.qualifiedToWonRate.display, '100.0%');
  });

  it('keeps the original acquisition source separate from any later change', () => {
    const rows = sourceBreakdown([{ originalSource: 'referral' }, { originalSource: 'referral' }, { originalSource: 'linkedin' }]);
    assert.deepEqual(rows.map((r) => [r.source, r.count]), [['referral', 2], ['linkedin', 1]]);
    assert.equal(sourceBreakdown([]).length, 0);
  });

  it('counts acceptance against sent proposals only', () => {
    const acc = proposalAcceptance([
      { status: 'accepted', sentAt: new Date() },
      { status: 'sent', sentAt: new Date() },
      { status: 'draft', sentAt: null },
    ]);
    assert.equal(acc.sent, 2);
    assert.equal(acc.rate.display, '50.0%');
    assert.equal(proposalAcceptance([{ status: 'draft', sentAt: null }]).rate.display, 'N/A');
  });

  it('reports average won value per currency, with N/A-free empty results', () => {
    assert.deepEqual(averageWonValue([]), []);
    const [sar] = averageWonValue([
      { finalValueMinor: 150000n, currency: 'SAR' },
      { finalValueMinor: 300000n, currency: 'SAR' },
    ]);
    assert.equal(sar.averageMinor, 225000n);
  });

  it('computes weighted pipeline only where a probability is set, and keeps currencies apart', () => {
    const [sar] = pipeline([
      { amountMinor: 300000n, currency: 'SAR', probabilityPct: 50 },
      { amountMinor: 100000n, currency: 'SAR', probabilityPct: null },
    ]);
    assert.equal(sar.unweightedMinor, 400000n);
    assert.equal(sar.weightedMinor, 150000n);
    assert.equal(sar.withoutProbability, 1);
  });
});

describe('time', () => {
  it('derives overdue from the due time and open status', () => {
    const now = new Date('2026-10-14T12:00:00Z');
    assert.equal(taskTimeState({ status: 'open', dueAt: new Date('2026-10-13T12:00:00Z') }, now), 'overdue');
    assert.equal(taskTimeState({ status: 'completed', dueAt: new Date('2026-10-13T12:00:00Z') }, now), 'completed');
    assert.equal(taskTimeState({ status: 'open', dueAt: new Date('2026-10-20T12:00:00Z') }, now), 'upcoming');
  });

  it('converts form input in the engine timezone to UTC', () => {
    assert.equal(localInputToIso('2026-10-14T09:30'), '2026-10-14T06:30:00.000Z');
    assert.equal(localInputToIso('14/10/2026'), null);
    assert.equal(dayKey(new Date('2026-10-13T22:30:00Z')), '2026-10-14');
  });
});

describe('redirect safety and passwords', () => {
  it('allows only same-site paths', () => {
    assert.equal(safeNextPath('/leads?status=new'), '/leads?status=new');
    assert.equal(safeNextPath('//evil.test'), '/dashboard');
    assert.equal(safeNextPath('/\\evil.test'), '/dashboard');
    assert.equal(safeNextPath('https://evil.test'), '/dashboard');
    assert.equal(safeNextPath('/login?next=/x'), '/dashboard');
    assert.equal(safeNextPath(undefined), '/dashboard');
  });

  it('enforces a minimum password length and blocks obvious passwords', () => {
    assert.equal(passwordProblem('short'), 'too_short');
    assert.equal(passwordProblem('aaaaaaaaaaaaaaaa'), 'repetitive');
    assert.equal(passwordProblem('Sara.Alpha-2026!', 'sara.alpha@yech.test'), 'contains_identifier');
    assert.equal(passwordProblem('correct horse battery 9'), null);
  });
});
