"use client";

import { useState } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import type { PropertyFilters, PropertyType, ListingStatus } from "@dravik/contracts/realty";
import { DEFAULT_FILTERS } from "@dravik/contracts/realty";
import { cn, formatCurrency } from "@dravik/shared";

const TYPES: PropertyType[] = ["Single Family", "Condo", "Townhouse", "Luxury Estate", "Multi-Family"];
const BED_OPTIONS = [0, 1, 2, 3, 4, 5];
const BATH_OPTIONS = [0, 1, 1.5, 2, 3, 4];
const PRICE_STEPS = [0, 300_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000, 5_000_000, 10_000_000];
const STATUS_OPTS: ListingStatus[] = ["Active", "Coming Soon", "Price Reduced", "Pending"];

interface MapFiltersProps {
  filters: PropertyFilters;
  onChange: (f: PropertyFilters) => void;
  resultCount: number;
}

export default function MapFilters({ filters, onChange, resultCount }: MapFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const statusesDirty =
    filters.statuses.length !== DEFAULT_FILTERS.statuses.length ||
    filters.statuses.some((s) => !DEFAULT_FILTERS.statuses.includes(s));

  const isDirty =
    filters.priceMin !== DEFAULT_FILTERS.priceMin ||
    filters.priceMax !== DEFAULT_FILTERS.priceMax ||
    filters.types.length > 0 ||
    filters.bedsMin > 0 ||
    filters.bathsMin > 0 ||
    filters.newConstruction ||
    filters.priceReduced ||
    statusesDirty;

  function toggleType(t: PropertyType) {
    onChange({
      ...filters,
      types: filters.types.includes(t)
        ? filters.types.filter((x) => x !== t)
        : [...filters.types, t],
    });
  }

  function toggleStatus(s: ListingStatus) {
    onChange({
      ...filters,
      statuses: filters.statuses.includes(s)
        ? filters.statuses.filter((x) => x !== s)
        : [...filters.statuses, s],
    });
  }

  return (
    <div className="bg-white border-b border-line">
      {/* ── Row 1: quick chips ───────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">

        {/* Beds pill */}
        <select
          value={filters.bedsMin}
          onChange={(e) => onChange({ ...filters, bedsMin: Number(e.target.value) })}
          className="h-8 pl-3 pr-6 text-xs font-semibold rounded-full border border-line bg-white text-dravik-dark focus:outline-none focus:border-gold appearance-none cursor-pointer"
        >
          <option value={0}>Any Beds</option>
          {BED_OPTIONS.slice(1).map((b) => (
            <option key={b} value={b}>{b}+ Beds</option>
          ))}
        </select>

        {/* Baths pill */}
        <select
          value={filters.bathsMin}
          onChange={(e) => onChange({ ...filters, bathsMin: Number(e.target.value) })}
          className="h-8 pl-3 pr-6 text-xs font-semibold rounded-full border border-line bg-white text-dravik-dark focus:outline-none focus:border-gold appearance-none cursor-pointer"
        >
          <option value={0}>Any Baths</option>
          {BATH_OPTIONS.slice(1).map((b) => (
            <option key={b} value={b}>{b}+ Baths</option>
          ))}
        </select>

        {/* Price range pill */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "h-8 px-3 text-xs font-semibold rounded-full border flex items-center gap-1 whitespace-nowrap",
            filters.priceMin > 0 || filters.priceMax < DEFAULT_FILTERS.priceMax
              ? "border-gold bg-gold-light text-gold-dark"
              : "border-line text-dravik-dark hover:border-gold"
          )}
        >
          {filters.priceMin > 0 || filters.priceMax < DEFAULT_FILTERS.priceMax
            ? `${formatCurrency(filters.priceMin)} – ${filters.priceMax >= DEFAULT_FILTERS.priceMax ? "Any" : formatCurrency(filters.priceMax)}`
            : "Price Range"}
          <ChevronDown size={11} className={cn("transition-transform", expanded && "rotate-180")} />
        </button>

        {/* Type chips */}
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => toggleType(t)}
            className={cn(
              "h-8 px-3 text-xs font-semibold rounded-full border whitespace-nowrap transition-colors",
              filters.types.includes(t)
                ? "border-gold bg-gold-light text-gold-dark"
                : "border-line text-gray-500 hover:border-gold hover:text-dravik-dark"
            )}
          >
            {t}
          </button>
        ))}

        {/* New Construction toggle */}
        <button
          onClick={() => onChange({ ...filters, newConstruction: !filters.newConstruction })}
          className={cn(
            "h-8 px-3 text-xs font-semibold rounded-full border whitespace-nowrap",
            filters.newConstruction
              ? "border-gold bg-gold-light text-gold-dark"
              : "border-line text-gray-500 hover:border-gold hover:text-dravik-dark"
          )}
        >
          New Construction
        </button>

        {/* Price Reduced toggle */}
        <button
          onClick={() => onChange({ ...filters, priceReduced: !filters.priceReduced })}
          className={cn(
            "h-8 px-3 text-xs font-semibold rounded-full border whitespace-nowrap",
            filters.priceReduced
              ? "border-rose-500 bg-rose-50 text-rose-600"
              : "border-line text-gray-500 hover:border-rose-300 hover:text-dravik-dark"
          )}
        >
          Price Reduced
        </button>

        {/* spacer + result count + clear */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <span className="text-xs text-gray-400 whitespace-nowrap">
            <span className="font-bold text-dravik-dark">{resultCount}</span> results
          </span>
          {isDirty && (
            <button
              onClick={() => onChange(DEFAULT_FILTERS)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-rose-500 transition-colors"
            >
              <X size={11} />
              Clear
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "relative flex items-center gap-1 text-xs font-semibold hover:text-dravik-dark border rounded-full h-8 px-3 transition-colors",
              statusesDirty
                ? "border-gold bg-gold-light text-gold-dark"
                : "border-line text-gray-500"
            )}
          >
            <SlidersHorizontal size={12} />
            More
            {statusesDirty && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold border border-white" />
            )}
          </button>
        </div>
      </div>

      {/* ── Row 2: expanded price + status ──────────────────── */}
      {expanded && (
        <div className="px-4 pb-3 flex flex-wrap gap-4 items-end border-t border-line pt-3">
          {/* Price Min */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Min Price</label>
            <select
              value={filters.priceMin}
              onChange={(e) => onChange({ ...filters, priceMin: Number(e.target.value) })}
              className="h-8 px-3 text-xs font-semibold rounded-lg border border-line bg-white text-dravik-dark focus:outline-none focus:border-gold"
            >
              {PRICE_STEPS.map((p) => (
                <option key={p} value={p}>{p === 0 ? "No Min" : formatCurrency(p)}</option>
              ))}
            </select>
          </div>

          {/* Price Max */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Price</label>
            <select
              value={filters.priceMax}
              onChange={(e) => onChange({ ...filters, priceMax: Number(e.target.value) })}
              className="h-8 px-3 text-xs font-semibold rounded-lg border border-line bg-white text-dravik-dark focus:outline-none focus:border-gold"
            >
              {PRICE_STEPS.slice(1).map((p) => (
                <option key={p} value={p}>{p >= DEFAULT_FILTERS.priceMax ? "No Max" : formatCurrency(p)}</option>
              ))}
            </select>
          </div>

          {/* Status checkboxes */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Listing Status</label>
            <div className="flex gap-2">
              {STATUS_OPTS.map((s) => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(s)}
                    onChange={() => toggleStatus(s)}
                    className="accent-gold w-3.5 h-3.5"
                  />
                  <span className="text-xs font-medium text-dravik-dark">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
