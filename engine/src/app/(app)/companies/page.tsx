import { PageHead, EmptyState, ResultNotice } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can } from '@/lib/domain/rbac';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import { createCompanyAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('companies.read');
  const sp = await searchParams;
  const session = await getSession();
  const canWrite = session.state === 'active' && can(session.role, 'companies.write');
  const supabase = await createClient();
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, arabic_name, industry, city, website, created_at')
    .order('name', { ascending: true })
    .limit(200);

  return (
    <>
      <PageHead title="Companies" description="Organisations you are working with. Records are created from leads or here, and are never imported from unverified lists." />
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />

      {canWrite ? (
        <form action={createCompanyAction} className="card stack" style={{ margin: '16px 0' }}>
          <h2>Add company</h2>
          <div className="fields">
            <div className="field"><label htmlFor="name">Company name *</label><input id="name" name="name" required minLength={2} maxLength={160} /></div>
            <div className="field"><label htmlFor="arabic_name">Arabic name (optional)</label><input id="arabic_name" name="arabic_name" maxLength={160} dir="auto" /></div>
            <div className="field"><label htmlFor="industry">Industry</label><input id="industry" name="industry" maxLength={120} /></div>
            <div className="field"><label htmlFor="city">City</label><input id="city" name="city" maxLength={80} /></div>
            <div className="field"><label htmlFor="website">Website</label><input id="website" name="website" maxLength={200} /></div>
            <div className="field"><label htmlFor="size_band">Size</label><input id="size_band" name="size_band" maxLength={40} /></div>
          </div>
          <div><button type="submit">Save company</button></div>
        </form>
      ) : null}

      {(companies ?? []).length === 0 ? (
        <div className="table-wrap"><EmptyState title="No companies yet." /></div>
      ) : (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Company</th><th>Industry</th><th>City</th><th>Website</th></tr></thead>
            <tbody>
              {(companies ?? []).map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong>{c.arabic_name ? <div className="small" dir="auto">{c.arabic_name}</div> : null}</td>
                  <td>{c.industry ?? '—'}</td>
                  <td>{c.city ?? '—'}</td>
                  <td>{c.website ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
