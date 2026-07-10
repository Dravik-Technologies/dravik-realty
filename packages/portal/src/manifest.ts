import { ShieldCheck } from "lucide-react";

export const manifest = {
  id:                  "portal",
  title:               "Client Portal Admin",
  icon:                ShieldCheck,
  basePath:            "/realty/client-portal",
  requiredPermission:  "portal.manage",
  requiredEntitlement: "portal.enabled",
  navGroup:            "Core Platform" as const,
  navEntries: [
    { label: "Client Portal Admin", icon: ShieldCheck, href: "/realty/client-portal" },
  ],
};
