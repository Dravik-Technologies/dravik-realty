"use client";

import { useState, useMemo } from "react";
import {
  Users, UserCheck, Clock, TrendingUp, DollarSign,
  Search, X, UserPlus, LayoutList, Network,
} from "lucide-react";
import type { Agent, DirectoryFilter, DirectoryView, SortField } from "@dravik/contracts/broker";
import { AGENTS, TEAMS } from "../../data/team";
import AgentDirectory from "./AgentDirectory";
import AgentPanel     from "./AgentPanel";
import OnboardingForm from "./OnboardingForm";
import HierarchyView  from "./HierarchyView";
import { cn, formatCurrency } from "@dravik/shared";

// ─── KPI card ─────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, accent, sub }: {
  icon: React.ElementType; label: string; value: string; accent: string; sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-xl font-bold text-dravik-dark leading-none">{value}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Filter tab config ────────────────────────────────────────
const FILTER_TABS: { id: DirectoryFilter; label: string }[] = [
  { id: "all",        label: "All Agents"   },
  { id: "my-team",    label: "My Team"      },
  { id: "dual",       label: "Dual Licensed"},
  { id: "new-agents", label: "New Agents"   },
];

// ─── TeamDashboard ────────────────────────────────────────────
export default function TeamDashboard() {
  const [agents, setAgents] = useState<Agent[]>(AGENTS);

  const [filter, setFilter]         = useState<DirectoryFilter>("all");
  const [view,   setView]           = useState<DirectoryView>("directory");
  const [search, setSearch]         = useState("");
  const [sortField, setSortField]   = useState<SortField>("ytdVolume");
  const [sortDir,   setSortDir]     = useState<"asc" | "desc">("desc");

  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [panelOpen,     setPanelOpen]     = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ── KPI computations (useMemo to avoid re-running on every render) ──
  const kpis = useMemo(() => {
    const active      = agents.filter((a) => a.status === "Active");
    const onboarding  = agents.filter((a) => a.status === "Onboarding");
    const totalGci    = agents.reduce((s, a) => s + a.ytdGci, 0);
    const monthlyGci  = Math.round(totalGci / 5);
    const avgProd     = active.length > 0
      ? Math.round(active.reduce((s, a) => s + a.ytdVolume, 0) / active.length)
      : 0;
    return {
      total:      agents.length,
      active:     active.length,
      onboarding: onboarding.length,
      monthlyGci,
      avgProd,
    };
  }, [agents]);

  // ── Filtering + search + sort ─────────────────────────────
  const NEW_AGENT_CUTOFF = "2024-11-29"; // 18 months before 2026-05-29

  const filtered = useMemo(() => {
    let list = agents;
    switch (filter) {
      case "my-team":    list = list.filter((a) => a.managerId === "a1"); break;
      case "dual":       list = list.filter((a) => a.licenseType === "Dual"); break;
      case "new-agents": list = list.filter((a) => a.joinDate >= NEW_AGENT_CUTOFF); break;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q)   ||
          a.email.toLowerCase().includes(q)  ||
          a.role.toLowerCase().includes(q)   ||
          a.licenseType.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortField) {
        case "name":          return dir * a.name.localeCompare(b.name);
        case "ytdVolume":     return dir * (a.ytdVolume    - b.ytdVolume);
        case "closedUnits":   return dir * (a.closedUnits  - b.closedUnits);
        case "referralScore": return dir * (a.referralScore - b.referralScore);
        case "lastActivity":  return dir * a.lastActivity.localeCompare(b.lastActivity);
        default: return 0;
      }
    });
  }, [agents, filter, search, sortField, sortDir]);

  // ── Tab counts ────────────────────────────────────────────
  function tabCount(f: DirectoryFilter): number {
    if (f === "all")        return agents.length;
    if (f === "my-team")    return agents.filter((a) => a.managerId === "a1").length;
    if (f === "dual")       return agents.filter((a) => a.licenseType === "Dual").length;
    if (f === "new-agents") return agents.filter((a) => a.joinDate >= NEW_AGENT_CUTOFF).length;
    return 0;
  }

  // ── Handlers ──────────────────────────────────────────────
  function handleSelect(agent: Agent) {
    setSelectedAgent(agent);
    setPanelOpen(true);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  function handleOnboardSubmit(data: Partial<Agent>) {
    const newAgent: Agent = {
      id: `a${Date.now()}`,
      name:          data.name          ?? "New Agent",
      initials:      data.initials      ?? "NA",
      color:         data.color         ?? "#6366F1",
      email:         data.email         ?? "",
      phone:         data.phone         ?? "",
      address:       data.address       ?? "",
      licenseType:   data.licenseType   ?? "RE",
      licenseNumber: data.licenseNumber ?? "",
      licenseExpiry: data.licenseExpiry ?? "",
      status:        "Onboarding",
      role:          data.role          ?? "Agent",
      teamId:        data.teamId,
      managerId:     data.teamId === "direct" ? "a1" : undefined,
      joinDate:      "2026-05-29",
      ytdVolume:     0, ytdGci: 0, closedUnits: 0, activeListings: 0,
      referralScore: 0, avgDaysToClose: 0, conversionRate: 0,
      lastActivity:  "2026-05-29",
      monthlyVolume: [0, 0, 0, 0, 0, 0],
      splitPercent:   data.splitPercent   ?? 65,
      dravikCutPercent: data.dravikCutPercent ?? 35,
      customRules:    [],
      referralsSent: 0, referralsReceived: 0, referralRevenue: 0,
      eAndOExpiry:   data.eAndOExpiry ?? "",
      boardMemberships: [], certifications: [],
      recentActivity: [],
    };
    setAgents((prev) => [newAgent, ...prev]);
  }

  return (
    <>
      <div
        className="flex flex-col overflow-hidden bg-surface"
        style={{ height: "calc(100vh - 4rem)" }}
      >
        {/* ── Top bar ──────────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-line">
          {/* KPI strip */}
          <div className="flex items-center divide-x divide-line overflow-x-auto">
            <KpiCard icon={Users}     label="Total Agents"         value={String(kpis.total)}                   accent="#D4AF37" />
            <KpiCard icon={UserCheck} label="Active"               value={String(kpis.active)}                  accent="#10B981" sub={`${kpis.onboarding} onboarding`} />
            <KpiCard icon={Clock}     label="Pending Onboarding"   value={String(kpis.onboarding)}              accent="#3B82F6" />
            <KpiCard icon={DollarSign}label="GCI This Month"       value={formatCurrency(kpis.monthlyGci)}      accent="#8B5CF6" />
            <KpiCard icon={TrendingUp}label="Avg Production"       value={`$${(kpis.avgProd / 1_000_000).toFixed(1)}M`} accent="#F59E0B" sub="Active agents" />

            {/* Spacer + search */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2 min-w-[280px]">
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search agents…"
                  className="w-full pl-8 pr-8 py-2 bg-surface-2 border border-transparent rounded-xl text-sm text-dravik-dark placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dravik-dark">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sub-nav: filters + view toggle + actions */}
          <div className="flex items-center justify-between px-4 border-t border-line overflow-x-auto">
            {/* Filter tabs */}
            <div className="flex items-center gap-0">
              {FILTER_TABS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors",
                    filter === id
                      ? "border-gold text-dravik-dark"
                      : "border-transparent text-gray-400 hover:text-dravik-dark hover:border-gray-200"
                  )}
                >
                  {label}
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    filter === id ? "bg-gold-light text-gold" : "bg-surface-2 text-gray-400"
                  )}>
                    {tabCount(id)}
                  </span>
                </button>
              ))}
            </div>

            {/* Right: view toggle + actions */}
            <div className="flex items-center gap-2 py-1.5">
              {/* View toggle */}
              <div className="flex bg-surface-2 rounded-xl p-0.5">
                {(["directory", "hierarchy"] as DirectoryView[]).map((v) => {
                  const Icon = v === "directory" ? LayoutList : Network;
                  return (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      title={v === "directory" ? "Directory view" : "Hierarchy view"}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                        view === v ? "bg-dravik-dark text-white shadow-sm" : "text-gray-400 hover:text-dravik-dark"
                      )}
                    >
                      <Icon size={12} />
                      <span className="hidden sm:inline capitalize">{v}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Agent */}
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-gold text-dravik-dark hover:bg-gold-dark transition-colors"
              >
                <UserPlus size={12} /> Add Agent
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {view === "directory" ? (
            <AgentDirectory
              agents={filtered}
              onSelect={handleSelect}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
            />
          ) : (
            <HierarchyView
              agents={agents}
              teams={TEAMS}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>

      {/* ── Sliding panel ───────────────────────────────────── */}
      <AgentPanel
        agent={selectedAgent}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />

      {/* ── Onboarding wizard ───────────────────────────────── */}
      <OnboardingForm
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSubmit={handleOnboardSubmit}
      />
    </>
  );
}
