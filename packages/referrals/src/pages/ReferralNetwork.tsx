"use client";

import { useState, useMemo, useCallback, useEffect, type FormEvent } from "react";
import {
  Search, Globe, Users, TrendingUp, Star,
  SlidersHorizontal, ChevronDown, X, List, Map, Plus, Loader2,
} from "lucide-react";
import dynamic from "next/dynamic";
import AgentCard     from "../components/AgentCard";
import PipelineCard  from "../components/PipelineCard";
import ReferralModal from "../components/ReferralModal";

// Leaflet accesses window at module load — must be client-only
const ReferralMapView = dynamic(() => import("../components/ReferralMapView"), { ssr: false });
import { AGENTS, PIPELINE } from "../data/agents";
import type { Agent, CertificationType, PartnerRole, Region, Specialization } from "@dravik/contracts/referrals";
import {
  archiveOperationalRecord,
  cn,
  createOperationalRecord,
  fetchOperationalRecords,
  updateOperationalRecord,
} from "@dravik/shared";

type View = "directory" | "map";

// ── Filter options ────────────────────────────────────────────
const CERT_OPTIONS: Array<{ label: string; value: CertificationType | "All" }> = [
  { label: "All Licenses",    value: "All"           },
  { label: "RE Broker",       value: "RE Broker"     },
  { label: "Dual Licensed",   value: "Dual Licensed" },
  { label: "RE + Mortgage",   value: "RE + Mortgage" },
  { label: "Mortgage Lender", value: "Mortgage Lender" },
];

const ROLE_OPTIONS: Array<{ label: string; value: PartnerRole | "All" }> = [
  { label: "All Partners", value: "All" },
  { label: "Realtors", value: "Real Estate Agent" },
  { label: "Lenders", value: "Mortgage Lender" },
  { label: "Dual Service", value: "Dual Service" },
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
  { label: "VA Loans",            value: "VA Loans"           },
  { label: "FHA Loans",           value: "FHA Loans"          },
  { label: "Jumbo Loans",         value: "Jumbo Loans"        },
  { label: "Conventional Loans",  value: "Conventional Loans" },
];

type PartnerFormState = {
  name: string;
  partnerRole: PartnerRole;
  certification: CertificationType;
  city: string;
  state: string;
  region: Region;
  email: string;
  phone: string;
  specializations: Specialization[];
  productionScore: string;
  closedVolumeMTD: string;
  closedTransactions: string;
  yearsExperience: string;
  bio: string;
};

const EMPTY_PARTNER_FORM: PartnerFormState = {
  name: "",
  partnerRole: "Real Estate Agent",
  certification: "RE Broker",
  city: "",
  state: "FL",
  region: "Southeast",
  email: "",
  phone: "",
  specializations: ["Residential"],
  productionScore: "4.5",
  closedVolumeMTD: "$0.0M",
  closedTransactions: "0",
  yearsExperience: "1",
  bio: "",
};

const AVATAR_COLORS = ["#4A90A4", "#7C6A9E", "#C0786C", "#4A7A4A", "#B87333", "#5E7188"];

function createTempId(prefix: string) {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}`;
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PN";
}

function parseNumber(value: string, fallback: number) {
  const parsed = Number(value.replace(/[$,%\s,M,]/gi, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function agentToForm(agent: Agent): PartnerFormState {
  return {
    name: agent.name,
    partnerRole: agent.partnerRole,
    certification: agent.certification,
    city: agent.location.city,
    state: agent.location.state,
    region: agent.location.region,
    email: agent.email,
    phone: agent.phone,
    specializations: agent.specializations,
    productionScore: String(agent.productionScore),
    closedVolumeMTD: agent.closedVolumeMTD,
    closedTransactions: String(agent.closedTransactions),
    yearsExperience: String(agent.yearsExperience),
    bio: agent.bio,
  };
}

function formToAgent(form: PartnerFormState, existing?: Agent): Agent {
  const name = form.name.trim() || "New Partner";

  return {
    id: existing?.id ?? createTempId("partner"),
    name,
    initials: initialsFor(name),
    avatarColor: existing?.avatarColor ?? AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    partnerRole: form.partnerRole,
    certification: form.certification,
    specializations: form.specializations.length ? form.specializations : ["Residential"],
    location: {
      city: form.city.trim() || "Miami",
      state: form.state.trim().toUpperCase() || "FL",
      region: form.region,
      avgPropertyValue: existing?.location.avgPropertyValue ?? 500000,
      lat: existing?.location.lat,
      lng: existing?.location.lng,
    },
    productionScore: Math.min(5, Math.max(0, parseNumber(form.productionScore, existing?.productionScore ?? 4.5))),
    totalReviews: existing?.totalReviews ?? 0,
    closedVolumeMTD: form.closedVolumeMTD.trim() || "$0.0M",
    closedTransactions: Math.max(0, Math.round(parseNumber(form.closedTransactions, existing?.closedTransactions ?? 0))),
    avgDaysToClose: existing?.avgDaysToClose ?? 30,
    activeListings: existing?.activeListings ?? 0,
    email: form.email.trim(),
    phone: form.phone.trim(),
    bio: form.bio.trim() || "Partner profile created in Dravik Realty.",
    yearsExperience: Math.max(0, Math.round(parseNumber(form.yearsExperience, existing?.yearsExperience ?? 1))),
  };
}

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
        <p className="text-2xl font-bold text-dravik-dark leading-none">{value}</p>
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
        className="appearance-none bg-white border border-line rounded-xl pl-3 pr-8 py-2.5 text-sm font-semibold text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition cursor-pointer"
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
          view === "directory" ? "bg-white text-dravik-dark shadow-sm" : "text-gray-400 hover:text-dravik-dark"
        )}
      >
        <List size={13} /> Directory
      </button>
      <button
        onClick={() => onChange("map")}
        className={cn(
          "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all",
          view === "map" ? "bg-white text-dravik-dark shadow-sm" : "text-gray-400 hover:text-dravik-dark"
        )}
      >
        <Map size={13} /> Map View
      </button>
    </div>
  );
}

function PartnerFormModal({
  open,
  mode,
  form,
  submitting,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  form: PartnerFormState;
  submitting: boolean;
  onChange: (patch: Partial<PartnerFormState>) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!open) return null;

  function toggleSpecialization(specialization: Specialization) {
    const next = form.specializations.includes(specialization)
      ? form.specializations.filter((item) => item !== specialization)
      : [...form.specializations, specialization];
    onChange({ specializations: next });
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 animate-fade-in">
      <button aria-label="Close partner form" className="absolute inset-0 bg-dravik-dark/60 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-form-title"
        className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl animate-slide-up"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 id="partner-form-title" className="text-base font-bold text-dravik-dark">{mode === "add" ? "Add Network Partner" : "Edit Network Partner"}</h2>
            <p className="mt-0.5 text-xs text-gray-400">Add subscribers, preferred agents, realtors, lenders, or dual-service partners.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-2 hover:text-dravik-dark">
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-gray-500">Name</span>
            <input required value={form.name} onChange={(event) => onChange({ name: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Partner Type</span>
            <select value={form.partnerRole} onChange={(event) => onChange({ partnerRole: event.target.value as PartnerRole })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20">
              {ROLE_OPTIONS.filter((option): option is { label: string; value: PartnerRole } => option.value !== "All").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Certification</span>
            <select value={form.certification} onChange={(event) => onChange({ certification: event.target.value as CertificationType })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20">
              {CERT_OPTIONS.filter((option): option is { label: string; value: CertificationType } => option.value !== "All").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">City</span>
            <input required value={form.city} onChange={(event) => onChange({ city: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">State</span>
            <input required maxLength={2} value={form.state} onChange={(event) => onChange({ state: event.target.value.toUpperCase() })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Region</span>
            <select value={form.region} onChange={(event) => onChange({ region: event.target.value as Region })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20">
              {REGION_OPTIONS.filter((option): option is { label: string; value: Region } => option.value !== "All").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Email</span>
            <input type="email" value={form.email} onChange={(event) => onChange({ email: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Phone</span>
            <input value={form.phone} onChange={(event) => onChange({ phone: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Production Score</span>
            <input inputMode="decimal" value={form.productionScore} onChange={(event) => onChange({ productionScore: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Volume MTD</span>
            <input value={form.closedVolumeMTD} onChange={(event) => onChange({ closedVolumeMTD: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Closings / Loans</span>
            <input inputMode="numeric" value={form.closedTransactions} onChange={(event) => onChange({ closedTransactions: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Years Experience</span>
            <input inputMode="numeric" value={form.yearsExperience} onChange={(event) => onChange({ yearsExperience: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <div className="sm:col-span-2">
            <p className="text-xs font-bold text-gray-500">Specializations</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPEC_OPTIONS.filter((option): option is { label: string; value: Specialization } => option.value !== "All").map((option) => {
                const active = form.specializations.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleSpecialization(option.value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
                      active ? "border-gold/40 bg-gold-light text-gold-dark" : "border-line bg-surface-2 text-gray-500 hover:border-gold"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-gray-500">Bio</span>
            <textarea rows={3} value={form.bio} onChange={(event) => onChange({ bio: event.target.value })} className="mt-1 w-full resize-none rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
        </div>

        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-line bg-surface px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-gray-500 hover:text-dravik-dark">Cancel</button>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-dravik-dark px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-wait disabled:opacity-60">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {submitting ? "Saving..." : "Save Partner"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function ReferralNetwork() {
  const [agents,       setAgents]       = useState<Agent[]>(AGENTS);
  const [view,         setView]         = useState<View>("directory");
  const [query,        setQuery]        = useState("");
  const [roleFilter,   setRoleFilter]   = useState<PartnerRole | "All">("All");
  const [certFilter,   setCertFilter]   = useState<CertificationType | "All">("All");
  const [regionFilter, setRegionFilter] = useState<Region | "All">("All");
  const [specFilter,   setSpecFilter]   = useState<Specialization | "All">("All");
  const [activeAgent,  setActiveAgent]  = useState<Agent | null>(null);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [showFilters,  setShowFilters]  = useState(false);
  const [formOpen,     setFormOpen]     = useState(false);
  const [formMode,     setFormMode]     = useState<"add" | "edit">("add");
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [form,         setForm]         = useState<PartnerFormState>(EMPTY_PARTNER_FORM);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPartners() {
      try {
        const payload = await fetchOperationalRecords<Agent>("partners");
        if (!mounted) return;
        setAgents(payload.records);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load partner network.");
      }
    }

    void loadPartners();
    return () => { mounted = false; };
  }, []);

  const filteredAgents = useMemo(() => agents.filter(a => {
    const q = query.toLowerCase();
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.partnerRole.toLowerCase().includes(q) ||
      a.certification.toLowerCase().includes(q) ||
      a.location.city.toLowerCase().includes(q) ||
      a.location.state.toLowerCase().includes(q) ||
      a.specializations.some(s => s.toLowerCase().includes(q));
    const matchRole   = roleFilter   === "All" || a.partnerRole             === roleFilter;
    const matchCert   = certFilter   === "All" || a.certification           === certFilter;
    const matchRegion = regionFilter === "All" || a.location.region         === regionFilter;
    const matchSpec   = specFilter   === "All" || a.specializations.includes(specFilter as Specialization);
    return matchSearch && matchRole && matchCert && matchRegion && matchSpec;
  }), [agents, query, roleFilter, certFilter, regionFilter, specFilter]);

  const networkVolume = agents.reduce((sum, a) => {
    return sum + parseFloat(a.closedVolumeMTD.replace(/[$M]/g, ""));
  }, 0).toFixed(1);

  const avgScore = agents.length
    ? (agents.reduce((s, a) => s + a.productionScore, 0) / agents.length).toFixed(1)
    : "0.0";
  const regionCount = new Set(agents.map((agent) => agent.location.region)).size;
  const regionLabel = regionCount ? `Across ${regionCount} regions` : "No regions yet";
  const lenderCount = agents.filter((agent) => agent.partnerRole === "Mortgage Lender").length;

  const openModal = useCallback((agent: Agent) => {
    setActiveAgent(agent);
    setModalOpen(true);
  }, []);

  function clearFilters() {
    setQuery(""); setRoleFilter("All"); setCertFilter("All"); setRegionFilter("All"); setSpecFilter("All");
  }

  const hasActiveFilters = query || roleFilter !== "All" || certFilter !== "All" || regionFilter !== "All" || specFilter !== "All";

  function updateForm(patch: Partial<PartnerFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function openAddPartner() {
    setFormMode("add");
    setEditingAgent(null);
    setForm(EMPTY_PARTNER_FORM);
    setFormOpen(true);
  }

  function openEditPartner(agent: Agent) {
    setFormMode("edit");
    setEditingAgent(agent);
    setForm(agentToForm(agent));
    setFormOpen(true);
  }

  async function handleSubmitPartner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const nextAgent = formToAgent(form, editingAgent ?? undefined);
      if (formMode === "edit" && editingAgent) {
        const payload = await updateOperationalRecord<Agent>("partners", editingAgent.id, nextAgent);
        setAgents((current) => current.map((agent) => agent.id === editingAgent.id ? payload.record : agent));
        setActiveAgent((current) => current?.id === editingAgent.id ? payload.record : current);
      } else {
        const payload = await createOperationalRecord<Agent>("partners", nextAgent);
        setAgents((current) => [payload.record, ...current]);
      }
      setFormOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save partner.");
    } finally {
      setSubmitting(false);
    }
  }

  async function archivePartner(agent: Agent) {
    setError(null);

    try {
      await archiveOperationalRecord("partners", agent.id);
      setAgents((current) => current.filter((item) => item.id !== agent.id));
      setActiveAgent((current) => current?.id === agent.id ? null : current);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to archive partner.");
    }
  }

  // ── Map view ──
  if (view === "map") {
    return (
      <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Map toolbar */}
        <div className="flex-shrink-0 bg-white border-b border-line px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-gold" />
            <h1 className="text-sm font-bold text-dravik-dark">DRAVIK Partner Network</h1>
            <span className="text-[10px] font-bold text-gold bg-gold-light px-2 py-0.5 rounded-full border border-gold/30">
              Partner Map
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAddPartner}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-dravik-dark px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-black"
            >
              <Plus size={13} />
              Add Partner
            </button>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        {error && (
          <div className="flex-shrink-0 border-b border-rose-200 bg-rose-50 px-6 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <ReferralMapView agents={agents} onInitiateReferral={openModal} />
        </div>

        <ReferralModal agent={activeAgent} open={modalOpen} onClose={() => setModalOpen(false)} />
        <PartnerFormModal
          open={formOpen}
          mode={formMode}
          form={form}
          submitting={submitting}
          onChange={updateForm}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmitPartner}
        />
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
            <h1 className="text-xl font-bold text-dravik-dark">DRAVIK Partner Network</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAddPartner}
              className="inline-flex items-center gap-2 rounded-xl bg-dravik-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              <Plus size={15} />
              Add Partner
            </button>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={Users}     label="Network Partners"     value={String(agents.length)} sub={`${lenderCount} lenders · ${regionLabel}`} color="#C9C3B6" />
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
                placeholder="Search by name, city, lender, or specialization..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-line rounded-xl text-sm text-dravik-dark placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dravik-dark">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors",
                showFilters ? "bg-dravik-dark text-white border-dravik-dark" : "bg-white text-gray-600 border-line hover:bg-surface"
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
              <FilterSelect label="Partner type"    value={roleFilter}   onChange={setRoleFilter}   options={ROLE_OPTIONS}   />
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
              <h2 className="text-lg font-bold text-dravik-dark">Partner Directory</h2>
            </div>
            <span className="text-sm text-gray-400 font-medium">
              {filteredAgents.length} of {agents.length} partners
            </span>
          </div>

          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredAgents.map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onInitiate={openModal}
                  onEdit={openEditPartner}
                  onDelete={(item) => void archivePartner(item)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-line py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
                <Search size={22} className="text-gray-300" />
              </div>
              <p className="font-semibold text-dravik-dark">No partners match your filters</p>
              <p className="text-sm text-gray-400 max-w-xs">Try adjusting the search or clearing the active filters.</p>
              <button onClick={clearFilters} className="mt-2 text-sm font-semibold text-gold hover:text-gold-dark transition-colors">
                Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* Referral pipeline */}
        <section className="space-y-4 pb-10">
          <div className="flex items-center gap-3">
            <span className="w-1 h-5 rounded-full bg-gold inline-block" />
            <h2 className="text-lg font-bold text-dravik-dark">Global Referral Pipeline</h2>
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
      <PartnerFormModal
        open={formOpen}
        mode={formMode}
        form={form}
        submitting={submitting}
        onChange={updateForm}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitPartner}
      />
    </div>
  );
}
