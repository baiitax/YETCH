'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireCapability } from '@/lib/authz';
import { errorCode } from '@/lib/errors';
import { formToRecord, parseWith, taskCompleteSchema, taskSchema } from '@/lib/validation/schemas';
import { str, withParams } from '@/lib/actions/helpers';

/** Schedules a follow-up. Overdue is derived later from the due time, so it is not stored here. */
export async function addTaskAction(formData: FormData): Promise<void> {
  const session = await requireCapability('tasks.write');
  const returnTo = str(formData, 'return_to') || '/follow-ups';
  const values = formToRecord(formData);
  const parsed = parseWith(taskSchema, {
    title: values.title ?? '',
    task_type: values.task_type || 'follow_up',
    due_local: values.due_local ?? '',
    priority: values.priority || 'medium',
    description: values.description ?? '',
    lead_id: values.lead_id || undefined,
    opportunity_id: values.opportunity_id || undefined,
  });
  if (!parsed.ok) redirect(withParams(returnTo, { error: 'invalid_value' }));

  const assignee = str(formData, 'assigned_to') || session.userId;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: parsed.data.title,
      task_type: parsed.data.task_type,
      description: parsed.data.description || null,
      priority: parsed.data.priority,
      due_at: parsed.data.due_at,
      lead_id: parsed.data.lead_id ?? null,
      opportunity_id: parsed.data.opportunity_id ?? null,
      assigned_to: assignee,
      created_by: session.userId,
    })
    .select('id')
    .single();
  if (error || !data) redirect(withParams(returnTo, { error: errorCode(error?.message) }));
  redirect(withParams(returnTo, { notice: 'task_added' }));
}

/** Completes a follow-up. The outcome is required; the database refuses completion without it. */
export async function completeTaskAction(formData: FormData): Promise<void> {
  await requireCapability('tasks.write');
  const returnTo = str(formData, 'return_to') || '/follow-ups';
  const id = str(formData, 'task_id');
  const parsed = parseWith(taskCompleteSchema, formToRecord(formData));
  if (!parsed.ok) redirect(withParams(returnTo, { error: 'task_outcome_required' }));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString(), outcome: parsed.data.outcome })
    .eq('id', id)
    .select('id');
  if (error) redirect(withParams(returnTo, { error: errorCode(error.message) }));
  if (!data || data.length === 0) redirect(withParams(returnTo, { error: 'not_allowed' }));
  redirect(withParams(returnTo, { notice: 'task_completed' }));
}
