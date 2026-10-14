import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHead, Badge, ResultNotice, Field } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can } from '@/lib/domain/rbac';
import { formatMinor } from '@/lib/domain/money';
import { loadPeople, nameOf } from '@/lib/people';
import { formatDate, formatDateTime } from '@/lib/domain/time';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import { UUID_PATTERN } from '@/lib/actions/helpers';
import { updateOnboardingItemAction, updateCustomerStatusAction } from '../actions';
import { OperationsPanel } from './operations-panel';

export const dynamic = 'force-dynamic';

const STATES = ['pending', 'requested', 'received', 'verified', 'completed'] as const;

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireCapability('customers.read');
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();
  const sp = await searchParams;
  const session = await getSession();
  if (session.state !== 'active') notFound();
  const role = session.role;
  const supabase = await createClient();
  const people = await loadPeople(supabase);

  const { data: customer } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
  if (!customer) notFound();
  const { data: items } = await supabase.from('onboarding_items').select('*').eq('customer_id', id).order('sort_order', { ascending: true });
  const list = items ?? [];
  const done = list.filter((i) => i.state === 'verified' || i.state === 'completed').length;
  const canOnboard = can(role, 'onboarding.update');
  const canManage = can(role, 'customers.write');

  // Internal operations for this customer. Loaded only for roles that can read operations; RLS applies too.
  const showOps = can(role, 'operations.read');
  const svc = showOps ? await supabase.from('service_tasks').select('*').eq('customer_id', id).order('due_on', { ascending: true }) : { data: [] };
  const camp = showOps ? await supabase.from('campaign_activities').select('*').eq('customer_id', id).order('created_at', { ascending: false }) : { data: [] };
  const resp = showOps ? await supabase.from('account_responsibilities').select('*').eq('customer_id', id).order('assigned_at', { ascending: false }) : { data: [] };
  const appr = showOps ? await supabase.from('approvals').select('service_task_id, campaign_id, status').in('status', ['requested', 'approved']).limit(2000) : { data: [] };
  const apprRows = appr.data ?? [];
  const approvedCampaignIds = new Set(apprRows.filter((a) => a.status === 'approved' && a.campaign_id).map((a) => a.campaign_id as string));
  const openCampaignIds = new Set(apprRows.filter((a) => a.status === 'requested' && a.campaign_id).map((a) => a.campaign_id as string));
  const openTaskIds = new Set(apprRows.filter((a) => a.status === 'requested' && a.service_task_id).map((a) => a.service_task_id as string));

  return (
    <>
      <PageHead title={customer.name} description={`Account owner: ${nameOf(people, customer.account_owner_id)} · Won ${formatDate(customer.won_at)}`}>
        <Badge tone={customer.status === 'active' ? 'ok' : customer.status === 'paused' ? 'warn' : undefined}>{customer.status}</Badge>
      </PageHead>
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <section className="card">
          <h2>Contract</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 14px', margin: 0 }}>
            <dt className="muted">Contract value</dt><dd style={{ margin: 0 }}>{formatMinor(BigInt(customer.contract_value_minor), customer.currency)}</dd>
            <dt className="muted">Billing</dt><dd style={{ margin: 0 }}>{customer.billing_frequency.replace('_', ' ')}</dd>
            <dt className="muted">Service</dt><dd style={{ margin: 0 }}>{customer.service_of_interest?.replace(/_/g, ' ') ?? '—'}</dd>
            <dt className="muted">Source deal</dt><dd style={{ margin: 0 }}><Link href={`/opportunities/${customer.opportunity_id}`}>Open opportunity</Link></dd>
            <dt className="muted">Payment</dt><dd style={{ margin: 0 }}>Not recorded in this release. A won deal is not treated as paid.</dd>
          </dl>
          {canManage ? (
            <form action={updateCustomerStatusAction} className="inline-form" style={{ marginTop: 14 }}>
              <input type="hidden" name="customer_id" value={id} />
              <label htmlFor="status">Customer status</label>
              <select id="status" name="status" defaultValue={customer.status}>
                <option value="onboarding">Onboarding</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="ended">Ended</option>
              </select>
              <button type="submit" className="secondary">Save status</button>
            </form>
          ) : null}
        </section>

        <section className="card">
          <h2>Onboarding progress</h2>
          <p>{done} of {list.length} items verified or completed</p>
          <p className="small muted">The checklist is created once, when the deal is handed over. Items are never created by the browser.</p>
        </section>
      </div>

      <section className="card">
        <h2>Checklist</h2>
        {list.length === 0 ? <p className="muted small">No checklist items.</p> : (
          <div className="table-wrap" style={{ border: 0 }}>
            <table>
              <thead><tr><th>#</th><th>Item</th><th>State</th><th>Last updated</th><th>{canOnboard ? 'Update' : ''}</th></tr></thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td>{item.sort_order}</td>
                    <td>{item.title}{item.notes ? <div className="small muted">{item.notes}</div> : null}</td>
                    <td><Badge tone={item.state === 'verified' || item.state === 'completed' ? 'ok' : undefined}>{item.state}</Badge></td>
                    <td className="small">{item.updated_at ? formatDateTime(item.updated_at) : '—'}</td>
                    <td>
                      {canOnboard ? (
                        <form action={updateOnboardingItemAction} className="inline-form">
                          <input type="hidden" name="item_id" value={item.id} />
                          <input type="hidden" name="customer_id" value={id} />
                          <label htmlFor={`state-${item.id}`} className="sr-only">State for {item.title}</label>
                          <select id={`state-${item.id}`} name="state" defaultValue={item.state}>
                            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <input name="notes" aria-label="Note" placeholder="Note" maxLength={1000} style={{ minWidth: 120 }} />
                          <button type="submit" className="secondary">Save</button>
                        </form>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {showOps ? (
        <OperationsPanel
          customerId={id}
          role={role}
          userId={session.userId}
          people={people}
          tasks={(svc.data ?? []) as any}
          campaigns={(camp.data ?? []) as any}
          responsibilities={(resp.data ?? []) as any}
          approvedCampaignIds={approvedCampaignIds}
          openCampaignIds={openCampaignIds}
          openTaskIds={openTaskIds}
        />
      ) : null}
      <p style={{ marginTop: 14 }}><Link href="/customers">Back to customers</Link></p>
    </>
  );
}
