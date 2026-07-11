import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const migrationRoot = path.join(repoRoot, "db", "migrations");
const migrationSchemas = (process.env.DRAVIK_MIGRATION_SCHEMAS ?? "core")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const isCheckOnly = process.argv.includes("--check");

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run database migrations.");
  }

  return databaseUrl;
}

async function createClient() {
  const client = new Client({
    application_name: "dravik-migration-runner",
    connectionString: getDatabaseUrl(),
  });

  await client.connect();
  return client;
}

async function ensureMigrationTable(client) {
  await client.query("create schema if not exists core");
  await client.query(`
    create table if not exists core.schema_migration (
      id text primary key,
      schema_name text not null,
      path text not null,
      checksum_sha256 text not null,
      applied_at timestamptz not null default now(),
      execution_ms integer not null
    )
  `);
}

async function readMigrationFiles() {
  const migrations = [];

  for (const schemaName of migrationSchemas) {
    const schemaDir = path.join(migrationRoot, schemaName);
    const entries = await fs.readdir(schemaDir);

    for (const entry of entries.sort()) {
      if (!entry.endsWith(".sql")) {
        continue;
      }

      const absolutePath = path.join(schemaDir, entry);
      const relativePath = path.relative(repoRoot, absolutePath);
      const sql = await fs.readFile(absolutePath, "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");

      migrations.push({
        id: `${schemaName}/${entry.replace(/\.sql$/, "")}`,
        schemaName,
        relativePath,
        sql,
        checksum,
      });
    }
  }

  return migrations;
}

async function applyMigration(client, migration) {
  const existing = await client.query(
    `
      select checksum_sha256
      from core.schema_migration
      where id = $1
    `,
    [migration.id]
  );

  if (existing.rowCount > 0) {
    const appliedChecksum = existing.rows[0].checksum_sha256;

    if (appliedChecksum !== migration.checksum) {
      throw new Error(
        `Migration ${migration.id} was already applied with checksum ${appliedChecksum}, but the file now hashes to ${migration.checksum}.`
      );
    }

    console.log(`skip ${migration.id}`);
    return;
  }

  const startedAt = Date.now();

  await client.query("begin");

  try {
    await client.query(migration.sql);
    await client.query(
      `
        insert into core.schema_migration (
          id,
          schema_name,
          path,
          checksum_sha256,
          execution_ms
        )
        values ($1, $2, $3, $4, $5)
      `,
      [
        migration.id,
        migration.schemaName,
        migration.relativePath,
        migration.checksum,
        Date.now() - startedAt,
      ]
    );
    await client.query("commit");
    console.log(`apply ${migration.id}`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

async function runSmokeCheck(client) {
  const result = await client.query(`
    select
      to_regclass('core.tenant') is not null as has_tenant_table,
      to_regclass('core.app_user') is not null as has_app_user_table,
      to_regclass('core.membership') is not null as has_membership_table,
      to_regclass('core.invitation') is not null as has_invitation_table,
      (
        select count(*)::int
        from core.role
      ) as role_count,
      (
        select count(*)::int
        from core.role_permission
      ) as role_permission_count,
      (
        select count(*)::int
        from core.schema_migration
      ) as migration_count
  `);

  const row = result.rows[0];
  const failures = [];

  for (const tableCheck of [
    "has_tenant_table",
    "has_app_user_table",
    "has_membership_table",
    "has_invitation_table",
  ]) {
    if (!row[tableCheck]) {
      failures.push(`${tableCheck} is false`);
    }
  }

  if (row.role_count !== 8) {
    failures.push(`expected 8 core roles, found ${row.role_count}`);
  }

  if (row.role_permission_count !== 42) {
    failures.push(
      `expected 42 core role permissions, found ${row.role_permission_count}`
    );
  }

  if (row.migration_count < 1) {
    failures.push("expected at least 1 tracked migration");
  }

  if (failures.length > 0) {
    throw new Error(`Database smoke check failed: ${failures.join("; ")}`);
  }

  console.log(
    `ok core database foundation: ${row.role_count} roles, ${row.role_permission_count} role permissions, ${row.migration_count} migrations`
  );
}

async function main() {
  const client = await createClient();

  try {
    await ensureMigrationTable(client);

    if (!isCheckOnly) {
      const migrations = await readMigrationFiles();

      for (const migration of migrations) {
        await applyMigration(client, migration);
      }
    }

    await runSmokeCheck(client);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
