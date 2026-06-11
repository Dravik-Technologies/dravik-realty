"use client";

import { useState, useRef, useEffect } from "react";
import {
  X, Plus, GripVertical, ChevronDown, ChevronUp,
  Rocket, Check, Eye, Trash2,
  Type, Image, CreditCard, Star, Phone, MapPin, BarChart3, User,
} from "lucide-react";
import {
  DndContext, closestCenter, DragOverlay,
  useSensor, useSensors, PointerSensor, KeyboardSensor,
  type DragStartEvent, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, arrayMove,
  verticalListSortingStrategy, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BuilderSection, SectionType, PageTemplate } from "@/types/marketing";
import { SECTION_DEFAULTS, BLANK_PAGE_SECTIONS } from "@/data/marketing";
import { cn } from "@/lib/utils";

// ─── Section type metadata ────────────────────────────────────
const SECTION_META: Record<SectionType, { label: string; icon: React.ElementType; color: string }> = {
  hero:         { label: "Hero",          icon: Type,       color: "#D4AF37" },
  gallery:      { label: "Gallery",       icon: Image,      color: "#4A90A4" },
  mortgage_cta: { label: "Mortgage CTA",  icon: CreditCard, color: "#10B981" },
  testimonials: { label: "Testimonials",  icon: Star,       color: "#8B5CF6" },
  contact:      { label: "Contact Form",  icon: Phone,      color: "#EF4444" },
  map:          { label: "Map",           icon: MapPin,     color: "#F97316" },
  stats:        { label: "Stats",         icon: BarChart3,  color: "#06B6D4" },
  agent_bio:    { label: "Agent Bio",     icon: User,       color: "#EC4899" },
};

const ALL_SECTION_TYPES: SectionType[] = [
  "hero", "gallery", "mortgage_cta", "testimonials",
  "contact", "map", "stats", "agent_bio",
];

const STAR_INDICES = [0, 1, 2, 3, 4];

// ─── Section preview components (all at module level) ─────────
interface SectionPreviewProps { content: Record<string, string> }

function HeroPreview({ content }: SectionPreviewProps) {
  return (
    <div className="relative h-56 bg-axen-dark overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://picsum.photos/seed/hero-bg/800/400" alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-axen-dark/80 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-white font-bold text-xl leading-tight max-w-lg">{content.headline}</p>
        {content.subheadline && (
          <p className="text-white/70 text-sm mt-2 max-w-sm">{content.subheadline}</p>
        )}
        {content.ctaText && (
          <div className="mt-4 px-5 py-2 bg-gold text-axen-dark font-bold text-sm rounded-xl">
            {content.ctaText}
          </div>
        )}
      </div>
    </div>
  );
}

function GalleryPreview({ content }: SectionPreviewProps) {
  const seeds = ["gal1", "gal2", "gal3", "gal4", "gal5", "gal6"];
  return (
    <div className="px-6 py-5 bg-white">
      {content.title && <p className="text-base font-bold text-axen-dark mb-1">{content.title}</p>}
      {content.subtitle && <p className="text-xs text-gray-500 mb-3">{content.subtitle}</p>}
      <div className="grid grid-cols-3 gap-1.5">
        {seeds.map((s) => (
          <div key={s} className="aspect-square rounded-lg overflow-hidden bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://picsum.photos/seed/${s}/200/200`} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MortgageCtaPreview({ content }: SectionPreviewProps) {
  return (
    <div className="px-6 py-5 bg-gold-light border-y border-gold/20">
      <p className="text-base font-bold text-axen-dark">{content.headline}</p>
      {content.body && <p className="text-xs text-gray-500 mt-1 mb-3">{content.body}</p>}
      <div className="bg-white rounded-xl p-4 space-y-2">
        {[["Home Price", "$650,000"], ["Down Payment", "20%"], ["Loan Term", "30 years"]].map(([l, v]) => (
          <div key={l} className="flex justify-between text-xs">
            <span className="text-gray-500">{l}</span>
            <span className="font-bold text-axen-dark">{v}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-line flex justify-between text-sm">
          <span className="text-gray-500">Est. Monthly</span>
          <span className="font-bold text-gold">$2,841</span>
        </div>
      </div>
      {content.ctaText && (
        <div className="mt-3 text-center py-2 bg-axen-dark text-white text-xs font-bold rounded-lg">
          {content.ctaText}
        </div>
      )}
    </div>
  );
}

function TestimonialsPreview({ content }: SectionPreviewProps) {
  const items = [
    { name: "Sarah M.", text: "Chris found us our dream home in under 3 weeks. Absolutely exceptional service." },
    { name: "James T.", text: "The Axen Realty team made selling our home completely stress-free." },
  ];
  return (
    <div className="px-6 py-5 bg-surface">
      {content.headline && <p className="text-base font-bold text-axen-dark mb-3">{content.headline}</p>}
      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.name} className="bg-white rounded-xl p-3 border border-line">
            <div className="flex gap-0.5 mb-1.5">
              {STAR_INDICES.map((i) => <Star key={i} size={10} className="text-gold fill-gold" />)}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{`"${t.text}"`}</p>
            <p className="text-[11px] font-bold text-axen-dark mt-1.5">— {t.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactPreview({ content }: SectionPreviewProps) {
  return (
    <div className="px-6 py-5 bg-axen-dark">
      <p className="text-white font-bold text-base mb-0.5">{content.headline}</p>
      {content.subheadline && <p className="text-white/60 text-xs mb-4">{content.subheadline}</p>}
      <div className="space-y-2">
        {["Full Name", "Email Address", "Phone Number"].map((ph) => (
          <div key={ph} className="w-full h-8 bg-white/10 rounded-lg border border-white/20" />
        ))}
        <div className="w-full h-16 bg-white/10 rounded-lg border border-white/20" />
        {content.ctaText && (
          <div className="w-full h-9 bg-gold rounded-lg flex items-center justify-center text-axen-dark font-bold text-sm">
            {content.ctaText}
          </div>
        )}
      </div>
    </div>
  );
}

function MapPreview({ content }: SectionPreviewProps) {
  return (
    <div className="px-6 py-5 bg-white">
      {content.headline && <p className="text-base font-bold text-axen-dark mb-2">{content.headline}</p>}
      <div className="relative rounded-xl overflow-hidden h-36 border border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://picsum.photos/seed/map-preview/800/300" alt="Map"
          className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-gold rounded-full border-2 border-white shadow-lg" />
        </div>
      </div>
      {content.address && (
        <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
          <MapPin size={10} className="text-gold" />{content.address}
        </p>
      )}
    </div>
  );
}

function StatsPreview({ content }: SectionPreviewProps) {
  const stats = [
    { v: content.stat1Value, l: content.stat1Label },
    { v: content.stat2Value, l: content.stat2Label },
    { v: content.stat3Value, l: content.stat3Label },
  ];
  return (
    <div className="px-6 py-5 bg-white">
      {content.headline && <p className="text-base font-bold text-axen-dark mb-3">{content.headline}</p>}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ v, l }) => (
          <div key={l} className="text-center bg-surface rounded-xl p-3">
            <p className="text-xl font-bold text-gold">{v}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentBioPreview({ content }: SectionPreviewProps) {
  const initials = (content.agentName || "A").split(" ").map((w: string) => w[0]).join("").slice(0, 2);
  return (
    <div className="px-6 py-5 bg-surface">
      {content.headline && <p className="text-base font-bold text-axen-dark mb-3">{content.headline}</p>}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-axen-dark flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-bold text-axen-dark text-sm">{content.agentName}</p>
          <p className="text-xs text-gold mb-2">{content.agentTitle}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{content.agentBio}</p>
        </div>
      </div>
    </div>
  );
}

const SECTION_PREVIEWS: Record<SectionType, React.ComponentType<SectionPreviewProps>> = {
  hero:         HeroPreview,
  gallery:      GalleryPreview,
  mortgage_cta: MortgageCtaPreview,
  testimonials: TestimonialsPreview,
  contact:      ContactPreview,
  map:          MapPreview,
  stats:        StatsPreview,
  agent_bio:    AgentBioPreview,
};

// ─── Live preview (module level) ─────────────────────────────
interface LivePreviewProps { sections: BuilderSection[]; slug: string }

function LivePreview({ sections, slug }: LivePreviewProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
      {/* Browser chrome */}
      <div className="bg-surface-2 px-3 py-2 flex items-center gap-2 border-b border-line">
        <div className="flex gap-1">
          {["bg-rose-400", "bg-amber-400", "bg-emerald-400"].map((c) => (
            <span key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />
          ))}
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[10px] text-gray-400 border border-line truncate">
          axenone.co/p/{slug}
        </div>
      </div>
      {sections.map((s) => {
        const Preview = SECTION_PREVIEWS[s.type];
        return <div key={s.id}><Preview content={s.content} /></div>;
      })}
    </div>
  );
}

// ─── Add section tile grid (module level) ─────────────────────
interface AddSectionPanelProps { onAdd: (t: SectionType) => void }

function AddSectionPanel({ onAdd }: AddSectionPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_SECTION_TYPES.map((type) => {
        const meta = SECTION_META[type];
        const Icon = meta.icon;
        return (
          <button
            key={type}
            onClick={() => onAdd(type)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-xl hover:border-gold/50 hover:bg-gold-light transition-all text-left"
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${meta.color}18` }}>
              <Icon size={12} style={{ color: meta.color }} />
            </div>
            <span className="text-[11px] font-semibold text-axen-dark leading-tight">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Drag overlay ghost (module level) ───────────────────────
function SectionGhost({ section }: { section: BuilderSection }) {
  const meta = SECTION_META[section.type];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-gold shadow-2xl cursor-grabbing">
      <GripVertical size={14} className="text-gold" />
      <div className="w-5 h-5 rounded-md flex items-center justify-center"
        style={{ background: `${meta.color}20` }}>
        <Icon size={11} style={{ color: meta.color }} />
      </div>
      <span className="text-xs font-semibold text-axen-dark">{meta.label}</span>
    </div>
  );
}

// ─── Sortable section row (module level) ─────────────────────
interface SortableRowProps {
  section: BuilderSection;
  isEditing: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onChange: (key: string, val: string) => void;
}

function SortableSectionRow({ section, isEditing, onToggle, onDelete, onChange }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const meta = SECTION_META[section.type];
  const Icon = meta.icon;
  const defaults = SECTION_DEFAULTS[section.type] ?? {};
  const fields = Object.keys(defaults);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "rounded-xl border overflow-hidden transition-shadow",
        isDragging ? "opacity-50 shadow-2xl" : "border-line bg-white"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button {...attributes} {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing p-0.5 flex-shrink-0"
          aria-label="Drag to reorder">
          <GripVertical size={14} />
        </button>
        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: `${meta.color}20` }}>
          <Icon size={11} style={{ color: meta.color }} />
        </div>
        <span className="text-xs font-semibold text-axen-dark flex-1 truncate">{meta.label}</span>
        <button onClick={onToggle} className="text-gray-400 hover:text-axen-dark p-0.5 transition-colors"
          aria-label={isEditing ? "Collapse" : "Expand"}>
          {isEditing ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        <button onClick={onDelete} className="text-gray-300 hover:text-rose-500 p-0.5 transition-colors"
          aria-label="Remove section">
          <Trash2 size={13} />
        </button>
      </div>

      {isEditing && fields.length > 0 && (
        <div className="border-t border-line px-3 py-3 space-y-2 bg-surface-2">
          {fields.map((key) => {
            const isLong = key === "body" || key === "agentBio";
            const val = section.content[key] ?? defaults[key] ?? "";
            return (
              <div key={key} className="space-y-0.5">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block">
                  {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                </label>
                {isLong ? (
                  <textarea rows={2} value={val} onChange={(e) => onChange(key, e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-line rounded-lg text-[11px] text-axen-dark resize-none focus:outline-none focus:border-gold transition" />
                ) : (
                  <input type="text" value={val} onChange={(e) => onChange(key, e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-line rounded-lg text-[11px] text-axen-dark focus:outline-none focus:border-gold transition" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PageBuilder panel ────────────────────────────────────────
interface PageBuilderProps {
  open: boolean;
  onClose: () => void;
  initialTemplate?: PageTemplate | null;
}

export default function PageBuilder({ open, onClose, initialTemplate }: PageBuilderProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevRef  = useRef<HTMLElement | null>(null);

  const [trackedOpen, setTrackedOpen] = useState(false);
  const [pageName, setPageName]       = useState("My Landing Page");
  const [sections, setSections]       = useState<BuilderSection[]>(
    BLANK_PAGE_SECTIONS.map((s) => ({ ...s, content: { ...s.content } }))
  );
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [activeId, setActiveId]       = useState<string | null>(null);
  const [published, setPublished]     = useState(false);
  const [pubUrl, setPubUrl]           = useState("");

  // Derived state: reset when panel opens
  if (open && !trackedOpen) {
    setTrackedOpen(true);
    const name = initialTemplate?.name ?? "My Landing Page";
    const secs = initialTemplate
      ? initialTemplate.sections.map((type, i) => ({
          id: `s-${type}-${i}`,
          type,
          content: { ...SECTION_DEFAULTS[type] },
        }))
      : BLANK_PAGE_SECTIONS.map((s) => ({ ...s, content: { ...s.content } }));
    setPageName(name);
    setSections(secs);
    setEditingId(null);
    setShowAdd(false);
    setPublished(false);
    setPubUrl("");
  }
  if (!open && trackedOpen) {
    setTrackedOpen(false);
  }

  // Focus management
  useEffect(() => {
    if (open) {
      prevRef.current = document.activeElement as HTMLElement;
      closeRef.current?.focus();
    } else {
      prevRef.current?.focus();
    }
  }, [open]);

  // Keyboard trap + Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>(
        "button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex=\"-1\"])"
      ));
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const from = prev.findIndex((s) => s.id === active.id);
      const to   = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, from, to);
    });
  }

  function handleAdd(type: SectionType) {
    const id = `s-${type}-${Date.now()}`;
    setSections((prev) => [...prev, { id, type, content: { ...SECTION_DEFAULTS[type] } }]);
    setShowAdd(false);
    setEditingId(id);
  }

  function handleDelete(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function handleChange(sectionId: string, key: string, val: string) {
    setSections((prev) => prev.map((s) =>
      s.id === sectionId ? { ...s, content: { ...s.content, [key]: val } } : s
    ));
  }

  function handlePublish() {
    const slug = pageName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    setPubUrl(`axenone.co/p/${slug}`);
    setPublished(true);
  }

  const previewSlug = pageName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const activeSection = sections.find((s) => s.id === activeId);

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Landing Page Builder"
        className={cn(
          "fixed inset-0 z-50 flex flex-col bg-surface-2",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* ── Top bar ─────────────────────────────────────── */}
        <div className="flex-shrink-0 h-14 bg-axen-dark flex items-center gap-3 px-5 border-b border-white/10">
          <button ref={closeRef} onClick={onClose} aria-label="Close builder"
            className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
          <div className="w-px h-5 bg-white/20 flex-shrink-0" />
          <input
            type="text"
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
            className="flex-1 max-w-sm bg-white/10 text-white placeholder-gray-400 text-sm font-semibold px-3 py-1.5 rounded-lg border border-transparent focus:outline-none focus:border-gold transition"
          />
          <div className="ml-auto flex items-center gap-3">
            {published && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 hidden sm:flex">
                <Check size={13} /> {pubUrl}
              </p>
            )}
            <button
              onClick={handlePublish}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                published
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-gold text-axen-dark hover:bg-gold/90"
              )}
            >
              {published ? <><Check size={14} /> Update</> : <><Rocket size={14} /> Publish</>}
            </button>
          </div>
        </div>

        {/* ── Main area ────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left: section editor */}
          <div className="w-[320px] flex-shrink-0 flex flex-col bg-white border-r border-line overflow-hidden">
            <div className="flex-shrink-0 px-4 py-3 border-b border-line">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Page Sections</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {sections.map((s) => (
                      <SortableSectionRow
                        key={s.id}
                        section={s}
                        isEditing={editingId === s.id}
                        onToggle={() => setEditingId(editingId === s.id ? null : s.id)}
                        onDelete={() => handleDelete(s.id)}
                        onChange={(key, val) => handleChange(s.id, key, val)}
                      />
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeSection && <SectionGhost section={activeSection} />}
                </DragOverlay>
              </DndContext>

              <button
                onClick={() => setShowAdd((v) => !v)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-line rounded-xl text-xs font-semibold text-gray-400 hover:border-gold hover:text-gold transition-colors"
              >
                <Plus size={14} /> Add Section
              </button>

              {showAdd && (
                <div className="mt-3">
                  <AddSectionPanel onAdd={handleAdd} />
                </div>
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Preview</p>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-white border border-line rounded-full px-2.5 py-1">
                  <Eye size={10} /> Read-only
                </div>
              </div>
              <LivePreview sections={sections} slug={previewSlug} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
