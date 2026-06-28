import { Megaphone } from "lucide-react";

export const manifest = {
  id:                  "marketing",
  title:               "Marketing & Landing Pages",
  icon:                Megaphone,
  basePath:            "/marketing",
  requiredPermission:  "marketing.access",
  requiredEntitlement: "marketing.enabled",
  navGroup:            "Core Platform" as const,
  navEntries: [
    { label: "Marketing & Landing Pages", icon: Megaphone, href: "/marketing" },
  ],
  dashboardTile: {
    label:  "Marketing & Pages",
    desc:   "Landing pages, email campaigns, and flyer designer.",
    href:   "/marketing",
    accent: "#B87333",
  },
};
