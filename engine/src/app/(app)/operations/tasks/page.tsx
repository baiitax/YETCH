import Link from 'next/link';
import { PageHead, EmptyState, ResultNotice, Badge } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can } from '@/lib/domain/rbac';
import { loadPeople, nameOf } from '@/lib/people';
import { formatDate } from '@/lib/domain/time';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import { PRIORITY_LABELS } from '@/lib/labels';
import { SERVICE_TASK_STATUSES, SERVICE_TASK_LABELS, isServiceTaskOverdue, businessDay } from '@/lib/domain/operations';
import { createServiceTaskAction, updateServiceTaskAction, requestApprovalAction } from '../actions';

export const dynamic = 'force-dynamic';

const FILTERS = ['open', 'overdue', 'done', 'all'] as const;
type Filter = (typeof FILTERS)[number];
const FILTER_LABELS: Record<Filter, string> = { open: 'Open', overdue: 'Overdue', done: 'Done', all: 'All' };

export default async function ServiceTasksPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('operations.read');
  const sp = await searchParams;
  const session = await getSession();
  if (session.state !== 'active') return null;
  const canWrite = can(session.role, 'operations.write');
  const canRequest = can(session.role, 'approvals.request');
  const filter: Filter = (FILTERS as readonly string[]).includes(sp.filter ?? '') ? (sp.filter as Filter) : 'open';

  const supabase = await createClient();
  const today = businessDay(new Date());
  const [tasksRes, customersRes, openApprovalsRes, people] = await Promise.all([
    supabase.from('service_tasks').select('*').order('due_on', { ascending: true }).limit(500),
    supabase.from('customers').select('id, name, status').neq('status', 'ended').order('name', { ascending: true }).limit(500),
    supabase.from('approvals').select('service_task_id').eq('status', 'requested').not('service_task_id', 'is', null).limit(2000),
    loadPeople(supabase),
  ]);
  const customers = customersRes.data ?? [];
  const customerName = new Map(customers.map((c) => [c.id, c.name as string]));
  const awaitingApproval = new Set((openApprovalsRes.data ?? []).map((a) => a.service_task_id as string));
  const rows = (tasksRes.data ?? []).map((t) => ({ ...t, overdue: isServiceTaskOverdue(t, today) }));
  const shown = rows.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'done') return t.status === 'done';
    if (filter === 'overdue') return t.overdue;
    return t.status !== 'done';
  });
  const activeStaff = people.filter((p) => p.is_active);

  return (
    <>
      <PageHead title="Service tasks" description="Delivery work for customers. Completing a task requires a recorded outcome. Overdue is calculated from the due date." />
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />

      <nav className="actions" style={{ margin: '16px 0' }} aria-label="Task views">
        {FILTERS.map((f) => (
          <Link key={f} href={`/operations/tasks?filter=${f}`} className={`button ${filter === f ? '' : 'secondary'}`} aria-current={filter === f ? 'page' : undefined}>
            {FILTER_LABELS[f]} ({rows.filter((t) => (f === 'all' ? true : f === 'done' ? t.status === 'done' : f === 'overdue' ? t.overdue : t.status !== 'done')).length})
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <div className="table-wrap"><EmptyState title="No service tasks in this view." /></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Task</th><th>Customer</th><th>Owner</th><th>Due</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {shown.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.title}</strong>
                    <div className="small muted">{PRIORITY_LABELS[t.priority] ?? t.priority}{t.completion_note ? ` · Outcome: ${t.completion_note}` : ''}</div>
                  </td>
                  <td><Link href={`/customers/${t.customer_id}`}>{customerName.get(t.customer_id) ?? 'Customer'}</Link></td>
                  <td>{t.owner_id ? nameOf(people, t.owner_id) : <span className="muted">Unassigned</span>}</td>
                  <td>{formatDate(t.due_on)} {t.overdue ? <Badge tone="bad">overdue</Badge> : null}</td>
                  <td><Badge tone={t.status === 'done' ? 'ok' : t.status === 'blocked' ? 'warn' : undefined}>{SERVICE_TASK_LABELS[t.status as keyof typeof SERVICE_TASK_LABELS]}</Badge></td>
                  <td>
                    {canWrite || t.owner_id === session.userId ? (
                      <form action={updateServiceTaskAction} className="inline-form">
                        <input type="hidden" name="task_id" value={t.id} />
                        <input type="hidden" name="back" value="/operations/tasks" />
                        <label htmlFor={`st-${t.id}`} className="sr-only">Status for {t.title}</label>
                        <select id={`st-${t.id}`} name="status" defaultValue={t.status}>
                          {SERVICE_TASK_STATUSES.map((s) => <option key={s} value={s}>{SERVICE_TASK_LABELS[s]}</option>)}
                        </select>
                        <label htmlFor={`sn-${t.id}`} className="sr-only">Outcome note</label>
                        <input id={`sn-${t.id}`} name="completion_note" placeholder="Outcome (required to mark done)" maxLength={2000} style={{ minWidth: 180 }} />
                        <button type="submit" className="secondary">Save</button>
                      </form>
                    ) : null}
                    {canRequest && !awaitingApproval.has(t.id) && t.status !== 'done' ? (
                      <form action={requestApprovalAction} className="inline-form" style={{ marginTop: 6 }}>
                        <input type="hidden" name="subject" value="service_task" />
                        <input type="hidden" name="subject_id" value={t.id} />
                        <input type="hidden" name="back" value="/operations/tasks" />
                        <label htmlFor={`tr-${t.id}`} className="sr-only">Why this task needs approval</label>
                        <input id={`tr-${t.id}`} name="request_note" placeholder="Approval needed for (10+ characters)" minLength={10} maxLength={1000} required style={{ minWidth: 200 }} />
                        <button type="submit" className="secondary">Request approval</button>
                      </form>
                    ) : null}
                    {canRequest && awaitingApproval.has(t.id) ? <div className="small muted" style={{ marginTop: 6 }}>Approval awaiting decision</div> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canWrite ? (
        <section className="card" style={{ marginTop: 20 }}>
          <h2>New service task</h2>
          {customers.length === 0 ? (
            <p className="muted">No active customers yet. Service tasks belong to a customer.</p>
          ) : (
            <form action={createServiceTaskAction} className="stack">
              <input type="hidden" name="back" value="/operations/tasks" />
              <div className="field">
                <label htmlFor="customer_id">Customer</label>
                <select id="customer_id" name="customer_id" required>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="title">Title</label>
                <input id="title" name="title" required minLength={2} maxLength={200} />
              </div>
              <div className="field">
                <label htmlFor="description">Details (optional)</label>
                <textarea id="description" name="description" maxLength={2000} rows={3} />
              </div>
              <div className="grid grid-2">
                <div className="field">
                  <label htmlFor="owner_id">Owner</label>
                  <select id="owner_id" name="owner_id" defaultValue={session.userId}>
                    <option value="">Unassigned</option>
                    {activeStaff.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="due_on">Due date</label>
                  <input id="due_on" name="due_on" type="date" required />
                </div>
                <div className="field">
                  <label htmlFor="priority">Priority</label>
                  <select id="priority" name="priority" defaultValue="medium">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <button type="submit">Add task</button>
            </form>
          )}
        </section>
      ) : null}
    </>
  );
}
