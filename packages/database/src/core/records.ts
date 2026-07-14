import { randomUUID } from "node:crypto";
import { withTenant, type CoreTenantIdentity } from "./tenant-context";

export type OperationalRecordType = "leads" | "seller-leads" | "partners" | "transactions";

interface OperationalRecordRow<T> {
  id: string;
  payload: T;
}

export function createOperationalRecordId() {
  return randomUUID();
}

export async function listPersistedOperationalRecords<T>(
  tenant: CoreTenantIdentity,
  recordType: OperationalRecordType
) {
  return withTenant(tenant, async (client, tenantId) => {
    const result = await client.query<OperationalRecordRow<T>>(
      `
        select id, payload
        from core.operational_record
        where tenant_id = $1
          and record_type = $2
          and record_status = 'active'
        order by updated_at desc, created_at desc
      `,
      [tenantId, recordType]
    );

    return result.rows.map((row) => ({ ...row.payload, id: row.id }));
  });
}

export async function createPersistedOperationalRecord<T extends { id?: string }>(
  tenant: CoreTenantIdentity,
  recordType: OperationalRecordType,
  record: T,
  title: string
) {
  return withTenant(tenant, async (client, tenantId) => {
    const id = createOperationalRecordId();
    const payload = { ...record, id };

    await client.query(
      `
        insert into core.operational_record (id, tenant_id, record_type, title, payload)
        values ($1, $2, $3, $4, $5::jsonb)
      `,
      [id, tenantId, recordType, normalizeTitle(title), JSON.stringify(payload)]
    );

    return payload;
  });
}

export async function updatePersistedOperationalRecord<T extends { id?: string }>(
  tenant: CoreTenantIdentity,
  recordType: OperationalRecordType,
  recordId: string,
  patch: Partial<T>,
  title: string
) {
  return withTenant(tenant, async (client, tenantId) => {
    const existing = await client.query<OperationalRecordRow<T>>(
      `
        select id, payload
        from core.operational_record
        where id = $1
          and tenant_id = $2
          and record_type = $3
          and record_status = 'active'
      `,
      [recordId, tenantId, recordType]
    );

    const current = existing.rows[0]?.payload;

    if (!current) {
      return null;
    }

    const payload = { ...current, ...patch, id: recordId };

    await client.query(
      `
        update core.operational_record
        set title = $4,
            payload = $5::jsonb
        where id = $1
          and tenant_id = $2
          and record_type = $3
          and record_status = 'active'
      `,
      [recordId, tenantId, recordType, normalizeTitle(title), JSON.stringify(payload)]
    );

    return payload;
  });
}

export async function archivePersistedOperationalRecord(
  tenant: CoreTenantIdentity,
  recordType: OperationalRecordType,
  recordId: string
) {
  return withTenant(tenant, async (client, tenantId) => {
    const result = await client.query(
      `
        update core.operational_record
        set record_status = 'archived'
        where id = $1
          and tenant_id = $2
          and record_type = $3
          and record_status = 'active'
      `,
      [recordId, tenantId, recordType]
    );

    return (result.rowCount ?? 0) > 0;
  });
}

function normalizeTitle(title: string) {
  return title.trim() || "Untitled record";
}
