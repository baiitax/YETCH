'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireCapability } from '@/lib/authz';
import { errorCode } from '@/lib/errors';
import { formToRecord, parseWith, serviceTaskSchema, serviceTaskUpdateSchema, campaignSchema, campaignStatusSchema, approvalRequestSchema, approvalDecisionSchema, approvalWithdrawSchema, responsibilitySchema, responsibilityEndSchema } from '@/lib/validation/schemas';
import { str, withParams, UUID_PATTERN } from '@/lib/actions/helpers';
import { safeBack } from '@/lib/operations-back';

const OPS = '/operations/tasks';

/** Creates a service-delivery task for a customer. Owner and creator come from the session. */
export async function createServiceTaskAction(formData: FormData): Promise<void> {
  await requireCapability('operations.write');
  const back = safeBack(str(formData, 'back'), OPS);
  const parsed = parseWith(serviceTaskSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase.from('service_tasks').insert(parsed.data).select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'service_task_added' }));
}

/** Changes a task's status. Completing a task requires the outcome note; the database enforces it too. */
export async function updateServiceTaskAction(formData: FormData): Promise<void> {
  await requireCapability('operations.read');
  const back = safeBack(str(formData, 'back'), OPS);
  const parsed = parseWith(serviceTaskUpdateSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const payload: Record<string, string> = { status: parsed.data.status };
  if (parsed.data.completion_note) payload.completion_note = parsed.data.completion_note;

  const supabase = await createClient();
  const { data, error } = await supabase.from('service_tasks').update(payload).eq('id', parsed.data.task_id).select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  // Row-level security hides rows the user may not change, so zero rows means "not allowed".
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'service_task_updated' }));
}

/** Creates a campaign activity. It starts as planned; going live is gated by an approval. */
export async function createCampaignAction(formData: FormData): Promise<void> {
  await requireCapability('operations.write');
  const back = safeBack(str(formData, 'back'), '/operations/campaigns');
  const parsed = parseWith(campaignSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase.from('campaign_activities').insert(parsed.data).select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'campaign_added' }));
}

/** Changes a campaign's status. Setting "live" without an approved approval is refused by the database. */
export async function updateCampaignStatusAction(formData: FormData): Promise<void> {
  await requireCapability('operations.write');
  const back = safeBack(str(formData, 'back'), '/operations/campaigns');
  const parsed = parseWith(campaignStatusSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('campaign_activities')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.campaign_id)
    .select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'campaign_updated' }));
}

/** Asks for an approval on a service task or a campaign. The requester is recorded by the database. */
export async function requestApprovalAction(formData: FormData): Promise<void> {
  await requireCapability('approvals.request');
  const back = safeBack(str(formData, 'back'), '/operations/approvals');
  const parsed = parseWith(approvalRequestSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const subjectKey = parsed.data.subject === 'service_task' ? 'service_task_id' : 'campaign_id';
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('approvals')
    .insert({ [subjectKey]: parsed.data.subject_id, request_note: parsed.data.request_note })
    .select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'approval_requested' }));
}

/** A manager or founder approves or rejects an open request, with a recorded reason. */
export async function decideApprovalAction(formData: FormData): Promise<void> {
  await requireCapability('approvals.decide');
  const back = safeBack(str(formData, 'back'), '/operations/approvals');
  const parsed = parseWith(approvalDecisionSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('approvals')
    .update({ status: parsed.data.decision, decision_note: parsed.data.decision_note })
    .eq('id', parsed.data.approval_id)
    .select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'approval_decided' }));
}

/** The requester withdraws their own open request. Database rules reject anyone else. */
export async function withdrawApprovalAction(formData: FormData): Promise<void> {
  await requireCapability('approvals.request');
  const back = safeBack(str(formData, 'back'), '/operations/approvals');
  const parsed = parseWith(approvalWithdrawSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('approvals')
    .update({ status: 'withdrawn' })
    .eq('id', parsed.data.approval_id)
    .select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'approval_withdrawn' }));
}

/** Assigns a responsibility on a customer to an active staff member. */
export async function setResponsibilityAction(formData: FormData): Promise<void> {
  await requireCapability('responsibilities.manage');
  const parsed = parseWith(responsibilitySchema, formToRecord(formData));
  const customerId = str(formData, 'customer_id');
  const back = UUID_PATTERN.test(customerId) ? `/customers/${customerId}` : '/customers';
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase.from('account_responsibilities').insert(parsed.data).select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'responsibility_saved' }));
}

/** Ends an active responsibility. The record is kept with its end time. */
export async function endResponsibilityAction(formData: FormData): Promise<void> {
  await requireCapability('responsibilities.manage');
  const parsed = parseWith(responsibilityEndSchema, formToRecord(formData));
  const customerId = str(formData, 'customer_id');
  const back = UUID_PATTERN.test(customerId) ? `/customers/${customerId}` : '/customers';
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('account_responsibilities')
    .update({ active: false })
    .eq('id', parsed.data.responsibility_id)
    .eq('customer_id', parsed.data.customer_id)
    .select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'responsibility_ended' }));
}
