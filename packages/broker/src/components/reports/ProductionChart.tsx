"use client";

import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import type { AgentStat, TimeSeriesPoint, ViewMode } from "@dravik/contracts/broker";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";
import { TrendingUp, Award } from "lucide-react";

// ─── Custom tooltips (module level) ──────────────────────────
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function VolumeTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-xl shadow-lg px-3 py-2.5 space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name === "volume" ? formatCurrency(p.value) :
           p.name === "gci"    ? `GCI: ${formatCurrency(p.value)}` :
           `${p.name}: ${p.value}`}
        </p>
      ))}
    </div>
  );
}

function TxTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-xl shadow-lg px-3 py-2.5">
      <p className="text-[10px] font-bold text-gray-400">{label}</p>
      <p className="text-xs font-semibold text-dravik-dark">{payload[0]?.value} transactions</p>
    </div>
  );
}

// ─── Agent leaderboard row (module level) ────────────────────
function AgentRow({ agent: a, rank }: { agent: AgentStat; rank: number }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
      <span className={cn(
        "w-5 h-5 flex-shrink-0 text-center text-[11px] font-bold",
        rank === 1 ? "text-gold" : rank === 2 ? "text-gray-400" : "text-gray-300"
      )}>
        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
      </span>
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
        style={{ background: a.color }}>
        {a.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-dravik-dark truncate">{a.name}</p>
        <p className="text-[10px] text-gray-400">{a.transactions} deals · {a.avgDaysToClose}d avg</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gold">{formatCurrency(a.gci)}</p>
        <p className="text-[10px] text-gray-400">GCI</p>
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block">
        <p className="text-xs font-semibold text-dravik-dark">{formatCurrency(a.closedVolume)}</p>
        <p className="text-[10px] text-gray-400">Volume</p>
      </div>
    </div>
  );
}

// ─── ProductionChart ──────────────────────────────────────────
interface Props {
  timeSeries: TimeSeriesPoint[];
  agents: AgentStat[];
  viewMode: ViewMode;
}

export default function ProductionChart({ timeSeries, agents, viewMode }: Props) {
  const primaryAgent = agents[0];
  const tickFmt = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` :
    v >= 1_000     ? `$${(v / 1_000).toFixed(0)}K` : `$${v}`;

  return (
    <div className="space-y-6">
      {/* Area chart — closed volume + GCI */}
      <div className="bg-white rounded-2xl border border-line p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-dravik-dark">Closed Volume & GCI</p>
            <p className="text-xs text-gray-400">Over selected period</p>
          </div>
          <TrendingUp size={16} className="text-gold" />
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={timeSeries} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#D4AF37" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gciGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={tickFmt} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<VolumeTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Area type="monotone" dataKey="volume" name="volume" stroke="#D4AF37" strokeWidth={2.5} fill="url(#volGrad)" dot={{ fill: "#D4AF37", r: 3 }} activeDot={{ r: 5 }} />
            <Area type="monotone" dataKey="gci"    name="gci"    stroke="#10B981" strokeWidth={2}   fill="url(#gciGrad)" dot={{ fill: "#10B981", r: 3 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart — transactions per period */}
      <div className="bg-white rounded-2xl border border-line p-5">
        <p className="text-sm font-bold text-dravik-dark mb-4">Transactions Closed</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={timeSeries} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<TxTooltip />} />
            <Bar dataKey="transactions" name="transactions" fill="#D4AF37" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leaderboard / personal stats */}
      <div className="bg-white rounded-2xl border border-line p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award size={15} className="text-gold" />
          <p className="text-sm font-bold text-dravik-dark">
            {viewMode === "broker" ? "Agent Leaderboard" : "My Performance"}
          </p>
        </div>
        {viewMode === "broker" ? (
          agents.length > 0 ? (
            <div>
              {agents.map((a, i) => <AgentRow key={a.id} agent={a} rank={i + 1} />)}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No agent production data yet.</p>
          )
        ) : primaryAgent ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Closed Volume",  value: formatCurrency(primaryAgent.closedVolume)       },
              { label: "GCI Earned",     value: formatCurrency(primaryAgent.gci)                },
              { label: "Transactions",   value: String(primaryAgent.transactions)               },
              { label: "Avg Days/Close", value: `${primaryAgent.avgDaysToClose}d`               },
            ].map(({ label, value }) => (
              <div key={label} className="bg-surface rounded-xl p-3 text-center">
                <p className="text-base font-bold text-dravik-dark">{value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No personal production data yet.</p>
        )}
      </div>
    </div>
  );
}
