import type { ReactNode } from 'react';
import { signOutAction } from '@/lib/actions/auth';
import { can, ROLE_LABELS, type Capability } from '@/lib/domain/rbac';
import type { Session } from '@/lib/session';

type Item = { href: string; label: string; capability?: Capability };
type Group = { title: string; items: Item[] };

const GROUPS: Group[] = [
  { title: 'Work', items: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/leads', label: 'Leads', capability: 'leads.read' },
    { href: '/follow-ups', label: 'Follow-ups', capability: 'tasks.read' },
  ] },
  { title: 'Pipeline', items: [
    { href: '/companies', label: 'Companies', capability: 'companies.read' },
    { href: '/opportunities', label: 'Opportunities', capability: 'opportunities.read' },
    { href: '/proposals', label: 'Proposals', capability: 'proposals.read' },
    { href: '/customers', label: 'Customers', capability: 'customers.read' },
  ] },
  { title: 'Management', items: [
    { href: '/reports', label: 'Reports', capability: 'reports.read' },
    { href: '/team', label: 'Team', capability: 'users.manage' },
    { href: '/audit', label: 'Audit log', capability: 'audit.read' },
    { href: '/settings', label: 'Settings' },
  ] },
];

export function Shell({ session, children }: { session: Extract<Session, { state: 'active' }>; children: ReactNode }) {
  const role = session.role;
  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Main">
        <div className="brand">
          <strong>YECH</strong>
          <span>Commercial Engine</span>
        </div>
        <nav className="nav" aria-label="Sections">
          {GROUPS.map((group) => {
            const visible = group.items.filter((i) => !i.capability || can(role, i.capability));
            if (visible.length === 0) return null;
            return (
              <div key={group.title}>
                <div className="group">{group.title}</div>
                {visible.map((item) => (
                  <a key={item.href} href={item.href}>{item.label}</a>
                ))}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div>{session.fullName || session.email}</div>
          <div>{ROLE_LABELS[role]}</div>
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="main" id="main">{children}</main>
    </div>
  );
}
