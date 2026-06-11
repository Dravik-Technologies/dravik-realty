"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Bed, Bath, Square, Clock, Bookmark, BookmarkCheck, ArrowRight } from "lucide-react";
import type { Property, SortField, SortDir } from "@/types/property";
import { cn, formatCurrency } from "@dravik/shared";
import { StatusBadge, LeadScoreBadge } from "./PropertyCard";

interface ListViewProps {
  properties: Property[];
  sortField: SortField;
  sortDir: SortDir;
  selectedId: string | null;
  onSort: (field: SortField) => void;
  onSelect: (p: Property) => void;
  onSave?: (p: Property) => void;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp size={9} className={cn(active && dir === "asc" && "opacity-100 text-gold")} />
      <ChevronDown size={9} className={cn(active && dir === "desc" && "opacity-100 text-gold")} />
    </span>
  );
}

const COLS: { label: string; field?: SortField; width: string }[] = [
  { label: "Property",       width: "flex-[3]" },
  { label: "Price",          field: "price",          width: "w-36"  },
  { label: "Beds / Baths",   field: "beds",           width: "w-28"  },
  { label: "Sqft",           field: "sqft",           width: "w-24"  },
  { label: "DOM",            field: "daysOnMarket",   width: "w-20"  },
  { label: "Lead Score",     field: "leadScore",      width: "w-24"  },
  { label: "",               width: "w-20"  },
];

export default function ListView({
  properties,
  sortField,
  sortDir,
  selectedId,
  onSort,
  onSelect,
  onSave,
}: ListViewProps) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  function handleSave(e: React.MouseEvent, p: Property) {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(p.id)) next.delete(p.id);
      else next.add(p.id);
      return next;
    });
    onSave?.(p);
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm font-semibold text-gray-400">No properties match your filters</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-0 px-4 py-2 border-b border-line bg-surface-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
        {COLS.map((col) =>
          col.field ? (
            <button
              key={col.label}
              onClick={() => onSort(col.field!)}
              className={cn(col.width, "flex items-center select-none hover:text-axen-dark focus-visible:outline-none focus-visible:text-gold transition-colors")}
              aria-label={`Sort by ${col.label}`}
            >
              {col.label}
              <SortIcon active={sortField === col.field} dir={sortDir} />
            </button>
          ) : (
            <div key={col.label} className={cn(col.width, "flex items-center")}>
              {col.label}
            </div>
          )
        )}
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {properties.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            className={cn(
              "flex items-center gap-0 px-4 py-3 border-b border-line cursor-pointer transition-colors",
              selectedId === p.id
                ? "bg-gold-light border-l-2 border-l-gold"
                : "hover:bg-surface"
            )}
          >
            {/* Photo + Address */}
            <div className="flex-[3] flex items-center gap-3 min-w-0">
              <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.heroImage} alt={p.address} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-axen-dark truncate">{p.address}</p>
                <p className="text-xs text-gray-400 truncate">{p.city}, {p.state} · {p.neighborhood}</p>
                <div className="mt-0.5">
                  <StatusBadge status={p.status} />
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="w-36 flex flex-col">
              <span className="text-sm font-bold text-axen-dark">{formatCurrency(p.price)}</span>
              {p.originalPrice && (
                <span className="text-[10px] text-rose-500 line-through">{formatCurrency(p.originalPrice)}</span>
              )}
              <span className="text-[10px] text-gray-400">${p.pricePerSqft.toLocaleString()}/sqft</span>
            </div>

            {/* Beds / Baths */}
            <div className="w-28 flex items-center gap-2 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Bed size={12} className="text-gold" />
                <span className="font-semibold">{p.beds}</span>
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1">
                <Bath size={12} className="text-gold" />
                <span className="font-semibold">{p.baths}</span>
              </span>
            </div>

            {/* Sqft */}
            <div className="w-24 flex items-center gap-1 text-xs text-gray-600">
              <Square size={12} className="text-gold" />
              <span className="font-semibold">{p.sqft.toLocaleString()}</span>
            </div>

            {/* Days on Market */}
            <div className="w-20 flex items-center gap-1 text-xs text-gray-600">
              <Clock size={12} className="text-gold" />
              <span className={cn("font-semibold", p.daysOnMarket >= 45 && "text-rose-500")}>
                {p.daysOnMarket === 0 ? "–" : `${p.daysOnMarket}d`}
              </span>
            </div>

            {/* Lead Score */}
            <div className="w-24">
              <LeadScoreBadge score={p.leadScore} />
            </div>

            {/* Action */}
            <div className="w-20 flex items-center gap-1 justify-end">
              <button
                onClick={(e) => handleSave(e, p)}
                aria-label={savedIds.has(p.id) ? "Unsave listing" : "Save listing"}
                title={savedIds.has(p.id) ? "Saved" : "Save listing"}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  savedIds.has(p.id)
                    ? "bg-gold-light text-gold"
                    : "hover:bg-gold-light hover:text-gold text-gray-300"
                )}
              >
                {savedIds.has(p.id)
                  ? <BookmarkCheck size={13} />
                  : <Bookmark size={13} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(p); }}
                aria-label="View property details"
                className="p-1.5 rounded-lg hover:bg-axen-dark hover:text-white text-gray-300 transition-colors"
              >
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
