"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search, Globe, Users, TrendingUp, Star,
  SlidersHorizontal, ChevronDown, X, List, Map,
} from "lucide-react";
import dynamic from "next/dynamic";
import AgentCard     from "../components/AgentCard";
import PipelineCard  from "../components/PipelineCard";
import ReferralModal from "../components/ReferralModal";

// Leaflet accesses window at module load — must be client-only
const ReferralMapView = dynamic(() => import("../components/ReferralMapView"), { ssr: false });
import { AGENTS, PIPELINE } from "../data/agents";
import type { Agent, CertificationType, Region, Specialization } from "@dravik/contracts/referrals";
import { cn } from "@dravik/shared";

type View = "directory" | "map";

// ── Filter options ────────────────────────────────────────────
const CERT_OPTIONS: Array<{ label: string; value: CertificationType | "All" }> = [
  { label: "All Licenses",    value: "All"           },
  { label: "RE Broker",       value: "RE Broker"     },
  { label: "Dual Licensed",   value: "Dual Licensed" },
  { label: "RE + Mortgage",   value: "RE + Mortgage" },
];

const REGION_OPTIONS: Array<{ label: string; value: Region | "All" }> = [
  { label: "All Regions",        value: "All"              },
  { label: "Northeast",          value: "Northeast"        },
  { label: "Southeast",          value: "Southeast"        },
  { label: "Midwest",            value: "Midwest"          },
  { label: "Southwest",          value: "Southwest"        },
  { label: "West",               value: "West"             },
  { label: "Pacific Northwest",  value: "Pacific Northwest"},
];

const SPEC_OPTIONS: Array<{ label: string; value: Specialization | "All" }> = [
  { label: "All Specializations", value: "All"                },
  { label: "Luxury",              value: "Luxury"             },
  { label: "Commercial",          value: "Commercial"         },
  { label: "Residential",         value: "Residential"        },
  { label: "Investment",          value: "Investment"         },
  { label: "First-Time Buyers",   value: "First-Time Buyers"  },
  { label: "New Construction",    value: "New Construction"   },
];

// ── KPI card ──────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-line p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-axen-dark leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Filter select ─────────────────────────────────────────────
function FilterSelect<T extends string>({ value, onChange, options, label }: {
  value: T; onChange: (v: T) => void; options: Array<{ label: string; value: T }>; label: string;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label} value={value}
        onChange={e => onChange(e.target.value as T)}
        className="appearance-none bg-white border border-line rounded-xl pl-3 pr-8 py-2.5 text-sm font-semibold text-axen-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition cursor-pointer"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ── View toggle ───────────────────────────────────────────────
function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="flex items-center gap-1 bg-surface-2 border border-line rounded-xl p-1">
      <button
        onClick={() => onChange("directory")}
        className={cn(
          "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all",
          view === "directory" ? "bg-white text-axen-dark shadow-sm" : "text-gray-400 hover:text-axen-dark"
        )}
      >
        <List size={13} /> Directory
      </button>
      <button
        onClick={() => onChange("map")}
        className={cn(
          "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all",
          view === "map" ? "bg-white text-axen-dark shadow-sm" : "text-gray-400 hover:text-axen-dark"
        )}
      >
        <Map size={13} /> Map View
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function ReferralNetwork() {
  const [view,         setView]         = useState<View>("directory");
  const [query,        setQuery]        = useState("");
  const [certFilter,   setCertFilter]   = useState<CertificationType | "All">("All");
  const [regionFilter, setRegionFilter] = useState<Region | "All">("All");
  const [specFilter,   setSpecFilter]   = useState<Specialization | "All">("All");
  const [activeAgent,  setActiveAgent]  = useState<Agent | null>(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [showFilters,  setShowFilters]  = useState(false);

  const filteredAgents = useMemo(() => AGENTS.filter(a => {
    const q = query.toLowerCase();
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.location.city.toLowerCase().includes(q) ||
      a.location.state.toLowerCase().includes(q) ||
      a.specializations.some(s => s.toLowerCase().includes(q));
    const matchCert   = certFilter   === "All" || a.certification           === certFilter;
    const matchRegion = regionFilter === "All" || a.location.region         === regionFilter;
    const matchSpec   = specFilter   === "All" || a.specializations.includes(specFilter as Specialization);
    return matchSearch && matchCert && matchRegion && matchSpec;
  }), [query, certFilter, regionFilter, specFilter]);

  const networkVolume = AGENTS.reduce((sum, a) => {
    return sum + parseFloat(a.closedVolumeMTD.replace(/[$M]/g, ""));
  }, 0).toFixed(1);

  const avgScore = (AGENTS.reduce((s, a) => s + a.productionScore, 0) / AGENTS.length).toFixed(1);

  const openModal = useCallback((agent: Agent) => {
    setActiveAgent(agent);
    setModalOpen(true);
  }, []);

  function clearFilters() {
    setQuery(""); setCertFilter("All"); setRegionFilter("All"); setSpecFilter("All");
  }

  const hasActiveFilters = query || certFilter !== "All" || regionFilter !== "All" || specFilter !== "All";

  // ── Map view ──
  if (view === "map") {
    return (
      <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Map toolbar */}
        <div className="flex-shrink-0 bg-white border-b border-line px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-gold" />
            <h1 className="text-sm font-bold text-axen-dark">Global Referral Network</h1>
            <span className="text-[10px] font-bold text-gold bg-gold-light px-2 py-0.5 rounded-full border border-gold/30">
              PCS Map
            </span>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <div className="flex-1 overflow-hidden">
          <ReferralMapView onInitiateReferral={openModal} />
        </div>

        <ReferralModal agent={activeAgent} open={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  // ── Directory view ──
  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Page header with toggle */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-1 h-6 rounded-full bg-gold inline-block" />
            <h1 className="text-xl font-bold text-axen-dark">Global Referral Network</h1>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={Users}     label="Network Agents"       value={String(AGENTS.length)} sub="Across 6 regions"    color="#D4AF37" />
          <KpiCard icon={TrendingUp}label="Network Volume (MTD)" value={`$${networkVolume}M`}  sub="Combined closings"  color="#4A90A4" />
          <KpiCard icon={Globe}     label="Active Referrals"     value={String(PIPELINE.filter(p => p.status !== "Closed").length)} sub="In pipeline" color="#7C6A9E" />
          <KpiCard icon={Star}      label="Avg. Production Score"value={`${avgScore}/5.0`}      sub="Network average"   color="#C0786C" />
        </div>

        {/* Search + filters */}
        <div className="bg-white rounded-2xl border border-line p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, city, or specialization…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-line rounded-xl text-sm text-axen-dark placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-axen-dark">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors",
                showFilters ? "bg-axen-dark text-white border-axen-dark" : "bg-white text-gray-600 border-line hover:bg-surface"
              )}
            >
              <SlidersHorizontal size={15} /> Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-gold" />}
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-4 py-2.5 text-sm font-semibold text-gold hover:text-gold-dark border border-gold/40 rounded-xl hover:bg-gold-light transition-colors">
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-1 animate-fade-in">
              <FilterSelect label="License type"    value={certFilter}   onChange={setCertFilter}   options={CERT_OPTIONS}   />
              <FilterSelect label="Region"          value={regionFilter} onChange={setRegionFilter} options={REGION_OPTIONS} />
              <FilterSelect label="Specialization"  value={specFilter}   onChange={setSpecFilter}   options={SPEC_OPTIONS}   />
            </div>
          )}
        </div>

        {/* Agent directory */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-1 h-5 rounded-full bg-gold inline-block" />
              <h2 className="text-lg font-bold text-axen-dark">Agent Directory</h2>
            </div>
            <span className="text-sm text-gray-400 font-medium">
              {filteredAgents.length} of {AGENTS.length} agents
            </span>
          </div>

          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredAgents.map(agent => (
                <AgentCard key={agent.id} agent={agent} onInitiate={openModal} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-line py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
                <Search size={22} className="text-gray-300" />
              </div>
              <p className="font-semibold text-axen-dark">No agents match your filters</p>
              <p className="text-sm text-gray-400 max-w-xs">Try adjusting the search or clearing the active filters.</p>
              <button onClick={clearFilters} className="mt-2 text-sm font-semibold text-gold hover:text-gold-dark transition-colors">
                Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* Outbound pipeline */}
        <section className="space-y-4 pb-10">
          <div className="flex items-center gap-3">
            <span className="w-1 h-5 rounded-full bg-gold inline-block" />
            <h2 className="text-lg font-bold text-axen-dark">Outbound Pipeline</h2>
            <span className="text-[11px] font-bold bg-gold-light text-gold-dark px-2.5 py-0.5 rounded-full">
              {PIPELINE.length} referrals
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {(["Pending", "Accepted", "Under Contract", "Closed"] as const).map(s => {
              const count = PIPELINE.filter(p => p.status === s).length;
              const colors = {
                Pending:          "bg-amber-50 text-amber-700 border-amber-200",
                Accepted:         "bg-blue-50 text-blue-700 border-blue-200",
                "Under Contract": "bg-violet-50 text-violet-700 border-violet-200",
                Closed:           "bg-emerald-50 text-emerald-700 border-emerald-200",
              };
              const dots = {
                Pending: "bg-amber-400", Accepted: "bg-blue-400",
                "Under Contract": "bg-violet-400", Closed: "bg-emerald-400",
              };
              return (
                <span key={s} className={cn("flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border", colors[s])}>
                  <span className={cn("w-2 h-2 rounded-full", dots[s])} />
                  {s} <span className="font-bold ml-0.5">({count})</span>
                </span>
              );
            })}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {PIPELINE.map(ref => (
              <div key={ref.id} className="flex-shrink-0 w-[300px]">
                <PipelineCard referral={ref} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <ReferralModal agent={activeAgent} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
