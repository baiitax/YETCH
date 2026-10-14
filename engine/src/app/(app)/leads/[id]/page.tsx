import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead, Badge, Field, ResultNotice, EmptyState } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can, type Role } from '@/lib/domain/rbac';
import { canLeadMove, LEAD_STATUS_LABELS, MANUAL_LEAD_STATUSES, OPPORTUNITY_STAGE_LABELS, ACTIVITY_TYPES, TASK_TYPES, type LeadStatus } from '@/lib/domain/lifecycle';
import { loadPeople, nameOf } from '@/lib/people';
import { LEAD_SOURCE_LABELS, PRIORITY_LABELS, SERVICE_LABELS } from '@/lib/labels';
import { formatDateTime, taskTimeState } from '@/lib/domain/time';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import { UUID_PATTERN } from '@/lib/actions/helpers';
import { changeLeadStatusAction, qualifyLeadAction, disqualifyLeadAction, assignLeadAction, convertLeadAction } from '../actions';
import { addActivityAction } from '@/lib/actions/activities';
import { addTaskAction, completeTaskAction } from '@/lib/actions/tasks';
import type { Lead } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireCapability('leads.read');
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();
  const sp = await searchParams;
  const session = await getSession();
  const role: Role | null = session.state === 'active' ? session.role : null;
  const supabase = await createClient();

  const { data: lead } = await supabase.from('leads').select('*').eq('id', id).maybeSingle();
  if (!lead) notFound();
  const l = lead as Lead;
  const people = await loadPeople(supabase);
  const status = l.status as LeadStatus;
  const canWrite = role !== null && can(role, 'leads.write');
  const canAssign = role !== null && can(role, 'leads.assign');
  const canConvert = role !== null && can(role, 'leads.convert');

  const [{ data: activities }, { data: tasks }, { data: opps }] = await Promise.all([
    supabase.from('activities').select('*').eq('lead_id', id).order('occurred_at', { ascending: false }).limit(50),
    supabase.from('tasks').select('*').eq('lead_id', id).order('due_at', { ascending: true }),
    supabase.from('opportunities').select('id, name, stage, amount_minor, currency').eq('lead_id', id),
  ]);

  const statusOptions = MANUAL_LEAD_STATUSES.filter((s) => s !== status && canLeadMove(status, s) && s !== 'qualified' && s !== 'disqualified');
  const canQualify = canWrite && canLeadMove(status, 'qualified');
  const canDisqualify = canWrite && canLeadMove(status, 'disqualified');
  const now = new Date();

  return (
    <>
      <PageHead title={`${l.first_name} ${l.last_name}`.trim()} description={[l.job_title, l.company_name].filter(Boolean).join(' · ') || 'Lead'}>
        <Badge tone={status === 'qualified' || status.startsWith('converted') ? 'ok' : status === 'disqualified' ? 'bad' : undefined}>
          {LEAD_STATUS_LABELS[status]}
        </Badge>
      </PageHead>
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h2>Details</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 14px', margin: 0 }}>
            <dt className="muted">Email</dt><dd style={{ margin: 0 }}>{l.email ?? '—'}</dd>
            <dt className="muted">Phone</dt><dd style={{ margin: 0 }}>{l.phone ?? '—'}</dd>
            <dt className="muted">Company</dt><dd style={{ margin: 0 }}>{l.company_name ?? '—'}</dd>
            <dt className="muted">City</dt><dd style={{ margin: 0 }}>{l.city ?? '—'}</dd>
            <dt className="muted">Original source</dt><dd style={{ margin: 0 }}>{LEAD_SOURCE_LABELS[l.original_source] ?? l.original_source}</dd>
            <dt className="muted">Campaign</dt><dd style={{ margin: 0 }}>{l.source_campaign ?? '—'}</dd>
            <dt className="muted">Service of interest</dt><dd style={{ margin: 0 }}>{SERVICE_LABELS[l.service_of_interest ?? 'not_sure'] ?? '—'}</dd>
            <dt className="muted">Priority</dt><dd style={{ margin: 0 }}>{PRIORITY_LABELS[l.priority] ?? l.priority}</dd>
            <dt className="muted">Marketing consent</dt><dd style={{ margin: 0 }}>{l.communication_consent}</dd>
            <dt className="muted">Owner</dt><dd style={{ margin: 0 }}>{nameOf(people, l.owner_id)}</dd>
            <dt className="muted">Created</dt><dd style={{ margin: 0 }}>{formatDateTime(l.created_at)}</dd>
          </dl>
          {l.qualification_notes ? (
            <p style={{ marginTop: 14 }}><strong>Qualification evidence:</strong> {l.qualification_notes}</p>
          ) : null}
          {l.disqualified_reason ? <p style={{ marginTop: 14 }}><strong>Disqualified because:</strong> {l.disqualified_reason}</p> : null}
          {l.notes ? <p style={{ marginTop: 14 }} className="small">{l.notes}</p> : null}
        </section>

        <section className="card">
          <h2>Next steps</h2>
          {canWrite && statusOptions.length > 0 ? (
            <form action={changeLeadStatusAction} className="inline-form" style={{ marginBottom: 14 }}>
              <input type="hidden" name="lead_id" value={id} />
              <label htmlFor="status" className="sr-only">Change status</label>
              <select id="status" name="status" required>
                {statusOptions.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
              </select>
              <button type="submit" className="secondary">Change status</button>
            </form>
          ) : null}

          {canQualify ? (
            <form action={qualifyLeadAction} className="stack" style={{ marginBottom: 18 }}>
              <input type="hidden" name="lead_id" value={id} />
              <Field label="Qualify: evidence" name="qualification_notes" hint="What did the person confirm about need, budget, authority or timing? Required (10+ characters).">
                <textarea id="qualification_notes" name="qualification_notes" required minLength={10} maxLength={4000} />
              </Field>
              <div><button type="submit">Mark as qualified</button></div>
            </form>
          ) : null}

          {canDisqualify ? (
            <form action={disqualifyLeadAction} className="stack" style={{ marginBottom: 18 }}>
              <input type="hidden" name="lead_id" value={id} />
              <Field label="Disqualify: reason" name="disqualified_reason" hint="A short, factual reason.">
                <input id="disqualified_reason" name="disqualified_reason" required minLength={3} maxLength={500} />
              </Field>
              <div><button type="submit" className="secondary">Disqualify lead</button></div>
            </form>
          ) : null}

          {status === 'qualified' && canConvert ? (
            <form action={convertLeadAction} className="stack" style={{ marginBottom: 18 }}>
              <input type="hidden" name="lead_id" value={id} />
              <h3>Create opportunity</h3>
              <Field label="Opportunity name" name="name" hint="For example: Clinic group retainer, Q1.">
                <input id="name" name="name" required minLength={2} maxLength={200} defaultValue={`${l.company_name ?? l.first_name} — ${SERVICE_LABELS[l.service_of_interest ?? 'not_sure']}`} />
              </Field>
              <Field label="Estimated monthly value (SAR)" name="amount" hint="Your estimate. This is not a quote and not a payment.">
                <input id="amount" name="amount" inputMode="decimal" defaultValue={l.estimated_value_minor ? (Number(l.estimated_value_minor) / 100).toFixed(2) : ''} />
              </Field>
              <div><button type="submit">Convert to opportunity</button></div>
            </form>
          ) : null}

          {canAssign ? (
            <form action={assignLeadAction} className="inline-form">
              <input type="hidden" name="lead_id" value={id} />
              <label htmlFor="owner_id">Owner</label>
              <select id="owner_id" name="owner_id" defaultValue={l.owner_id ?? ''}>
                <option value="">Unassigned</option>
                {people.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
              </select>
              <button type="submit" className="secondary">Save owner</button>
            </form>
          ) : null}
        </section>
      </div>

      {(opps ?? []).length > 0 ? (
        <section className="card">
          <h2>Opportunities from this lead</h2>
          <ul>
            {(opps ?? []).map((o) => (
              <li key={o.id}><Link href={`/opportunities/${o.id}`}>{o.name}</Link> · {OPPORTUNITY_STAGE_LABELS[o.stage as keyof typeof OPPORTUNITY_STAGE_LABELS]}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid grid-2">
        <section className="card">
          <h2>Follow-ups</h2>
          {canWrite ? (
            <form action={addTaskAction} className="stack" style={{ marginBottom: 14 }}>
              <input type="hidden" name="lead_id" value={id} />
              <input type="hidden" name="return_to" value={`/leads/${id}`} />
              <Field label="What needs to happen?" name="title"><input id="title" name="title" required minLength={2} maxLength={200} /></Field>
              <div className="fields">
                <Field label="Type" name="task_type">
                  <select id="task_type" name="task_type" defaultValue="follow_up">
                    {TASK_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </Field>
                <Field label="Due (Riyadh time)" name="due_local"><input id="due_local" name="due_local" type="datetime-local" required /></Field>
              </div>
              <div><button type="submit" className="secondary">Schedule follow-up</button></div>
            </form>
          ) : null}
          {(tasks ?? []).length === 0 ? <p className="muted small">No follow-ups yet.</p> : (
            <ul style={{ paddingInlineStart: 18 }}>
              {(tasks ?? []).map((t) => {
                const state = taskTimeState({ status: t.status, dueAt: new Date(t.due_at) }, now);
                return (
                  <li key={t.id} style={{ marginBottom: 8 }}>
                    {t.title} — <span className={state === 'overdue' ? 'overdue' : 'small'}>{state === 'overdue' ? 'Overdue · ' : ''}{formatDateTime(t.due_at)}</span> <span className="badge muted">{t.status}</span>
                    {t.outcome ? <div className="small muted">Outcome: {t.outcome}</div> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>Activity</h2>
          {canWrite ? (
            <form action={addActivityAction} className="stack" style={{ marginBottom: 14 }}>
              <input type="hidden" name="lead_id" value={id} />
              <input type="hidden" name="return_to" value={`/leads/${id}`} />
              <div className="fields">
                <Field label="Type" name="type">
                  <select id="type" name="type" defaultValue="phone_call">
                    {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </Field>
                <Field label="Subject" name="subject"><input id="subject" name="subject" required minLength={2} maxLength={200} /></Field>
              </div>
              <Field label="Notes" name="body"><textarea id="body" name="body" maxLength={4000} /></Field>
              <div><button type="submit" className="secondary">Record activity</button></div>
            </form>
          ) : null}
          {(activities ?? []).length === 0 ? <EmptyState title="No activity recorded yet." /> : (
            <ul style={{ paddingInlineStart: 18 }}>
              {(activities ?? []).map((a) => (
                <li key={a.id} style={{ marginBottom: 8 }}>
                  <strong>{a.subject}</strong> <span className="badge muted">{a.type.replace(/_/g, ' ')}</span>
                  <div className="small muted">{formatDateTime(a.occurred_at)}</div>
                  {a.body ? <div className="small">{a.body}</div> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="small muted" style={{ marginTop: 16 }}>
        <Link href="/leads">Back to leads</Link>
        {' · '}Priority guidance and dashboard metrics use only the records you can see.
      </p>
    </>
  );
}
