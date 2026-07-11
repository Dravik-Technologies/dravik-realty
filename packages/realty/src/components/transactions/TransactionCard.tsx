"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, User, Tag } from "lucide-react";
import type { Transaction, PipelineStage } from "@dravik/contracts/realty";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── Stage accent color map ───────────────────────────────────
export const STAGE_COLOR: Record<PipelineStage, string> = {
  "Under Contract":    "#3B82F6",
  "Inspections":       "#F59E0B",
  "Financing Approved":"#10B981",
  "Appraisal / Title": "#8B5CF6",
  "Closing / Funded":  "#D4AF37",
};

// ─── Urgency from precomputed daysUntilClose ──────────────────
function urgencyClass(days: number) {
  if (days <= 5)  return "text-rose-600 bg-rose-50 border-rose-200";
  if (days <= 14) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-gray-500 bg-surface-2 border-line";
}

interface TransactionCardProps {
  transaction: Transaction;
  selected: boolean;
  onSelect: (t: Transaction) => void;
  overlay?: boolean;
}

export default function TransactionCard({ transaction: t, selected, onSelect, overlay }: TransactionCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: t.id });
  const stageColor = STAGE_COLOR[t.stage];

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "bg-white rounded-xl border cursor-pointer select-none transition-all",
        "hover:shadow-md hover:border-gold/30",
        selected   ? "border-gold ring-2 ring-gold/20 shadow-md" : "border-line",
        isDragging ? "opacity-40" : "",
        overlay    ? "shadow-2xl rotate-1 cursor-grabbing" : ""
      )}
      onClick={() => onSelect(t)}
      {...attributes}
      {...listeners}
    >
      {/* Stage accent bar */}
      <div className="h-0.5 rounded-t-xl" style={{ background: stageColor }} />

      <div className="p-3 space-y-2.5">
        {/* Header: thumbnail + address */}
        <div className="flex gap-2.5 items-start">
          <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.heroImage} alt={t.address} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-dravik-dark leading-tight truncate">{t.address}</p>
            <p className="text-[10px] text-gray-400 truncate">{t.city}, {t.state}</p>
          </div>
        </div>

        {/* Client + type */}
        <div className="flex items-center gap-1.5">
          <User size={9} className="text-gray-400 flex-shrink-0" />
          <span className="text-[10px] text-gray-500 truncate flex-1">{t.client.name}</span>
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0",
            t.type === "Buy"  ? "bg-blue-50 text-blue-600" :
            t.type === "Sell" ? "bg-emerald-50 text-emerald-600" :
            "bg-purple-50 text-purple-600"
          )}>
            {t.type}
          </span>
        </div>

        {/* Price */}
        <p className="text-sm font-bold text-gold leading-none">
          {formatCurrency(t.contractPrice)}
        </p>

        {/* Closing date */}
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-semibold rounded-lg px-2 py-1 border w-fit",
          urgencyClass(t.daysUntilClose)
        )}>
          <Calendar size={9} />
          {t.closingDate} · {t.daysUntilClose}d
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[9px] text-gray-400">Progress</span>
            <span className="text-[9px] font-bold text-gray-500">{t.progress}%</span>
          </div>
          <div className="h-1 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${t.progress}%`, background: stageColor }}
            />
          </div>
        </div>

        {/* Referral tag */}
        {t.commission.hasReferral && (
          <div className="flex items-center gap-1 text-[9px] font-semibold text-gold bg-gold-light rounded-full px-2 py-0.5 w-fit">
            <Tag size={8} /> Referral
          </div>
        )}
      </div>
    </div>
  );
}
