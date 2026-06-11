"use client";

import { useRef, useEffect, useState } from "react";
import {
  X, Rocket, Check, Edit, Bed, Bath, Square,
  Phone, Mail, DollarSign, MapPin, ExternalLink, ChevronDown,
} from "lucide-react";
import { SAMPLE_PROPERTIES } from "@/data/properties";
import { cn, formatCurrency } from "@/lib/utils";

// ─── Mini property page preview (rendered inside panel) ───────
interface PagePreviewProps {
  propertyId: string;
  headline: string;
  agentName: string;
  agentTitle: string;
}

function MiniPropertyPage({ propertyId, headline, agentName, agentTitle }: PagePreviewProps) {
  const property = SAMPLE_PROPERTIES.find((p) => p.id === propertyId) ?? SAMPLE_PROPERTIES[0];
  const p = property;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl text-sm font-sans select-none">
      {/* Browser chrome */}
      <div className="bg-surface-2 px-3 py-2 flex items-center gap-2 border-b border-line">
        <div className="flex gap-1">
          {["bg-rose-400","bg-amber-400","bg-emerald-400"].map((c) => (
            <span key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
          ))}
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-gray-400 border border-line truncate">
          axenone.co/p/{p.city.toLowerCase().replace(" ", "-")}-{p.id}
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.heroImage} alt={p.address} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-white font-bold text-base leading-tight">{headline}</p>
          <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
            <MapPin size={10} />{p.address}, {p.city}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center divide-x divide-line border-b border-line bg-surface px-3 py-2">
        {[
          { icon: DollarSign, v: formatCurrency(p.price) },
          { icon: Bed,        v: `${p.beds} Beds`        },
          { icon: Bath,       v: `${p.baths} Baths`      },
          { icon: Square,     v: `${p.sqft.toLocaleString()} sqft` },
        ].map(({ icon: Icon, v }) => (
          <div key={v} className="flex-1 flex flex-col items-center py-1 gap-0.5">
            <Icon size={12} className="text-gold" />
            <span className="text-[10px] font-bold text-axen-dark">{v}</span>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{p.description}</p>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-1">
          {p.features.slice(0, 4).map((f) => (
            <span key={f} className="text-[9px] font-semibold bg-surface-2 text-gray-500 px-1.5 py-0.5 rounded-full border border-line">
              {f}
            </span>
          ))}
        </div>

        {/* CTA form mock */}
        <div className="bg-gold-light border border-gold/30 rounded-xl p-3">
          <p className="text-[10px] font-bold text-axen-dark mb-2">Request a Private Showing</p>
          <div className="space-y-1.5">
            {["Name","Email","Phone"].map((ph) => (
              <div key={ph} className="w-full h-6 bg-white rounded-md border border-line" />
            ))}
            <div className="w-full h-7 bg-axen-dark rounded-md" />
          </div>
        </div>

        {/* Agent footer */}
        <div className="flex items-center gap-2 pt-1 border-t border-line">
          <div className="w-7 h-7 rounded-full bg-axen-dark flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {agentName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-[10px] font-bold text-axen-dark">{agentName}</p>
            <p className="text-[9px] text-gray-400">{agentTitle}</p>
          </div>
          <div className="ml-auto flex gap-1">
            <div className="w-5 h-5 bg-surface-2 rounded-md flex items-center justify-center">
              <Phone size={9} className="text-gold" />
            </div>
            <div className="w-5 h-5 bg-surface-2 rounded-md flex items-center justify-center">
              <Mail size={9} className="text-gold" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────
interface PropertyPagePreviewProps {
  open: boolean;
  onClose: () => void;
}

export default function PropertyPagePreview({ open, onClose }: PropertyPagePreviewProps) {
  const panelRef  = useRef<HTMLDivElement>(null);
  const closeRef  = useRef<HTMLButtonElement>(null);
  const prevRef   = useRef<HTMLElement | null>(null);

  const [trackedOpen, setTrackedOpen] = useState(false);
  const [propertyId, setPropertyId] = useState(SAMPLE_PROPERTIES[0].id);
  const [headline, setHeadline]     = useState("Discover Exclusive Waterfront Living");
  const [agentName, setAgentName]   = useState("Chris Macabugao");
  const [agentTitle, setAgentTitle] = useState("Principal Broker · Axen Realty");
  const [published, setPublished]   = useState(false);
  const [pubUrl, setPubUrl]         = useState("");

  // Derived state: reset when panel opens
  if (open && !trackedOpen) {
    setTrackedOpen(true);
    setPropertyId(SAMPLE_PROPERTIES[0].id);
    setHeadline("Discover Exclusive Waterfront Living");
    setAgentName("Chris Macabugao");
    setAgentTitle("Principal Broker · Axen Realty");
    setPublished(false);
    setPubUrl("");
  }
  if (!open && trackedOpen) {
    setTrackedOpen(false);
  }

  const selectedProperty = SAMPLE_PROPERTIES.find((p) => p.id === propertyId) ?? SAMPLE_PROPERTIES[0];

  useEffect(() => {
    if (open) {
      prevRef.current = document.activeElement as HTMLElement;
      closeRef.current?.focus();
    } else {
      prevRef.current?.focus();
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
        "button:not([disabled]),input,select,[tabindex]:not([tabindex=\"-1\"])"
      ));
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handlePublish() {
    const slug = selectedProperty.city.toLowerCase().replace(/\s+/g, "-") + "-" + selectedProperty.id;
    setPubUrl(`axenone.co/p/${slug}`);
    setPublished(true);
  }

  return (
    <>
      <div
        aria-hidden
        className={cn("fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Property Page Generator"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex bg-white shadow-2xl",
          "w-full md:w-[860px]",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Left editor ─────────────────────────────── */}
        <div className="w-[320px] flex-shrink-0 flex flex-col border-r border-line overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-axen-dark">
            <div>
              <h2 className="text-white font-bold text-base">Property Site Generator</h2>
              <p className="text-gray-400 text-xs mt-0.5">One-click from saved property</p>
            </div>
            <button ref={closeRef} aria-label="Close" onClick={onClose}
              className="text-gray-400 hover:text-white p-1 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

            {/* Property selector */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Select Property
              </label>
              <div className="relative">
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 bg-surface-2 border border-transparent rounded-xl text-sm text-axen-dark focus:outline-none focus:border-gold appearance-none cursor-pointer"
                >
                  {SAMPLE_PROPERTIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.address} — {formatCurrency(p.price)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Selected property summary */}
              <div className="mt-2 p-3 bg-surface-2 rounded-xl flex items-center gap-3">
                <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedProperty.heroImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-axen-dark truncate">{selectedProperty.address}</p>
                  <p className="text-[10px] text-gray-400">{selectedProperty.city} · {formatCurrency(selectedProperty.price)}</p>
                </div>
              </div>
            </div>

            {/* Customization */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Page Customization</p>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Edit size={9} /> Hero Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-2 border border-transparent rounded-lg text-sm text-axen-dark focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-2 border border-transparent rounded-lg text-sm text-axen-dark focus:outline-none focus:border-gold transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Agent Title</label>
                <input
                  type="text"
                  value={agentTitle}
                  onChange={(e) => setAgentTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-2 border border-transparent rounded-lg text-sm text-axen-dark focus:outline-none focus:border-gold transition"
                />
              </div>
            </div>

            {/* Published URL */}
            {published && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Check size={13} className="text-emerald-500" />
                  <p className="text-xs font-bold text-emerald-700">Page Published!</p>
                </div>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:underline">
                  <ExternalLink size={10} />
                  {pubUrl}
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-line p-4 flex gap-2">
            <button
              onClick={handlePublish}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 font-bold text-sm rounded-xl transition-all",
                published
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-axen-dark text-white hover:bg-gold hover:text-axen-dark"
              )}
            >
              {published ? <><Check size={15} /> Update</> : <><Rocket size={15} /> Publish Page</>}
            </button>
          </div>
        </div>

        {/* ── Right: page preview ─────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-surface-2">
          <div className="flex-shrink-0 px-5 py-3 bg-white border-b border-line flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</p>
            {published && (
              <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-gold font-semibold flex items-center gap-1 hover:underline">
                <ExternalLink size={11} /> Open Live Page
              </a>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <MiniPropertyPage
              propertyId={propertyId}
              headline={headline}
              agentName={agentName}
              agentTitle={agentTitle}
            />
          </div>
        </div>
      </div>
    </>
  );
}
