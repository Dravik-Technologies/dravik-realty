export const CORE_SCHEMA = "core";

export const CORE_TABLES = [
  "tenant",
  "office",
  "team",
  "app_user",
  "membership",
  "role",
  "role_permission",
  "role_assignment",
  "invitation",
  "listing",
  "operational_record",
  "audit_event",
  "outbox",
] as const;

export type CoreTable = (typeof CORE_TABLES)[number];

export const TENANT_SCOPED_CORE_TABLES = [
  "tenant",
  "office",
  "team",
  "membership",
  "role_assignment",
  "invitation",
  "listing",
  "operational_record",
  "audit_event",
  "outbox",
] as const satisfies readonly CoreTable[];

export type TenantScopedCoreTable = (typeof TENANT_SCOPED_CORE_TABLES)[number];

export const CORE_MIGRATIONS = [
  {
    id: "0001_identity_tenant_foundation",
    schema: CORE_SCHEMA,
    path: "db/migrations/core/0001_identity_tenant_foundation.sql",
  },
  {
    id: "0002_listing_foundation",
    schema: CORE_SCHEMA,
    path: "db/migrations/core/0002_listing_foundation.sql",
  },
  {
    id: "0003_listing_network_exchange",
    schema: CORE_SCHEMA,
    path: "db/migrations/core/0003_listing_network_exchange.sql",
  },
  {
    id: "0004_operational_records",
    schema: CORE_SCHEMA,
    path: "db/migrations/core/0004_operational_records.sql",
  },
] as const;

export type CoreMigrationId = (typeof CORE_MIGRATIONS)[number]["id"];
