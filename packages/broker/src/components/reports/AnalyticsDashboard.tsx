"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import {
  DollarSign, TrendingUp, Clock, Users, Award, BarChart3,
  Calendar, ChevronDown, Building2,
} from "lucide-react";
import type { DateRange, ViewMode, ReportTab, AnalyticsSnapshot, CampaignStat, MortgageMonthStat } from "@dravik/contracts/broker";
import { ANALYTICS_DATA } from "../../data/analytics";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── Dynamic chart imports (ssr: false — Recharts uses ResizeObserver) ──
const ProductionChart = dynamic(() => import("./ProductionChart"), {
  ssr: false,
  loading: () => <div className="h-[560px] rounded-2xl bg-surface-2 animate-pulse" />,
});
const LeadFunnel = dynamic(() => import("./LeadFunnel"), {
  ssr: false,
  loading: () => <div className="h-[480px] rounded-2xl bg-surface-2 animate-pulse" />,
});
const ReferralMetrics = dynamic(() => import("./ReferralMetrics"), {
  ssr: false,
  loading: () => <div className="h-[400px] rounded-2xl bg-surface-2 animate-pulse" />,
});

// ─── Static config ────────────────────────────────────────────
const TABS: { id: ReportTab; label: string; icon: React.ElementType }[] = [
  { id: "production", label: "Production",  icon: TrendingUp  },
  { id: "leads",      label: "Leads",       icon: Users       },
  { id: "referrals",  label: "Referrals",   icon: Award       },
  { id: "marketing",  label: "Marketing",   icon: BarChart3   },
  { id: "mortgage",   label: "Mortgage",    icon: Building2   },
];

const DATE_RANGES: { id: DateRange; label: string }[] = [
  { id: "30d",     label: "Last 30d" },
  { id: "quarter", label: "Quarter"  },
  { id: "year",    label: "Year"     },
  { id: "custom",  label: "Custom"   },
];

// ─── KPI card (module level) ──────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, accent, delta }: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent: string; delta?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-line px-5 py-4">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}18` }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
        {delta && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            delta.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
          )}>{delta}</span>
        )}
      </div>
      <p className="text-xl font-bold text-dravik-dark mt-2 leading-none">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Marketing tab content (module level) ─────────────────────
interface CampTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CampaignTooltip({ active, payload, label }: CampTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-xl shadow-lg px-3 py-2.5 space-y-1">
      <p className="text-[10px] font-bold text-dravik-dark">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          <span className="font-semibold">{p.value}</span> {p.name}
        </p>
      ))}
    </div>
  );
}

function MarketingTab({ campaigns }: { campaigns: CampaignStat[] }) {
  const [drillId, setDrillId] = useState<string | null>(null);

  const barData = campaigns.map((c) => ({
    name:        c.name.length > 18 ? c.name.slice(0, 17) + "…" : c.name,
    fullName:    c.name,
    id:          c.id,
    leads:       c.leads,
    conversions: c.conversions,
    color:       c.color,
  }));

  const selected = campaigns.find((c) => c.id === drillId);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-line p-5">
        <p className="text-sm font-bold text-dravik-dark mb-1">Campaign Performance</p>
        <p className="text-xs text-gray-400 mb-4">Click a bar to see campaign detail</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData} margin={{ top: 4, right: 4, left: 0, bottom: 32 }} barSize={20} style={{ cursor: "pointer" }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<CampaignTooltip />} />
            <Bar dataKey="leads" name="leads" radius={[0, 0, 0, 0]}
              onClick={(d) => { const id = (d as unknown as { id: string }).id; setDrillId(id === drillId ? null : id); }}>
              {barData.map((d) => (
                <Cell key={d.id} fill={drillId && drillId !== d.id ? "#F1F3F5" : "#CBD5E1"} />
              ))}
            </Bar>
            <Bar dataKey="conversions" name="conversions" radius={[4, 4, 0, 0]}
              onClick={(d) => { const id = (d as unknown as { id: string }).id; setDrillId(id === drillId ? null : id); }}>
              {barData.map((d) => (
                <Cell key={d.id} fill={drillId && drillId !== d.id ? "#F5EDD3" : d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign table */}
      <div className="bg-white rounded-2xl border border-line overflow-hidden">
        <div className="grid grid-cols-5 gap-0 px-4 py-2.5 bg-surface-2 border-b border-line text-[10px] font-bold text-gray-400 uppercase tracking-wide">
          <div className="col-span-2">Campaign</div>
          <div className="text-right">Leads</div>
          <div className="text-right">CPL</div>
          <div className="text-right">Conv.</div>
        </div>
        {campaigns.map((c) => {
          const cpl = c.leads > 0 ? Math.round(c.cost / c.leads) : 0;
          const roi = c.cost > 0 ? ((c.conversions * 15_000) / c.cost).toFixed(1) : "—";
          return (
            <button
              key={c.id}
              onClick={() => setDrillId(c.id === drillId ? null : c.id)}
              className={cn(
                "w-full grid grid-cols-5 gap-0 px-4 py-3 border-b border-line last:border-0 text-left transition-colors",
                drillId === c.id ? "bg-gold-light" : "hover:bg-surface"
              )}
            >
              <div className="col-span-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <div>
                  <p className="text-xs font-semibold text-dravik-dark truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400">{c.type}</p>
                </div>
              </div>
              <p className="text-xs font-semibold text-dravik-dark text-right self-center">{c.leads}</p>
              <p className="text-xs font-semibold text-dravik-dark text-right self-center">${cpl}</p>
              <div className="text-right self-center">
                <p className="text-xs font-bold text-gold">{c.conversions}</p>
                <p className="text-[9px] text-gray-400">{roi}x ROI</p>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="p-4 bg-surface rounded-2xl border border-line">
          <p className="text-sm font-bold text-dravik-dark mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: selected.color }} />
            {selected.name}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Leads",   value: selected.leads                                 },
              { label: "Conversions",   value: selected.conversions                           },
              { label: "Cost Per Lead", value: `$${Math.round(selected.cost / Math.max(selected.leads, 1))}` },
              { label: "Conv. Rate",    value: `${Math.round(selected.conversions / Math.max(selected.leads, 1) * 100)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl p-3 text-center border border-line">
                <p className="text-lg font-bold text-dravik-dark">{value}</p>
                <p className="text-[10px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mortgage tab content (module level) ─────────────────────
interface MortTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}

function MortgageTooltip({ active, payload, label }: MortTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-xl shadow-lg px-3 py-2.5 space-y-0.5">
      <p className="text-[10px] font-bold text-dravik-dark">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs text-gray-600">
          <span className="font-semibold">{p.value}</span> {p.name}
        </p>
      ))}
    </div>
  );
}

function MortgageTab({ months, conversionRate, avgLoanSize, avgRate, mortgageRevenue }: {
  months: MortgageMonthStat[];
  conversionRate: number;
  avgLoanSize: number;
  avgRate: number;
  mortgageRevenue: number;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pre-Qual → Funded",   value: `${conversionRate}%`,             accent: "#D4AF37" },
          { label: "Avg Loan Size",        value: formatCurrency(avgLoanSize),       accent: "#3B82F6" },
          { label: "Avg Interest Rate",    value: `${avgRate.toFixed(2)}%`,          accent: "#10B981" },
          { label: "Mortgage Revenue",     value: formatCurrency(mortgageRevenue),   accent: "#8B5CF6" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white rounded-2xl border border-line px-4 py-3">
            <p className="text-xl font-bold" style={{ color: accent }}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-line p-5">
        <p className="text-sm font-bold text-dravik-dark mb-1">Loan Pipeline by Period</p>
        <p className="text-xs text-gray-400 mb-4">Pre-Qual → Application → Approval → Funded</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={months} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={12} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<MortgageTooltip />} />
            <Bar dataKey="preQuals"     name="pre-quals"     fill="#CBD5E1" radius={[3,3,0,0]} />
            <Bar dataKey="applications" name="applications"  fill="#3B82F6" radius={[3,3,0,0]} />
            <Bar dataKey="approvals"    name="approvals"     fill="#8B5CF6" radius={[3,3,0,0]} />
            <Bar dataKey="funded"       name="funded"        fill="#D4AF37" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-4 mt-2">
          {[
            { label: "Pre-Qual",     color: "#CBD5E1" },
            { label: "Application",  color: "#3B82F6" },
            { label: "Approved",     color: "#8B5CF6" },
            { label: "Funded",       color: "#D4AF37" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Monthly rate table */}
      <div className="bg-white rounded-2xl border border-line overflow-hidden">
        <div className="grid grid-cols-5 gap-0 px-4 py-2.5 bg-surface-2 border-b border-line text-[10px] font-bold text-gray-400 uppercase tracking-wide">
          <div>Period</div>
          <div className="text-center">Pre-Quals</div>
          <div className="text-center">Funded</div>
          <div className="text-right">Avg Loan</div>
          <div className="text-right">Rate</div>
        </div>
        {months.map((m) => (
          <div key={m.month} className="grid grid-cols-5 gap-0 px-4 py-2.5 border-b border-line last:border-0 hover:bg-surface transition-colors">
            <p className="text-xs font-semibold text-dravik-dark">{m.month}</p>
            <p className="text-xs text-gray-500 text-center">{m.preQuals}</p>
            <p className="text-xs font-bold text-gold text-center">{m.funded}</p>
            <p className="text-xs text-dravik-dark text-right">{formatCurrency(m.avgLoanSize)}</p>
            <p className="text-xs text-gray-500 text-right">{m.avgRate.toFixed(2)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AnalyticsDashboard ───────────────────────────────────────
export default function AnalyticsDashboard() {
  const [dateRange, setDateRange]     = useState<DateRange>("year");
  const [viewMode, setViewMode]       = useState<ViewMode>("broker");
  const [tab, setTab]                 = useState<ReportTab>("production");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd]     = useState("");

  const snap: AnalyticsSnapshot = ANALYTICS_DATA[dateRange];
  const primaryAgent = snap.agents[0];

  const kpiVolume       = viewMode === "broker" ? snap.teamVolume            : (primaryAgent?.closedVolume ?? 0);
  const kpiGci          = viewMode === "broker" ? snap.teamGci               : (primaryAgent?.gci ?? 0);
  const kpiConv         = viewMode === "broker" ? snap.teamConversionRate    : (primaryAgent?.conversionRate ?? 0);
  const kpiDays         = viewMode === "broker" ? snap.teamAvgDaysToClose    : (primaryAgent?.avgDaysToClose ?? 0);
  const kpiReferralRev  = viewMode === "broker" ? snap.teamReferralRevenue   : snap.agentReferralRevenue;
  const kpiMortgageRev  = viewMode === "broker" ? snap.teamMortgageRevenue   : snap.agentMortgageRevenue;

  // Derive agent-scaled arrays for tabs that show pipeline/campaign data.
  // Chris (agents[0]) holds ~29% of team volume — reuse that ratio to scale counts.
  const teamVol  = snap.agents.reduce((s, a) => s + a.closedVolume, 0);
  const agentShr = teamVol > 0 && primaryAgent ? primaryAgent.closedVolume / teamVol : 0;
  const isAgent  = viewMode === "agent";

  const displayLeadSources = isAgent
    ? snap.leadSources.map((s) => ({
        ...s,
        leads:         Math.max(1, Math.round(s.leads         * agentShr)),
        contacted:     Math.max(0, Math.round(s.contacted     * agentShr)),
        underContract: Math.max(0, Math.round(s.underContract * agentShr)),
        closed:        Math.max(0, Math.round(s.closed        * agentShr)),
      }))
    : snap.leadSources;

  const displayFunnel = isAgent
    ? snap.funnel.map((s) => ({ ...s, count: Math.max(1, Math.round(s.count * agentShr)) }))
    : snap.funnel;

  const displayCampaigns = isAgent
    ? snap.campaigns.map((c) => ({
        ...c,
        leads:       Math.max(1, Math.round(c.leads       * agentShr)),
        conversions: Math.max(0, Math.round(c.conversions * agentShr)),
        cost:        Math.round(c.cost * agentShr),
      }))
    : snap.campaigns;

  const displayMortgageMonths = isAgent
    ? snap.mortgageMonths.map((m) => ({
        ...m,
        preQuals:     Math.max(1, Math.round(m.preQuals     * agentShr)),
        applications: Math.max(0, Math.round(m.applications * agentShr)),
        approvals:    Math.max(0, Math.round(m.approvals    * agentShr)),
        funded:       Math.max(0, Math.round(m.funded       * agentShr)),
      }))
    : snap.mortgageMonths;

  const dateLabel = DATE_RANGES.find((r) => r.id === dateRange)?.label ?? "Year";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-line px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-dravik-dark">Reports & Analytics</h1>
            <p className="text-xs text-gray-400 mt-0.5">Performance insights and business intelligence</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* View mode toggle */}
            <div className="flex bg-surface-2 rounded-xl p-0.5">
              {(["agent", "broker"] as ViewMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize",
                    viewMode === m ? "bg-dravik-dark text-white shadow-sm" : "text-gray-400 hover:text-dravik-dark"
                  )}
                >
                  {m === "broker" ? "Broker View" : "My Stats"}
                </button>
              ))}
            </div>

            {/* Date range picker */}
            <div className="relative">
              <button
                onClick={() => setShowDateMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-xl text-xs font-semibold text-dravik-dark hover:border-gold/40 transition-colors"
              >
                <Calendar size={13} className="text-gold" />
                {dateLabel}
                <ChevronDown size={12} className="text-gray-400" />
              </button>
              {showDateMenu && (
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-line rounded-xl shadow-lg z-20 overflow-hidden min-w-[130px]">
                  {DATE_RANGES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setDateRange(r.id); setShowDateMenu(false); }}
                      className={cn(
                        "w-full px-4 py-2 text-xs font-semibold text-left hover:bg-surface transition-colors",
                        dateRange === r.id ? "text-gold bg-gold-light" : "text-dravik-dark"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Custom date inputs — shown only when Custom is selected */}
            {dateRange === "custom" && (
              <div className="flex items-center gap-1 border border-line rounded-xl bg-white px-2.5 py-1.5">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="text-xs text-dravik-dark bg-transparent outline-none w-[120px]"
                />
                <span className="text-gray-300 text-xs">–</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="text-xs text-dravik-dark bg-transparent outline-none w-[120px]"
                />
              </div>
            )}

          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard icon={DollarSign}  label="Closed Volume"    value={`$${(kpiVolume / 1_000_000).toFixed(1)}M`}  accent="#D4AF37" delta="+12%" />
          <KpiCard icon={TrendingUp}  label="GCI"              value={`$${(kpiGci / 1_000).toFixed(0)}K`}         accent="#10B981" delta="+8%"  />
          <KpiCard icon={Building2}   label="Mortgage Rev."    value={formatCurrency(kpiMortgageRev)}              accent="#3B82F6"               />
          <KpiCard icon={BarChart3}   label="Conversion Rate"  value={`${kpiConv}%`}                               accent="#8B5CF6" delta="+2%"  />
          <KpiCard icon={Clock}       label="Avg Days/Close"   value={`${kpiDays}d`}                               accent="#F59E0B"               />
          <KpiCard icon={Award}       label="Referral Rev."    value={formatCurrency(kpiReferralRev)}              accent="#EF4444" delta="+5%"  />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition-colors",
                tab === id
                  ? "border-gold text-dravik-dark"
                  : "border-transparent text-gray-400 hover:text-dravik-dark"
              )}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {tab === "production" && (
          <ProductionChart
            timeSeries={snap.timeSeries}
            agents={snap.agents}
            viewMode={viewMode}
          />
        )}
        {tab === "leads" && (
          <LeadFunnel
            sources={displayLeadSources}
            funnel={displayFunnel}
          />
        )}
        {tab === "referrals" && (
          <ReferralMetrics
            partners={snap.referralPartners}
            referralsSent={isAgent     ? snap.agentReferralsSent       : snap.referralsSent}
            referralsReceived={isAgent ? snap.agentReferralsReceived   : snap.referralsReceived}
            referralSuccessRate={isAgent ? snap.agentReferralSuccessRate : snap.referralSuccessRate}
            avgReferralFee={isAgent    ? snap.agentAvgReferralFee      : snap.avgReferralFee}
            referralRevenue={kpiReferralRev}
          />
        )}
        {tab === "marketing" && (
          <MarketingTab campaigns={displayCampaigns} />
        )}
        {tab === "mortgage" && (
          <MortgageTab
            months={displayMortgageMonths}
            conversionRate={isAgent ? snap.agentMortgageConversionRate : snap.mortgageConversionRate}
            avgLoanSize={isAgent    ? snap.agentAvgLoanSize            : snap.avgLoanSize}
            avgRate={isAgent        ? snap.agentAvgRate                : snap.avgRate}
            mortgageRevenue={kpiMortgageRev}
          />
        )}
      </div>

      {/* Dismiss date menu on outside click */}
      {showDateMenu && (
        <div
          className="fixed inset-0 z-10"
          aria-hidden
          onClick={() => setShowDateMenu(false)}
        />
      )}
    </div>
  );
}
