import { requestResetAction } from '@/lib/actions/auth';
import { isResetConfigured } from '@/lib/config';
import { Notice } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const configured = isResetConfigured();

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div className="brand-line">YECH Commercial Engine</div>
        <h1>Reset your password</h1>
        {!configured ? (
          <Notice kind="warning">
            Password reset email is not configured for this environment. Ask an administrator to reset your password.
          </Notice>
        ) : null}
        {params.sent ? (
          <Notice kind="info">
            If an account exists for that address, a reset link has been sent. Check your inbox and spam folder. The link expires after a short time.
          </Notice>
        ) : (
          <form action={requestResetAction} className="stack" style={{ marginTop: 14 }}>
            <p className="muted small">Enter your work email. We will send a link if an account exists.</p>
            <div className="field">
              <label htmlFor="email">Work email</label>
              <input id="email" name="email" type="email" autoComplete="username" required disabled={!configured} maxLength={254} />
            </div>
            <button type="submit" disabled={!configured}>Send reset link</button>
          </form>
        )}
        <div className="footer-links"><a href="/login">Back to sign in</a></div>
      </div>
    </main>
  );
}
