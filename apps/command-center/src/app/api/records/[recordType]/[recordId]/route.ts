import type { CommandCenterSession } from "@dravik/contracts/identity";
import type { Agent } from "@dravik/contracts/referrals";
import type { Lead, SellerLead } from "@dravik/contracts/crm";
import type { Transaction } from "@dravik/contracts/realty";
import {
  archivePersistedOperationalRecord,
  isDatabaseConfigured,
  updatePersistedOperationalRecord,
  type CoreTenantIdentity,
  type OperationalRecordType,
} from "@dravik/database/core";
import { SAMPLE_LEADS, SELLER_LEADS } from "@dravik/crm";
import { AGENTS } from "@dravik/referrals";
import { SAMPLE_TRANSACTIONS } from "@dravik/realty";
import { getCommandSession } from "@/auth/server";

export const runtime = "nodejs";

type OperationalRecord = Lead | SellerLead | Agent | Transaction;

const RECORD_CONFIG: Record<OperationalRecordType, { permission: string; title: (record: Partial<OperationalRecord>) => string }> = {
  leads: {
    permission: "crm.manage",
    title: (record) => "name" in record && record.name ? record.name : "Lead",
  },
  "seller-leads": {
    permission: "crm.manage",
    title: (record) => "address" in record && record.address ? record.address : "Seller lead",
  },
  partners: {
    permission: "referrals.manage",
    title: (record) => "name" in record && record.name ? record.name : "Partner",
  },
  transactions: {
    permission: "realty.manage",
    title: (record) => "address" in record && record.address ? record.address : "Transaction",
  },
};

const localStore = globalThis as typeof globalThis & {
  __dravikOperationalRecords?: Partial<Record<OperationalRecordType, Record<string, OperationalRecord[]>>>;
};

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

function isRecordType(value: string): value is OperationalRecordType {
  return value === "leads" || value === "seller-leads" || value === "partners" || value === "transactions";
}

async function requireSession(recordType: OperationalRecordType) {
  const session = await getCommandSession();

  if (!session) {
    return null;
  }

  if (!session.permissions.includes(RECORD_CONFIG[recordType].permission)) {
    return null;
  }

  return session;
}

function tenantFromSession(session: CommandCenterSession): CoreTenantIdentity {
  return {
    id: session.tenant.id,
    slug: session.tenant.slug,
    name: session.tenant.name,
    plan: session.tenant.plan,
    status: session.tenant.status,
  };
}

function seedRecords(recordType: OperationalRecordType): OperationalRecord[] {
  if (recordType === "leads") return SAMPLE_LEADS;
  if (recordType === "seller-leads") return SELLER_LEADS;
  if (recordType === "partners") return AGENTS;
  return SAMPLE_TRANSACTIONS;
}

function cloneRecords(records: OperationalRecord[]): OperationalRecord[] {
  return structuredClone(records);
}

function shouldUseMutableLocalStore(): boolean {
  return process.env.NODE_ENV !== "production";
}

function localRecords(session: CommandCenterSession, recordType: OperationalRecordType) {
  localStore.__dravikOperationalRecords ??= {};
  localStore.__dravikOperationalRecords[recordType] ??= {};
  localStore.__dravikOperationalRecords[recordType]![session.tenant.id] ??= cloneRecords(seedRecords(recordType));
  return localStore.__dravikOperationalRecords[recordType]![session.tenant.id]!;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ recordType: string; recordId: string }> }
) {
  const { recordType: recordTypeParam, recordId } = await context.params;

  if (!isRecordType(recordTypeParam)) {
    return json({ error: "Unknown record type" }, { status: 404 });
  }

  const session = await requireSession(recordTypeParam);

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const patch = (await request.json()) as Partial<OperationalRecord>;
  const title = RECORD_CONFIG[recordTypeParam].title(patch);

  if (!isDatabaseConfigured()) {
    if (!shouldUseMutableLocalStore()) {
      const existing = cloneRecords(seedRecords(recordTypeParam)).find((record) => record.id === recordId);
      return json({ record: { ...existing, ...patch, id: recordId }, persistence: "memory" });
    }

    const records = localRecords(session, recordTypeParam);
    const index = records.findIndex((record) => record.id === recordId);

    if (index === -1) {
      return json({ error: "Not found" }, { status: 404 });
    }

    records[index] = { ...records[index], ...patch, id: recordId } as OperationalRecord;
    return json({ record: records[index], persistence: "memory" });
  }

  const record = await updatePersistedOperationalRecord(
    tenantFromSession(session),
    recordTypeParam,
    recordId,
    patch,
    title
  );

  if (!record) {
    return json({ error: "Not found" }, { status: 404 });
  }

  return json({ record, persistence: "database" });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ recordType: string; recordId: string }> }
) {
  const { recordType: recordTypeParam, recordId } = await context.params;

  if (!isRecordType(recordTypeParam)) {
    return json({ error: "Unknown record type" }, { status: 404 });
  }

  const session = await requireSession(recordTypeParam);

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    if (!shouldUseMutableLocalStore()) {
      return json({ ok: true, persistence: "memory" });
    }

    const records = localRecords(session, recordTypeParam);
    const index = records.findIndex((record) => record.id === recordId);

    if (index === -1) {
      return json({ error: "Not found" }, { status: 404 });
    }

    records.splice(index, 1);
    return json({ ok: true, persistence: "memory" });
  }

  const archived = await archivePersistedOperationalRecord(
    tenantFromSession(session),
    recordTypeParam,
    recordId
  );

  if (!archived) {
    return json({ error: "Not found" }, { status: 404 });
  }

  return json({ ok: true, persistence: "database" });
}
