"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, FunnelChart, Funnel, LabelList,
} from "recharts";
import type { LeadSourceStat, FunnelStep } from "@/types/analytics";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";

// ─── Custom tooltip ───────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function SourceTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-xl shadow-lg px-3 py-2.5 space-y-1 min-w-[140px]">
      <p className="text-[10px] font-bold text-axen-dark">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          <span className="font-semibold">{p.value}</span> {p.name}
        </p>
      ))}
    </div>
  );
}

// ─── Funnel chart label (module level) ───────────────────────
function FunnelLabel({ x, y, width = 0, height = 0, name, value }: {
  x?: string | number; y?: string | number; width?: number; height?: number; name?: string; value?: number;
}) {
  const nx = Number(x ?? 0);
  const ny = Number(y ?? 0);
  if (!name || height < 26) return null;
  return (
    <g>
      <text x={nx + width / 2} y={ny + height / 2 - 5} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
        {name}
      </text>
      <text x={nx + width / 2} y={ny + height / 2 + 9} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize={10}>
        {(value ?? 0).toLocaleString()}
      </text>
    </g>
  );
}

// ─── Funnel tooltip (module level) ───────────────────────────
interface FunnelTipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}

function FunnelTip({ active, payload }: FunnelTipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white border border-line rounded-xl shadow-lg px-3 py-2 space-y-0.5">
      <p className="text-xs font-bold text-axen-dark">{p.name}</p>
      <p className="text-sm font-bold" style={{ color: p.payload.fill }}>{p.value.toLocaleString()}</p>
    </div>
  );
}

// ─── Source detail table (module level) ─────────────────────
function SourceDetail({ source }: { source: LeadSourceStat }) {
  const convRate = source.leads > 0 ? Math.round((source.closed / source.leads) * 100) : 0;
  return (
    <div className="mt-4 p-4 bg-surface rounded-2xl border border-line space-y-3">
      <p className="text-sm font-bold text-axen-dark flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: source.color }} />
        {source.source} — Drill Down
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Total Leads",    value: source.leads,         sub: "Entered pipeline" },
          { label: "Contacted",      value: source.contacted,     sub: `${Math.round(source.contacted / source.leads * 100)}% of leads` },
          { label: "Under Contract", value: source.underContract, sub: `${Math.round(source.underContract / source.leads * 100)}% of leads` },
          { label: "Closed",         value: source.closed,        sub: `${convRate}% conversion` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl p-3 text-center border border-line">
            <p className="text-lg font-bold text-axen-dark">{value}</p>
            <p className="text-[10px] font-semibold text-gray-500">{label}</p>
            <p className="text-[9px] text-gray-300 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LeadFunnel ───────────────────────────────────────────────
interface Props {
  sources: LeadSourceStat[];
  funnel: FunnelStep[];
}

export default function LeadFunnel({ sources, funnel }: Props) {
  const [drillSource, setDrillSource] = useState<string | null>(null);

  const barData = sources.map((s) => ({
    source:       s.source,
    leads:        s.leads,
    contacted:    s.contacted,
    underContract:s.underContract,
    closed:       s.closed,
    color:        s.color,
  }));

  const selected  = sources.find((s) => s.source === drillSource) ?? null;
  const funnelTop = funnel[0]?.count ?? 1;
  const funnelData = funnel.map((s) => ({ name: s.stage, value: s.count, fill: s.color }));

  return (
    <div className="space-y-6">
      {/* Stacked bar — source breakdown */}
      <div className="bg-white rounded-2xl border border-line p-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm font-bold text-axen-dark">Lead Sources</p>
            <p className="text-xs text-gray-400">Click a bar to drill down by source</p>
          </div>
          {drillSource && (
            <button
              onClick={() => setDrillSource(null)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-gold bg-gold-light rounded-lg hover:bg-gold hover:text-axen-dark transition-all"
            >
              <X size={11} /> Clear filter
            </button>
          )}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barSize={32} style={{ cursor: "pointer" }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" vertical={false} />
            <XAxis dataKey="source" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<SourceTooltip />} />
            <Bar dataKey="leads" name="leads" radius={[0, 0, 0, 0]} stackId="a" fill="#E8E8E8"
              onClick={(d) => { const s = (d as unknown as { source: string }).source; setDrillSource(s === drillSource ? null : s); }}>
              {barData.map((d) => (
                <Cell key={d.source} fill={drillSource && drillSource !== d.source ? "#F1F3F5" : "#E2E8F0"} />
              ))}
            </Bar>
            <Bar dataKey="contacted" name="contacted" stackId="b" fill="#3B82F6" radius={[0,0,0,0]}
              onClick={(d) => { const s = (d as unknown as { source: string }).source; setDrillSource(s === drillSource ? null : s); }}>
              {barData.map((d) => (
                <Cell key={d.source} fill={drillSource && drillSource !== d.source ? "#BFDBFE" : "#3B82F6"} />
              ))}
            </Bar>
            <Bar dataKey="closed" name="closed" stackId="c" fill="#D4AF37" radius={[4, 4, 0, 0]}
              onClick={(d) => { const s = (d as unknown as { source: string }).source; setDrillSource(s === drillSource ? null : s); }}>
              {barData.map((d) => (
                <Cell key={d.source} fill={drillSource && drillSource !== d.source ? "#F5EDD3" : d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 justify-center">
          {[
            { label: "Leads",      color: "#E2E8F0" },
            { label: "Contacted",  color: "#3B82F6" },
            { label: "Closed",     color: "#D4AF37" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>

        {/* Conversion rate chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {sources.map((s) => {
            const rate = s.leads > 0 ? Math.round((s.closed / s.leads) * 100) : 0;
            return (
              <button
                key={s.source}
                onClick={() => setDrillSource(s.source === drillSource ? null : s.source)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all",
                  drillSource === s.source
                    ? "border-transparent text-white"
                    : "bg-white border-line text-gray-500 hover:border-gold/40"
                )}
                style={drillSource === s.source ? { background: s.color } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: drillSource === s.source ? "white" : s.color }} />
                {s.source} <span className="opacity-70">{rate}%</span>
              </button>
            );
          })}
        </div>

        {selected && <SourceDetail source={selected} />}
      </div>

      {/* Pipeline funnel */}
      <div className="bg-white rounded-2xl border border-line p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={15} className="text-gold" />
          <div>
            <p className="text-sm font-bold text-axen-dark">Conversion Funnel</p>
            <p className="text-xs text-gray-400">New leads → closed deals</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <FunnelChart>
            <Tooltip content={<FunnelTip />} />
            <Funnel dataKey="value" data={funnelData} isAnimationActive>
              <LabelList content={<FunnelLabel />} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-gray-400">Overall conversion</p>
          <p className="text-sm font-bold text-gold">
            {funnelTop > 0 ? Math.round(((funnel[funnel.length - 1]?.count ?? 0) / funnelTop) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
