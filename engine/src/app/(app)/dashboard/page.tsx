import Link from 'next/link';
import { PageHead, Stat, EmptyState, ResultNotice } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can } from '@/lib/domain/rbac';
import { formatMinor } from '@/lib/domain/money';
import { pipeline, averageWonValue } from '@/lib/domain/metrics';
import { taskTimeState, formatDateTime } from '@/lib/domain/time';
import { LEAD_STATUS_LABELS, OPPORTUNITY_STAGE_LABELS, OPEN_STAGES } from '@/lib/domain/lifecycle';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import { requireCapability } from '@/lib/authz';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const session = await getSession();
  if (session.state !== 'active') await requireCapability('leads.read'); // redirects to sign-in when needed
  if (session.state !== 'active') return null;
  const role = session.role;
  const supabase = await createClient();
  const now = new Date();
  const count = async (table: string, build: (q: any) => any) => {
    const { count: n } = await build(supabase.from(table).select('id', { count: 'exact', head: true }));
    return n ?? 0;
  };

  const canLeads = can(role, 'leads.read');
  const canOpps = can(role, 'opportunities.read');
  const canTasks = can(role, 'tasks.read');
  const canProps = can(role, 'proposals.read');

  const [
    awaitingFirstContact,
    qualifiedNow,
    proposalsSent,
    openOpps,
    wonOpps,
    openTasks,
    recentActivity,
  ] = await Promise.all([
    canLeads ? count('leads', (q) => q.in('status', ['new', 'awaiting_review', 'contact_attempted'])) : 0,
    canLeads ? count('leads', (q) => q.eq('status', 'qualified')) : 0,
    canProps ? count('proposals', (q) => q.eq('status', 'sent')) : 0,
    canOpps ? supabase.from('opportunities').select('amount_minor, currency, probability_pct, stage').in('stage', OPEN_STAGES as unknown as string[]) : Promise.resolve({ data: [] }),
    canOpps ? supabase.from('opportunities').select('final_value_minor, currency').eq('stage', 'closed_won') : Promise.resolve({ data: [] }),
    canTasks ? supabase.from('tasks').select('id, title, due_at, status, lead_id, opportunity_id').in('status', ['open', 'in_progress']).order('due_at', { ascending: true }).limit(500) : Promise.resolve({ data: [] }),
    canLeads ? supabase.from('leads').select('id, first_name, last_name, status, last_activity_at').not('last_activity_at', 'is', null).order('last_activity_at', { ascending: false }).limit(6) : Promise.resolve({ data: [] }),
  ]);

  const open = (openOpps.data ?? []).map((o: any) => ({
    amountMinor: BigInt(o.amount_minor),
    currency: o.currency as string,
    probabilityPct: o.probability_pct as number | null,
  }));
  const pipe = pipeline(open);
  const won = (wonOpps.data ?? []).map((o: any) => ({ finalValueMinor: BigInt(o.final_value_minor), currency: o.currency as string }));
  const avgWon = averageWonValue(won);
  const tasks = (openTasks.data ?? []).map((t: any) => ({ ...t, state: taskTimeState({ status: t.status, dueAt: new Date(t.due_at) }, now) }));
  const overdue = tasks.filter((t) => t.state === 'overdue');
  const dueToday = tasks.filter((t) => t.state === 'due_today');
  const wonCount = won.length;
  const qualifiedDenominator = qualifiedNow;

  return (
    <>
      <PageHead title="Dashboard" description={`Welcome${session.fullName ? `, ${session.fullName}` : ''}. Figures are live and limited to records you can see.`} />
      <ResultNotice error={sp.error ? messageFor(sp.error) ?? undefined : undefined} notice={noticeText(sp.notice) ?? undefined} />

      <div className="grid grid-4" style={{ marginTop: 16 }}>
        {canLeads ? <Stat label="Awaiting first contact" value={awaitingFirstContact} hint="New, awaiting review, or contact attempted" /> : null}
        {canLeads ? <Stat label="Qualified leads" value={qualifiedDenominator} hint="Currently in qualified status" /> : null}
        {canOpps ? <Stat label="Open opportunities" value={open.length} hint={pipe.length ? pipe.map((p) => `${p.currency} ${formatMinor(p.unweightedMinor, p.currency).replace(p.currency + ' ', '')}`).join(' · ') : 'No open pipeline value yet'} /> : null}
        {canProps ? <Stat label="Proposals awaiting decision" value={proposalsSent} hint="Sent to client, no outcome recorded" /> : null}
        {canOpps ? <Stat label="Won deals" value={wonCount} hint={avgWon.length ? `Average ${avgWon.map((a) => formatMinor(a.averageMinor ?? 0n, a.currency)).join(' · ')}` : 'Average won value: N/A'} /> : null}
        {canTasks ? <Stat label="Overdue follow-ups" value={overdue.length} hint={`${dueToday.length} due today`} /> : null}
      </div>

      {canOpps && pipe.length > 0 ? (
        <section className="card">
          <h2>Open pipeline</h2>
          <p className="small muted">Amounts are shown per currency and are never added together. Weighted values use only opportunities with a probability set. No exchange rates are applied.</p>
          <div className="table-wrap" style={{ border: 0 }}>
            <table>
              <thead><tr><th>Currency</th><th className="num">Unweighted</th><th className="num">Weighted</th><th className="num">Without probability</th></tr></thead>
              <tbody>
                {pipe.map((p) => (
                  <tr key={p.currency}>
                    <td>{p.currency}</td>
                    <td className="num">{formatMinor(p.unweightedMinor, p.currency)}</td>
                    <td className="num">{p.withoutProbability === p.count ? 'N/A' : formatMinor(p.weightedMinor, p.currency)}</td>
                    <td className="num">{p.withoutProbability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h2>Follow-ups that need attention</h2>
          {!canTasks ? <p className="muted small">Not part of your role.</p> : tasks.length === 0 ? (
            <EmptyState title="No open follow-ups.">Schedule a follow-up from a lead or an opportunity.</EmptyState>
          ) : (
            <ul style={{ paddingInlineStart: 18, margin: 0 }}>
              {[...overdue, ...dueToday].slice(0, 8).map((t) => (
                <li key={t.id} style={{ marginBottom: 6 }}>
                  <span className={t.state === 'overdue' ? 'overdue' : ''}>{t.state === 'overdue' ? 'Overdue: ' : 'Today: '}</span>
                  {t.title} <span className="small muted">({formatDateTime(t.due_at)})</span>
                </li>
              ))}
              {overdue.length + dueToday.length === 0 ? <li className="muted">Nothing overdue or due today.</li> : null}
            </ul>
          )}
          {canTasks ? <p style={{ marginTop: 10 }}><Link href="/follow-ups">All follow-ups</Link></p> : null}
        </section>

        <section className="card">
          <h2>Recent lead activity</h2>
          {!canLeads ? <p className="muted small">Not part of your role.</p> : (recentActivity.data ?? []).length === 0 ? (
            <EmptyState title="No lead activity yet.">Create a lead to start.</EmptyState>
          ) : (
            <ul style={{ paddingInlineStart: 18, margin: 0 }}>
              {(recentActivity.data ?? []).map((l: any) => (
                <li key={l.id} style={{ marginBottom: 6 }}>
                  <Link href={`/leads/${l.id}`}>{l.first_name} {l.last_name}</Link>{' '}
                  <span className="badge muted">{LEAD_STATUS_LABELS[l.status as keyof typeof LEAD_STATUS_LABELS] ?? l.status}</span>
                  <div className="small muted">{formatDateTime(l.last_activity_at)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {canLeads && canOpps ? (
        <p className="small muted" style={{ marginTop: 16 }}>
          Conversion, win and acceptance rates are on the <Link href="/reports">Reports</Link> page, with formulas. A zero denominator shows N/A.
        </p>
      ) : null}
    </>
  );
}
