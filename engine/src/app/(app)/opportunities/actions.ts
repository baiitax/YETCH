'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireCapability } from '@/lib/authz';
import { errorCode } from '@/lib/errors';
import { formToRecord, opportunityUpdateSchema, parseWith } from '@/lib/validation/schemas';
import { canOpportunityMove, type OpportunityStage } from '@/lib/domain/lifecycle';
import { str, withParams } from '@/lib/actions/helpers';

/** Updates a deal. Stage moves are checked against the lifecycle here and again by the database. */
export async function updateOpportunityAction(formData: FormData): Promise<void> {
  await requireCapability('opportunities.write');
  const id = str(formData, 'opportunity_id');
  const back = `/opportunities/${id}`;
  const values = formToRecord(formData);
  const parsed = parseWith(opportunityUpdateSchema, values);
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data: current } = await supabase.from('opportunities').select('stage').eq('id', id).maybeSingle();
  if (!current) redirect(withParams(back, { error: 'not_allowed' }));
  const from = current.stage as OpportunityStage;
  const to = parsed.data.stage;
  if (from !== to && !canOpportunityMove(from, to)) redirect(withParams(back, { error: 'invalid_transition' }));

  // Only fields that were filled in are sent. A blank amount never overwrites a stored value.
  const d = parsed.data;
  const patch: Record<string, unknown> = { stage: to };
  if (d.amount_minor !== null) patch.amount_minor = Number(d.amount_minor);
  if (d.probability_pct !== null) patch.probability_pct = d.probability_pct;
  if (d.next_action !== null) patch.next_action = d.next_action;
  if (d.expected_close_date !== null) patch.expected_close_date = d.expected_close_date;
  if (to === 'closed_lost') patch.loss_reason = d.loss_reason;
  if (to === 'closed_won') patch.final_value_minor = Number(d.final_value_minor);

  const { data, error } = await supabase.from('opportunities').update(patch).eq('id', id).select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'opportunity_updated' }));
}

/** Creates the customer record and onboarding checklist for a won deal. Idempotent in the database. */
export async function handoverOpportunityAction(formData: FormData): Promise<void> {
  await requireCapability('customers.write');
  const id = str(formData, 'opportunity_id');
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('handover_won_opportunity', { p_opportunity_id: id });
  if (error || !data) redirect(withParams(`/opportunities/${id}`, { error: errorCode(error?.message) }));
  redirect(withParams(`/customers/${data}`, { notice: 'handover_done' }));
}
