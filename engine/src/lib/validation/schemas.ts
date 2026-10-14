// Input validation for every write. Each parser returns either normalised database values or field errors.
// The database enforces the same constraints; this layer gives people clear messages before the write.
import { z } from 'zod';
import { LEAD_STATUSES, MANUAL_LEAD_STATUSES, OPPORTUNITY_STAGES, PROPOSAL_STATUSES, ACTIVITY_TYPES, TASK_TYPES } from '@/lib/domain/lifecycle';
import { normalizeEmail, normalizePhone } from '@/lib/domain/contact';
import { parseMoneyToMinor } from '@/lib/domain/money';
import { localInputToIso } from '@/lib/domain/time';
import { PACKAGES, type PackageKey } from '@/lib/domain/packages';
import { ROLES } from '@/lib/domain/rbac';
import { passwordProblem } from '@/lib/security';

export type FieldErrors = Record<string, string>;
export type ParseResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

export const LEAD_SOURCES = [
  'public_website', 'consultation_form', 'referral', 'direct_outreach', 'linkedin', 'industry_event',
  'business_directory', 'partner_referral', 'existing_customer', 'organic_search', 'paid_advertising',
  'manual_entry', 'other',
] as const;

const uuid = z.string().uuid();
const trimmed = (max: number) => z.string().trim().max(max);
const optionalNote = (max: number) => z.string().trim().max(max).default('');

/** Runs a Zod schema and returns field errors keyed by the first path segment. */
export function parseWith<S extends z.ZodTypeAny>(schema: S, input: unknown): ParseResult<z.output<S>> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? '_form');
    errors[key] ??= issue.message;
  }
  return { ok: false, errors };
}

/** Converts a FormData object to a plain record, with empty strings preserved for the schemas to handle. */
export function formToRecord(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') out[key] = value;
  }
  return out;
}

// ---------- auth ----------
export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(254),
  password: z.string().min(1, 'Enter your password.').max(72),
});

export const emailOnlySchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(254),
});

export const resetPasswordSchema = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.confirm) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirm'], message: 'The two passwords do not match.' });
    }
    const problem = passwordProblem(v.password);
    if (problem) {
      const messages: Record<string, string> = {
        too_short: 'Use at least 12 characters.',
        too_long: 'Use no more than 72 characters.',
        repetitive: 'Avoid repeating a single character.',
        contains_identifier: 'Do not include your username in the password.',
      };
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: messages[problem] ?? 'Choose a stronger password.' });
    }
  });

// ---------- leads ----------
export const leadCreateSchema = z
  .object({
    first_name: z.string().trim().min(1, 'Enter a first name.').max(80),
    last_name: optionalNote(80),
    email: trimmed(254),
    phone: trimmed(32),
    job_title: optionalNote(120),
    company_name: optionalNote(160),
    website: optionalNote(200),
    city: optionalNote(80),
    industry: optionalNote(120),
    company_size: optionalNote(40),
    source: z.enum(LEAD_SOURCES, { errorMap: () => ({ message: 'Choose where this lead came from.' }) }),
    source_campaign: optionalNote(120),
    service_of_interest: z.enum(['essential', 'growth', 'managed_growth_plus', 'custom', 'not_sure']).default('not_sure'),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    estimated_value: trimmed(32),
    communication_consent: z.enum(['unknown', 'granted', 'declined']).default('unknown'),
    preferred_language: z.enum(['en', 'ar']).default('en'),
    notes: optionalNote(2000),
  })
  .superRefine((v, ctx) => {
    if (!v.email && !v.phone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: 'Enter an email address or a phone number.' });
    }
    if (v.email && !normalizeEmail(v.email)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: 'Enter a valid email address.' });
    }
    if (v.phone && !normalizePhone(v.phone)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone'], message: 'Enter a valid phone number, with the country code.' });
    }
    if (v.estimated_value && parseMoneyToMinor(v.estimated_value) === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['estimated_value'], message: 'Enter an amount in SAR, for example 1500 or 1500.50.' });
    }
  })
  .transform((v) => ({
    first_name: v.first_name,
    last_name: v.last_name,
    email: normalizeEmail(v.email),
    email_normalized: normalizeEmail(v.email),
    phone: v.phone || null,
    phone_normalized: normalizePhone(v.phone),
    job_title: v.job_title || null,
    company_name: v.company_name || null,
    website: v.website || null,
    city: v.city || null,
    industry: v.industry || null,
    company_size: v.company_size || null,
    source: v.source,
    original_source: v.source,
    source_campaign: v.source_campaign || null,
    service_of_interest: v.service_of_interest,
    priority: v.priority,
    estimated_value_minor: v.estimated_value ? parseMoneyToMinor(v.estimated_value) : null,
    communication_consent: v.communication_consent,
    preferred_language: v.preferred_language,
    notes: v.notes || null,
  }));

export const qualifySchema = z.object({
  qualification_notes: z
    .string()
    .trim()
    .min(10, 'Record the evidence for qualifying this lead (at least 10 characters).')
    .max(4000),
});

export const disqualifySchema = z.object({
  disqualified_reason: z.string().trim().min(3, 'Give a short reason.').max(500),
});

export const leadStatusSchema = z.object({
  status: z.enum(MANUAL_LEAD_STATUSES as unknown as [string, ...string[]]),
});

// ---------- activities and follow-ups ----------
export const activitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  subject: z.string().trim().min(2, 'Add a short subject.').max(200),
  body: optionalNote(4000),
  lead_id: uuid.optional(),
  opportunity_id: uuid.optional(),
});

export const taskSchema = z
  .object({
    title: z.string().trim().min(2, 'Add a short title.').max(200),
    task_type: z.enum(TASK_TYPES).default('follow_up'),
    due_local: z.string().trim(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    description: optionalNote(2000),
    lead_id: uuid.optional(),
    opportunity_id: uuid.optional(),
  })
  .superRefine((v, ctx) => {
    if (!v.lead_id && !v.opportunity_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['title'], message: 'A follow-up must be linked to a lead or an opportunity.' });
    }
  })
  .transform((v, ctx) => {
    const dueIso = localInputToIso(v.due_local);
    if (!dueIso) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['due_local'], message: 'Choose a due date and time.' });
      return z.NEVER;
    }
    return { ...v, due_at: dueIso };
  });

export const taskCompleteSchema = z.object({
  outcome: z.string().trim().min(3, 'Record what happened.').max(2000),
});

// ---------- opportunities ----------
export const opportunityUpdateSchema = z
  .object({
    stage: z.enum(OPPORTUNITY_STAGES),
    amount: z.string().trim().default(''),
    probability_pct: z.string().trim().default(''),
    next_action: optionalNote(200),
    loss_reason: optionalNote(500),
    final_value: z.string().trim().default(''),
    expected_close_date: z.string().trim().default(''),
  })
  .superRefine((v, ctx) => {
    if (v.amount && parseMoneyToMinor(v.amount) === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['amount'], message: 'Enter an amount in SAR, for example 3000.' });
    }
    if (v.probability_pct && !/^\d{1,3}$/.test(v.probability_pct) ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['probability_pct'], message: 'Enter a whole number from 0 to 100.' });
    } else if (v.probability_pct && Number(v.probability_pct) > 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['probability_pct'], message: 'Enter a whole number from 0 to 100.' });
    }
    if (v.stage === 'closed_lost' && v.loss_reason.length < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['loss_reason'], message: 'Give the reason the deal was lost.' });
    }
    if (v.stage === 'closed_won' && (!v.final_value || parseMoneyToMinor(v.final_value) === null || parseMoneyToMinor(v.final_value) === 0n)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['final_value'], message: 'Enter the agreed final value in SAR.' });
    }
  })
  .transform((v) => ({
    stage: v.stage,
    amount_minor: v.amount ? parseMoneyToMinor(v.amount) : null,
    probability_pct: v.probability_pct ? Number(v.probability_pct) : null,
    next_action: v.next_action || null,
    loss_reason: v.stage === 'closed_lost' ? v.loss_reason : null,
    final_value_minor: v.stage === 'closed_won' && v.final_value ? parseMoneyToMinor(v.final_value) : null,
    expected_close_date: v.expected_close_date || null,
  }));

// ---------- proposals ----------
export const proposalSchema = z
  .object({
    opportunity_id: uuid,
    title: z.string().trim().min(3, 'Add a title.').max(200),
    service_package: z.enum(['essential', 'growth', 'managed_growth_plus', 'custom']),
    scope_of_work: z.string().trim().min(10, 'Describe the scope of work.').max(8000),
    deliverables: optionalNote(4000),
    exclusions: optionalNote(4000),
    timeline_text: optionalNote(1000),
    monthly_fee: z.string().trim().default(''),
    setup_fee: z.string().trim().default(''),
    payment_schedule: optionalNote(1000),
    assumptions: optionalNote(4000),
    client_responsibilities: optionalNote(4000),
    valid_until: z.string().trim().default(''),
  })
  .superRefine((v, ctx) => {
    const monthly = parseMoneyToMinor(v.monthly_fee || '0');
    const setup = parseMoneyToMinor(v.setup_fee || '0');
    if (monthly === null) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['monthly_fee'], message: 'Enter a monthly fee in SAR.' });
    if (setup === null) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['setup_fee'], message: 'Enter a setup fee in SAR, or 0.' });
    const pkg = PACKAGES[v.service_package as PackageKey];
    if (monthly !== null && monthly < pkg.minMonthlyMinor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['monthly_fee'],
        message: `${pkg.label} starts at ${pkg.priceNote.replace(' (provisional)', '')}. Check the fee.`,
      });
    }
    if (v.valid_until && !/^\d{4}-\d{2}-\d{2}$/.test(v.valid_until)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['valid_until'], message: 'Enter a valid date.' });
    }
  })
  .transform((v) => ({
    opportunity_id: v.opportunity_id,
    title: v.title,
    service_package: v.service_package,
    scope_of_work: v.scope_of_work,
    deliverables: v.deliverables || null,
    exclusions: v.exclusions || null,
    timeline_text: v.timeline_text || null,
    recurring_fee_minor: parseMoneyToMinor(v.monthly_fee || '0') ?? 0n,
    setup_fee_minor: parseMoneyToMinor(v.setup_fee || '0') ?? 0n,
    payment_schedule: v.payment_schedule || null,
    assumptions: v.assumptions || null,
    client_responsibilities: v.client_responsibilities || null,
    valid_until: v.valid_until || null,
  }));

export const proposalAcceptanceSchema = z.object({
  acceptance_evidence: z
    .string()
    .trim()
    .min(10, 'Record how the client accepted (for example, the date and the written confirmation).')
    .max(2000),
  accepted_by_name: z.string().trim().max(120),
});

export const proposalSentSchema = z.object({
  sent_channel: z.string().trim().min(2, 'Record how the proposal was sent (for example, email).').max(60),
});

export const proposalStatusSchema = z.object({
  status: z.enum(PROPOSAL_STATUSES),
});

// ---------- customers and team ----------
export const onboardingStateSchema = z.object({
  state: z.enum(['pending', 'requested', 'received', 'verified', 'completed']),
  notes: optionalNote(1000),
});

export const teamUpdateSchema = z.object({
  user_id: uuid,
  role: z.enum(ROLES),
  is_active: z.enum(['true', 'false']).transform((v) => v === 'true'),
});

export const convertLeadSchema = z.object({
  lead_id: uuid,
  name: z.string().trim().min(2, 'Name the opportunity.').max(200),
  amount: z.string().trim(),
});

export const uuidSchema = uuid;

export { LEAD_STATUSES };

export const companySchema = z.object({
  name: z.string().trim().min(2, 'Enter the company name.').max(160),
  arabic_name: optionalNote(160),
  industry: optionalNote(120),
  city: optionalNote(80),
  website: optionalNote(200),
  size_band: optionalNote(40),
}).transform((v) => ({
  name: v.name,
  arabic_name: v.arabic_name || null,
  industry: v.industry || null,
  city: v.city || null,
  website: v.website || null,
  size_band: v.size_band || null,
}));

export const leadAssignSchema = z.object({
  lead_id: uuid,
  owner_id: z.string().trim().refine((v) => v === '' || uuid.safeParse(v).success, 'Choose a valid owner.').transform((v) => v || null),
});
