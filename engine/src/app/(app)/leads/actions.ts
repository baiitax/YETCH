'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireCapability } from '@/lib/authz';
import { errorCode, messageFor } from '@/lib/errors';
import { formToRecord, parseWith, leadCreateSchema, qualifySchema, disqualifySchema, leadStatusSchema, convertLeadSchema, leadAssignSchema } from '@/lib/validation/schemas';
import { canLeadMove, type LeadStatus } from '@/lib/domain/lifecycle';
import { parseMoneyToMinor } from '@/lib/domain/money';
import { jsonSafe } from '@/lib/actions/records';
import { str, withParams } from '@/lib/actions/helpers';

export type LeadFormState = {
  errors?: Record<string, string>;
  formError?: string;
  duplicateId?: string;
  values?: Record<string, string>;
} | null;

/** Creates a lead. Returns field errors to the form, or redirects to the saved lead after the server confirms. */
export async function createLeadAction(_previous: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const session = await requireCapability('leads.write');
  const values = formToRecord(formData);
  const parsed = parseWith(leadCreateSchema, values);
  if (!parsed.ok) return { errors: parsed.errors, values, formError: 'Check the highlighted fields.' };

  const supabase = await createClient();
  const d = parsed.data;

  // Duplicate check against records this user can see. The database has no global unique constraint, so this
  // is a guard, not a guarantee. Duplicates are never merged automatically.
  const dupFilters = [
    d.email_normalized ? `email_normalized.eq.${d.email_normalized}` : '',
    d.phone_normalized ? `phone_normalized.eq.${d.phone_normalized}` : '',
  ].filter(Boolean).join(',');
  if (dupFilters) {
    const { data: dup } = await supabase.from('leads').select('id').or(dupFilters).limit(1);
    if (dup && dup.length > 0) {
      return { formError: 'A lead with this email or phone number is already visible to you. Open it instead of creating a duplicate.', duplicateId: dup[0].id, values };
    }
  }

  const { data, error } = await supabase
    .from('leads')
    .insert(jsonSafe({ ...d, owner_id: session.userId, created_by: session.userId }))
    .select('id')
    .single();
  if (error || !data) {
    return { formError: messageFor(errorCode(error?.message)) ?? undefined, values };
  }
  redirect(`/leads/${data.id}?notice=lead_created`);
}

export async function changeLeadStatusAction(formData: FormData): Promise<void> {
  await requireCapability('leads.write');
  const id = str(formData, 'lead_id');
  const parsed = parseWith(leadStatusSchema, formToRecord(formData));
  const supabase = await createClient();
  const { data: current } = await supabase.from('leads').select('status').eq('id', id).maybeSingle();
  if (!parsed.ok || !current) redirect(withParams(`/leads/${id}`, { error: 'invalid_transition' }));
  const from = current.status as LeadStatus;
  const to = parsed.data.status as LeadStatus;
  if (!canLeadMove(from, to)) redirect(withParams(`/leads/${id}`, { error: 'invalid_transition' }));

  const { data, error } = await supabase.from('leads').update({ status: to }).eq('id', id).select('id');
  if (error) redirect(withParams(`/leads/${id}`, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(`/leads/${id}`, { error: 'not_allowed' }));
  redirect(withParams(`/leads/${id}`, { notice: 'lead_updated' }));
}

export async function qualifyLeadAction(formData: FormData): Promise<void> {
  await requireCapability('leads.write');
  const id = str(formData, 'lead_id');
  const parsed = parseWith(qualifySchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(`/leads/${id}`, { error: 'qualification_evidence_required' }));

  const supabase = await createClient();
  const { data: current } = await supabase.from('leads').select('status').eq('id', id).maybeSingle();
  if (!current || !canLeadMove(current.status as LeadStatus, 'qualified')) {
    redirect(withParams(`/leads/${id}`, { error: 'invalid_transition' }));
  }
  const { data, error } = await supabase
    .from('leads')
    .update({ status: 'qualified', qualification_notes: parsed.data.qualification_notes })
    .eq('id', id)
    .select('id');
  if (error) redirect(withParams(`/leads/${id}`, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(`/leads/${id}`, { error: 'not_allowed' }));
  redirect(withParams(`/leads/${id}`, { notice: 'lead_qualified' }));
}

export async function disqualifyLeadAction(formData: FormData): Promise<void> {
  await requireCapability('leads.write');
  const id = str(formData, 'lead_id');
  const parsed = parseWith(disqualifySchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(`/leads/${id}`, { error: 'disqualification_reason_required' }));

  const supabase = await createClient();
  const { data: current } = await supabase.from('leads').select('status').eq('id', id).maybeSingle();
  if (!current || !canLeadMove(current.status as LeadStatus, 'disqualified')) {
    redirect(withParams(`/leads/${id}`, { error: 'invalid_transition' }));
  }
  const { data, error } = await supabase
    .from('leads')
    .update({ status: 'disqualified', disqualified_reason: parsed.data.disqualified_reason })
    .eq('id', id)
    .select('id');
  if (error) redirect(withParams(`/leads/${id}`, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(`/leads/${id}`, { error: 'not_allowed' }));
  redirect(withParams(`/leads/${id}`, { notice: 'lead_disqualified' }));
}

export async function assignLeadAction(formData: FormData): Promise<void> {
  await requireCapability('leads.assign');
  const parsed = parseWith(leadAssignSchema, formToRecord(formData));
  if (!parsed.ok) redirect(`/leads?error=invalid_value`);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leads')
    .update({ owner_id: parsed.data.owner_id })
    .eq('id', parsed.data.lead_id)
    .select('id');
  if (error) redirect(withParams(`/leads/${parsed.data.lead_id}`, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(`/leads/${parsed.data.lead_id}`, { error: 'not_allowed' }));
  redirect(withParams(`/leads/${parsed.data.lead_id}`, { notice: 'lead_assigned' }));
}

/** Converts a qualified lead through the database procedure. The procedure checks ownership and status again. */
export async function convertLeadAction(formData: FormData): Promise<void> {
  await requireCapability('leads.convert');
  const parsed = parseWith(convertLeadSchema, formToRecord(formData));
  const id = str(formData, 'lead_id');
  if (!parsed.ok) redirect(withParams(`/leads/${id}`, { error: 'invalid_value' }));
  const amount = parseMoneyToMinor(parsed.data.amount || '0');
  if (amount === null) redirect(withParams(`/leads/${id}`, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('convert_lead_to_opportunity', {
    p_lead_id: parsed.data.lead_id,
    p_name: parsed.data.name,
    p_amount_minor: Number(amount),
    p_currency: 'SAR',
  });
  if (error || !data) redirect(withParams(`/leads/${id}`, { error: errorCode(error?.message) }));
  redirect(withParams(`/opportunities/${data}`, { notice: 'lead_converted' }));
}

