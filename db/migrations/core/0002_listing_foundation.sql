create table if not exists core.listing (
  id uuid primary key,
  tenant_id uuid not null references core.tenant(id) on delete cascade,
  address text not null,
  city text not null,
  state text not null,
  zip text not null default '',
  price integer not null,
  status text not null,
  network_visibility text not null default 'Private',
  seller_name text not null default '',
  agent_name text not null default '',
  property jsonb not null,
  record_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listing_address_not_blank check (length(trim(address)) > 0),
  constraint listing_city_not_blank check (length(trim(city)) > 0),
  constraint listing_state_not_blank check (length(trim(state)) > 0),
  constraint listing_price_nonnegative check (price >= 0),
  constraint listing_status_check check (status in ('Active', 'Pending', 'Coming Soon', 'Price Reduced')),
  constraint listing_visibility_check check (network_visibility in ('Private', 'Partner Network')),
  constraint listing_record_status_check check (record_status in ('active', 'archived'))
);

create index if not exists listing_tenant_updated_idx
  on core.listing (tenant_id, updated_at desc)
  where record_status = 'active';

create index if not exists listing_tenant_status_idx
  on core.listing (tenant_id, status)
  where record_status = 'active';

drop trigger if exists touch_listing_updated_at on core.listing;
create trigger touch_listing_updated_at
  before update on core.listing
  for each row execute function core.touch_updated_at();

alter table core.listing enable row level security;

drop policy if exists listing_tenant_is_current on core.listing;
create policy listing_tenant_is_current on core.listing
  using (tenant_id = core.current_tenant_id())
  with check (tenant_id = core.current_tenant_id());
