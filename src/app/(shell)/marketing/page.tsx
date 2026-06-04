"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus, ChevronDown, Globe, FileText, Printer, Home, Edit, Eye,
} from "lucide-react";
import type { Campaign, MarketingTab, PageTemplate } from "@/types/marketing";
import { SAMPLE_CAMPAIGNS, PAGE_TEMPLATES } from "@/data/marketing";
import CampaignDashboard from "@/components/marketing/CampaignDashboard";
import TemplateGallery from "@/components/marketing/TemplateGallery";
import FlyerDesigner from "@/components/marketing/FlyerDesigner";
import PropertyPagePreview from "@/components/marketing/PropertyPagePreview";
import PageBuilder from "@/components/marketing/PageBuilder";
import { cn } from "@/lib/utils";

// ─── Status badge (module level) ─────────────────────────────
function StatusPill({ status }: { status: Campaign["status"] }) {
  const map = {
    Active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    Draft:     "bg-gray-100 text-gray-500 border-gray-200",
    Paused:    "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-blue-50 text-blue-700 border-blue-200",
  } as const;
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", map[status])}>
      {status}
    </span>
  );
}

// ─── Landing page campaign card (module level) ────────────────
interface PageCardProps {
  campaign: Campaign;
  onEdit: (c: Campaign) => void;
}

function PageCampaignCard({ campaign: c, onEdit }: PageCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-line overflow-hidden hover:shadow-md hover:border-gold/30 transition-all group">
      <div className="relative aspect-video overflow-hidden bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${c.thumbnailSeed}/640/360`}
          alt={c.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2">
          <StatusPill status={c.status} />
        </div>
        {c.publishedUrl && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Live
          </div>
        )}
        <div className="absolute inset-0 bg-axen-dark/0 group-hover:bg-axen-dark/30 transition-colors duration-200 flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(c)}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-white text-axen-dark font-bold text-xs rounded-lg shadow"
          >
            <Edit size={11} /> Edit
          </button>
          <button
            onClick={() => onEdit(c)}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-white text-axen-dark font-bold text-xs rounded-lg shadow"
          >
            <Eye size={11} /> Preview
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-axen-dark truncate">{c.name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{c.type}</p>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
          <span><span className="font-bold text-axen-dark">{c.views.toLocaleString()}</span> views</span>
          <span><span className="font-bold text-axen-dark">{c.leadsGenerated}</span> leads</span>
          {c.conversionRate > 0 && (
            <span className="ml-auto font-bold text-emerald-600">{c.conversionRate}%</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Flyers empty / grid (module level) ──────────────────────
function FlyersGrid({ onDesign }: { onDesign: () => void }) {
  const flyerCampaigns = SAMPLE_CAMPAIGNS.filter((c) => c.type === "Flyer");

  if (flyerCampaigns.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-gold-light flex items-center justify-center">
          <Printer size={28} className="text-gold" />
        </div>
        <div>
          <p className="text-base font-bold text-axen-dark">No flyers yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Design a professional property flyer in minutes with our drag-and-drop designer.
          </p>
        </div>
        <button
          onClick={onDesign}
          className="flex items-center gap-2 px-5 py-2.5 bg-axen-dark text-white font-bold text-sm rounded-xl hover:bg-gold hover:text-axen-dark transition-all"
        >
          <Plus size={14} /> Design a Flyer
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {flyerCampaigns.map((c) => (
        <div key={c.id} className="bg-white rounded-2xl border border-line p-4">
          <p className="text-sm font-bold text-axen-dark truncate">{c.name}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────
const TABS: { id: MarketingTab; label: string; icon: React.ElementType }[] = [
  { id: "campaigns", label: "My Campaigns",       icon: Globe     },
  { id: "pages",     label: "Landing Pages",      icon: FileText  },
  { id: "flyers",    label: "Flyers & Brochures", icon: Printer   },
  { id: "templates", label: "Templates",          icon: Home      },
];

const CREATE_OPTIONS = [
  { label: "New Landing Page",  icon: Globe,    action: "landing-page"    },
  { label: "New Squeeze Page",  icon: FileText, action: "squeeze-page"    },
  { label: "Design a Flyer",    icon: Printer,  action: "flyer"           },
  { label: "Property Site",     icon: Home,     action: "property-site"   },
] as const;

type CreateAction = (typeof CREATE_OPTIONS)[number]["action"];

// ─── Marketing page ───────────────────────────────────────────
export default function MarketingPage() {
  const [tab, setTab] = useState<MarketingTab>("campaigns");

  const [flyerOpen,    setFlyerOpen]    = useState(false);
  const [propPageOpen, setPropPageOpen] = useState(false);
  const [builderOpen,  setBuilderOpen]  = useState(false);
  const [activeTpl,    setActiveTpl]    = useState<PageTemplate | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close Create New menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  function handleCreate(action: CreateAction) {
    setMenuOpen(false);
    if (action === "flyer")         { setFlyerOpen(true);    return; }
    if (action === "property-site") { setPropPageOpen(true); return; }
    setActiveTpl(null);
    setBuilderOpen(true);
  }

  function handleUseTemplate(t: PageTemplate) {
    setActiveTpl(t);
    setBuilderOpen(true);
    setTab("pages");
  }

  function handleEditCampaign(c: Campaign) {
    if (c.type === "Property Site") {
      setPropPageOpen(true);
      return;
    }
    const tpl = c.templateId ? (PAGE_TEMPLATES.find((t) => t.id === c.templateId) ?? null) : null;
    setActiveTpl(tpl);
    setBuilderOpen(true);
  }

  const pageCampaigns = SAMPLE_CAMPAIGNS.filter(
    (c) => c.type === "Landing Page" || c.type === "Squeeze Page" || c.type === "Property Site"
  );

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">

        {/* ── Page header ──────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-line">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-axen-dark">Marketing</h1>
              <p className="text-xs text-gray-400 mt-0.5">Landing pages, flyers, and campaign management</p>
            </div>

            {/* Create New */}
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 bg-axen-dark text-white font-bold text-sm rounded-xl hover:bg-gold hover:text-axen-dark transition-all"
              >
                <Plus size={15} /> Create New
                <ChevronDown size={13} className={cn("transition-transform", menuOpen && "rotate-180")} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-line shadow-xl z-30 overflow-hidden">
                  {CREATE_OPTIONS.map(({ label, icon: Icon, action }) => (
                    <button
                      key={action}
                      onClick={() => handleCreate(action)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-axen-dark hover:bg-gold-light hover:text-gold-dark transition-colors"
                    >
                      <Icon size={14} className="text-gold flex-shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tab strip */}
          <div className="flex items-center gap-1 px-6 pb-0">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors",
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
        </div>

        {/* ── Tab content ──────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">

          {tab === "campaigns" && (
            <CampaignDashboard onEdit={handleEditCampaign} />
          )}

          {tab === "pages" && (
            <div className="h-full overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pageCampaigns.map((c) => (
                  <PageCampaignCard key={c.id} campaign={c} onEdit={handleEditCampaign} />
                ))}
                {/* New page CTA card */}
                <button
                  onClick={() => { setActiveTpl(null); setBuilderOpen(true); }}
                  className="aspect-video rounded-2xl border-2 border-dashed border-line hover:border-gold hover:bg-gold-light transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gold group"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-2 group-hover:bg-white flex items-center justify-center transition-colors">
                    <Plus size={20} />
                  </div>
                  <span className="text-xs font-semibold">New Landing Page</span>
                </button>
              </div>
            </div>
          )}

          {tab === "flyers" && (
            <div className="h-full flex flex-col overflow-y-auto px-6 py-5">
              <FlyersGrid onDesign={() => setFlyerOpen(true)} />
            </div>
          )}

          {tab === "templates" && (
            <TemplateGallery onUse={handleUseTemplate} />
          )}
        </div>
      </div>

      {/* ── Overlays ────────────────────────────────────── */}
      <PageBuilder
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        initialTemplate={activeTpl}
      />
      <FlyerDesigner
        open={flyerOpen}
        onClose={() => setFlyerOpen(false)}
      />
      <PropertyPagePreview
        open={propPageOpen}
        onClose={() => setPropPageOpen(false)}
      />
    </>
  );
}
