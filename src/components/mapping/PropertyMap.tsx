"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Pen, X, Check, Users } from "lucide-react";
import type { Property } from "@/types/property";
import { cn, formatCurrency } from "@/lib/utils";
import PropertyCard from "./PropertyCard";

// ─── Point-in-polygon (ray casting) ──────────────────────────
function pointInPolygon(lat: number, lng: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [lati, lngi] = poly[i];
    const [latj, lngj] = poly[j];
    const intersect = lngi > lng !== lngj > lng &&
      lat < ((latj - lati) * (lng - lngi)) / (lngj - lngi) + lati;
    if (intersect) inside = !inside;
  }
  return inside;
}

// ─── Marker color by status / price ──────────────────────────
function markerColors(p: Property, selected: boolean) {
  if (selected) return { bg: "#1A1A2E", text: "#D4AF37", border: "#D4AF37" };
  switch (p.status) {
    case "Price Reduced": return { bg: "#EF4444", text: "#fff",     border: "#DC2626" };
    case "Pending":       return { bg: "#F59E0B", text: "#fff",     border: "#D97706" };
    case "Coming Soon":   return { bg: "#8B5CF6", text: "#fff",     border: "#7C3AED" };
    default:
      if (p.price >= 1_000_000) return { bg: "#D4AF37", text: "#1A1A2E", border: "#B8962E" };
      return { bg: "#fff", text: "#1A1A2E", border: "#D4AF37" };
  }
}

function fmtMarkerPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`;
  if (price >= 1_000) return `$${Math.round(price / 1_000)}K`;
  return `$${price}`;
}

function createIcon(p: Property, selected: boolean): L.DivIcon {
  const { bg, text, border } = markerColors(p, selected);
  const label = fmtMarkerPrice(p.price);
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${bg};color:${text};border:2px solid ${border};
      padding:3px 7px;border-radius:20px;font-size:11px;font-weight:700;
      white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,0.25);
      font-family:system-ui,sans-serif;line-height:1.4;
      cursor:pointer;transition:transform 0.1s ease;
      position:relative;display:inline-block;
    ">${label}<span style="
      position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);
      width:0;height:0;
      border-left:4px solid transparent;border-right:4px solid transparent;
      border-top:5px solid ${border};
    "></span></div>`,
    iconSize:   [64, 28],
    iconAnchor: [32, 28],
    popupAnchor:[0, -30],
  });
}

// ─── Drawing mode event handler ───────────────────────────────
function DrawHandler({
  active,
  onPoint,
  onClose,
  canClose,
}: {
  active: boolean;
  onPoint: (lat: number, lng: number) => void;
  onClose: () => void;
  canClose: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!active) return;
      // Prevent the click that fires immediately after a dblclick from adding a point
      if ((e.originalEvent as MouseEvent & { _dblclickHandled?: boolean })._dblclickHandled) return;
      onPoint(e.latlng.lat, e.latlng.lng);
    },
    dblclick(e) {
      if (!active || !canClose) return;
      // Mark the event so the follow-up click handler skips it
      (e.originalEvent as MouseEvent & { _dblclickHandled?: boolean })._dblclickHandled = true;
      onClose();
    },
  });
  return null;
}

// ─── Map cursor + dblclick-zoom suppression during draw ───────
function MapControls({ drawing }: { drawing: boolean }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.getContainer().style.cursor = drawing ? "crosshair" : "";
    if (drawing) map.doubleClickZoom.disable();
    else         map.doubleClickZoom.enable();
  }, [drawing, map]);
  return null;
}

function ZoomButtons() {
  const map = useMapEvents({});
  return (
    <div className="absolute top-3 right-3 z-[400] flex flex-col gap-1">
      {([["＋", 1], ["－", -1]] as [string, number][]).map(([label, delta]) => (
        <button
          key={label}
          aria-label={delta > 0 ? "Zoom in" : "Zoom out"}
          onClick={() => map.setZoom(map.getZoom() + delta)}
          className="w-8 h-8 bg-white border border-line rounded-lg font-bold text-axen-dark hover:bg-gold-light hover:text-gold shadow-sm flex items-center justify-center transition-colors text-sm"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Main map component ───────────────────────────────────────
interface PropertyMapProps {
  properties: Property[];
  selectedId: string | null;
  onSelect: (p: Property) => void;
}

export default function PropertyMap({ properties, selectedId, onSelect }: PropertyMapProps) {
  const [drawing, setDrawing] = useState(false);
  const [polyPoints, setPolyPoints] = useState<[number, number][]>([]);
  const [closedPoly, setClosedPoly] = useState(false);
  const savedProperties = useRef<Set<string>>(new Set());

  const insidePoly = closedPoly
    ? properties.filter((p) => pointInPolygon(p.coordinates.lat, p.coordinates.lng, polyPoints))
    : [];

  const addPoint = useCallback((lat: number, lng: number) => {
    setPolyPoints((prev) => [...prev, [lat, lng]]);
  }, []);

  function startDraw() {
    setPolyPoints([]);
    setClosedPoly(false);
    setDrawing(true);
  }

  function closeDraw() {
    if (polyPoints.length >= 3) setClosedPoly(true);
    setDrawing(false);
  }

  function clearDraw() {
    setPolyPoints([]);
    setClosedPoly(false);
    setDrawing(false);
  }

  // Miami center
  const center: [number, number] = [25.7890, -80.1987];

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        {/* CartoDB Voyager — clean, premium look, no API key */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        <DrawHandler
          active={drawing}
          onPoint={addPoint}
          onClose={closeDraw}
          canClose={polyPoints.length >= 3}
        />
        <MapControls drawing={drawing} />
        <ZoomButtons />

        {/* Property markers */}
        {properties.map((p) => (
          <Marker
            key={p.id}
            position={[p.coordinates.lat, p.coordinates.lng]}
            icon={createIcon(p, selectedId === p.id)}
            zIndexOffset={selectedId === p.id ? 1000 : 0}
          >
            <Popup className="property-popup" maxWidth={272} minWidth={272} closeButton={false}>
              <PropertyCard
                property={p}
                onViewDetails={(prop) => { onSelect(prop); }}
                onSave={(prop) => { savedProperties.current.add(prop.id); }}
              />
            </Popup>
          </Marker>
        ))}

        {/* Drawing preview polyline (in-progress) */}
        {polyPoints.length >= 2 && !closedPoly && (
          <Polyline
            positions={polyPoints}
            pathOptions={{ color: "#D4AF37", weight: 2, dashArray: "6 4" }}
          />
        )}

        {/* Closed polygon */}
        {closedPoly && polyPoints.length >= 3 && (
          <Polygon
            positions={polyPoints}
            pathOptions={{ color: "#D4AF37", weight: 2, fillColor: "#D4AF37", fillOpacity: 0.08 }}
          />
        )}
      </MapContainer>

      {/* ── Drawing toolbar overlay ─────────────────────────── */}
      <div className="absolute top-3 left-3 z-[400] flex flex-col gap-2">
        {!drawing && !closedPoly && (
          <button
            onClick={startDraw}
            className="flex items-center gap-2 px-3 py-2 bg-white text-axen-dark text-xs font-bold rounded-xl shadow-md border border-line hover:border-gold hover:bg-gold-light transition-all"
          >
            <Pen size={13} className="text-gold" />
            Draw Territory
          </button>
        )}

        {drawing && (
          <div className="flex flex-col gap-1.5 bg-white rounded-xl shadow-md border border-line p-2">
            <p className="text-[10px] font-bold text-gray-500 px-1">
              {polyPoints.length < 3
                ? `Click to add points (${polyPoints.length}/3 min)`
                : "Double-click or press Finish"}
            </p>
            <div className="flex gap-1">
              <button
                onClick={closeDraw}
                disabled={polyPoints.length < 3}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                  polyPoints.length >= 3
                    ? "bg-axen-dark text-white hover:bg-gold hover:text-axen-dark"
                    : "bg-surface-2 text-gray-300 cursor-not-allowed"
                )}
              >
                <Check size={12} /> Finish
              </button>
              <button
                onClick={clearDraw}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-surface-2 text-gray-500 hover:text-rose-500 transition-all"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        )}

        {closedPoly && (
          <div className="flex flex-col gap-1.5 bg-white rounded-xl shadow-md border border-gold/40 p-3 min-w-[180px]">
            <div className="flex items-center gap-2">
              <Users size={13} className="text-gold" />
              <p className="text-xs font-bold text-axen-dark">
                {insidePoly.length} {insidePoly.length === 1 ? "property" : "properties"} inside
              </p>
            </div>
            {insidePoly.length > 0 && (
              <p className="text-[10px] text-gray-400">
                Avg: {formatCurrency(Math.round(insidePoly.reduce((s, p) => s + p.price, 0) / insidePoly.length))}
              </p>
            )}
            <div className="flex gap-1 mt-1">
              <button
                onClick={startDraw}
                className="flex-1 text-[10px] font-bold py-1.5 bg-gold-light text-gold-dark rounded-lg hover:bg-gold hover:text-axen-dark transition-all"
              >
                Redraw
              </button>
              <button
                onClick={clearDraw}
                className="flex-1 text-[10px] font-bold py-1.5 bg-surface-2 text-gray-500 rounded-lg hover:text-rose-500 transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
