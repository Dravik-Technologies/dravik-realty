"use client";

import { useState, useMemo } from "react";
import {
  ClipboardList, FileCheck, BadgeDollarSign, BarChart3,
  TrendingUp, Landmark, Search, X, Calculator, Kanban,
  AlertTriangle,
} from "lucide-react";
import type { MortgageApplication, LoanView } from "@dravik/contracts/lending";
import { MORTGAGE_APPS } from "../data/mortgage";
import MortgagePipeline    from "./MortgagePipeline";
import MortgageDetailPanel from "./MortgageDetailPanel";
import PreQualCalculator   from "./PreQualCalculator";
import { formatCurrency }  from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── KPI card ─────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, accent, warn,
}: {
  icon:   React.ElementType;
  label:  string;
  value:  string;
  sub?:   string;
  accent?: string;
  warn?:  boolean;
}) {
  return (
    <div
      className={cn(
        "bg-white border rounded-2xl px-5 py-4 flex items-center gap-4 transition-shadow hover:shadow-sm",
        warn ? "border-amber-300 bg-amber-50/30" : "border-line"
      )}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accent ? `${accent}18` : undefined }}
        {...(!accent && { className: "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-surface-2" })}
      >
        <Icon size={20} style={accent ? { color: accent } : { color: "#9CA3AF" }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-axen-dark leading-none tabular-nums">{value}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{label}</p>
        {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
      </div>
      {warn && <AlertTriangle size={14} className="text-amber-500 ml-auto flex-shrink-0" />}
    </div>
  );
}

// ─── View toggle ──────────────────────────────────────────────
const VIEW_OPTIONS: { id: LoanView; label: string }[] = [
  { id: "my-loans",   label: "My Loans"   },
  { id: "team-loans", label: "Team"       },
  { id: "all",        label: "All"        },
];

// ─── Section tabs ─────────────────────────────────────────────
const SECTIONS = [
  { id: "pipeline",   label: "Pipeline",   icon: Kanban     },
  { id: "calculator", label: "Calculators",icon: Calculator },
] as const;
type Section = "pipeline" | "calculator";

// ─── MortgageDashboard ────────────────────────────────────────
export default function MortgageDashboard() {
  const [applications, setApplications] = useState<MortgageApplication[]>(MORTGAGE_APPS);
  const [view,      setView]     = useState<LoanView>("my-loans");
  const [section,   setSection]  = useState<Section>("pipeline");
  const [search,    setSearch]   = useState("");
  const [selected,  setSelected] = useState<MortgageApplication | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // ── Filter apps by view ────────────────────────────────────
  const filteredApps = useMemo(() => {
    let apps = applications;
    if (view === "my-loans")   apps = apps.filter((a) => a.assignedOfficer === "Chris Macabugao");
    if (view === "team-loans") apps = apps.filter((a) => a.assignedOfficer !== "Chris Macabugao");
    if (search.trim()) {
      const q = search.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.clientName.toLowerCase().includes(q) ||
          a.propertyAddress.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.loanType.toLowerCase().includes(q)
      );
    }
    return apps;
  }, [applications, view, search]);

  // ── KPI computations ───────────────────────────────────────
  const kpis = useMemo(() => {
    const base    = view === "all" ? applications : filteredApps;
    const active  = base.filter((a) => a.stage !== "declined");
    const preQual = base.filter((a) => a.stage === "pre-qual" || a.stage === "application").length;
    const inUW    = base.filter((a) => a.stage === "underwriting").length;
    const closing = base.filter((a) => a.stage === "closing").length;
    const approved = base.filter((a) => a.stage === "approved" || a.stage === "closing").length;
    const denominator = active.length;
    const approvalRate = denominator > 0 ? Math.round((approved / denominator) * 100) : 0;
    const avgLoan  = active.length > 0
      ? Math.round(active.reduce((s, a) => s + a.loanAmount, 0) / active.length)
      : 0;
    const revenue  = closing * 7_800 + base.filter((a) => a.stage === "approved").length * 3_200;

    const urgentClosing = base.filter((a) => a.stage === "closing" && a.closingDate.includes("Jun 5")).length;

    return { preQual, inUW, closing, approvalRate, avgLoan, revenue, urgentClosing };
  }, [applications, filteredApps, view]);

  // ── Handlers ─────────────────────────────────────────────────
  function handleSelect(app: MortgageApplication) {
    setSelected(app);
    setPanelOpen(true);
  }

  function handleClose() {
    setPanelOpen(false);
  }

  // Sync selected app with latest state (in case stage was dragged)
  const selectedApp = selected
    ? (applications.find((a) => a.id === selected.id) ?? selected)
    : null;

  return (
    <div className="flex flex-col min-h-full bg-surface relative">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-line px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gold-light border border-gold/30 flex items-center justify-center flex-shrink-0">
              <Landmark size={18} className="text-gold" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-axen-dark leading-tight">Mortgage Tools</h1>
              <p className="text-xs text-gray-400">Pipeline · Underwriting · Calculators</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View toggle */}
            <div className="flex bg-surface-2 rounded-xl p-0.5">
              {VIEW_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setView(opt.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                    view === opt.id
                      ? "bg-white text-axen-dark shadow-sm"
                      : "text-gray-400 hover:text-axen-dark"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI strip ───────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard
            icon={ClipboardList}
            label="Active Pre-Quals"
            value={String(kpis.preQual)}
            sub="Pre-qual + Application"
            accent="#6366F1"
          />
          <KpiCard
            icon={FileCheck}
            label="In Underwriting"
            value={String(kpis.inUW)}
            sub="Awaiting decision"
            accent="#F59E0B"
          />
          <KpiCard
            icon={BadgeDollarSign}
            label="Funded / Closing"
            value={String(kpis.closing)}
            sub="This period"
            accent="#D4AF37"
            warn={kpis.urgentClosing > 0}
          />
          <KpiCard
            icon={BarChart3}
            label="Approval Rate"
            value={`${kpis.approvalRate}%`}
            sub="Approved + Closing"
            accent="#10B981"
          />
          <KpiCard
            icon={TrendingUp}
            label="Avg Loan Size"
            value={kpis.avgLoan > 0 ? formatCurrency(kpis.avgLoan) : "—"}
            sub="Active pipeline"
            accent="#3B82F6"
          />
          <KpiCard
            icon={Landmark}
            label="Mortgage Revenue"
            value={kpis.revenue > 0 ? formatCurrency(kpis.revenue) : "—"}
            sub="Origination fees est."
            accent="#D4AF37"
          />
        </div>
      </div>

      {/* ── Section tabs + search ────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pb-3 flex items-center gap-3">
        {/* Section tabs */}
        <div className="flex bg-surface-2 rounded-xl p-0.5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all",
                  section === s.id
                    ? "bg-white text-axen-dark shadow-sm"
                    : "text-gray-400 hover:text-axen-dark"
                )}
              >
                <Icon size={13} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Search (pipeline only) */}
        {section === "pipeline" && (
          <div className="flex-1 relative max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, address…"
              className="w-full pl-8 pr-8 py-2 text-xs bg-white border border-line rounded-xl text-axen-dark placeholder:text-gray-300 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-axen-dark"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Main content area ────────────────────────────────── */}
      <div
        className="flex-1 overflow-hidden"
        style={{ minHeight: 0 }}
      >
        {section === "pipeline" ? (
          <div className="h-full" style={{ minHeight: "520px" }}>
            <MortgagePipeline
              applications={filteredApps}
              setApplications={setApplications}
              onSelect={handleSelect}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <PreQualCalculator />
          </div>
        )}
      </div>

      {/* ── Detail panel ────────────────────────────────────── */}
      <MortgageDetailPanel
        app={selectedApp}
        open={panelOpen}
        onClose={handleClose}
      />
    </div>
  );
}
