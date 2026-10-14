// Layer B (internal operations) unit tests: overdue and on-time rules, report N/A behaviour,
// approval rules that mirror the database, input validation, and the operations role matrix.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { can } from '@/lib/domain/rbac';
import {
  isServiceTaskOverdue,
  completedOnTime,
  onTimeCompletionRate,
  overdueShareRate,
  campaignHasApproval,
  decisionBlock,
  canWithdraw,
  businessDay,
} from '@/lib/domain/operations';
import {
  serviceTaskSchema,
  serviceTaskUpdateSchema,
  campaignSchema,
  approvalRequestSchema,
  approvalDecisionSchema,
  responsibilitySchema,
  parseWith,
} from '@/lib/validation/schemas';

const CUSTOMER = '00000000-0000-4000-8000-0000000000d3';
const PERSON = '00000000-0000-4000-8000-0000000000e1';
const OTHER = '00000000-0000-4000-8000-0000000000e2';

describe('overdue and on-time rules', () => {
  it('a task is overdue only when it is open and its due day has passed', () => {
    const today = '2026-10-14';
    assert.equal(isServiceTaskOverdue({ status: 'todo', due_on: '2026-10-13' }, today), true);
    assert.equal(isServiceTaskOverdue({ status: 'blocked', due_on: '2026-10-13' }, today), true);
    assert.equal(isServiceTaskOverdue({ status: 'todo', due_on: '2026-10-14' }, today), false, 'due today is not overdue');
    assert.equal(isServiceTaskOverdue({ status: 'todo', due_on: '2026-10-20' }, today), false);
    assert.equal(isServiceTaskOverdue({ status: 'done', due_on: '2026-10-01' }, today), false, 'done is never overdue');
  });

  it('completion on the due day counts as on time, using engine business days', () => {
    // 2026-10-14 21:30 UTC is 2026-10-15 00:30 in Asia/Riyadh, so it is later than a 14 Oct due day.
    assert.equal(completedOnTime('2026-10-14T21:30:00Z', '2026-10-14'), false);
    assert.equal(completedOnTime('2026-10-14T08:00:00Z', '2026-10-14'), true);
    assert.equal(completedOnTime('2026-10-10T08:00:00Z', '2026-10-14'), true);
  });

  it('business days are computed in the engine timezone', () => {
    assert.equal(businessDay(new Date('2026-10-14T21:30:00Z')), '2026-10-15');
  });
});

describe('report formulas', () => {
  it('shows N/A when there is nothing to divide', () => {
    assert.equal(onTimeCompletionRate({ completedOnTime: 0, completedTasks: 0 }).display, 'N/A');
    assert.equal(overdueShareRate({ overdueTasks: 0, openTasks: 0 }).display, 'N/A');
  });

  it('computes rates from exact counts', () => {
    assert.equal(onTimeCompletionRate({ completedOnTime: 3, completedTasks: 4 }).display, '75.0%');
    assert.equal(overdueShareRate({ overdueTasks: 1, openTasks: 8 }).display, '12.5%');
  });
});

describe('approval rules (mirror of the database)', () => {
  it('only founders and managers can decide, and nobody decides their own request', () => {
    assert.equal(decisionBlock({ role: 'onboarding', userId: OTHER }, PERSON), 'approval_requires_manager');
    assert.equal(decisionBlock({ role: 'sales_executive', userId: OTHER }, PERSON), 'approval_requires_manager');
    assert.equal(decisionBlock({ role: 'reviewer', userId: OTHER }, PERSON), 'approval_requires_manager');
    assert.equal(decisionBlock({ role: 'commercial_manager', userId: PERSON }, PERSON), 'self_approval_not_allowed');
    assert.equal(decisionBlock({ role: 'commercial_manager', userId: OTHER }, PERSON), null);
    assert.equal(decisionBlock({ role: 'founder', userId: OTHER }, PERSON), null);
  });

  it('only the requester can withdraw', () => {
    assert.equal(canWithdraw({ role: 'onboarding', userId: PERSON }, PERSON), true);
    assert.equal(canWithdraw({ role: 'commercial_manager', userId: OTHER }, PERSON), false);
    assert.equal(canWithdraw({ role: 'founder', userId: OTHER }, null), false);
  });

  it('a campaign has approval only when an approved request exists', () => {
    assert.equal(campaignHasApproval(['requested']), false);
    assert.equal(campaignHasApproval(['rejected', 'withdrawn']), false);
    assert.equal(campaignHasApproval(['rejected', 'approved']), true);
  });
});

describe('operations input', () => {
  it('service tasks need a title, a customer and a due date; the date must be a real day', () => {
    const ok = parseWith(serviceTaskSchema, { customer_id: CUSTOMER, title: 'Monthly pack', due_on: '2026-11-03', priority: 'high', owner_id: '', description: '' });
    assert.equal(ok.ok, true);
    if (ok.ok) {
      assert.equal(ok.data.owner_id, null);
      assert.equal(ok.data.description, null);
    }
    const noDue = parseWith(serviceTaskSchema, { customer_id: CUSTOMER, title: 'Monthly pack', due_on: '' });
    assert.equal(noDue.ok, false);
    const badDate = parseWith(serviceTaskSchema, { customer_id: CUSTOMER, title: 'Monthly pack', due_on: '2026-02-31' });
    assert.equal(badDate.ok, false, 'an impossible calendar day is refused');
  });

  it('marking a task done requires an outcome of at least 10 characters', () => {
    const short = parseWith(serviceTaskUpdateSchema, { task_id: CUSTOMER, status: 'done', completion_note: 'ok' });
    assert.equal(short.ok, false);
    const fine = parseWith(serviceTaskUpdateSchema, { task_id: CUSTOMER, status: 'done', completion_note: 'Delivered and confirmed.' });
    assert.equal(fine.ok, true);
    const inProgress = parseWith(serviceTaskUpdateSchema, { task_id: CUSTOMER, status: 'in_progress', completion_note: '' });
    assert.equal(inProgress.ok, true, 'other statuses need no outcome');
  });

  it('campaigns hold dates in order and a known channel only', () => {
    const backwards = parseWith(campaignSchema, { customer_id: CUSTOMER, name: 'Search', channel: 'search', starts_on: '2026-11-10', ends_on: '2026-11-01' });
    assert.equal(backwards.ok, false);
    const badChannel = parseWith(campaignSchema, { customer_id: CUSTOMER, name: 'Search', channel: 'paid-spend-cards' });
    assert.equal(badChannel.ok, false);
    const ok = parseWith(campaignSchema, { customer_id: CUSTOMER, name: 'Search', channel: 'search', starts_on: '', ends_on: '' });
    assert.equal(ok.ok, true);
  });

  it('approval requests need a real reason; decisions need a reason too', () => {
    const shortReq = parseWith(approvalRequestSchema, { subject: 'campaign', subject_id: CUSTOMER, request_note: 'please' });
    assert.equal(shortReq.ok, false);
    const okReq = parseWith(approvalRequestSchema, { subject: 'service_task', subject_id: CUSTOMER, request_note: 'Ready for client review.' });
    assert.equal(okReq.ok, true);
    const noReason = parseWith(approvalDecisionSchema, { approval_id: CUSTOMER, decision: 'approved', decision_note: '' });
    assert.equal(noReason.ok, false);
    const reject = parseWith(approvalDecisionSchema, { approval_id: CUSTOMER, decision: 'rejected', decision_note: 'Client data missing.' });
    assert.equal(reject.ok, true);
  });

  it('responsibilities accept only the defined roles', () => {
    const ok = parseWith(responsibilitySchema, { customer_id: CUSTOMER, profile_id: PERSON, responsibility: 'account_lead' });
    assert.equal(ok.ok, true);
    const bad = parseWith(responsibilitySchema, { customer_id: CUSTOMER, profile_id: PERSON, responsibility: 'owner' });
    assert.equal(bad.ok, false);
  });
});

describe('operations roles', () => {
  it('sales executives have no operations access', () => {
    assert.equal(can('sales_executive', 'operations.read'), false);
    assert.equal(can('sales_executive', 'approvals.request'), false);
  });

  it('reviewers read operations and cannot change anything', () => {
    assert.equal(can('reviewer', 'operations.read'), true);
    assert.equal(can('reviewer', 'operations.write'), false);
    assert.equal(can('reviewer', 'approvals.request'), false);
    assert.equal(can('reviewer', 'approvals.decide'), false);
    assert.equal(can('reviewer', 'responsibilities.manage'), false);
  });

  it('onboarding works tasks and asks for approval, but cannot decide or assign', () => {
    assert.equal(can('onboarding', 'operations.write'), true);
    assert.equal(can('onboarding', 'approvals.request'), true);
    assert.equal(can('onboarding', 'approvals.decide'), false);
    assert.equal(can('onboarding', 'responsibilities.manage'), false);
  });

  it('managers decide approvals and assign responsibilities; founders have everything', () => {
    assert.equal(can('commercial_manager', 'approvals.decide'), true);
    assert.equal(can('commercial_manager', 'responsibilities.manage'), true);
    assert.equal(can('founder', 'approvals.decide'), true);
    assert.equal(can('founder', 'responsibilities.manage'), true);
  });
});
