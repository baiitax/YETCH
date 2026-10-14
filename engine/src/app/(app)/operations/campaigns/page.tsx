import { PageHead, EmptyState, ResultNotice, Badge } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { can } from '@/lib/domain/rbac';
import { loadPeople, nameOf } from '@/lib/people';
import { formatDate } from '@/lib/domain/time';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_LABELS,
  CAMPAIGN_CHANNELS,
  CHANNEL_LABELS,
  campaignHasApproval,
} from '@/lib/domain/operations';
import { createCampaignAction, updateCampaignStatusAction, requestApprovalAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('operations.read');
  const sp = await searchParams;
  const session = await getSession();
  if (session.state !== 'active') return null;
  const canWrite = can(session.role, 'operations.write');
  const canRequest = can(session.role, 'approvals.request');

  const supabase = await createClient();
  const [campaignsRes, approvalsRes, customersRes, people] = await Promise.all([
    supabase.from('campaign_activities').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.from('approvals').select('id, campaign_id, status').not('campaign_id', 'is', null).limit(2000),
    supabase.from('customers').select('id, name, status').neq('status', 'ended').order('name', { ascending: true }).limit(500),
    loadPeople(supabase),
  ]);
  const customers = customersRes.data ?? [];
  const customerName = new Map(customers.map((c) => [c.id, c.name as string]));
  const approvals = approvalsRes.data ?? [];
  const campaigns = campaignsRes.data ?? [];
  const activeStaff = people.filter((p) => p.is_active);

  return (
    <>
      <PageHead
        title="Campaign activities"
        description="Campaign records track status, owner and dates. They hold no advertising spend and no account credentials. A campaign can go live only after an approval is recorded."
      />
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />

      {campaigns.length === 0 ? (
        <div className="table-wrap"><EmptyState title="No campaign activities yet." /></div>
      ) : (
        <div className="table-wrap" style={{ marginTop: 16 }}>
          <table>
            <thead><tr><th>Campaign</th><th>Customer</th><th>Channel</th><th>Dates</th><th>Approval</th><th>Status</th></tr></thead>
            <tbody>
              {campaigns.map((c) => {
                const mine = approvals.filter((a) => a.campaign_id === c.id);
                const approved = campaignHasApproval(mine.map((a) => a.status));
                const pending = mine.some((a) => a.status === 'requested');
                return (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.name}</strong>
                      <div className="small muted">{c.objective ?? ''}{c.owner_id ? ` · Owner: ${nameOf(people, c.owner_id)}` : ''}</div>
                    </td>
                    <td>{customerName.get(c.customer_id) ?? 'Customer'}</td>
                    <td>{CHANNEL_LABELS[c.channel as keyof typeof CHANNEL_LABELS] ?? c.channel}</td>
                    <td className="small">{c.starts_on ? formatDate(c.starts_on) : '—'} to {c.ends_on ? formatDate(c.ends_on) : '—'}</td>
                    <td>
                      {approved ? <Badge tone="ok">Approved</Badge> : pending ? <Badge tone="warn">Awaiting decision</Badge> : <Badge>Not approved</Badge>}
                      {!approved && !pending && canRequest ? (
                        <form action={requestApprovalAction} className="inline-form" style={{ marginTop: 6 }}>
                          <input type="hidden" name="subject" value="campaign" />
                          <input type="hidden" name="subject_id" value={c.id} />
                          <input type="hidden" name="back" value="/operations/campaigns" />
                          <label htmlFor={`ar-${c.id}`} className="sr-only">Why this campaign needs approval</label>
                          <input id={`ar-${c.id}`} name="request_note" placeholder="Why approval is needed (10+ characters)" minLength={10} maxLength={1000} required style={{ minWidth: 200 }} />
                          <button type="submit" className="secondary">Request approval</button>
                        </form>
                      ) : null}
                    </td>
                    <td>
                      {canWrite ? (
                        <form action={updateCampaignStatusAction} className="inline-form">
                          <input type="hidden" name="campaign_id" value={c.id} />
                          <input type="hidden" name="back" value="/operations/campaigns" />
                          <label htmlFor={`cs-${c.id}`} className="sr-only">Status for {c.name}</label>
                          <select id={`cs-${c.id}`} name="status" defaultValue={c.status}>
                            {CAMPAIGN_STATUSES.map((s) => (
                              <option key={s} value={s}>{CAMPAIGN_LABELS[s]}{s === 'live' && !approved ? ' (needs approval)' : ''}</option>
                            ))}
                          </select>
                          <button type="submit" className="secondary">Save</button>
                        </form>
                      ) : (
                        CAMPAIGN_LABELS[c.status as keyof typeof CAMPAIGN_LABELS] ?? c.status
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {canWrite ? (
        <section className="card" style={{ marginTop: 20 }}>
          <h2>New campaign activity</h2>
          {customers.length === 0 ? (
            <p className="muted">No active customers yet. Campaigns belong to a customer.</p>
          ) : (
            <form action={createCampaignAction} className="stack">
              <input type="hidden" name="back" value="/operations/campaigns" />
              <div className="field">
                <label htmlFor="customer_id">Customer</label>
                <select id="customer_id" name="customer_id" required>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="name">Campaign name</label>
                <input id="name" name="name" required minLength={2} maxLength={160} />
              </div>
              <div className="grid grid-2">
                <div className="field">
                  <label htmlFor="channel">Channel</label>
                  <select id="channel" name="channel" defaultValue="other">
                    {CAMPAIGN_CHANNELS.map((ch) => <option key={ch} value={ch}>{CHANNEL_LABELS[ch]}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="owner_id">Owner</label>
                  <select id="owner_id" name="owner_id" defaultValue={session.userId}>
                    <option value="">Unassigned</option>
                    {activeStaff.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="starts_on">Start date (optional)</label>
                  <input id="starts_on" name="starts_on" type="date" />
                </div>
                <div className="field">
                  <label htmlFor="ends_on">End date (optional)</label>
                  <input id="ends_on" name="ends_on" type="date" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="objective">Objective (optional)</label>
                <input id="objective" name="objective" maxLength={500} />
              </div>
              <button type="submit">Add campaign</button>
            </form>
          )}
        </section>
      ) : null}
    </>
  );
}
