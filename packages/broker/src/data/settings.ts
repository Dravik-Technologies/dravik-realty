import { localDemoData } from "@dravik/shared";
import type {
  SettingsUser, CompanyInfo, Integration,
  LicenseRecord, AuditEntry, CommissionTier, NotifPref, ColorTheme,
} from "@dravik/contracts/broker";

// ─── Company ──────────────────────────────────────────────────
export const COMPANY_INFO: CompanyInfo = {
  name:    "Dravik Realty",
  tagline: "Premium Real Estate & Mortgage Solutions",
  phone:   "(714) 555-0100",
  email:   "info@dravikrealty.com",
  website: "www.dravikrealty.com",
  address: "100 Enterprise Way, Suite 400",
  city:    "Irvine",
  state:   "CA",
  zip:     "92618",
  license: "DRE #02154331",
};

// ─── Users ────────────────────────────────────────────────────
const LOCAL_SETTINGS_USERS: SettingsUser[] = [
  {
    id: "u1", name: "Chris Macabugao", email: "chris@dravikrealty.com",
    role: "Principal Broker", status: "active",
    joinedDate: "Jan 15, 2022", lastLogin: "Today, 9:14 AM", avatarColor: "#C9C3B6",
  },
  {
    id: "u2", name: "Elena Rodriguez", email: "elena@dravikrealty.com",
    role: "Mortgage LO", status: "active",
    joinedDate: "Mar 3, 2022", lastLogin: "Today, 8:42 AM", avatarColor: "#7C3AED",
  },
  {
    id: "u3", name: "Aisha Williams", email: "aisha@dravikrealty.com",
    role: "Team Lead", status: "active",
    joinedDate: "Jun 10, 2022", lastLogin: "Yesterday, 5:30 PM", avatarColor: "#0EA5E9",
  },
  {
    id: "u4", name: "Sarah Chen", email: "sarah@dravikrealty.com",
    role: "Team Lead", status: "active",
    joinedDate: "Aug 20, 2022", lastLogin: "May 28, 2026", avatarColor: "#EC4899",
  },
  {
    id: "u5", name: "Marcus Johnson", email: "marcus@dravikrealty.com",
    role: "Agent", status: "active",
    joinedDate: "Nov 5, 2022", lastLogin: "May 27, 2026", avatarColor: "#10B981",
  },
  {
    id: "u6", name: "James Park", email: "james@dravikrealty.com",
    role: "Mortgage LO", status: "active",
    joinedDate: "Feb 14, 2023", lastLogin: "May 28, 2026", avatarColor: "#F97316",
  },
  {
    id: "u7", name: "Julia Thompson", email: "julia@dravikrealty.com",
    role: "Agent", status: "active",
    joinedDate: "Apr 1, 2023", lastLogin: "May 26, 2026", avatarColor: "#8B5CF6",
  },
  {
    id: "u8", name: "David Park", email: "david@dravikrealty.com",
    role: "Agent", status: "active",
    joinedDate: "Jul 22, 2023", lastLogin: "May 25, 2026", avatarColor: "#0D9488",
  },
  {
    id: "u9", name: "Rachel Kim", email: "rachel@dravikrealty.com",
    role: "Admin", status: "active",
    joinedDate: "Sep 15, 2023", lastLogin: "Today, 10:02 AM", avatarColor: "#BE185D",
  },
  {
    id: "u10", name: "Nathan Brooks", email: "nathan@dravikrealty.com",
    role: "Agent", status: "inactive",
    joinedDate: "Dec 1, 2023", lastLogin: "Mar 10, 2026", avatarColor: "#6B7280",
  },
  {
    id: "u11", name: "Priya Patel", email: "priya@dravikrealty.com",
    role: "Agent", status: "pending",
    joinedDate: "May 28, 2026", lastLogin: "—", avatarColor: "#B45309",
  },
];

export const SETTINGS_USERS: SettingsUser[] = localDemoData(LOCAL_SETTINGS_USERS);

// ─── Integrations ─────────────────────────────────────────────
const LOCAL_INTEGRATIONS: Integration[] = [
  {
    id: "mls", name: "MLS / IDX Feed", provider: "CRMLS",
    category: "Listings", status: "connected",
    lastSync: "Today, 10:15 AM",
    description: "Syncs active listings and sold data every 15 minutes.",
    docsUrl: "#",
  },
  {
    id: "twilio", name: "SMS Messaging", provider: "Twilio",
    category: "Communications", status: "connected",
    lastSync: "Live",
    description: "Powers two-way SMS for the Unified Inbox.",
    docsUrl: "#",
  },
  {
    id: "sendgrid", name: "Email Delivery", provider: "SendGrid",
    category: "Communications", status: "connected",
    lastSync: "Live",
    description: "Transactional and marketing email delivery.",
    docsUrl: "#",
  },
  {
    id: "docusign", name: "E-Signatures", provider: "DocuSign",
    category: "Documents", status: "connected",
    lastSync: "May 28, 2026",
    description: "Send, sign, and store transaction documents.",
    docsUrl: "#",
  },
  {
    id: "encompass", name: "Mortgage LOS", provider: "Encompass",
    category: "Mortgage", status: "connected",
    lastSync: "Today, 9:00 AM",
    description: "Bi-directional sync of loan applications and status.",
    docsUrl: "#",
  },
  {
    id: "gcal", name: "Google Calendar", provider: "Google",
    category: "Productivity", status: "pending",
    description: "Sync showings, closings, and team events.",
    docsUrl: "#",
  },
  {
    id: "zapier", name: "Zapier", provider: "Zapier",
    category: "Automation", status: "disconnected",
    description: "Connect Dravik Realty to 5,000+ apps via no-code workflows.",
    docsUrl: "#",
  },
  {
    id: "stripe", name: "Payment Processing", provider: "Stripe",
    category: "Billing", status: "error",
    lastSync: "May 20, 2026",
    description: "Process earnest money and commission payments.",
    docsUrl: "#",
  },
];

export const INTEGRATIONS: Integration[] = localDemoData(LOCAL_INTEGRATIONS);

// ─── License records ──────────────────────────────────────────
const LOCAL_LICENSE_RECORDS: LicenseRecord[] = [
  { id: "l1", agentName: "Chris Macabugao", licenseType: "DRE", licenseNumber: "DRE #01845621", expiryDate: "Dec 31, 2026", daysRemaining: 216, status: "active"         },
  { id: "l2", agentName: "Aisha Williams",  licenseType: "DRE", licenseNumber: "DRE #02134789", expiryDate: "Mar 15, 2027", daysRemaining: 290, status: "active"         },
  { id: "l3", agentName: "Sarah Chen",      licenseType: "DRE", licenseNumber: "DRE #01998765", expiryDate: "Aug 30, 2026", daysRemaining: 93,  status: "expiring-soon" },
  { id: "l4", agentName: "Elena Rodriguez", licenseType: "NMLS",licenseNumber: "NMLS #1234567", expiryDate: "Dec 31, 2026", daysRemaining: 216, status: "active"         },
  { id: "l5", agentName: "Marcus Johnson",  licenseType: "DRE", licenseNumber: "DRE #02281001", expiryDate: "Jun 30, 2026", daysRemaining: 32,  status: "expiring-soon" },
  { id: "l6", agentName: "Julia Thompson",  licenseType: "DRE", licenseNumber: "DRE #02445678", expiryDate: "Nov 15, 2026", daysRemaining: 170, status: "active"         },
  { id: "l7", agentName: "David Park",      licenseType: "DRE", licenseNumber: "DRE #02198234", expiryDate: "Jul 31, 2026", daysRemaining: 63,  status: "expiring-soon" },
  { id: "l8", agentName: "James Park",      licenseType: "NMLS",licenseNumber: "NMLS #9876543", expiryDate: "Dec 31, 2026", daysRemaining: 216, status: "active"         },
];

export const LICENSE_RECORDS: LicenseRecord[] = localDemoData(LOCAL_LICENSE_RECORDS);

// ─── Audit log ────────────────────────────────────────────────
const LOCAL_AUDIT_LOG: AuditEntry[] = [
  { id: "a1",  timestamp: "May 29, 2026  2:48 PM", user: "Chris Macabugao", action: "User login",                  module: "Dashboard",   ip: "192.168.1.42",  severity: "info"    },
  { id: "a2",  timestamp: "May 29, 2026  1:32 PM", user: "Chris Macabugao", action: "Lead assigned to Marcus J.",  module: "Leads",       ip: "192.168.1.42",  severity: "info"    },
  { id: "a3",  timestamp: "May 29, 2026 11:15 AM", user: "Sarah Chen",      action: "Document uploaded",           module: "Transactions",ip: "192.168.1.18",  severity: "info"    },
  { id: "a4",  timestamp: "May 29, 2026  9:44 AM", user: "Elena Rodriguez", action: "User login",                  module: "Dashboard",   ip: "10.0.0.5",      severity: "info"    },
  { id: "a5",  timestamp: "May 29, 2026  8:30 AM", user: "Chris Macabugao", action: "Commission rule modified",    module: "Settings",    ip: "192.168.1.42",  severity: "warning" },
  { id: "a6",  timestamp: "May 28, 2026  4:55 PM", user: "Elena Rodriguez", action: "Mortgage app stage changed",  module: "Mortgage",    ip: "10.0.0.5",      severity: "info"    },
  { id: "a7",  timestamp: "May 28, 2026  3:22 PM", user: "Chris Macabugao", action: "Integration reconnected",     module: "Settings",    ip: "192.168.1.42",  severity: "info"    },
  { id: "a8",  timestamp: "May 28, 2026  2:10 PM", user: "Chris Macabugao", action: "New agent onboarded",         module: "Team",        ip: "192.168.1.42",  severity: "info"    },
  { id: "a9",  timestamp: "May 28, 2026 11:48 AM", user: "Marcus Johnson",  action: "User login",                  module: "Dashboard",   ip: "172.16.0.8",    severity: "info"    },
  { id: "a10", timestamp: "May 28, 2026 10:30 AM", user: "System",          action: "MLS sync completed (147 listings)", module: "Integrations", ip: "127.0.0.1", severity: "info" },
  { id: "a11", timestamp: "May 27, 2026  5:15 PM", user: "Sarah Chen",      action: "Lead status changed",         module: "Leads",       ip: "192.168.1.18",  severity: "info"    },
  { id: "a12", timestamp: "May 27, 2026  3:45 PM", user: "Chris Macabugao", action: "Report exported (PDF)",       module: "Reports",     ip: "192.168.1.42",  severity: "info"    },
  { id: "a13", timestamp: "May 27, 2026  2:00 PM", user: "Elena Rodriguez", action: "Password changed",            module: "Settings",    ip: "10.0.0.5",      severity: "warning" },
  { id: "a14", timestamp: "May 27, 2026 11:30 AM", user: "Unknown",         action: "Failed login attempt",        module: "Auth",        ip: "203.0.113.5",   severity: "error"   },
  { id: "a15", timestamp: "May 27, 2026 10:15 AM", user: "Chris Macabugao", action: "Zapier disconnected",         module: "Integrations",ip: "192.168.1.42",  severity: "warning" },
  { id: "a16", timestamp: "May 26, 2026  4:30 PM", user: "Chris Macabugao", action: "New user invited (Priya P.)", module: "Settings",    ip: "192.168.1.42",  severity: "info"    },
  { id: "a17", timestamp: "May 26, 2026  2:45 PM", user: "Chris Macabugao", action: "Commission override set",     module: "Settings",    ip: "192.168.1.42",  severity: "warning" },
  { id: "a18", timestamp: "May 26, 2026  1:00 PM", user: "James Park",      action: "Closing funded (txn-112)",    module: "Transactions",ip: "172.16.0.22",   severity: "info"    },
  { id: "a19", timestamp: "May 25, 2026  3:30 PM", user: "Julia Thompson",  action: "User login",                  module: "Dashboard",   ip: "192.168.1.55",  severity: "info"    },
  { id: "a20", timestamp: "May 25, 2026 10:00 AM", user: "Chris Macabugao", action: "DRE license record updated",  module: "Settings",    ip: "192.168.1.42",  severity: "info"    },
];

export const AUDIT_LOG: AuditEntry[] = localDemoData(LOCAL_AUDIT_LOG);

// ─── Commission tiers ─────────────────────────────────────────
export const COMMISSION_TIERS: CommissionTier[] = [
  { id: "t1", name: "Standard Agent",  condition: "Default split",              agentSplit: 70, compSplit: 30 },
  { id: "t2", name: "Senior Agent",    condition: "≥ $3M volume YTD",           agentSplit: 75, compSplit: 25 },
  { id: "t3", name: "Team Lead",       condition: "Team Lead role",             agentSplit: 78, compSplit: 22 },
  { id: "t4", name: "Top Producer",    condition: "≥ $8M volume YTD",           agentSplit: 82, compSplit: 18 },
  { id: "t5", name: "Mortgage LO",     condition: "Mortgage origination",       agentSplit: 75, compSplit: 25 },
];

// ─── Notification preferences ─────────────────────────────────
export const NOTIF_PREFS: NotifPref[] = [
  // Leads
  { id: "n1",  category: "Lead Alerts",    label: "New lead assigned",            email: true,  sms: true,  push: true  },
  { id: "n2",  category: "Lead Alerts",    label: "Lead status change",           email: true,  sms: false, push: true  },
  { id: "n3",  category: "Lead Alerts",    label: "High-intent lead detected",    email: true,  sms: true,  push: true  },
  // Transactions
  { id: "n4",  category: "Transactions",   label: "Closing date reminder",        email: true,  sms: true,  push: false },
  { id: "n5",  category: "Transactions",   label: "Document request",             email: true,  sms: false, push: true  },
  { id: "n6",  category: "Transactions",   label: "Transaction status change",    email: true,  sms: false, push: false },
  // Team
  { id: "n7",  category: "Team",           label: "Agent onboarded",              email: true,  sms: false, push: false },
  { id: "n8",  category: "Team",           label: "License expiring (60 days)",   email: true,  sms: false, push: true  },
  { id: "n9",  category: "Team",           label: "Performance threshold reached",email: false, sms: false, push: true  },
  // Communications
  { id: "n10", category: "Communications", label: "New message in Inbox",         email: false, sms: false, push: true  },
  { id: "n11", category: "Communications", label: "Missed call",                  email: true,  sms: true,  push: true  },
  // System
  { id: "n12", category: "System",         label: "Billing reminder",             email: true,  sms: false, push: false },
  { id: "n13", category: "System",         label: "Integration error",            email: true,  sms: false, push: true  },
  { id: "n14", category: "System",         label: "System update available",      email: true,  sms: false, push: false },
];

// ─── Color themes ─────────────────────────────────────────────
export const COLOR_THEMES: ColorTheme[] = [
  { id: "gold",    label: "Platinum & Graphite", primary: "#C9C3B6", dark: "#111418", preview: "#C9C3B6" },
  { id: "navy",    label: "Navy & Silver",    primary: "#4F7CAC", dark: "#1B2A4A", preview: "#4F7CAC" },
  { id: "emerald", label: "Emerald & Dark",   primary: "#10B981", dark: "#0D2B22", preview: "#10B981" },
  { id: "rose",    label: "Rose & Charcoal",  primary: "#E11D48", dark: "#1C0B0B", preview: "#E11D48" },
  { id: "slate",   label: "Slate & Amber",    primary: "#64748B", dark: "#1E293B", preview: "#64748B" },
];
