"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Search, Map, List, Wifi, WifiOff, X,
} from "lucide-react";
import type { Property, PropertyFilters, ViewMode, SortField, SortDir } from "@dravik/contracts/realty";
import { DEFAULT_FILTERS } from "@dravik/contracts/realty";
import { SAMPLE_PROPERTIES } from "../data/properties";
import MapFilters from "../components/mapping/MapFilters";
import ListView from "../components/mapping/ListView";
import PropertyPanel from "../components/mapping/PropertyPanel";
import { cn } from "@dravik/shared";

// Leaflet must only run in the browser — dynamic import with ssr:false
const PropertyMap = dynamic(() => import("../components/mapping/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-surface-2 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gold/20 flex items-center justify-center animate-pulse">
          <Map size={20} className="text-gold" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Loading map…</p>
      </div>
    </div>
  ),
});

export default function MappingPage() {
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);
  const [view, setView] = useState<ViewMode>("map");
  const [query, setQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>("leadScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [mlsLive] = useState(true);

  // ── Filter + search ───────────────────────────────────────
  const filtered = useMemo(() => {
    let list = SAMPLE_PROPERTIES;

    if (!filters.statuses.includes("Pending")) {
      list = list.filter((p) => filters.statuses.includes(p.status));
    } else {
      list = list.filter((p) => filters.statuses.includes(p.status));
    }
    if (filters.priceMin > 0)    list = list.filter((p) => p.price >= filters.priceMin);
    if (filters.priceMax < DEFAULT_FILTERS.priceMax) list = list.filter((p) => p.price <= filters.priceMax);
    if (filters.types.length)    list = list.filter((p) => filters.types.includes(p.type));
    if (filters.bedsMin > 0)     list = list.filter((p) => p.beds >= filters.bedsMin);
    if (filters.bathsMin > 0)    list = list.filter((p) => p.baths >= filters.bathsMin);
    if (filters.newConstruction) list = list.filter((p) => p.newConstruction);
    if (filters.priceReduced)    list = list.filter((p) => p.status === "Price Reduced");

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.zip.includes(q) ||
          p.neighborhood.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      );
    }

    return list;
  }, [filters, query]);

  // ── List view sorting ─────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      if (sortField === "price")          return (a.price - b.price) * mult;
      if (sortField === "daysOnMarket")   return (a.daysOnMarket - b.daysOnMarket) * mult;
      if (sortField === "beds")           return (a.beds - b.beds) * mult;
      if (sortField === "sqft")           return (a.sqft - b.sqft) * mult;
      if (sortField === "leadScore")      return (a.leadScore - b.leadScore) * mult;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  // ── Handlers ──────────────────────────────────────────────
  const handleSelect = useCallback((p: Property) => {
    setSelectedProperty(p);
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  function handleSort(field: SortField) {
    if (field === sortField) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  return (
    <>
      <div
        className="flex flex-col overflow-hidden bg-surface"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        {/* ── Top control bar ──────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-line px-4 py-2.5 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search address, city, zip, neighborhood…"
              className="w-full pl-9 pr-8 py-2 bg-surface-2 border border-transparent rounded-xl text-sm text-dravik-dark placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dravik-dark">
                <X size={13} />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex bg-surface-2 rounded-xl p-1 gap-1">
            {(["map", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  view === v
                    ? "bg-dravik-dark text-white shadow-sm"
                    : "text-gray-400 hover:text-dravik-dark"
                )}
              >
                {v === "map" ? <Map size={13} /> : <List size={13} />}
                {v === "map" ? "Map" : "List"}
              </button>
            ))}
          </div>

          {/* MLS status */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border",
            mlsLive
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-600"
          )}>
            {mlsLive ? <Wifi size={12} /> : <WifiOff size={12} />}
            {mlsLive ? "MLS Live" : "MLS Offline"}
          </div>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-4 ml-auto text-xs text-gray-400">
            <span>
              <span className="font-bold text-dravik-dark">{filtered.length}</span> of {SAMPLE_PROPERTIES.length} listings
            </span>
          </div>
        </div>

        {/* ── Filters ───────────────────────────────────────── */}
        <MapFilters filters={filters} onChange={setFilters} resultCount={filtered.length} />

        {/* ── Main content: map or list ─────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {view === "map" ? (
            <PropertyMap
              properties={filtered}
              selectedId={selectedProperty?.id ?? null}
              onSelect={handleSelect}
            />
          ) : (
            <ListView
              properties={sorted}
              sortField={sortField}
              sortDir={sortDir}
              selectedId={selectedProperty?.id ?? null}
              onSort={handleSort}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>

      {/* ── Sliding property detail panel ──────────────────── */}
      <PropertyPanel
        property={selectedProperty}
        open={panelOpen}
        onClose={handleClosePanel}
      />
    </>
  );
}
