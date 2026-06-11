"use client";

import { useEffect, useRef, useState } from "react";
import {
  X, Bed, Bath, Square, Calendar, MapPin, DollarSign, TrendingDown,
  Bookmark, Send, UserPlus, Calculator, Home, BarChart3, Users,
  Zap, CheckCircle, Clock, Layers, Eye, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { Property } from "@dravik/contracts/realty";
import { cn, formatCurrency } from "@dravik/shared";
import { StatusBadge, LeadScoreBadge } from "./PropertyCard";

type Tab = "overview" | "photos" | "mortgage" | "comps" | "outreach";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview",  label: "Overview",   icon: Home       },
  { id: "photos",    label: "Photos",     icon: Layers     },
  { id: "mortgage",  label: "Mortgage",   icon: Calculator },
  { id: "comps",     label: "Comps",      icon: BarChart3  },
  { id: "outreach",  label: "Outreach",   icon: Users      },
];

// ─── Shared slider row (module-level — not defined inside render) ─
function SliderRow({ label, value, min, max, step, onChange, fmt }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; fmt: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className="font-bold text-axen-dark">{fmt(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="gold-slider w-full"
        style={{ background: `linear-gradient(to right, #D4AF37 ${pct}%, #E8E8E8 ${pct}%)` }}
      />
    </div>
  );
}

// ─── Mortgage teaser calculator ───────────────────────────────
function MortgageTab({ property: p }: { property: Property }) {
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(6.875);
  const [years, setYears] = useState(30);

  const loanAmt = p.price * (1 - down / 100);
  const mo = rate / 100 / 12;
  const n = years * 12;
  const monthly = mo > 0 ? (loanAmt * mo * Math.pow(1 + mo, n)) / (Math.pow(1 + mo, n) - 1) : loanAmt / n;
  const withTaxHoa = monthly + p.taxesAnnual / 12 + (p.hoaMonthly ?? 0);

  return (
    <div className="p-5 space-y-4">
      <p className="text-xs text-gray-400">Estimate monthly payment for {p.address}</p>
      <div className="space-y-4">
        <SliderRow label="Down Payment" value={down} min={3} max={50} step={1}
          onChange={setDown} fmt={(v) => `${v}%`} />
        <SliderRow label="Interest Rate" value={rate} min={3} max={12} step={0.125}
          onChange={setRate} fmt={(v) => `${v.toFixed(3)}%`} />
        <SliderRow label="Loan Term" value={years} min={10} max={30} step={5}
          onChange={setYears} fmt={(v) => `${v} yr`} />
      </div>

      <div className="bg-gold-light border border-gold/30 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Est. Monthly Payment</p>
        <p className="text-2xl font-bold text-axen-dark mt-1 tabular-nums">
          {formatCurrency(Math.round(withTaxHoa))}
          <span className="text-sm font-normal text-gray-400">/mo</span>
        </p>
        <div className="mt-2 space-y-1 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Principal & Interest</span>
            <span className="font-semibold text-axen-dark">{formatCurrency(Math.round(monthly))}</span>
          </div>
          <div className="flex justify-between">
            <span>Property Tax</span>
            <span className="font-semibold text-axen-dark">{formatCurrency(Math.round(p.taxesAnnual / 12))}</span>
          </div>
          {(p.hoaMonthly ?? 0) > 0 && (
            <div className="flex justify-between">
              <span>HOA</span>
              <span className="font-semibold text-axen-dark">{formatCurrency(p.hoaMonthly!)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-gold/20">
            <span>Loan Amount</span>
            <span className="font-semibold text-axen-dark">{formatCurrency(Math.round(loanAmt))}</span>
          </div>
        </div>
      </div>
      <button className="w-full py-2.5 text-sm font-bold bg-axen-dark text-white rounded-xl hover:bg-gold hover:text-axen-dark transition-all">
        Connect with Mortgage Officer
      </button>
    </div>
  );
}

// ─── Comparable sales (mock) ──────────────────────────────────
const COMP_OFFSETS = [
  { delta: -0.08, dom: 18, sqft: -120, sold: "Sold 3w ago" },
  { delta: +0.04, dom: 7,  sqft: +85,  sold: "Sold 6w ago" },
  { delta: -0.12, dom: 32, sqft: -250, sold: "Sold 8w ago" },
];
function CompsTab({ property: p }: { property: Property }) {
  return (
    <div className="p-5 space-y-3">
      <p className="text-xs text-gray-400">Recent comparable sales within 1 mi</p>
      {COMP_OFFSETS.map((c, i) => {
        const compPrice = Math.round(p.price * (1 + c.delta));
        const compSqft = p.sqft + c.sqft;
        return (
          <div key={i} className="flex items-center justify-between py-3 px-3 bg-surface-2 rounded-xl">
            <div>
              <p className="text-sm font-bold text-axen-dark">{formatCurrency(compPrice)}</p>
              <p className="text-xs text-gray-400">
                {p.beds}bd · {compSqft.toLocaleString()} sqft · {c.sold}
              </p>
            </div>
            <div className="text-right">
              <p className={cn("text-xs font-bold", c.delta > 0 ? "text-emerald-500" : "text-rose-500")}>
                {c.delta > 0 ? "+" : ""}{Math.round(c.delta * 100)}%
              </p>
              <p className="text-[10px] text-gray-400">${Math.round(compPrice / compSqft).toLocaleString()}/sqft</p>
            </div>
          </div>
        );
      })}
      <div className="bg-surface-2 rounded-xl px-3 py-3 flex justify-between text-xs">
        <span className="text-gray-500">Average Comp Price</span>
        <span className="font-bold text-axen-dark">
          {formatCurrency(Math.round(COMP_OFFSETS.reduce((s, c) => s + p.price * (1 + c.delta), 0) / 3))}
        </span>
      </div>
    </div>
  );
}

// ─── Client outreach actions ──────────────────────────────────
function OutreachTab({ property: p }: { property: Property }) {
  const [created, setCreated] = useState(false);
  return (
    <div className="p-5 space-y-4">
      <div className="bg-gold-light border border-gold/30 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-gold-dark mb-0.5">Lead Potential Score</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gold/20 rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full" style={{ width: `${p.leadScore}%` }} />
          </div>
          <span className="text-sm font-bold text-axen-dark tabular-nums">{p.leadScore}</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1.5">
          {p.viewedThisWeek} views this week · {p.savedCount} saves
        </p>
      </div>

      {!created ? (
        <button
          onClick={() => setCreated(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-axen-dark text-white font-bold text-sm rounded-xl hover:bg-gold hover:text-axen-dark transition-all"
        >
          <UserPlus size={16} />
          Create Lead from Property
        </button>
      ) : (
        <div className="flex items-center gap-2 py-3 px-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-700">
            Lead created! Opening in Lead Engine…
          </p>
        </div>
      )}

      <div className="space-y-2">
        {[
          { icon: Send, label: "Send to Client via Email", sub: "Share listing details" },
          { icon: Users, label: "Match to Existing Leads",  sub: "Find leads in this price range" },
          { icon: Zap,  label: "Schedule AI Follow-Up",     sub: "Auto-nurture sequence" },
        ].map(({ icon: Icon, label, sub }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 px-4 py-3 bg-surface-2 rounded-xl hover:bg-gold-light transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
              <Icon size={15} className="text-gold" />
            </div>
            <div>
              <p className="text-xs font-bold text-axen-dark">{label}</p>
              <p className="text-[10px] text-gray-400">{sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main panel ────────────────────────────────────────────────
interface PropertyPanelProps {
  property: Property | null;
  open: boolean;
  onClose: () => void;
}

export default function PropertyPanel({ property: p, open, onClose }: PropertyPanelProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [photoIdx, setPhotoIdx] = useState(0);
  const [trackedPropId, setTrackedPropId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Reset tab/photo when the selected property changes (derived-state pattern,
  // called during render to avoid an extra effect → render cycle).
  if (p && p.id !== trackedPropId) {
    setTrackedPropId(p.id);
    setTab("overview");
    setPhotoIdx(0);
  }

  // Focus management — pure DOM side-effect, no setState here.
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement as HTMLElement;
      closeRef.current?.focus();
    } else {
      prevFocusRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>(
        "button:not([disabled]),a[href],input,[tabindex]:not([tabindex=\"-1\"])"
      ));
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!p) return null;

  const allImages = [p.heroImage, ...p.images];

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Property details: ${p.address}`}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl",
          "w-full md:w-[640px]",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Hero + header ─────────────────────────────────── */}
        <div className="flex-shrink-0 relative h-[200px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={allImages[photoIdx]} alt={p.address} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Close */}
          <button
            ref={closeRef}
            aria-label="Close panel"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>

          {/* Photo nav */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1">
              <button
                onClick={() => setPhotoIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-white text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded-full">
                {photoIdx + 1}/{allImages.length}
              </span>
              <button
                onClick={() => setPhotoIdx((i) => (i + 1) % allImages.length)}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Price + status overlay */}
          <div className="absolute bottom-3 left-4">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={p.status} />
              {p.newConstruction && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500 text-white">
                  New Construction
                </span>
              )}
            </div>
            <p className="text-white font-bold text-xl">
              {formatCurrency(p.price)}
              {p.originalPrice && (
                <span className="text-sm font-normal text-white/60 line-through ml-2">
                  {formatCurrency(p.originalPrice)}
                </span>
              )}
            </p>
            <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={11} />
              {p.address}, {p.city}, {p.state}
            </p>
          </div>
        </div>

        {/* ── Key stats strip ────────────────────────────────── */}
        <div className="flex-shrink-0 flex items-center divide-x divide-line border-b border-line bg-surface px-2">
          {[
            { icon: Bed,      value: p.beds,                          label: "Beds"   },
            { icon: Bath,     value: p.baths,                         label: "Baths"  },
            { icon: Square,   value: p.sqft.toLocaleString(),         label: "Sqft"   },
            { icon: Calendar, value: p.yearBuilt,                     label: "Built"  },
            { icon: Clock,    value: p.daysOnMarket === 0 ? "New" : `${p.daysOnMarket}d`, label: "DOM" },
            { icon: Eye,      value: p.viewedThisWeek,                label: "Views"  },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex-1 flex flex-col items-center py-2.5 gap-0.5">
              <Icon size={13} className="text-gold" />
              <span className="text-sm font-bold text-axen-dark">{value}</span>
              <span className="text-[9px] text-gray-400 uppercase tracking-wide">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Tabs ──────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex border-b border-line overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors",
                tab === id
                  ? "border-gold text-axen-dark"
                  : "border-transparent text-gray-400 hover:text-axen-dark"
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab body ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {tab === "overview" && (
            <div className="p-5 space-y-5">
              {/* Action buttons */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold bg-axen-dark text-white rounded-xl hover:bg-gold hover:text-axen-dark transition-all">
                  <Bookmark size={14} /> Save Listing
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold border border-line text-axen-dark rounded-xl hover:bg-surface-2 transition-all">
                  <Send size={14} /> Send to Client
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold border border-gold/40 text-gold rounded-xl hover:bg-gold-light transition-all">
                  <UserPlus size={14} /> Create Lead
                </button>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About this property</h3>
                <p className="text-sm text-axen-dark leading-relaxed">{p.description}</p>
              </div>

              {/* Key details grid */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Property Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "MLS#", value: p.mlsNumber },
                    { label: "Type", value: p.type },
                    { label: "Lot Size", value: p.lotSqft > 0 ? `${p.lotSqft.toLocaleString()} sqft` : "N/A" },
                    { label: "Garage", value: p.garage > 0 ? `${p.garage} car` : "None" },
                    { label: "HOA/mo", value: p.hoaMonthly ? formatCurrency(p.hoaMonthly) : "None" },
                    { label: "Taxes/yr", value: formatCurrency(p.taxesAnnual) },
                    { label: "$/sqft", value: `$${p.pricePerSqft.toLocaleString()}` },
                    { label: "Neighborhood", value: p.neighborhood },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 px-3 bg-surface-2 rounded-lg">
                      <span className="text-xs text-gray-400">{label}</span>
                      <span className="text-xs font-semibold text-axen-dark">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Features</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.features.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-xs bg-surface-2 text-axen-dark px-2.5 py-1 rounded-full border border-line">
                      <CheckCircle size={11} className="text-gold" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Lead score */}
              <div className="flex items-center justify-between py-3 px-4 bg-surface-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-gold" />
                  <span className="text-sm font-semibold text-axen-dark">Lead Opportunity Score</span>
                </div>
                <LeadScoreBadge score={p.leadScore} />
              </div>
            </div>
          )}

          {tab === "photos" && (
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setPhotoIdx(i); setTab("overview"); }}
                    className={cn(
                      "aspect-video rounded-xl overflow-hidden ring-2 transition-all",
                      photoIdx === i ? "ring-gold" : "ring-transparent hover:ring-gold/40"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "mortgage" && <MortgageTab property={p} />}
          {tab === "comps"    && <CompsTab property={p} />}
          {tab === "outreach" && <OutreachTab property={p} />}
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-line px-5 py-3 flex items-center justify-between bg-surface">
          <div>
            <p className="text-[10px] text-gray-400">Listing courtesy of Axen Realty IDX · MLS #{p.mlsNumber}</p>
            {p.status === "Price Reduced" && p.originalPrice && (
              <p className="text-[10px] text-rose-500 flex items-center gap-1 mt-0.5">
                <TrendingDown size={9} />
                Reduced {formatCurrency(p.originalPrice - p.price)} from original list price
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-400 hover:text-axen-dark px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
