-- YECH Commercial Engine — migration 0002: commercial records, lifecycle guards and row-level security.
-- Money is stored as bigint minor units (halalas for SAR). No floating point in financial fields.
-- Business rules that must always hold are enforced here, not only in application code.

-- ---------- enums ----------
create type public.lead_source as enum (
  'public_website', 'consultation_form', 'referral', 'direct_outreach', 'linkedin',
  'industry_event', 'business_directory', 'partner_referral', 'existing_customer',
  'organic_search', 'paid_advertising', 'manual_entry', 'other'
);
create type public.lead_status as enum (
  'new', 'awaiting_review', 'contact_attempted', 'contacted', 'engaged', 'qualified',
  'nurture', 'disqualified', 'converted_opportunity', 'converted_customer'
);
create type public.consent_status as enum ('unknown', 'granted', 'declined');
create type public.priority_level as enum ('low', 'medium', 'high');
create type public.opportunity_stage as enum (
  'qualification', 'discovery_scheduled', 'discovery_completed', 'business_diagnosis',
  'proposal_preparation', 'proposal_sent', 'negotiation', 'verbal_acceptance',
  'closed_won', 'closed_lost'
);
create type public.activity_type as enum (
  'phone_call', 'email', 'whatsapp_manual', 'meeting', 'consultation', 'proposal_sent',
  'internal_note', 'follow_up', 'customer_request', 'other'
);
create type public.task_type as enum ('follow_up', 'call', 'meeting', 'proposal_review', 'other');
create type public.task_status as enum ('open', 'in_progress', 'completed', 'cancelled');
create type public.proposal_status as enum (
  'draft', 'internal_review', 'approved', 'sent', 'accepted', 'rejected', 'expired', 'superseded', 'withdrawn'
);
create type public.customer_status as enum ('onboarding', 'active', 'paused', 'ended');
create type public.onboarding_state as enum ('pending', 'requested', 'received', 'verified', 'completed');

-- ---------- shared helpers ----------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

-- ---------- companies and contacts ----------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 160),
  arabic_name text,
  website text,
  industry text,
  country text not null default 'SA',
  city text,
  size_band text,
  owner_id uuid references public.profiles (id),
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index companies_name_idx on public.companies (lower(name));
create index companies_owner_idx on public.companies (owner_id);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies (id) on delete set null,
  first_name text not null check (length(trim(first_name)) > 0),
  last_name text not null default '',
  job_title text,
  email text,
  email_normalized text,
  phone text,
  phone_normalized text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ar')),
  preferred_channel text not null default 'email',
  notes text,
  owner_id uuid references public.profiles (id),
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_email_lowercase check (email_normalized is null or email_normalized = lower(email_normalized))
);
create index contacts_email_idx on public.contacts (email_normalized);
create index contacts_phone_idx on public.contacts (phone_normalized);
create index contacts_company_idx on public.contacts (company_id);

-- ---------- leads ----------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (length(trim(first_name)) > 0),
  last_name text not null default '',
  job_title text,
  company_name text,
  company_id uuid references public.companies (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  email text,
  email_normalized text,
  phone text,
  phone_normalized text,
  website text,
  country text not null default 'SA',
  city text,
  industry text,
  company_size text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'ar')),
  source public.lead_source not null,
  original_source public.lead_source not null,
  source_campaign text,
  utm jsonb not null default '{}'::jsonb,
  landing_page text,
  status public.lead_status not null default 'new',
  priority public.priority_level not null default 'medium',
  estimated_value_minor bigint check (estimated_value_minor is null or estimated_value_minor >= 0),
  currency char(3) not null default 'SAR' check (currency ~ '^[A-Z]{3}$'),
  service_of_interest text,
  business_challenge text,
  qualification_notes text,
  qualified_at timestamptz,
  qualified_by uuid references public.profiles (id),
  disqualified_reason text,
  communication_consent public.consent_status not null default 'unknown',
  converted_opportunity_id uuid,
  owner_id uuid references public.profiles (id),
  last_activity_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_email_lowercase check (email_normalized is null or email_normalized = lower(email_normalized)),
  constraint leads_contact_required check (email is not null or phone is not null)
);
create index leads_status_idx on public.leads (status);
create index leads_owner_idx on public.leads (owner_id);
create index leads_created_idx on public.leads (created_at desc);
create index leads_email_idx on public.leads (email_normalized);
create index leads_phone_idx on public.leads (phone_normalized);

-- Lifecycle guards for leads.
create or replace function public.leads_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.app_role := public.current_app_role();
begin
  if new.status = 'qualified'
     and (tg_op = 'INSERT' or old.status is distinct from 'qualified')
     and (new.qualification_notes is null or length(trim(new.qualification_notes)) < 10) then
    raise exception 'qualification_evidence_required' using errcode = 'check_violation';
  end if;

  if new.status = 'qualified' and (tg_op = 'INSERT' or old.status is distinct from 'qualified') then
    new.qualified_at := now();
    new.qualified_by := auth.uid();
  end if;

  if new.status = 'disqualified'
     and (new.disqualified_reason is null or length(trim(new.disqualified_reason)) < 3) then
    raise exception 'disqualification_reason_required' using errcode = 'check_violation';
  end if;

  if tg_op = 'UPDATE'
     and new.status in ('converted_opportunity', 'converted_customer')
     and old.status is distinct from new.status
     and coalesce(current_setting('app.lead_conversion', true), '') <> 'on' then
    raise exception 'conversion_requires_rpc' using errcode = 'check_violation';
  end if;

  if v_role = 'sales_executive' then
    if new.owner_id is not null and new.owner_id is distinct from auth.uid() then
      raise exception 'assignment_requires_manager' using errcode = '42501';
    end if;
  end if;

  new.email_normalized := case when new.email is null then null else lower(trim(new.email)) end;
  return new;
end
$$;

create trigger leads_guard_before
  before insert or update on public.leads
  for each row execute function public.leads_guard();
create trigger leads_touch
  before update on public.leads
  for each row execute function public.touch_updated_at();

-- ---------- opportunities ----------
create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 200),
  company_id uuid references public.companies (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  lead_id uuid references public.leads (id) on delete set null,
  service_of_interest text,
  owner_id uuid references public.profiles (id),
  stage public.opportunity_stage not null default 'qualification',
  amount_minor bigint not null default 0 check (amount_minor >= 0),
  currency char(3) not null default 'SAR' check (currency ~ '^[A-Z]{3}$'),
  probability_pct integer check (probability_pct is null or probability_pct between 0 and 100),
  expected_close_date date,
  next_action text,
  next_action_at timestamptz,
  decision_process text,
  commercial_blockers text,
  competitor_or_alternative text,
  loss_reason text,
  win_reason text,
  final_value_minor bigint check (final_value_minor is null or final_value_minor > 0),
  won_at timestamptz,
  lost_at timestamptz,
  last_activity_at timestamptz,
  notes text,
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index opportunities_stage_idx on public.opportunities (stage);
create index opportunities_owner_idx on public.opportunities (owner_id);
create index opportunities_company_idx on public.opportunities (company_id);

create or replace function public.opportunities_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.app_role := public.current_app_role();
  v_is_privileged boolean := auth.uid() is null or coalesce(v_role in ('founder', 'commercial_manager'), false);
begin
  if new.stage = 'closed_won' and (tg_op = 'INSERT' or old.stage is distinct from 'closed_won') then
    if not v_is_privileged then
      raise exception 'closing_won_requires_manager' using errcode = '42501';
    end if;
    if new.final_value_minor is null or new.final_value_minor <= 0 then
      raise exception 'final_value_required' using errcode = 'check_violation';
    end if;
    -- A deal is won only on an explicitly recorded proposal acceptance. Never inferred from stage alone.
    if not exists (
      select 1 from public.proposals p where p.opportunity_id = new.id and p.status = 'accepted'
    ) then
      raise exception 'won_requires_accepted_proposal' using errcode = 'check_violation';
    end if;
    new.won_at := now();
    new.probability_pct := 100;
  end if;

  if new.stage = 'closed_lost' and (tg_op = 'INSERT' or old.stage is distinct from 'closed_lost') then
    if new.loss_reason is null or length(trim(new.loss_reason)) < 3 then
      raise exception 'loss_reason_required' using errcode = 'check_violation';
    end if;
    new.lost_at := now();
    new.probability_pct := 0;
  end if;

  if new.stage <> 'closed_won' and old.stage = 'closed_won' and tg_op = 'UPDATE' then
    raise exception 'won_opportunity_is_locked' using errcode = 'check_violation';
  end if;

  if v_role = 'sales_executive' and new.owner_id is distinct from auth.uid() then
    raise exception 'assignment_requires_manager' using errcode = '42501';
  end if;
  return new;
end
$$;

create trigger opportunities_guard_before
  before insert or update on public.opportunities
  for each row execute function public.opportunities_guard();
create trigger opportunities_touch
  before update on public.opportunities
  for each row execute function public.touch_updated_at();

-- Stage history is written by a trigger so that it cannot be skipped by any caller.
create table public.opportunity_stage_history (
  id bigint generated always as identity primary key,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  from_stage public.opportunity_stage,
  to_stage public.opportunity_stage not null,
  changed_by uuid,
  changed_at timestamptz not null default now(),
  note text
);
create index opportunity_stage_history_opp_idx on public.opportunity_stage_history (opportunity_id, changed_at);

create or replace function public.record_stage_history()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' or old.stage is distinct from new.stage then
    insert into public.opportunity_stage_history (opportunity_id, from_stage, to_stage, changed_by, note)
    values (new.id, case when tg_op = 'INSERT' then null else old.stage end, new.stage, auth.uid(), null);
  end if;
  return new;
end
$$;

create trigger opportunities_stage_history
  after insert or update on public.opportunities
  for each row execute function public.record_stage_history();

-- ---------- activities ----------
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  type public.activity_type not null,
  subject text not null check (length(trim(subject)) between 2 and 200),
  body text,
  occurred_at timestamptz not null default now(),
  lead_id uuid references public.leads (id) on delete cascade,
  opportunity_id uuid references public.opportunities (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  constraint activities_has_link check (
    lead_id is not null or opportunity_id is not null or company_id is not null or contact_id is not null
  )
);
create index activities_lead_idx on public.activities (lead_id, occurred_at desc);
create index activities_opp_idx on public.activities (opportunity_id, occurred_at desc);

create or replace function public.activities_touch_parents()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.lead_id is not null then
    update public.leads set last_activity_at = greatest(coalesce(last_activity_at, new.occurred_at), new.occurred_at)
      where id = new.lead_id;
  end if;
  if new.opportunity_id is not null then
    update public.opportunities set last_activity_at = greatest(coalesce(last_activity_at, new.occurred_at), new.occurred_at)
      where id = new.opportunity_id;
  end if;
  return new;
end
$$;

create trigger activities_touch_parents
  after insert on public.activities
  for each row execute function public.activities_touch_parents();

-- ---------- tasks and follow-ups ----------
-- Overdue is derived from due_at and status in queries. It is never stored as a status.
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 2 and 200),
  description text,
  task_type public.task_type not null default 'follow_up',
  lead_id uuid references public.leads (id) on delete cascade,
  opportunity_id uuid references public.opportunities (id) on delete cascade,
  assigned_to uuid references public.profiles (id),
  due_at timestamptz not null,
  priority public.priority_level not null default 'medium',
  status public.task_status not null default 'open',
  completed_at timestamptz,
  outcome text,
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_has_record check (lead_id is not null or opportunity_id is not null),
  constraint tasks_completed_has_evidence check (
    status <> 'completed' or (completed_at is not null and outcome is not null and length(trim(outcome)) > 0)
  )
);
create index tasks_assignee_due_idx on public.tasks (assigned_to, due_at);
create index tasks_status_due_idx on public.tasks (status, due_at);

create trigger tasks_touch
  before update on public.tasks
  for each row execute function public.touch_updated_at();

-- ---------- proposals ----------
create sequence public.proposal_number_seq;

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  proposal_number text not null unique,
  opportunity_id uuid not null references public.opportunities (id) on delete cascade,
  title text not null check (length(trim(title)) between 3 and 200),
  service_package text not null,
  scope_of_work text not null,
  deliverables text,
  exclusions text,
  timeline_text text,
  setup_fee_minor bigint not null default 0 check (setup_fee_minor >= 0),
  recurring_fee_minor bigint not null default 0 check (recurring_fee_minor >= 0),
  recurring_interval text not null default 'monthly' check (recurring_interval in ('monthly', 'quarterly', 'annual', 'none')),
  currency char(3) not null default 'SAR' check (currency ~ '^[A-Z]{3}$'),
  payment_schedule text,
  assumptions text,
  client_responsibilities text,
  advertising_spend_note text not null default 'Advertising spend is excluded from all packages and is paid by the client directly to the platform.',
  valid_until date,
  version integer not null default 1 check (version >= 1),
  supersedes_id uuid references public.proposals (id),
  status public.proposal_status not null default 'draft',
  prepared_by uuid references public.profiles (id) default auth.uid(),
  approved_by uuid references public.profiles (id),
  approved_at timestamptz,
  sent_at timestamptz,
  sent_channel text,
  accepted_at timestamptz,
  acceptance_evidence text,
  rejected_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index proposals_opp_idx on public.proposals (opportunity_id);
create index proposals_status_idx on public.proposals (status);

create or replace function public.proposals_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.app_role := public.current_app_role();
  v_is_privileged boolean := auth.uid() is null or coalesce(v_role in ('founder', 'commercial_manager'), false);
begin
  if tg_op = 'INSERT' then
    if new.proposal_number is null or new.proposal_number = '' then
      new.proposal_number := 'YECH-P-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.proposal_number_seq')::text, 4, '0');
    end if;
    if new.status <> 'draft' then
      raise exception 'proposal_must_start_as_draft' using errcode = 'check_violation';
    end if;
  end if;

  if tg_op = 'UPDATE' and old.status in ('accepted', 'superseded', 'withdrawn') then
    raise exception 'proposal_is_final' using errcode = 'check_violation';
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if new.status = 'internal_review' and old.status <> 'draft' then
      raise exception 'invalid_proposal_transition' using errcode = 'check_violation';
    end if;
    if new.status = 'approved' then
      if not v_is_privileged then raise exception 'approval_requires_manager' using errcode = '42501'; end if;
      if old.status <> 'internal_review' then raise exception 'invalid_proposal_transition' using errcode = 'check_violation'; end if;
      new.approved_by := auth.uid();
      new.approved_at := now();
    end if;
    if new.status = 'sent' then
      if old.status <> 'approved' then raise exception 'invalid_proposal_transition' using errcode = 'check_violation'; end if;
      if new.sent_channel is null or length(trim(new.sent_channel)) < 2 then
        raise exception 'sent_channel_required' using errcode = 'check_violation';
      end if;
      new.sent_at := coalesce(new.sent_at, now());
    end if;
    if new.status = 'accepted' then
      if not v_is_privileged then raise exception 'acceptance_requires_manager' using errcode = '42501'; end if;
      if old.status <> 'sent' then raise exception 'invalid_proposal_transition' using errcode = 'check_violation'; end if;
      if new.acceptance_evidence is null or length(trim(new.acceptance_evidence)) < 10 then
        raise exception 'acceptance_evidence_required' using errcode = 'check_violation';
      end if;
      new.accepted_at := now();
    end if;
    if new.status = 'rejected' and old.status not in ('sent') then
      raise exception 'invalid_proposal_transition' using errcode = 'check_violation';
    end if;
  end if;

  return new;
end
$$;

create trigger proposals_guard_before
  before insert or update on public.proposals
  for each row execute function public.proposals_guard();
create trigger proposals_touch
  before update on public.proposals
  for each row execute function public.touch_updated_at();

-- ---------- customers and onboarding ----------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null unique references public.opportunities (id),
  company_id uuid references public.companies (id) on delete set null,
  primary_contact_id uuid references public.contacts (id) on delete set null,
  name text not null,
  service_of_interest text,
  contract_value_minor bigint not null check (contract_value_minor > 0),
  currency char(3) not null default 'SAR' check (currency ~ '^[A-Z]{3}$'),
  contract_reference text,
  billing_frequency text not null default 'monthly' check (billing_frequency in ('monthly', 'quarterly', 'annual', 'one_time')),
  start_date date,
  renewal_date date,
  status public.customer_status not null default 'onboarding',
  account_owner_id uuid references public.profiles (id),
  won_at timestamptz not null default now(),
  health_notes text,
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_owner_idx on public.customers (account_owner_id);

create trigger customers_touch
  before update on public.customers
  for each row execute function public.touch_updated_at();

create table public.onboarding_items (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  title text not null,
  state public.onboarding_state not null default 'pending',
  owner_id uuid references public.profiles (id),
  sort_order integer not null default 0,
  notes text,
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index onboarding_items_customer_idx on public.onboarding_items (customer_id, sort_order);

create or replace function public.onboarding_touch()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end
$$;

create trigger onboarding_items_touch
  before update on public.onboarding_items
  for each row execute function public.onboarding_touch();

-- ---------- audit attachments ----------
create trigger audit_companies after insert or update or delete on public.companies
  for each row execute function public.write_audit_event();
create trigger audit_contacts after insert or update or delete on public.contacts
  for each row execute function public.write_audit_event();
create trigger audit_leads after insert or update or delete on public.leads
  for each row execute function public.write_audit_event();
create trigger audit_opportunities after insert or update or delete on public.opportunities
  for each row execute function public.write_audit_event();
create trigger audit_proposals after insert or update or delete on public.proposals
  for each row execute function public.write_audit_event();
create trigger audit_customers after insert or update or delete on public.customers
  for each row execute function public.write_audit_event();
create trigger audit_tasks after insert or update or delete on public.tasks
  for each row execute function public.write_audit_event();
create trigger audit_onboarding after insert or update or delete on public.onboarding_items
  for each row execute function public.write_audit_event();
create trigger audit_profiles after update on public.profiles
  for each row execute function public.write_audit_event();

-- ---------- row-level security ----------
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_stage_history enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.proposals enable row level security;
alter table public.customers enable row level security;
alter table public.onboarding_items enable row level security;

-- Companies and contacts: visible to commercial roles; editable by managers, founders and owners.
create policy companies_select on public.companies for select to authenticated
  using (public.current_app_role() in ('founder', 'commercial_manager', 'sales_executive', 'reviewer'));
create policy companies_insert on public.companies for insert to authenticated
  with check (public.current_app_role() in ('founder', 'commercial_manager', 'sales_executive'));
create policy companies_update on public.companies for update to authenticated
  using (public.is_manager_or_founder() or (public.current_app_role() = 'sales_executive' and owner_id = auth.uid()))
  with check (public.is_manager_or_founder() or (public.current_app_role() = 'sales_executive' and owner_id = auth.uid()));
create policy companies_delete on public.companies for delete to authenticated
  using (public.current_app_role() = 'founder');

create policy contacts_select on public.contacts for select to authenticated
  using (public.current_app_role() in ('founder', 'commercial_manager', 'sales_executive', 'reviewer'));
create policy contacts_insert on public.contacts for insert to authenticated
  with check (public.current_app_role() in ('founder', 'commercial_manager', 'sales_executive'));
create policy contacts_update on public.contacts for update to authenticated
  using (public.is_manager_or_founder() or (public.current_app_role() = 'sales_executive' and owner_id = auth.uid()))
  with check (public.is_manager_or_founder() or (public.current_app_role() = 'sales_executive' and owner_id = auth.uid()));
create policy contacts_delete on public.contacts for delete to authenticated
  using (public.current_app_role() = 'founder');

-- Leads: sales see their own and the unassigned queue. Managers and founders see all. Reviewers read only.
create policy leads_select on public.leads for select to authenticated
  using (
    public.is_manager_or_founder()
    or public.current_app_role() = 'reviewer'
    or (public.current_app_role() = 'sales_executive' and (owner_id = auth.uid() or owner_id is null))
  );
create policy leads_insert on public.leads for insert to authenticated
  with check (public.current_app_role() in ('founder', 'commercial_manager', 'sales_executive'));
create policy leads_update on public.leads for update to authenticated
  using (public.is_manager_or_founder() or (public.current_app_role() = 'sales_executive' and owner_id = auth.uid()))
  with check (public.is_manager_or_founder() or (public.current_app_role() = 'sales_executive' and owner_id = auth.uid()));
create policy leads_delete on public.leads for delete to authenticated
  using (public.current_app_role() = 'founder');

-- Opportunities: sales see their own. Won-deal visibility for onboarding staff is limited to closed-won records.
create policy opportunities_select on public.opportunities for select to authenticated
  using (
    public.is_manager_or_founder()
    or public.current_app_role() = 'reviewer'
    or (public.current_app_role() = 'sales_executive' and owner_id = auth.uid())
    or (public.current_app_role() = 'onboarding' and stage = 'closed_won')
  );
create policy opportunities_insert on public.opportunities for insert to authenticated
  with check (public.current_app_role() in ('founder', 'commercial_manager', 'sales_executive'));
create policy opportunities_update on public.opportunities for update to authenticated
  using (public.is_manager_or_founder() or (public.current_app_role() = 'sales_executive' and owner_id = auth.uid()))
  with check (public.is_manager_or_founder() or (public.current_app_role() = 'sales_executive' and owner_id = auth.uid()));
create policy opportunities_delete on public.opportunities for delete to authenticated
  using (public.current_app_role() = 'founder');

-- Stage history: readable wherever the parent opportunity is readable (the subquery runs under RLS).
-- No write policies: rows are created only by the security-definer trigger.
create policy stage_history_select on public.opportunity_stage_history for select to authenticated
  using (exists (select 1 from public.opportunities o where o.id = opportunity_id));

-- Activities: visible when the linked lead or opportunity is visible, or when the user created them.
create policy activities_select on public.activities for select to authenticated
  using (
    public.is_manager_or_founder()
    or public.current_app_role() = 'reviewer'
    or created_by = auth.uid()
    or exists (select 1 from public.leads l where l.id = activities.lead_id)
    or exists (select 1 from public.opportunities o where o.id = activities.opportunity_id)
  );
create policy activities_insert on public.activities for insert to authenticated
  with check (
    public.current_app_role() in ('founder', 'commercial_manager', 'sales_executive')
    and created_by = auth.uid()
  );
create policy activities_update on public.activities for update to authenticated
  using (public.is_manager_or_founder() or created_by = auth.uid())
  with check (public.is_manager_or_founder() or created_by = auth.uid());
create policy activities_delete on public.activities for delete to authenticated
  using (public.current_app_role() = 'founder');

-- Tasks: managers see all. Others see tasks assigned to or created by them.
create policy tasks_select on public.tasks for select to authenticated
  using (
    public.is_manager_or_founder()
    or public.current_app_role() = 'reviewer'
    or assigned_to = auth.uid()
    or created_by = auth.uid()
  );
create policy tasks_insert on public.tasks for insert to authenticated
  with check (
    public.current_app_role() in ('founder', 'commercial_manager', 'sales_executive')
    and created_by = auth.uid()
  );
create policy tasks_update on public.tasks for update to authenticated
  using (public.is_manager_or_founder() or assigned_to = auth.uid() or created_by = auth.uid())
  with check (public.is_manager_or_founder() or assigned_to = auth.uid() or created_by = auth.uid());
create policy tasks_delete on public.tasks for delete to authenticated
  using (public.current_app_role() = 'founder');

-- Proposals: visible with the opportunity; sales edit only their own drafts. Approval and acceptance are restricted by trigger.
create policy proposals_select on public.proposals for select to authenticated
  using (
    public.is_manager_or_founder()
    or public.current_app_role() = 'reviewer'
    or prepared_by = auth.uid()
    or exists (select 1 from public.opportunities o where o.id = opportunity_id)
  );
create policy proposals_insert on public.proposals for insert to authenticated
  with check (
    public.current_app_role() in ('founder', 'commercial_manager', 'sales_executive')
    and prepared_by = auth.uid()
  );
create policy proposals_update on public.proposals for update to authenticated
  using (
    public.is_manager_or_founder()
    or (prepared_by = auth.uid() and status in ('draft', 'internal_review'))
  )
  with check (
    public.is_manager_or_founder()
    or (prepared_by = auth.uid() and status in ('draft', 'internal_review'))
  );
create policy proposals_delete on public.proposals for delete to authenticated
  using (public.current_app_role() = 'founder' and status in ('draft', 'withdrawn'));

-- Customers: handover is created by the security-definer RPC. Managers and onboarding staff can read and update.
create policy customers_select on public.customers for select to authenticated
  using (
    public.is_manager_or_founder()
    or public.current_app_role() in ('reviewer', 'onboarding')
    or (public.current_app_role() = 'sales_executive' and account_owner_id = auth.uid())
  );
create policy customers_update on public.customers for update to authenticated
  using (public.is_manager_or_founder())
  with check (public.is_manager_or_founder());
create policy customers_delete on public.customers for delete to authenticated
  using (public.current_app_role() = 'founder');

-- Onboarding items: readable with the customer. Onboarding staff update states; managers may add items.
create policy onboarding_select on public.onboarding_items for select to authenticated
  using (exists (select 1 from public.customers c where c.id = customer_id));
create policy onboarding_insert on public.onboarding_items for insert to authenticated
  with check (public.is_manager_or_founder());
create policy onboarding_update on public.onboarding_items for update to authenticated
  using (public.is_manager_or_founder() or public.current_app_role() = 'onboarding')
  with check (public.is_manager_or_founder() or public.current_app_role() = 'onboarding');
create policy onboarding_delete on public.onboarding_items for delete to authenticated
  using (public.current_app_role() = 'founder');

-- ---------- RPCs: multi-step operations that must be atomic ----------

-- Converts a qualified lead into an opportunity. Also creates the company and contact if they do not exist.
create or replace function public.convert_lead_to_opportunity(
  p_lead_id uuid,
  p_name text,
  p_amount_minor bigint,
  p_currency char(3) default 'SAR'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.app_role := public.current_app_role();
  v_lead public.leads%rowtype;
  v_company_id uuid;
  v_contact_id uuid;
  v_opp_id uuid;
begin
  if v_role is null or v_role = 'reviewer' or v_role = 'onboarding' then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into v_lead from public.leads where id = p_lead_id for update;
  if not found then
    raise exception 'lead_not_found' using errcode = 'P0002';
  end if;
  if v_role = 'sales_executive' and v_lead.owner_id is distinct from auth.uid() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_lead.status <> 'qualified' then
    raise exception 'lead_must_be_qualified' using errcode = 'check_violation';
  end if;
  if v_lead.converted_opportunity_id is not null then
    raise exception 'lead_already_converted' using errcode = 'check_violation';
  end if;
  if p_amount_minor is null or p_amount_minor < 0 then
    raise exception 'amount_invalid' using errcode = 'check_violation';
  end if;

  if v_lead.company_name is not null and length(trim(v_lead.company_name)) > 1 then
    if v_lead.company_id is not null then
      v_company_id := v_lead.company_id;
    else
      insert into public.companies (name, industry, country, city, website, owner_id)
      values (trim(v_lead.company_name), v_lead.industry, v_lead.country, v_lead.city, v_lead.website, coalesce(v_lead.owner_id, auth.uid()))
      returning id into v_company_id;
    end if;
  end if;

  if v_lead.contact_id is not null then
    v_contact_id := v_lead.contact_id;
  else
    insert into public.contacts (company_id, first_name, last_name, job_title, email, phone, preferred_language, owner_id)
    values (v_company_id, v_lead.first_name, v_lead.last_name, v_lead.job_title, v_lead.email, v_lead.phone, v_lead.preferred_language, coalesce(v_lead.owner_id, auth.uid()))
    returning id into v_contact_id;
  end if;

  insert into public.opportunities (name, company_id, contact_id, lead_id, service_of_interest, owner_id, amount_minor, currency, stage)
  values (trim(p_name), v_company_id, v_contact_id, v_lead.id, v_lead.service_of_interest, coalesce(v_lead.owner_id, auth.uid()), p_amount_minor, p_currency, 'qualification')
  returning id into v_opp_id;

  perform set_config('app.lead_conversion', 'on', true);
  update public.leads
     set status = 'converted_opportunity',
         converted_opportunity_id = v_opp_id,
         company_id = coalesce(company_id, v_company_id),
         contact_id = coalesce(contact_id, v_contact_id)
   where id = v_lead.id;
  perform set_config('app.lead_conversion', '', true);

  return v_opp_id;
end
$$;

-- Creates the customer record and onboarding checklist for a closed-won opportunity. Idempotent.
create or replace function public.handover_won_opportunity(p_opportunity_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role public.app_role := public.current_app_role();
  v_opp public.opportunities%rowtype;
  v_customer_id uuid;
  v_titles text[] := array[
    'Agreement confirmed',
    'Scope approved',
    'Billing details collected',
    'Initial payment verified',
    'Kickoff meeting scheduled',
    'Client goals documented',
    'Required access requested',
    'Required assets received',
    'Data handling requirements reviewed',
    'Reporting expectations agreed',
    'Delivery owner assigned',
    'First review date scheduled'
  ];
  i integer;
begin
  if v_role is null then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select * into v_opp from public.opportunities where id = p_opportunity_id for update;
  if not found then
    raise exception 'opportunity_not_found' using errcode = 'P0002';
  end if;
  if v_role = 'sales_executive' and v_opp.owner_id is distinct from auth.uid() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_role not in ('founder', 'commercial_manager', 'sales_executive') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if v_opp.stage <> 'closed_won' or v_opp.final_value_minor is null then
    raise exception 'opportunity_not_won' using errcode = 'check_violation';
  end if;

  select id into v_customer_id from public.customers where opportunity_id = v_opp.id;
  if v_customer_id is not null then
    return v_customer_id; -- already handed over; no duplicate customer or checklist
  end if;

  insert into public.customers (
    opportunity_id, company_id, primary_contact_id, name, service_of_interest,
    contract_value_minor, currency, account_owner_id, won_at, status
  )
  values (
    v_opp.id, v_opp.company_id, v_opp.contact_id,
    coalesce((select c.name from public.companies c where c.id = v_opp.company_id), v_opp.name),
    v_opp.service_of_interest, v_opp.final_value_minor, v_opp.currency,
    v_opp.owner_id, coalesce(v_opp.won_at, now()), 'onboarding'
  )
  returning id into v_customer_id;

  for i in 1..array_length(v_titles, 1) loop
    insert into public.onboarding_items (customer_id, title, sort_order)
    values (v_customer_id, v_titles[i], i);
  end loop;

  if v_opp.lead_id is not null then
    perform set_config('app.lead_conversion', 'on', true);
    update public.leads set status = 'converted_customer' where id = v_opp.lead_id;
    perform set_config('app.lead_conversion', '', true);
  end if;

  return v_customer_id;
end
$$;

-- ---------- grants ----------
-- Supabase applies default grants; these make the intent explicit and remove anonymous access.
revoke all on all tables in schema public from anon;
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.audit_events to authenticated;
revoke insert, update, delete, truncate on public.audit_events from authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke execute on all functions in schema public from public;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_manager_or_founder() to authenticated;
grant execute on function public.convert_lead_to_opportunity(uuid, text, bigint, char) to authenticated;
grant execute on function public.handover_won_opportunity(uuid) to authenticated;
