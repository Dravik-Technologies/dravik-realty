"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Users,
  Flame,
  Clock3,
  TrendingUp,
  Search,
  X,
} from "lucide-react";
import LeadPipeline from "../components/leads/LeadPipeline";
import LeadDetailPanel from "../components/leads/LeadDetailPanel";
import { SAMPLE_LEADS } from "../data/leads";
import type { Lead, SubNavTab } from "@dravik/contracts/crm";
import { SUBNAV_TABS } from "@dravik/contracts/crm";
import { cn } from "@dravik/shared";

// ─── KPI card ─────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}
      >
        <Icon size={17} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-lg font-bold text-dravik-dark leading-none">{value}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function LeadsPage() {
  const [leads, setLeads]         = useState<Lead[]>(SAMPLE_LEADS);
  const [activeTab, setActiveTab] = useState<SubNavTab>("All Leads");
  const [query, setQuery]         = useState("");
  const [selectedLead, setSelectedLead]   = useState<Lead | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [now] = useState(() => Date.now());

  // ── Tab filtering ─────────────────────────────────────────
  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case "My Leads":    return leads.filter((l) => l.assignedTo === "Chris M.");
      case "Unassigned":  return leads.filter((l) => !l.assignedTo);
      case "Archived":    return [];  // no archived leads in sample data
      default:            return leads;
    }
  }, [activeTab, leads]);

  // ── Search filtering ──────────────────────────────────────
  const visibleLeads = useMemo(() => {
    if (!query.trim()) return tabFiltered;
    const q = query.toLowerCase();
    return tabFiltered.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.source.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q)
    );
  }, [tabFiltered, query]);

  // ── KPI computations ──────────────────────────────────────
  const kpis = useMemo(() => {
    const week   = 7 * 24 * 60 * 60 * 1000;
    const hot    = leads.filter(
      (l) =>
        l.behaviorScore >= 80 &&
        now - new Date(l.createdAt).getTime() < week * 4
    );
    const contracts = leads.filter((l) => l.status === "Under Contract");
    const rate      = leads.length
      ? Math.round((contracts.length / leads.length) * 100)
      : 0;

    return {
      total:      leads.length,
      hot:        hot.length,
      convRate:   `${rate}%`,
      avgResp:    "2.4h",  // mock
    };
  }, [leads, now]);

  // ── Lead select ───────────────────────────────────────────
  const handleSelectLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  return (
    <>
      {/* Full-height column: top bar + kanban */}
      <div
        className="flex flex-col overflow-hidden bg-surface"
        style={{ height: "calc(100vh - 4rem)" }}  // 4rem = shell header height
      >
        {/* ── Top bar: KPIs + sub-nav + search ──────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-line">

          {/* KPI strip */}
          <div className="flex items-center divide-x divide-line overflow-x-auto">
            <KpiCard
              icon={Users}
              label="Total Leads"
              value={String(kpis.total)}
              sub="All pipeline stages"
              accent="#C9C3B6"
            />
            <KpiCard
              icon={Flame}
              label="Hot Leads"
              value={String(kpis.hot)}
              sub="Score ≥ 80"
              accent="#EF4444"
            />
            <KpiCard
              icon={Clock3}
              label="Avg Response"
              value={kpis.avgResp}
              sub="This week"
              accent="#4A90A4"
            />
            <KpiCard
              icon={TrendingUp}
              label="Conversion Rate"
              value={kpis.convRate}
              sub="Under contract"
              accent="#10B981"
            />

            {/* Spacer + search */}
            <div className="flex-1 px-4 py-2.5 min-w-[200px]">
              <div className="relative max-w-xs">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter leads…"
                  className="w-full pl-8 pr-8 py-2 bg-surface-2 border border-transparent rounded-xl text-sm text-dravik-dark placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dravik-dark"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sub-nav tabs */}
          <div className="flex items-center gap-0 px-4 border-t border-line overflow-x-auto">
            {SUBNAV_TABS.map((tab) => {
              const count =
                tab === "All Leads"   ? leads.length :
                tab === "My Leads"    ? leads.filter((l) => l.assignedTo === "Chris M.").length :
                tab === "Unassigned"  ? leads.filter((l) => !l.assignedTo).length :
                0;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-gold text-dravik-dark"
                      : "border-transparent text-gray-400 hover:text-dravik-dark hover:border-gray-200"
                  )}
                >
                  {tab}
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      isActive
                        ? "bg-gold-light text-gold-dark"
                        : "bg-surface-2 text-gray-400"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Kanban pipeline ───────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {visibleLeads.length === 0 && query ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
                <Search size={20} className="text-gray-300" />
              </div>
              <p className="font-semibold text-dravik-dark">No leads match &ldquo;{query}&rdquo;</p>
              <button
                onClick={() => setQuery("")}
                className="text-sm text-gold hover:text-gold-dark font-semibold"
              >
                Clear search
              </button>
            </div>
          ) : (
            <LeadPipeline
              leads={visibleLeads}
              setLeads={setLeads}
              onSelectLead={handleSelectLead}
            />
          )}
        </div>
      </div>

      {/* ── Lead detail panel ─────────────────────────────── */}
      <LeadDetailPanel
        lead={selectedLead}
        open={panelOpen}
        onClose={handleClosePanel}
      />
    </>
  );
}
