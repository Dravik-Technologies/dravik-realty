"use client";

import { Bed, Bath, Square, Bookmark, Send, UserPlus, MapPin, TrendingDown } from "lucide-react";
import type { Property } from "@dravik/contracts/realty";
import { cn, formatCurrency } from "@dravik/shared";

// ─── Status badge ──────────────────────────────────────────────
export function StatusBadge({ status }: { status: Property["status"] }) {
  const map = {
    "Active":        "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Pending":       "bg-amber-50 text-amber-700 border-amber-200",
    "Coming Soon":   "bg-violet-50 text-violet-700 border-violet-200",
    "Price Reduced": "bg-rose-50 text-rose-600 border-rose-200",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border", map[status])}>
      {status === "Price Reduced" && <TrendingDown size={9} />}
      {status}
    </span>
  );
}

// ─── Lead score badge ──────────────────────────────────────────
export function LeadScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 80 ? "bg-gold-light border-gold/30 text-gold-dark" :
    score >= 60 ? "bg-blue-50 border-blue-200 text-blue-700" :
                  "bg-gray-100 border-gray-200 text-gray-500";
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums", cls)}>
      {score}
    </span>
  );
}

// ─── Compact popup card (used inside Leaflet Popup) ────────────
interface PropertyCardProps {
  property: Property;
  onViewDetails: (p: Property) => void;
  onSave?: (p: Property) => void;
}

export default function PropertyCard({ property: p, onViewDetails, onSave }: PropertyCardProps) {
  return (
    <div className="w-[272px] bg-white overflow-hidden select-none">
      {/* Photo */}
      <div className="relative h-[150px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.heroImage}
          alt={p.address}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 left-2">
          <StatusBadge status={p.status} />
        </div>
        {p.status === "Price Reduced" && p.originalPrice && (
          <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            −{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-lg font-bold text-dravik-dark">{formatCurrency(p.price)}</span>
          <span className="text-[11px] text-gray-400">
            ${p.pricePerSqft.toLocaleString()}/sqft
          </span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1 mb-2">
          <MapPin size={11} className="text-gold flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 leading-tight">
            {p.address}, {p.city}
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Bed size={12} className="text-gold" />
            <span className="font-semibold text-dravik-dark">{p.beds}</span>
          </span>
          <span className="flex items-center gap-1">
            <Bath size={12} className="text-gold" />
            <span className="font-semibold text-dravik-dark">{p.baths}</span>
          </span>
          <span className="flex items-center gap-1">
            <Square size={12} className="text-gold" />
            <span className="font-semibold text-dravik-dark">{p.sqft.toLocaleString()}</span>
          </span>
          <span className="ml-auto">
            <LeadScoreBadge score={p.leadScore} />
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={() => onViewDetails(p)}
            className="flex-1 py-2 text-xs font-bold bg-dravik-dark text-white rounded-lg hover:bg-gold hover:text-dravik-dark transition-all"
          >
            View Details
          </button>
          <button
            onClick={() => onSave?.(p)}
            disabled={!onSave}
            title="Save listing"
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 text-gray-400 transition-all",
              onSave
                ? "hover:bg-gold-light hover:text-gold"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            <Bookmark size={14} />
          </button>
          <button
            disabled
            title="Client sharing coming soon"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 text-gray-300 cursor-not-allowed"
          >
            <Send size={14} />
          </button>
          <button
            disabled
            title="Lead creation from listings coming soon"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-2 text-gray-300 cursor-not-allowed"
          >
            <UserPlus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
