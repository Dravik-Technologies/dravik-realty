"use client";

import { useEffect, useRef } from "react";
import {
  X,
  Phone,
  MessageSquare,
  Mail,
  Home,
  Bookmark,
  Eye,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Landmark,
  User,
  FileText,
  PhoneCall,
  MessageCircle,
  Calendar,
  ArrowRightLeft,
  Info,
} from "lucide-react";
import type { Lead, ActivityType } from "@/types/lead";
import { SOURCE_STYLES } from "@/types/lead";
import { cn, formatCurrency } from "@dravik/shared";
import RelativeTime from "@/components/ui/RelativeTime";

// ─── Activity icon map ────────────────────────────────────────
const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  call:          PhoneCall,
  sms:           MessageCircle,
  email:         Mail,
  note:          FileText,
  viewing:       Home,
  status_change: ArrowRightLeft,
  document:      FileText,
};

const ACTIVITY_DOT: Record<ActivityType, string> = {
  call:          "bg-blue-400",
  sms:           "bg-teal-400",
  email:         "bg-violet-400",
  note:          "bg-gray-400",
  viewing:       "bg-gold",
  status_change: "bg-emerald-400",
  document:      "bg-amber-400",
};

// ─── Pre-approval badge ───────────────────────────────────────
function PreApprovalBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ElementType; cls: string }> = {
    "Approved":    { icon: CheckCircle, cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    "In Progress": { icon: Clock,       cls: "text-blue-600 bg-blue-50 border-blue-200"          },
    "Not Started": { icon: Info,        cls: "text-gray-500 bg-gray-50 border-gray-200"           },
    "Denied":      { icon: XCircle,     cls: "text-rose-600 bg-rose-50 border-rose-200"           },
  };
  const cfg = map[status] ?? map["Not Started"];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", cfg.cls)}>
      <Icon size={11} />
      {status}
    </span>
  );
}

// ─── Detail panel ─────────────────────────────────────────────
interface LeadDetailPanelProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

export default function LeadDetailPanel({
  lead,
  open,
  onClose,
}: LeadDetailPanelProps) {
  const panelRef    = useRef<HTMLDivElement>(null);
  const closeRef    = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Lock body scroll on mobile when panel is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Focus management: save/restore focus, move initial focus to close button
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      closeRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // Close on Escape + focus trap
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!lead) return null;

  const src = SOURCE_STYLES[lead.source];
  const hasMortgage = lead.clientType === "Buyer" || lead.clientType === "Dual";

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Lead details for ${lead.name}`}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl",
          "w-full md:w-[720px]",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Panel header ───────────────────────────────────── */}
        <div className="flex-shrink-0 bg-axen-dark px-6 py-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
              style={{ background: lead.avatarColor }}
            >
              {lead.initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-white font-bold text-lg leading-tight">
                    {lead.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                      lead.clientType === "Buyer"  ? "bg-blue-500 text-white" :
                      lead.clientType === "Seller" ? "bg-amber-500 text-white" :
                                                     "bg-purple-500 text-white"
                    )}>
                      {lead.clientType === "Dual" && <Landmark size={8} className="inline mr-1" />}
                      {lead.clientType}
                    </span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", src.bg, src.text)}>
                      {lead.source}
                    </span>
                    <span className="text-[10px] font-bold text-gold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
                      Score {lead.behaviorScore}
                    </span>
                  </div>
                </div>

                <button
                  ref={closeRef}
                  aria-label="Close panel"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contact buttons */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400">{lead.phone}</span>
                <span className="text-gray-600">·</span>
                <span className="text-xs text-gray-400 truncate">{lead.email}</span>
              </div>
              <div className="flex gap-2 mt-2.5">
                {[
                  { icon: Phone,         label: "Call"  },
                  { icon: MessageSquare, label: "SMS"   },
                  { icon: Mail,          label: "Email" },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-gold hover:text-axen-dark text-white text-xs font-semibold transition-all"
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column body ─────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">

          {/* Left 60%: Activity timeline + Notes */}
          <div className="flex-[3] overflow-y-auto border-r border-line">

            {/* Activity timeline */}
            <div className="px-5 pt-5 pb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Activity Timeline
              </h3>

              <div className="relative">
                {/* Spine */}
                <div className="absolute left-[7px] top-2 bottom-4 w-px bg-line" />

                <div className="space-y-4">
                  {lead.activities.map((activity) => {
                    const Icon = ACTIVITY_ICONS[activity.type];
                    return (
                      <div key={activity.id} className="flex gap-3 relative">
                        {/* Dot */}
                        <span
                          className={cn(
                            "w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5 z-10 ring-2 ring-white",
                            ACTIVITY_DOT[activity.type]
                          )}
                        />
                        {/* Content */}
                        <div className="flex-1 pb-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Icon size={12} className="text-gray-400 flex-shrink-0" />
                              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                {activity.type.replace("_", " ")}
                              </p>
                            </div>
                            <span className="text-[10px] text-gray-400 flex-shrink-0 flex items-center gap-1">
                              <Calendar size={9} />
                              <RelativeTime dateStr={activity.timestamp} />
                            </span>
                          </div>
                          <p className="text-sm text-axen-dark mt-0.5 leading-relaxed">
                            {activity.description}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">by {activity.by}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="px-5 pb-6 border-t border-line pt-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Notes
              </h3>
              <div className="bg-surface-2 rounded-xl p-3">
                <p className="text-sm text-axen-dark leading-relaxed whitespace-pre-wrap">
                  {lead.notes || "No notes yet."}
                </p>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">
                Assigned to <span className="font-semibold text-axen-dark">{lead.assignedTo || "Unassigned"}</span>
                {" · "}
                Created <RelativeTime dateStr={lead.createdAt} />
              </p>
            </div>
          </div>

          {/* Right 40%: Property + Mortgage */}
          <div className="flex-[2] overflow-y-auto">

            {/* Property Tracking */}
            <div className="px-5 pt-5 pb-4 border-b border-line">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Property Tracking
              </h3>

              <div className="space-y-3">
                {/* Price range */}
                <div className="flex items-center justify-between py-2 px-3 bg-surface-2 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <DollarSign size={14} className="text-gold" />
                    Price Range
                  </div>
                  <span className="text-sm font-bold text-axen-dark tabular-nums">
                    {formatCurrency(lead.priceMin)} – {formatCurrency(lead.priceMax)}
                  </span>
                </div>

                {/* Saved properties */}
                <div className="flex items-center justify-between py-2 px-3 bg-surface-2 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Bookmark size={14} className="text-gold" />
                    Saved Properties
                  </div>
                  <span className="text-sm font-bold text-axen-dark">
                    {lead.savedProperties}
                  </span>
                </div>

                {/* Viewed this week */}
                <div className="flex items-center justify-between py-2 px-3 bg-surface-2 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye size={14} className="text-gold" />
                    Viewed This Week
                  </div>
                  <span className="text-sm font-bold text-axen-dark">
                    {lead.viewedThisWeek}
                  </span>
                </div>
              </div>
            </div>

            {/* Mortgage Progress */}
            <div className="px-5 pt-4 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <Landmark size={13} className="text-gold" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Mortgage Progress
                </h3>
              </div>

              {!hasMortgage ? (
                <div className="bg-surface-2 rounded-xl px-3 py-4 text-center">
                  <p className="text-xs text-gray-400">
                    Not applicable for Seller leads
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Pre-approval */}
                  <div className="flex items-center justify-between py-2 px-3 bg-surface-2 rounded-xl">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <CheckCircle size={14} className="text-gold" />
                      Pre-Approval
                    </span>
                    {lead.preApproval && (
                      <PreApprovalBadge status={lead.preApproval} />
                    )}
                  </div>

                  {/* Credit pull */}
                  <div className="flex items-center justify-between py-2 px-3 bg-surface-2 rounded-xl">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <FileText size={14} className="text-gold" />
                      Credit Pull
                    </span>
                    <span className="text-xs font-semibold text-axen-dark">
                      {lead.creditPull ?? "—"}
                    </span>
                  </div>

                  {/* Max budget */}
                  {lead.maxBudget && (
                    <div className="bg-gold-light border border-gold/30 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">
                        Max Approved Budget
                      </p>
                      <p className="text-lg font-bold text-axen-dark mt-0.5 tabular-nums">
                        {formatCurrency(lead.maxBudget)}
                      </p>
                    </div>
                  )}

                  {/* Mortgage officer */}
                  {lead.mortgageOfficer && (
                    <div className="flex items-center justify-between py-2 px-3 bg-surface-2 rounded-xl">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <User size={14} className="text-gold" />
                        Mortgage Officer
                      </span>
                      <span className="text-xs font-bold text-axen-dark">
                        {lead.mortgageOfficer}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
