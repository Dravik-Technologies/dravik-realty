import { createHash } from "node:crypto";
import { Client } from "pg";
import type { CoreTenantPlan, CoreTenantStatus } from "./types";

export interface CoreTenantIdentity {
  id: string;
  slug: string;
  name: string;
  plan: CoreTenantPlan;
  status: CoreTenantStatus;
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
    throw new Error("DATABASE_URL is required for persisted tenant data.");
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

export async function withTenant<T>(
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
