export type LicenseType     = "RE" | "Mortgage" | "Dual";
export type AgentStatus     = "Active" | "Inactive" | "Onboarding" | "Suspended";
export type AgentRole       = "Broker" | "Team Lead" | "Agent" | "Mortgage Officer";
export type AgentTab        = "profile" | "performance" | "commission" | "referrals" | "documents" | "activity";
export type DirectoryFilter = "all" | "my-team" | "dual" | "new-agents";
export type DirectoryView   = "directory" | "hierarchy";
export type SortField       = "name" | "ytdVolume" | "closedUnits" | "referralScore" | "lastActivity";

export interface CommissionRule {
  id:         string;
  name:       string;
  condition:  string;
  agentSplit: number;
  notes:      string;
}

export interface AgentActivity {
  id:          string;
  type:        "listing" | "sale" | "referral" | "note" | "review" | "compliance";
  description: string;
  date:        string; // "YYYY-MM-DD"
}

export interface Agent {
  id:           string;
  name:         string;
  initials:     string;
  color:        string;
  email:        string;
  phone:        string;
  address:      string;

  licenseType:   LicenseType;
  licenseNumber: string;
  licenseExpiry: string;   // "YYYY-MM-DD"
  status:        AgentStatus;
  role:          AgentRole;
  teamId?:       string;
  managerId?:    string;
  joinDate:      string;   // "YYYY-MM-DD"

  ytdVolume:      number;
  ytdGci:         number;
  closedUnits:    number;
  activeListings: number;
  referralScore:  number;  // 0–100
  avgDaysToClose: number;
  conversionRate: number;
  lastActivity:   string;  // "YYYY-MM-DD"
  monthlyVolume:  number[]; // 6-month rolling for sparkline

  splitPercent:   number;
  axenCutPercent: number;
  customRules:    CommissionRule[];

  referralsSent:     number;
  referralsReceived: number;
  referralRevenue:   number;

  eAndOExpiry:      string;
  boardMemberships: string[];
  certifications:   string[];

  recentActivity: AgentActivity[];
}

export interface TeamGroup {
  id:        string;
  name:      string;
  leadId:    string;
  memberIds: string[];
  color:     string;
}
