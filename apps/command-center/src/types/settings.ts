export type SettingsSection =
  | "general"
  | "users"
  | "commission"
  | "integrations"
  | "compliance"
  | "appearance"
  | "notifications"
  | "security";

export type UserRole     = "Principal Broker" | "Team Lead" | "Agent" | "Mortgage LO" | "Admin";
export type UserStatus   = "active" | "inactive" | "pending";
export type IntegStatus  = "connected" | "disconnected" | "error" | "pending";
export type LicenseStatus = "active" | "expiring-soon" | "expired";
export type AuditSeverity = "info" | "warning" | "error";

export interface SettingsUser {
  id:           string;
  name:         string;
  email:        string;
  role:         UserRole;
  status:       UserStatus;
  joinedDate:   string;   // display string
  lastLogin:    string;   // display string
  avatarColor:  string;
}

export interface CompanyInfo {
  name:     string;
  tagline:  string;
  phone:    string;
  email:    string;
  website:  string;
  address:  string;
  city:     string;
  state:    string;
  zip:      string;
  license:  string;
}

export interface Integration {
  id:           string;
  name:         string;
  provider:     string;
  category:     string;
  status:       IntegStatus;
  lastSync?:    string;
  description:  string;
  docsUrl:      string;
}

export interface LicenseRecord {
  id:            string;
  agentName:     string;
  licenseType:   "DRE" | "NMLS";
  licenseNumber: string;
  expiryDate:    string;
  daysRemaining: number;
  status:        LicenseStatus;
}

export interface AuditEntry {
  id:        string;
  timestamp: string;
  user:      string;
  action:    string;
  module:    string;
  ip:        string;
  severity:  AuditSeverity;
}

export interface CommissionTier {
  id:          string;
  name:        string;
  condition:   string;
  agentSplit:  number;   // %
  compSplit:   number;   // %
}

export interface NotifPref {
  id:       string;
  label:    string;
  category: string;
  email:    boolean;
  sms:      boolean;
  push:     boolean;
}

export interface ColorTheme {
  id:        string;
  label:     string;
  primary:   string;
  dark:      string;
  preview:   string;
}
