// Capability matrix used for navigation and for server-side checks in the application layer.
// Hiding a control is never the security boundary: the database policies enforce the same rules.

export const ROLES = ['founder', 'commercial_manager', 'sales_executive', 'onboarding', 'reviewer'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  founder: 'Founder / super admin',
  commercial_manager: 'Commercial manager',
  sales_executive: 'Sales executive',
  onboarding: 'Onboarding',
  reviewer: 'Read-only reviewer',
};

export const CAPABILITIES = [
  'leads.read', 'leads.write', 'leads.assign', 'leads.convert', 'leads.delete',
  'companies.read', 'companies.write',
  'opportunities.read', 'opportunities.write', 'opportunities.close_won',
  'proposals.read', 'proposals.write', 'proposals.approve', 'proposals.record_acceptance',
  'tasks.read', 'tasks.write',
  'customers.read', 'customers.write', 'onboarding.update',
  'operations.read', 'operations.write', 'approvals.request', 'approvals.decide', 'responsibilities.manage',
  'reports.read', 'audit.read', 'users.manage',
] as const;
export type Capability = (typeof CAPABILITIES)[number];

const ALL = new Set<Capability>(CAPABILITIES);

export const ROLE_CAPABILITIES: Record<Role, ReadonlySet<Capability>> = {
  founder: ALL,
  commercial_manager: new Set<Capability>([
    'leads.read', 'leads.write', 'leads.assign', 'leads.convert',
    'companies.read', 'companies.write',
    'opportunities.read', 'opportunities.write', 'opportunities.close_won',
    'proposals.read', 'proposals.write', 'proposals.approve', 'proposals.record_acceptance',
    'tasks.read', 'tasks.write',
    'customers.read', 'customers.write', 'onboarding.update',
    'operations.read', 'operations.write', 'approvals.request', 'approvals.decide', 'responsibilities.manage',
    'reports.read',
  ]),
  sales_executive: new Set<Capability>([
    'leads.read', 'leads.write', 'leads.convert',
    'companies.read', 'companies.write',
    'opportunities.read', 'opportunities.write',
    'proposals.read', 'proposals.write',
    'tasks.read', 'tasks.write',
  ]),
  onboarding: new Set<Capability>([
    'customers.read', 'onboarding.update', 'opportunities.read',
    'operations.read', 'operations.write', 'approvals.request',
  ]),
  reviewer: new Set<Capability>([
    'leads.read', 'companies.read', 'opportunities.read', 'proposals.read',
    'tasks.read', 'customers.read', 'operations.read', 'reports.read',
  ]),
};

export function can(role: Role | null | undefined, capability: Capability): boolean {
  if (!role) return false;
  return ROLE_CAPABILITIES[role].has(capability);
}

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
