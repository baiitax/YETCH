// Layer B (internal operations) database tests. Each block runs in its own rolled-back transaction,
// so every test creates the records it needs. Rules tested here are the database's, not the UI's.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthUser, setRole, startDb, withUser, type Db } from './harness.ts';

const FOUNDER = '00000000-0000-4000-8000-0000000000b1';
const MANAGER = '00000000-0000-4000-8000-0000000000b2';
const SALES = '00000000-0000-4000-8000-0000000000b3';
const ONBOARD = '00000000-0000-4000-8000-0000000000b4';
const REVIEWER = '00000000-0000-4000-8000-0000000000b5';
const INACTIVE = '00000000-0000-4000-8000-0000000000b6';
const LEAD = '00000000-0000-4000-8000-0000000000d1';
const OPP = '00000000-0000-4000-8000-0000000000d2';
const CUSTOMER = '00000000-0000-4000-8000-0000000000d3';

const NOTE = 'Verified with the client in the weekly review.';

let db: Db;

before(async () => {
  db = await startDb(54800 + Math.floor(Math.random() * 90));
  await createAuthUser(db, FOUNDER, 'founder-ops@yech.test', 'Founder');
  await createAuthUser(db, MANAGER, 'manager-ops@yech.test', 'Manager');
  await createAuthUser(db, SALES, 'sales-ops@yech.test', 'Sales');
  await createAuthUser(db, ONBOARD, 'onboard-ops@yech.test', 'Onboarding');
  await createAuthUser(db, REVIEWER, 'reviewer-ops@yech.test', 'Reviewer');
  await createAuthUser(db, INACTIVE, 'inactive-ops@yech.test', 'Inactive');
  await setRole(db, FOUNDER, 'founder');
  await setRole(db, MANAGER, 'commercial_manager');
  await setRole(db, SALES, 'sales_executive');
  await setRole(db, ONBOARD, 'onboarding');
  await setRole(db, REVIEWER, 'reviewer');
  await setRole(db, INACTIVE, 'onboarding', false);
  // Seed one customer as the database owner (the same trusted path as the handover fixture).
  await db.admin.query(`
    insert into public.leads (id, first_name, email, source, original_source, owner_id, status, company_name)
    values ('${LEAD}', 'Ops', 'ops@client.test', 'referral', 'referral', '${SALES}', 'new', 'Client Co');
    insert into public.opportunities (id, name, owner_id, stage, amount_minor, currency, lead_id)
    values ('${OPP}', 'Client retainer', '${SALES}', 'qualification', 300000, 'SAR', '${LEAD}');
    insert into public.customers (id, opportunity_id, name, contract_value_minor, currency, account_owner_id, status)
    values ('${CUSTOMER}', '${OPP}', 'Client Co', 300000, 'SAR', '${SALES}', 'active');
  `);
});

after(async () => {
  await db?.stop();
});

const newTask = (title = 'Monthly report pack') =>
  `insert into public.service_tasks (customer_id, title, due_on, priority, created_by)
   values ('${CUSTOMER}', '${title}', current_date + 7, 'medium', auth.uid()) returning id`;

const newCampaign = (name = 'Search launch') =>
  `insert into public.campaign_activities (customer_id, name, channel, created_by)
   values ('${CUSTOMER}', '${name}', 'search', auth.uid()) returning id`;

describe('service-delivery tasks', () => {
  it('onboarding creates a task and completes it with recorded evidence', async () => {
    await withUser(db, ONBOARD, async (u) => {
      const [task] = await u.run(newTask());
      assert.ok(task.id);
      const missing = await u.attempt(`update public.service_tasks set status = 'done' where id = '${task.id}'`);
      assert.match(missing ?? '', /service_tasks_done_has_evidence/);
      const [done] = await u.run(
        `update public.service_tasks set status = 'done', completion_note = '${NOTE}' where id = '${task.id}' returning status, completed_at`,
      );
      assert.equal(done.status, 'done');
      assert.ok(done.completed_at);
    });
  });

  it('reopening a completed task clears its completion time', async () => {
    await withUser(db, MANAGER, async (u) => {
      const [task] = await u.run(newTask('Reopen me'));
      await u.run(`update public.service_tasks set status = 'done', completion_note = '${NOTE}' where id = '${task.id}'`);
      const [reopened] = await u.run(
        `update public.service_tasks set status = 'in_progress' where id = '${task.id}' returning completed_at`,
      );
      assert.equal(reopened.completed_at, null);
    });
  });

  it('reviewers can read operations records but cannot create them', async () => {
    await withUser(db, MANAGER, async (u) => {
      await u.run(newTask('Visible to reviewers'));
      await u.become(REVIEWER);
      const visible = await u.rowCount(`select 1 from public.service_tasks`);
      assert.ok(visible >= 1, 'reviewers see the task');
      const blocked = await u.attempt(newTask('Reviewer attempt'));
      assert.match(blocked ?? '', /row-level security|permission denied/);
    });
  });

  it('sales executives cannot see operations records', async () => {
    await withUser(db, MANAGER, async (u) => {
      await u.run(newTask('Hidden from sales'));
      await u.become(SALES);
      const count = await u.rowCount(`select 1 from public.service_tasks`);
      assert.equal(count, 0);
    });
  });

  it('due dates are required and the task must belong to a customer', async () => {
    await withUser(db, ONBOARD, async (u) => {
      const noDue = await u.attempt(
        `insert into public.service_tasks (customer_id, title, created_by) values ('${CUSTOMER}', 'No due', auth.uid())`,
      );
      assert.match(noDue ?? '', /due_on|not-null|null value/);
      const noCustomer = await u.attempt(
        `insert into public.service_tasks (customer_id, title, due_on, created_by) values ('00000000-0000-4000-8000-0000000000ff', 'Orphan', current_date, auth.uid())`,
      );
      assert.match(noCustomer ?? '', /foreign key|service_tasks_customer_id_fkey/);
    });
  });
});

describe('campaign activities', () => {
  it('dates must be in order', async () => {
    await withUser(db, ONBOARD, async (u) => {
      const bad = await u.attempt(
        `insert into public.campaign_activities (customer_id, name, channel, starts_on, ends_on, created_by)
         values ('${CUSTOMER}', 'Backwards', 'email', '2026-11-10', '2026-11-01', auth.uid())`,
      );
      assert.match(bad ?? '', /campaign_dates_in_order/);
    });
  });

  it('the schema holds no advertising spend, credentials or passwords', async () => {
    const cols = await db.admin.query(
      `select column_name from information_schema.columns where table_schema = 'public' and table_name = 'campaign_activities'`,
    );
    const names = cols.rows.map((r) => r.column_name as string);
    for (const name of names) {
      assert.doesNotMatch(name, /spend|budget|password|credential|token|secret/i);
    }
  });

  it('a campaign cannot go live without an approved approval', async () => {
    await withUser(db, MANAGER, async (u) => {
      const [c] = await u.run(newCampaign('Blocked launch'));
      const blocked = await u.attempt(`update public.campaign_activities set status = 'live' where id = '${c.id}'`);
      assert.match(blocked ?? '', /approval_required/);
    });
  });

  it('a campaign goes live after a manager approves the launch request', async () => {
    await withUser(db, ONBOARD, async (u) => {
      const [c] = await u.run(newCampaign('Approved launch'));
      const [a] = await u.run(
        `insert into public.approvals (campaign_id, request_note) values ('${c.id}', 'Launch after client sign-off on the brief.') returning id`,
      );
      await u.become(FOUNDER);
      await u.run(
        `update public.approvals set status = 'approved', decision_note = 'Brief and budget owner confirmed.' where id = '${a.id}'`,
      );
      await u.become(ONBOARD);
      const [live] = await u.run(`update public.campaign_activities set status = 'live' where id = '${c.id}' returning status`);
      assert.equal(live.status, 'live');
    });
  });

  it('terminal campaign statuses cannot be changed', async () => {
    await withUser(db, MANAGER, async (u) => {
      const [c] = await u.run(newCampaign('Ended'));
      await u.run(`update public.campaign_activities set status = 'cancelled' where id = '${c.id}'`);
      const again = await u.attempt(`update public.campaign_activities set status = 'planned' where id = '${c.id}'`);
      assert.match(again ?? '', /invalid_transition/);
    });
  });
});

describe('approvals', () => {
  it('the requester cannot approve their own request', async () => {
    await withUser(db, ONBOARD, async (u) => {
      const [t] = await u.run(newTask('Needs sign-off'));
      const [a] = await u.run(
        `insert into public.approvals (service_task_id, request_note) values ('${t.id}', 'Ready for the client, please review.') returning id`,
      );
      const self = await u.attempt(
        `update public.approvals set status = 'approved', decision_note = 'Looks good to me.' where id = '${a.id}'`,
      );
      assert.match(self ?? '', /approval_requires_manager/);
    });
  });

  it('a manager cannot approve a request that they made', async () => {
    await withUser(db, MANAGER, async (u) => {
      const [t] = await u.run(newTask('Manager self-request'));
      const [a] = await u.run(
        `insert into public.approvals (service_task_id, request_note) values ('${t.id}', 'Ready for the client, please review.') returning id`,
      );
      const self = await u.attempt(
        `update public.approvals set status = 'approved', decision_note = 'Approving my own request.' where id = '${a.id}'`,
      );
      assert.match(self ?? '', /self_approval_not_allowed/);
    });
  });

  it('another manager decides with a recorded note; decisions are final', async () => {
    await withUser(db, ONBOARD, async (u) => {
      const [t] = await u.run(newTask('Decision path'));
      const [a] = await u.run(
        `insert into public.approvals (service_task_id, request_note) values ('${t.id}', 'Please review the handover pack.') returning id`,
      );
      await u.become(MANAGER);
      const [decided] = await u.run(
        `update public.approvals set status = 'rejected', decision_note = 'Missing the client data sources.' where id = '${a.id}' returning status, decided_by`,
      );
      assert.equal(decided.status, 'rejected');
      assert.equal(decided.decided_by, MANAGER);
      const again = await u.attempt(
        `update public.approvals set status = 'approved', decision_note = 'Changing my mind afterwards.' where id = '${a.id}'`,
      );
      assert.match(again ?? '', /invalid_transition/);
    });
  });

  it('an approval needs a note of at least 10 characters', async () => {
    await withUser(db, ONBOARD, async (u) => {
      const [t] = await u.run(newTask('Short note'));
      const [a] = await u.run(
        `insert into public.approvals (service_task_id, request_note) values ('${t.id}', 'Please check the outline.') returning id`,
      );
      await u.become(FOUNDER);
      const short = await u.attempt(`update public.approvals set status = 'approved', decision_note = 'ok' where id = '${a.id}'`);
      assert.match(short ?? '', /approvals_rejection_or_approval_explained/);
    });
  });

  it('only one request can be open for the same subject', async () => {
    await withUser(db, ONBOARD, async (u) => {
      const [t] = await u.run(newTask('Duplicate request'));
      await u.run(`insert into public.approvals (service_task_id, request_note) values ('${t.id}', 'First request for review.')`);
      const second = await u.attempt(
        `insert into public.approvals (service_task_id, request_note) values ('${t.id}', 'Second request for review.')`,
      );
      assert.match(second ?? '', /approvals_one_open_service_task|duplicate/);
    });
  });

  it('only the requester can withdraw, and the request text stays fixed', async () => {
    await withUser(db, ONBOARD, async (u) => {
      const [t] = await u.run(newTask('Withdraw path'));
      const [a] = await u.run(
        `insert into public.approvals (service_task_id, request_note) values ('${t.id}', 'Requesting review of the plan.') returning id`,
      );
      const rewrite = await u.attempt(`update public.approvals set request_note = 'A different request text.' where id = '${a.id}'`);
      assert.match(rewrite ?? '', /approval_fields_locked/);
      await u.become(MANAGER);
      const notMine = await u.attempt(`update public.approvals set status = 'withdrawn' where id = '${a.id}'`);
      assert.match(notMine ?? '', /not_allowed/);
      await u.become(ONBOARD);
      const [w] = await u.run(`update public.approvals set status = 'withdrawn' where id = '${a.id}' returning status, decided_by`);
      assert.equal(w.status, 'withdrawn');
      assert.equal(w.decided_by, ONBOARD);
    });
  });

  it('reviewers cannot decide approvals', async () => {
    await withUser(db, MANAGER, async (u) => {
      const [t] = await u.run(newTask('Decide as reviewer'));
      const [a] = await u.run(
        `insert into public.approvals (service_task_id, request_note) values ('${t.id}', 'Requesting for the reviewer check.') returning id`,
      );
      await u.become(REVIEWER);
      // Row-level security hides rows a user may not update, so the statement touches nothing.
      const changed = await u.rowCount(
        `with upd as (update public.approvals set status = 'approved', decision_note = 'Reviewer trying to approve.' where id = '${a.id}' returning 1) select 1 from upd`,
      );
      assert.equal(changed, 0, 'reviewer decision must change no rows');
      const stillOpen = await u.run(`select status from public.approvals where id = '${a.id}'`);
      assert.equal(stillOpen[0].status, 'requested', 'the decision did not happen');
    });
  });
});

describe('account responsibilities', () => {
  it('a manager assigns an account lead, and only one active lead exists per customer', async () => {
    await withUser(db, MANAGER, async (u) => {
      const [r] = await u.run(
        `insert into public.account_responsibilities (customer_id, profile_id, responsibility, assigned_by) values ('${CUSTOMER}', '${ONBOARD}', 'account_lead', auth.uid()) returning id, active`,
      );
      assert.equal(r.active, true);
      const second = await u.attempt(
        `insert into public.account_responsibilities (customer_id, profile_id, responsibility, assigned_by) values ('${CUSTOMER}', '${MANAGER}', 'account_lead', auth.uid())`,
      );
      assert.match(second ?? '', /duplicate|unique/);
    });
  });

  it('onboarding staff cannot assign responsibilities', async () => {
    await withUser(db, ONBOARD, async (u) => {
      const blocked = await u.attempt(
        `insert into public.account_responsibilities (customer_id, profile_id, responsibility, assigned_by) values ('${CUSTOMER}', '${ONBOARD}', 'delivery_lead', auth.uid())`,
      );
      assert.match(blocked ?? '', /row-level security|permission denied/);
    });
  });

  it('inactive staff cannot hold a responsibility', async () => {
    await withUser(db, MANAGER, async (u) => {
      const blocked = await u.attempt(
        `insert into public.account_responsibilities (customer_id, profile_id, responsibility, assigned_by) values ('${CUSTOMER}', '${INACTIVE}', 'delivery_lead', auth.uid())`,
      );
      assert.match(blocked ?? '', /profile_not_active/);
    });
  });

  it('ending a responsibility records the time and cannot be reversed', async () => {
    await withUser(db, MANAGER, async (u) => {
      const [r] = await u.run(
        `insert into public.account_responsibilities (customer_id, profile_id, responsibility, assigned_by) values ('${CUSTOMER}', '${ONBOARD}', 'quality_reviewer', auth.uid()) returning id`,
      );
      const [ended] = await u.run(
        `update public.account_responsibilities set active = false where id = '${r.id}' returning active, ended_at`,
      );
      assert.equal(ended.active, false);
      assert.ok(ended.ended_at);
      const reopen = await u.attempt(`update public.account_responsibilities set active = true where id = '${r.id}'`);
      assert.match(reopen ?? '', /invalid_transition/);
    });
  });
});

describe('audit trail', () => {
  it('operations changes are audited; only founders can read the log', async () => {
    await withUser(db, ONBOARD, async (u) => {
      await u.run(newTask('Audited task'));
      await u.become(MANAGER);
      const managerView = await u.rowCount(`select 1 from public.audit_events where entity = 'service_tasks'`);
      assert.equal(managerView, 0, 'managers cannot read the audit log');
      await u.become(FOUNDER);
      const rows = await u.run(`select action from public.audit_events where entity = 'service_tasks' order by id`);
      assert.ok(rows.length >= 1, 'the founder sees the task insert');
      assert.equal(rows[0].action, 'insert');
    });
  });
});
