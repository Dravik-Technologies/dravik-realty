"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  X, User, Home, FileText, ShieldCheck, MessageSquare,
  Link2, CheckCircle2, Clock, AlertCircle, XCircle,
  Phone, Mail, Building2, TrendingUp, DollarSign, ExternalLink,
} from "lucide-react";
import type { MortgageApplication, DetailTab, DocStatus, CondStatus } from "@dravik/contracts/lending";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── Tab config ───────────────────────────────────────────────
const TABS: { id: DetailTab; label: string; icon: React.ElementType }[] = [
  { id: "overview",        label: "Overview",        icon: User        },
  { id: "documents",       label: "Documents",       icon: FileText    },
  { id: "underwriting",    label: "Underwriting",    icon: ShieldCheck },
  { id: "conditions",      label: "Conditions",      icon: CheckCircle2},
  { id: "communications",  label: "Messages",        icon: MessageSquare},
  { id: "real-estate",     label: "Real Estate",     icon: Link2       },
];

// ─── Document status icons ────────────────────────────────────
const DOC_STATUS: Record<DocStatus, { icon: React.ElementType; cls: string; label: string }> = {
  approved:  { icon: CheckCircle2, cls: "text-emerald-500", label: "Approved"  },
  received:  { icon: Clock,        cls: "text-blue-500",    label: "Received"  },
  pending:   { icon: AlertCircle,  cls: "text-amber-400",   label: "Pending"   },
  missing:   { icon: XCircle,      cls: "text-rose-400",    label: "Missing"   },
};

// ─── Condition status ─────────────────────────────────────────
const COND_STATUS: Record<CondStatus, { cls: string; dot: string; label: string }> = {
  satisfied: { cls: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400", label: "Satisfied" },
  open:      { cls: "text-amber-700 bg-amber-50 border-amber-200",       dot: "bg-amber-400",   label: "Open"      },
  waived:    { cls: "text-gray-500 bg-gray-50 border-gray-200",          dot: "bg-gray-300",    label: "Waived"    },
};

// ─── Stage labels ─────────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  "pre-qual":     "Pre-Qual Submitted",
  application:    "Application Complete",
  underwriting:   "Underwriting",
  approved:       "Approved / Conditional",
  closing:        "Closing / Funded",
  declined:       "Declined",
};

// ─── Stat row ─────────────────────────────────────────────────
function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={cn("text-xs font-bold", accent ? "text-gold" : "text-axen-dark")}>
        {value}
      </span>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────
function OverviewTab({ app }: { app: MortgageApplication }) {
  const PITI = formatCurrency(app.piti);
  return (
    <div className="space-y-5">
      {/* Client */}
      <section>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Client</p>
        <div className="bg-surface-2 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: app.clientColor }}
            >
              {app.clientInitials}
            </div>
            <div>
              <p className="font-bold text-axen-dark text-sm">{app.clientName}</p>
              <p className="text-xs text-gray-400">{STAGE_LABELS[app.stage]}</p>
            </div>
          </div>
          <div className="pt-1 space-y-1.5">
            <a href={`tel:${app.clientPhone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-axen-dark">
              <Phone size={12} className="text-gray-300" /> {app.clientPhone}
            </a>
            <a href={`mailto:${app.clientEmail}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-axen-dark">
              <Mail size={12} className="text-gray-300" /> {app.clientEmail}
            </a>
          </div>
        </div>
      </section>

      {/* Property */}
      <section>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Property</p>
        <div className="bg-surface-2 rounded-xl p-4">
          <div className="flex items-start gap-2 mb-3">
            <Home size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-axen-dark">{app.propertyAddress}</p>
              <p className="text-xs text-gray-400">{app.city}</p>
            </div>
          </div>
          <StatRow label="Purchase Price"  value={formatCurrency(app.purchasePrice)} />
          <StatRow label="Down Payment"    value={`${formatCurrency(app.downPayment)} (${Math.round(app.downPayment / app.purchasePrice * 100)}%)`} />
          <StatRow label="Loan Amount"     value={formatCurrency(app.loanAmount)} accent />
        </div>
      </section>

      {/* Loan summary */}
      <section>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Loan Summary</p>
        <div className="bg-surface-2 rounded-xl p-4">
          <StatRow label="Loan Type"         value={app.loanType} />
          <StatRow label="Term"              value={`${app.termYears}-Year Fixed`} />
          <StatRow label="Interest Rate"     value={app.interestRate > 0 ? `${app.interestRate}%` : "—"} accent />
          <StatRow label="Monthly P&I"       value={app.monthlyPayment > 0 ? formatCurrency(app.monthlyPayment) : "—"} />
          <StatRow label="Est. PITI"         value={app.piti > 0 ? PITI : "—"} accent />
          <StatRow label="Assigned Officer"  value={app.assignedOfficer} />
          <StatRow label="Submitted"         value={app.submittedDate} />
          <StatRow label="Closing Date"      value={app.closingDate} />
        </div>
      </section>

      {/* Notes */}
      {app.notes && (
        <section>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Officer Notes</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-900 leading-relaxed">{app.notes}</p>
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Documents tab ────────────────────────────────────────────
function DocumentsTab({ app }: { app: MortgageApplication }) {
  const counts = app.documents.reduce(
    (acc, d) => { acc[d.status] = (acc[d.status] ?? 0) + 1; return acc; },
    {} as Record<DocStatus, number>
  );
  return (
    <div className="space-y-4">
      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        {(["approved","received","pending","missing"] as DocStatus[]).map((s) =>
          counts[s] ? (
            <span key={s} className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-full border",
              DOC_STATUS[s].cls,
              s === "approved" ? "bg-emerald-50 border-emerald-200"
              : s === "received" ? "bg-blue-50 border-blue-200"
              : s === "pending"  ? "bg-amber-50 border-amber-200"
              : "bg-rose-50 border-rose-200"
            )}>
              {counts[s]} {DOC_STATUS[s].label}
            </span>
          ) : null
        )}
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {app.documents.map((doc) => {
          const cfg = DOC_STATUS[doc.status];
          const Icon = cfg.icon;
          return (
            <div key={doc.id} className="flex items-center gap-3 bg-white border border-line rounded-xl px-4 py-3">
              <Icon size={16} className={cn("flex-shrink-0", cfg.cls)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-axen-dark font-medium truncate">{doc.name}</p>
                {doc.receivedDate && (
                  <p className="text-[10px] text-gray-400">Received {doc.receivedDate}</p>
                )}
              </div>
              <span className={cn("text-[10px] font-semibold", cfg.cls)}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Underwriting tab ─────────────────────────────────────────
function UnderwritingTab({ app }: { app: MortgageApplication }) {
  const monthlyTax      = app.piti - app.monthlyPayment > 0 ? app.piti - app.monthlyPayment : 480;
  const totalInterest   = app.monthlyPayment > 0
    ? Math.round(app.monthlyPayment * app.termYears * 12 - app.loanAmount)
    : 0;

  const creditCls =
    app.creditScore >= 740 ? "text-emerald-600" : app.creditScore >= 680 ? "text-amber-600" : "text-rose-600";
  const dtiCls    =
    app.dti < 36 ? "text-emerald-600" : app.dti < 44 ? "text-amber-600" : "text-rose-600";
  const ltvCls    =
    app.ltv <= 80 ? "text-emerald-600" : app.ltv <= 90 ? "text-amber-600" : "text-rose-600";

  return (
    <div className="space-y-5">
      {/* Risk indicators */}
      <section>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Risk Indicators</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Credit Score", value: String(app.creditScore), cls: creditCls, sub: app.creditScore >= 740 ? "Excellent" : app.creditScore >= 680 ? "Good" : "Fair" },
            { label: "DTI Ratio",    value: `${app.dti}%`,           cls: dtiCls,    sub: app.dti < 36 ? "Strong" : app.dti < 44 ? "Acceptable" : "High" },
            { label: "LTV",          value: `${app.ltv}%`,           cls: ltvCls,    sub: app.ltv <= 80 ? "No PMI" : `PMI Req.` },
          ].map((item) => (
            <div key={item.label} className="bg-surface-2 rounded-xl p-3 text-center">
              <p className={cn("text-xl font-bold tabular-nums", item.cls)}>{item.value}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">{item.label}</p>
              <p className={cn("text-[9px] font-semibold mt-1", item.cls)}>{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Loan details */}
      <section>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Loan Details</p>
        <div className="bg-surface-2 rounded-xl p-4">
          <StatRow label="Interest Rate"    value={app.interestRate > 0 ? `${app.interestRate}%` : "—"} accent />
          <StatRow label="Term"             value={`${app.termYears} years (${app.termYears * 12} payments)`} />
          <StatRow label="Loan Amount"      value={formatCurrency(app.loanAmount)} />
          <StatRow label="Monthly P&I"      value={app.monthlyPayment > 0 ? formatCurrency(app.monthlyPayment) : "—"} />
          <StatRow label="Est. Tax & Ins."  value={formatCurrency(monthlyTax)} />
          <StatRow label="Total PITI"       value={app.piti > 0 ? formatCurrency(app.piti) : "—"} accent />
          <StatRow label="Total Interest"   value={totalInterest > 0 ? formatCurrency(totalInterest) : "—"} />
        </div>
      </section>

      {/* Payment breakdown bar */}
      {app.piti > 0 && (
        <section>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Monthly Payment Breakdown</p>
          <div className="bg-surface-2 rounded-xl p-4 space-y-3">
            {[
              { label: "Principal + Interest", amount: app.monthlyPayment, color: "#D4AF37" },
              { label: "Taxes",                amount: Math.round(monthlyTax * 0.7),    color: "#6366F1" },
              { label: "Insurance",            amount: Math.round(monthlyTax * 0.3),    color: "#10B981" },
            ].map((item) => {
              const pct = Math.round((item.amount / app.piti) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-gray-500">{item.label}</span>
                    <span className="text-[11px] font-bold text-axen-dark tabular-nums">
                      {formatCurrency(item.amount)} <span className="text-gray-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Conditions tab ───────────────────────────────────────────
function ConditionsTab({ app }: { app: MortgageApplication }) {
  if (!app.conditions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <CheckCircle2 size={32} className="text-emerald-400" />
        <p className="text-sm font-semibold text-axen-dark">No conditions</p>
        <p className="text-xs text-gray-400">This application has no outstanding conditions.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {app.conditions.map((cond) => {
        const cfg = COND_STATUS[cond.status];
        return (
          <div key={cond.id} className="bg-white border border-line rounded-xl px-4 py-3.5 flex items-start gap-3">
            <span className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", cfg.dot)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-axen-dark leading-snug">{cond.description}</p>
              <p className="text-[10px] text-gray-400 mt-1">Due {cond.dueDate}</p>
            </div>
            <span className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-full flex-shrink-0", cfg.cls)}>
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Communications tab ───────────────────────────────────────
function CommunicationsTab({ app }: { app: MortgageApplication }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-gold-light flex items-center justify-center">
        <MessageSquare size={24} className="text-gold" />
      </div>
      <div>
        <p className="font-bold text-axen-dark text-sm">{app.clientName}</p>
        <p className="text-xs text-gray-400 mt-1">
          All messages with this client are managed in the Unified Inbox.
        </p>
      </div>
      <Link
        href="/inbox"
        className="flex items-center gap-2 px-4 py-2 bg-axen-dark text-white rounded-xl text-xs font-bold hover:bg-gold hover:text-axen-dark transition-colors"
      >
        <ExternalLink size={12} /> Open in Inbox
      </Link>
      <div className="w-full bg-surface-2 rounded-xl p-4 text-left">
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Contact Info</p>
        <div className="space-y-1.5">
          <a href={`tel:${app.clientPhone}`} className="flex items-center gap-2 text-xs text-axen-dark">
            <Phone size={12} className="text-gray-400" /> {app.clientPhone}
          </a>
          <a href={`mailto:${app.clientEmail}`} className="flex items-center gap-2 text-xs text-axen-dark">
            <Mail size={12} className="text-gray-400" /> {app.clientEmail}
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Real Estate tab ──────────────────────────────────────────
function RealEstateTab({ app }: { app: MortgageApplication }) {
  return (
    <div className="space-y-4">
      {app.linkedLeadId ? (
        <div className="bg-white border border-line rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-axen-dark">Linked Lead</p>
              <p className="text-[10px] text-gray-400">{app.linkedLeadId}</p>
            </div>
          </div>
          <Link
            href="/leads"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <ExternalLink size={11} /> View in Lead Engine
          </Link>
        </div>
      ) : null}

      {app.linkedTransId ? (
        <div className="bg-white border border-line rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gold-light flex items-center justify-center">
              <DollarSign size={14} className="text-gold" />
            </div>
            <div>
              <p className="text-xs font-bold text-axen-dark">Linked Transaction</p>
              <p className="text-[10px] text-gray-400">{app.linkedTransId}</p>
            </div>
          </div>
          <Link
            href="/transactions"
            className="flex items-center gap-1.5 text-xs font-semibold text-gold-dark hover:text-gold"
          >
            <ExternalLink size={11} /> View in Transactions
          </Link>
        </div>
      ) : null}

      {!app.linkedLeadId && !app.linkedTransId && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center">
            <Building2 size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-axen-dark">No links yet</p>
          <p className="text-xs text-gray-400 max-w-[220px]">
            Link this application to a lead or transaction from those modules.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── MortgageDetailPanel ──────────────────────────────────────
interface Props {
  app:     MortgageApplication | null;
  open:    boolean;
  onClose: () => void;
}

export default function MortgageDetailPanel({ app, open, onClose }: Props) {
  const [tab,       setTab]       = useState<DetailTab>("overview");
  const [trackedId, setTrackedId] = useState<string | null>(null);
  const panelRef       = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Reset tab when application changes
  const appId = app?.id ?? null;
  if (appId !== trackedId) {
    setTrackedId(appId);
    setTab("overview");
  }

  const handleClose = useCallback(() => onClose(), [onClose]);

  // Focus management
  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement;
      const id = requestAnimationFrame(() => {
        const first = panelRef.current?.querySelector<HTMLElement>(
          "button:not([disabled]), a, [tabindex]:not([tabindex='-1'])"
        );
        first?.focus();
      });
      return () => cancelAnimationFrame(id);
    } else {
      returnFocusRef.current?.focus();
    }
  }, [open]);

  // Escape + Tab trap
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a, input, [tabindex]:not([tabindex='-1'])"
        )
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  return (
    <>
      {/* Backdrop (mobile only) */}
      {open && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-panel-title"
        style={{ top: "4rem" }}
        className={cn(
          "fixed bottom-0 right-0 z-50 w-full sm:w-[500px] bg-white border-l border-line shadow-2xl flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {!app ? null : (
          <>
            {/* Panel header */}
            <div className="flex-shrink-0 border-b border-line px-5 py-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: app.clientColor }}
                >
                  {app.clientInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p id="detail-panel-title" className="font-bold text-axen-dark text-sm leading-tight">
                    {app.clientName}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {app.propertyAddress} · {formatCurrency(app.loanAmount)}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Close panel"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-axen-dark hover:bg-surface-2 transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tab bar */}
              <div className="flex gap-0.5 mt-4 overflow-x-auto">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors",
                        tab === t.id
                          ? "bg-axen-dark text-white"
                          : "text-gray-400 hover:text-axen-dark hover:bg-surface-2"
                      )}
                    >
                      <Icon size={11} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div hidden={tab !== "overview"}>
                <OverviewTab app={app} />
              </div>
              <div hidden={tab !== "documents"}>
                <DocumentsTab app={app} />
              </div>
              <div hidden={tab !== "underwriting"}>
                <UnderwritingTab app={app} />
              </div>
              <div hidden={tab !== "conditions"}>
                <ConditionsTab app={app} />
              </div>
              <div hidden={tab !== "communications"}>
                <CommunicationsTab app={app} />
              </div>
              <div hidden={tab !== "real-estate"}>
                <RealEstateTab app={app} />
              </div>
            </div>

            {/* Panel footer */}
            {app.stage === "closing" && (
              <div className="flex-shrink-0 border-t border-line px-5 py-4">
                <button
                  disabled
                  title="Funding confirmation coming soon"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold/40 text-axen-dark/40 rounded-xl text-sm font-bold cursor-not-allowed"
                >
                  <CheckCircle2 size={16} /> Mark as Funded
                </button>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                  Funding confirmation — coming soon
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
