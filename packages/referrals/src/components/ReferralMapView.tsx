"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, Circle, useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, X, MapPin, ChevronRight, Target, SlidersHorizontal } from "lucide-react";
import { AGENTS } from "../data/agents";
import { MILITARY_BASES, BRANCH_COLOR, type MilitaryBase } from "../data/militaryBases";
import { getPartnerTier, getPartnerTierLabel, getPartnerTierStyles } from "../data/partnerTiers";
import type { Agent, CertificationType, PartnerRole } from "@dravik/contracts/referrals";
import { cn } from "@dravik/shared";

// ─── Geo helpers ──────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R   = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MILES_TO_METERS = 1609.34;
type RadiusMiles = 25 | 50 | 100;

// ─── Selected location (base, city, or partner search result) ─
interface SelectedLoc {
  lat:    number;
  lng:    number;
  name:   string;
  isBase: boolean;
  branch?: MilitaryBase["branch"];
}

// ─── Search suggestion ────────────────────────────────────────
interface Suggestion {
  id:       string;
  label:    string;
  sublabel: string;
  lat:      number;
  lng:      number;
  isBase:   boolean;
  branch?:  MilitaryBase["branch"];
}

// ─── Cert options ─────────────────────────────────────────────
const CERT_OPTIONS: Array<{ label: string; value: CertificationType | "All" }> = [
  { label: "All",          value: "All"           },
  { label: "RE Broker",    value: "RE Broker"     },
  { label: "Dual Lic.",    value: "Dual Licensed" },
  { label: "RE + Mtg",     value: "RE + Mortgage" },
  { label: "Lender",       value: "Mortgage Lender" },
];

const ROLE_OPTIONS: Array<{ label: string; value: PartnerRole | "All" }> = [
  { label: "All", value: "All" },
  { label: "Realtors", value: "Real Estate Agent" },
  { label: "Lenders", value: "Mortgage Lender" },
  { label: "Dual", value: "Dual Service" },
];

// ─── Leaflet icon factories — must stay at module level ───────
function createAgentIcon(agent: Agent, inRadius: boolean): L.DivIcon {
  const opacity = inRadius ? "1" : "0.35";
  const border  = inRadius ? "#C9C3B6" : "#E5E7EB";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:34px;height:34px;border-radius:50%;
      background:${agent.avatarColor};border:2.5px solid ${border};
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:11px;
      font-family:system-ui,sans-serif;cursor:pointer;
      box-shadow:0 2px 8px rgba(0,0,0,0.22);
      opacity:${opacity};transition:opacity 0.2s;
    ">${agent.initials}</div>`,
    iconSize:    [34, 34],
    iconAnchor:  [17, 17],
    popupAnchor: [0, -20],
  });
}

function createBaseIcon(branch: MilitaryBase["branch"]): L.DivIcon {
  const color = BRANCH_COLOR[branch];
  return L.divIcon({
    className: "",
    html: `<div style="
      width:42px;height:42px;border-radius:50%;
      background:#111418;border:3px solid ${color};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 3px 14px rgba(0,0,0,0.35);font-size:18px;
      cursor:default;
    ">⭐</div>`,
    iconSize:    [42, 42],
    iconAnchor:  [21, 21],
    popupAnchor: [0, -24],
  });
}

// ─── Map controller (programmatic pan/zoom) ───────────────────
function MapController({ loc, zoom }: { loc: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(loc, zoom, { animate: true, duration: 0.7 });
  }, [loc, zoom, map]);
  return null;
}

// ─── Custom zoom buttons ──────────────────────────────────────
function ZoomButtons() {
  const map = useMap();
  return (
    <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1">
      {([["＋", 1], ["－", -1]] as [string, number][]).map(([lbl, d]) => (
        <button
          key={lbl}
          aria-label={d > 0 ? "Zoom in" : "Zoom out"}
          onClick={() => map.setZoom(map.getZoom() + d)}
          className="w-8 h-8 bg-white border border-line rounded-lg font-bold text-dravik-dark hover:bg-gold-light hover:text-gold shadow-sm flex items-center justify-center transition-colors text-sm"
        >
          {lbl}
        </button>
      ))}
    </div>
  );
}

// ─── Compact cert badge ───────────────────────────────────────
const CERT_CFG: Record<CertificationType, { bg: string; text: string }> = {
  "RE Broker":     { bg: "#F1F0EC", text: "#767E88" },
  "Dual Licensed": { bg: "#111418", text: "#ffffff" },
  "RE + Mortgage": { bg: "#C9C3B6", text: "#111418" },
  "Mortgage Lender": { bg: "#E0F2FE", text: "#0369A1" },
};

const ROLE_CFG: Record<PartnerRole, { label: string; bg: string; text: string }> = {
  "Real Estate Agent": { label: "Realtor", bg: "#FFFFFF", text: "#767E88" },
  "Mortgage Lender": { label: "Lender", bg: "#E0F2FE", text: "#0369A1" },
  "Dual Service": { label: "Dual", bg: "#F3E8FF", text: "#6D28D9" },
};

// ─── Agent sidebar card ───────────────────────────────────────
function AgentListItem({ agent, dist, onInitiate }: {
  agent:      Agent;
  dist:       number | null;
  onInitiate: (a: Agent) => void;
}) {
  const cfg = CERT_CFG[agent.certification];
  const role = ROLE_CFG[agent.partnerRole];
  const tier = getPartnerTier(agent);
  const tierStyle = getPartnerTierStyles(tier);
  const isLender = agent.partnerRole === "Mortgage Lender";
  return (
    <button
      onClick={() => onInitiate(agent)}
      className="w-full text-left flex items-center gap-3 px-4 py-3 border-b border-line last:border-0 hover:bg-gold-light/30 transition-colors"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ background: agent.avatarColor }}
      >
        {agent.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-xs font-bold text-dravik-dark truncate">{agent.name}</p>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: role.bg, color: role.text }}
          >
            {role.label}
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0"
            style={{ background: tierStyle.bg, color: tierStyle.text, borderColor: tierStyle.border }}
          >
            {getPartnerTierLabel(tier, true)}
          </span>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: cfg.bg, color: cfg.text }}
          >
            {agent.certification}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          {agent.location.city}, {agent.location.state}
          {dist !== null && <span className="text-gold ml-1 font-semibold">{Math.round(dist)}mi</span>}
        </p>
        <p className="text-[10px] text-gray-500">
          {agent.closedVolumeMTD} · {agent.closedTransactions} {isLender ? "loans" : "txns"}
        </p>
      </div>
      <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────
interface ReferralMapViewProps {
  onInitiateReferral: (agent: Agent) => void;
}

const INITIAL_CENTER: [number, number] = [20, 0];
const INITIAL_ZOOM = 2;

export default function ReferralMapView({ onInitiateReferral }: ReferralMapViewProps) {
  const [searchQuery,      setSearchQuery]      = useState("");
  const [showDrop,         setShowDrop]         = useState(false);
  const [dropCursor,       setDropCursor]       = useState(-1);
  const [mobileSidebarOpen,setMobileSidebarOpen]= useState(false);
  const [selectedLoc,      setSelectedLoc]      = useState<SelectedLoc | null>(null);
  const [radiusMiles,   setRadiusMiles]   = useState<RadiusMiles>(50);
  const [roleFilter,    setRoleFilter]    = useState<PartnerRole | "All">("All");
  const [certFilter,    setCertFilter]    = useState<CertificationType | "All">("All");
  const [mapCenter,     setMapCenter]     = useState<[number, number]>(INITIAL_CENTER);
  const [mapZoom,       setMapZoom]       = useState(INITIAL_ZOOM);
  const inputRef = useRef<HTMLInputElement>(null);

  // Agents with coordinates
  const geoAgents = useMemo(
    () => AGENTS.filter(a => a.location.lat !== undefined && a.location.lng !== undefined),
    []
  );

  // Agents within radius + cert filter
  const { inRadius, withDist } = useMemo(() => {
    const withDist = geoAgents.map(a => ({
      agent: a,
      dist: selectedLoc
        ? haversine(selectedLoc.lat, selectedLoc.lng, a.location.lat!, a.location.lng!)
        : null,
    }));

    const inRadius = withDist.filter(({ agent, dist }) => {
      const radOk  = dist === null || dist <= radiusMiles;
      const roleOk = roleFilter === "All" || agent.partnerRole === roleFilter;
      const certOk = certFilter === "All" || agent.certification === certFilter;
      return radOk && roleOk && certOk;
    });

    return { inRadius, withDist };
  }, [geoAgents, selectedLoc, radiusMiles, roleFilter, certFilter]);

  // Sorted sidebar list: subscribers first, then distance when a location is selected.
  const sortedList = useMemo(
    () => [...inRadius].sort((a, b) => {
      const tierDelta = Number(getPartnerTier(b.agent) === "App Subscriber") - Number(getPartnerTier(a.agent) === "App Subscriber");
      if (tierDelta !== 0) return tierDelta;
      return (a.dist ?? 0) - (b.dist ?? 0);
    }),
    [inRadius]
  );

  const visibleMarkers = useMemo(
    () => withDist.filter(({ agent }) => {
      const roleOk = roleFilter === "All" || agent.partnerRole === roleFilter;
      const certOk = certFilter === "All" || agent.certification === certFilter;
      return roleOk && certOk;
    }),
    [withDist, roleFilter, certFilter]
  );

  // Search suggestions: military bases + unique partner cities
  const suggestions = useMemo((): Suggestion[] => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const bases: Suggestion[] = MILITARY_BASES
      .filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.state.toLowerCase().includes(q)
      )
      .map(b => ({
        id: `base-${b.id}`, label: b.name, sublabel: `${b.city}, ${b.state} · ${b.branch}`,
        lat: b.lat, lng: b.lng, isBase: true, branch: b.branch,
      }));

    const seen = new Set<string>();
    const cities: Suggestion[] = [];
    geoAgents.forEach(a => {
      const key = `${a.location.city}-${a.location.state}`;
      if (!seen.has(key) &&
          (a.location.city.toLowerCase().includes(q) ||
           a.location.state.toLowerCase().includes(q) ||
           a.location.region.toLowerCase().includes(q) ||
           a.partnerRole.toLowerCase().includes(q) ||
           a.certification.toLowerCase().includes(q) ||
           a.specializations.some((s) => s.toLowerCase().includes(q)))) {
        seen.add(key);
        cities.push({
          id: `city-${key}`, label: a.location.city, sublabel: `${a.location.state} · ${a.location.region}`,
          lat: a.location.lat!, lng: a.location.lng!, isBase: false,
        });
      }
    });

    const partners: Suggestion[] = geoAgents
      .filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.partnerRole.toLowerCase().includes(q) ||
        a.certification.toLowerCase().includes(q) ||
        a.location.city.toLowerCase().includes(q) ||
        a.location.state.toLowerCase().includes(q) ||
        a.specializations.some((s) => s.toLowerCase().includes(q))
      )
      .map(a => ({
        id: `agent-${a.id}`,
        label: a.name,
        sublabel: `${ROLE_CFG[a.partnerRole].label} · ${getPartnerTierLabel(getPartnerTier(a))} · ${a.location.city}, ${a.location.state}`,
        lat: a.location.lat!,
        lng: a.location.lng!,
        isBase: false,
      }));

    return [...cities, ...partners, ...bases].slice(0, 7);
  }, [searchQuery, geoAgents]);

  const selectSuggestion = useCallback((s: Suggestion) => {
    const loc: SelectedLoc = { lat: s.lat, lng: s.lng, name: s.label, isBase: s.isBase, branch: s.branch };
    setSelectedLoc(loc);
    setSearchQuery("");
    setShowDrop(false);
    setMapCenter([s.lat, s.lng]);
    setMapZoom(s.isBase ? 9 : 10);
  }, []);

  const clearLocation = useCallback(() => {
    setSelectedLoc(null);
    setMapCenter(INITIAL_CENTER);
    setMapZoom(INITIAL_ZOOM);
    setSearchQuery("");
  }, []);

  const isInRadius = useCallback(
    (agent: Agent): boolean =>
      inRadius.some(r => r.agent.id === agent.id),
    [inRadius]
  );

  return (
    <div className="flex h-full relative">

      {/* ── Mobile sidebar backdrop ──────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden absolute inset-0 z-[499] bg-black/40"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* ── Left Sidebar ────────────────────────────────── */}
      <aside className={cn(
        "flex flex-col bg-white border-r border-line overflow-hidden flex-shrink-0",
        // Mobile: absolute overlay that slides in/out
        "absolute inset-y-0 left-0 z-[500] w-80 transition-transform duration-300 ease-in-out",
        mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        // Desktop: static, always visible
        "lg:relative lg:translate-x-0 lg:shadow-none"
      )}>

        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-line flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-gold" />
              <h2 className="text-sm font-bold text-dravik-dark">Global Partner Search</h2>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close filters"
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-dravik-dark hover:bg-surface-2 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400">
            Find subscribers and network partners by place, role, or military base
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Search */}
          <div className="relative z-30 px-4 pt-4 pb-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-label="Global partner search"
                aria-haspopup="listbox"
                aria-autocomplete="list"
                aria-controls="map-search-listbox"
                aria-expanded={showDrop && suggestions.length > 0}
                aria-activedescendant={
                  dropCursor >= 0 && showDrop
                    ? `map-sug-${suggestions[dropCursor]?.id}`
                    : undefined
                }
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowDrop(true); setDropCursor(-1); }}
                onFocus={() => setShowDrop(true)}
                onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                onKeyDown={e => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setShowDrop(true);
                    setDropCursor(c => Math.min(c + 1, suggestions.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setDropCursor(c => Math.max(c - 1, -1));
                  } else if (e.key === "Enter") {
                    if (!showDrop || suggestions.length === 0) return;
                    e.preventDefault();
                    const target = dropCursor >= 0 ? suggestions[dropCursor] : suggestions[0];
                    if (target) selectSuggestion(target);
                  } else if (e.key === "Escape") {
                    setShowDrop(false);
                    setDropCursor(-1);
                  }
                }}
                placeholder="Search city, state, partner, or base..."
                className="w-full pl-9 pr-8 py-2.5 border border-line rounded-xl text-sm text-dravik-dark placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); inputRef.current?.focus(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dravik-dark"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}

              {/* Suggestions dropdown */}
              {showDrop && suggestions.length > 0 && (
                <div
                  id="map-search-listbox"
                  role="listbox"
                  aria-label="Location suggestions"
                  className="absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden rounded-xl border border-line bg-white shadow-2xl animate-fade-in"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={s.id}
                      id={`map-sug-${s.id}`}
                      role="option"
                      aria-selected={dropCursor === i}
                      onMouseDown={() => selectSuggestion(s)}
                      onMouseEnter={() => setDropCursor(i)}
                      className={cn(
                        "w-full text-left flex items-center gap-3 px-3 py-2.5 transition-colors border-b border-line last:border-0",
                        dropCursor === i ? "bg-gold-light" : "hover:bg-gold-light"
                      )}
                    >
                      <span className="text-base flex-shrink-0">{s.isBase ? "⭐" : "📍"}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-dravik-dark truncate">{s.label}</p>
                        <p className="text-[10px] text-gray-400 truncate">{s.sublabel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDrop && searchQuery.trim() && suggestions.length === 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden rounded-xl border border-line bg-white shadow-2xl animate-fade-in">
                  <div className="px-3 py-3 text-center">
                    <MapPin size={18} className="mx-auto text-gray-300 mb-1" />
                    <p className="text-xs font-semibold text-dravik-dark">No partners within that area</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Try another city, state, partner name, or military base.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Selected location badge */}
            {selectedLoc && (
              <div className="mt-2 flex items-center gap-2 bg-gold-light border border-gold/30 rounded-xl px-3 py-2">
                <span className="text-sm">{selectedLoc.isBase ? "⭐" : "📍"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-dravik-dark truncate">{selectedLoc.name}</p>
                  <p className="text-[10px] text-gray-500">
                    {inRadius.length} partner{inRadius.length !== 1 ? "s" : ""} within {radiusMiles}mi
                  </p>
                </div>
                <button onClick={clearLocation} aria-label="Clear selection" className="text-gray-400 hover:text-dravik-dark">
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Radius selector */}
          <div className="px-4 pb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Radius</p>
            <div className="flex gap-1.5">
              {([25, 50, 100] as RadiusMiles[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRadiusMiles(r)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-bold border transition-colors",
                    radiusMiles === r
                      ? "bg-dravik-dark text-white border-dravik-dark"
                      : "bg-surface-2 text-gray-500 border-line hover:border-dravik-dark"
                  )}
                >
                  {r}mi
                </button>
              ))}
            </div>
          </div>

          {/* Role filter */}
          <div className="px-4 pb-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Partner Type</p>
            <div className="flex flex-wrap gap-1.5">
              {ROLE_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setRoleFilter(o.value)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors",
                    roleFilter === o.value
                      ? "bg-dravik-dark text-white border-dravik-dark"
                      : "bg-surface-2 text-gray-500 border-line hover:border-dravik-dark"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cert filter */}
          <div className="px-4 pb-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Certification</p>
            <div className="flex flex-wrap gap-1.5">
              {CERT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => setCertFilter(o.value)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors",
                    certFilter === o.value
                      ? "bg-dravik-dark text-white border-dravik-dark"
                      : "bg-surface-2 text-gray-500 border-line hover:border-dravik-dark"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {certFilter === "Dual Licensed" && (
              <p className="text-[10px] text-gold mt-1.5 font-medium">
                ★ Recommended for military clients needing mortgage help
              </p>
            )}
          </div>

          {/* Partners list */}
          <div className="border-t border-line">
            <div className="px-4 py-3 flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {selectedLoc ? "Partners in Area" : "All Partners"}
              </p>
              <span className="text-[10px] font-bold text-gold bg-gold-light px-2 py-0.5 rounded-full">
                {sortedList.length}
              </span>
            </div>
            <div>
              {sortedList.map(({ agent, dist }) => (
                <AgentListItem
                  key={agent.id}
                  agent={agent}
                  dist={dist}
                  onInitiate={onInitiateReferral}
                />
              ))}
              {sortedList.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <MapPin size={24} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No partners within that area</p>
                  <button
                    onClick={() => setRadiusMiles(100)}
                    className="text-[11px] text-gold mt-1 font-semibold hover:text-gold-dark"
                  >
                    Expand to 100 miles
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </aside>

      {/* ── Map ─────────────────────────────────────────── */}
      <div className="flex-1 relative">

        {/* Mobile filters toggle — only shown when sidebar is closed */}
        {!mobileSidebarOpen && (
          <button
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open filters"
            className="lg:hidden absolute top-3 left-3 z-[400] flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-xl shadow-md text-xs font-bold text-dravik-dark"
          >
            <SlidersHorizontal size={13} className="text-gold" />
            Filters{selectedLoc ? ` · ${inRadius.length}` : ""}
          </button>
        )}

        <MapContainer
          center={INITIAL_CENTER}
          zoom={INITIAL_ZOOM}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            subdomains="abcd"
            maxZoom={20}
          />

          {/* Programmatic pan/zoom */}
          <MapController loc={mapCenter} zoom={mapZoom} />
          <ZoomButtons />

          {/* Radius circle */}
          {selectedLoc && (
            <Circle
              center={[selectedLoc.lat, selectedLoc.lng]}
              radius={radiusMiles * MILES_TO_METERS}
              pathOptions={{
                color:       "#C9C3B6",
                weight:      2,
                fillColor:   "#C9C3B6",
                fillOpacity: 0.06,
                dashArray:   "8 6",
              }}
            />
          )}

          {/* Base marker */}
          {selectedLoc?.isBase && (
            <Marker
              position={[selectedLoc.lat, selectedLoc.lng]}
              icon={createBaseIcon(selectedLoc.branch ?? "Joint")}
              zIndexOffset={2000}
            >
              <Popup closeButton={false} maxWidth={220}>
                <div style={{ fontFamily: "system-ui, sans-serif", padding: "4px 0" }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#111418", marginBottom: 4 }}>
                    ⭐ {selectedLoc.name}
                  </p>
                  <p style={{ fontSize: 11, color: "#6B7280" }}>
                    {selectedLoc.branch} Installation
                  </p>
                  <p style={{ fontSize: 11, color: "#C9C3B6", fontWeight: 600, marginTop: 4 }}>
                    {inRadius.length} partner{inRadius.length !== 1 ? "s" : ""} within {radiusMiles}mi
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Partner markers */}
          {visibleMarkers.map(({ agent, dist }) => {
            if (!agent.location.lat || !agent.location.lng) return null;
            const inRad = isInRadius(agent);
            const cfg   = CERT_CFG[agent.certification];
            const role  = ROLE_CFG[agent.partnerRole];
            const isLender = agent.partnerRole === "Mortgage Lender";
            return (
              <Marker
                key={agent.id}
                position={[agent.location.lat, agent.location.lng]}
                icon={createAgentIcon(agent, inRad)}
                zIndexOffset={inRad ? 500 : 0}
              >
                <Popup closeButton={false} maxWidth={240} minWidth={220}>
                  <div style={{ fontFamily: "system-ui, sans-serif", padding: "2px 0" }}>
                    {/* Agent header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: agent.avatarColor, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: 13,
                      }}>
                        {agent.initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: "#111418", whiteSpace: "nowrap" }}>
                          {agent.name}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 6px",
                            borderRadius: 20, background: role.bg, color: role.text,
                          }}>
                            {role.label}
                          </span>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 6px",
                            borderRadius: 20, background: cfg.bg, color: cfg.text,
                          }}>
                            {agent.certification}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location + distance */}
                    <p style={{ fontSize: 11, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}>
                      📍 {agent.location.city}, {agent.location.state}
                      {dist !== null && (
                        <span style={{ color: "#C9C3B6", fontWeight: 700 }}>
                          · {Math.round(dist)}mi
                        </span>
                      )}
                    </p>

                    {/* Production stats */}
                    <div style={{ display: "flex", gap: 12, margin: "8px 0", fontSize: 11 }}>
                      <div>
                        <p style={{ fontWeight: 700, color: "#111418" }}>{agent.closedVolumeMTD}</p>
                        <p style={{ color: "#9CA3AF" }}>{isLender ? "Funded" : "Vol MTD"}</p>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: "#111418" }}>{agent.closedTransactions}</p>
                        <p style={{ color: "#9CA3AF" }}>{isLender ? "Loans" : "Txns"}</p>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: "#111418", display: "flex", alignItems: "center", gap: 2 }}>
                          <span style={{ color: "#C9C3B6" }}>★</span> {agent.productionScore.toFixed(1)}
                        </p>
                        <p style={{ color: "#9CA3AF" }}>Score</p>
                      </div>
                    </div>

                    {/* Referral button */}
                    <button
                      onClick={() => onInitiateReferral(agent)}
                      style={{
                        width: "100%", padding: "8px 0",
                        background: "#111418", color: "#C9C3B6",
                        borderRadius: 10, fontWeight: 700, fontSize: 12,
                        border: "none", cursor: "pointer",
                      }}
                    >
                      {isLender ? "Start Lender Referral" : "Start Referral"}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Map legend overlay */}
        <div className="absolute bottom-4 left-4 z-[400] bg-white border border-line rounded-xl px-3 py-2.5 shadow-md">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Legend</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-dravik-dark border-2 border-gold flex items-center justify-center text-[8px]">⭐</div>
              <span className="text-[10px] text-gray-600">Military Base</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-gold" />
              <span className="text-[10px] text-gray-600">Partner (in radius)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-200 opacity-40" />
              <span className="text-[10px] text-gray-400">Partner (outside)</span>
            </div>
          </div>
        </div>

        {/* Active filter badge */}
        {selectedLoc && (
          <div className="absolute top-3 left-3 z-[400] bg-white border border-gold/40 rounded-xl px-3 py-2 shadow-md flex items-center gap-2">
            <Target size={12} className="text-gold" />
            <span className="text-xs font-bold text-dravik-dark">{radiusMiles}mi radius</span>
            <span className="text-[10px] text-gray-400">·</span>
            <span className="text-[10px] font-semibold text-gold">
              {inRadius.length} partner{inRadius.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
