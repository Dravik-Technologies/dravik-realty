import { Globe } from "lucide-react";

export const manifest = {
  id:                  "referrals",
  title:               "Global Referral Network",
  icon:                Globe,
  basePath:            "/referrals",
  requiredPermission:  "referrals.access",
  requiredEntitlement: "referrals.enabled",
  navGroup:            "Core Platform" as const,
  navEntries: [
    { label: "Global Referral Network", icon: Globe, href: "/referrals" },
  ],
  dashboardTile: {
    label:  "Global Referral Network",
    desc:   "Manage and initiate agent referrals across the network.",
    href:   "/referrals",
    accent: "#D4AF37",
  },
};
