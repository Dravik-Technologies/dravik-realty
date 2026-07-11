"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Users, Globe, Receipt, Landmark, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SAMPLE_LEADS } from "@dravik/crm";
import { AGENTS } from "@dravik/referrals";
import { SAMPLE_TRANSACTIONS } from "@dravik/realty";
import { MORTGAGE_APPS } from "@dravik/lending";
import { cn } from "@dravik/shared";

type ResultCat = "Lead" | "Agent" | "Transaction" | "Mortgage";

interface SearchResult {
  id:       string;
  title:    string;
  subtitle: string;
  href:     string;
  cat:      ResultCat;
}

const CAT_CFG: Record<ResultCat, { icon: React.ElementType; iconCls: string; bgCls: string }> = {
  Lead:        { icon: Users,    iconCls: "text-blue-600",    bgCls: "bg-blue-50"    },
  Agent:       { icon: Globe,    iconCls: "text-gold-dark",   bgCls: "bg-gold-light" },
  Transaction: { icon: Receipt,  iconCls: "text-emerald-600", bgCls: "bg-emerald-50" },
  Mortgage:    { icon: Landmark, iconCls: "text-amber-600",   bgCls: "bg-amber-50"   },
};

// Build at module level — never during render
const SEARCH_INDEX: SearchResult[] = [
  ...SAMPLE_LEADS.map(l => ({
    id:       `l-${l.id}`,
    title:    l.name,
    subtitle: `${l.clientType} · ${l.status} · ${l.source}`,
    href:     "/crm/leads",
    cat:      "Lead" as ResultCat,
  })),
  ...AGENTS.map(a => ({
    id:       `a-${a.id}`,
    title:    a.name,
    subtitle: `${a.certification} · ${a.location.city}, ${a.location.state}`,
    href:     "/referrals",
    cat:      "Agent" as ResultCat,
  })),
  ...SAMPLE_TRANSACTIONS.map(t => ({
    id:       `t-${t.id}`,
    title:    `${t.address}${t.city ? `, ${t.city}` : ""}`,
    subtitle: `${t.client.name} · ${t.stage}`,
    href:     "/realty/transactions",
    cat:      "Transaction" as ResultCat,
  })),
  ...MORTGAGE_APPS.filter(a => a.stage !== "declined").map(a => ({
    id:       `m-${a.id}`,
    title:    a.clientName,
    subtitle: `${a.loanType} · ${a.stage} · ${a.propertyAddress}`,
    href:     "/lending",
    cat:      "Mortgage" as ResultCat,
  })),
];

const RECENT = SEARCH_INDEX.slice(0, 6);

function runSearch(q: string): SearchResult[] {
  if (!q.trim()) return [];
  const lower = q.toLowerCase();
  return SEARCH_INDEX.filter(r =>
    r.title.toLowerCase().includes(lower) || r.subtitle.toLowerCase().includes(lower)
  ).slice(0, 9);
}

// ─── ResultRow ────────────────────────────────────────────────
function ResultRow({ result, active, onSelect, onHover }: {
  result:   SearchResult;
  active:   boolean;
  onSelect: () => void;
  onHover:  () => void;
}) {
  const cfg  = CAT_CFG[result.cat];
  const Icon = cfg.icon;
  return (
    <Link
      href={result.href}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        "flex items-center gap-4 px-5 py-3 transition-colors",
        active ? "bg-gold-light" : "hover:bg-surface"
      )}
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", cfg.bgCls)}>
        <Icon size={15} className={cfg.iconCls} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-dravik-dark truncate">{result.title}</p>
        <p className="text-[11px] text-gray-400 truncate">{result.subtitle}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-semibold text-gray-400 bg-surface-2 px-2 py-0.5 rounded-full border border-line">
          {result.cat}
        </span>
        {active && <ArrowRight size={12} className="text-gray-400" />}
      </div>
    </Link>
  );
}

// ─── GlobalSearch ─────────────────────────────────────────────
export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query,  setQuery]  = useState("");
  const [cursor, setCursor] = useState(-1);
  const inputRef       = useRef<HTMLInputElement>(null);
  const panelRef       = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const results  = runSearch(query);
  const items    = query.trim() ? results : RECENT;
  const isRecent = !query.trim();

  const handleClose = useCallback(() => { setQuery(""); onClose(); }, [onClose]);

  // Save return-focus target, reset query/cursor, focus input, restore on close
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement;
    const id = requestAnimationFrame(() => {
      setQuery("");
      setCursor(-1);
      inputRef.current?.focus();
    });
    return () => {
      cancelAnimationFrame(id);
      returnFocusRef.current?.focus();
    };
  }, [open]);

  // Escape, arrow nav, Enter, Tab trap
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c + 1, items.length - 1)); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setCursor(c => Math.max(c - 1, -1));               return; }
      if (e.key === "Enter" && cursor >= 0) {
        e.preventDefault();
        const target = items[cursor];
        if (target) { window.location.href = target.href; handleClose(); }
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), [href], input, [tabindex]:not([tabindex='-1'])"
        ));
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, cursor, items, handleClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 animate-fade-in">
      <div className="absolute inset-0 bg-dravik-dark/60 backdrop-blur-sm" onClick={handleClose} aria-hidden />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-line overflow-hidden animate-slide-up"
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(-1); }}
            placeholder="Search leads, agents, transactions, mortgage..."
            className="flex-1 text-sm text-dravik-dark placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-line text-[10px] text-gray-400 font-mono bg-surface-2">
              ESC
            </kbd>
            <button
              onClick={handleClose}
              aria-label="Close search"
              className="p-1 rounded-lg text-gray-400 hover:text-dravik-dark hover:bg-surface-2 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[420px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-5 pt-4 pb-1">
            {isRecent ? "Recent" : `Results · ${results.length}`}
          </p>

          {items.map((result, i) => (
            <ResultRow
              key={result.id}
              result={result}
              active={cursor === i}
              onSelect={handleClose}
              onHover={() => setCursor(i)}
            />
          ))}

          {!isRecent && results.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-gray-400">
                No results for <strong className="text-dravik-dark">&ldquo;{query}&rdquo;</strong>
              </p>
              <p className="text-xs text-gray-300 mt-1">Try a name, address, or phone number</p>
            </div>
          )}
        </div>

        {/* Keyboard hints */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-line bg-surface-2">
          {(["↑↓|Navigate", "↵|Open", "ESC|Close"] as const).map(pair => {
            const [k, l] = pair.split("|");
            return (
              <div key={k} className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded border border-line text-[10px] font-mono bg-white text-gray-500">{k}</kbd>
                <span className="text-[10px] text-gray-400">{l}</span>
              </div>
            );
          })}
          <span className="ml-auto text-[10px] text-gray-300">Dravik Realty Search</span>
        </div>
      </div>
    </div>
  );
}
