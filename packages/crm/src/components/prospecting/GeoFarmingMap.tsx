"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  MapContainer, TileLayer, Marker, Popup, Circle, Polygon,
  Polyline, useMap, useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Layers, Crosshair, Hexagon, Trash2, Check, X,
  RefreshCw, MapPin,
} from "lucide-react";
import { SELLER_LEADS } from "@/data/prospecting";
import type { LeadType, SellerLead } from "@/types/prospecting";
import { cn } from "@dravik/shared";

// ─── Geo helpers ──────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R   = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pointInPoly(lat: number, lng: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [lati, lngi] = poly[i];
    const [latj, lngj] = poly[j];
    const cross = lngi > lng !== lngj > lng &&
      lat < ((latj - lati) * (lng - lngi)) / (lngj - lngi) + lati;
    if (cross) inside = !inside;
  }
  return inside;
}

const MILES_TO_M = 1609.34;
const MIAMI_CENTER: [number, number] = [25.7617, -80.2000];

// ─── Lead type colours ────────────────────────────────────────
const TYPE_COLOR: Record<LeadType, string> = {
  "Expired":         "#EF4444",
  "FSBO":            "#F97316",
  "FRBO":            "#8B5CF6",
  "Pre-Foreclosure": "#BE123C",
  "Absentee":        "#3B82F6",
  "High Equity":     "#D4AF37",
};

// Score → heat colour
function heatColor(score: number): string {
  if (score >= 80) return "#DC2626";
  if (score >= 60) return "#F97316";
  if (score >= 40) return "#FBBF24";
  return "#3B82F6";
}

// ─── Leaflet icon factories (module level) ────────────────────
function makeLeadIcon(lead: SellerLead, heatmap: boolean, inArea: boolean): L.DivIcon {
  const color   = heatmap ? heatColor(lead.motivationScore) : TYPE_COLOR[lead.leadType];
  const opacity = inArea ? 1 : 0.35;
  const border  = inArea ? "#D4AF37" : "#E5E7EB";
  const size    = heatmap ? Math.max(22, Math.round(lead.motivationScore / 4)) : 30;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2.5px solid ${border};
      opacity:${opacity};box-shadow:0 2px 8px rgba(0,0,0,0.22);
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:9px;font-family:system-ui;
      cursor:pointer;
    ">${heatmap ? "" : lead.leadType.slice(0, 2)}</div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  });
}

// ─── Map utilities (must be inside MapContainer) ──────────────
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.6 });
  }, [center, zoom, map]);
  return null;
}

function ZoomButtons() {
  const map = useMap();
  return (
    <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1">
      {([["＋", 1], ["－", -1]] as [string, number][]).map(([lbl, d]) => (
        <button key={lbl} onClick={() => map.setZoom(map.getZoom() + d)}
          aria-label={d > 0 ? "Zoom in" : "Zoom out"}
          className="w-8 h-8 bg-white border border-line rounded-lg text-axen-dark hover:bg-gold-light hover:text-gold shadow-sm flex items-center justify-center font-bold text-sm transition-colors">
          {lbl}
        </button>
      ))}
    </div>
  );
}

function DrawHandler({ mode, active, onPoint, onDblClick, canClose }: {
  mode:       "radius" | "polygon";
  active:     boolean;
  onPoint:    (lat: number, lng: number) => void;
  onDblClick: () => void;
  canClose:   boolean;
}) {
  useMapEvents({
    click(e) {
      if (!active) return;
      if ((e.originalEvent as MouseEvent & { _handled?: boolean })._handled) return;
      onPoint(e.latlng.lat, e.latlng.lng);
    },
    dblclick(e) {
      if (!active || mode !== "polygon" || !canClose) return;
      (e.originalEvent as MouseEvent & { _handled?: boolean })._handled = true;
      onDblClick();
    },
  });
  return null;
}

function MapCursor({ active }: { active: boolean }) {
  const map = useMap();
  useEffect(() => {
    map.getContainer().style.cursor = active ? "crosshair" : "";
    if (active) map.doubleClickZoom.disable();
    else        map.doubleClickZoom.enable();
  }, [active, map]);
  return null;
}

// ─── GeoFarmingMap ────────────────────────────────────────────
interface Props {
  onFarmGenerated: (ids: Set<string>) => void;
}

export default function GeoFarmingMap({ onFarmGenerated }: Props) {
  // Layer toggles
  const [layers, setLayers] = useState<Set<LeadType>>(
    new Set(["Expired", "FSBO", "FRBO", "Pre-Foreclosure", "Absentee", "High Equity"] as LeadType[])
  );
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Draw state
  const [drawMode,   setDrawMode]   = useState<"radius" | "polygon" | null>(null);
  const [radiusCenter, setRadiusCenter] = useState<[number, number] | null>(null);
  const [radiusMiles,  setRadiusMiles]  = useState(1);
  const [polyPoints,   setPolyPoints]   = useState<[number, number][]>([]);
  const [polyClosed,   setPolyClosed]   = useState(false);

  // Map view
  const [mapCenter, setMapCenter] = useState<[number, number]>(MIAMI_CENTER);
  const [mapZoom,   setMapZoom]   = useState(11);

  // Farm result
  const [farmCount, setFarmCount] = useState<number | null>(null);

  // Sidebar mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const geoLeads = useMemo(
    () => SELLER_LEADS.filter(l => l.lat !== undefined && l.lng !== undefined),
    []
  );

  // Which leads are inside the current drawn area
  const inAreaIds = useMemo((): Set<string> => {
    if (drawMode === null && radiusCenter === null && !polyClosed) return new Set();

    return new Set(
      geoLeads
        .filter(l => {
          if (radiusCenter) {
            return haversine(radiusCenter[0], radiusCenter[1], l.lat!, l.lng!) <= radiusMiles;
          }
          if (polyClosed && polyPoints.length >= 3) {
            return pointInPoly(l.lat!, l.lng!, polyPoints);
          }
          return false;
        })
        .map(l => l.id)
    );
  }, [geoLeads, radiusCenter, radiusMiles, polyClosed, polyPoints, drawMode]);

  // Visible leads (layer filtered)
  const visibleLeads = useMemo(
    () => geoLeads.filter(l => layers.has(l.leadType)),
    [geoLeads, layers]
  );

  const toggleLayer = useCallback((t: LeadType) => {
    setLayers(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }, []);

  function startDraw(mode: "radius" | "polygon") {
    setDrawMode(mode);
    setRadiusCenter(null);
    setPolyPoints([]);
    setPolyClosed(false);
    setFarmCount(null);
  }

  function handleMapPoint(lat: number, lng: number) {
    if (drawMode === "radius") {
      setRadiusCenter([lat, lng]);
    } else if (drawMode === "polygon") {
      setPolyPoints(prev => [...prev, [lat, lng]]);
    }
  }

  function closePolygon() {
    if (polyPoints.length >= 3) setPolyClosed(true);
    setDrawMode(null);
  }

  function clearDraw() {
    setDrawMode(null);
    setRadiusCenter(null);
    setPolyPoints([]);
    setPolyClosed(false);
    setFarmCount(null);
  }

  function generateFarm() {
    if (inAreaIds.size === 0) return;
    setFarmCount(inAreaIds.size);
    onFarmGenerated(new Set(inAreaIds));
    setSidebarOpen(false);
  }

  const hasArea = radiusCenter !== null || polyClosed;

  // PCS hotspot quick-nav
  const HOTSPOTS = [
    { label: "Brickell",      center: [25.7617, -80.1948] as [number, number], zoom: 13 },
    { label: "Coral Gables",  center: [25.7215, -80.2684] as [number, number], zoom: 13 },
    { label: "Aventura",      center: [25.9565, -80.1390] as [number, number], zoom: 13 },
    { label: "Pinecrest",     center: [25.6645, -80.3132] as [number, number], zoom: 13 },
    { label: "Wynwood",       center: [25.7997, -80.1986] as [number, number], zoom: 14 },
    { label: "Coconut Grove", center: [25.7314, -80.2383] as [number, number], zoom: 14 },
  ];

  const LAYER_ITEMS: { type: LeadType; label: string }[] = [
    { type: "Expired",         label: "Expireds"          },
    { type: "FSBO",            label: "FSBOs"             },
    { type: "FRBO",            label: "FRBOs"             },
    { type: "Pre-Foreclosure", label: "Pre-Foreclosures"  },
    { type: "Absentee",        label: "Absentee Owners"   },
    { type: "High Equity",     label: "High Equity"       },
  ];

  return (
    <div className="flex h-full relative">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="lg:hidden absolute inset-0 z-[499] bg-black/40"
          onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      {/* ── Left panel ──────────────────────────────────── */}
      <aside className={cn(
        "flex flex-col bg-white border-r border-line overflow-hidden flex-shrink-0",
        "absolute inset-y-0 left-0 z-[500] w-72 transition-transform duration-300",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        "lg:relative lg:translate-x-0 lg:shadow-none"
      )}>

        {/* Header */}
        <div className="px-4 py-4 border-b border-line flex-shrink-0 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-axen-dark">Geo Farming</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{geoLeads.length} mapped leads · Miami metro</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} aria-label="Close panel"
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-axen-dark hover:bg-surface-2 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">

          {/* Layer toggles */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <Layers size={13} className="text-gold" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Layers</p>
            </div>
            <div className="space-y-1.5">
              {LAYER_ITEMS.map(({ type, label }) => {
                const on = layers.has(type);
                const color = TYPE_COLOR[type];
                return (
                  <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={on} onChange={() => toggleLayer(type)}
                      className="rounded border-line accent-yellow-500 flex-shrink-0" />
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className={cn("text-xs font-medium transition-colors", on ? "text-axen-dark" : "text-gray-400")}>
                      {label}
                    </span>
                    <span className="ml-auto text-[10px] text-gray-400">
                      {SELLER_LEADS.filter(l => l.leadType === type && l.lat).length}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Heatmap toggle */}
          <div className="px-4 pb-3 border-b border-line">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <button
                role="switch"
                aria-checked={showHeatmap}
                aria-label="Toggle heatmap"
                onClick={() => setShowHeatmap(v => !v)}
                className={cn(
                  "relative w-9 h-5 rounded-full transition-colors flex-shrink-0",
                  showHeatmap ? "bg-gold" : "bg-gray-200"
                )}
              >
                <span className={cn(
                  "absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform",
                  showHeatmap ? "translate-x-[18px]" : "translate-x-[3px]"
                )} />
              </button>
              <span className="text-xs font-medium text-axen-dark">Motivation Heatmap</span>
            </label>
          </div>

          {/* Draw tools */}
          <div className="px-4 py-3 border-b border-line">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Draw Farm Area</p>
            {!drawMode && !hasArea && (
              <div className="flex gap-2">
                <button onClick={() => startDraw("radius")}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-2 border border-line rounded-xl text-xs font-semibold text-gray-600 hover:border-gold hover:text-gold transition-colors">
                  <Crosshair size={13} /> Radius
                </button>
                <button onClick={() => startDraw("polygon")}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-2 border border-line rounded-xl text-xs font-semibold text-gray-600 hover:border-gold hover:text-gold transition-colors">
                  <Hexagon size={13} /> Polygon
                </button>
              </div>
            )}

            {drawMode === "radius" && !radiusCenter && (
              <div className="bg-gold-light border border-gold/30 rounded-xl px-3 py-2.5 space-y-2">
                <p className="text-xs font-semibold text-gold-dark">Click the map to set the center point</p>
                <button onClick={clearDraw} className="text-[11px] text-gray-500 hover:text-rose-500 font-semibold">
                  Cancel
                </button>
              </div>
            )}

            {drawMode === "radius" && radiusCenter && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-axen-dark">
                  <span className="font-semibold">Radius</span>
                  <span className="font-bold text-gold">{radiusMiles} mi</span>
                </div>
                <input type="range" min={0.25} max={5} step={0.25} value={radiusMiles}
                  onChange={e => setRadiusMiles(Number(e.target.value))}
                  className="w-full accent-yellow-500" />
                <div className="flex gap-2">
                  <button onClick={clearDraw}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-surface-2 text-gray-500 hover:text-rose-500 transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            )}

            {drawMode === "polygon" && (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-500">
                  {polyPoints.length < 3
                    ? `Click to add points (${polyPoints.length}/3 min)`
                    : "Double-click to close polygon"}
                </p>
                <div className="flex gap-2">
                  <button onClick={closePolygon} disabled={polyPoints.length < 3}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                      polyPoints.length >= 3
                        ? "bg-axen-dark text-white hover:bg-gold hover:text-axen-dark"
                        : "bg-surface-2 text-gray-300 cursor-not-allowed"
                    )}>
                    <Check size={11} /> Close
                  </button>
                  <button onClick={clearDraw}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-lg bg-surface-2 text-gray-500 hover:text-rose-500 transition-all">
                    <X size={11} /> Cancel
                  </button>
                </div>
              </div>
            )}

            {hasArea && drawMode === null && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-axen-dark">
                  {inAreaIds.size} lead{inAreaIds.size !== 1 ? "s" : ""} in area
                </p>
                {farmCount !== null && (
                  <p className="text-[11px] text-emerald-600 font-semibold">
                    ✓ {farmCount} leads sent to Seller Leads tab
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={generateFarm}
                    disabled={inAreaIds.size === 0}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-colors",
                      inAreaIds.size > 0
                        ? "bg-gold text-axen-dark hover:bg-gold-dark"
                        : "bg-surface-2 text-gray-300 cursor-not-allowed"
                    )}>
                    <RefreshCw size={12} /> Generate Farm List
                  </button>
                  <button onClick={clearDraw}
                    className="p-2 rounded-xl bg-surface-2 text-gray-500 hover:text-rose-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick navigation */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Quick Navigate</p>
            <div className="grid grid-cols-2 gap-1.5">
              {HOTSPOTS.map(h => (
                <button key={h.label} onClick={() => { setMapCenter(h.center); setMapZoom(h.zoom); }}
                  className="text-[11px] font-semibold text-gray-600 border border-line bg-surface-2 rounded-lg px-2.5 py-1.5 hover:border-gold hover:text-gold transition-colors truncate text-left">
                  {h.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </aside>

      {/* ── Map ─────────────────────────────────────────── */}
      <div className="flex-1 relative">

        {/* Mobile toggle */}
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} aria-label="Open layers panel"
            className="lg:hidden absolute top-3 left-3 z-[400] flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-xl shadow-md text-xs font-bold text-axen-dark">
            <Layers size={13} className="text-gold" /> Layers
          </button>
        )}

        <MapContainer center={MIAMI_CENTER} zoom={11}
          style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>'
            subdomains="abcd" maxZoom={20}
          />

          <MapController center={mapCenter} zoom={mapZoom} />
          <ZoomButtons />
          <DrawHandler
            mode={drawMode ?? "polygon"}
            active={drawMode !== null}
            onPoint={handleMapPoint}
            onDblClick={closePolygon}
            canClose={polyPoints.length >= 3}
          />
          <MapCursor active={drawMode !== null} />

          {/* Radius circle */}
          {radiusCenter && (
            <Circle
              center={radiusCenter}
              radius={radiusMiles * MILES_TO_M}
              pathOptions={{ color: "#D4AF37", weight: 2, fillColor: "#D4AF37", fillOpacity: 0.06, dashArray: "8 5" }}
            />
          )}

          {/* Polygon in-progress */}
          {polyPoints.length >= 2 && !polyClosed && (
            <Polyline positions={polyPoints} pathOptions={{ color: "#D4AF37", weight: 2, dashArray: "6 4" }} />
          )}

          {/* Closed polygon */}
          {polyClosed && polyPoints.length >= 3 && (
            <Polygon positions={polyPoints}
              pathOptions={{ color: "#D4AF37", weight: 2, fillColor: "#D4AF37", fillOpacity: 0.07 }} />
          )}

          {/* Lead markers */}
          {visibleLeads.map(lead => {
            const inArea = inAreaIds.has(lead.id);
            return (
              <Marker
                key={lead.id}
                position={[lead.lat!, lead.lng!]}
                icon={makeLeadIcon(lead, showHeatmap, !hasArea || inArea)}
                zIndexOffset={inArea ? 500 : 0}
              >
                <Popup closeButton={false} maxWidth={230} minWidth={210}>
                  <div style={{ fontFamily: "system-ui, sans-serif", padding: "4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: TYPE_COLOR[lead.leadType], display: "flex",
                        alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: 11,
                      }}>
                        {lead.leadType.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 12, color: "#1A1A2E", marginBottom: 2 }}>
                          {lead.address}
                        </p>
                        <p style={{ fontSize: 10, color: "#6B7280" }}>{lead.city}, {lead.state}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, marginBottom: 8 }}>
                      <div>
                        <p style={{ fontWeight: 700, color: "#1A1A2E" }}>{lead.estimatedEquity}%</p>
                        <p style={{ color: "#9CA3AF" }}>Equity</p>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: lead.motivationScore >= 70 ? "#D4AF37" : "#1A1A2E" }}>
                          {lead.motivationScore >= 70 ? `🔥 ${lead.motivationScore}` : lead.motivationScore}
                        </p>
                        <p style={{ color: "#9CA3AF" }}>Score</p>
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: "#1A1A2E" }}>{lead.daysSinceEvent}d</p>
                        <p style={{ color: "#9CA3AF" }}>Since event</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 10, color: "#6B7280", marginBottom: 8, lineHeight: 1.4 }}>
                      {lead.ownerName}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 z-[400] bg-white border border-line rounded-xl px-3 py-2.5 shadow-md">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            {showHeatmap ? "Motivation" : "Lead Type"}
          </p>
          {showHeatmap ? (
            <div className="space-y-1">
              {[["🔴 80+", "#DC2626"], ["🟠 60–79", "#F97316"], ["🟡 40–59", "#FBBF24"], ["🔵 < 40", "#3B82F6"]].map(([l, c]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: c as string }} />
                  <span className="text-[10px] text-gray-600">{l as string}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {LAYER_ITEMS.filter(i => layers.has(i.type)).map(({ type, label }) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: TYPE_COLOR[type] }} />
                  <span className="text-[10px] text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Area badge */}
        {hasArea && (
          <div className="absolute top-3 left-3 z-[400] bg-white border border-gold/40 rounded-xl px-3 py-2 shadow-md flex items-center gap-2 lg:left-3">
            <MapPin size={12} className="text-gold" />
            <span className="text-xs font-bold text-axen-dark">{inAreaIds.size} leads in farm area</span>
          </div>
        )}
      </div>
    </div>
  );
}
