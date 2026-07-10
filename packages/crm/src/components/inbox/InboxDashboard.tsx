"use client";

import { useState, useCallback } from "react";
import { Pencil } from "lucide-react";
import type { Conversation, InboxFolder, Channel } from "@dravik/contracts/crm";
import { CONVERSATIONS } from "../../data/communications";
import InboxSidebar     from "./InboxSidebar";
import ConversationList from "./ConversationList";
import MessageThread    from "./MessageThread";
import { cn } from "@dravik/shared";

export default function InboxDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [folder,        setFolder]        = useState<InboxFolder>("all");
  const [showThread,    setShowThread]    = useState(false); // mobile: true = show thread

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  // ── Select conversation ────────────────────────────────────
  const handleSelect = useCallback((conv: Conversation) => {
    setSelectedId(conv.id);
    setShowThread(true);
    // Mark all messages in this conversation as read
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conv.id
          ? {
              ...c,
              unreadCount: 0,
              messages: c.messages.map((m) => ({ ...m, read: true })),
            }
          : c
      )
    );
  }, []);

  // ── Send message ───────────────────────────────────────────
  const handleSend = useCallback((convId: string, channel: Channel, text: string, subject?: string) => {
    const now = new Date();
    const displayTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const newMsg = {
          id:          `m-${Date.now()}`,
          role:        "agent"  as const,
          channel,
          senderName:  "Chris Macabugao",
          subject,
          content:     text,
          timestamp:   now.toISOString(),
          displayTime,
          read:        true,
        };
        return {
          ...c,
          messages:      [...c.messages, newMsg],
          lastMessage:   text,
          lastTimestamp: newMsg.timestamp,
          displayTime,
        };
      })
    );
  }, []);

  // ── Call integration ───────────────────────────────────────
  const handleCallStart = useCallback((convId: string) => {
    const now = new Date();
    const displayTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const content = `Call started by Chris Macabugao — activity logged at ${displayTime}`;
        const callLog = {
          id:          `call-${Date.now()}`,
          role:        "system" as const,
          channel:     "call"   as const,
          senderName:  "Dravik Realty",
          content,
          timestamp:   now.toISOString(),
          displayTime,
          read:        true,
        };
        return {
          ...c,
          messages:      [...c.messages, callLog],
          lastMessage:   content,
          lastTimestamp: callLog.timestamp,
          displayTime,
        };
      })
    );
  }, []);

  return (
    <div
      className="flex overflow-hidden bg-surface"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* ── Left folder sidebar (desktop only) ───────────────── */}
      <div className="hidden lg:flex flex-col w-52 flex-shrink-0 bg-white border-r border-line overflow-hidden">
        <InboxSidebar
          conversations={conversations}
          active={folder}
          onSelect={(f) => { setFolder(f); setSelectedId(null); setShowThread(false); }}
        />
      </div>

      {/* ── Center conversation list ──────────────────────────── */}
      <div
        className={cn(
          "flex flex-col bg-white border-r border-line overflow-hidden",
          "w-full sm:w-72 lg:w-80 flex-shrink-0",
          // Mobile: hide list when thread is visible
          showThread ? "hidden sm:flex" : "flex"
        )}
      >
        {/* Mobile folder selector */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-line bg-surface-2 flex-shrink-0">
          {(["all","unread","leads","transactions","referrals","team","mortgage"] as InboxFolder[]).map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold rounded-lg capitalize whitespace-nowrap transition-colors",
                folder === f ? "bg-dravik-dark text-white" : "text-gray-400 hover:text-dravik-dark"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <ConversationList
          conversations={conversations}
          folder={folder}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </div>

      {/* ── Right message thread ──────────────────────────────── */}
      <div
        className={cn(
          "flex-1 min-w-0 overflow-hidden",
          // Mobile: show thread only when a conversation is selected
          showThread ? "flex flex-col" : "hidden sm:flex flex-col"
        )}
      >
        <MessageThread
          conversation={selected}
          onBack={() => setShowThread(false)}
          onSend={handleSend}
          onCallStart={handleCallStart}
        />
      </div>

      {/* ── Floating compose button ───────────────────────────── */}
      <button
        disabled
        title="New message coming soon"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gold text-dravik-dark shadow-lg flex items-center justify-center hover:bg-gold-dark transition-colors opacity-70 cursor-not-allowed z-20"
        aria-label="New message"
      >
        <Pencil size={18} />
      </button>
    </div>
  );
}
