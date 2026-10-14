// Maps database and auth errors to safe, user-facing codes. Raw database messages are never shown to users
// and are never written into URLs.

const RULES: Array<[RegExp, string]> = [
  [/row-level security|permission denied|42501|privilege_change_requires_founder|approval_requires_manager|acceptance_requires_manager|closing_won_requires_manager|assignment_requires_manager|forbidden/, 'not_allowed'],
  [/qualification_evidence_required/, 'qualification_evidence_required'],
  [/disqualification_reason_required/, 'disqualification_reason_required'],
  [/conversion_requires_rpc/, 'conversion_requires_rpc'],
  [/lead_must_be_qualified|lead_already_converted/, 'lead_must_be_qualified'],
  [/loss_reason_required/, 'loss_reason_required'],
  [/final_value_required/, 'final_value_required'],
  [/won_requires_accepted_proposal/, 'won_requires_accepted_proposal'],
  [/won_opportunity_is_locked/, 'won_opportunity_is_locked'],
  [/invalid_proposal_transition/, 'invalid_transition'],
  [/proposal_is_final/, 'proposal_is_final'],
  [/acceptance_evidence_required/, 'acceptance_evidence_required'],
  [/sent_channel_required/, 'sent_channel_required'],
  [/proposal_must_start_as_draft/, 'proposal_must_start_as_draft'],
  [/opportunity_not_won/, 'opportunity_not_won'],
  [/tasks_completed_has_evidence/, 'task_outcome_required'],
  [/duplicate key|unique constraint/, 'duplicate'],
  [/violates check constraint|check constraint/, 'invalid_value'],
];

export function errorCode(message: string | undefined | null): string {
  if (!message) return 'failed';
  for (const [pattern, code] of RULES) if (pattern.test(message)) return code;
  return 'failed';
}

export const ERROR_TEXT: Record<string, string> = {
  not_allowed: 'Your role does not allow this action.',
  qualification_evidence_required: 'Record the evidence for qualifying this lead before saving.',
  disqualification_reason_required: 'Give a reason for disqualifying this lead.',
  conversion_requires_rpc: 'Use the conversion action on a qualified lead.',
  lead_must_be_qualified: 'Only a qualified lead that has not been converted can become an opportunity.',
  loss_reason_required: 'Give the reason the deal was lost.',
  final_value_required: 'Enter the agreed final value before marking the deal as won.',
  won_requires_accepted_proposal: 'A deal can be marked as won only after its proposal is recorded as accepted.',
  won_opportunity_is_locked: 'A won deal cannot change stage. Use the customer record instead.',
  invalid_transition: 'That status change is not allowed from the current status.',
  proposal_is_final: 'This proposal is final and cannot be changed.',
  acceptance_evidence_required: 'Record how the client accepted before marking the proposal as accepted.',
  sent_channel_required: 'Record how the proposal was sent.',
  proposal_must_start_as_draft: 'A new proposal starts as a draft.',
  opportunity_not_won: 'Only a closed-won deal can be handed over to onboarding.',
  task_outcome_required: 'Record the outcome before completing this follow-up.',
  duplicate: 'A matching record already exists.',
  invalid_value: 'One of the values is outside the allowed range.',
  invite_not_configured: 'Invitations are not configured for this environment. Ask the platform owner to set the invitation key on the server.',
  invite_failed: 'The invitation could not be sent. Check the address and try again.',
  rate_limited: 'Too many attempts. Wait a few minutes and try again.',
  failed: 'The change could not be saved. Refresh and try again.',
};

export function messageFor(code: string | null | undefined): string | null {
  if (!code) return null;
  return ERROR_TEXT[code] ?? ERROR_TEXT.failed;
}
