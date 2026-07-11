import type {
  ClientPortalSession,
  CommandCenterSession,
  TenantIdentity,
} from "@dravik/contracts/identity";

export const DRAVIK_TENANT: TenantIdentity = {
  id: "tenant_drvik_demo",
  slug: "dravik-realty",
  name: "Dravik Realty",
  plan: "growth",
  status: "active",
};

export const LOCAL_COMMAND_SESSION: CommandCenterSession = {
  area: "command-center",
  tenant: DRAVIK_TENANT,
  user: {
    id: "user_chris",
    name: "Chris Macabugao",
    email: "chris@dravikrealty.com",
    initials: "CM",
    title: "Principal Broker",
    role: "broker_owner",
  },
  permissions: [
    "broker.manage",
    "crm.manage",
    "lending.manage",
    "marketing.manage",
    "portal.manage",
    "realty.manage",
    "referrals.manage",
  ],
  entitlements: [
    "billing.enabled",
    "broker.enabled",
    "crm.enabled",
    "lending.enabled",
    "marketing.enabled",
    "portal.enabled",
    "realty.enabled",
    "referrals.enabled",
  ],
};

export const LOCAL_CLIENT_SESSIONS: Record<string, ClientPortalSession> = {
  c1: {
    area: "client-portal",
    tenant: DRAVIK_TENANT,
    user: {
      id: "client_user_john",
      clientId: "c1",
      name: "John Smith",
      email: "john.smith@email.com",
    },
    permissions: ["portal.view"],
    entitlements: ["portal.enabled"],
  },
  c2: {
    area: "client-portal",
    tenant: DRAVIK_TENANT,
    user: {
      id: "client_user_maria",
      clientId: "c2",
      name: "Maria Rodriguez",
      email: "m.rodriguez@email.com",
    },
    permissions: ["portal.view"],
    entitlements: ["portal.enabled"],
  },
};
