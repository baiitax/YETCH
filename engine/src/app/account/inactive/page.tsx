import { signOutAction } from '@/lib/actions/auth';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Notice } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function InactivePage() {
  const session = await getSession();
  if (session.state === 'active') redirect('/dashboard');
  if (session.state === 'signed_out' || session.state === 'unconfigured') redirect('/login');
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <div className="brand-line">YECH Commercial Engine</div>
        <h1>Account awaiting activation</h1>
        <Notice kind="info">
          You are signed in, but your account has not been activated with a role yet. An administrator must assign your role
          before you can use the engine. You have no access to commercial data until then.
        </Notice>
        <form action={signOutAction} style={{ marginTop: 16 }}>
          <button type="submit" className="secondary">Sign out</button>
        </form>
      </div>
    </main>
  );
}
