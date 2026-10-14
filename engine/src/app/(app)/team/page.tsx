import { PageHead, EmptyState, ResultNotice, Badge, Notice } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { ROLES, ROLE_LABELS, type Role } from '@/lib/domain/rbac';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import { formatDateTime } from '@/lib/domain/time';
import { serviceRoleKey, isResetConfigured } from '@/lib/config';
import { updateTeamMemberAction, inviteStaffAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function TeamPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('users.manage');
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: true });
  const people = data ?? [];
  const inviteReady = serviceRoleKey() !== null && isResetConfigured();

  return (
    <>
      <PageHead title="Team" description="Accounts are created by invitation or by an administrator. A new account has no access until a founder assigns a role and activates it." />
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Invite a staff member</h2>
        {!inviteReady ? (
          <Notice kind="warning">Invitations are not configured. Set the server-side invitation key and the public engine address, then reload. Until then, create accounts in the Supabase dashboard and activate them below.</Notice>
        ) : (
          <form action={inviteStaffAction} className="inline-form">
            <label htmlFor="invite_email">Work email</label>
            <input id="invite_email" name="email" type="email" required maxLength={254} />
            <button type="submit">Send invitation</button>
          </form>
        )}
        <p className="small muted" style={{ marginTop: 10 }}>The invited person sets a password through the email link. They stay inactive until a founder assigns a role.</p>
      </section>

      {people.length === 0 ? <div className="table-wrap" style={{ marginTop: 16 }}><EmptyState title="No accounts yet." /></div> : (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Person</th><th>Role</th><th>Active</th><th>Created</th><th>Save</th></tr></thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.full_name || '(no name)'}</strong>
                    <div className="small muted">{p.email}</div>
                  </td>
                  <td colSpan={1}>
                    <form action={updateTeamMemberAction} id={`form-${p.id}`} className="inline-form">
                      <input type="hidden" name="user_id" value={p.id} />
                      <label htmlFor={`role-${p.id}`} className="sr-only">Role for {p.email}</label>
                      <select id={`role-${p.id}`} name="role" defaultValue={p.role as Role}>
                        {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                      <label htmlFor={`active-${p.id}`} className="sr-only">Active for {p.email}</label>
                      <select id={`active-${p.id}`} name="is_active" defaultValue={p.is_active ? 'true' : 'false'}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                      <button type="submit" className="secondary">Save</button>
                    </form>
                  </td>
                  <td>{p.is_active ? <Badge tone="ok">Active</Badge> : <Badge tone="warn">Inactive</Badge>}</td>
                  <td className="small">{formatDateTime(p.created_at)}</td>
                  <td />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="small muted" style={{ marginTop: 12 }}>You cannot remove your own founder role here; a second founder must make that change. Every change is recorded in the audit log.</p>
    </>
  );
}
