import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead, Badge, Notice, ResultNotice, Field } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can } from '@/lib/domain/rbac';
import { PROPOSAL_STATUS_LABELS, PROPOSAL_TRANSITIONS, type ProposalStatus } from '@/lib/domain/lifecycle';
import { formatMinor } from '@/lib/domain/money';
import { formatDateTime } from '@/lib/domain/time';
import { ADVERTISING_SPEND_NOTE } from '@/lib/domain/packages';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import { UUID_PATTERN } from '@/lib/actions/helpers';
import { changeProposalStatusAction, markProposalSentAction, recordAcceptanceAction } from '../actions';
import type { Proposal } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ProposalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireCapability('proposals.read');
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();
  const sp = await searchParams;
  const session = await getSession();
  if (session.state !== 'active') notFound();
  const role = session.role;
  const supabase = await createClient();
  const { data } = await supabase.from('proposals').select('*, opportunities(id, name)').eq('id', id).maybeSingle();
  if (!data) notFound();
  const p = data as Proposal & { opportunities: { id: string; name: string } | null };
  const status = p.status;
  const allowed = PROPOSAL_TRANSITIONS[status];
  const canWrite = can(role, 'proposals.write');
  const canApprove = can(role, 'proposals.approve');
  const canAccept = can(role, 'proposals.record_acceptance');

  const terminal = allowed.length === 0;
  const outcomeTargets = (['rejected', 'expired', 'withdrawn', 'superseded'] as ProposalStatus[]).filter((t) => allowed.includes(t));

  return (
    <>
      <PageHead title={p.title} description={`${p.proposal_number} · version ${p.version} · ${p.opportunities?.name ?? ''}`}>
        <Badge tone={status === 'accepted' ? 'won' : status === 'rejected' ? 'lost' : undefined}>{PROPOSAL_STATUS_LABELS[status]}</Badge>
      </PageHead>
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h2>Commercial terms</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 14px', margin: 0 }}>
            <dt className="muted">Package</dt><dd style={{ margin: 0 }}>{p.service_package.replace(/_/g, ' ')}</dd>
            <dt className="muted">Monthly fee</dt><dd style={{ margin: 0 }}>{formatMinor(BigInt(p.recurring_fee_minor), p.currency)} (provisional)</dd>
            <dt className="muted">Setup fee</dt><dd style={{ margin: 0 }}>{formatMinor(BigInt(p.setup_fee_minor), p.currency)}</dd>
            <dt className="muted">Payment schedule</dt><dd style={{ margin: 0 }}>{p.payment_schedule ?? '—'}</dd>
            <dt className="muted">Valid until</dt><dd style={{ margin: 0 }}>{p.valid_until ?? '—'}</dd>
          </dl>
          <p className="small muted" style={{ marginTop: 12 }}>{ADVERTISING_SPEND_NOTE}</p>
        </section>

        <section className="card">
          <h2>Status and record</h2>
          <ul className="small" style={{ paddingInlineStart: 18, margin: '0 0 12px' }}>
            <li>Prepared: {formatDateTime(p.created_at)}</li>
            {p.approved_at ? <li>Approved: {formatDateTime(p.approved_at)}</li> : null}
            {p.sent_at ? <li>Sent: {formatDateTime(p.sent_at)} via {p.sent_channel}</li> : null}
            {p.accepted_at ? <li>Accepted (recorded): {formatDateTime(p.accepted_at)}</li> : null}
          </ul>
          {p.acceptance_evidence ? <p className="small"><strong>Acceptance record:</strong> {p.acceptance_evidence}</p> : null}

          {status === 'draft' && canWrite ? (
            <form action={changeProposalStatusAction} className="actions" style={{ marginBottom: 10 }}>
              <input type="hidden" name="proposal_id" value={id} />
              <input type="hidden" name="status" value="internal_review" />
              <button type="submit">Send for internal review</button>
            </form>
          ) : null}
          {status === 'internal_review' && canApprove ? (
            <form action={changeProposalStatusAction} className="actions" style={{ marginBottom: 10 }}>
              <input type="hidden" name="proposal_id" value={id} />
              <input type="hidden" name="status" value="approved" />
              <button type="submit">Approve for sending</button>
            </form>
          ) : null}
          {status === 'approved' && canWrite ? (
            <form action={markProposalSentAction} className="inline-form" style={{ marginBottom: 10 }}>
              <input type="hidden" name="proposal_id" value={id} />
              <Field label="How was it sent?" name="sent_channel">
                <input id="sent_channel" name="sent_channel" required minLength={2} maxLength={60} placeholder="For example: email to client contact" />
              </Field>
              <button type="submit">Record as sent</button>
            </form>
          ) : null}
          {status === 'sent' && canAccept ? (
            <form action={recordAcceptanceAction} className="stack" style={{ marginBottom: 12 }}>
              <input type="hidden" name="proposal_id" value={id} />
              <Notice kind="info">Record acceptance only when the client has confirmed it in writing or in another verifiable way. Describe how it was confirmed.</Notice>
              <Field label="Accepted by (name, optional)" name="accepted_by_name"><input id="accepted_by_name" name="accepted_by_name" maxLength={120} /></Field>
              <Field label="Evidence of acceptance *" name="acceptance_evidence" hint="For example: the date, channel and a reference to the written confirmation.">
                <textarea id="acceptance_evidence" name="acceptance_evidence" required minLength={10} maxLength={2000} />
              </Field>
              <div><button type="submit">Record acceptance</button></div>
            </form>
          ) : null}
          {status === 'sent' && canWrite ? (
            <p className="small muted">Recording a rejection, expiry or withdrawal is done below.</p>
          ) : null}
          {outcomeTargets.length > 0 && canWrite ? (
            <div className="actions" style={{ marginBottom: 10 }}>
              {outcomeTargets.map((t) => (
                <form key={t} action={changeProposalStatusAction}>
                  <input type="hidden" name="proposal_id" value={id} />
                  <input type="hidden" name="status" value={t} />
                  <button type="submit" className="secondary">Mark {PROPOSAL_STATUS_LABELS[t].toLowerCase()}</button>
                </form>
              ))}
            </div>
          ) : null}
          {terminal ? <p className="small muted">No further steps are available for this proposal.</p> : null}
          {status === 'accepted' ? <Notice kind="success">Accepted and recorded. The deal can now be marked as won by a manager.</Notice> : null}
        </section>
      </div>

      <section className="card">
        <h2>Scope</h2>
        <p style={{ whiteSpace: 'pre-line' }}>{p.scope_of_work}</p>
        {p.deliverables ? <><h3>Deliverables</h3><p style={{ whiteSpace: 'pre-line' }}>{p.deliverables}</p></> : null}
        {p.exclusions ? <><h3>Exclusions</h3><p style={{ whiteSpace: 'pre-line' }}>{p.exclusions}</p></> : null}
        {p.timeline_text ? <><h3>Timeline</h3><p>{p.timeline_text}</p></> : null}
        {p.assumptions ? <><h3>Assumptions</h3><p style={{ whiteSpace: 'pre-line' }}>{p.assumptions}</p></> : null}
        {p.client_responsibilities ? <><h3>Client responsibilities</h3><p style={{ whiteSpace: 'pre-line' }}>{p.client_responsibilities}</p></> : null}
      </section>
      <p className="small" style={{ marginTop: 12 }}>
        {p.opportunities ? <Link href={`/opportunities/${p.opportunities.id}`}>Back to the opportunity</Link> : null}
      </p>
    </>
  );
}
