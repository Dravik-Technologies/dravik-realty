import type { LucideIcon } from "lucide-react";
import { LayoutDashboard }   from "lucide-react";
import { manifest as crm }       from "@dravik/crm";
import { manifest as realty }    from "@dravik/realty";
import { manifest as lending }   from "@dravik/lending";
import { manifest as marketing } from "@dravik/marketing";
import { manifest as referrals } from "@dravik/referrals";
import { manifest as broker }    from "@dravik/broker";
import { manifest as portal }    from "@dravik/portal";
import { manifest as billing }   from "@dravik/billing";

// Phase 3: move ModuleDescriptor to @dravik/contracts/module once contracts gains react type support.
export interface NavEntry {
  label: string;
  icon:  LucideIcon;
  href:  string;
}

export interface DashboardTile {
  label:  string;
  desc:   string;
  href:   string;
  accent: string;
  icon:   LucideIcon;
}

export interface ModuleDescriptor {
  id:                   string;
  title:                string;
  icon:                 LucideIcon;
  basePath:             string;
  requiredPermission:   string;
  requiredEntitlement:  string;
  tileSummaryEndpoint?: string;
  navGroup:             "Core Platform" | "Intelligence";
  navEntries:           NavEntry[];
  dashboardTile?:       Omit<DashboardTile, "icon">;
}

// All 8 feature modules — validated against ModuleDescriptor at compile time.
export const ALL_MODULES: ModuleDescriptor[] = [
  crm, realty, lending, marketing, referrals, broker, portal, billing,
];

export interface NavSection { title: string; items: NavEntry[]; }

// The registry owns section layout and ordering.
// Manifests supply the entry data; ordering is explicit here so the shell
// layout can evolve independently of module order in ALL_MODULES.
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Core Platform",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      crm.navEntries[0],        // Lead Engine & Smart CRM     → /crm/leads
      crm.navEntries[1],        // Prospecting & Seller Leads  → /crm/prospecting
      referrals.navEntries[0],  // Global Referral Network     → /referrals
      realty.navEntries[0],     // Interactive Mapping & IDX   → /realty/mapping
      marketing.navEntries[0],  // Marketing & Landing Pages   → /marketing
      realty.navEntries[1],     // Transactions                → /realty/transactions
      crm.navEntries[2],        // Unified Inbox               → /crm/inbox
      portal.navEntries[0],     // Client Portal               → /portal
    ],
  },
  {
    title: "Intelligence",
    items: [
      broker.navEntries[0],     // Reports & Analytics         → /broker/reports
      broker.navEntries[1],     // Team Management             → /broker/team
      lending.navEntries[0],    // Mortgage Tools              → /lending
    ],
  },
];

// Dashboard module tiles — order matches the legacy MODULES declaration.
export const DASHBOARD_MODULES: DashboardTile[] = [
  { ...referrals.dashboardTile!, icon: referrals.icon },
  { ...crm.dashboardTile!,       icon: crm.icon       },
  { ...broker.dashboardTile!,    icon: broker.icon     },
  { ...lending.dashboardTile!,   icon: lending.icon    },
  { ...realty.dashboardTile!,    icon: realty.icon     },
  { ...marketing.dashboardTile!, icon: marketing.icon },
];
