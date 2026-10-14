// End-to-end demo path, run as each role inside one rolled-back transaction:
// sales creates and qualifies a lead, converts it, schedules a follow-up, drafts a proposal;
// a manager reviews, approves, records the client's acceptance and wins the deal; the handover creates
// the customer; onboarding updates the checklist; the report shows real numbers.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthUser, setRole, startDb, withUser, type Db } from './harness.ts';

const MANAGER = '00000000-0000-4000-8000-0000000000a2';
const SALES = '00000000-0000-4000-8000-0000000000a3';
const ONBOARD = '00000000-0000-4000-8000-0000000000a5';

let db: Db;

before(async () => {
  db = await startDb(54700 + Math.floor(Math.random() * 90));
  await createAuthUser(db, MANAGER, 'manager@yech.test', 'Manager');
  await createAuthUser(db, SALES, 'sales@yech.test', 'Sales');
  await createAuthUser(db, ONBOARD, 'onboard@yech.test', 'Onboarding');
  await setRole(db, MANAGER, 'commercial_manager');
  await setRole(db, SALES, 'sales_executive');
  await setRole(db, ONBOARD, 'onboarding');
});

after(async () => {
  await db?.stop();
});

describe('demo path', () => {
  it('runs from lead creation to a report with real numbers', async () => {
    await withUser(db, SALES, async (u) => {
      // 1. Create a lead (owner is the creator).
      const [lead] = await u.run(
        `insert into public.leads (first_name, last_name, company_name, email, phone, source, original_source, owner_id, service_of_interest, estimated_value_minor, currency)
         values ('Sara', 'Al-Harbi', 'Alpha Clinics', 'sara@alpha.test', '+966500000010', 'referral', 'referral', auth.uid(), 'growth', 300000, 'SAR')
         returning id, status, owner_id`,
      );
      assert.equal(lead.status, 'new');
      assert.equal(lead.owner_id, SALES);

      // 2. Move through contact and qualification. Qualification requires recorded evidence.
      const blocked = await u.attempt(`update public.leads set status = 'qualified' where id = '${lead.id}'`);
      assert.match(blocked ?? '', /qualification_evidence_required/);
      await u.run(`update public.leads set status = 'contacted' where id = '${lead.id}'`);
      await u.run(
        `update public.leads set status = 'qualified', qualification_notes = 'Owner confirmed budget and a Q1 start date.' where id = '${lead.id}'`,
      );

      // 3. Convert to an opportunity through the procedure.
      const [{ opp }] = await u.run(
        `select public.convert_lead_to_opportunity('${lead.id}', 'Alpha Clinics — Growth', 300000, 'SAR') as opp`,
      );
      assert.ok(opp);

      // 4. Follow-up with a due time, then completion with an outcome.
      const [task] = await u.run(
        `insert into public.tasks (title, due_at, opportunity_id, lead_id, assigned_to)
         values ('Send scope', now() - interval '1 hour', '${opp}', '${lead.id}', auth.uid()) returning id`,
      );
      const overdue = await u.run(
        `select count(*)::int as n from public.tasks where status = 'open' and due_at < now()`,
      );
      assert.equal(overdue[0].n, 1, 'the follow-up is overdue because its due time has passed');
      await u.run(
        `update public.tasks set status = 'completed', completed_at = now(), outcome = 'Scope sent by email' where id = '${task.id}'`,
      );

      // 5. Proposal draft. Sales can draft and send for review, but cannot approve.
      const [prop] = await u.run(
        `insert into public.proposals (opportunity_id, title, service_package, scope_of_work, recurring_fee_minor)
         values ('${opp}', 'Growth proposal', 'growth', 'Monthly marketing operations for one brand.', 300000) returning id, proposal_number, status`,
      );
      assert.match(prop.proposal_number, /^YECH-P-\d{4}-\d{4}$/);
      await u.run(`update public.proposals set status = 'internal_review' where id = '${prop.id}'`);
      const salesApproval = await u.attempt(`update public.proposals set status = 'approved' where id = '${prop.id}'`);
      assert.ok(salesApproval, 'sales cannot approve');

      // 6. Manager reviews, approves, records sending, then records the client's acceptance.
      await u.become(MANAGER);
      await u.run(`update public.proposals set status = 'approved' where id = '${prop.id}'`);
      await u.run(`update public.proposals set status = 'sent', sent_channel = 'email to client' where id = '${prop.id}'`);
      await u.run(
        `update public.proposals set status = 'accepted', acceptance_evidence = 'Client replied in writing on 2026-10-12 accepting the proposal.' where id = '${prop.id}'`,
      );

      // 7. Win the deal: needs a final value and the accepted proposal.
      await u.run(`update public.opportunities set stage = 'closed_won', final_value_minor = 300000 where id = '${opp}'`);
      const [customer] = await u.run(`select public.handover_won_opportunity('${opp}') as id`);
      const again = await u.run(`select public.handover_won_opportunity('${opp}') as id`);
      assert.equal(customer.id, again[0].id, 'handover is idempotent');

      // 8. Onboarding updates the checklist. They cannot change the deal.
      await u.become(ONBOARD);
      assert.equal(
        await u.rowCount(`update public.onboarding_items set state = 'verified' where customer_id = '${customer.id}' and sort_order = 1`),
        1,
      );
      const dealEdits = await u.rowCount(`update public.opportunities set amount_minor = 1 where id = '${opp}'`);
      assert.equal(dealEdits, 0, 'onboarding cannot see or edit the deal');

      // 9. Report figures from the same data (manager view).
      await u.become(MANAGER);
      const [report] = await u.run(
        `select
           (select count(*)::int from public.leads where qualified_at is not null) as qualified,
           (select count(*)::int from public.opportunities where stage = 'closed_won') as won,
           (select count(*)::int from public.proposals where status = 'accepted') as accepted,
           (select count(*)::int from public.customers) as customers,
           (select count(*)::int from public.onboarding_items where state = 'verified') as verified`,
      );
      assert.deepEqual(
        { qualified: report.qualified, won: report.won, accepted: report.accepted, customers: report.customers, verified: report.verified },
        { qualified: 1, won: 1, accepted: 1, customers: 1, verified: 1 },
      );

      const managerAudit = await u.rowCount(`select 1 from public.audit_events`);
      assert.equal(managerAudit, 0, 'managers cannot read the audit log');

      // 10. Founders can read the audit trail for the same records, without values.
      await u.adminRun(`update public.profiles set role = 'founder' where id = '${MANAGER}'`);
      await u.become(MANAGER);
      const audit = await u.run(
        `select entity, action, changed_fields from public.audit_events where entity in ('leads','opportunities','proposals','customers') order by id`,
      );
      assert.ok(audit.length > 0, 'the founder can read the audit trail');
      assert.ok(audit.every((r) => ['insert', 'update'].includes(r.action)));
      assert.ok(audit.some((r) => r.entity === 'proposals' && r.changed_fields.includes('status')));
    });
  });
});
