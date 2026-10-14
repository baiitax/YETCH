'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireCapability } from '@/lib/authz';
import { errorCode } from '@/lib/errors';
import { formToRecord, onboardingStateSchema, parseWith } from '@/lib/validation/schemas';
import { str, withParams, UUID_PATTERN } from '@/lib/actions/helpers';

export async function updateOnboardingItemAction(formData: FormData): Promise<void> {
  await requireCapability('onboarding.update');
  const itemId = str(formData, 'item_id');
  const customerId = str(formData, 'customer_id');
  const back = `/customers/${customerId}`;
  if (!UUID_PATTERN.test(itemId)) redirect(withParams(back, { error: 'invalid_value' }));
  const parsed = parseWith(onboardingStateSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(back, { error: 'invalid_value' }));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('onboarding_items')
    .update({ state: parsed.data.state, notes: parsed.data.notes || null })
    .eq('id', itemId)
    .select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'onboarding_updated' }));
}

const CUSTOMER_STATUSES = ['onboarding', 'active', 'paused', 'ended'] as const;

export async function updateCustomerStatusAction(formData: FormData): Promise<void> {
  await requireCapability('customers.write');
  const id = str(formData, 'customer_id');
  const back = `/customers/${id}`;
  const status = str(formData, 'status');
  if (!(CUSTOMER_STATUSES as readonly string[]).includes(status)) redirect(withParams(back, { error: 'invalid_value' }));
  const supabase = await createClient();
  const { data, error } = await supabase.from('customers').update({ status }).eq('id', id).select('id');
  if (error) redirect(withParams(back, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(back, { error: 'not_allowed' }));
  redirect(withParams(back, { notice: 'customer_updated' }));
}
