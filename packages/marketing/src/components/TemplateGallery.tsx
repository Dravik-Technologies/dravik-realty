"use client";

import { useState } from "react";
import { Star, Zap, ChevronRight } from "lucide-react";
import type { PageTemplate, TemplateCategory } from "@dravik/contracts/marketing";
import { PAGE_TEMPLATES } from "../data/marketing";
import { cn } from "@dravik/shared";

const CATEGORIES: ("All" | TemplateCategory)[] = [
  "All",
  "Luxury Listing",
  "Home Valuation",
  "First-Time Buyer",
  "Mortgage",
  "Open House",
  "Squeeze Page",
];

// ─── Single template card ─────────────────────────────────────
interface TemplateCardProps {
  template: PageTemplate;
  onUse: (t: PageTemplate) => void;
}

function TemplateCard({ template: t, onUse }: TemplateCardProps) {
  return (
    <div className="group bg-white rounded-2xl border border-line overflow-hidden hover:shadow-lg hover:border-gold/30 transition-all duration-200">
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${t.thumbnailSeed}/640/360`}
          alt={t.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-axen-dark/0 group-hover:bg-axen-dark/40 transition-colors duration-200 flex items-center justify-center">
          <button
            onClick={() => onUse(t)}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2.5 bg-gold text-axen-dark font-bold text-sm rounded-xl shadow-lg"
          >
            Use Template <ChevronRight size={14} />
          </button>
        </div>
        {t.popular && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-gold text-axen-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Star size={9} /> Popular
          </div>
        )}
        {/* Section count */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
          {t.sections.length} sections
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-axen-dark leading-tight">{t.name}</h3>
          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-surface-2 text-gray-500 rounded-md flex-shrink-0">
            {t.category}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">{t.description}</p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-emerald-600 font-semibold">
            <Zap size={11} />
            {t.conversionRate} conv. rate
          </div>
          <span className="text-gray-400">{t.usedCount} uses</span>
        </div>
      </div>
    </div>
  );
}

// ─── Template gallery ─────────────────────────────────────────
interface TemplateGalleryProps {
  onUse: (t: PageTemplate) => void;
}

export default function TemplateGallery({ onUse }: TemplateGalleryProps) {
  const [active, setActive] = useState<"All" | TemplateCategory>("All");

  const filtered = active === "All"
    ? PAGE_TEMPLATES
    : PAGE_TEMPLATES.filter((t) => t.category === active);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Category filter */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-line bg-white flex items-center gap-2 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors",
              active === cat
                ? "bg-axen-dark text-white"
                : "bg-surface-2 text-gray-500 hover:bg-gold-light hover:text-gold-dark"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} onUse={onUse} />
          ))}
        </div>
      </div>
    </div>
  );
}
