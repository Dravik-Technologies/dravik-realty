export type OperationalRecordType = "leads" | "seller-leads" | "partners" | "transactions";

type RecordsPayload<T> = {
  records: T[];
  persistence: string;
};

type RecordPayload<T> = {
  record: T;
  persistence: string;
};

async function parseApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function fetchOperationalRecords<T>(recordType: OperationalRecordType) {
  return parseApiResponse<RecordsPayload<T>>(
    await fetch(`/api/records/${recordType}`, { cache: "no-store" })
  );
}

export async function createOperationalRecord<T>(
  recordType: OperationalRecordType,
  record: T
) {
  return parseApiResponse<RecordPayload<T>>(
    await fetch(`/api/records/${recordType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    })
  );
}

export async function updateOperationalRecord<T>(
  recordType: OperationalRecordType,
  recordId: string,
  patch: Partial<T>
) {
  return parseApiResponse<RecordPayload<T>>(
    await fetch(`/api/records/${recordType}/${recordId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

export async function archiveOperationalRecord(
  recordType: OperationalRecordType,
  recordId: string
) {
  return parseApiResponse<{ ok: boolean; persistence: string }>(
    await fetch(`/api/records/${recordType}/${recordId}`, { method: "DELETE" })
  );
}
