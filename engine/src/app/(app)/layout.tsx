import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { Shell } from '@/components/shell';

export const dynamic = 'force-dynamic';

// Every page under (app) requires an active, role-assigned account. Checked on the server for each request.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (session.state === 'unconfigured') redirect('/login?status=unconfigured');
  if (session.state === 'signed_out') redirect('/login');
  if (session.state === 'inactive') redirect('/account/inactive');
  return <Shell session={session}>{children}</Shell>;
}
