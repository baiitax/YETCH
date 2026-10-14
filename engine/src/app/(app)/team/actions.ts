'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCapability } from '@/lib/authz';
import { errorCode } from '@/lib/errors';
import { emailOnlySchema, formToRecord, parseWith, teamUpdateSchema } from '@/lib/validation/schemas';
import { config } from '@/lib/config';
import { withParams } from '@/lib/actions/helpers';

/** Changes a role or activation. The database allows this only for founders and blocks it otherwise. */
export async function updateTeamMemberAction(formData: FormData): Promise<void> {
  await requireCapability('users.manage');
  const parsed = parseWith(teamUpdateSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams('/team', { error: 'invalid_value' }));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: parsed.data.role, is_active: parsed.data.is_active })
    .eq('id', parsed.data.user_id)
    .select('id');
  if (error) redirect(withParams('/team', { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams('/team', { error: 'not_allowed' }));
  redirect(withParams('/team', { notice: 'team_updated' }));
}

/**
 * Sends an invitation. The new account starts inactive with the lowest role, so a founder must still activate it.
 * Requires the service-role key on the server. Without it, the action reports that invitations are not configured.
 */
export async function inviteStaffAction(formData: FormData): Promise<void> {
  await requireCapability('users.manage');
  const parsed = parseWith(emailOnlySchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams('/team', { error: 'invalid_value' }));
  const admin = createAdminClient();
  if (!admin) redirect(withParams('/team', { error: 'invite_not_configured' }));
  if (!/^https?:\/\//.test(config.publicUrl)) redirect(withParams('/team', { error: 'invite_not_configured' }));
  const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    redirectTo: `${config.publicUrl.replace(/\/$/, '')}/auth/callback?next=/reset-password`,
  });
  if (error) redirect(withParams('/team', { error: 'invite_failed' }));
  redirect(withParams('/team', { notice: 'invite_sent' }));
}
