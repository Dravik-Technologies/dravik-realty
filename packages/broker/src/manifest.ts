import { UsersRound, BarChart3 } from "lucide-react";

export const manifest = {
  id:                  "broker",
  title:               "Broker Tools",
  icon:                UsersRound,
  basePath:            "/broker",
  requiredPermission:  "broker.access",
  requiredEntitlement: "broker.enabled",
  navGroup:            "Intelligence" as const,
  navEntries: [
    { label: "Reports & Analytics", icon: BarChart3,  href: "/broker/reports" },
    { label: "Team Management",     icon: UsersRound, href: "/broker/team"    },
  ],
  dashboardTile: {
    label:  "Reports & Analytics",
    desc:   "Production reports, team metrics, and revenue forecasts.",
    href:   "/broker/reports",
    accent: "#7C6A9E",
  },
};
