import { PageHead, EmptyState } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { loadPeople, nameOf } from '@/lib/people';
import { formatDateTime } from '@/lib/domain/time';

export const dynamic = 'force-dynamic';

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('audit.read');
  const sp = await searchParams;
  const supabase = await createClient();
  const people = await loadPeople(supabase);
  let query = supabase.from('audit_events').select('*').order('occurred_at', { ascending: false }).limit(200);
  const entity = (sp.entity ?? '').replace(/[^a-z_]/g, '').slice(0, 40);
  if (entity) query = query.eq('entity', entity);
  const { data } = await query;
  const rows = data ?? [];

  return (
    <>
      <PageHead title="Audit log" description="Written by database triggers. Entries cannot be edited or deleted by any user. Values are not recorded; only the names of changed fields are." />
      <form className="card" method="get" style={{ display: 'flex', gap: 10, alignItems: 'end', margin: '16px 0' }}>
        <div className="field">
          <label htmlFor="entity">Record type</label>
          <select id="entity" name="entity" defaultValue={entity}>
            <option value="">All</option>
            {['leads', 'companies', 'contacts', 'opportunities', 'proposals', 'customers', 'tasks', 'onboarding_items', 'profiles'].map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <button type="submit" className="secondary">Apply</button>
      </form>
      {rows.length === 0 ? <div className="table-wrap"><EmptyState title="No audit entries." /></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Record</th><th>Changed fields</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="small">{formatDateTime(r.occurred_at)}</td>
                  <td>{r.actor_id ? nameOf(people, r.actor_id) : 'System or SQL editor'}</td>
                  <td>{r.action}</td>
                  <td className="mono small">{r.entity} · {String(r.entity_id).slice(0, 8)}</td>
                  <td className="small">{(r.changed_fields ?? []).join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
