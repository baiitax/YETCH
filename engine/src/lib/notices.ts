// Confirmation messages shown only after the server has saved the change. Keys come from redirects.
export const NOTICES: Record<string, string> = {
  lead_created: 'Lead saved.',
  lead_updated: 'Lead updated.',
  lead_qualified: 'Lead qualified. The evidence has been recorded.',
  lead_disqualified: 'Lead disqualified. The reason has been recorded.',
  lead_assigned: 'Owner updated.',
  lead_converted: 'Lead converted to an opportunity.',
  company_created: 'Company saved.',
  activity_added: 'Activity recorded.',
  task_added: 'Follow-up scheduled.',
  service_task_added: 'Service task added.',
  service_task_updated: 'Service task updated.',
  campaign_added: 'Campaign added.',
  campaign_updated: 'Campaign status saved.',
  approval_requested: 'Approval requested. A manager will decide it.',
  approval_decided: 'Decision recorded.',
  approval_withdrawn: 'Request withdrawn.',
  responsibility_saved: 'Responsibility assigned.',
  responsibility_ended: 'Responsibility ended.',
  task_completed: 'Follow-up completed with its outcome recorded.',
  proposal_created: 'Proposal draft saved.',
  proposal_updated: 'Proposal status updated. The change has been saved.',
  onboarding_updated: 'Onboarding item updated.',
  team_updated: 'Account updated.',
  invite_sent: 'Invitation sent. The person will receive an email to set a password.',
  contact_created: 'Contact saved.',
  customer_updated: 'Customer status updated.',
  handover_done: 'Customer record created with its onboarding checklist.',
  opportunity_updated: 'Opportunity updated.',
};

export function noticeText(key: string | undefined): string | null {
  if (!key) return null;
  return NOTICES[key] ?? null;
}
