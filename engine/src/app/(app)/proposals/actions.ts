'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireCapability } from '@/lib/authz';
import { errorCode } from '@/lib/errors';
import { formToRecord, parseWith, proposalAcceptanceSchema, proposalSchema, proposalSentSchema } from '@/lib/validation/schemas';
import { canProposalMove, type ProposalStatus } from '@/lib/domain/lifecycle';
import { jsonSafe } from '@/lib/actions/records';
import { str, withParams } from '@/lib/actions/helpers';

export async function createProposalAction(formData: FormData): Promise<void> {
  const session = await requireCapability('proposals.write');
  const values = formToRecord(formData);
  const parsed = parseWith(proposalSchema, values);
  const back = `/proposals/new?opportunity=${encodeURIComponent(values.opportunity_id ?? '')}`;
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposals')
    .insert(jsonSafe({ ...parsed.data, status: 'draft', prepared_by: session.userId }))
    .select('id')
    .single();
  if (error || !data) redirect(withParams(back, { error: errorCode(error?.message) }));
  redirect(withParams(`/proposals/${data.id}`, { notice: 'proposal_created' }));
}

/** Moves a proposal along its lifecycle. Approval and acceptance are restricted to managers in the database too. */
export async function changeProposalStatusAction(formData: FormData): Promise<void> {
  await requireCapability('proposals.write');
  const id = str(formData, 'proposal_id');
  const back = `/proposals/${id}`;
  const to = str(formData, 'status') as ProposalStatus;
  const supabase = await createClient();
  const { data: current } = await supabase.from('proposals').select('status').eq('id', id).maybeSingle();
  if (!current || !canProposalMove(current.status as ProposalStatus, to)) redirect(withParams(back, { error: 'invalid_transition' }));

  if (to === 'approved') await requireCapability('proposals.approve');
  if (to === 'accepted') await requireCapability('proposals.record_acceptance');

  const { data, error } = await supabase.from('proposals').update({ status: to }).eq('id', id).select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'proposal_updated' }));
}

/** Records that the proposal was sent. This does not send anything itself; the channel is what the user did. */
export async function markProposalSentAction(formData: FormData): Promise<void> {
  await requireCapability('proposals.write');
  const id = str(formData, 'proposal_id');
  const back = `/proposals/${id}`;
  const parsed = parseWith(proposalSentSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(back, { error: 'sent_channel_required' }));
  const supabase = await createClient();
  const { data: current } = await supabase.from('proposals').select('status').eq('id', id).maybeSingle();
  if (!current || !canProposalMove(current.status as ProposalStatus, 'sent')) redirect(withParams(back, { error: 'invalid_transition' }));
  const { data, error } = await supabase
    .from('proposals')
    .update({ status: 'sent', sent_channel: parsed.data.sent_channel, sent_at: new Date().toISOString() })
    .eq('id', id)
    .select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'proposal_updated' }));
}

/** Records a client acceptance that a manager has received and verified. Never inferred from silence or a click. */
export async function recordAcceptanceAction(formData: FormData): Promise<void> {
  await requireCapability('proposals.record_acceptance');
  const id = str(formData, 'proposal_id');
  const back = `/proposals/${id}`;
  const parsed = parseWith(proposalAcceptanceSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(back, { error: 'acceptance_evidence_required' }));
  const name = parsed.data.accepted_by_name ? `Accepted by ${parsed.data.accepted_by_name}. ` : '';
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('proposals')
    .update({ status: 'accepted', acceptance_evidence: `${name}${parsed.data.acceptance_evidence}` })
    .eq('id', id)
    .select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'proposal_updated' }));
}
