import { withTenant, type CoreTenantIdentity } from "./tenant-context";

interface TenantBrandingRow {
  branding: Record<string, unknown> | null;
}

export async function readPersistedTenantBranding(tenant: CoreTenantIdentity) {
  return withTenant(tenant, async (client, tenantId) => {
    const result = await client.query<TenantBrandingRow>(
      `
        select branding
        from core.tenant
        where id = $1
      `,
      [tenantId]
    );

    return result.rows[0]?.branding ?? {};
  });
}

export async function updatePersistedTenantBranding(
  tenant: CoreTenantIdentity,
  branding: Record<string, unknown>
) {
  return withTenant(tenant, async (client, tenantId) => {
    const result = await client.query<TenantBrandingRow>(
      `
        update core.tenant
        set branding = $2::jsonb
        where id = $1
        returning branding
      `,
      [tenantId, JSON.stringify(branding)]
    );

    return result.rows[0]?.branding ?? {};
  });
}
