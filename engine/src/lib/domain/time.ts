// Dates are stored as timestamptz (UTC). Day boundaries use the engine's display timezone.
// Asia/Riyadh has no daylight saving time, so a fixed offset is used when converting form input.

export const ENGINE_TIMEZONE = 'Asia/Riyadh';
export const ENGINE_UTC_OFFSET = '+03:00';

export type TaskTimeState = 'overdue' | 'due_today' | 'upcoming' | 'completed' | 'cancelled';

/** Converts a value from a datetime-local input (wall-clock time in ENGINE_TIMEZONE) to an ISO instant. */
export function localInputToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00${ENGINE_UTC_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Calendar day (YYYY-MM-DD) of an instant in the engine timezone. */
export function dayKey(instant: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ENGINE_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instant);
}

/** Overdue is derived from due time and open status. It is never stored as a status. */
export function taskTimeState(task: { status: string; dueAt: Date }, now: Date): TaskTimeState {
  if (task.status === 'completed') return 'completed';
  if (task.status === 'cancelled') return 'cancelled';
  if (task.dueAt.getTime() < now.getTime()) return 'overdue';
  if (dayKey(task.dueAt) === dayKey(now)) return 'due_today';
  return 'upcoming';
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ENGINE_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value + (value.length === 10 ? 'T00:00:00Z' : '')) : value;
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', dateStyle: 'medium' }).format(date);
}
