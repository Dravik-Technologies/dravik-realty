"use client";

import {
  ChevronUp, ChevronDown, Eye, ArrowUpDown,
} from "lucide-react";
import type { Agent, SortField, LicenseType, AgentStatus } from "@/types/team";
import { cn, timeAgo } from "@dravik/shared";

// ─── Badge helpers (module level) ────────────────────────────
const LICENSE_STYLE: Record<LicenseType, string> = {
  RE:       "bg-amber-50  text-amber-700  border-amber-200",
  Mortgage: "bg-blue-50   text-blue-700   border-blue-200",
  Dual:     "bg-violet-50 text-violet-700 border-violet-200",
};

const STATUS_STYLE: Record<AgentStatus, string> = {
  Active:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive:   "bg-gray-100   text-gray-500    border-gray-200",
  Onboarding: "bg-blue-50    text-blue-600    border-blue-200",
  Suspended:  "bg-rose-50    text-rose-600    border-rose-200",
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-600 bg-emerald-50" :
                score >= 60 ? "text-amber-600 bg-amber-50"    :
                score >   0 ? "text-rose-600  bg-rose-50"     :
                              "text-gray-400  bg-gray-100";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : score > 0 ? "#EF4444" : "#D1D5DB",
          }}
        />
      </div>
      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[28px] text-center", color)}>
        {score || "—"}
      </span>
    </div>
  );
}

// ─── Sort header cell ─────────────────────────────────────────
function SortTh({
  field, label, current, dir, onSort, className,
}: {
  field:   SortField;
  label:   string;
  current: SortField;
  dir:     "asc" | "desc";
  onSort:  (f: SortField) => void;
  className?: string;
}) {
  const active = current === field;
  return (
    <th
      tabIndex={0}
      className={cn(
        "px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-axen-dark transition-colors",
        className
      )}
      onClick={() => onSort(field)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort(field);
        }
      }}
    >
      <div className="flex items-center gap-1">
        {label}
        {active ? (
          dir === "asc" ? <ChevronUp size={11} className="text-gold" /> : <ChevronDown size={11} className="text-gold" />
        ) : (
          <ArrowUpDown size={10} className="text-gray-300" />
        )}
      </div>
    </th>
  );
}

// ─── Table row (module level) ─────────────────────────────────
function AgentRow({
  agent: a, onSelect,
}: {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}) {
  return (
    <tr
      className="border-b border-line hover:bg-surface transition-colors cursor-pointer group"
      onClick={() => onSelect(a)}
    >
      {/* Agent identity */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: a.color }}
          >
            {a.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-axen-dark truncate">{a.name}</p>
            <p className="text-[10px] text-gray-400">{a.role}</p>
          </div>
        </div>
      </td>

      {/* License */}
      <td className="px-4 py-3">
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", LICENSE_STYLE[a.licenseType])}>
          {a.licenseType}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", STATUS_STYLE[a.status])}>
          {a.status}
        </span>
      </td>

      {/* YTD Volume */}
      <td className="px-4 py-3 text-sm font-semibold text-axen-dark">
        {a.ytdVolume > 0 ? `$${(a.ytdVolume / 1_000_000).toFixed(1)}M` : <span className="text-gray-300">—</span>}
      </td>

      {/* Units */}
      <td className="px-4 py-3 text-sm font-semibold text-axen-dark text-center">
        {a.closedUnits > 0 ? a.closedUnits : <span className="text-gray-300">—</span>}
      </td>

      {/* Referral score */}
      <td className="px-4 py-3">
        <ScoreBadge score={a.referralScore} />
      </td>

      {/* Last activity */}
      <td className="px-4 py-3 text-xs text-gray-400" suppressHydrationWarning>
        {timeAgo(a.lastActivity)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(a); }}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-surface-2 text-gray-500 hover:bg-gold-light hover:text-gold transition-colors opacity-0 group-hover:opacity-100"
        >
          <Eye size={12} /> View
        </button>
      </td>
    </tr>
  );
}

// ─── AgentDirectory ───────────────────────────────────────────
interface Props {
  agents:    Agent[];
  onSelect:  (agent: Agent) => void;
  sortField: SortField;
  sortDir:   "asc" | "desc";
  onSort:    (field: SortField) => void;
}

export default function AgentDirectory({ agents, onSelect, sortField, sortDir, onSort }: Props) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
          <ArrowUpDown size={20} className="text-gray-300" />
        </div>
        <p className="font-semibold text-axen-dark">No agents match your filter</p>
        <p className="text-sm text-gray-400">Try a different filter or search term</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-line overflow-hidden">
      <table className="w-full">
        <thead className="bg-surface-2 border-b border-line">
          <tr>
            <SortTh field="name"          label="Agent"        current={sortField} dir={sortDir} onSort={onSort} />
            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">License</th>
            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <SortTh field="ytdVolume"     label="YTD Volume"   current={sortField} dir={sortDir} onSort={onSort} />
            <SortTh field="closedUnits"   label="Units"        current={sortField} dir={sortDir} onSort={onSort} className="text-center" />
            <SortTh field="referralScore" label="Ref. Score"   current={sortField} dir={sortDir} onSort={onSort} />
            <SortTh field="lastActivity"  label="Last Active"  current={sortField} dir={sortDir} onSort={onSort} />
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => (
            <AgentRow key={a.id} agent={a} onSelect={onSelect} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
