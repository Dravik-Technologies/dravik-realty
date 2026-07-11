import { Globe } from "lucide-react";

export const manifest = {
  id:                  "referrals",
  title:               "DRAVIK Partner Network",
  icon:                Globe,
  basePath:            "/referrals",
  requiredPermission:  "referrals.access",
  requiredEntitlement: "referrals.enabled",
  navGroup:            "Core Platform" as const,
  navEntries: [
    { label: "DRAVIK Partner Network", icon: Globe, href: "/referrals" },
  ],
  dashboardTile: {
    label:  "DRAVIK Partner Network",
    desc:   "Find partners, manage referrals, and collaborate across markets.",
    href:   "/referrals",
    accent: "#C9C3B6",
  },
};
