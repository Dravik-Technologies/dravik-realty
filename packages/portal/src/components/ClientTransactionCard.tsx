"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronUp, Calendar, CheckCircle2,
  Clock, FileText, ArrowRight,
} from "lucide-react";
import type { ClientTransaction } from "@dravik/contracts/portal";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

const STAGE_COLOR: Record<string, string> = {
  "Under Contract":    "#3B82F6",
  "Inspections":       "#F59E0B",
  "Financing Approved":"#10B981",
  "Appraisal / Title": "#8B5CF6",
  "Closing / Funded":  "#D4AF37",
  "Closed":            "#6B7280",
};

const DOC_STATUS_CONFIG = {
  signed:  { label: "Signed",  cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  pending: { label: "Pending", cls: "text-amber-600  bg-amber-50  border-amber-200"    },
  needed:  { label: "Needed",  cls: "text-rose-600   bg-rose-50   border-rose-200"     },
};

// ─── Expanded detail (module level) ──────────────────────────
function TxDetail({ t }: { t: ClientTransaction }) {
  const color = STAGE_COLOR[t.stage] ?? "#9CA3AF";
  const signedCount  = t.documents.filter((d) => d.status === "signed").length;
  const pendingCount = t.documents.filter((d) => d.status === "pending").length;
  const neededCount  = t.documents.filter((d) => d.status === "needed").length;

  return (
    <div className="border-t border-line mt-0 pt-4 space-y-4">
      {/* Stage progress */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-semibold" style={{ color }}>{t.stage}</span>
          <span className="font-bold text-axen-dark">{t.progress}%</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${t.progress}%`, background: color }} />
        </div>
      </div>

      {/* Next step */}
      <div className="flex gap-2.5 p-3 bg-gold-light rounded-xl border border-gold/20">
        <ArrowRight size={14} className="text-gold mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[10px] font-bold text-gold-dark uppercase tracking-wider mb-0.5">Next Step</p>
          <p className="text-xs text-axen-dark leading-snug">{t.nextStep}</p>
        </div>
      </div>

      {/* Key dates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface rounded-xl p-3">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Contract Date</p>
          <div className="flex items-center gap-1.5">
            <Calendar size={11} className="text-gold" />
            <span className="text-xs font-bold text-axen-dark">{t.contractDate}</span>
          </div>
        </div>
        <div className="bg-surface rounded-xl p-3">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Closing Date</p>
          <div className="flex items-center gap-1.5">
            {t.daysUntilClose > 0
              ? <Clock size={11} className={t.daysUntilClose <= 14 ? "text-amber-500" : "text-gold"} />
              : <CheckCircle2 size={11} className="text-emerald-500" />}
            <span className="text-xs font-bold text-axen-dark">
              {t.closingDate}
              {t.daysUntilClose > 0 && <span className="text-[10px] text-gray-400 font-normal ml-1">({t.daysUntilClose}d)</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Document summary */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileText size={10} /> Documents ({t.documents.length})
        </p>
        <div className="flex gap-2 mb-3">
          {[
            { label: `${signedCount} Signed`,  cls: "text-emerald-600 bg-emerald-50" },
            { label: `${pendingCount} Pending`, cls: "text-amber-600 bg-amber-50"   },
            { label: `${neededCount} Needed`,   cls: "text-rose-600 bg-rose-50"     },
          ].map(({ label, cls }) => (
            <span key={label} className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", cls)}>{label}</span>
          ))}
        </div>
        <div className="space-y-1.5">
          {t.documents.map((d) => {
            const cfg = DOC_STATUS_CONFIG[d.status];
            return (
              <div key={d.id} className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-lg border border-line">
                <FileText size={11} className="text-gray-400 flex-shrink-0" />
                <span className="flex-1 text-xs text-axen-dark truncate">{d.name}</span>
                <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", cfg.cls)}>
                  {cfg.label}
                </span>
                {d.dueDate && d.status !== "signed" && (
                  <span className="text-[9px] text-gray-400">Due {d.dueDate}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────
interface Props {
  transaction: ClientTransaction;
}

export default function ClientTransactionCard({ transaction: t }: Props) {
  const [expanded, setExpanded] = useState(false);
  const color = STAGE_COLOR[t.stage] ?? "#9CA3AF";

  return (
    <div className={cn(
      "bg-white rounded-2xl border transition-all duration-200",
      expanded ? "border-gold/30 shadow-md" : "border-line hover:border-gold/20 hover:shadow-sm"
    )}>
      {/* Stage accent */}
      <div className="h-0.5 rounded-t-2xl" style={{ background: color }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex gap-3 items-start">
          <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.heroImage} alt={t.address} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-axen-dark truncate">{t.address}</p>
                <p className="text-xs text-gray-400">{t.city}, {t.state}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-base font-bold text-gold">{formatCurrency(t.contractPrice)}</p>
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                  t.type === "Buy"  ? "bg-blue-50 text-blue-600"    :
                  t.type === "Sell" ? "bg-emerald-50 text-emerald-600" :
                                     "bg-purple-50 text-purple-600"
                )}>
                  {t.type === "Dual" ? "Dual Agency" : `${t.type}er`}
                </span>
              </div>
            </div>

            {/* Stage + status row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: color }}>
                {t.stage}
              </span>
              {t.status === "Closed" && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={9} /> Closed
                </span>
              )}
              {t.daysUntilClose > 0 && (
                <span className={cn(
                  "text-[10px] font-semibold",
                  t.daysUntilClose <= 14 ? "text-amber-500" : "text-gray-400"
                )}>
                  {t.daysUntilClose}d to close
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar (compact) */}
        {t.status === "Active" && (
          <div className="mt-3">
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${t.progress}%`, background: color }} />
            </div>
          </div>
        )}

        {/* Toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-gold transition-colors py-1"
        >
          {expanded ? <><ChevronUp size={13} /> Less detail</> : <><ChevronDown size={13} /> View details</>}
        </button>

        {expanded && <TxDetail t={t} />}
      </div>
    </div>
  );
}
