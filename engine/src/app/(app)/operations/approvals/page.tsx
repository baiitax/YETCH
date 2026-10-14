import { PageHead, EmptyState, ResultNotice, Badge } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can } from '@/lib/domain/rbac';
import { loadPeople, nameOf } from '@/lib/people';
import { formatDateTime } from '@/lib/domain/time';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import { APPROVAL_STATUS_LABELS, MIN_NOTE_LENGTH, decisionBlock, canWithdraw } from '@/lib/domain/operations';
import { decideApprovalAction, withdrawApprovalAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('operations.read');
  const sp = await searchParams;
  const session = await getSession();
  if (session.state !== 'active') return null;
  const canDecide = can(session.role, 'approvals.decide');

  const supabase = await createClient();
  const [approvalsRes, people] = await Promise.all([
    supabase
      .from('approvals')
      .select(
        'id, status, request_note, requested_by, requested_at, decided_by, decided_at, decision_note, service_task_id, campaign_id, service_task:service_tasks(title, customer_id), campaign:campaign_activities(name, customer_id)',
      )
      .order('requested_at', { ascending: false })
      .limit(300),
    loadPeople(supabase),
  ]);
  const all = approvalsRes.data ?? [];
  const pending = all.filter((a) => a.status === 'requested');
  const decided = all.filter((a) => a.status !== 'requested').slice(0, 50);
  const actor = { role: session.role, userId: session.userId };

  const subjectOf = (a: (typeof all)[number]) => {
    const task = (a as any).service_task;
    const campaign = (a as any).campaign;
    if (task) return { label: task.title as string, kind: 'Service task', customerId: task.customer_id as string };
    if (campaign) return { label: campaign.name as string, kind: 'Campaign', customerId: campaign.customer_id as string };
    return { label: 'Item', kind: 'Item', customerId: '' };
  };

  return (
    <>
      <PageHead
        title="Approvals"
        description="A request is decided by a manager or the founder. Nobody can decide their own request. Decisions are final and recorded with a reason."
      />
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Awaiting decision ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState title="No requests are waiting for a decision." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Requested by</th><th>Request</th><th>Decision</th></tr></thead>
              <tbody>
                {pending.map((a) => {
                  const subject = subjectOf(a);
                  const blocked = decisionBlock(actor, a.requested_by);
                  const mine = canWithdraw(actor, a.requested_by);
                  return (
                    <tr key={a.id}>
                      <td><strong>{subject.label}</strong><div className="small muted">{subject.kind} · {formatDateTime(a.requested_at)}</div></td>
                      <td>{nameOf(people, a.requested_by)}</td>
                      <td className="small">{a.request_note}</td>
                      <td>
                        {canDecide && !blocked ? (
                          <form action={decideApprovalAction} className="stack">
                            <input type="hidden" name="approval_id" value={a.id} />
                            <input type="hidden" name="back" value="/operations/approvals" />
                            <label htmlFor={`dn-${a.id}`} className="sr-only">Reason for the decision</label>
                            <input id={`dn-${a.id}`} name="decision_note" placeholder={`Reason (${MIN_NOTE_LENGTH}+ characters)`} minLength={MIN_NOTE_LENGTH} maxLength={1000} required />
                            <div className="actions">
                              <button type="submit" name="decision" value="approved">Approve</button>
                              <button type="submit" name="decision" value="rejected" className="secondary">Reject</button>
                            </div>
                          </form>
                        ) : (
                          <span className="small muted">{blocked === 'self_approval_not_allowed' ? 'Your own request. Another manager must decide.' : 'Waiting for a manager.'}</span>
                        )}
                        {mine ? (
                          <form action={withdrawApprovalAction} style={{ marginTop: 8 }}>
                            <input type="hidden" name="approval_id" value={a.id} />
                            <input type="hidden" name="back" value="/operations/approvals" />
                            <button type="submit" className="secondary">Withdraw my request</button>
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Recent decisions</h2>
        {decided.length === 0 ? (
          <EmptyState title="No decisions recorded yet." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Outcome</th><th>Requested by</th><th>Decided by</th><th>Reason</th></tr></thead>
              <tbody>
                {decided.map((a) => {
                  const subject = subjectOf(a);
                  return (
                    <tr key={a.id}>
                      <td><strong>{subject.label}</strong><div className="small muted">{subject.kind}</div></td>
                      <td><Badge tone={a.status === 'approved' ? 'ok' : a.status === 'rejected' ? 'bad' : 'muted'}>{APPROVAL_STATUS_LABELS[a.status] ?? a.status}</Badge></td>
                      <td>{nameOf(people, a.requested_by)}</td>
                      <td className="small">{a.decided_by ? nameOf(people, a.decided_by) : '—'}<div className="muted">{formatDateTime(a.decided_at)}</div></td>
                      <td className="small">{a.decision_note ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
