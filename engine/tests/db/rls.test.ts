// Database authorisation and lifecycle tests. Run against real Postgres with the production migrations.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthUser, setRole, startDb, withUser, type AsUser, type Db } from './harness.ts';
/** Records a full proposal path to acceptance as a manager, inside the caller's transaction. */
async function recordAcceptedProposal(u: AsUser, oppId: string): Promise<void> {
  await u.become(MANAGER);
  const [p] = await u.run(
    `insert into public.proposals (opportunity_id, title, service_package, scope_of_work)
     values ('${oppId}', 'Accepted proposal', 'essential', 'Scope') returning id`,
  );
  await u.run(`update public.proposals set status = 'internal_review' where id = '${p.id}'`);
  await u.run(`update public.proposals set status = 'approved' where id = '${p.id}'`);
  await u.run(`update public.proposals set status = 'sent', sent_channel = 'email' where id = '${p.id}'`);
  await u.run(
    `update public.proposals set status = 'accepted', acceptance_evidence = 'Client confirmed in writing (test record)' where id = '${p.id}'`,
  );
}


const FOUNDER = '00000000-0000-4000-8000-000000000001';
const MANAGER = '00000000-0000-4000-8000-000000000002';
const SALES_1 = '00000000-0000-4000-8000-000000000003';
const SALES_2 = '00000000-0000-4000-8000-000000000004';
const ONBOARD = '00000000-0000-4000-8000-000000000005';
const REVIEWER = '00000000-0000-4000-8000-000000000006';
const INACTIVE = '00000000-0000-4000-8000-000000000007';

const LEAD_S1 = '10000000-0000-4000-8000-000000000001';
const LEAD_S2 = '10000000-0000-4000-8000-000000000002';
const LEAD_UNASSIGNED = '10000000-0000-4000-8000-000000000003';
const OPP_S1 = '20000000-0000-4000-8000-000000000001';
const OPP_S2 = '20000000-0000-4000-8000-000000000002';
const TASK_FOR_S2 = '30000000-0000-4000-8000-000000000001';

let db: Db;

before(async () => {
  db = await startDb(54400 + Math.floor(Math.random() * 90));
  await createAuthUser(db, FOUNDER, 'founder@yech.test', 'Founder');
  await createAuthUser(db, MANAGER, 'manager@yech.test', 'Manager');
  await createAuthUser(db, SALES_1, 'sales1@yech.test', 'Sales One');
  await createAuthUser(db, SALES_2, 'sales2@yech.test', 'Sales Two');
  await createAuthUser(db, ONBOARD, 'onboard@yech.test', 'Onboarding');
  await createAuthUser(db, REVIEWER, 'reviewer@yech.test', 'Reviewer');
  await createAuthUser(db, INACTIVE, 'inactive@yech.test', 'Inactive');
  await setRole(db, FOUNDER, 'founder', true);
  await setRole(db, MANAGER, 'commercial_manager', true);
  await setRole(db, SALES_1, 'sales_executive', true);
  await setRole(db, SALES_2, 'sales_executive', true);
  await setRole(db, ONBOARD, 'onboarding', true);
  await setRole(db, REVIEWER, 'reviewer', true);

  // Seed data as the database owner (the same path used for trusted imports).
  await db.admin.query(`
    insert into public.leads (id, first_name, email, phone, source, original_source, owner_id, status, company_name)
    values
      ('${LEAD_S1}', 'Sara', 'sara@alpha.test', null, 'referral', 'referral', '${SALES_1}', 'new', 'Alpha Clinics'),
      ('${LEAD_S2}', 'Omar', 'omar@beta.test', '+966500000002', 'linkedin', 'linkedin', '${SALES_2}', 'new', 'Beta Retail'),
      ('${LEAD_UNASSIGNED}', 'Layla', null, '+966500000003', 'public_website', 'public_website', null, 'new', 'Gamma Dental');
    insert into public.opportunities (id, name, owner_id, stage, amount_minor, currency, lead_id)
    values
      ('${OPP_S1}', 'Alpha retainer', '${SALES_1}', 'qualification', 150000, 'SAR', '${LEAD_S1}'),
      ('${OPP_S2}', 'Beta retainer', '${SALES_2}', 'qualification', 300000, 'SAR', '${LEAD_S2}');
    insert into public.tasks (id, title, due_at, assigned_to, created_by, opportunity_id, status)
    values ('${TASK_FOR_S2}', 'Call Omar', now() - interval '1 day', '${SALES_2}', '${MANAGER}', '${OPP_S2}', 'open');
  `);
});

after(async () => {
  await db?.stop();
});

describe('identity and roles', () => {
  it('creates a new account as an inactive reviewer with no privileges', async () => {
    const rows = await db.admin.query(`select role, is_active from public.profiles where id = $1`, [INACTIVE]);
    assert.equal(rows.rows[0].role, 'reviewer');
    assert.equal(rows.rows[0].is_active, false);
  });

  it('gives an inactive account no access to commercial data', async () => {
    const n = await withUser(db, INACTIVE, (u) => u.rowCount(`select 1 from public.leads`));
    assert.equal(n, 0);
  });

  it('denies anonymous users at the table level', async () => {
    const err = await withUser(db, null, (u) => u.attempt(`select 1 from public.leads`));
    assert.match(err ?? '', /permission denied/);
  });

  it('stops a sales user from promoting themselves', async () => {
    const err = await withUser(db, SALES_1, (u) =>
      u.attempt(`update public.profiles set role = 'founder' where id = auth.uid()`),
    );
    assert.match(err ?? '', /privilege_change_requires_founder/);
  });

  it('lets a sales user update their own display name', async () => {
    const err = await withUser(db, SALES_1, (u) =>
      u.attempt(`update public.profiles set full_name = 'Sales One (Riyadh)' where id = auth.uid()`),
    );
    assert.equal(err, null);
  });

  it('lets a founder activate and assign a role to another account', async () => {
    const err = await withUser(db, FOUNDER, (u) =>
      u.attempt(`update public.profiles set role = 'onboarding', is_active = true where id = '${INACTIVE}'`),
    );
    assert.equal(err, null);
  });

  it('does not let a commercial manager change roles (row is not visible to them for update)', async () => {
    const n = await withUser(db, MANAGER, (u) =>
      u.rowCount(`update public.profiles set role = 'founder' where id = '${SALES_1}'`),
    );
    assert.equal(n, 0);
    const [row] = await db.admin.query(`select role from public.profiles where id = $1`, [SALES_1]).then((r) => r.rows);
    assert.equal(row.role, 'sales_executive');
  });
});

describe('lead visibility and writes', () => {
  it('shows a sales user only their own leads and the unassigned queue', async () => {
    const rows = await withUser(db, SALES_1, (u) => u.run(`select id from public.leads order by id`));
    const ids = rows.map((r) => r.id);
    assert.deepEqual(ids.sort(), [LEAD_S1, LEAD_UNASSIGNED].sort());
  });

  it('shows managers and founders every lead', async () => {
    const n = await withUser(db, MANAGER, (u) => u.rowCount(`select 1 from public.leads`));
    assert.equal(n, 3);
  });

  it('gives reviewers read-only access', async () => {
    await withUser(db, REVIEWER, async (u) => {
      assert.equal(await u.rowCount(`select 1 from public.leads`), 3);
      const err = await u.attempt(
        `insert into public.leads (first_name, email, source, original_source) values ('X', 'x@x.test', 'other', 'other')`,
      );
      assert.match(err ?? '', /row-level security/);
    });
  });

  it('hides leads from onboarding staff', async () => {
    const n = await withUser(db, ONBOARD, (u) => u.rowCount(`select 1 from public.leads`));
    assert.equal(n, 0);
  });

  it('stops a sales user from editing a lead they do not own', async () => {
    const n = await withUser(db, SALES_1, (u) =>
      u.rowCount(`update public.leads set notes = 'hacked' where id = '${LEAD_S2}'`),
    );
    assert.equal(n, 0);
  });

  it('stops a sales user from assigning a lead to someone else', async () => {
    const err = await withUser(db, SALES_1, (u) =>
      u.attempt(`update public.leads set owner_id = '${SALES_2}' where id = '${LEAD_S1}'`),
    );
    assert.match(err ?? '', /assignment_requires_manager|row-level security/);
  });

  it('requires recorded evidence before a lead can be qualified', async () => {
    const err = await withUser(db, SALES_1, (u) =>
      u.attempt(`update public.leads set status = 'qualified' where id = '${LEAD_S1}'`),
    );
    assert.match(err ?? '', /qualification_evidence_required/);
  });

  it('records qualification time and actor once evidence is present', async () => {
    await withUser(db, SALES_1, async (u) => {
      await u.run(
        `update public.leads set status = 'qualified', qualification_notes = 'Budget owner confirmed, two clinics, Q1 timeline.' where id = '${LEAD_S1}'`,
      );
      const [row] = await u.run(`select qualified_at, qualified_by from public.leads where id = '${LEAD_S1}'`);
      assert.ok(row.qualified_at);
      assert.equal(row.qualified_by, SALES_1);
    });
  });

  it('requires a reason to disqualify a lead', async () => {
    const err = await withUser(db, SALES_1, (u) =>
      u.attempt(`update public.leads set status = 'disqualified' where id = '${LEAD_S1}'`),
    );
    assert.match(err ?? '', /disqualification_reason_required/);
  });

  it('does not let a lead be marked as converted except through the conversion procedure', async () => {
    const err = await withUser(db, MANAGER, (u) =>
      u.attempt(`update public.leads set status = 'converted_opportunity' where id = '${LEAD_S2}'`),
    );
    assert.match(err ?? '', /conversion_requires_rpc/);
  });

  it('rejects a currency code that is not three uppercase letters', async () => {
    const err = await withUser(db, MANAGER, (u) =>
      u.attempt(`insert into public.leads (first_name, email, source, original_source, currency) values ('A', 'a@a.test', 'other', 'other', 'sar')`),
    );
    assert.match(err ?? '', /leads_currency_check|check constraint/);
  });

  it('rejects a negative estimated value', async () => {
    const err = await withUser(db, MANAGER, (u) =>
      u.attempt(`insert into public.leads (first_name, email, source, original_source, estimated_value_minor) values ('A', 'a@a.test', 'other', 'other', -1)`),
    );
    assert.match(err ?? '', /check constraint/);
  });
});

describe('leads to opportunities', () => {
  it('converts a qualified lead once, keeping the original source', async () => {
    await withUser(db, SALES_1, async (u) => {
      await u.run(
        `update public.leads set status = 'qualified', qualification_notes = 'Budget owner confirmed, two clinics.' where id = '${LEAD_S1}'`,
      );
      const [{ convert_lead_to_opportunity: oppId }] = await u.run(
        `select public.convert_lead_to_opportunity('${LEAD_S1}', 'Alpha retainer (converted)', 150000, 'SAR') as convert_lead_to_opportunity`,
      );
      assert.ok(oppId);
      const [lead] = await u.run(`select status, original_source, converted_opportunity_id from public.leads where id = '${LEAD_S1}'`);
      assert.equal(lead.status, 'converted_opportunity');
      assert.equal(lead.original_source, 'referral');
      assert.equal(lead.converted_opportunity_id, oppId);
      const err = await u.attempt(`select public.convert_lead_to_opportunity('${LEAD_S1}', 'Again', 1000, 'SAR')`);
      assert.match(err ?? '', /lead_must_be_qualified|lead_already_converted/);
    });
  });

  it('prevents a sales user from converting another salesperson’s lead', async () => {
    const err = await withUser(db, SALES_1, (u) =>
      u.attempt(`select public.convert_lead_to_opportunity('${LEAD_S2}', 'Stolen', 1000, 'SAR')`),
    );
    assert.match(err ?? '', /forbidden/);
  });
});

describe('opportunities and stage history', () => {
  it('writes stage history from a trigger, not from the caller', async () => {
    await withUser(db, SALES_1, async (u) => {
      await u.run(`update public.opportunities set stage = 'discovery_scheduled' where id = '${OPP_S1}'`);
      const rows = await u.run(
        `select from_stage, to_stage, changed_by from public.opportunity_stage_history where opportunity_id = '${OPP_S1}' order by id`,
      );
      assert.ok(rows.length >= 2);
      const last = rows[rows.length - 1];
      assert.equal(last.from_stage, 'qualification');
      assert.equal(last.to_stage, 'discovery_scheduled');
      assert.equal(last.changed_by, SALES_1);
    });
  });

  it('does not let a sales user mark a deal as won', async () => {
    const err = await withUser(db, SALES_1, (u) =>
      u.attempt(`update public.opportunities set stage = 'closed_won', final_value_minor = 150000 where id = '${OPP_S1}'`),
    );
    assert.match(err ?? '', /closing_won_requires_manager/);
  });

  it('requires a final value before a deal is won', async () => {
    const err = await withUser(db, MANAGER, (u) =>
      u.attempt(`update public.opportunities set stage = 'closed_won' where id = '${OPP_S1}'`),
    );
    assert.match(err ?? '', /final_value_required/);
  });

  it('refuses to win a deal without an accepted proposal record', async () => {
    const err = await withUser(db, MANAGER, (u) =>
      u.attempt(`update public.opportunities set stage = 'closed_won', final_value_minor = 150000 where id = '${OPP_S1}'`),
    );
    assert.match(err ?? '', /won_requires_accepted_proposal/);
  });

  it('requires a loss reason before a deal is lost', async () => {
    const err = await withUser(db, SALES_1, (u) =>
      u.attempt(`update public.opportunities set stage = 'closed_lost' where id = '${OPP_S1}'`),
    );
    assert.match(err ?? '', /loss_reason_required/);
  });

  it('keeps the opportunity amount in whole minor units and rejects negatives', async () => {
    const err = await withUser(db, SALES_1, (u) =>
      u.attempt(`update public.opportunities set amount_minor = -5 where id = '${OPP_S1}'`),
    );
    assert.match(err ?? '', /check constraint/);
  });

  it('hides another salesperson’s opportunities', async () => {
    const n = await withUser(db, SALES_1, (u) => u.rowCount(`select 1 from public.opportunities where id = '${OPP_S2}'`));
    assert.equal(n, 0);
  });
});

describe('won handover to customer', () => {
  it('creates one customer and checklist, and is idempotent on repeat calls', async () => {
    await withUser(db, MANAGER, async (u) => {
      await recordAcceptedProposal(u, OPP_S1);
      await u.run(
        `update public.opportunities set stage = 'closed_won', final_value_minor = 150000, currency = 'SAR' where id = '${OPP_S1}'`,
      );
      const [a] = await u.run(`select public.handover_won_opportunity('${OPP_S1}') as id`);
      const [b] = await u.run(`select public.handover_won_opportunity('${OPP_S1}') as id`);
      assert.equal(a.id, b.id);
      const [count] = await u.run(`select count(*)::int as n from public.customers where opportunity_id = '${OPP_S1}'`);
      assert.equal(count.n, 1);
      const [items] = await u.run(`select count(*)::int as n from public.onboarding_items where customer_id = '${a.id}'`);
      assert.equal(items.n, 12);
    });
  });

  it('refuses handover for a deal that is not won', async () => {
    const err = await withUser(db, MANAGER, (u) => u.attempt(`select public.handover_won_opportunity('${OPP_S2}')`));
    assert.match(err ?? '', /opportunity_not_won/);
  });

  it('locks a won deal against later stage changes', async () => {
    await withUser(db, MANAGER, async (u) => {
      await recordAcceptedProposal(u, OPP_S1);
      await u.run(`update public.opportunities set stage = 'closed_won', final_value_minor = 150000 where id = '${OPP_S1}'`);
      const err = await u.attempt(`update public.opportunities set stage = 'negotiation' where id = '${OPP_S1}'`);
      assert.match(err ?? '', /won_opportunity_is_locked/);
    });
  });

  it('lets onboarding staff see the won customer and update checklist states, but not create items', async () => {
    await withUser(db, MANAGER, async (u) => {
      await recordAcceptedProposal(u, OPP_S1);
      await u.run(`update public.opportunities set stage = 'closed_won', final_value_minor = 150000 where id = '${OPP_S1}'`);
      await u.run(`select public.handover_won_opportunity('${OPP_S1}')`);
      await u.become(ONBOARD);
      assert.equal(await u.rowCount(`select 1 from public.customers`), 1);
      assert.equal(
        await u.rowCount(`update public.onboarding_items set state = 'received' where sort_order = 1`),
        1,
      );
      const err = await u.attempt(`insert into public.onboarding_items (customer_id, title) select id, 'x' from public.customers`);
      assert.match(err ?? '', /row-level security/);
    });
  });
});

describe('proposals', () => {
  it('starts a proposal as a draft with a generated number and the preparer recorded', async () => {
    await withUser(db, SALES_1, async (u) => {
      const [p] = await u.run(
        `insert into public.proposals (opportunity_id, title, service_package, scope_of_work)
         values ('${OPP_S1}', 'Essential proposal', 'essential', 'Scope text') returning proposal_number, status, prepared_by`,
      );
      assert.match(p.proposal_number, /^YECH-P-\d{4}-\d{4}$/);
      assert.equal(p.status, 'draft');
      assert.equal(p.prepared_by, SALES_1);
    });
  });

  it('runs the full approval and acceptance path with the right person at each step', async () => {
    await withUser(db, SALES_1, async (u) => {
      const [p] = await u.run(
        `insert into public.proposals (opportunity_id, title, service_package, scope_of_work)
         values ('${OPP_S1}', 'Growth proposal', 'growth', 'Scope') returning id`,
      );
      await u.run(`update public.proposals set status = 'internal_review' where id = '${p.id}'`);

      const salesApprove = await u.attempt(`update public.proposals set status = 'approved' where id = '${p.id}'`);
      assert.match(salesApprove ?? '', /row-level security|approval_requires_manager/);

      await u.become(MANAGER);
      await u.run(`update public.proposals set status = 'approved' where id = '${p.id}'`);
      const [approved] = await u.run(`select approved_by, approved_at from public.proposals where id = '${p.id}'`);
      assert.equal(approved.approved_by, MANAGER);
      assert.ok(approved.approved_at);

      const noChannel = await u.attempt(`update public.proposals set status = 'sent' where id = '${p.id}'`);
      assert.match(noChannel ?? '', /sent_channel_required/);

      await u.run(`update public.proposals set status = 'sent', sent_channel = 'email' where id = '${p.id}'`);

      const noEvidence = await u.attempt(`update public.proposals set status = 'accepted' where id = '${p.id}'`);
      assert.match(noEvidence ?? '', /acceptance_evidence_required/);

      await u.become(SALES_1);
      const salesAcceptRows = await u.rowCount(
        `update public.proposals set status = 'accepted', acceptance_evidence = 'Client confirmed by email on 2026-10-10' where id = '${p.id}'`,
      );
      assert.equal(salesAcceptRows, 0, 'sales user cannot see a sent proposal for update');

      await u.become(MANAGER);
      await u.run(
        `update public.proposals set status = 'accepted', acceptance_evidence = 'Client confirmed by email on 2026-10-10 (manual record)' where id = '${p.id}'`,
      );
      const [accepted] = await u.run(`select status, accepted_at from public.proposals where id = '${p.id}'`);
      assert.equal(accepted.status, 'accepted');
      assert.ok(accepted.accepted_at);

      const afterFinal = await u.attempt(`update public.proposals set status = 'rejected' where id = '${p.id}'`);
      assert.match(afterFinal ?? '', /proposal_is_final/);
    });
  });

  it('refuses a proposal that starts life as anything but a draft', async () => {
    const err = await withUser(db, SALES_1, (u) =>
      u.attempt(`insert into public.proposals (opportunity_id, title, service_package, scope_of_work, status)
                 values ('${OPP_S1}', 'Shortcut', 'essential', 'Scope', 'accepted')`),
    );
    assert.match(err ?? '', /proposal_must_start_as_draft|row-level security/);
  });
});

describe('follow-ups and tasks', () => {
  it('shows a salesperson only tasks assigned to or created by them', async () => {
    const n = await withUser(db, SALES_1, (u) => u.rowCount(`select 1 from public.tasks where id = '${TASK_FOR_S2}'`));
    assert.equal(n, 0);
    const m = await withUser(db, SALES_2, (u) => u.rowCount(`select 1 from public.tasks where id = '${TASK_FOR_S2}'`));
    assert.equal(m, 1);
  });

  it('refuses to complete a follow-up without an outcome', async () => {
    const err = await withUser(db, SALES_2, (u) =>
      u.attempt(`update public.tasks set status = 'completed', completed_at = now() where id = '${TASK_FOR_S2}'`),
    );
    assert.match(err ?? '', /tasks_completed_has_evidence/);
  });

  it('completes a follow-up with an outcome recorded', async () => {
    const n = await withUser(db, SALES_2, (u) =>
      u.rowCount(
        `update public.tasks set status = 'completed', completed_at = now(), outcome = 'Spoke with Omar; sending scope next week' where id = '${TASK_FOR_S2}'`,
      ),
    );
    assert.equal(n, 1);
  });
});

describe('audit trail', () => {
  it('records lead changes by trigger, listing changed column names but not the values', async () => {
    await withUser(db, FOUNDER, async (u) => {
      await u.run(`update public.leads set city = 'Riyadh' where id = '${LEAD_S1}'`);
      const rows = await u.run(
        `select action, changed_fields, summary from public.audit_events
         where entity = 'leads' and entity_id = '${LEAD_S1}' and action = 'update' order by id desc limit 1`,
      );
      assert.equal(rows.length, 1);
      assert.deepEqual(rows[0].changed_fields, ['city']);
      assert.ok(!JSON.stringify(rows[0]).includes('Riyadh'), 'values must not be written to the audit log');
    });
  });

  it('hides the audit log from everyone except founders', async () => {
    for (const uid of [MANAGER, SALES_1, REVIEWER, ONBOARD]) {
      const n = await withUser(db, uid, (u) => u.rowCount(`select 1 from public.audit_events`));
      assert.equal(n, 0, `user ${uid} must not read audit events`);
    }
  });

  it('makes the audit log append-only, even for founders', async () => {
    await withUser(db, FOUNDER, async (u) => {
      const upd = await u.attempt(`update public.audit_events set summary = 'tampered'`);
      assert.match(upd ?? '', /permission denied/);
      const del = await u.attempt(`delete from public.audit_events`);
      assert.match(del ?? '', /permission denied/);
      const ins = await u.attempt(`insert into public.audit_events (action, entity, entity_id) values ('insert','x','y')`);
      assert.match(ins ?? '', /permission denied/);
    });
  });
});
