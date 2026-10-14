import 'server-only';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { can, type Capability } from '@/lib/domain/rbac';

/**
 * Server-side authorisation for every server action. Hiding a button is not a control; this check is.
 * The database policies enforce the same capabilities again for each query.
 */
export async function requireCapability(capability: Capability) {
  const session = await getSession();
  if (session.state === 'unconfigured') redirect('/login?status=unconfigured');
  if (session.state === 'signed_out') redirect('/login');
  if (session.state === 'inactive') redirect('/account/inactive');
  if (!can(session.role, capability)) redirect('/dashboard?error=not_allowed');
  return session;
}
