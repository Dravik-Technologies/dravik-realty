import type {
  ClientPortalSession,
  CommandCenterSession,
} from "@dravik/contracts/identity";
import {
  isDatabaseConfigured,
  readPersistedTenantBranding,
  updatePersistedTenantBranding,
  type CoreTenantIdentity,
} from "@dravik/database/core";
import {
  DEFAULT_TENANT_BRANDING,
  normalizeTenantBranding,
  type TenantBranding,
} from "@dravik/shared";
import { getClientPortalSession, getCommandSession } from "@/auth/server";

export const runtime = "nodejs";

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

async function requireSession() {
  return (await getCommandSession()) ?? getClientPortalSession();
}

async function requireBrokerSession() {
  const session = await getCommandSession();

  if (!session?.permissions.includes("broker.manage")) {
    return null;
  }

  return session;
}

function tenantFromSession(
  session: CommandCenterSession | ClientPortalSession
): CoreTenantIdentity {
  return {
    id: session.tenant.id,
    slug: session.tenant.slug,
    name: session.tenant.name,
    plan: session.tenant.plan,
    status: session.tenant.status,
  };
}

function parseBranding(input: unknown): TenantBranding {
  if (!input || typeof input !== "object") {
    return DEFAULT_TENANT_BRANDING;
  }

  return normalizeTenantBranding(input as Partial<TenantBranding>);
}

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return json({
      branding: DEFAULT_TENANT_BRANDING,
      persistence: "memory",
    });
  }

  const branding = await readPersistedTenantBranding(tenantFromSession(session));
  return json({
    branding: normalizeTenantBranding(branding),
    persistence: "database",
  });
}

export async function PUT(request: Request) {
  const session = await requireBrokerSession();

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    branding?: Partial<TenantBranding>;
  } | null;
  const branding = parseBranding(body?.branding);

  if (!isDatabaseConfigured()) {
    return json({
      branding,
      persistence: "memory",
    });
  }

  const persisted = await updatePersistedTenantBranding(
    tenantFromSession(session),
    { ...branding }
  );

  return json({
    branding: normalizeTenantBranding(persisted),
    persistence: "database",
  });
}
