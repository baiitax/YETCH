import Link from 'next/link';
import { Badge, EmptyState } from '@/components/ui';
import { can, type Role } from '@/lib/domain/rbac';
import { formatDate } from '@/lib/domain/time';
import { nameOf, type Person } from '@/lib/people';
import {
  SERVICE_TASK_STATUSES,
  SERVICE_TASK_LABELS,
  CAMPAIGN_STATUSES,
  CAMPAIGN_LABELS,
  CAMPAIGN_CHANNELS,
  CHANNEL_LABELS,
  RESPONSIBILITIES,
  RESPONSIBILITY_LABELS,
  isServiceTaskOverdue,
  businessDay,
} from '@/lib/domain/operations';
import { PRIORITY_LABELS } from '@/lib/labels';
import {
  createServiceTaskAction,
  updateServiceTaskAction,
  createCampaignAction,
  updateCampaignStatusAction,
  requestApprovalAction,
  setResponsibilityAction,
  endResponsibilityAction,
} from '../../operations/actions';

type Task = { id: string; title: string; status: string; priority: string; owner_id: string | null; due_on: string; completion_note: string | null };
type Campaign = { id: string; name: string; channel: string; status: string; owner_id: string | null; starts_on: string | null; ends_on: string | null };
type Responsibility = { id: string; profile_id: string; responsibility: string; active: boolean; assigned_at: string; ended_at: string | null };

export function OperationsPanel({
  customerId,
  role,
  userId,
  people,
  tasks,
  campaigns,
  responsibilities,
  approvedCampaignIds,
  openCampaignIds,
  openTaskIds,
}: {
  customerId: string;
  role: Role;
  userId: string;
  people: Person[];
  tasks: Task[];
  campaigns: Campaign[];
  responsibilities: Responsibility[];
  approvedCampaignIds: Set<string>;
  openCampaignIds: Set<string>;
  openTaskIds: Set<string>;
}) {
  const canWrite = can(role, 'operations.write');
  const canRequest = can(role, 'approvals.request');
  const canAssign = can(role, 'responsibilities.manage');
  const today = businessDay(new Date());
  const back = `/customers/${customerId}`;
  const activeStaff = people.filter((p) => p.is_active);
  const current = responsibilities.filter((r) => r.active);
  const ended = responsibilities.filter((r) => !r.active).slice(0, 10);

  return (
    <section style={{ marginTop: 24 }} aria-labelledby="ops-heading">
      <h2 id="ops-heading">Operations</h2>

      <div className="grid grid-2">
        <section className="card">
          <h3>Account responsibilities</h3>
          {current.length === 0 ? (
            <p className="muted">No active account lead yet. Assign one so the account has an owner.</p>
          ) : (
            <ul>
              {current.map((r) => (
                <li key={r.id}>
                  <strong>{RESPONSIBILITY_LABELS[r.responsibility as keyof typeof RESPONSIBILITY_LABELS]}:</strong> {nameOf(people, r.profile_id)}
                  {canAssign ? (
                    <form action={endResponsibilityAction} className="inline-form" style={{ display: 'inline-block', marginLeft: 8 }}>
                      <input type="hidden" name="responsibility_id" value={r.id} />
                      <input type="hidden" name="customer_id" value={customerId} />
                      <button type="submit" className="secondary">End</button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {ended.length > 0 ? (
            <details style={{ marginTop: 8 }}>
              <summary className="small">Ended assignments ({ended.length})</summary>
              <ul className="small">
                {ended.map((r) => (
                  <li key={r.id}>
                    {RESPONSIBILITY_LABELS[r.responsibility as keyof typeof RESPONSIBILITY_LABELS]}: {nameOf(people, r.profile_id)} · ended {formatDate(r.ended_at)}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
          {canAssign ? (
            <form action={setResponsibilityAction} className="stack" style={{ marginTop: 12 }}>
              <input type="hidden" name="customer_id" value={customerId} />
              <div className="field">
                <label htmlFor="resp_profile">Staff member</label>
                <select id="resp_profile" name="profile_id" required>
                  {activeStaff.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="resp_role">Responsibility</label>
                <select id="resp_role" name="responsibility" defaultValue="account_lead">
                  {RESPONSIBILITIES.map((r) => <option key={r} value={r}>{RESPONSIBILITY_LABELS[r]}</option>)}
                </select>
              </div>
              <button type="submit" className="secondary">Assign</button>
              <p className="small muted">Only one active person can hold each responsibility. End the current one first.</p>
            </form>
          ) : null}
        </section>

        <section className="card">
          <h3>Service tasks</h3>
          {tasks.length === 0 ? (
            <EmptyState title="No service tasks for this customer." />
          ) : (
            <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
              {tasks.map((t) => {
                const late = isServiceTaskOverdue(t, today);
                const canUpdate = canWrite || t.owner_id === userId;
                return (
                  <li key={t.id} style={{ borderBottom: '1px solid var(--border, #e5e7eb)', padding: '8px 0' }}>
                    <strong>{t.title}</strong> <span className="small muted">· {PRIORITY_LABELS[t.priority] ?? t.priority} · due {formatDate(t.due_on)}</span>{' '}
                    {late ? <Badge tone="bad">overdue</Badge> : null}{' '}
                    <Badge tone={t.status === 'done' ? 'ok' : undefined}>{SERVICE_TASK_LABELS[t.status as keyof typeof SERVICE_TASK_LABELS]}</Badge>
                    <div className="small muted">Owner: {t.owner_id ? nameOf(people, t.owner_id) : 'Unassigned'}{t.completion_note ? ` · Outcome: ${t.completion_note}` : ''}</div>
                    {canUpdate ? (
                      <form action={updateServiceTaskAction} className="inline-form" style={{ marginTop: 4 }}>
                        <input type="hidden" name="task_id" value={t.id} />
                        <input type="hidden" name="back" value={back} />
                        <label htmlFor={`pt-${t.id}`} className="sr-only">Status for {t.title}</label>
                        <select id={`pt-${t.id}`} name="status" defaultValue={t.status}>
                          {SERVICE_TASK_STATUSES.map((s) => <option key={s} value={s}>{SERVICE_TASK_LABELS[s]}</option>)}
                        </select>
                        <label htmlFor={`pn-${t.id}`} className="sr-only">Outcome note</label>
                        <input id={`pn-${t.id}`} name="completion_note" placeholder="Outcome (required to mark done)" maxLength={2000} style={{ minWidth: 160 }} />
                        <button type="submit" className="secondary">Save</button>
                      </form>
                    ) : null}
                    {canRequest && t.status !== 'done' && !openTaskIds.has(t.id) ? (
                      <form action={requestApprovalAction} className="inline-form" style={{ marginTop: 4 }}>
                        <input type="hidden" name="subject" value="service_task" />
                        <input type="hidden" name="subject_id" value={t.id} />
                        <input type="hidden" name="back" value={back} />
                        <label htmlFor={`pr-${t.id}`} className="sr-only">Why this task needs approval</label>
                        <input id={`pr-${t.id}`} name="request_note" placeholder="Approval needed for (10+ characters)" minLength={10} maxLength={1000} required style={{ minWidth: 200 }} />
                        <button type="submit" className="secondary">Request approval</button>
                      </form>
                    ) : null}
                    {openTaskIds.has(t.id) ? <div className="small muted">Approval awaiting decision</div> : null}
                  </li>
                );
              })}
            </ul>
          )}
          {canWrite ? (
            <form action={createServiceTaskAction} className="stack" style={{ marginTop: 12 }}>
              <input type="hidden" name="customer_id" value={customerId} />
              <input type="hidden" name="back" value={back} />
              <div className="field">
                <label htmlFor="new_task_title">New task</label>
                <input id="new_task_title" name="title" required minLength={2} maxLength={200} />
              </div>
              <div className="grid grid-2">
                <div className="field">
                  <label htmlFor="new_task_owner">Owner</label>
                  <select id="new_task_owner" name="owner_id" defaultValue={userId}>
                    <option value="">Unassigned</option>
                    {activeStaff.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="new_task_due">Due date</label>
                  <input id="new_task_due" name="due_on" type="date" required />
                </div>
              </div>
              <button type="submit" className="secondary">Add task</button>
            </form>
          ) : null}
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <h3>Campaign activities</h3>
        {campaigns.length === 0 ? (
          <EmptyState title="No campaign activities for this customer." />
        ) : (
          <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
            {campaigns.map((c) => {
              const approved = approvedCampaignIds.has(c.id);
              return (
                <li key={c.id} style={{ borderBottom: '1px solid var(--border, #e5e7eb)', padding: '8px 0' }}>
                  <strong>{c.name}</strong> <span className="small muted">· {CHANNEL_LABELS[c.channel as keyof typeof CHANNEL_LABELS] ?? c.channel}</span>{' '}
                  <Badge tone={approved ? 'ok' : undefined}>{approved ? 'Approved' : openCampaignIds.has(c.id) ? 'Awaiting decision' : 'Not approved'}</Badge>
                  <div className="small muted">
                    {CAMPAIGN_LABELS[c.status as keyof typeof CAMPAIGN_LABELS] ?? c.status}
                    {c.starts_on ? ` · ${formatDate(c.starts_on)} to ${c.ends_on ? formatDate(c.ends_on) : 'open'}` : ''}
                    {c.owner_id ? ` · Owner: ${nameOf(people, c.owner_id)}` : ''}
                  </div>
                  {canWrite ? (
                    <form action={updateCampaignStatusAction} className="inline-form" style={{ marginTop: 4 }}>
                      <input type="hidden" name="campaign_id" value={c.id} />
                      <input type="hidden" name="back" value={back} />
                      <label htmlFor={`pcs-${c.id}`} className="sr-only">Status for {c.name}</label>
                      <select id={`pcs-${c.id}`} name="status" defaultValue={c.status}>
                        {CAMPAIGN_STATUSES.map((s) => (
                          <option key={s} value={s}>{CAMPAIGN_LABELS[s]}{s === 'live' && !approved ? ' (needs approval)' : ''}</option>
                        ))}
                      </select>
                      <button type="submit" className="secondary">Save</button>
                    </form>
                  ) : null}
                  {canRequest && !approved && !openCampaignIds.has(c.id) ? (
                    <form action={requestApprovalAction} className="inline-form" style={{ marginTop: 4 }}>
                      <input type="hidden" name="subject" value="campaign" />
                      <input type="hidden" name="subject_id" value={c.id} />
                      <input type="hidden" name="back" value={back} />
                      <label htmlFor={`pcr-${c.id}`} className="sr-only">Why this campaign needs approval</label>
                      <input id={`pcr-${c.id}`} name="request_note" placeholder="Approval needed for (10+ characters)" minLength={10} maxLength={1000} required style={{ minWidth: 200 }} />
                      <button type="submit" className="secondary">Request approval</button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        {canWrite ? (
          <form action={createCampaignAction} className="stack" style={{ marginTop: 12 }}>
            <input type="hidden" name="customer_id" value={customerId} />
            <input type="hidden" name="back" value={back} />
            <div className="grid grid-2">
              <div className="field">
                <label htmlFor="new_campaign_name">New campaign</label>
                <input id="new_campaign_name" name="name" required minLength={2} maxLength={160} />
              </div>
              <div className="field">
                <label htmlFor="new_campaign_channel">Channel</label>
                <select id="new_campaign_channel" name="channel" defaultValue="other">
                  {CAMPAIGN_CHANNELS.map((ch) => <option key={ch} value={ch}>{CHANNEL_LABELS[ch]}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="secondary">Add campaign</button>
          </form>
        ) : null}
        <p className="small muted" style={{ marginTop: 10 }}>
          Full lists and filters are on the <Link href="/operations/campaigns">campaigns</Link>, <Link href="/operations/tasks">service tasks</Link> and <Link href="/operations/approvals">approvals</Link> pages.
        </p>
      </section>
    </section>
  );
}
