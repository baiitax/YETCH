-- YECH Commercial Engine — migration 0001: identity, roles and audit foundation.
-- Target: Supabase Postgres (provides the auth schema: auth.users and auth.uid()).
-- Every new account starts inactive with the lowest-privilege role. Only an active founder
-- can change roles or activate accounts. This prevents self-promotion.

-- ---------- enums ----------
create type public.app_role as enum (
  'founder',
  'commercial_manager',
  'sales_executive',
  'onboarding',
  'reviewer'
);

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role public.app_role not null default 'reviewer',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_lowercase check (email = lower(email))
);

-- Role of the signed-in user, or null when the account is missing or inactive.
-- Security definer so policies can call it without recursing into profiles' own RLS.
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.role from public.profiles p
  where p.id = auth.uid() and p.is_active
$$;

create or replace function public.is_manager_or_founder()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.current_app_role() in ('founder', 'commercial_manager'), false)
$$;

-- Creates an inactive reviewer profile whenever an auth account is created.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'reviewer',
    false
  )
  on conflict (id) do nothing;
  return new;
end
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Only founders may change role or activation. Trusted SQL-editor sessions (no JWT, auth.uid() is null)
-- are allowed for initial bootstrap; they are not reachable from the application.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is not null
     and (
       new.role is distinct from old.role
       or new.is_active is distinct from old.is_active
       or new.id is distinct from old.id
       or new.email is distinct from old.email
     )
     and public.current_app_role() is distinct from 'founder' then
    raise exception 'privilege_change_requires_founder' using errcode = '42501';
  end if;
  new.updated_at = now();
  return new;
end
$$;

create trigger profiles_protect_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

alter table public.profiles enable row level security;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.current_app_role() is not null);

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.current_app_role() = 'founder')
  with check (id = auth.uid() or public.current_app_role() = 'founder');

-- ---------- audit ----------
-- Append-only. Written by triggers (security definer). Only founders can read it.
-- Records changed column names, never full row values, to limit personal data in the log.
create table public.audit_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  action text not null check (action in ('insert', 'update', 'delete')),
  entity text not null,
  entity_id text not null,
  changed_fields text[] not null default '{}',
  summary text not null default ''
);

create index audit_events_entity_idx on public.audit_events (entity, entity_id, occurred_at desc);
create index audit_events_occurred_idx on public.audit_events (occurred_at desc);

create or replace function public.write_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_changed text[];
  v_entity_id text;
begin
  if tg_op = 'INSERT' then
    v_entity_id := to_jsonb(new) ->> 'id';
    select coalesce(array_agg(key order by key), '{}')
      into v_changed
      from jsonb_object_keys(to_jsonb(new)) as key
      where key not in ('created_at', 'updated_at');
    insert into public.audit_events (actor_id, action, entity, entity_id, changed_fields, summary)
    values (auth.uid(), 'insert', tg_table_name, v_entity_id, v_changed, 'created');
    return new;
  elsif tg_op = 'UPDATE' then
    v_entity_id := to_jsonb(new) ->> 'id';
    select coalesce(array_agg(n.key order by n.key), '{}')
      into v_changed
      from jsonb_each(to_jsonb(new)) as n(key, value)
      where n.key not in ('created_at', 'updated_at')
        and (to_jsonb(old) ->> n.key) is distinct from (to_jsonb(new) ->> n.key);
    if array_length(v_changed, 1) is null then
      return new; -- nothing meaningful changed
    end if;
    insert into public.audit_events (actor_id, action, entity, entity_id, changed_fields, summary)
    values (auth.uid(), 'update', tg_table_name, v_entity_id, v_changed, 'changed');
    return new;
  else
    v_entity_id := to_jsonb(old) ->> 'id';
    insert into public.audit_events (actor_id, action, entity, entity_id, changed_fields, summary)
    values (auth.uid(), 'delete', tg_table_name, v_entity_id, '{}', 'deleted');
    return old;
  end if;
end
$$;

alter table public.audit_events enable row level security;

create policy audit_events_select_founder on public.audit_events
  for select to authenticated
  using (public.current_app_role() = 'founder');

revoke insert, update, delete, truncate on public.audit_events from anon, authenticated;
