import type { CommandCenterSession } from "@dravik/contracts/identity";
import type { Agent } from "@dravik/contracts/referrals";
import type { Lead, SellerLead } from "@dravik/contracts/crm";
import type { Transaction } from "@dravik/contracts/realty";
import {
  createOperationalRecordId,
  createPersistedOperationalRecord,
  isDatabaseConfigured,
  listPersistedOperationalRecords,
  type CoreTenantIdentity,
  type OperationalRecordType,
} from "@dravik/database/core";
import { SAMPLE_LEADS, SELLER_LEADS } from "@dravik/crm";
import { AGENTS } from "@dravik/referrals";
import { SAMPLE_TRANSACTIONS } from "@dravik/realty";
import { getCommandSession } from "@/auth/server";

export const runtime = "nodejs";

type OperationalRecord = Lead | SellerLead | Agent | Transaction;

const RECORD_CONFIG: Record<OperationalRecordType, { permission: string; title: (record: OperationalRecord) => string }> = {
  leads: {
    permission: "crm.manage",
    title: (record) => "name" in record ? record.name : "Lead",
  },
  "seller-leads": {
    permission: "crm.manage",
    title: (record) => "address" in record ? record.address : "Seller lead",
  },
  partners: {
    permission: "referrals.manage",
    title: (record) => "name" in record ? record.name : "Partner",
  },
  transactions: {
    permission: "realty.manage",
    title: (record) => "address" in record ? record.address : "Transaction",
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ recordType: string }> }
) {
  const { recordType: recordTypeParam } = await context.params;

  if (!isRecordType(recordTypeParam)) {
    return json({ error: "Unknown record type" }, { status: 404 });
  }

  const session = await requireSession(recordTypeParam);

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    const records = shouldUseMutableLocalStore()
      ? localRecords(session, recordTypeParam)
      : cloneRecords(seedRecords(recordTypeParam));
    return json({ records, persistence: "memory" });
  }

  const records = await listPersistedOperationalRecords(
    tenantFromSession(session),
    recordTypeParam
  );
  return json({ records, persistence: "database" });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ recordType: string }> }
) {
  const { recordType: recordTypeParam } = await context.params;

  if (!isRecordType(recordTypeParam)) {
    return json({ error: "Unknown record type" }, { status: 404 });
  }

  const session = await requireSession(recordTypeParam);

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = (await request.json()) as OperationalRecord;
  const record = { ...input, id: createOperationalRecordId() } as OperationalRecord;
  const title = RECORD_CONFIG[recordTypeParam].title(record);

  if (!isDatabaseConfigured()) {
    if (shouldUseMutableLocalStore()) {
      localRecords(session, recordTypeParam).unshift(record);
    }
    return json({ record, persistence: "memory" }, { status: 201 });
  }

  const persisted = await createPersistedOperationalRecord(
    tenantFromSession(session),
    recordTypeParam,
    record,
    title
  );
  return json({ record: persisted, persistence: "database" }, { status: 201 });
}
