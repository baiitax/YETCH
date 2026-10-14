import Link from 'next/link';
import { PageHead, EmptyState, Badge } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from '@/lib/domain/lifecycle';
import { loadPeople, nameOf } from '@/lib/people';
import { LEAD_SOURCE_LABELS } from '@/lib/labels';
import { formatDateTime } from '@/lib/domain/time';
import { can } from '@/lib/domain/rbac';
import { ResultNotice } from '@/components/ui';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import type { Lead } from '@/lib/types';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

// Free-text search is sanitised so that user input cannot change the filter structure.
function safeSearch(value: string | undefined): string {
  return (value ?? '').replace(/[%_,()*\\]/g, ' ').trim().slice(0, 80);
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('leads.read');
  const params = await searchParams;
  const session = await getSession();
  const role = session.state === 'active' ? session.role : null;
  const supabase = await createClient();
  const people = await loadPeople(supabase);
  const status = LEAD_STATUSES.includes(params.status as LeadStatus) ? (params.status as LeadStatus) : undefined;
  const scope = params.scope === 'mine' || params.scope === 'unassigned' ? params.scope : 'all';
  const q = safeSearch(params.q);
  const page = Math.max(1, Math.min(200, Number.parseInt(params.page ?? '1', 10) || 1));

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) query = query.eq('status', status);
  if (scope === 'mine' && session.state === 'active') query = query.eq('owner_id', session.userId);
  if (scope === 'unassigned') query = query.is('owner_id', null);
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,company_name.ilike.%${q}%,email_normalized.ilike.%${q}%`);

  const { data, count, error } = await query;
  const leads = (data ?? []) as Lead[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const makeHref = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    const merged = { status, scope: scope !== 'all' ? scope : undefined, q: q || undefined, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    const qs = sp.toString();
    return qs ? `/leads?${qs}` : '/leads';
  };

  return (
    <>
      <PageHead title="Leads" description="New enquiries and contacts awaiting qualification. Qualifying a lead requires recorded evidence.">
        {role && can(role, 'leads.write') ? <Link href="/leads/new" className="button">New lead</Link> : null}
      </PageHead>
      <ResultNotice notice={noticeText(params.notice) ?? undefined} error={params.error ? messageFor(params.error) ?? undefined : undefined} />

      <form className="card" method="get" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'end', margin: '16px 0' }}>
        <div className="field" style={{ minWidth: 200 }}>
          <label htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, company or email" maxLength={80} />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status ?? ''}>
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="scope">Owner</label>
          <select id="scope" name="scope" defaultValue={scope}>
            <option value="all">Everyone visible to me</option>
            <option value="mine">Assigned to me</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
        <button type="submit" className="secondary">Apply</button>
      </form>

      {error ? <div className="notice error" role="alert">The list could not be loaded. Refresh the page.</div> : null}

      {leads.length === 0 && !error ? (
        <div className="table-wrap">
          <EmptyState title="No leads match these filters.">
            {status || scope !== 'all' || q ? 'Clear the filters to see all visible leads.' : 'Add the first lead to start the pipeline.'}
          </EmptyState>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Company</th>
                <th>Original source</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <Link href={`/leads/${lead.id}`}>{lead.first_name} {lead.last_name}</Link>
                    <div className="small muted">{lead.email ?? lead.phone ?? ''}</div>
                  </td>
                  <td>{lead.company_name ?? '—'}</td>
                  <td>{LEAD_SOURCE_LABELS[lead.original_source] ?? lead.original_source}</td>
                  <td>
                    <Badge tone={lead.status === 'qualified' || lead.status.startsWith('converted') ? 'ok' : lead.status === 'disqualified' ? 'bad' : undefined}>
                      {LEAD_STATUS_LABELS[lead.status]}
                    </Badge>
                  </td>
                  <td>{nameOf(people, lead.owner_id)}</td>
                  <td className="small">{formatDateTime(lead.last_activity_at ?? lead.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error ? null : (
        <nav className="actions" aria-label="Pagination" style={{ marginTop: 12, justifyContent: 'space-between' }}>
          <span className="small muted">{total} lead{total === 1 ? '' : 's'} visible to you</span>
          <span className="actions">
            {page > 1 ? <Link className="button secondary" href={makeHref({ page: String(page - 1) })}>Previous</Link> : null}
            <span className="small">Page {page} of {pages}</span>
            {page < pages ? <Link className="button secondary" href={makeHref({ page: String(page + 1) })}>Next</Link> : null}
          </span>
        </nav>
      )}
    </>
  );
}
