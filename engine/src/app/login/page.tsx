import { isAuthConfigured } from '@/lib/config';
import { signInAction } from '@/lib/actions/auth';
import { safeNextPath } from '@/lib/security';
import { Notice } from '@/components/ui';

export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  invalid_credentials: 'The email or password is incorrect, or the account is not available. Check the details and try again.',
  rate_limited: 'Too many attempts. Wait a few minutes before trying again.',
  link_invalid: 'That link is invalid or has expired. Request a new one.',
};

const NOTICES: Record<string, string> = {
  password_updated: 'Your password has been updated. Sign in with the new password.',
  signed_out: 'You have signed out.',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const configured = isAuthConfigured();
  const next = safeNextPath(params.next, '/dashboard');

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div className="brand-line">YECH Commercial Engine</div>
        <h1>Staff sign in</h1>
        <p className="muted small">Accounts are created by invitation or by an administrator. There is no public sign-up.</p>

        {!configured ? (
          <Notice kind="warning">
            <strong>Sign-in is not configured for this environment.</strong> The Supabase project URL and anon key have not
            been set, so no account can sign in yet. Set the environment variables described in the setup guide, then reload.
          </Notice>
        ) : null}
        {params.error && ERRORS[params.error] ? <div style={{ marginTop: 12 }}><Notice kind="error">{ERRORS[params.error]}</Notice></div> : null}
        {params.notice && NOTICES[params.notice] ? <div style={{ marginTop: 12 }}><Notice kind="success">{NOTICES[params.notice]}</Notice></div> : null}

        <form action={signInAction} className="stack" style={{ marginTop: 16 }}>
          <input type="hidden" name="next" value={next} />
          <div className="field">
            <label htmlFor="email">Work email</label>
            <input id="email" name="email" type="email" autoComplete="username" required disabled={!configured} maxLength={254} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required disabled={!configured} maxLength={72} />
          </div>
          <button type="submit" disabled={!configured}>Sign in</button>
        </form>

        <div className="footer-links">
          <a href="/forgot-password">Forgot your password?</a>
          <span className="muted small">Need access? Ask a founder or administrator.</span>
        </div>
      </div>
    </main>
  );
}
