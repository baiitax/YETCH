import Link from 'next/link';
import { PageHead, EmptyState, Badge } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { PROPOSAL_STATUSES, PROPOSAL_STATUS_LABELS, type ProposalStatus } from '@/lib/domain/lifecycle';
import { formatMinor } from '@/lib/domain/money';
import { formatDateTime } from '@/lib/domain/time';
import type { Proposal } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ProposalsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('proposals.read');
  const sp = await searchParams;
  const status = PROPOSAL_STATUSES.includes(sp.status as ProposalStatus) ? (sp.status as ProposalStatus) : undefined;
  const supabase = await createClient();
  let query = supabase.from('proposals').select('*, opportunities(name)').order('created_at', { ascending: false }).limit(200);
  if (status) query = query.eq('status', status);
  const { data } = await query;
  const rows = (data ?? []) as Array<Proposal & { opportunities: { name: string } | null }>;

  return (
    <>
      <PageHead title="Proposals" description="Drafts, approvals and recorded outcomes. Acceptance is recorded only by a manager, with evidence." />
      <form className="card" method="get" style={{ display: 'flex', gap: 10, alignItems: 'end', margin: '16px 0' }}>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status ?? ''}>
            <option value="">All</option>
            {PROPOSAL_STATUSES.map((s) => <option key={s} value={s}>{PROPOSAL_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <button type="submit" className="secondary">Apply</button>
      </form>
      {rows.length === 0 ? (
        <div className="table-wrap"><EmptyState title="No proposals match.">Create a draft from an opportunity.</EmptyState></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Number</th><th>Proposal</th><th className="num">Monthly fee</th><th>Status</th><th>Updated</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="mono small"><Link href={`/proposals/${p.id}`}>{p.proposal_number}</Link></td>
                  <td>{p.title}<div className="small muted">{p.opportunities?.name ?? ''} · v{p.version}</div></td>
                  <td className="num">{formatMinor(BigInt(p.recurring_fee_minor), p.currency)}</td>
                  <td><Badge tone={p.status === 'accepted' ? 'won' : p.status === 'rejected' ? 'lost' : undefined}>{PROPOSAL_STATUS_LABELS[p.status]}</Badge></td>
                  <td className="small">{formatDateTime((p as unknown as { created_at: string }).created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
