// ─── Enums / union types ──────────────────────────────────────

export type LeadSource =
  | "Zillow"
  | "Open House"
  | "Website"
  | "Referral"
  | "Mortgage Inquiry"
  | "Instagram"
  | "Facebook"
  | "Redfin"
  | "Walk-In"
  | "Cold Call";

export type ClientType = "Buyer" | "Seller" | "Dual";

export type LeadStatus =
  | "New Lead"
  | "Contacted"
  | "Engaged"
  | "Active / Showing"
  | "Under Contract";

export type ActivityType =
  | "call"
  | "sms"
  | "email"
  | "note"
  | "viewing"
  | "status_change"
  | "document";

export type PreApprovalStatus =
  | "Not Started"
  | "In Progress"
  | "Approved"
  | "Denied";

export type CreditPullStatus = "Not Pulled" | "Soft Pull" | "Hard Pull";

// ─── Core models ──────────────────────────────────────────────

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string; // ISO-8601
  by: string;
}

export interface Lead {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
  phone: string;
  source: LeadSource;
  clientType: ClientType;
  status: LeadStatus;
  behaviorScore: number;   // 0–100
  lastTouchpoint: string;  // ISO-8601
  assignedTo: string;
  createdAt: string;       // ISO-8601
  notes: string;

  // Property preferences
  priceMin: number;
  priceMax: number;
  savedProperties: number;
  viewedThisWeek: number;

  // Mortgage (Buyers & Dual only)
  preApproval?: PreApprovalStatus;
  creditPull?: CreditPullStatus;
  maxBudget?: number;
  mortgageOfficer?: string;

  activities: Activity[];
}

// ─── Kanban column configuration ──────────────────────────────

export interface KanbanColumn {
  id: LeadStatus;
  label: string;
  accentColor: string;   // header accent & count badge
  dotColor: string;      // dot inside badge
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "New Lead",
    label: "New Lead",
    accentColor: "#6B7280",
    dotColor:    "#9CA3AF",
  },
  {
    id: "Contacted",
    label: "Contacted",
    accentColor: "#3B82F6",
    dotColor:    "#60A5FA",
  },
  {
    id: "Engaged",
    label: "Engaged",
    accentColor: "#8B5CF6",
    dotColor:    "#A78BFA",
  },
  {
    id: "Active / Showing",
    label: "Active / Showing",
    accentColor: "#C9C3B6",
    dotColor:    "#C9C3B6",
  },
  {
    id: "Under Contract",
    label: "Under Contract",
    accentColor: "#10B981",
    dotColor:    "#34D399",
  },
];

// ─── Source badge color map ────────────────────────────────────

export const SOURCE_STYLES: Record<
  LeadSource,
  { bg: string; text: string }
> = {
  "Zillow":           { bg: "bg-blue-50",    text: "text-blue-700"   },
  "Open House":       { bg: "bg-emerald-50", text: "text-emerald-700"},
  "Website":          { bg: "bg-violet-50",  text: "text-violet-700" },
  "Referral":         { bg: "bg-amber-50",   text: "text-amber-700"  },
  "Mortgage Inquiry": { bg: "bg-teal-50",    text: "text-teal-700"   },
  "Instagram":        { bg: "bg-pink-50",    text: "text-pink-700"   },
  "Facebook":         { bg: "bg-blue-50",    text: "text-blue-800"   },
  "Redfin":           { bg: "bg-red-50",     text: "text-red-700"    },
  "Walk-In":          { bg: "bg-gray-100",   text: "text-gray-700"   },
  "Cold Call":        { bg: "bg-yellow-50",  text: "text-yellow-700" },
};

// ─── Sub-nav tabs ─────────────────────────────────────────────

export type SubNavTab = "All Leads" | "My Leads" | "Unassigned" | "Archived";

export const SUBNAV_TABS: SubNavTab[] = [
  "All Leads",
  "My Leads",
  "Unassigned",
  "Archived",
];
