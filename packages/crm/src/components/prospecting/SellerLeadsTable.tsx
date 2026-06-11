"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Eye, EyeOff,
  CheckCircle2, SlidersHorizontal, X, Phone, ExternalLink,
  PhoneCall, Megaphone,
} from "lucide-react";
import { SELLER_LEADS } from "../../data/prospecting";
import type {
  SellerLead, LeadType, SortKey, SortDir,
} from "@dravik/contracts/crm";
import { formatCurrency, cn } from "@dravik/shared";

// ─── Config maps ──────────────────────────────────────────────
type LeadStatus = SellerLead["status"];

const LEAD_TYPE_CFG: Record<LeadType, { cls: string; dot: string }> = {
  "Expired":         { cls: "bg-rose-50 text-rose-700 border-rose-200",       dot: "bg-rose-400"   },
  "FSBO":            { cls: "bg-orange-50 text-orange-700 border-orange-200",  dot: "bg-orange-400" },
  "FRBO":            { cls: "bg-violet-50 text-violet-700 border-violet-200",  dot: "bg-violet-400" },
  "Pre-Foreclosure": { cls: "bg-red-50 text-red-800 border-red-200",           dot: "bg-red-500"    },
  "Absentee":        { cls: "bg-blue-50 text-blue-700 border-blue-200",        dot: "bg-blue-400"   },
  "High Equity":     { cls: "bg-gold-light text-gold-dark border-gold/30",     dot: "bg-gold"       },
};

const STATUS_CFG: Record<LeadStatus, string> = {
  "New":             "bg-surface-2 text-gray-500",
  "Contacted":       "bg-blue-50 text-blue-600",
  "Appointment Set": "bg-emerald-50 text-emerald-700",
  "Not Interested":  "bg-rose-50 text-rose-500",
  "Follow Up":       "bg-amber-50 text-amber-700",
};

const LEAD_TYPES: LeadType[] = ["Expired", "FSBO", "FRBO", "Pre-Foreclosure", "Absentee", "High Equity"];
const STATUSES: Array<LeadStatus | "All"> = ["All", "New", "Contacted", "Follow Up", "Appointment Set", "Not Interested"];

// ─── Sub-components (module level) ───────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown size={11} className="text-gray-300 ml-1" />;
  return dir === "asc"
    ? <ChevronUp   size={11} className="text-gold ml-1" />
    : <ChevronDown size={11} className="text-gold ml-1" />;
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 70) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold text-axen-dark whitespace-nowrap">
      🔥 {score}
    </span>
  );
  if (score >= 50) return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
      {score}
    </span>
  );
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-2 text-gray-400">
      {score}
    </span>
  );
}

function maskOwnerName(name: string) {
  return name
    .split(" ")
    .map((part) => {
      if (part.length <= 1) return part;
      return `${part[0]}${"•".repeat(Math.min(5, Math.max(1, part.length - 1)))}`;
    })
    .join(" ");
}

function EquityBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-line rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-axen-dark tabular-nums">{pct}%</span>
    </div>
  );
}

function Toast({ msg, show }: { msg: string; show: boolean }) {
  return (
    <div aria-live="polite" className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3",
      "bg-axen-dark text-white text-sm font-semibold rounded-2xl shadow-2xl border border-white/10",
      "transition-all duration-300",
      show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
    )}>
      <CheckCircle2 size={15} className="text-gold flex-shrink-0" />
      {msg}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────
interface Props {
  farmFilter:      Set<string> | null;
  dialQueue:       string[];
  onToggleQueue:   (id: string) => void;
  onConvert:       (lead: SellerLead) => void;
  onStartDialing:  () => void;
  onOpenCampaigns: () => void;
}

// ─── SellerLeadsTable ─────────────────────────────────────────
export default function SellerLeadsTable({
  farmFilter, dialQueue, onToggleQueue, onConvert, onStartDialing, onOpenCampaigns,
}: Props) {
  const [sortKey,      setSortKey]      = useState<SortKey>("motivationScore");
  const [sortDir,      setSortDir]      = useState<SortDir>("desc");
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [revealed,     setRevealed]     = useState<Set<string>>(new Set());
  const [convertedIds, setConvertedIds] = useState<Set<string>>(new Set());
  const [typeFilters,  setTypeFilters]  = useState<Set<LeadType>>(new Set());
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [minEquity,    setMinEquity]    = useState(0);
  const [minScore,     setMinScore]     = useState(0);
  const [showFilters,  setShowFilters]  = useState(false);
  const [toast,        setToast]        = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // ── Base pool (farm filter applied) ─────────────────────────
  const baseLeads = farmFilter
    ? SELLER_LEADS.filter(l => farmFilter.has(l.id))
    : SELLER_LEADS;

  const filteredLeads = useMemo(() => {
    return baseLeads
      .filter(l => typeFilters.size === 0 || typeFilters.has(l.leadType))
      .filter(l => statusFilter === "All" || l.status === statusFilter)
      .filter(l => l.estimatedEquity >= minEquity)
      .filter(l => l.motivationScore >= minScore)
      .sort((a, b) => {
        const m = sortDir === "asc" ? 1 : -1;
        switch (sortKey) {
          case "address":         return m * a.address.localeCompare(b.address);
          case "leadType":        return m * a.leadType.localeCompare(b.leadType);
          case "daysSinceEvent":  return m * (a.daysSinceEvent - b.daysSinceEvent);
          case "estimatedEquity": return m * (a.estimatedEquity - b.estimatedEquity);
          case "motivationScore": return m * (a.motivationScore - b.motivationScore);
          case "status":          return m * a.status.localeCompare(b.status);
          default: return 0;
        }
      });
  }, [baseLeads, typeFilters, statusFilter, minEquity, minScore, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(prev =>
      prev.size === filteredLeads.length
        ? new Set()
        : new Set(filteredLeads.map(l => l.id))
    );
  }

  function togglePhone(id: string) {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleType(t: LeadType) {
    setTypeFilters(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  const handleConvert = useCallback((lead: SellerLead) => {
    setConvertedIds(prev => new Set([...prev, lead.id]));
    onConvert(lead);
    showToast(`${lead.ownerName} added to Lead Engine`);
  }, [onConvert]);

  function handleBulkConvert() {
    const toConvert = filteredLeads.filter((lead) => selectedIds.has(lead.id));
    if (!toConvert.length) return;

    toConvert.forEach((lead) => onConvert(lead));
    setConvertedIds((prev) => {
      const next = new Set(prev);
      toConvert.forEach((lead) => next.add(lead.id));
      return next;
    });

    showToast(`${toConvert.length} leads added to Lead Engine`);
    setSelectedIds(new Set());
  }

  function handleBulkQueue() {
    selectedIds.forEach(id => {
      if (!dialQueue.includes(id)) onToggleQueue(id);
    });
    showToast(`${selectedIds.size} leads added to dial queue`);
    setSelectedIds(new Set());
  }

  const hasFilters = typeFilters.size > 0 || statusFilter !== "All" || minEquity > 0 || minScore > 0;

  function clearFilters() {
    setTypeFilters(new Set());
    setStatusFilter("All");
    setMinEquity(0);
    setMinScore(0);
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Filter bar ──────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-line px-5 py-3 space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          {farmFilter && (
            <div className="flex items-center gap-2 bg-gold-light border border-gold/30 rounded-xl px-3 py-1.5 text-xs font-semibold text-gold-dark">
              Farm filter active · {baseLeads.length} leads
            </div>
          )}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors",
              showFilters
                ? "bg-axen-dark text-white border-axen-dark"
                : "bg-white text-gray-600 border-line hover:bg-surface"
            )}
          >
            <SlidersHorizontal size={13} />
            Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-gold" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="px-3 py-2 text-xs font-semibold text-gold hover:text-gold-dark border border-gold/40 rounded-xl hover:bg-gold-light transition-colors">
              Clear
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400 font-medium">
            {filteredLeads.length} of {SELLER_LEADS.length} leads
          </span>
        </div>

        {showFilters && (
          <div className="space-y-3 pt-1 animate-fade-in">
            {/* Type chips */}
            <div className="flex flex-wrap gap-2">
              {LEAD_TYPES.map(t => {
                const cfg = LEAD_TYPE_CFG[t];
                const active = typeFilters.has(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={cn(
                      "flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all",
                      active ? cfg.cls + " ring-2 ring-offset-1 ring-gold/40" : "bg-surface-2 text-gray-500 border-line hover:border-gray-400"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", active ? cfg.dot : "bg-gray-300")} />
                    {t}
                  </button>
                );
              })}
            </div>
            {/* Status + sliders */}
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as LeadStatus | "All")}
                aria-label="Status filter"
                className="text-xs border border-line rounded-xl px-3 py-2 text-axen-dark bg-white focus:outline-none focus:border-gold transition"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
              </select>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                Min Equity
                <input type="range" min={0} max={95} step={5} value={minEquity}
                  onChange={e => setMinEquity(Number(e.target.value))}
                  className="w-24 accent-yellow-500"
                />
                <span className="font-bold text-axen-dark w-8">{minEquity}%</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-500">
                Min Score
                <input type="range" min={0} max={90} step={10} value={minScore}
                  onChange={e => setMinScore(Number(e.target.value))}
                  className="w-24 accent-yellow-500"
                />
                <span className="font-bold text-axen-dark w-8">{minScore}</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ── Bulk action bar ──────────────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex-shrink-0 bg-axen-dark text-white px-5 py-2.5 flex items-center gap-3 animate-fade-in">
          <span className="text-xs font-bold text-gold">{selectedIds.size} selected</span>
          <button onClick={handleBulkConvert}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-axen-dark text-xs font-bold rounded-lg hover:bg-gold-dark transition-colors">
            <CheckCircle2 size={12} /> Add to Leads
          </button>
          <button onClick={handleBulkQueue}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gold text-axen-dark text-xs font-bold rounded-lg hover:bg-gold-dark transition-colors">
            <Phone size={12} /> Queue Calls
          </button>
          <button onClick={() => { handleBulkQueue(); onStartDialing(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors">
            <PhoneCall size={12} /> Start Dialing Session
          </button>
          <button onClick={onOpenCampaigns}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-colors">
            <Megaphone size={12} /> Create Campaign
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-gray-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
            <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
              <SlidersHorizontal size={20} className="text-gray-300" />
            </div>
            <p className="font-semibold text-axen-dark">No leads match your filters</p>
            <button onClick={clearFilters} className="text-sm text-gold font-semibold hover:text-gold-dark">
              Clear filters
            </button>
          </div>
        ) : (
          <table className="w-full text-sm min-w-[1050px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-surface-2 border-b border-line">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox"
                    checked={selectedIds.size === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleAll}
                    aria-label="Select all"
                    className="rounded border-line accent-yellow-500"
                  />
                </th>
                {(["address", "leadType", "daysSinceEvent", "estimatedEquity", "motivationScore", "status"] as SortKey[]).map((key, i) => {
                  const labels: Record<SortKey, string> = {
                    address: "Address", leadType: "Type", daysSinceEvent: "Days",
                    estimatedEquity: "Equity", motivationScore: "AI Score", status: "Status",
                  };
                  return (
                    <th
                      key={key}
                      className={cn(
                        "text-left py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider",
                        i === 0 ? "px-4 min-w-[180px]" : "px-3"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        className="flex items-center hover:text-axen-dark select-none transition-colors"
                      >
                        {labels[key]}
                        <SortIcon active={sortKey === key} dir={sortDir} />
                      </button>
                    </th>
                  );
                })}
                <th className="px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left hidden lg:table-cell">
                  Price
                </th>
                <th className="px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left hidden md:table-cell">
                  Owner
                </th>
                <th className="px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-left">
                  Phone
                </th>
                <th className="px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => {
                const typeCfg   = LEAD_TYPE_CFG[lead.leadType];
                const isSelected = selectedIds.has(lead.id);
                const inQueue    = dialQueue.includes(lead.id);
                const converted  = convertedIds.has(lead.id);
                const revealedDetails = revealed.has(lead.id) || inQueue || converted;
                const detailActioned = inQueue || converted;
                return (
                  <tr key={lead.id}
                    className={cn(
                      "border-b border-line transition-colors",
                      isSelected ? "bg-gold-light/40" : "hover:bg-surface/60",
                      converted && "opacity-60"
                    )}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(lead.id)}
                        aria-label={`Select ${lead.ownerName}`}
                        className="rounded border-line accent-yellow-500"
                      />
                    </td>

                    {/* Address */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-axen-dark leading-tight">{lead.address}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{lead.city}, {lead.state} {lead.zip}</p>
                    </td>

                    {/* Lead Type */}
                    <td className="px-3 py-3">
                      <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border", typeCfg.cls)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", typeCfg.dot)} />
                        {lead.leadType}
                      </span>
                    </td>

                    {/* Days */}
                    <td className="px-3 py-3">
                      <span className={cn("text-xs font-bold tabular-nums", lead.daysSinceEvent <= 3 ? "text-rose-600" : "text-axen-dark")}>
                        {lead.daysSinceEvent}d
                      </span>
                    </td>

                    {/* Equity */}
                    <td className="px-3 py-3"><EquityBar pct={lead.estimatedEquity} /></td>

                    {/* AI Score */}
                    <td className="px-3 py-3"><ScoreBadge score={lead.motivationScore} /></td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", STATUS_CFG[lead.status])}>
                        {lead.status}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <p className="text-xs font-semibold text-axen-dark">
                        {formatCurrency(lead.listPrice ?? lead.estimatedValue)}
                      </p>
                      {lead.listPrice && (
                        <p className="text-[10px] text-gray-400">Est. {formatCurrency(lead.estimatedValue)}</p>
                      )}
                    </td>

                    {/* Owner */}
                    <td className="px-3 py-3 hidden md:table-cell">
                      <p className="text-xs text-axen-dark truncate max-w-[130px]">
                        {revealedDetails ? lead.ownerName : maskOwnerName(lead.ownerName)}
                      </p>
                      {!revealedDetails && (
                        <p className="text-[10px] text-gray-300 mt-0.5">Masked until actioned</p>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-axen-dark">
                          {revealedDetails ? lead.phone : "•••-•••-••••"}
                        </span>
                        <button onClick={() => togglePhone(lead.id)}
                          disabled={detailActioned}
                          title={detailActioned ? "Details stay visible after actioning" : revealedDetails ? "Hide protected details" : "Reveal protected details"}
                          aria-label={revealedDetails ? "Hide protected details" : "Reveal protected details"}
                          className={cn(
                            "transition-colors",
                            detailActioned ? "text-gray-300 cursor-default" : "text-gray-400 hover:text-gold"
                          )}>
                          {revealedDetails ? <EyeOff size={11} /> : <Eye size={11} />}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onToggleQueue(lead.id)}
                          title={inQueue ? "Remove from queue" : "Add to dial queue"}
                          className={cn(
                            "p-1.5 rounded-lg border text-[10px] font-bold transition-colors",
                            inQueue
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-surface-2 text-gray-500 border-line hover:border-gold hover:text-gold"
                          )}
                        >
                          <Phone size={11} />
                        </button>
                        <button
                          onClick={() => !converted && handleConvert(lead)}
                          disabled={converted}
                          title={converted ? "Already converted" : "Convert to Lead Engine"}
                          className={cn(
                            "px-2 py-1 rounded-lg border text-[10px] font-bold transition-colors",
                            converted
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default"
                              : "bg-gold text-axen-dark border-gold hover:bg-gold-dark"
                          )}
                        >
                          {converted ? "✓" : "Convert"}
                        </button>
                        <Link href="/leads" title="Open Lead Engine"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gold border border-line hover:border-gold transition-colors">
                          <ExternalLink size={11} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Toast msg={toast ?? ""} show={toast !== null} />
    </div>
  );
}
