'use server';

import { redirect } from 'next/navigation';
import { config, isAuthConfigured, isResetConfigured } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import { emailOnlySchema, formToRecord, parseWith, resetPasswordSchema, signInSchema } from '@/lib/validation/schemas';
import { safeNextPath } from '@/lib/security';

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function signInAction(formData: FormData): Promise<void> {
  if (!isAuthConfigured()) redirect('/login?status=unconfigured');
  const next = safeNextPath(str(formData, 'next'));
  const parsed = parseWith(signInSchema, formToRecord(formData));
  if (!parsed.ok) redirect(`/login?error=invalid_credentials&next=${encodeURIComponent(next)}`);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    // The same message for every failure, so the form does not reveal which accounts exist.
    const code = error.status === 429 ? 'rate_limited' : 'invalid_credentials';
    redirect(`/login?error=${code}&next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export async function requestResetAction(formData: FormData): Promise<void> {
  if (!isResetConfigured()) redirect('/forgot-password?error=not_configured');
  const parsed = parseWith(emailOnlySchema, formToRecord(formData));
  // Always show the same confirmation, whether or not the address has an account.
  if (parsed.ok) {
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${config.publicUrl.replace(/\/$/, '')}/auth/callback?next=/reset-password`,
    });
  }
  redirect('/forgot-password?sent=1');
}

export async function updatePasswordAction(formData: FormData): Promise<void> {
  if (!isAuthConfigured()) redirect('/login?status=unconfigured');
  const parsed = parseWith(resetPasswordSchema, formToRecord(formData));
  if (!parsed.ok) {
    const first = Object.keys(parsed.errors)[0] ?? 'password';
    redirect(`/reset-password?error=${first === 'confirm' ? 'mismatch' : 'policy'}`);
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) redirect('/reset-password?error=link_expired');
  await supabase.auth.signOut();
  redirect('/login?notice=password_updated');
}

export async function signOutAction(): Promise<void> {
  if (isAuthConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect('/login?notice=signed_out');
}
