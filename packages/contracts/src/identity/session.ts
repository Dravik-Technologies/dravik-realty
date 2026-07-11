export type TenantPlan = "starter" | "growth" | "enterprise";
export type TenantStatus = "active" | "trialing" | "suspended";

export interface TenantIdentity {
  id: string;
  slug: string;
  name: string;
  plan: TenantPlan;
  status: TenantStatus;
}

export type InternalRole =
  | "broker_owner"
  | "broker_admin"
  | "team_lead"
  | "agent"
  | "loan_officer";

export interface InternalUserIdentity {
  id: string;
  name: string;
  email: string;
  initials: string;
  title: string;
  role: InternalRole;
}

export interface ClientUserIdentity {
  id: string;
  clientId: string;
  name: string;
  email: string;
}

export interface CommandCenterSession {
  area: "command-center";
  tenant: TenantIdentity;
  user: InternalUserIdentity;
  permissions: string[];
  entitlements: string[];
}

export interface ClientPortalSession {
  area: "client-portal";
  tenant: TenantIdentity;
  user: ClientUserIdentity;
  permissions: string[];
  entitlements: string[];
}
