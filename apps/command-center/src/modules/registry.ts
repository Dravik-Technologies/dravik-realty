import type { LucideIcon } from "lucide-react";
import { Home, LayoutDashboard, ShieldCheck } from "lucide-react";
import type { CommandCenterSession } from "@dravik/contracts/identity";
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
  requiredPermission?:  string;
  requiredEntitlement?: string;
}

export interface DashboardTile {
  label:  string;
  desc:   string;
  href:   string;
  accent: string;
  icon:   LucideIcon;
  requiredPermission?:  string;
  requiredEntitlement?: string;
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

function entry(
  item: NavEntry,
  requiredPermission: string,
  requiredEntitlement: string
): NavEntry {
  return { ...item, requiredPermission, requiredEntitlement };
}

function tile(module: ModuleDescriptor, entitlement = module.requiredEntitlement): DashboardTile {
  return {
    ...module.dashboardTile!,
    icon: module.icon,
    requiredPermission: module.requiredPermission,
    requiredEntitlement: entitlement,
  };
}

// The registry owns section layout and ordering.
// Manifests supply the entry data; ordering is explicit here so the shell
// layout can evolve independently of module order in ALL_MODULES.
export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Core Platform",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      entry(crm.navEntries[0],       "crm.manage",       "crm.enabled"),          // Lead Engine & Smart CRM
      entry(crm.navEntries[1],       "crm.manage",       "prospecting.enabled"),  // Prospecting & Seller Leads
      entry(referrals.navEntries[0], "referrals.manage", "referrals.enabled"),    // DRAVIK Partner Network
      entry(realty.navEntries[0],    "realty.manage",    "idx.enabled"),          // Interactive Mapping & IDX
      entry(realty.navEntries[1],    "realty.manage",    "listings.enabled"),     // Listings
      entry(marketing.navEntries[0], "marketing.manage", "marketing.enabled"),    // Marketing & Landing Pages
      entry(realty.navEntries[2],    "realty.manage",    "transactions.enabled"), // Transactions
      entry(crm.navEntries[2],       "crm.manage",       "crm.enabled"),          // Unified Inbox
      entry(portal.navEntries[0],    "portal.manage",    "portal.enabled"),       // Client Portal Admin
    ],
  },
  {
    title: "Intelligence",
    items: [
      entry(broker.navEntries[0],  "broker.manage",  "broker.enabled"),  // Reports & Analytics
      entry(broker.navEntries[1],  "broker.manage",  "broker.enabled"),  // Team Management
      entry(lending.navEntries[0], "lending.manage", "lending.enabled"), // Mortgage Tools
    ],
  },
];

// Dashboard module tiles — order matches the legacy MODULES declaration.
export const DASHBOARD_MODULES: DashboardTile[] = [
  tile(referrals, "referrals.enabled"),
  tile(crm,       "crm.enabled"),
  {
    label: "Listings",
    desc: "Manage listings and share inventory across the Dravik network.",
    href: "/realty/listings",
    accent: "#C9C3B6",
    icon: Home,
    requiredPermission: "realty.manage",
    requiredEntitlement: "listings.enabled",
  },
  {
    label: "Client Portal Admin",
    desc: "Invite clients, track portal activity, and manage deal visibility.",
    href: "/realty/client-portal",
    accent: "#4A7A4A",
    icon: ShieldCheck,
    requiredPermission: "portal.manage",
    requiredEntitlement: "portal.enabled",
  },
  tile(broker,    "broker.enabled"),
  tile(lending,   "lending.enabled"),
  tile(realty,    "transactions.enabled"),
  tile(marketing, "marketing.enabled"),
];

export function hasEntitlement(session: CommandCenterSession, entitlement?: string): boolean {
  return !entitlement || session.entitlements.includes(entitlement);
}

export function hasPermission(session: CommandCenterSession, permission?: string): boolean {
  if (!permission) return true;
  if (session.permissions.includes(permission)) return true;

  const [area, action] = permission.split(".");
  return action === "access" && session.permissions.includes(`${area}.manage`);
}

export function canAccessItem(
  session: CommandCenterSession,
  item: Pick<NavEntry | DashboardTile, "requiredPermission" | "requiredEntitlement">
): boolean {
  return hasPermission(session, item.requiredPermission) && hasEntitlement(session, item.requiredEntitlement);
}

export function filterNavSections(session: CommandCenterSession): NavSection[] {
  return NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessItem(session, item)),
    }))
    .filter((section) => section.items.length > 0);
}

export function filterDashboardModules(session: CommandCenterSession): DashboardTile[] {
  return DASHBOARD_MODULES.filter((item) => canAccessItem(session, item));
}

export function canAccessHref(session: CommandCenterSession, href: string): boolean {
  if (href === "/dashboard" || href === "/broker/settings" || href === "/settings") return true;

  const item = NAV_SECTIONS
    .flatMap((section) => section.items)
    .find((navItem) => href === navItem.href || href.startsWith(`${navItem.href}/`));

  return item ? canAccessItem(session, item) : true;
}
