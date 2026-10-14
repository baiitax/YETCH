import Link from 'next/link';
import { PageHead, EmptyState, Badge } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { formatMinor } from '@/lib/domain/money';
import { loadPeople, nameOf } from '@/lib/people';
import { formatDate } from '@/lib/domain/time';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  await requireCapability('customers.read');
  const supabase = await createClient();
  const people = await loadPeople(supabase);
  const { data } = await supabase
    .from('customers')
    .select('id, name, status, contract_value_minor, currency, account_owner_id, won_at')
    .order('won_at', { ascending: false })
    .limit(200);
  const rows = data ?? [];

  return (
    <>
      <PageHead title="Customers" description="Created from closed-won deals. Each customer has an onboarding checklist. A won deal does not mean the customer has paid." />
      {rows.length === 0 ? (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <EmptyState title="No customers yet.">A customer appears here after a won deal is handed over to onboarding.</EmptyState>
        </div>
      ) : (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Customer</th><th>Status</th><th className="num">Contract value</th><th>Account owner</th><th>Won</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td><Link href={`/customers/${c.id}`}>{c.name}</Link></td>
                  <td><Badge tone={c.status === 'active' ? 'ok' : c.status === 'paused' ? 'warn' : c.status === 'ended' ? 'muted' : undefined}>{c.status}</Badge></td>
                  <td className="num">{formatMinor(BigInt(c.contract_value_minor), c.currency)}</td>
                  <td>{nameOf(people, c.account_owner_id)}</td>
                  <td className="small">{formatDate(c.won_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
