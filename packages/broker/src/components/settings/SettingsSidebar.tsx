"use client";

import {
  Building2, Users, DollarSign, Plug2, ShieldCheck,
  Paintbrush, Bell, Lock,
} from "lucide-react";
import type { SettingsSection } from "@dravik/contracts/broker";
import { cn } from "@dravik/shared";

// ─── Nav items ────────────────────────────────────────────────
const ITEMS: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: "general",       label: "General",              icon: Building2  },
  { id: "users",         label: "Users & Permissions",  icon: Users      },
  { id: "commission",    label: "Commission & Billing",  icon: DollarSign },
  { id: "integrations",  label: "Integrations",         icon: Plug2      },
  { id: "compliance",    label: "Compliance & Docs",    icon: ShieldCheck},
  { id: "appearance",    label: "Appearance",           icon: Paintbrush },
  { id: "notifications", label: "Notifications",        icon: Bell       },
  { id: "security",      label: "Security & Audit",     icon: Lock       },
];

interface Props {
  active:   SettingsSection;
  onSelect: (s: SettingsSection) => void;
}

export default function SettingsSidebar({ active, onSelect }: Props) {
  return (
    <aside className="w-full lg:w-56 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-line bg-white flex flex-col lg:py-4">
      <p className="hidden lg:block text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 mb-3">
        Settings
      </p>
      <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:block lg:flex-1 lg:px-2 lg:py-0 lg:space-y-0.5">
        {ITEMS.map((item) => {
          const Icon    = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex flex-shrink-0 items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 text-left lg:w-full lg:gap-3",
                isActive
                  ? "bg-gold/10 text-gold-dark font-semibold"
                  : "text-gray-500 hover:bg-surface-2 hover:text-dravik-dark"
              )}
            >
              <Icon
                size={15}
                className={cn("flex-shrink-0", isActive ? "text-gold" : "text-gray-400")}
              />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
