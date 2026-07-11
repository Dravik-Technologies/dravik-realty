create schema if not exists core;

create or replace function core.current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.tenant_id', true), '')::uuid;
$$;

create or replace function core.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists core.tenant (
  id uuid primary key,
  slug text not null unique,
  name text not null,
  plan text not null default 'starter',
  status text not null default 'trialing',
  branding jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tenant_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$'),
  constraint tenant_plan_check check (plan in ('starter', 'growth', 'enterprise')),
  constraint tenant_status_check check (status in ('active', 'trialing', 'suspended'))
);

create table if not exists core.office (
  id uuid primary key,
  tenant_id uuid not null references core.tenant(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint office_status_check check (status in ('active', 'archived')),
  constraint office_unique_name unique (tenant_id, name)
);

create table if not exists core.team (
  id uuid primary key,
  tenant_id uuid not null references core.tenant(id) on delete cascade,
  office_id uuid references core.office(id) on delete set null,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_status_check check (status in ('active', 'archived')),
  constraint team_unique_name unique (tenant_id, name)
);

create table if not exists core.app_user (
  id uuid primary key,
  entra_oid text unique,
  email text not null,
  display_name text not null,
  avatar_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_user_email_not_blank check (length(trim(email)) > 0),
  constraint app_user_status_check check (status in ('active', 'disabled'))
);

create unique index if not exists app_user_email_lower_key
  on core.app_user (lower(email));

create table if not exists core.membership (
  id uuid primary key,
  tenant_id uuid not null references core.tenant(id) on delete cascade,
  user_id uuid not null references core.app_user(id) on delete cascade,
  status text not null default 'invited',
  default_landing_area text not null default 'command-center',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_status_check check (status in ('invited', 'active', 'suspended', 'removed')),
  constraint membership_landing_area_check check (default_landing_area in ('command-center', 'client-portal')),
  constraint membership_unique_user unique (tenant_id, user_id)
);

create table if not exists core.role (
  id uuid primary key,
  key text not null unique,
  name text not null,
  area text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  constraint role_area_check check (area in ('platform', 'command-center', 'client-portal'))
);

create table if not exists core.role_permission (
  role_id uuid not null references core.role(id) on delete cascade,
  permission text not null,
  created_at timestamptz not null default now(),
  primary key (role_id, permission)
);

create table if not exists core.role_assignment (
  id uuid primary key,
  tenant_id uuid not null references core.tenant(id) on delete cascade,
  membership_id uuid not null references core.membership(id) on delete cascade,
  role_id uuid not null references core.role(id) on delete restrict,
  scope_team_id uuid references core.team(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists role_assignment_unique_scope
  on core.role_assignment (
    membership_id,
    role_id,
    coalesce(scope_team_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create table if not exists core.invitation (
  id uuid primary key,
  tenant_id uuid not null references core.tenant(id) on delete cascade,
  email text not null,
  area text not null,
  role_id uuid not null references core.role(id) on delete restrict,
  token_hash text not null,
  invited_by_user_id uuid references core.app_user(id) on delete set null,
  status text not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitation_email_not_blank check (length(trim(email)) > 0),
  constraint invitation_area_check check (area in ('command-center', 'client-portal')),
  constraint invitation_status_check check (status in ('pending', 'accepted', 'revoked', 'expired'))
);

create unique index if not exists invitation_pending_email_key
  on core.invitation (tenant_id, lower(email), area)
  where status = 'pending';

create table if not exists core.audit_event (
  id uuid primary key,
  tenant_id uuid references core.tenant(id) on delete set null,
  actor_user_id uuid references core.app_user(id) on delete set null,
  actor_membership_id uuid references core.membership(id) on delete set null,
  event_type text not null,
  target_type text not null,
  target_id uuid,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_event_tenant_created_idx
  on core.audit_event (tenant_id, created_at desc);

create table if not exists core.outbox (
  id uuid primary key,
  tenant_id uuid references core.tenant(id) on delete set null,
  aggregate_type text not null,
  aggregate_id uuid,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending',
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint outbox_status_check check (status in ('pending', 'processing', 'sent', 'failed'))
);

create index if not exists outbox_pending_idx
  on core.outbox (available_at, created_at)
  where status = 'pending';

drop trigger if exists touch_tenant_updated_at on core.tenant;
create trigger touch_tenant_updated_at
  before update on core.tenant
  for each row execute function core.touch_updated_at();

drop trigger if exists touch_office_updated_at on core.office;
create trigger touch_office_updated_at
  before update on core.office
  for each row execute function core.touch_updated_at();

drop trigger if exists touch_team_updated_at on core.team;
create trigger touch_team_updated_at
  before update on core.team
  for each row execute function core.touch_updated_at();

drop trigger if exists touch_app_user_updated_at on core.app_user;
create trigger touch_app_user_updated_at
  before update on core.app_user
  for each row execute function core.touch_updated_at();

drop trigger if exists touch_membership_updated_at on core.membership;
create trigger touch_membership_updated_at
  before update on core.membership
  for each row execute function core.touch_updated_at();

drop trigger if exists touch_invitation_updated_at on core.invitation;
create trigger touch_invitation_updated_at
  before update on core.invitation
  for each row execute function core.touch_updated_at();

alter table core.tenant enable row level security;
alter table core.office enable row level security;
alter table core.team enable row level security;
alter table core.membership enable row level security;
alter table core.role_assignment enable row level security;
alter table core.invitation enable row level security;
alter table core.audit_event enable row level security;
alter table core.outbox enable row level security;

drop policy if exists tenant_is_current on core.tenant;
create policy tenant_is_current on core.tenant
  using (id = core.current_tenant_id())
  with check (id = core.current_tenant_id());

drop policy if exists office_tenant_is_current on core.office;
create policy office_tenant_is_current on core.office
  using (tenant_id = core.current_tenant_id())
  with check (tenant_id = core.current_tenant_id());

drop policy if exists team_tenant_is_current on core.team;
create policy team_tenant_is_current on core.team
  using (tenant_id = core.current_tenant_id())
  with check (tenant_id = core.current_tenant_id());

drop policy if exists membership_tenant_is_current on core.membership;
create policy membership_tenant_is_current on core.membership
  using (tenant_id = core.current_tenant_id())
  with check (tenant_id = core.current_tenant_id());

drop policy if exists role_assignment_tenant_is_current on core.role_assignment;
create policy role_assignment_tenant_is_current on core.role_assignment
  using (tenant_id = core.current_tenant_id())
  with check (tenant_id = core.current_tenant_id());

drop policy if exists invitation_tenant_is_current on core.invitation;
create policy invitation_tenant_is_current on core.invitation
  using (tenant_id = core.current_tenant_id())
  with check (tenant_id = core.current_tenant_id());

drop policy if exists audit_event_tenant_is_current on core.audit_event;
create policy audit_event_tenant_is_current on core.audit_event
  using (tenant_id = core.current_tenant_id())
  with check (tenant_id = core.current_tenant_id());

drop policy if exists outbox_tenant_is_current on core.outbox;
create policy outbox_tenant_is_current on core.outbox
  using (tenant_id = core.current_tenant_id())
  with check (tenant_id = core.current_tenant_id());

insert into core.role (id, key, name, area, description)
values
  ('00000000-0000-4000-8000-000000000001', 'platform_admin', 'Platform Admin', 'platform', 'Cross-tenant Dravik operator role.'),
  ('00000000-0000-4000-8000-000000000002', 'broker_owner', 'Broker Owner', 'command-center', 'Tenant owner with billing and administration access.'),
  ('00000000-0000-4000-8000-000000000003', 'broker_admin', 'Broker Admin', 'command-center', 'Tenant administrator without subscription ownership.'),
  ('00000000-0000-4000-8000-000000000004', 'team_lead', 'Team Lead', 'command-center', 'Team-scoped lead and production management.'),
  ('00000000-0000-4000-8000-000000000005', 'agent', 'Agent', 'command-center', 'Agent workspace access.'),
  ('00000000-0000-4000-8000-000000000006', 'lending_officer', 'Lending Officer', 'command-center', 'Mortgage pipeline workspace access.'),
  ('00000000-0000-4000-8000-000000000007', 'marketing_manager', 'Marketing Manager', 'command-center', 'Campaign and property marketing access.'),
  ('00000000-0000-4000-8000-000000000008', 'client', 'Client', 'client-portal', 'Client portal access only.')
on conflict (key) do update
set
  name = excluded.name,
  area = excluded.area,
  description = excluded.description;

insert into core.role_permission (role_id, permission)
select role.id, permissions.permission
from core.role
join (
  values
    ('platform_admin', 'platform.manage'),
    ('platform_admin', 'tenant.manage'),
    ('platform_admin', 'audit.read'),
    ('platform_admin', 'billing.manage'),
    ('platform_admin', 'broker.manage'),
    ('platform_admin', 'crm.manage'),
    ('platform_admin', 'lending.manage'),
    ('platform_admin', 'marketing.manage'),
    ('platform_admin', 'portal.manage'),
    ('platform_admin', 'realty.manage'),
    ('platform_admin', 'referrals.manage'),
    ('broker_owner', 'tenant.manage'),
    ('broker_owner', 'billing.manage'),
    ('broker_owner', 'broker.manage'),
    ('broker_owner', 'crm.manage'),
    ('broker_owner', 'lending.manage'),
    ('broker_owner', 'marketing.manage'),
    ('broker_owner', 'portal.manage'),
    ('broker_owner', 'realty.manage'),
    ('broker_owner', 'referrals.manage'),
    ('broker_admin', 'broker.manage'),
    ('broker_admin', 'crm.manage'),
    ('broker_admin', 'lending.manage'),
    ('broker_admin', 'marketing.manage'),
    ('broker_admin', 'portal.manage'),
    ('broker_admin', 'realty.manage'),
    ('broker_admin', 'referrals.manage'),
    ('team_lead', 'crm.manage'),
    ('team_lead', 'portal.manage'),
    ('team_lead', 'realty.manage'),
    ('team_lead', 'referrals.manage'),
    ('agent', 'crm.manage'),
    ('agent', 'portal.manage'),
    ('agent', 'realty.manage'),
    ('agent', 'referrals.manage'),
    ('lending_officer', 'crm.read'),
    ('lending_officer', 'lending.manage'),
    ('lending_officer', 'portal.read'),
    ('marketing_manager', 'crm.read'),
    ('marketing_manager', 'marketing.manage'),
    ('marketing_manager', 'realty.read'),
    ('client', 'portal.view')
) as permissions(role_key, permission) on permissions.role_key = role.key
on conflict (role_id, permission) do nothing;
