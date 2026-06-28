"use client";

import { useRef, useEffect, useState } from "react";
import { X, Download, Share2, QrCode, Phone, Mail, Check } from "lucide-react";
import type { FlyerContent } from "@dravik/contracts/marketing";
import { FLYER_TEMPLATES } from "../data/marketing";
import { cn } from "@dravik/shared";

// ─── Flyer live preview (module-level) ───────────────────────
function LuxuryFlyer({ c }: { c: FlyerContent }) {
  return (
    <div className="w-full aspect-[8.5/11] bg-axen-dark text-white overflow-hidden relative font-sans select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://picsum.photos/seed/${c.imageSeed}/680/400`} alt=""
        className="w-full h-[46%] object-cover opacity-80" />
      <div className="absolute inset-x-0 top-[38%] h-20 bg-gradient-to-b from-transparent to-axen-dark" />
      <div className="px-8 py-5 space-y-4">
        <div>
          <p className="text-gold text-xs font-bold uppercase tracking-[0.2em] mb-1">Exclusively Presented By Axen Realty</p>
          <h1 className="text-2xl font-bold leading-tight">{c.headline}</h1>
          <p className="text-gray-400 text-sm mt-1">{c.address}</p>
        </div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-gold">{c.price}</span>
          <span className="text-sm text-gray-400">{c.beds} Beds · {c.baths} Baths · {c.sqft} Sqft</span>
        </div>
        <div className="border-t border-white/10 pt-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">{c.agentName}</p>
            <p className="text-xs text-gray-400">{c.agentPhone} · {c.agentEmail}</p>
          </div>
          <div className="w-10 h-10 bg-gold/20 border border-gold/40 rounded-lg flex items-center justify-center">
            <QrCode size={20} className="text-gold" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModernFlyer({ c }: { c: FlyerContent }) {
  return (
    <div className="w-full aspect-[8.5/11] bg-white overflow-hidden relative font-sans select-none border border-line">
      <div className="h-[50%] bg-surface-2 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://picsum.photos/seed/${c.imageSeed}/680/400`} alt=""
          className="w-full h-full object-cover" />
      </div>
      <div className="px-7 py-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-2xl font-black text-axen-dark">{c.price}</p>
            <h1 className="text-base font-bold text-axen-dark leading-tight mt-0.5">{c.headline}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{c.address}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-axen-dark">{c.beds}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Beds</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-gray-500 border-t border-line pt-3 mb-3">
          <span>{c.baths} Baths</span>
          <span>{c.sqft} Sqft</span>
        </div>
        <div className="flex items-center gap-3 bg-axen-dark text-white rounded-xl px-4 py-2.5">
          <div className="flex-1">
            <p className="font-bold text-sm">{c.agentName}</p>
            <p className="text-[10px] text-white/60">{c.agentPhone}</p>
          </div>
          <QrCode size={20} className="text-gold" />
        </div>
      </div>
    </div>
  );
}

function ClassicFlyer({ c }: { c: FlyerContent }) {
  return (
    <div className="w-full aspect-[8.5/11] bg-white overflow-hidden relative font-sans select-none border-2 border-[#4A90A4]">
      <div className="bg-[#4A90A4] text-white text-center py-3 px-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Axen Realty · For Sale</p>
      </div>
      <div className="h-[44%] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://picsum.photos/seed/${c.imageSeed}/680/400`} alt=""
          className="w-full h-full object-cover" />
      </div>
      <div className="px-6 py-4 text-center">
        <h1 className="text-xl font-bold text-axen-dark">{c.headline}</h1>
        <p className="text-gray-500 text-sm mt-0.5">{c.address}</p>
        <p className="text-2xl font-black text-[#4A90A4] mt-2">{c.price}</p>
        <div className="flex justify-center gap-4 text-sm text-gray-600 mt-1">
          <span>{c.beds} Bed</span>
          <span>·</span>
          <span>{c.baths} Bath</span>
          <span>·</span>
          <span>{c.sqft} Sqft</span>
        </div>
        <div className="border-t border-line mt-4 pt-3 flex items-center justify-center gap-2">
          <Phone size={12} className="text-[#4A90A4]" />
          <span className="text-sm font-semibold">{c.agentName} · {c.agentPhone}</span>
        </div>
      </div>
    </div>
  );
}

function MinimalFlyer({ c }: { c: FlyerContent }) {
  return (
    <div className="w-full aspect-[8.5/11] bg-white overflow-hidden relative font-sans select-none">
      <div className="relative h-[65%] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://picsum.photos/seed/${c.imageSeed}/680/400`} alt=""
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6">
          <p className="text-white text-3xl font-black">{c.price}</p>
        </div>
      </div>
      <div className="px-8 py-5 flex flex-col justify-between h-[35%]">
        <div>
          <h1 className="text-base font-bold text-axen-dark">{c.headline}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{c.address}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-axen-dark">{c.agentName}</p>
            <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-0.5">
              <span className="flex items-center gap-1"><Phone size={9} />{c.agentPhone}</span>
              <span className="flex items-center gap-1"><Mail size={9} />{c.agentEmail}</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg flex items-center justify-center">
            <QrCode size={20} className="text-[#10B981]" />
          </div>
        </div>
      </div>
    </div>
  );
}

const FLYER_RENDERERS: Record<string, (c: FlyerContent) => React.ReactNode> = {
  luxury:  (c) => <LuxuryFlyer  c={c} />,
  modern:  (c) => <ModernFlyer  c={c} />,
  classic: (c) => <ClassicFlyer c={c} />,
  minimal: (c) => <MinimalFlyer c={c} />,
};

// ─── Label + Input helper (module-level) ─────────────────────
function Field({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-surface-2 border border-transparent rounded-lg text-sm text-axen-dark placeholder:text-gray-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition"
      />
    </div>
  );
}

// ─── Main Flyer Designer panel ────────────────────────────────
const INITIAL_FLYER: FlyerContent = {
  templateId:  "f1",
  headline:    "Stunning Oceanfront Villa",
  subheadline: "Offered exclusively through Axen Realty",
  price:       "$3,250,000",
  address:     "1450 Ocean Dr, Miami Beach, FL 33139",
  beds:        "3",
  baths:       "3.5",
  sqft:        "2,196",
  agentName:   "Chris Macabugao",
  agentPhone:  "(305) 555-0142",
  agentEmail:  "chris@axenrealty.com",
  imageSeed:   "flyer-hero",
  qrCodeUrl:   "axenone.co/p/ocean-villa",
};

interface FlyerDesignerProps {
  open: boolean;
  onClose: () => void;
}

export default function FlyerDesigner({ open, onClose }: FlyerDesignerProps) {
  const panelRef   = useRef<HTMLDivElement>(null);
  const closeRef   = useRef<HTMLButtonElement>(null);
  const prevRef    = useRef<HTMLElement | null>(null);

  const [trackedOpen, setTrackedOpen] = useState(false);
  const [downloaded, setDownloaded]   = useState(false);
  const [content, setContent]         = useState<FlyerContent>({ ...INITIAL_FLYER });

  // Derived state: reset when panel opens
  if (open && !trackedOpen) {
    setTrackedOpen(true);
    setDownloaded(false);
    setContent({ ...INITIAL_FLYER });
  }
  if (!open && trackedOpen) {
    setTrackedOpen(false);
  }

  function set(key: keyof FlyerContent) {
    return (v: string) => setContent((prev) => ({ ...prev, [key]: v }));
  }

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

  const selectedTemplate = FLYER_TEMPLATES.find((f) => f.id === content.templateId) ?? FLYER_TEMPLATES[0];
  const renderFlyer = FLYER_RENDERERS[selectedTemplate.layout];

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
        aria-label="Flyer Designer"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex bg-white shadow-2xl",
          "w-full md:w-[900px]",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* ── Left: editor ───────────────────────────────── */}
        <div className="w-[340px] flex-shrink-0 flex flex-col border-r border-line overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-axen-dark">
            <div>
              <h2 className="text-white font-bold text-base">Flyer Designer</h2>
              <p className="text-gray-400 text-xs mt-0.5">Print &amp; digital ready</p>
            </div>
            <button
              ref={closeRef}
              aria-label="Close flyer designer"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Template selector */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Layout Style</p>
              <div className="grid grid-cols-2 gap-2">
                {FLYER_TEMPLATES.map((ft) => (
                  <button
                    key={ft.id}
                    onClick={() => set("templateId")(ft.id)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-left transition-all",
                      content.templateId === ft.id
                        ? "border-gold bg-gold-light"
                        : "border-line hover:border-gold/40"
                    )}
                    style={{ borderColor: content.templateId === ft.id ? ft.accentColor : undefined }}
                  >
                    <p className="text-xs font-bold text-axen-dark">{ft.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{ft.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Property details */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Property Details</p>
              <Field label="Headline"    value={content.headline}    onChange={set("headline")}    placeholder="Stunning Oceanfront Villa" />
              <Field label="Address"     value={content.address}     onChange={set("address")}     placeholder="1450 Ocean Dr, Miami Beach, FL" />
              <Field label="Price"       value={content.price}       onChange={set("price")}       placeholder="$3,250,000" />
              <div className="grid grid-cols-3 gap-2">
                <Field label="Beds"  value={content.beds}  onChange={set("beds")}  placeholder="3" />
                <Field label="Baths" value={content.baths} onChange={set("baths")} placeholder="3.5" />
                <Field label="Sqft"  value={content.sqft}  onChange={set("sqft")}  placeholder="2,196" />
              </div>
              <Field label="Image Seed (Picsum)" value={content.imageSeed} onChange={set("imageSeed")} placeholder="flyer-hero" />
            </div>

            {/* Agent info */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Agent Info</p>
              <Field label="Agent Name"  value={content.agentName}  onChange={set("agentName")}  placeholder="Your Name" />
              <Field label="Phone"       value={content.agentPhone} onChange={set("agentPhone")} placeholder="(305) 555-0100" />
              <Field label="Email"       value={content.agentEmail} onChange={set("agentEmail")} placeholder="agent@axenrealty.com" />
              <Field label="QR Code URL" value={content.qrCodeUrl}  onChange={set("qrCodeUrl")}  placeholder="axenone.co/p/…" />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex-shrink-0 border-t border-line p-4 flex gap-2">
            <button
              onClick={() => { setDownloaded(true); setTimeout(() => setDownloaded(false), 2500); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-axen-dark text-white font-bold text-sm rounded-xl hover:bg-gold hover:text-axen-dark transition-all"
            >
              {downloaded ? <><Check size={15} /> Saved!</> : <><Download size={15} /> Download PDF</>}
            </button>
            <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-line text-gray-500 font-semibold text-sm rounded-xl hover:border-gold hover:text-gold transition-all">
              <Share2 size={15} />
            </button>
          </div>
        </div>

        {/* ── Right: flyer preview ─────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-surface-2">
          <div className="flex-shrink-0 px-5 py-3 bg-white border-b border-line flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Preview</p>
            <span className="text-[10px] text-gray-400">8.5 × 11 in</span>
          </div>
          <div className="flex-1 overflow-y-auto flex items-start justify-center p-8">
            <div className="w-full max-w-sm shadow-2xl">
              {renderFlyer(content)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
