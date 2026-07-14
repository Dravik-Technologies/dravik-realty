create table if not exists core.operational_record (
  id uuid primary key,
  tenant_id uuid not null references core.tenant(id) on delete cascade,
  record_type text not null,
  title text not null default '',
  payload jsonb not null,
  record_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint operational_record_type_check check (record_type in ('leads', 'seller-leads', 'partners', 'transactions')),
  constraint operational_record_status_check check (record_status in ('active', 'archived')),
  constraint operational_record_title_not_blank check (length(trim(title)) > 0)
);

create index if not exists operational_record_tenant_type_updated_idx
  on core.operational_record (tenant_id, record_type, updated_at desc)
  where record_status = 'active';

drop trigger if exists touch_operational_record_updated_at on core.operational_record;
create trigger touch_operational_record_updated_at
  before update on core.operational_record
  for each row execute function core.touch_updated_at();

alter table core.operational_record enable row level security;

drop policy if exists operational_record_tenant_is_current on core.operational_record;
create policy operational_record_tenant_is_current on core.operational_record
  using (tenant_id = core.current_tenant_id())
  with check (tenant_id = core.current_tenant_id());
