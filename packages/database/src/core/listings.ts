import { createHash, randomUUID } from "node:crypto";
import { Client } from "pg";
import type {
  ListingUpdateInput,
  ListingVisibility,
  ManagedListing,
} from "@dravik/contracts/realty";

export interface CoreTenantIdentity {
  id: string;
  slug: string;
  name: string;
  plan: "starter" | "growth" | "enterprise";
  status: "active" | "trialing" | "suspended";
}

interface ListingRow {
  id: string;
  property: ManagedListing;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TENANT_NAMESPACE = "e092aefe-066e-4ec4-bb41-646857a4e92d";

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function tenantDatabaseId(tenant: Pick<CoreTenantIdentity, "id" | "slug">) {
  if (UUID_PATTERN.test(tenant.id)) {
    return tenant.id;
  }

  return uuidV5(`tenant:${tenant.slug}`, TENANT_NAMESPACE);
}

function uuidV5(name: string, namespace: string) {
  const namespaceBytes = Buffer.from(namespace.replace(/-/g, ""), "hex");
  const hash = createHash("sha1")
    .update(namespaceBytes)
    .update(name)
    .digest();

  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;

  const hex = hash.subarray(0, 16).toString("hex");
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-");
}

async function createClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for persisted listings.");
  }

  const client = new Client({
    application_name: "dravik-command-center",
    connectionString: databaseUrl,
  });

  await client.connect();
  return client;
}

async function ensureTenant(client: Client, tenant: CoreTenantIdentity) {
  await client.query(
    `
      insert into core.tenant (id, slug, name, plan, status)
      values ($1, $2, $3, $4, $5)
      on conflict (id) do update
      set
        slug = excluded.slug,
        name = excluded.name,
        plan = excluded.plan,
        status = excluded.status
    `,
    [
      tenantDatabaseId(tenant),
      tenant.slug,
      tenant.name,
      tenant.plan,
      tenant.status,
    ]
  );
}

async function withTenant<T>(
  tenant: CoreTenantIdentity,
  callback: (client: Client, tenantId: string) => Promise<T>
) {
  const client = await createClient();
  const tenantId = tenantDatabaseId(tenant);

  try {
    await client.query("begin");
    await client.query("select set_config('app.tenant_id', $1, true)", [tenantId]);
    await ensureTenant(client, tenant);
    const result = await callback(client, tenantId);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

function withTimestamp(listing: ManagedListing, updatedAt: string): ManagedListing {
  return {
    ...listing,
    updatedAt,
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

    return result.rows.map((row) => row.property);
  });
}

export async function createPersistedListing(
  tenant: CoreTenantIdentity,
  listing: ManagedListing
) {
  return withTenant(tenant, async (client, tenantId) => {
    const persisted = withTimestamp(listing, "just now");

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
