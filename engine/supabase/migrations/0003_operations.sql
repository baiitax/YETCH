-- YECH internal operations (Layer B): service-delivery tasks, campaign activities, approvals and
-- account responsibilities. Rules here are the authority; the application layer only gives clear messages.
-- Campaign records intentionally hold NO advertising spend, account credentials or platform passwords.

-- ---------- enums ----------
create type public.service_task_status as enum ('todo', 'in_progress', 'blocked', 'done');
create type public.campaign_status as enum ('planned', 'scheduled', 'live', 'paused', 'completed', 'cancelled');
create type public.approval_status as enum ('requested', 'approved', 'rejected', 'withdrawn');
create type public.responsibility_role as enum ('account_lead', 'delivery_lead', 'quality_reviewer');

-- ---------- role helpers ----------
create or replace function public.can_read_operations()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.current_app_role() in ('founder', 'commercial_manager', 'onboarding', 'reviewer'), false)
$$;

create or replace function public.can_operate()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.current_app_role() in ('founder', 'commercial_manager', 'onboarding'), false)
$$;

grant execute on function public.can_read_operations() to authenticated;
grant execute on function public.can_operate() to authenticated;

-- ---------- service-delivery tasks ----------
create table public.service_tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  title text not null check (length(trim(title)) between 2 and 200),
  description text check (description is null or length(description) <= 2000),
  status public.service_task_status not null default 'todo',
  priority public.priority_level not null default 'medium',
  owner_id uuid references public.profiles (id),
  due_on date not null,
  completed_at timestamptz,
  completion_note text check (completion_note is null or length(completion_note) <= 2000),
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_tasks_done_has_evidence check (
    status <> 'done' or (completed_at is not null and length(trim(coalesce(completion_note, ''))) >= 10)
  )
);
create index service_tasks_customer_idx on public.service_tasks (customer_id);
create index service_tasks_owner_status_idx on public.service_tasks (owner_id, status);
create index service_tasks_status_due_idx on public.service_tasks (status, due_on);

-- completed_at is derived from the status, never typed by a user.
create or replace function public.service_tasks_guard()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status = 'done' then
    if tg_op = 'INSERT' or old.status is distinct from 'done' then
      new.completed_at := now();
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger service_tasks_guard_before
  before insert or update on public.service_tasks
  for each row execute function public.service_tasks_guard();

create trigger service_tasks_touch
  before update on public.service_tasks
  for each row execute function public.touch_updated_at();

-- ---------- campaign activities ----------
create table public.campaign_activities (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 160),
  channel text not null check (channel in ('search', 'social', 'email', 'content', 'website', 'analytics', 'other')),
  status public.campaign_status not null default 'planned',
  owner_id uuid references public.profiles (id),
  starts_on date,
  ends_on date,
  objective text check (objective is null or length(objective) <= 500),
  notes text check (notes is null or length(notes) <= 2000),
  created_by uuid references public.profiles (id) default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_dates_in_order check (starts_on is null or ends_on is null or ends_on >= starts_on)
);
create index campaign_activities_customer_idx on public.campaign_activities (customer_id);
create index campaign_activities_status_idx on public.campaign_activities (status);

create trigger campaign_activities_touch
  before update on public.campaign_activities
  for each row execute function public.touch_updated_at();

-- ---------- approvals ----------
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  service_task_id uuid references public.service_tasks (id) on delete cascade,
  campaign_id uuid references public.campaign_activities (id) on delete cascade,
  status public.approval_status not null default 'requested',
  request_note text not null check (length(trim(request_note)) >= 10 and length(request_note) <= 1000),
  requested_by uuid references public.profiles (id) default auth.uid(),
  requested_at timestamptz not null default now(),
  decided_by uuid references public.profiles (id),
  decided_at timestamptz,
  decision_note text check (decision_note is null or length(decision_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint approvals_one_subject check (
    (service_task_id is not null)::int + (campaign_id is not null)::int = 1
  ),
  constraint approvals_decision_recorded check (
    status = 'requested' or (decided_by is not null and decided_at is not null)
  ),
  constraint approvals_rejection_or_approval_explained check (
    status not in ('approved', 'rejected') or length(trim(coalesce(decision_note, ''))) >= 10
  ),
  constraint approvals_no_self_decision check (
    status in ('requested', 'withdrawn') or decided_by is distinct from requested_by
  )
);
create unique index approvals_one_open_service_task on public.approvals (service_task_id)
  where status = 'requested' and service_task_id is not null;
create unique index approvals_one_open_campaign on public.approvals (campaign_id)
  where status = 'requested' and campaign_id is not null;
create index approvals_status_idx on public.approvals (status);

-- Approval rules: requests start as 'requested'; only a manager or founder approves or rejects;
-- nobody decides their own request; decisions are final; the requester may withdraw.
create or replace function public.approvals_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'requested' then
      raise exception 'invalid_transition' using errcode = '22023';
    end if;
    if new.requested_by is distinct from auth.uid() then
      raise exception 'not_allowed' using errcode = '42501';
    end if;
    return new;
  end if;

  -- UPDATE
  if new.service_task_id is distinct from old.service_task_id
     or new.campaign_id is distinct from old.campaign_id
     or new.request_note is distinct from old.request_note
     or new.requested_by is distinct from old.requested_by
     or new.requested_at is distinct from old.requested_at then
    raise exception 'approval_fields_locked' using errcode = '22023';
  end if;
  if old.status <> 'requested' then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;

  if new.status = 'withdrawn' then
    if auth.uid() is distinct from old.requested_by then
      raise exception 'not_allowed' using errcode = '42501';
    end if;
    new.decided_by := auth.uid();
    new.decided_at := now();
    return new;
  end if;

  if new.status in ('approved', 'rejected') then
    if public.current_app_role() not in ('founder', 'commercial_manager') then
      raise exception 'approval_requires_manager' using errcode = '42501';
    end if;
    if auth.uid() = old.requested_by then
      raise exception 'self_approval_not_allowed' using errcode = '42501';
    end if;
    new.decided_by := auth.uid();
    new.decided_at := now();
    return new;
  end if;

  raise exception 'invalid_transition' using errcode = '22023';
end;
$$;

create trigger approvals_guard_before
  before insert or update on public.approvals
  for each row execute function public.approvals_guard();

create trigger approvals_touch
  before update on public.approvals
  for each row execute function public.touch_updated_at();

-- A campaign may go live only with an approved approval on record. Terminal statuses stay terminal.
create or replace function public.campaign_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE' and old.status in ('completed', 'cancelled') and new.status <> old.status then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  if new.status = 'live' and (tg_op = 'INSERT' or old.status is distinct from 'live') then
    if not exists (
      select 1 from public.approvals a
      where a.campaign_id = new.id and a.status = 'approved'
    ) then
      raise exception 'approval_required' using errcode = '22023';
    end if;
  end if;
  return new;
end;
$$;

create trigger campaign_activities_guard_before
  before insert or update on public.campaign_activities
  for each row execute function public.campaign_guard();

-- ---------- account responsibilities ----------
create table public.account_responsibilities (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  profile_id uuid not null references public.profiles (id),
  responsibility public.responsibility_role not null,
  active boolean not null default true,
  assigned_by uuid references public.profiles (id) default auth.uid(),
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  constraint responsibility_end_recorded check (active or ended_at is not null)
);
create unique index account_responsibilities_one_active on public.account_responsibilities (customer_id, responsibility)
  where active;
create index account_responsibilities_profile_idx on public.account_responsibilities (profile_id);

-- Only active staff can hold a responsibility. Ending one records the time; it is not reopened (assign again).
create or replace function public.account_responsibilities_guard()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' or new.profile_id is distinct from old.profile_id then
    if not exists (select 1 from public.profiles p where p.id = new.profile_id and p.is_active) then
      raise exception 'profile_not_active' using errcode = '22023';
    end if;
  end if;
  if tg_op = 'UPDATE' then
    if new.active and not old.active then
      raise exception 'invalid_transition' using errcode = '22023';
    end if;
    if old.active and not new.active then
      new.ended_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger account_responsibilities_guard_before
  before insert or update on public.account_responsibilities
  for each row execute function public.account_responsibilities_guard();

-- ---------- row-level security ----------
alter table public.service_tasks enable row level security;
alter table public.campaign_activities enable row level security;
alter table public.approvals enable row level security;
alter table public.account_responsibilities enable row level security;

create policy service_tasks_select on public.service_tasks for select to authenticated
  using (public.can_read_operations());
create policy service_tasks_insert on public.service_tasks for insert to authenticated
  with check (public.can_operate() and created_by = auth.uid());
create policy service_tasks_update on public.service_tasks for update to authenticated
  using (public.can_operate() or (owner_id = auth.uid() and public.can_read_operations()))
  with check (public.can_operate() or (owner_id = auth.uid() and public.can_read_operations()));
create policy service_tasks_delete on public.service_tasks for delete to authenticated
  using (public.current_app_role() = 'founder');

create policy campaign_select on public.campaign_activities for select to authenticated
  using (public.can_read_operations());
create policy campaign_insert on public.campaign_activities for insert to authenticated
  with check (public.can_operate() and created_by = auth.uid());
create policy campaign_update on public.campaign_activities for update to authenticated
  using (public.can_operate()) with check (public.can_operate());
create policy campaign_delete on public.campaign_activities for delete to authenticated
  using (public.current_app_role() = 'founder');

create policy approvals_select on public.approvals for select to authenticated
  using (public.can_read_operations());
create policy approvals_insert on public.approvals for insert to authenticated
  with check (public.can_operate() and requested_by = auth.uid());
create policy approvals_update on public.approvals for update to authenticated
  using (public.is_manager_or_founder() or requested_by = auth.uid())
  with check (public.is_manager_or_founder() or requested_by = auth.uid());
-- No delete policy: approvals are part of the decision record.

create policy responsibilities_select on public.account_responsibilities for select to authenticated
  using (public.can_read_operations());
create policy responsibilities_insert on public.account_responsibilities for insert to authenticated
  with check (public.is_manager_or_founder() and assigned_by = auth.uid());
create policy responsibilities_update on public.account_responsibilities for update to authenticated
  using (public.is_manager_or_founder()) with check (public.is_manager_or_founder());
-- No delete policy: ending a responsibility keeps the history.

-- ---------- audit (triggers, same as the commercial tables) ----------
create trigger audit_service_tasks after insert or update or delete on public.service_tasks
  for each row execute function public.write_audit_event();
create trigger audit_campaign_activities after insert or update or delete on public.campaign_activities
  for each row execute function public.write_audit_event();
create trigger audit_approvals after insert or update or delete on public.approvals
  for each row execute function public.write_audit_event();
create trigger audit_account_responsibilities after insert or update or delete on public.account_responsibilities
  for each row execute function public.write_audit_event();

-- ---------- grants (same intent as 0002: no anonymous access) ----------
grant select, insert, update, delete on public.service_tasks, public.campaign_activities,
  public.approvals, public.account_responsibilities to authenticated;
