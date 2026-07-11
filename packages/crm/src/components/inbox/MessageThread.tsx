"use client";

import { useEffect, useRef } from "react";
import {
  MessageSquare, Mail, Phone, Zap, Settings2,
  Plus, Activity, Link2, PhoneCall, ChevronLeft,
} from "lucide-react";
import type { Conversation, Message, Channel } from "@dravik/contracts/crm";
import MessageComposer from "./MessageComposer";
import { cn } from "@dravik/shared";

// ─── Channel badge ────────────────────────────────────────────
const CHANNEL_ICON: Record<Channel, React.ElementType> = {
  sms:      MessageSquare,
  email:    Mail,
  whatsapp: Zap,
  call:     Phone,
  system:   Settings2,
};

// ─── Message bubble (module level) ───────────────────────────
function Bubble({ msg: m }: { msg: Message }) {
  const Icon = CHANNEL_ICON[m.channel];

  if (m.role === "system") {
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-2 bg-surface-2 rounded-full px-3 py-1.5 max-w-sm">
          <Settings2 size={10} className="text-gray-400 flex-shrink-0" />
          <p className="text-[10px] text-gray-500 text-center">{m.content}</p>
          <span className="text-[9px] text-gray-400 flex-shrink-0" suppressHydrationWarning>{m.displayTime}</span>
        </div>
      </div>
    );
  }

  const isAgent = m.role === "agent";

  return (
    <div className={cn("flex items-end gap-2 max-w-[80%]", isAgent ? "ml-auto flex-row-reverse" : "")}>
      {/* Avatar */}
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0",
        isAgent ? "bg-gold" : "bg-dravik-dark"
      )}>
        {isAgent ? "C" : m.senderName.charAt(0)}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col gap-0.5", isAgent ? "items-end" : "items-start")}>
        <p className="text-[10px] text-gray-400 px-1">{m.senderName}</p>
        <div className={cn(
          "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
          isAgent
            ? "bg-dravik-dark text-white rounded-br-sm"
            : "bg-white border border-line text-dravik-dark rounded-bl-sm shadow-sm"
        )}>
          {m.content}
        </div>
        <div className="flex items-center gap-1.5 px-1">
          <Icon size={10} className={cn(isAgent ? "text-gray-400" : "text-gray-300")} />
          <span className="text-[9px] text-gray-400" suppressHydrationWarning>{m.displayTime}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-6">
      <div className="w-16 h-16 rounded-2xl bg-gold-light flex items-center justify-center">
        <MessageSquare size={28} className="text-gold" />
      </div>
      <div>
        <p className="text-lg font-bold text-dravik-dark">Select a conversation</p>
        <p className="text-sm text-gray-400 mt-1">Choose a message from the list to read and reply</p>
      </div>
    </div>
  );
}

// ─── MessageThread ────────────────────────────────────────────
interface Props {
  conversation: Conversation | null;
  onBack:       () => void;
  onSend:       (id: string, channel: Channel, text: string, subject?: string) => void;
  onCallStart:  (id: string) => void;
}

export default function MessageThread({ conversation: c, onBack, onSend, onCallStart }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const ChanIcon  = c ? CHANNEL_ICON[c.channel] : MessageSquare;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (c) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [c, c?.messages.length]);

  if (!c) {
    return (
      <div className="hidden sm:flex flex-col h-full bg-surface" aria-label="Message thread">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden" aria-label="Message thread">
      {/* Thread header */}
      <div className="flex-shrink-0 bg-white border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Mobile back button */}
          <button
            onClick={onBack}
            className="sm:hidden p-1.5 rounded-lg hover:bg-surface-2 text-gray-400 hover:text-dravik-dark transition-colors"
            aria-label="Back to conversations"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: c.clientColor }}
          >
            {c.clientInitials.slice(0, 2)}
          </div>

          {/* Client info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-dravik-dark text-sm">{c.clientName}</p>
              <ChanIcon size={13} className="text-gray-400 flex-shrink-0" />
              {c.isHighIntent && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-600">HOT LEAD</span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">
              {c.propertyAddress ?? c.subject ?? (c.clientEmail || c.clientPhone)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => onCallStart(c.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Start call — logs activity"
            >
              <PhoneCall size={12} /> Call
            </button>
            <button
              disabled
              title="Create task coming soon"
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-surface-2 text-gray-400 cursor-not-allowed opacity-50"
            >
              <Plus size={12} /> Task
            </button>
            <button
              disabled
              title="Log activity coming soon"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-surface-2 text-gray-400 cursor-not-allowed opacity-50"
            >
              <Activity size={12} /> Log
            </button>
            <button
              disabled
              title="Link to transaction coming soon"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-surface-2 text-gray-400 cursor-not-allowed opacity-50"
            >
              <Link2 size={12} /> Link
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {c.messages.map((msg) => (
          <Bubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <MessageComposer
        conversationId={c.id}
        tag={c.tag}
        onSend={onSend}
      />
    </div>
  );
}
