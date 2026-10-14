'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireCapability } from '@/lib/authz';
import { errorCode } from '@/lib/errors';
import { companySchema, formToRecord, parseWith } from '@/lib/validation/schemas';
import { withParams } from '@/lib/actions/helpers';

export async function createCompanyAction(formData: FormData): Promise<void> {
  const session = await requireCapability('companies.write');
  const parsed = parseWith(companySchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams('/companies', { error: 'invalid_value' }));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('companies')
    .insert({ ...parsed.data, owner_id: session.userId, created_by: session.userId })
    .select('id')
    .single();
  if (error || !data) redirect(withParams('/companies', { error: errorCode(error?.message) }));
  redirect(withParams('/companies', { notice: 'company_created' }));
}
