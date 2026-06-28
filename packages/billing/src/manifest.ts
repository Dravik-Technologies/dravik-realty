import { CreditCard } from "lucide-react";

export const manifest = {
  id:                  "billing",
  title:               "Billing & Subscriptions",
  icon:                CreditCard,
  basePath:            "/billing",
  requiredPermission:  "billing.access",
  requiredEntitlement: "billing.enabled",
  navGroup:            "Intelligence" as const,
  navEntries:          [] as { label: string; icon: typeof CreditCard; href: string }[],
};
