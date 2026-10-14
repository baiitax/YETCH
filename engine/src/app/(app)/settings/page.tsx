import { PageHead, Badge } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { getSession } from '@/lib/session';
import { isAuthConfigured, isResetConfigured, serviceRoleKey, config } from '@/lib/config';
import { ROLE_LABELS, ROLE_CAPABILITIES, ROLES, CAPABILITIES } from '@/lib/domain/rbac';
import { ENGINE_TIMEZONE } from '@/lib/domain/time';
import { PACKAGES, ADVERTISING_SPEND_NOTE } from '@/lib/domain/packages';

export const dynamic = 'force-dynamic';

function Row({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <tr>
      <td>{label}</td>
      <td>{ok ? <Badge tone="ok">Configured</Badge> : <Badge tone="warn">Not configured</Badge>}</td>
      <td className="small muted">{detail ?? ''}</td>
    </tr>
  );
}

export default async function SettingsPage() {
  await requireCapability('leads.read');
  const session = await getSession();
  const role = session.state === 'active' ? session.role : null;

  return (
    <>
      <PageHead title="Settings" description="Configuration status and reference information. Secret values are never displayed." />

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Configuration status</h2>
        <div className="table-wrap" style={{ border: 0 }}>
          <table>
            <thead><tr><th>Item</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>
              <Row label="Sign-in (Supabase URL and anon key)" ok={isAuthConfigured()} detail="Required for any account to sign in." />
              <Row label="Password reset email" ok={isResetConfigured()} detail="Needs the public engine address." />
              <Row label="Staff invitations" ok={serviceRoleKey() !== null} detail="Server-side only. The key is never shown." />
              <Row label="Public engine address" ok={/^https?:\/\//.test(config.publicUrl)} detail={config.publicUrl || 'Not set'} />
              <Row label="Public website link" ok={/^https?:\/\//.test(config.websiteUrl)} detail={config.websiteUrl || 'Not set'} />
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Reference</h2>
        <ul className="small" style={{ paddingInlineStart: 18 }}>
          <li>Display timezone for day boundaries and overdue status: {ENGINE_TIMEZONE}.</li>
          <li>Currency: SAR by default, stored in minor units (halalas). No exchange rates are used anywhere.</li>
          <li>Service packages (monthly, provisional): {Object.values(PACKAGES).map((p) => `${p.label}: ${p.priceNote}`).join('; ')}.</li>
          <li>{ADVERTISING_SPEND_NOTE}</li>
          <li>Pipeline stages are fixed in this release. Editing them is not yet available.</li>
          <li>Your role: {role ? ROLE_LABELS[role] : 'not assigned'}.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Role capabilities</h2>
        <p className="small muted">Enforced on the server and in the database. A hidden button is not a permission.</p>
        <div className="table-wrap" style={{ border: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                {ROLES.map((r) => <th key={r} className="num" style={{ textAlign: 'center' }}>{ROLE_LABELS[r].split(' ')[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map((c) => (
                <tr key={c}>
                  <td className="mono small">{c}</td>
                  {ROLES.map((r) => (
                    <td key={r} style={{ textAlign: 'center' }}>{ROLE_CAPABILITIES[r].has(c) ? '✓' : '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
