import { Landmark } from "lucide-react";

export const manifest = {
  id:                  "lending",
  title:               "Mortgage Tools",
  icon:                Landmark,
  basePath:            "/lending",
  requiredPermission:  "lending.access",
  requiredEntitlement: "lending.enabled",
  tileSummaryEndpoint: "/api/v1/lending/summary",
  navGroup:            "Intelligence" as const,
  navEntries: [
    { label: "Mortgage Tools", icon: Landmark, href: "/lending" },
  ],
  dashboardTile: {
    label:  "Mortgage Tools",
    desc:   "Rate sheets, loan calculators, and pipeline tracking.",
    href:   "/lending",
    accent: "#C0786C",
  },
};
