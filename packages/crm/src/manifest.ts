import { Users, Target, Inbox } from "lucide-react";

export const manifest = {
  id:                  "crm",
  title:               "Lead Engine & Smart CRM",
  icon:                Users,
  basePath:            "/crm",
  requiredPermission:  "crm.access",
  requiredEntitlement: "crm.enabled",
  tileSummaryEndpoint: "/api/v1/crm/summary",
  navGroup:            "Core Platform" as const,
  navEntries: [
    { label: "Lead Engine & Smart CRM",    icon: Users,  href: "/crm/leads"       },
    { label: "Prospecting & Seller Leads", icon: Target, href: "/crm/prospecting" },
    { label: "Unified Inbox",              icon: Inbox,  href: "/crm/inbox"       },
  ],
  dashboardTile: {
    label:  "Lead Engine & Smart CRM",
    desc:   "Track, nurture, and convert leads with AI scoring.",
    href:   "/crm/leads",
    accent: "#4A90A4",
  },
};
