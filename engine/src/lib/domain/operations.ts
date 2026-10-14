// Internal operations (Layer B): statuses, labels and pure rules. The database enforces the same rules;
// these functions only drive display and clear messages. Dates are business days in the engine timezone.
import { dayKey } from '@/lib/domain/time';
import { ratio } from '@/lib/domain/metrics';

export const SERVICE_TASK_STATUSES = ['todo', 'in_progress', 'blocked', 'done'] as const;
export type ServiceTaskStatus = (typeof SERVICE_TASK_STATUSES)[number];
export const SERVICE_TASK_LABELS: Record<ServiceTaskStatus, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
};

export const CAMPAIGN_STATUSES = ['planned', 'scheduled', 'live', 'paused', 'completed', 'cancelled'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export const CAMPAIGN_LABELS: Record<CampaignStatus, string> = {
  planned: 'Planned',
  scheduled: 'Scheduled',
  live: 'Live',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
};
export const CAMPAIGN_TERMINAL: ReadonlySet<CampaignStatus> = new Set<CampaignStatus>(['completed', 'cancelled']);

export const CAMPAIGN_CHANNELS = ['search', 'social', 'email', 'content', 'website', 'analytics', 'other'] as const;
export const CHANNEL_LABELS: Record<(typeof CAMPAIGN_CHANNELS)[number], string> = {
  search: 'Search',
  social: 'Social',
  email: 'Email',
  content: 'Content',
  website: 'Website',
  analytics: 'Analytics',
  other: 'Other',
};

export const RESPONSIBILITIES = ['account_lead', 'delivery_lead', 'quality_reviewer'] as const;
export type Responsibility = (typeof RESPONSIBILITIES)[number];
export const RESPONSIBILITY_LABELS: Record<Responsibility, string> = {
  account_lead: 'Account lead',
  delivery_lead: 'Delivery lead',
  quality_reviewer: 'Quality reviewer',
};

export const APPROVAL_STATUS_LABELS: Record<string, string> = {
  requested: 'Awaiting decision',
  approved: 'Approved',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

/** Minimum length for a request or decision note. Matches the database check. */
export const MIN_NOTE_LENGTH = 10;

/** A service task is overdue when it is not done and its due day is before today (engine timezone). */
export function isServiceTaskOverdue(task: { status: string; due_on: string }, today: string): boolean {
  return task.status !== 'done' && task.due_on < today;
}

/** Calendar day key (YYYY-MM-DD) for an instant, in the engine timezone. */
export function businessDay(instant: Date = new Date()): string {
  return dayKey(instant);
}

/** A task completed on the due day or earlier counts as on time. Compared as business days. */
export function completedOnTime(completedAtIso: string, dueOn: string): boolean {
  return businessDay(new Date(completedAtIso)) <= dueOn;
}

export type OperationsSummary = {
  openTasks: number;
  overdueTasks: number;
  completedTasks: number;
  completedOnTime: number;
  liveCampaigns: number;
  pendingApprovals: number;
};

/** On-time completion = completed on or before the due day ÷ completed. N/A when nothing is completed. */
export function onTimeCompletionRate(summary: Pick<OperationsSummary, 'completedOnTime' | 'completedTasks'>) {
  return ratio(summary.completedOnTime, summary.completedTasks);
}

/** Overdue share = overdue open tasks ÷ open tasks. N/A when nothing is open. */
export function overdueShareRate(summary: Pick<OperationsSummary, 'overdueTasks' | 'openTasks'>) {
  return ratio(summary.overdueTasks, summary.openTasks);
}

/** A campaign can go live only with an approved approval on record (the database enforces this). */
export function campaignHasApproval(approvalStatuses: readonly string[]): boolean {
  return approvalStatuses.includes('approved');
}

export type DecisionActor = { role: string | null | undefined; userId: string };

/**
 * Mirrors the database rule for approving or rejecting a request. Returns an error code or null.
 * Withdrawal is a separate path: only the requester may withdraw.
 */
export function decisionBlock(actor: DecisionActor, requestedBy: string | null): string | null {
  if (actor.role !== 'founder' && actor.role !== 'commercial_manager') return 'approval_requires_manager';
  if (requestedBy && requestedBy === actor.userId) return 'self_approval_not_allowed';
  return null;
}

export function canWithdraw(actor: DecisionActor, requestedBy: string | null): boolean {
  return Boolean(requestedBy) && requestedBy === actor.userId;
}
