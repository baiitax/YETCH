import Link from 'next/link';
import { PageHead, Stat, ResultNotice, EmptyState, Badge } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { loadPeople, nameOf } from '@/lib/people';
import { formatDate } from '@/lib/domain/time';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import {
  isServiceTaskOverdue,
  completedOnTime,
  onTimeCompletionRate,
  overdueShareRate,
  SERVICE_TASK_LABELS,
  businessDay,
} from '@/lib/domain/operations';

export const dynamic = 'force-dynamic';

export default async function OperationsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('operations.read');
  const sp = await searchParams;
  const session = await getSession();
  if (session.state !== 'active') return null;

  const supabase = await createClient();
  const today = businessDay(new Date());
  const [tasksRes, campaignsRes, approvalsRes, responsibilitiesRes, customersRes, people] = await Promise.all([
    supabase.from('service_tasks').select('id, customer_id, title, status, due_on, owner_id, completed_at, priority').limit(2000),
    supabase.from('campaign_activities').select('id, status').limit(2000),
    supabase.from('approvals').select('id, status').limit(2000),
    supabase.from('account_responsibilities').select('customer_id, responsibility').eq('active', true).limit(2000),
    supabase.from('customers').select('id, name, status').limit(2000),
    loadPeople(supabase),
  ]);

  const tasks = tasksRes.data ?? [];
  const open = tasks.filter((t) => t.status !== 'done');
  const overdue = open.filter((t) => isServiceTaskOverdue(t, today));
  const done = tasks.filter((t) => t.status === 'done' && t.completed_at);
  const onTime = done.filter((t) => completedOnTime(t.completed_at, t.due_on)).length;
  const live = (campaignsRes.data ?? []).filter((c) => c.status === 'live').length;
  const awaiting = (approvalsRes.data ?? []).filter((a) => a.status === 'requested').length;

  const customers = customersRes.data ?? [];
  const customerName = new Map(customers.map((c) => [c.id, c.name as string]));
  const activeCustomers = customers.filter((c) => c.status !== 'ended');
  const leadCustomers = new Set((responsibilitiesRes.data ?? []).filter((r) => r.responsibility === 'account_lead').map((r) => r.customer_id));
  const withoutLead = activeCustomers.filter((c) => !leadCustomers.has(c.id));

  const mine = open
    .filter((t) => t.owner_id === session.userId)
    .sort((a, b) => String(a.due_on).localeCompare(String(b.due_on)))
    .slice(0, 20);

  const onTimeRate = onTimeCompletionRate({ completedOnTime: onTime, completedTasks: done.length });
  const overdueRate = overdueShareRate({ overdueTasks: overdue.length, openTasks: open.length });

  return (
    <>
      <PageHead
        title="Operations"
        description={`Service delivery, campaign activity, approvals and account responsibilities. Overdue is calculated from the due date in the engine timezone (today: ${formatDate(new Date())}).`}
      />
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />

      <nav className="actions" style={{ margin: '16px 0' }} aria-label="Operations sections">
        <Link className="button secondary" href="/operations/tasks">Service tasks</Link>
        <Link className="button secondary" href="/operations/campaigns">Campaigns</Link>
        <Link className="button secondary" href="/operations/approvals">Approvals ({awaiting})</Link>
      </nav>

      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <Stat label="Open service tasks" value={open.length} />
        <Stat label="Overdue" value={overdue.length} hint="Open tasks past their due day" />
        <Stat label="Live campaigns" value={live} />
        <Stat label="Awaiting decision" value={awaiting} hint="Approval requests not yet decided" />
        <Stat label="Active customers without an account lead" value={withoutLead.length} />
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2>My open tasks</h2>
          {mine.length === 0 ? (
            <EmptyState title="No open tasks assigned to you." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Task</th><th>Customer</th><th>Due</th></tr></thead>
                <tbody>
                  {mine.map((t) => {
                    const late = isServiceTaskOverdue(t, today);
                    return (
                      <tr key={t.id}>
                        <td><strong>{t.title}</strong><div className="small muted">{SERVICE_TASK_LABELS[t.status as keyof typeof SERVICE_TASK_LABELS] ?? t.status}</div></td>
                        <td><Link href={`/customers/${t.customer_id}`}>{customerName.get(t.customer_id) ?? 'Customer'}</Link></td>
                        <td>{formatDate(t.due_on)} {late ? <Badge tone="bad">overdue</Badge> : null}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="small muted" style={{ marginTop: 10 }}>Owner: {nameOf(people, session.userId)}</p>
        </section>

        <section className="card">
          <h2>Operations report</h2>
          <p className="small muted">Business days in the engine timezone. A rate shows N/A when its denominator is zero.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Measure</th><th>Value</th><th>Formula</th></tr></thead>
              <tbody>
                <tr>
                  <td>On-time completion</td>
                  <td>{onTimeRate.display} <span className="small muted">({onTimeRate.numerator} of {onTimeRate.denominator})</span></td>
                  <td className="small">Completed on or before the due day ÷ completed tasks</td>
                </tr>
                <tr>
                  <td>Overdue share</td>
                  <td>{overdueRate.display} <span className="small muted">({overdueRate.numerator} of {overdueRate.denominator})</span></td>
                  <td className="small">Open tasks past their due day ÷ open tasks</td>
                </tr>
                <tr>
                  <td>Campaigns live</td>
                  <td>{live}</td>
                  <td className="small">Count of campaigns with status live</td>
                </tr>
                <tr>
                  <td>Approvals awaiting decision</td>
                  <td>{awaiting}</td>
                  <td className="small">Count of approval requests with status requested</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {withoutLead.length > 0 ? (
        <section className="card" style={{ marginTop: 16 }}>
          <h2>Customers without an account lead</h2>
          <p className="small muted">Assign an account lead on each customer page so that someone owns the account.</p>
          <ul>
            {withoutLead.map((c) => (
              <li key={c.id}><Link href={`/customers/${c.id}`}>{c.name}</Link></li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
