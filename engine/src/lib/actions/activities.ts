'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireCapability } from '@/lib/authz';
import { errorCode } from '@/lib/errors';
import { activitySchema, formToRecord, parseWith } from '@/lib/validation/schemas';
import { str, withParams } from '@/lib/actions/helpers';

/** Records an activity against a lead or opportunity. The return path is validated before redirecting. */
export async function addActivityAction(formData: FormData): Promise<void> {
  const returnTo = str(formData, 'return_to') || '/dashboard';
  const leadId = str(formData, 'lead_id');
  const oppId = str(formData, 'opportunity_id');
  await requireCapability(oppId ? 'opportunities.write' : 'leads.write');

  const parsed = parseWith(activitySchema, {
    type: str(formData, 'type'),
    subject: str(formData, 'subject'),
    body: str(formData, 'body'),
    lead_id: leadId || undefined,
    opportunity_id: oppId || undefined,
  });
  if (!parsed.ok) redirect(withParams(returnTo, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('activities')
    .insert({
      type: parsed.data.type,
      subject: parsed.data.subject,
      body: parsed.data.body || null,
      lead_id: parsed.data.lead_id ?? null,
      opportunity_id: parsed.data.opportunity_id ?? null,
    })
    .select('id')
    .single();
  if (error || !data) redirect(withParams(returnTo, { error: errorCode(error?.message) }));
  redirect(withParams(returnTo, { notice: 'activity_added' }));
}
