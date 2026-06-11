"use client";

import { useState } from "react";
import {
  Plus, TrendingUp, DollarSign, Clock, Award,
  Calendar, Tag, ExternalLink,
} from "lucide-react";
import type { Transaction } from "@dravik/contracts/realty";
import { SAMPLE_TRANSACTIONS } from "../data/transactions";
import TransactionPipeline from "../components/transactions/TransactionPipeline";
import TransactionPanel from "../components/transactions/TransactionPanel";
import { STAGE_COLOR } from "../components/transactions/TransactionCard";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── KPI card (module level) ──────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, accent,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-line px-5 py-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-xl font-bold text-axen-dark leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Transaction table row (module level) ─────────────────────
function TxTableRow({ transaction: t, onSelect }: { transaction: Transaction; onSelect: (t: Transaction) => void }) {
  const color = STAGE_COLOR[t.stage];
  const gross = t.contractPrice * (t.commission.commissionRate / 100);
  const ref   = t.commission.hasReferral ? gross * (t.commission.referralRate / 100) : 0;
  const net   = (gross - ref) * (1 - t.commission.axenSplitRate / 100) - t.commission.transactionFee;

  return (
    <div
      className="flex items-center px-6 py-3.5 border-b border-line hover:bg-surface transition-colors group cursor-pointer"
      onClick={() => onSelect(t)}
    >
      <div className="flex-[4] flex items-center gap-3 min-w-0">
        <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.heroImage} alt={t.address} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-axen-dark truncate">{t.address}</p>
          <p className="text-[10px] text-gray-400">{t.client.name} · {t.city}</p>
        </div>
      </div>

      <div className="w-36 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span className="text-xs text-gray-500 truncate">{t.stage}</span>
      </div>

      <div className="w-28 text-right text-sm font-semibold text-axen-dark">
        {formatCurrency(t.contractPrice)}
      </div>

      <div className="w-24 text-right">
        <span className={cn(
          "text-xs font-semibold px-1.5 py-0.5 rounded-full",
          t.daysUntilClose <= 5  ? "text-rose-600 bg-rose-50" :
          t.daysUntilClose <= 14 ? "text-amber-600 bg-amber-50" :
          "text-gray-500 bg-surface-2"
        )}>
          {t.closingDate}
        </span>
      </div>

      <div className="w-24 text-right text-sm font-bold text-gold">
        {formatCurrency(Math.round(net))}
      </div>

      <div className="w-16 flex items-center gap-1 text-right flex-shrink-0 justify-end">
        {t.commission.hasReferral && <Tag size={11} className="text-gold" />}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(t); }}
          title="Open transaction details"
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gold transition-all"
        >
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────
type PageTab = "active" | "contract" | "closed" | "all";

const PAGE_TABS: { id: PageTab; label: string }[] = [
  { id: "active",   label: "Active Deals"       },
  { id: "contract", label: "Under Contract"      },
  { id: "closed",   label: "Closed"              },
  { id: "all",      label: "All Transactions"    },
];

// ─── Main page ────────────────────────────────────────────────
export default function TransactionsPage() {
  const [tab, setTab]                 = useState<PageTab>("active");
  const [selectedTx, setSelectedTx]   = useState<Transaction | null>(null);

  // KPI computations
  const active       = SAMPLE_TRANSACTIONS.filter((t) => t.status === "Active");
  const closingMonth = active.filter((t) => t.daysUntilClose <= 31).length;
  const totalVolume  = active.reduce((s, t) => s + t.contractPrice, 0);
  const avgDays      = active.length > 0
    ? Math.round(active.reduce((s, t) => s + t.daysUntilClose, 0) / active.length)
    : 0;
  const commPipeline = active.reduce((s, t) => {
    const gross = t.contractPrice * (t.commission.commissionRate / 100);
    const ref   = t.commission.hasReferral ? gross * (t.commission.referralRate / 100) : 0;
    return s + (gross - ref) * (1 - t.commission.axenSplitRate / 100) - t.commission.transactionFee;
  }, 0);

  // Tab data
  const contractOnly = SAMPLE_TRANSACTIONS.filter((t) => t.stage === "Under Contract");
  const closed       = SAMPLE_TRANSACTIONS.filter((t) => t.status === "Closed");
  const all          = SAMPLE_TRANSACTIONS;

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-line px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-axen-dark">Transactions</h1>
              <p className="text-xs text-gray-400 mt-0.5">Deals from under contract through closing</p>
            </div>
            <button
              disabled
              title="Transaction creation coming soon"
              className="flex items-center gap-2 px-4 py-2.5 bg-gold text-axen-dark font-bold text-sm rounded-xl opacity-50 cursor-not-allowed"
            >
              <Plus size={15} /> New Transaction
            </button>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <KpiCard icon={Calendar}  label="Pending Closings This Month" value={String(closingMonth)}           accent="#D4AF37" sub="Active deals" />
            <KpiCard icon={DollarSign} label="Total Volume"              value={`$${(totalVolume / 1_000_000).toFixed(1)}M`} accent="#10B981" sub="Active pipeline" />
            <KpiCard icon={Clock}     label="Avg Days to Close"          value={`${avgDays}d`}                  accent="#3B82F6" sub="Active deals" />
            <KpiCard icon={Award}     label="Commission Pipeline"        value={`$${(commPipeline / 1_000).toFixed(0)}K`}    accent="#EF4444" sub="Agent net (est.)" />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4 pb-0">
            {PAGE_TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold border-b-2 transition-colors",
                  tab === id
                    ? "border-gold text-axen-dark"
                    : "border-transparent text-gray-400 hover:text-axen-dark"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ──────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {tab === "active" && (
            <TransactionPipeline
              transactions={active}
              selectedId={selectedTx?.id ?? null}
              onSelect={(t) => setSelectedTx(t)}
            />
          )}

          {(tab === "contract" || tab === "closed" || tab === "all") && (() => {
            const rows = tab === "contract" ? contractOnly : tab === "closed" ? closed : all;
            return (
              <div className="flex-1 overflow-y-auto">
                {/* Table header */}
                <div className="sticky top-0 z-10 flex items-center px-6 py-2 bg-surface-2 border-b border-line text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  <div className="flex-[4]">Transaction</div>
                  <div className="w-36">Stage</div>
                  <div className="w-28 text-right">Price</div>
                  <div className="w-24 text-right">Closing</div>
                  <div className="w-24 text-right flex items-center gap-1 justify-end">
                    <TrendingUp size={10} /> Net
                  </div>
                  <div className="w-16" />
                </div>
                {rows.length > 0
                  ? rows.map((t) => (
                      <TxTableRow key={t.id} transaction={t} onSelect={setSelectedTx} />
                    ))
                  : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                      <p className="text-sm font-semibold text-gray-400">No transactions found</p>
                      <p className="text-xs text-gray-300">
                        {tab === "closed" ? "No closed deals yet." : "Nothing matching this filter."}
                      </p>
                    </div>
                  )
                }
              </div>
            );
          })()}
        </div>
      </div>

      <TransactionPanel
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </>
  );
}
