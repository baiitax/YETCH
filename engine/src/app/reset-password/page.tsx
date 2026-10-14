import { redirect } from 'next/navigation';
import { isAuthConfigured } from '@/lib/config';
import { createClient } from '@/lib/supabase/server';
import { updatePasswordAction } from '@/lib/actions/auth';
import { Notice } from '@/components/ui';
import { PASSWORD_MIN_LENGTH } from '@/lib/security';

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  mismatch: 'The two passwords do not match.',
  policy: `Use at least ${PASSWORD_MIN_LENGTH} characters, and avoid your username or repeated characters.`,
  link_expired: 'This reset link has expired or was already used. Request a new link.',
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  if (!isAuthConfigured()) redirect('/login?status=unconfigured');

  // The reset link creates a temporary recovery session. Without it, the form is not shown.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const hasRecoverySession = Boolean(data.user);

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div className="brand-line">YECH Commercial Engine</div>
        <h1>Choose a new password</h1>
        {params.error && ERRORS[params.error] ? <div style={{ marginBottom: 12 }}><Notice kind="error">{ERRORS[params.error]}</Notice></div> : null}
        {!hasRecoverySession ? (
          <>
            <Notice kind="warning">Open this page from the reset link in your email. The link may have expired.</Notice>
            <div className="footer-links"><a href="/forgot-password">Request a new link</a></div>
          </>
        ) : (
          <form action={updatePasswordAction} className="stack">
            <div className="field">
              <label htmlFor="password">New password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required minLength={PASSWORD_MIN_LENGTH} maxLength={72} />
              <span className="hint">At least {PASSWORD_MIN_LENGTH} characters. Use a passphrase you do not use elsewhere.</span>
            </div>
            <div className="field">
              <label htmlFor="confirm">Confirm new password</label>
              <input id="confirm" name="confirm" type="password" autoComplete="new-password" required maxLength={72} />
            </div>
            <button type="submit">Update password</button>
          </form>
        )}
      </div>
    </main>
  );
}
