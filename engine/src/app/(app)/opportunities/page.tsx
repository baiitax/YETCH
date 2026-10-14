import Link from 'next/link';
import { PageHead, EmptyState, Badge } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { OPPORTUNITY_STAGES, OPPORTUNITY_STAGE_LABELS, type OpportunityStage } from '@/lib/domain/lifecycle';
import { formatMinor } from '@/lib/domain/money';
import { loadPeople, nameOf } from '@/lib/people';
import { SERVICE_LABELS } from '@/lib/labels';
import { formatDateTime } from '@/lib/domain/time';
import type { Opportunity } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('opportunities.read');
  const sp = await searchParams;
  const supabase = await createClient();
  const people = await loadPeople(supabase);
  const stage = OPPORTUNITY_STAGES.includes(sp.stage as OpportunityStage) ? (sp.stage as OpportunityStage) : undefined;
  let query = supabase.from('opportunities').select('*').order('updated_at', { ascending: false }).limit(200);
  if (stage) query = query.eq('stage', stage);
  const { data } = await query;
  const opps = (data ?? []) as Opportunity[];

  return (
    <>
      <PageHead title="Opportunities" description="Deals created from qualified leads. Amounts are shown in their own currency. No exchange rates are applied." />
      <form className="card" method="get" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap', margin: '16px 0' }}>
        <div className="field">
          <label htmlFor="stage">Stage</label>
          <select id="stage" name="stage" defaultValue={stage ?? ''}>
            <option value="">All stages</option>
            {OPPORTUNITY_STAGES.map((s) => <option key={s} value={s}>{OPPORTUNITY_STAGE_LABELS[s]}</option>)}
          </select>
        </div>
        <button type="submit" className="secondary">Apply</button>
      </form>

      {opps.length === 0 ? (
        <div className="table-wrap"><EmptyState title="No opportunities yet.">Convert a qualified lead to create one.</EmptyState></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Opportunity</th>
                <th>Stage</th>
                <th className="num">Amount</th>
                <th className="num">Probability</th>
                <th>Owner</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {opps.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/opportunities/${o.id}`}>{o.name}</Link>
                    <div className="small muted">{SERVICE_LABELS[o.service_of_interest ?? 'not_sure']}</div>
                  </td>
                  <td>
                    <Badge tone={o.stage === 'closed_won' ? 'won' : o.stage === 'closed_lost' ? 'lost' : undefined}>
                      {OPPORTUNITY_STAGE_LABELS[o.stage]}
                    </Badge>
                  </td>
                  <td className="num">{formatMinor(BigInt(o.amount_minor), o.currency)}</td>
                  <td className="num">{o.probability_pct === null ? 'Not set' : `${o.probability_pct}%`}</td>
                  <td>{nameOf(people, o.owner_id)}</td>
                  <td className="small">{formatDateTime(o.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
