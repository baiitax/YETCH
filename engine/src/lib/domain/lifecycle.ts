// Allowed status transitions. The database re-checks the critical ones (qualification evidence,
// conversion only through the RPC, approval and acceptance roles, final-state locks).

export const LEAD_STATUSES = [
  'new', 'awaiting_review', 'contact_attempted', 'contacted', 'engaged', 'qualified',
  'nurture', 'disqualified', 'converted_opportunity', 'converted_customer',
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_TRANSITIONS: Record<LeadStatus, readonly LeadStatus[]> = {
  new: ['awaiting_review', 'contact_attempted', 'nurture', 'disqualified'],
  awaiting_review: ['contact_attempted', 'nurture', 'disqualified'],
  contact_attempted: ['contacted', 'nurture', 'disqualified'],
  contacted: ['engaged', 'qualified', 'nurture', 'disqualified'],
  engaged: ['qualified', 'nurture', 'disqualified'],
  qualified: ['nurture', 'disqualified'],
  nurture: ['contacted', 'engaged', 'disqualified'],
  disqualified: ['nurture'],
  converted_opportunity: ['converted_customer'],
  converted_customer: [],
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  awaiting_review: 'Awaiting review',
  contact_attempted: 'Contact attempted',
  contacted: 'Contacted',
  engaged: 'Engaged',
  qualified: 'Qualified',
  nurture: 'Nurture',
  disqualified: 'Disqualified',
  converted_opportunity: 'Converted to opportunity',
  converted_customer: 'Converted to customer',
};

/** Statuses that a person may set directly. Conversion statuses are set only by the conversion procedures. */
export const MANUAL_LEAD_STATUSES: readonly LeadStatus[] = LEAD_STATUSES.filter(
  (s) => s !== 'converted_opportunity' && s !== 'converted_customer',
);

export function canLeadMove(from: LeadStatus, to: LeadStatus): boolean {
  return LEAD_TRANSITIONS[from].includes(to);
}

export const OPPORTUNITY_STAGES = [
  'qualification', 'discovery_scheduled', 'discovery_completed', 'business_diagnosis',
  'proposal_preparation', 'proposal_sent', 'negotiation', 'verbal_acceptance',
  'closed_won', 'closed_lost',
] as const;
export type OpportunityStage = (typeof OPPORTUNITY_STAGES)[number];

export const OPEN_STAGES: readonly OpportunityStage[] = OPPORTUNITY_STAGES.filter(
  (s) => s !== 'closed_won' && s !== 'closed_lost',
);

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> = {
  qualification: 'Qualification',
  discovery_scheduled: 'Discovery scheduled',
  discovery_completed: 'Discovery completed',
  business_diagnosis: 'Business diagnosis',
  proposal_preparation: 'Proposal preparation',
  proposal_sent: 'Proposal sent',
  negotiation: 'Negotiation',
  verbal_acceptance: 'Verbal acceptance',
  closed_won: 'Closed won',
  closed_lost: 'Closed lost',
};

/** Won requires a recorded proposal outcome, so it is reachable only from the late open stages. */
export function canOpportunityMove(from: OpportunityStage, to: OpportunityStage): boolean {
  if (from === 'closed_won') return false;
  if (from === 'closed_lost') return to === 'qualification';
  if (to === 'closed_lost') return true;
  if (to === 'closed_won') return ['proposal_sent', 'negotiation', 'verbal_acceptance'].includes(from);
  return to !== from;
}

export const PROPOSAL_STATUSES = [
  'draft', 'internal_review', 'approved', 'sent', 'accepted', 'rejected', 'expired', 'superseded', 'withdrawn',
] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const PROPOSAL_TRANSITIONS: Record<ProposalStatus, readonly ProposalStatus[]> = {
  draft: ['internal_review', 'withdrawn'],
  internal_review: ['draft', 'approved', 'withdrawn'],
  approved: ['sent', 'withdrawn'],
  sent: ['accepted', 'rejected', 'expired', 'superseded', 'withdrawn'],
  accepted: [],
  rejected: ['superseded'],
  expired: ['superseded'],
  superseded: [],
  withdrawn: [],
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Draft',
  internal_review: 'Internal review',
  approved: 'Approved (not yet sent)',
  sent: 'Sent to client',
  accepted: 'Accepted (recorded)',
  rejected: 'Rejected (recorded)',
  expired: 'Expired',
  superseded: 'Superseded by a newer version',
  withdrawn: 'Withdrawn',
};

export function canProposalMove(from: ProposalStatus, to: ProposalStatus): boolean {
  return PROPOSAL_TRANSITIONS[from].includes(to);
}

export const TASK_TYPES = ['follow_up', 'call', 'meeting', 'proposal_review', 'other'] as const;
export const ACTIVITY_TYPES = [
  'phone_call', 'email', 'whatsapp_manual', 'meeting', 'consultation', 'proposal_sent',
  'internal_note', 'follow_up', 'customer_request', 'other',
] as const;
