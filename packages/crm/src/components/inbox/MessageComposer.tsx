"use client";

import { useState } from "react";
import {
  MessageSquare, Mail, Paperclip, Sparkles, Send, ChevronDown, ChevronUp,
} from "lucide-react";
import type { Channel, ConversationTag } from "@/types/communication";
import { AI_SUGGESTIONS } from "@/data/communications";
import { cn } from "@dravik/shared";

// ─── Quick-reply templates ────────────────────────────────────
const TEMPLATES: Record<ConversationTag | "default", { label: string; text: string }[]> = {
  lead: [
    { label: "Schedule Showing",  text: "Would you like to schedule a showing this week? I have availability Tuesday and Thursday." },
    { label: "Send Listings",     text: "I'd love to send you a curated list of properties that match your criteria. Can I get your email?" },
    { label: "Offer Consultation",text: "Happy to walk you through the offer process. When's a good time to connect?" },
  ],
  transaction: [
    { label: "On Track",    text: "Just checking in — everything is on track. Let me know if you have any questions before closing." },
    { label: "Request Docs",text: "I need the signed addendum and updated insurance binder before we can proceed. Can you send those over?" },
    { label: "Closing Date",text: "We're confirmed for closing. Please bring your photo ID and certified funds. I'll send the full checklist." },
  ],
  referral: [
    { label: "Acknowledge", text: "Thank you for the referral! I've reached out to your contact and we're scheduling a consultation." },
    { label: "Send Agreement",text: "Happy to work together. I'll send the referral agreement over — standard 25% fee." },
  ],
  team: [
    { label: "Acknowledged",   text: "Got it — I'll take care of this today." },
    { label: "Will Update",    text: "Thanks for the heads up. I'll have an update for you by EOD." },
  ],
  mortgage: [
    { label: "Rate Quote",   text: "I've prepared a personalized rate quote based on your profile. Can we schedule a call this week to review?" },
    { label: "Pre-Qual Docs",text: "To get started on pre-qualification, I'll need: last 2 pay stubs, last 2 bank statements, and a copy of your ID." },
  ],
  default: [
    { label: "Follow Up",    text: "Just following up on my previous message. Let me know if you have any questions!" },
    { label: "Thank You",    text: "Thank you for your message. I'll review this and get back to you shortly." },
  ],
};

// ─── MessageComposer ──────────────────────────────────────────
interface Props {
  conversationId:  string;
  tag:             ConversationTag;
  onSend:          (conversationId: string, channel: Channel, text: string, subject?: string) => void;
}

export default function MessageComposer({ conversationId, tag, onSend }: Props) {
  const [channel, setChannel]         = useState<Extract<Channel, "sms" | "email">>("sms");
  const [text, setText]               = useState("");
  const [subject, setSubject]         = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAI, setShowAI]           = useState(false);
  const [aiLoading, setAiLoading]     = useState(false);

  const suggestions = AI_SUGGESTIONS[tag] ?? AI_SUGGESTIONS["lead"];
  const templates   = TEMPLATES[tag] ?? TEMPLATES["default"];

  const charLimit  = channel === "sms" ? 160 : null;
  const charCount  = text.length;
  const overLimit  = charLimit !== null && charCount > charLimit;

  function handleSend() {
    if (!text.trim() || overLimit) return;
    onSend(conversationId, channel, text.trim(), channel === "email" ? subject.trim() || undefined : undefined);
    setText("");
    setSubject("");
    setShowTemplates(false);
    setShowAI(false);
  }

  function handleAI() {
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      setShowAI(true);
    }, 600);
  }

  function insertTemplate(t: string) {
    setText(t);
    setShowTemplates(false);
  }

  function insertSuggestion(s: string) {
    setText(s);
    setShowAI(false);
  }

  return (
    <div className="border-t border-line bg-white flex-shrink-0">
      {/* AI suggestions */}
      {showAI && (
        <div className="px-4 py-3 border-b border-line bg-surface">
          <p className="text-[10px] font-bold text-gold uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Sparkles size={10} /> AI Smart Reply Suggestions
          </p>
          <div className="space-y-1.5">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => insertSuggestion(s)}
                className="w-full text-left text-xs text-axen-dark bg-white rounded-xl border border-line px-3 py-2.5 hover:border-gold/40 hover:bg-gold-light transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates */}
      {showTemplates && (
        <div className="px-4 py-3 border-b border-line bg-surface">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Quick Templates</p>
          <div className="flex flex-wrap gap-1.5">
            {templates.map((t) => (
              <button
                key={t.label}
                onClick={() => insertTemplate(t.text)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-line text-gray-600 hover:border-gold/40 hover:text-gold transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pt-3 pb-4 space-y-2">
        {/* Channel toggle + email subject */}
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-2 rounded-lg p-0.5">
            {(["sms", "email"] as const).map((ch) => {
              const Icon = ch === "sms" ? MessageSquare : Mail;
              return (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                    channel === ch
                      ? "bg-white text-axen-dark shadow-sm"
                      : "text-gray-400 hover:text-axen-dark"
                  )}
                >
                  <Icon size={12} className={channel === ch ? "text-gold" : ""} />
                  {ch === "sms" ? "SMS" : "Email"}
                </button>
              );
            })}
          </div>

          {channel === "email" && (
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject…"
              className="flex-1 px-3 py-1.5 text-sm bg-surface border border-line rounded-lg text-axen-dark placeholder:text-gray-300 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
            />
          )}
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
          }}
          placeholder={channel === "sms" ? "Type a text message… (Cmd+Enter to send)" : "Compose an email…"}
          rows={3}
          className={cn(
            "w-full px-3 py-2.5 text-sm bg-surface border rounded-xl text-axen-dark placeholder:text-gray-300 resize-none focus:outline-none focus:ring-2 transition",
            overLimit
              ? "border-rose-300 focus:ring-rose-200 focus:border-rose-400"
              : "border-line focus:border-gold focus:ring-gold/20"
          )}
        />

        {/* Footer actions */}
        <div className="flex items-center gap-2">
          {/* Templates toggle */}
          <button
            onClick={() => { setShowTemplates((v) => !v); setShowAI(false); }}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-colors",
              showTemplates
                ? "bg-gold-light text-gold"
                : "bg-surface-2 text-gray-500 hover:text-axen-dark"
            )}
          >
            Templates {showTemplates ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          {/* AI Smart Reply */}
          <button
            onClick={handleAI}
            disabled={aiLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-surface-2 text-gray-500 hover:text-gold hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            <Sparkles size={11} />
            {aiLoading ? "Thinking…" : "AI Suggest"}
          </button>

          {/* Attachment (mock) */}
          <button
            disabled
            title="Attachments coming soon"
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-surface-2 text-gray-400 cursor-not-allowed opacity-50"
          >
            <Paperclip size={11} /> Attach
          </button>

          {/* Char counter (SMS only) */}
          {charLimit && text.length > 0 && (
            <span className={cn("text-[10px] ml-auto", overLimit ? "text-rose-500 font-bold" : "text-gray-400")}>
              {charCount}/{charLimit}
            </span>
          )}

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!text.trim() || overLimit}
            className={cn(
              "ml-auto flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl transition-colors",
              text.trim() && !overLimit
                ? "bg-gold text-axen-dark hover:bg-gold-dark"
                : "bg-surface-2 text-gray-300 cursor-not-allowed"
            )}
          >
            <Send size={12} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
