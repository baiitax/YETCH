import Link from 'next/link';
import { PageHead, EmptyState, ResultNotice, Badge } from '@/components/ui';
import { requireCapability } from '@/lib/authz';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { taskTimeState, formatDateTime, type TaskTimeState } from '@/lib/domain/time';
import { noticeText } from '@/lib/notices';
import { messageFor } from '@/lib/errors';
import { completeTaskAction } from '@/lib/actions/tasks';
import { can } from '@/lib/domain/rbac';

export const dynamic = 'force-dynamic';

const TABS: Array<{ key: string; label: string; states: TaskTimeState[] }> = [
  { key: 'overdue', label: 'Overdue', states: ['overdue'] },
  { key: 'today', label: 'Due today', states: ['due_today'] },
  { key: 'upcoming', label: 'Upcoming', states: ['upcoming'] },
  { key: 'completed', label: 'Completed', states: ['completed'] },
];

export default async function FollowUpsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireCapability('tasks.read');
  const sp = await searchParams;
  const session = await getSession();
  const canWrite = session.state === 'active' && can(session.role, 'tasks.write');
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const supabase = await createClient();
  const now = new Date();
  const { data } = await supabase
    .from('tasks')
    .select('id, title, due_at, status, outcome, completed_at, lead_id, opportunity_id, priority, task_type')
    .order('due_at', { ascending: true })
    .limit(500);
  const rows = (data ?? []).map((t) => ({ ...t, state: taskTimeState({ status: t.status, dueAt: new Date(t.due_at) }, now) }));
  const shown = rows.filter((t) => tab.states.includes(t.state));
  const counts = Object.fromEntries(TABS.map((x) => [x.key, rows.filter((t) => x.states.includes(t.state)).length]));

  return (
    <>
      <PageHead title="Follow-ups" description="Overdue is calculated from the due time. Completing a follow-up requires a recorded outcome." />
      <ResultNotice notice={noticeText(sp.notice) ?? undefined} error={sp.error ? messageFor(sp.error) ?? undefined : undefined} />
      <nav className="actions" style={{ margin: '16px 0' }} aria-label="Follow-up views">
        {TABS.map((t) => (
          <Link key={t.key} href={`/follow-ups?tab=${t.key}`} className={`button ${tab.key === t.key ? '' : 'secondary'}`} aria-current={tab.key === t.key ? 'page' : undefined}>
            {t.label} ({counts[t.key]})
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <div className="table-wrap"><EmptyState title={`Nothing in ${tab.label.toLowerCase()}.`} /></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Follow-up</th><th>Due</th><th>Linked to</th><th>Status</th><th>{tab.key === 'completed' ? 'Outcome' : 'Complete'}</th></tr></thead>
            <tbody>
              {shown.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.title}</strong><div className="small muted">{t.task_type.replace('_', ' ')} · {t.priority}</div></td>
                  <td className={t.state === 'overdue' ? 'overdue' : ''}>{formatDateTime(t.due_at)}</td>
                  <td>
                    {t.lead_id ? <Link href={`/leads/${t.lead_id}`}>Lead</Link> : null}
                    {t.lead_id && t.opportunity_id ? ' · ' : null}
                    {t.opportunity_id ? <Link href={`/opportunities/${t.opportunity_id}`}>Opportunity</Link> : null}
                  </td>
                  <td><Badge tone={t.state === 'overdue' ? 'bad' : t.state === 'completed' ? 'ok' : undefined}>{t.state.replace('_', ' ')}</Badge></td>
                  <td>
                    {tab.key === 'completed' ? (t.outcome ?? '—') : canWrite ? (
                      <form action={completeTaskAction} className="stack" style={{ minWidth: 220 }}>
                        <input type="hidden" name="task_id" value={t.id} />
                        <input type="hidden" name="return_to" value={`/follow-ups?tab=${tab.key}`} />
                        <label htmlFor={`outcome-${t.id}`} className="sr-only">Outcome for {t.title}</label>
                        <input id={`outcome-${t.id}`} name="outcome" required minLength={3} maxLength={2000} placeholder="What happened?" />
                        <button type="submit" className="secondary">Mark complete</button>
                      </form>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
