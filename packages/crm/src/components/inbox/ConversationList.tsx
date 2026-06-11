"use client";

import { useState } from "react";
import {
  Search, X, MessageSquare, Mail, Phone, Zap, Settings2,
} from "lucide-react";
import type {
  Conversation, InboxFolder, QuickFilter, Channel, ConversationTag,
} from "@dravik/contracts/crm";
import { cn } from "@dravik/shared";

// ─── Channel icon ─────────────────────────────────────────────
const CHANNEL_ICON: Record<Channel, React.ElementType> = {
  sms:      MessageSquare,
  email:    Mail,
  whatsapp: Zap,
  call:     Phone,
  system:   Settings2,
};
const CHANNEL_COLOR: Record<Channel, string> = {
  sms:      "text-blue-500",
  email:    "text-violet-500",
  whatsapp: "text-emerald-500",
  call:     "text-amber-500",
  system:   "text-gray-400",
};

// ─── Tag badge ────────────────────────────────────────────────
const TAG_STYLE: Record<ConversationTag, string> = {
  lead:        "bg-blue-50   text-blue-600",
  transaction: "bg-gold-light text-gold-dark",
  referral:    "bg-violet-50 text-violet-600",
  team:        "bg-gray-100  text-gray-500",
  mortgage:    "bg-emerald-50 text-emerald-600",
};

// ─── Quick filter config ──────────────────────────────────────
const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: "all",         label: "All"         },
  { id: "today",       label: "Today"       },
  { id: "this-week",   label: "This Week"   },
  { id: "high-intent", label: "High Intent" },
];

// ─── Single conversation row ──────────────────────────────────
function ConvRow({
  conv: c,
  selected,
  onSelect,
}: {
  conv:     Conversation;
  selected: boolean;
  onSelect: (c: Conversation) => void;
}) {
  const Icon = CHANNEL_ICON[c.channel];
  return (
    <button
      onClick={() => onSelect(c)}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3.5 border-b border-line transition-colors",
        selected ? "bg-gold-light" : "hover:bg-surface"
      )}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
        style={{ background: c.clientColor }}
      >
        {c.clientInitials.slice(0, 2)}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Top row: name + time */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={cn("text-sm font-semibold truncate", c.unreadCount > 0 ? "text-axen-dark" : "text-gray-700")}>
              {c.clientName}
            </span>
            {c.isHighIntent && (
              <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-rose-100 text-rose-600 flex-shrink-0">HOT</span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 flex-shrink-0">{c.displayTime}</span>
        </div>

        {/* Subject / address */}
        {(c.subject || c.propertyAddress) && (
          <p className="text-[10px] text-gray-400 truncate mb-0.5">
            {c.subject ?? c.propertyAddress}
          </p>
        )}

        {/* Last message */}
        <p className={cn("text-xs truncate", c.unreadCount > 0 ? "text-axen-dark font-medium" : "text-gray-400")}>
          {c.lastMessage}
        </p>

        {/* Footer: tag + channel + unread */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize", TAG_STYLE[c.tag])}>
            {c.tag}
          </span>
          <Icon size={11} className={cn("flex-shrink-0", CHANNEL_COLOR[c.channel])} />
          {c.unreadCount > 0 && (
            <span className="ml-auto text-[9px] font-bold w-4 h-4 rounded-full bg-gold text-axen-dark flex items-center justify-center flex-shrink-0">
              {c.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── ConversationList ─────────────────────────────────────────
interface Props {
  conversations: Conversation[];
  folder:        InboxFolder;
  selectedId:    string | null;
  onSelect:      (c: Conversation) => void;
}

export default function ConversationList({ conversations, folder, selectedId, onSelect }: Props) {
  const [search, setSearch]             = useState("");
  const [quickFilter, setQuickFilter]   = useState<QuickFilter>("all");

  // Folder filter
  const TODAY_ISO = "2026-05-29";

  const folderFiltered = conversations.filter((c) => {
    switch (folder) {
      case "unread":       return c.unreadCount > 0;
      case "leads":        return c.tag === "lead";
      case "transactions": return c.tag === "transaction";
      case "referrals":    return c.tag === "referral";
      case "team":         return c.tag === "team";
      case "mortgage":     return c.tag === "mortgage";
      default:             return true;
    }
  });

  // Quick filter
  const quickFiltered = folderFiltered.filter((c) => {
    if (quickFilter === "today")       return c.lastTimestamp.startsWith(TODAY_ISO);
    if (quickFilter === "this-week")   return c.lastTimestamp >= "2026-05-25";
    if (quickFilter === "high-intent") return c.isHighIntent === true;
    return true;
  });

  // Search
  const visible = search.trim()
    ? quickFiltered.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.clientName.toLowerCase().includes(q)  ||
          c.lastMessage.toLowerCase().includes(q) ||
          (c.subject ?? "").toLowerCase().includes(q) ||
          (c.propertyAddress ?? "").toLowerCase().includes(q)
        );
      })
    : quickFiltered;

  // Sort: unread first, then by timestamp desc
  const sorted = [...visible].sort((a, b) => {
    if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
    return b.lastTimestamp.localeCompare(a.lastTimestamp);
  });

  return (
    <div className="flex flex-col h-full overflow-hidden" aria-label="Conversations">
      {/* Search */}
      <div className="px-3 py-3 border-b border-line flex-shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-8 pr-8 py-2 bg-surface-2 border border-transparent rounded-xl text-sm text-axen-dark placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-axen-dark">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex items-center gap-0 px-3 py-2 border-b border-line flex-shrink-0 overflow-x-auto">
        {QUICK_FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setQuickFilter(id)}
            className={cn(
              "px-3 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors",
              quickFilter === id
                ? "bg-axen-dark text-white"
                : "text-gray-400 hover:text-axen-dark hover:bg-surface-2"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2 px-4">
            <Search size={28} className="text-gray-200" />
            <p className="text-sm font-semibold text-gray-400">No conversations</p>
            <p className="text-xs text-gray-300">Try a different filter or search term</p>
          </div>
        ) : (
          sorted.map((c) => (
            <ConvRow
              key={c.id}
              conv={c}
              selected={selectedId === c.id}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
