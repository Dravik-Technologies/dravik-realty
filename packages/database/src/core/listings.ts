import { randomUUID } from "node:crypto";
import type {
  ListingUpdateInput,
  ListingVisibility,
  ManagedListing,
} from "@dravik/contracts/realty";
import { withTenant, type CoreTenantIdentity } from "./tenant-context";

interface ListingRow {
  id: string;
  tenant_id?: string;
  property: ManagedListing;
}

function withTimestamp(listing: ManagedListing, updatedAt: string): ManagedListing {
  return {
    ...listing,
    updatedAt,
  };
}

function withOwnerMetadata(
  listing: ManagedListing,
  tenantId: string,
  tenantName: string,
  isNetworkListing: boolean
): ManagedListing {
  return {
    ...listing,
    ownerTenantId: listing.ownerTenantId ?? tenantId,
    ownerTenantName: listing.ownerTenantName ?? tenantName,
    isNetworkListing,
  };
}

export async function listPersistedListings(tenant: CoreTenantIdentity) {
  return withTenant(tenant, async (client, tenantId) => {
    const result = await client.query<ListingRow>(
      `
        select id, property
        from core.listing
        where tenant_id = $1
          and record_status = 'active'
        order by updated_at desc, created_at desc
      `,
      [tenantId]
    );

    return result.rows.map((row) =>
      withOwnerMetadata(row.property, tenantId, tenant.name, false)
    );
  });
}

export async function listPersistedListingsWithNetwork(tenant: CoreTenantIdentity) {
  return withTenant(tenant, async (client, tenantId) => {
    const result = await client.query<ListingRow>(
      `
        select id, tenant_id::text as tenant_id, property
        from core.listing
        where record_status = 'active'
          and (
            tenant_id = $1
            or network_visibility = 'Partner Network'
          )
        order by
          case when tenant_id = $1 then 0 else 1 end,
          updated_at desc,
          created_at desc
      `,
      [tenantId]
    );

    return result.rows.map((row) => {
      const ownerTenantId = row.tenant_id ?? tenantId;
      return withOwnerMetadata(
        row.property,
        ownerTenantId,
        ownerTenantId === tenantId ? tenant.name : row.property.ownerTenantName ?? "Partner Brokerage",
        ownerTenantId !== tenantId
      );
    });
  });
}

export async function createPersistedListing(
  tenant: CoreTenantIdentity,
  listing: ManagedListing
) {
  return withTenant(tenant, async (client, tenantId) => {
    const persisted = withOwnerMetadata(withTimestamp(listing, "just now"), tenantId, tenant.name, false);

    await client.query(
      `
        insert into core.listing (
          id,
          tenant_id,
          address,
          city,
          state,
          zip,
          price,
          status,
          network_visibility,
          seller_name,
          agent_name,
          property
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
      `,
      [
        persisted.id,
        tenantId,
        persisted.address,
        persisted.city,
        persisted.state,
        persisted.zip,
        persisted.price,
        persisted.status,
        persisted.networkVisibility,
        persisted.sellerName,
        persisted.agentName,
        JSON.stringify(persisted),
      ]
    );

    return persisted;
  });
}

export async function updatePersistedListing(
  tenant: CoreTenantIdentity,
  listingId: string,
  patch: ListingUpdateInput
) {
  return withTenant(tenant, async (client, tenantId) => {
    const existing = await client.query<ListingRow>(
      `
        select id, property
        from core.listing
        where id = $1
          and tenant_id = $2
          and record_status = 'active'
      `,
      [listingId, tenantId]
    );

    const current = existing.rows[0]?.property;

    if (!current) {
      return null;
    }

    const updated = normalizeUpdatedListing(current, patch);

    await client.query(
      `
        update core.listing
        set
          address = $3,
          city = $4,
          state = $5,
          zip = $6,
          price = $7,
          status = $8,
          network_visibility = $9,
          seller_name = $10,
          agent_name = $11,
          property = $12::jsonb
        where id = $1
          and tenant_id = $2
          and record_status = 'active'
      `,
      [
        listingId,
        tenantId,
        updated.address,
        updated.city,
        updated.state,
        updated.zip,
        updated.price,
        updated.status,
        updated.networkVisibility,
        updated.sellerName,
        updated.agentName,
        JSON.stringify(updated),
      ]
    );

    return updated;
  });
}

export async function archivePersistedListing(
  tenant: CoreTenantIdentity,
  listingId: string
) {
  return withTenant(tenant, async (client, tenantId) => {
    const result = await client.query(
      `
        update core.listing
        set record_status = 'archived'
        where id = $1
          and tenant_id = $2
          and record_status = 'active'
      `,
      [listingId, tenantId]
    );

    return (result.rowCount ?? 0) > 0;
  });
}

export function createListingId() {
  return randomUUID();
}

function normalizeUpdatedListing(
  current: ManagedListing,
  patch: ListingUpdateInput
): ManagedListing {
  const price = parsePositiveInt(patch.price, current.price);
  const sqft = parsePositiveInt(patch.sqft, current.sqft);
  const networkVisibility = patch.networkVisibility ?? current.networkVisibility;

  return {
    ...current,
    address: patch.address?.trim() || current.address,
    city: patch.city?.trim() || current.city,
    state: patch.state?.trim().toUpperCase() || current.state,
    price,
    pricePerSqft: Math.round(price / Math.max(1, sqft)),
    beds: parsePositiveNumber(patch.beds, current.beds),
    baths: parsePositiveNumber(patch.baths, current.baths),
    sqft,
    status: patch.status ?? current.status,
    networkVisibility: normalizeVisibility(networkVisibility),
    sellerName: patch.sellerName?.trim() || current.sellerName,
    agentName: patch.agentName?.trim() || current.agentName,
    description: patch.description?.trim() || current.description,
    neighborhood: patch.city?.trim() || current.neighborhood,
    updatedAt: "just now",
  };
}

function normalizeVisibility(value: ListingVisibility): ListingVisibility {
  return value === "Partner Network" ? "Partner Network" : "Private";
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function parsePositiveNumber(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
