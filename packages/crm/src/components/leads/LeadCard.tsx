"use client";

import { Phone, MessageSquare, Mail, Landmark } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Lead } from "@dravik/contracts/crm";
import { SOURCE_STYLES } from "@dravik/contracts/crm";
import { cn } from "@dravik/shared";
import { RelativeTime } from "@dravik/ui";

// ─── Behavior score badge ─────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) {
    return (
      <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gold-light border border-gold/30 text-gold-dark tabular-nums">
        <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
        {score}
      </span>
    );
  }
  if (score >= 60) {
    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface-2 border border-line text-gray-500 tabular-nums">
        {score}
      </span>
    );
  }
  return (
    <span className="text-[11px] font-semibold text-gray-400 tabular-nums">{score}</span>
  );
}

// ─── Client type pill ─────────────────────────────────────────
const CLIENT_TYPE_STYLES = {
  Buyer: "bg-blue-500 text-white",
  Seller: "bg-amber-500 text-white",
  Dual: "bg-purple-500 text-white",
};

const CLIENT_TYPE_BORDER = {
  Buyer:  "border-l-blue-400",
  Seller: "border-l-amber-400",
  Dual:   "border-l-purple-400",
};

// ─── Pure card UI (used by both sortable wrapper and DragOverlay)
export function LeadCardContent({
  lead,
  onSelect,
  isOverlay = false,
}: {
  lead: Lead;
  onSelect?: (lead: Lead) => void;
  isOverlay?: boolean;
}) {
  const src = SOURCE_STYLES[lead.source];

  return (
    <div
      onClick={() => onSelect?.(lead)}
      className={cn(
        "bg-white rounded-2xl border border-line border-l-4 p-4 space-y-3 cursor-pointer select-none",
        "hover:shadow-md hover:-translate-y-0.5 transition-all duration-150",
        CLIENT_TYPE_BORDER[lead.clientType],
        isOverlay && "rotate-1 scale-105 shadow-2xl opacity-95"
      )}
    >
      {/* Row 1: client type + source + score */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
            CLIENT_TYPE_STYLES[lead.clientType]
          )}
        >
          {lead.clientType === "Dual" && <Landmark size={9} />}
          {lead.clientType}
        </span>

        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
            src.bg, src.text
          )}
        >
          {lead.source}
        </span>

        <div className="ml-auto flex-shrink-0">
          <ScoreBadge score={lead.behaviorScore} />
        </div>
      </div>

      {/* Row 2: name */}
      <div>
        <p className="text-sm font-bold text-dravik-dark leading-tight">{lead.name}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{lead.phone}</p>
      </div>

      {/* Row 3: quick actions + last touchpoint */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {[
            { icon: Phone,          label: "Call"  },
            { icon: MessageSquare,  label: "SMS"   },
            { icon: Mail,           label: "Email" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              aria-label={label}
              title={label}
              className="w-7 h-7 rounded-lg bg-surface-2 hover:bg-gold-light hover:text-gold flex items-center justify-center text-gray-400 transition-colors"
            >
              <Icon size={13} />
            </button>
          ))}
        </div>

        <RelativeTime
          dateStr={lead.lastTouchpoint}
          className="text-[10px] text-gray-400 font-medium flex-shrink-0"
        />
      </div>
    </div>
  );
}

// ─── Sortable wrapper (used inside the kanban SortableContext) ─
export default function LeadCard({
  lead,
  onSelect,
}: {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <LeadCardContent lead={lead} onSelect={onSelect} />
    </div>
  );
}
