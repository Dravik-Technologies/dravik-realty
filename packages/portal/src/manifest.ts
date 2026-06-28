import { ShieldCheck } from "lucide-react";

export const manifest = {
  id:                  "portal",
  title:               "Client Portal",
  icon:                ShieldCheck,
  basePath:            "/portal",
  requiredPermission:  "portal.access",
  requiredEntitlement: "portal.enabled",
  navGroup:            "Core Platform" as const,
  navEntries: [
    { label: "Client Portal", icon: ShieldCheck, href: "/portal" },
  ],
};
