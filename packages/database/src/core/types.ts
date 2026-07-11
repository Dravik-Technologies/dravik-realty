import type { CoreRoleArea, CoreRoleKey } from "./roles";

export type CoreTenantPlan = "starter" | "growth" | "enterprise";
export type CoreTenantStatus = "active" | "trialing" | "suspended";
export type CoreRecordStatus = "active" | "archived";
export type CoreUserStatus = "active" | "disabled";
export type CoreMembershipStatus =
  | "invited"
  | "active"
  | "suspended"
  | "removed";
export type CoreSessionArea = "command-center" | "client-portal";
export type CoreInvitationStatus =
  | "pending"
  | "accepted"
  | "revoked"
  | "expired";
export type CoreOutboxStatus = "pending" | "processing" | "sent" | "failed";

export interface CoreTenantRecord {
  id: string;
  slug: string;
  name: string;
  plan: CoreTenantPlan;
  status: CoreTenantStatus;
  branding: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CoreAppUserRecord {
  id: string;
  entraOid: string | null;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  status: CoreUserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CoreMembershipRecord {
  id: string;
  tenantId: string;
  userId: string;
  status: CoreMembershipStatus;
  defaultLandingArea: CoreSessionArea;
  createdAt: string;
  updatedAt: string;
}

export interface CoreRoleRecord {
  id: string;
  key: CoreRoleKey;
  name: string;
  area: CoreRoleArea;
  description: string;
  createdAt: string;
}

export interface CoreInvitationRecord {
  id: string;
  tenantId: string;
  email: string;
  area: CoreSessionArea;
  roleId: string;
  tokenHash: string;
  invitedByUserId: string | null;
  status: CoreInvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
