"use client";

import {
  Inbox, BellDot, Users, FileText, Globe, UsersRound, Building2,
} from "lucide-react";
import type { InboxFolder, Conversation } from "@/types/communication";
import { cn } from "@dravik/shared";

const FOLDERS: { id: InboxFolder; label: string; icon: React.ElementType }[] = [
  { id: "all",          label: "All Messages",  icon: Inbox      },
  { id: "unread",       label: "Unread",         icon: BellDot    },
  { id: "leads",        label: "Leads",          icon: Users      },
  { id: "transactions", label: "Transactions",   icon: FileText   },
  { id: "referrals",    label: "Referrals",      icon: Globe      },
  { id: "team",         label: "Team",           icon: UsersRound },
  { id: "mortgage",     label: "Mortgage",       icon: Building2  },
];

interface Props {
  conversations: Conversation[];
  active:        InboxFolder;
  onSelect:      (folder: InboxFolder) => void;
}

export default function InboxSidebar({ conversations, active, onSelect }: Props) {
  function countFor(folder: InboxFolder): number {
    switch (folder) {
      case "all":          return conversations.length;
      case "unread":       return conversations.filter((c) => c.unreadCount > 0).length;
      case "leads":        return conversations.filter((c) => c.tag === "lead").length;
      case "transactions": return conversations.filter((c) => c.tag === "transaction").length;
      case "referrals":    return conversations.filter((c) => c.tag === "referral").length;
      case "team":         return conversations.filter((c) => c.tag === "team").length;
      case "mortgage":     return conversations.filter((c) => c.tag === "mortgage").length;
      default:             return 0;
    }
  }

  return (
    <nav
      className="flex flex-col h-full overflow-hidden"
      aria-label="Inbox folders"
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-line flex-shrink-0">
        <p className="text-sm font-bold text-axen-dark">Messages</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Unified communications</p>
      </div>

      {/* Folders */}
      <div className="flex-1 overflow-y-auto py-2">
        {FOLDERS.map(({ id, label, icon: Icon }, i) => {
          const count  = countFor(id);
          const isActive = active === id;
          return (
            <div key={id}>
              {/* Divider before Leads section */}
              {i === 2 && <div className="mx-4 my-1.5 border-t border-line" />}
              <button
                onClick={() => onSelect(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors text-left",
                  isActive
                    ? "bg-gold-light text-gold"
                    : "text-gray-500 hover:bg-surface-2 hover:text-axen-dark"
                )}
              >
                <Icon
                  size={15}
                  className={cn("flex-shrink-0", isActive ? "text-gold" : "text-gray-400")}
                />
                <span className="flex-1 truncate">{label}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0",
                    id === "unread" && count > 0
                      ? "bg-gold text-axen-dark"
                      : isActive
                        ? "bg-gold/20 text-gold"
                        : "bg-surface-2 text-gray-400"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
