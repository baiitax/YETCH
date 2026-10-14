import { PageHead, EmptyState, ResultNotice } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { leadFunnel, sourceBreakdown, proposalAcceptance, averageWonValue, pipeline } from '@/lib/domain/metrics';
import { formatMinor } from '@/lib/domain/money';
import { dayKey, ENGINE_TIMEZONE } from '@/lib/domain/time';
import { OPEN_STAGES } from '@/lib/domain/lifecycle';
import { LEAD_SOURCE_LABELS } from '@/lib/labels';
import { messageFor } from '@/lib/errors';

export const dynamic = 'force-dynamic';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ROWS = 5000;

function windowFrom(params: Record<string, string | undefined>) {
  const today = dayKey(new Date());
  const defaultFrom = dayKey(new Date(Date.now() - 90 * 86400000));
  const from = DATE.test(params.from ?? '') ? params.from! : defaultFrom;
  const to = DATE.test(params.to ?? '') ? params.to! : today;
  // "to" is inclusive in the form, so the exclusive upper bound is the following day.
  const fromInstant = new Date(`${from}T00:00:00+03:00`);
  const toInstant = new Date(new Date(`${to}T00:00:00+03:00`).getTime() + 86400000);
  return { from, to, fromInstant, toInstant, valid: fromInstant < toInstant };
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('reports.read');
  const sp = await searchParams;
  const w = windowFrom(sp);
  const supabase = await createClient();

  const { data: leadRows } = await supabase
    .from('leads')
    .select('id, created_at, qualified_at, original_source')
    .gte('created_at', w.fromInstant.toISOString())
    .lt('created_at', w.toInstant.toISOString())
    .limit(MAX_ROWS);
  const leads = leadRows ?? [];
  const leadIds = leads.map((l) => l.id);
  const { data: wonRows } = leadIds.length
    ? await supabase.from('opportunities').select('lead_id').eq('stage', 'closed_won').in('lead_id', leadIds.slice(0, 1000))
    : { data: [] as Array<{ lead_id: string | null }> };
  const wonLeadIds = new Set((wonRows ?? []).map((r) => r.lead_id));

  const { data: proposalRows } = await supabase
    .from('proposals')
    .select('status, sent_at')
    .gte('sent_at', w.fromInstant.toISOString())
    .lt('sent_at', w.toInstant.toISOString())
    .limit(MAX_ROWS);

  const { data: wonDeals } = await supabase
    .from('opportunities')
    .select('final_value_minor, currency, won_at')
    .eq('stage', 'closed_won')
    .gte('won_at', w.fromInstant.toISOString())
    .lt('won_at', w.toInstant.toISOString())
    .limit(MAX_ROWS);

  const { data: openOpps } = await supabase
    .from('opportunities')
    .select('amount_minor, currency, probability_pct')
    .in('stage', OPEN_STAGES as unknown as string[])
    .limit(MAX_ROWS);

  const funnel = leadFunnel(
    leads.map((l) => ({ createdAt: new Date(l.created_at), qualifiedAt: l.qualified_at ? new Date(l.qualified_at) : null, hasWonOpportunity: wonLeadIds.has(l.id) })),
    w.fromInstant,
    w.toInstant,
  );
  const sources = sourceBreakdown(leads.map((l) => ({ originalSource: l.original_source })));
  const acceptance = proposalAcceptance((proposalRows ?? []).map((p) => ({ status: p.status, sentAt: p.sent_at ? new Date(p.sent_at) : null })));
  const won = averageWonValue((wonDeals ?? []).map((d) => ({ finalValueMinor: BigInt(d.final_value_minor ?? 0), currency: d.currency })));
  const pipe = pipeline((openOpps ?? []).map((o) => ({ amountMinor: BigInt(o.amount_minor), currency: o.currency, probabilityPct: o.probability_pct })));
  const truncated = leads.length >= MAX_ROWS || (proposalRows ?? []).length >= MAX_ROWS;

  return (
    <>
      <PageHead title="Reports" description={`Calculated from records you can see. Dates use ${ENGINE_TIMEZONE} time.`} />
      {!w.valid ? <ResultNotice error="invalid_value" /> : null}
      {truncated ? <ResultNotice error="failed" /> : null}

      <form className="card" method="get" style={{ display: 'flex', gap: 10, alignItems: 'end', flexWrap: 'wrap', margin: '16px 0' }}>
        <div className="field"><label htmlFor="from">From</label><input id="from" name="from" type="date" defaultValue={w.from} /></div>
        <div className="field"><label htmlFor="to">To (inclusive)</label><input id="to" name="to" type="date" defaultValue={w.to} /></div>
        <button type="submit" className="secondary">Update</button>
      </form>

      <div className="grid grid-2">
        <section className="card">
          <h2>Lead funnel (cohort)</h2>
          <p className="small muted">Leads created in the window. Qualified = ever qualified. Won = a closed-won opportunity linked to the lead.</p>
          {funnel.totalLeads === 0 ? <EmptyState title="No leads created in this window." /> : (
            <table>
              <tbody>
                <tr><td>Leads created</td><td className="num">{funnel.totalLeads}</td></tr>
                <tr><td>Qualified</td><td className="num">{funnel.qualifiedLeads}</td></tr>
                <tr><td>Won from qualified</td><td className="num">{funnel.wonFromQualified}</td></tr>
                <tr><td>Qualification rate <div className="small muted">qualified ÷ leads created</div></td><td className="num">{funnel.qualificationRate.display}</td></tr>
                <tr><td>Qualified-to-won rate <div className="small muted">won ÷ qualified</div></td><td className="num">{funnel.qualifiedToWonRate.display}</td></tr>
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <h2>Original source</h2>
          <p className="small muted">Counted by the source recorded when the lead was created. Later edits never change it.</p>
          {sources.length === 0 ? <EmptyState title="No leads in this window." /> : (
            <table>
              <thead><tr><th>Source</th><th className="num">Leads</th><th className="num">Share</th></tr></thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.source}><td>{LEAD_SOURCE_LABELS[s.source] ?? s.source}</td><td className="num">{s.count}</td><td className="num">{s.share.display}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h2>Proposals</h2>
          <p className="small muted">Proposals sent in the window. Acceptance rate = recorded acceptances ÷ proposals sent. Still-open proposals stay in the denominator.</p>
          <table>
            <tbody>
              <tr><td>Proposals sent</td><td className="num">{acceptance.sent}</td></tr>
              <tr><td>Recorded as accepted</td><td className="num">{acceptance.accepted}</td></tr>
              <tr><td>Acceptance rate</td><td className="num">{acceptance.rate.display}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>Won deals</h2>
          <p className="small muted">Won in the window. Average = total final value ÷ number of won deals, per currency.</p>
          {won.length === 0 ? <table><tbody><tr><td>Deals won</td><td className="num">0</td></tr><tr><td>Average won value</td><td className="num">N/A</td></tr></tbody></table> : (
            <table>
              <thead><tr><th>Currency</th><th className="num">Won</th><th className="num">Average</th></tr></thead>
              <tbody>
                {won.map((r) => (
                  <tr key={r.currency}><td>{r.currency}</td><td className="num">{r.count}</td><td className="num">{r.averageMinor === null ? 'N/A' : formatMinor(r.averageMinor, r.currency)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Open pipeline (now)</h2>
        <p className="small muted">Unweighted = sum of open amounts. Weighted = amount × probability, only where a probability is set. Currencies are never added together.</p>
        {pipe.length === 0 ? <EmptyState title="No open opportunities." /> : (
          <table>
            <thead><tr><th>Currency</th><th className="num">Open deals</th><th className="num">Unweighted</th><th className="num">Weighted</th><th className="num">No probability set</th></tr></thead>
            <tbody>
              {pipe.map((p) => (
                <tr key={p.currency}>
                  <td>{p.currency}</td>
                  <td className="num">{p.count}</td>
                  <td className="num">{formatMinor(p.unweightedMinor, p.currency)}</td>
                  <td className="num">{p.withoutProbability === p.count ? 'N/A' : formatMinor(p.weightedMinor, p.currency)}</td>
                  <td className="num">{p.withoutProbability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <p className="small muted" style={{ marginTop: 16 }}>
        Formulas: a zero denominator shows N/A and is never treated as zero. Percentages are rounded to one decimal place for display only.
        Advertising spend is not included in any figure here.
      </p>
    </>
  );
}
