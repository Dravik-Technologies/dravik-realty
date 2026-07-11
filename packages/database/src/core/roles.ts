export const CORE_ROLE_KEYS = [
  "platform_admin",
  "broker_owner",
  "broker_admin",
  "team_lead",
  "agent",
  "lending_officer",
  "marketing_manager",
  "client",
] as const;

export type CoreRoleKey = (typeof CORE_ROLE_KEYS)[number];

export const CORE_ROLE_AREAS = [
  "platform",
  "command-center",
  "client-portal",
] as const;

export type CoreRoleArea = (typeof CORE_ROLE_AREAS)[number];

export const CORE_ROLE_PERMISSIONS = {
  platform_admin: [
    "platform.manage",
    "tenant.manage",
    "audit.read",
    "billing.manage",
    "broker.manage",
    "crm.manage",
    "lending.manage",
    "marketing.manage",
    "portal.manage",
    "realty.manage",
    "referrals.manage",
  ],
  broker_owner: [
    "tenant.manage",
    "billing.manage",
    "broker.manage",
    "crm.manage",
    "lending.manage",
    "marketing.manage",
    "portal.manage",
    "realty.manage",
    "referrals.manage",
  ],
  broker_admin: [
    "broker.manage",
    "crm.manage",
    "lending.manage",
    "marketing.manage",
    "portal.manage",
    "realty.manage",
    "referrals.manage",
  ],
  team_lead: [
    "crm.manage",
    "portal.manage",
    "realty.manage",
    "referrals.manage",
  ],
  agent: [
    "crm.manage",
    "portal.manage",
    "realty.manage",
    "referrals.manage",
  ],
  lending_officer: ["crm.read", "lending.manage", "portal.read"],
  marketing_manager: ["crm.read", "marketing.manage", "realty.read"],
  client: ["portal.view"],
} as const satisfies Record<CoreRoleKey, readonly string[]>;
