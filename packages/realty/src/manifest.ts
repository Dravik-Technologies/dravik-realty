import { Map, Receipt } from "lucide-react";

export const manifest = {
  id:                  "realty",
  title:               "Interactive Mapping & IDX",
  icon:                Map,
  basePath:            "/realty",
  requiredPermission:  "realty.access",
  requiredEntitlement: "realty.enabled",
  navGroup:            "Core Platform" as const,
  navEntries: [
    { label: "Interactive Mapping & IDX", icon: Map,     href: "/realty/mapping"      },
    { label: "Transactions",              icon: Receipt, href: "/realty/transactions" },
  ],
  dashboardTile: {
    label:  "Transactions",
    desc:   "End-to-end transaction management and document tracking.",
    href:   "/realty/transactions",
    accent: "#4A7A4A",
  },
};
