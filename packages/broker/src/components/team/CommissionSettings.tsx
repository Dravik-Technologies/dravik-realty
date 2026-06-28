"use client";

import { DollarSign, Info, TrendingUp } from "lucide-react";
import type { Agent } from "@/types/team";
import { cn, formatCurrency } from "@dravik/shared";

// ─── Split ring visual ────────────────────────────────────────
function SplitRing({ agent }: { agent: number }) {
  const radius = 36;
  const circ   = 2 * Math.PI * radius;
  const agentArc = (agent / 100) * circ;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#F1F3F5" strokeWidth="10" />
        <circle
          cx="48" cy="48" r={radius} fill="none"
          stroke="#D4AF37" strokeWidth="10"
          strokeDasharray={`${agentArc} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-lg font-bold text-axen-dark leading-none">{agent}%</p>
        <p className="text-[9px] text-gray-400">agent</p>
      </div>
    </div>
  );
}

// ─── CommissionSettings ───────────────────────────────────────
export default function CommissionSettings({ agent: a }: { agent: Agent }) {
  const agentShare = a.ytdGci * (a.splitPercent / 100);
  const axenShare  = a.ytdGci * (a.axenCutPercent / 100);

  return (
    <div className="space-y-5 p-5">
      {/* Split overview */}
      <div className="bg-surface rounded-2xl border border-line p-5">
        <p className="text-sm font-bold text-axen-dark mb-4">Current Commission Split</p>
        <div className="flex items-center gap-6">
          <SplitRing agent={a.splitPercent} />
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-axen-dark">{a.name}</span>
                <span className="text-sm font-bold text-gold">{a.splitPercent}%</span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: `${a.splitPercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-axen-dark">Axen Realty</span>
                <span className="text-sm font-bold text-gray-500">{a.axenCutPercent}%</span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-axen-dark rounded-full opacity-30" style={{ width: `${a.axenCutPercent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* YTD earnings breakdown */}
      {a.ytdGci > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gold-light rounded-2xl border border-gold/20 p-4 text-center">
            <TrendingUp size={16} className="text-gold mx-auto mb-1" />
            <p className="text-xl font-bold text-gold">{formatCurrency(agentShare)}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Agent Earnings YTD</p>
          </div>
          <div className="bg-surface rounded-2xl border border-line p-4 text-center">
            <DollarSign size={16} className="text-gray-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-axen-dark">{formatCurrency(axenShare)}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Brokerage Cut YTD</p>
          </div>
        </div>
      )}

      {/* Custom rules */}
      <div>
        <p className="text-sm font-bold text-axen-dark mb-3">Custom Commission Rules</p>
        <div className="space-y-2">
          {a.customRules.map((rule) => (
            <div key={rule.id} className="bg-white rounded-xl border border-line p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-axen-dark">{rule.name}</p>
                <span className="text-xs font-bold text-gold">{rule.agentSplit}%</span>
              </div>
              <p className="text-[10px] text-gray-500 font-medium">{rule.condition}</p>
              {rule.notes && (
                <p className="text-[10px] text-gray-400 mt-1 flex items-start gap-1">
                  <Info size={10} className="flex-shrink-0 mt-0.5" />
                  {rule.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Adjust CTA */}
      <button
        disabled
        title="Commission adjustment coming soon"
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl",
          "bg-gold text-axen-dark opacity-50 cursor-not-allowed"
        )}
      >
        <DollarSign size={14} /> Adjust Commission Structure
      </button>
    </div>
  );
}
