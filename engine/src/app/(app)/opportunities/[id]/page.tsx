import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead, Badge, Field, ResultNotice, EmptyState } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can } from '@/lib/domain/rbac';
import { OPPORTUNITY_STAGES, OPPORTUNITY_STAGE_LABELS, PROPOSAL_STATUS_LABELS, ACTIVITY_TYPES, TASK_TYPES, canOpportunityMove, type OpportunityStage } from '@/lib/domain/lifecycle';
import { formatMinor, minorToInput } from '@/lib/domain/money';
import { loadPeople, nameOf } from '@/lib/people';
import { SERVICE_LABELS } from '@/lib/labels';
import { formatDateTime } from '@/lib/domain/time';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import { UUID_PATTERN } from '@/lib/actions/helpers';
import { updateOpportunityAction, handoverOpportunityAction } from '../actions';
import { addActivityAction } from '@/lib/actions/activities';
import { addTaskAction } from '@/lib/actions/tasks';
import type { Opportunity, Proposal } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function OpportunityDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireCapability('opportunities.read');
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();
  const sp = await searchParams;
  const session = await getSession();
  if (session.state !== 'active') notFound();
  const role = session.role;
  const supabase = await createClient();
  const people = await loadPeople(supabase);

  const { data: opp } = await supabase.from('opportunities').select('*').eq('id', id).maybeSingle();
  if (!opp) notFound();
  const o = opp as Opportunity;
  const stage = o.stage as OpportunityStage;
  const canWrite = can(role, 'opportunities.write');
  const canWin = can(role, 'opportunities.close_won');
  const isOpen = stage !== 'closed_won' && stage !== 'closed_lost';

  const [{ data: history }, { data: proposals }, { data: activities }, { data: customer }, { data: accepted }] = await Promise.all([
    supabase.from('opportunity_stage_history').select('*').eq('opportunity_id', id).order('changed_at', { ascending: true }),
    supabase.from('proposals').select('*').eq('opportunity_id', id).order('created_at', { ascending: false }),
    supabase.from('activities').select('*').eq('opportunity_id', id).order('occurred_at', { ascending: false }).limit(50),
    supabase.from('customers').select('id').eq('opportunity_id', id).maybeSingle(),
    supabase.from('proposals').select('id').eq('opportunity_id', id).eq('status', 'accepted').limit(1),
  ]);

  const stageOptions = OPPORTUNITY_STAGES.filter((s) => s !== stage && canOpportunityMove(stage, s));
  const hasAccepted = (accepted ?? []).length > 0;
  const winAllowed = canWin && canOpportunityMove(stage, 'closed_won') && hasAccepted;

  return (
    <>
      <PageHead title={o.name} description={`${SERVICE_LABELS[o.service_of_interest ?? 'not_sure']} · ${formatMinor(BigInt(o.amount_minor), o.currency)}`}>
        <Badge tone={stage === 'closed_won' ? 'won' : stage === 'closed_lost' ? 'lost' : undefined}>{OPPORTUNITY_STAGE_LABELS[stage]}</Badge>
      </PageHead>
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h2>Deal</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 14px', margin: 0 }}>
            <dt className="muted">Owner</dt><dd style={{ margin: 0 }}>{nameOf(people, o.owner_id)}</dd>
            <dt className="muted">Amount</dt><dd style={{ margin: 0 }}>{formatMinor(BigInt(o.amount_minor), o.currency)}</dd>
            <dt className="muted">Probability</dt><dd style={{ margin: 0 }}>{o.probability_pct === null ? 'Not set' : `${o.probability_pct}%`}</dd>
            <dt className="muted">Expected close</dt><dd style={{ margin: 0 }}>{o.expected_close_date ?? 'Not set'}</dd>
            <dt className="muted">Next action</dt><dd style={{ margin: 0 }}>{o.next_action ?? 'Not set'}</dd>
            {o.final_value_minor !== null ? <><dt className="muted">Final value</dt><dd style={{ margin: 0 }}>{formatMinor(BigInt(o.final_value_minor), o.currency)}</dd></> : null}
            {o.loss_reason ? <><dt className="muted">Loss reason</dt><dd style={{ margin: 0 }}>{o.loss_reason}</dd></> : null}
          </dl>
          {o.lead_id ? <p style={{ marginTop: 12 }}><Link href={`/leads/${o.lead_id}`}>Source lead</Link></p> : null}
        </section>

        <section className="card">
          <h2>Update deal</h2>
          {canWrite && isOpen ? (
            <form action={updateOpportunityAction} className="stack">
              <input type="hidden" name="opportunity_id" value={id} />
              <div className="fields">
                <Field label="Stage" name="stage">
                  <select id="stage" name="stage" defaultValue={stage}>
                    <option value={stage}>{OPPORTUNITY_STAGE_LABELS[stage]} (current)</option>
                    {stageOptions.map((s) => (
                      <option key={s} value={s} disabled={s === 'closed_won' && !winAllowed}>
                        {OPPORTUNITY_STAGE_LABELS[s]}{s === 'closed_won' && !winAllowed ? ' — needs accepted proposal' : ''}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Amount (SAR)" name="amount" hint="Leave blank to keep the current amount.">
                  <input id="amount" name="amount" inputMode="decimal" defaultValue={minorToInput(BigInt(o.amount_minor), o.currency)} />
                </Field>
                <Field label="Probability (%)" name="probability_pct" hint="Used for the weighted pipeline only.">
                  <input id="probability_pct" name="probability_pct" inputMode="numeric" defaultValue={o.probability_pct ?? ''} maxLength={3} />
                </Field>
                <Field label="Expected close" name="expected_close_date">
                  <input id="expected_close_date" name="expected_close_date" type="date" defaultValue={o.expected_close_date ?? ''} />
                </Field>
                <Field label="Next action" name="next_action" wide>
                  <input id="next_action" name="next_action" maxLength={200} defaultValue={o.next_action ?? ''} />
                </Field>
                <Field label="Loss reason (only if closing as lost)" name="loss_reason" wide>
                  <input id="loss_reason" name="loss_reason" maxLength={500} />
                </Field>
                <Field label="Final agreed value (SAR, only if won)" name="final_value" hint="Required to mark as won. Must match the accepted proposal.">
                  <input id="final_value" name="final_value" inputMode="decimal" />
                </Field>
              </div>
              {canWin && !hasAccepted ? <p className="small muted">A deal can be marked as won only after its proposal is recorded as accepted.</p> : null}
              <div><button type="submit">Save deal</button></div>
            </form>
          ) : <p className="muted small">{isOpen ? 'Your role cannot change this deal.' : 'This deal is closed.'}</p>}

          {stage === 'closed_won' && !customer && can(role, 'customers.write') ? (
            <form action={handoverOpportunityAction} style={{ marginTop: 14 }}>
              <input type="hidden" name="opportunity_id" value={id} />
              <p className="small">The deal is won. Create the customer record and onboarding checklist. This is a one-time action and is safe to repeat.</p>
              <button type="submit">Hand over to onboarding</button>
            </form>
          ) : null}
          {customer ? <p style={{ marginTop: 14 }}><Link href={`/customers/${customer.id}`}>Open customer record</Link></p> : null}
        </section>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2>Proposals</h2>
          {can(role, 'proposals.write') && isOpen ? <p><Link href={`/proposals/new?opportunity=${id}`} className="button secondary">New proposal draft</Link></p> : null}
          {(proposals ?? []).length === 0 ? <EmptyState title="No proposals yet." /> : (
            <ul style={{ paddingInlineStart: 18, margin: 0 }}>
              {((proposals ?? []) as Proposal[]).map((p) => (
                <li key={p.id} style={{ marginBottom: 8 }}>
                  <Link href={`/proposals/${p.id}`}>{p.proposal_number}</Link> · {p.title} · <span className="badge muted">{PROPOSAL_STATUS_LABELS[p.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h2>Stage history</h2>
          <ol style={{ paddingInlineStart: 18, margin: 0 }}>
            {(history ?? []).map((h) => (
              <li key={h.id} className="small" style={{ marginBottom: 4 }}>
                {h.from_stage ? `${OPPORTUNITY_STAGE_LABELS[h.from_stage as OpportunityStage]} → ` : 'Created at '}
                {OPPORTUNITY_STAGE_LABELS[h.to_stage as OpportunityStage]} · {formatDateTime(h.changed_at)}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <h2>Follow-up</h2>
          {canWrite && isOpen ? (
            <form action={addTaskAction} className="stack">
              <input type="hidden" name="opportunity_id" value={id} />
              <input type="hidden" name="return_to" value={`/opportunities/${id}`} />
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
          ) : <p className="muted small">No follow-ups can be added to this deal.</p>}
        </section>

        <section className="card">
          <h2>Activity</h2>
          {canWrite && isOpen ? (
            <form action={addActivityAction} className="stack" style={{ marginBottom: 14 }}>
              <input type="hidden" name="opportunity_id" value={id} />
              <input type="hidden" name="return_to" value={`/opportunities/${id}`} />
              <div className="fields">
                <Field label="Type" name="type">
                  <select id="type" name="type" defaultValue="meeting">
                    {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </Field>
                <Field label="Subject" name="subject"><input id="subject" name="subject" required minLength={2} maxLength={200} /></Field>
              </div>
              <Field label="Notes" name="body"><textarea id="body" name="body" maxLength={4000} /></Field>
              <div><button type="submit" className="secondary">Record activity</button></div>
            </form>
          ) : null}
          {(activities ?? []).length === 0 ? <p className="muted small">No activity recorded.</p> : (
            <ul style={{ paddingInlineStart: 18, margin: 0 }}>
              {(activities ?? []).map((a) => (
                <li key={a.id} style={{ marginBottom: 8 }}><strong>{a.subject}</strong> <span className="small muted">{formatDateTime(a.occurred_at)}</span></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
