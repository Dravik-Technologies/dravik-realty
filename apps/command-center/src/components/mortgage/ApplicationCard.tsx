"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS }         from "@dnd-kit/utilities";
import type { MortgageApplication } from "@/types/mortgage";
import { cn, formatCurrency } from "@/lib/utils";

// ─── Loan type badge ──────────────────────────────────────────
const LOAN_TYPE_COLOR: Record<string, string> = {
  Conventional: "bg-blue-50 text-blue-700 border-blue-200",
  FHA:          "bg-violet-50 text-violet-700 border-violet-200",
  VA:           "bg-emerald-50 text-emerald-700 border-emerald-200",
  Jumbo:        "bg-gold-light text-gold-dark border-gold/30",
  USDA:         "bg-lime-50 text-lime-700 border-lime-200",
};

// ─── Credit score badge ───────────────────────────────────────
function CreditBadge({ score }: { score: number }) {
  const cls =
    score >= 740 ? "bg-emerald-50 text-emerald-700"
    : score >= 680 ? "bg-amber-50 text-amber-700"
    : "bg-rose-50 text-rose-700";
  return (
    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums", cls)}>
      {score}
    </span>
  );
}

// ─── DTI badge ───────────────────────────────────────────────
function DtiBadge({ dti }: { dti: number }) {
  const cls =
    dti < 36  ? "bg-emerald-50 text-emerald-700"
    : dti < 44  ? "bg-amber-50 text-amber-700"
    : "bg-rose-50 text-rose-700";
  return (
    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums", cls)}>
      DTI {dti}%
    </span>
  );
}

// ─── Pure card UI ─────────────────────────────────────────────
export function ApplicationCardContent({
  app,
  onSelect,
  isOverlay = false,
}: {
  app:        MortgageApplication;
  onSelect?:  (app: MortgageApplication) => void;
  isOverlay?: boolean;
}) {
  const loanBadge = LOAN_TYPE_COLOR[app.loanType] ?? "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <div
      onClick={() => !isOverlay && onSelect?.(app)}
      className={cn(
        "bg-white rounded-2xl border border-line p-4 cursor-pointer select-none",
        "transition-all duration-150",
        isOverlay
          ? "shadow-2xl ring-2 ring-gold/30 rotate-1"
          : "hover:shadow-md hover:border-gold/30 card-lift"
      )}
    >
      {/* Header: avatar + name + loan type */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: app.clientColor }}
        >
          {app.clientInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-axen-dark leading-tight truncate">{app.clientName}</p>
          <p className="text-[10px] text-gray-400 truncate mt-0.5">{app.propertyAddress}</p>
        </div>
        <span className={cn("text-[10px] font-semibold border px-1.5 py-0.5 rounded-lg flex-shrink-0", loanBadge)}>
          {app.loanType}
        </span>
      </div>

      {/* Loan amount */}
      <p className="text-base font-bold text-axen-dark tabular-nums mb-3">
        {formatCurrency(app.loanAmount)}
      </p>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-gray-400">Progress</span>
          <span className="text-[10px] font-semibold text-axen-dark">{app.progress}%</span>
        </div>
        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width:      `${app.progress}%`,
              background: app.progress >= 90 ? "#D4AF37" : app.progress >= 60 ? "#10B981" : "#6366F1",
            }}
          />
        </div>
      </div>

      {/* Footer: days in stage + score badges */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-gray-400 font-medium">
          {app.daysInStage}d in stage
        </span>
        <div className="flex items-center gap-1">
          <CreditBadge score={app.creditScore} />
          <DtiBadge    dti={app.dti} />
        </div>
      </div>
    </div>
  );
}

// ─── Sortable wrapper ────────────────────────────────────────
export default function ApplicationCard({
  app,
  onSelect,
}: {
  app:      MortgageApplication;
  onSelect: (app: MortgageApplication) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform:  CSS.Transform.toString(transform),
        transition,
        opacity:    isDragging ? 0.35 : 1,
        touchAction: "none",
      }}
      {...attributes}
      {...listeners}
    >
      <ApplicationCardContent app={app} onSelect={onSelect} />
    </div>
  );
}
