create index if not exists listing_network_exchange_idx
  on core.listing (updated_at desc, created_at desc)
  where record_status = 'active'
    and network_visibility = 'Partner Network';

drop policy if exists listing_partner_network_select on core.listing;
create policy listing_partner_network_select on core.listing
  for select
  using (
    record_status = 'active'
    and network_visibility = 'Partner Network'
  );
