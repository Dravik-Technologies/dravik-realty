"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  TrendingUp, DollarSign, Clock, Award,
  Calendar, Tag, ExternalLink, Plus, Edit3, Trash2, Loader2, X,
} from "lucide-react";
import type { PipelineStage, Transaction, TransactionStatus, TransactionType } from "@dravik/contracts/realty";
import { PIPELINE_STAGES, STAGE_PROGRESS } from "@dravik/contracts/realty";
import { SAMPLE_TRANSACTIONS } from "../data/transactions";
import TransactionPipeline from "../components/transactions/TransactionPipeline";
import TransactionPanel from "../components/transactions/TransactionPanel";
import { STAGE_COLOR } from "../components/transactions/TransactionCard";
import {
  archiveOperationalRecord,
  cn,
  createOperationalRecord,
  fetchOperationalRecords,
  formatCurrency,
  updateOperationalRecord,
} from "@dravik/shared";

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
        <p className="text-xl font-bold text-dravik-dark leading-none">{value}</p>
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
  const net   = (gross - ref) * (1 - t.commission.dravikSplitRate / 100) - t.commission.transactionFee;

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
          <p className="text-sm font-semibold text-dravik-dark truncate">{t.address}</p>
          <p className="text-[10px] text-gray-400">{t.client.name} · {t.city}</p>
        </div>
      </div>

      <div className="w-36 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        <span className="text-xs text-gray-500 truncate">{t.stage}</span>
      </div>

      <div className="w-28 text-right text-sm font-semibold text-dravik-dark">
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

type TransactionFormState = {
  address: string;
  city: string;
  state: string;
  zip: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientRole: "Buyer" | "Seller" | "Dual";
  contractPrice: string;
  listPrice: string;
  stage: PipelineStage;
  status: TransactionStatus;
  type: TransactionType;
  closingDate: string;
  agent: string;
  mlsNumber: string;
};

const EMPTY_TRANSACTION_FORM: TransactionFormState = {
  address: "",
  city: "",
  state: "FL",
  zip: "",
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  clientRole: "Buyer",
  contractPrice: "",
  listPrice: "",
  stage: "Under Contract",
  status: "Active",
  type: "Buy",
  closingDate: "",
  agent: "Chris Macabugao",
  mlsNumber: "",
};

function createTempId(prefix: string) {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}`;
}

function parseNumber(value: string, fallback: number) {
  const parsed = Number(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function daysUntil(date: string) {
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 30;
  const diff = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

function transactionToForm(transaction: Transaction): TransactionFormState {
  return {
    address: transaction.address,
    city: transaction.city,
    state: transaction.state,
    zip: transaction.zip,
    clientName: transaction.client.name,
    clientEmail: transaction.client.email,
    clientPhone: transaction.client.phone,
    clientRole: transaction.client.role,
    contractPrice: String(transaction.contractPrice),
    listPrice: String(transaction.listPrice),
    stage: transaction.stage,
    status: transaction.status,
    type: transaction.type,
    closingDate: transaction.closingDate,
    agent: transaction.agent,
    mlsNumber: transaction.mlsNumber ?? "",
  };
}

function formToTransaction(form: TransactionFormState, existing?: Transaction): Transaction {
  const contractPrice = parseNumber(form.contractPrice, existing?.contractPrice ?? 500000);
  const listPrice = parseNumber(form.listPrice, contractPrice);
  const closingDate = form.closingDate || existing?.closingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const now = new Date().toISOString().slice(0, 10);

  return {
    id: existing?.id ?? createTempId("transaction"),
    address: form.address.trim() || "New transaction",
    city: form.city.trim() || "Miami",
    state: form.state.trim().toUpperCase() || "FL",
    zip: form.zip.trim(),
    heroImage: existing?.heroImage ?? "https://picsum.photos/seed/dravik-transaction/800/400",
    contractPrice,
    listPrice,
    stage: form.stage,
    status: form.status,
    type: form.type,
    contractDate: existing?.contractDate ?? now,
    closingDate,
    daysUntilClose: daysUntil(closingDate),
    progress: STAGE_PROGRESS[form.stage],
    client: {
      name: form.clientName.trim() || "New Client",
      email: form.clientEmail.trim(),
      phone: form.clientPhone.trim(),
      role: form.clientRole,
    },
    agent: form.agent.trim() || "Chris Macabugao",
    mlsNumber: form.mlsNumber.trim() || undefined,
    commission: existing?.commission ?? {
      commissionRate: 3,
      hasReferral: false,
      referralRate: 0,
      dravikSplitRate: 20,
      transactionFee: 395,
    },
    mortgage: existing?.mortgage,
    parties: existing?.parties ?? [
      {
        name: form.clientName.trim() || "New Client",
        role: form.clientRole,
        email: form.clientEmail.trim(),
        phone: form.clientPhone.trim(),
      },
    ],
    tasks: existing?.tasks ?? [],
    documents: existing?.documents ?? [],
    activity: existing?.activity ?? [
      {
        id: `activity-${createTempId("transaction")}`,
        date: now,
        actor: form.agent.trim() || "Dravik Realty",
        action: "Transaction created.",
      },
    ],
  };
}

function TransactionFormModal({
  open,
  mode,
  form,
  submitting,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  form: TransactionFormState;
  submitting: boolean;
  onChange: (patch: Partial<TransactionFormState>) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 animate-fade-in">
      <button aria-label="Close transaction form" className="absolute inset-0 bg-dravik-dark/60 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-form-title"
        className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-2xl animate-slide-up"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 id="transaction-form-title" className="text-base font-bold text-dravik-dark">{mode === "add" ? "Add Transaction" : "Edit Transaction"}</h2>
            <p className="mt-0.5 text-xs text-gray-400">Deal details, client, stage, closing date, and ownership.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-gray-400 hover:bg-surface-2 hover:text-dravik-dark">
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-gray-500">Property Address</span>
            <input required value={form.address} onChange={(event) => onChange({ address: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">City</span>
            <input required value={form.city} onChange={(event) => onChange({ city: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">State</span>
            <input required maxLength={2} value={form.state} onChange={(event) => onChange({ state: event.target.value.toUpperCase() })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">ZIP</span>
            <input value={form.zip} onChange={(event) => onChange({ zip: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">MLS Number</span>
            <input value={form.mlsNumber} onChange={(event) => onChange({ mlsNumber: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Client Name</span>
            <input required value={form.clientName} onChange={(event) => onChange({ clientName: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Client Role</span>
            <select value={form.clientRole} onChange={(event) => onChange({ clientRole: event.target.value as "Buyer" | "Seller" | "Dual" })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20">
              {(["Buyer", "Seller", "Dual"] as const).map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Client Email</span>
            <input type="email" value={form.clientEmail} onChange={(event) => onChange({ clientEmail: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Client Phone</span>
            <input value={form.clientPhone} onChange={(event) => onChange({ clientPhone: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Contract Price</span>
            <input required inputMode="numeric" value={form.contractPrice} onChange={(event) => onChange({ contractPrice: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">List Price</span>
            <input inputMode="numeric" value={form.listPrice} onChange={(event) => onChange({ listPrice: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Stage</span>
            <select value={form.stage} onChange={(event) => onChange({ stage: event.target.value as PipelineStage })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20">
              {PIPELINE_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Status</span>
            <select value={form.status} onChange={(event) => onChange({ status: event.target.value as TransactionStatus })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20">
              {(["Active", "Closed", "Cancelled"] as TransactionStatus[]).map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Representation</span>
            <select value={form.type} onChange={(event) => onChange({ type: event.target.value as TransactionType })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20">
              {(["Buy", "Sell", "Dual"] as TransactionType[]).map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Closing Date</span>
            <input type="date" value={form.closingDate} onChange={(event) => onChange({ closingDate: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-gray-500">Agent</span>
            <input value={form.agent} onChange={(event) => onChange({ agent: event.target.value })} className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20" />
          </label>
        </div>

        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-line bg-surface px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-gray-500 hover:text-dravik-dark">Cancel</button>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-dravik-dark px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-wait disabled:opacity-60">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {submitting ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [tab, setTab]                 = useState<PageTab>("active");
  const [selectedTx, setSelectedTx]   = useState<Transaction | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [form, setForm] = useState<TransactionFormState>(EMPTY_TRANSACTION_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTransactions() {
      try {
        const payload = await fetchOperationalRecords<Transaction>("transactions");
        if (!mounted) return;
        setTransactions(payload.records);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load transactions.");
      }
    }

    void loadTransactions();
    return () => { mounted = false; };
  }, []);

  // KPI computations
  const active       = transactions.filter((t) => t.status === "Active");
  const closingMonth = active.filter((t) => t.daysUntilClose <= 31).length;
  const totalVolume  = active.reduce((s, t) => s + t.contractPrice, 0);
  const avgDays      = active.length > 0
    ? Math.round(active.reduce((s, t) => s + t.daysUntilClose, 0) / active.length)
    : 0;
  const commPipeline = active.reduce((s, t) => {
    const gross = t.contractPrice * (t.commission.commissionRate / 100);
    const ref   = t.commission.hasReferral ? gross * (t.commission.referralRate / 100) : 0;
    return s + (gross - ref) * (1 - t.commission.dravikSplitRate / 100) - t.commission.transactionFee;
  }, 0);

  // Tab data
  const contractOnly = transactions.filter((t) => t.stage === "Under Contract");
  const closed       = transactions.filter((t) => t.status === "Closed");
  const all          = transactions;

  function updateForm(patch: Partial<TransactionFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function openAddTransaction() {
    setFormMode("add");
    setEditingTx(null);
    setForm(EMPTY_TRANSACTION_FORM);
    setFormOpen(true);
  }

  function openEditTransaction(transaction: Transaction) {
    setFormMode("edit");
    setEditingTx(transaction);
    setForm(transactionToForm(transaction));
    setFormOpen(true);
  }

  async function handleSubmitTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const nextTransaction = formToTransaction(form, editingTx ?? undefined);
      if (formMode === "edit" && editingTx) {
        const payload = await updateOperationalRecord<Transaction>("transactions", editingTx.id, nextTransaction);
        setTransactions((current) => current.map((transaction) => transaction.id === editingTx.id ? payload.record : transaction));
        setSelectedTx(payload.record);
      } else {
        const payload = await createOperationalRecord<Transaction>("transactions", nextTransaction);
        setTransactions((current) => [payload.record, ...current]);
        setSelectedTx(payload.record);
        setTab("active");
      }
      setFormOpen(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save transaction.");
    } finally {
      setSubmitting(false);
    }
  }

  async function archiveTransaction(transaction: Transaction) {
    setError(null);

    try {
      await archiveOperationalRecord("transactions", transaction.id);
      setTransactions((current) => current.filter((item) => item.id !== transaction.id));
      setSelectedTx((current) => current?.id === transaction.id ? null : current);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to archive transaction.");
    }
  }

  return (
    <>
      <div className="h-full flex flex-col overflow-hidden">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-line px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-dravik-dark">Transactions</h1>
              <p className="text-xs text-gray-400 mt-0.5">Deals from under contract through closing</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {selectedTx && (
                <>
                  <button
                    type="button"
                    onClick={() => openEditTransaction(selectedTx)}
                    className="inline-flex items-center gap-2 rounded-xl border border-line px-3.5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-surface"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void archiveTransaction(selectedTx)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-100 px-3.5 py-2 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50"
                  >
                    <Trash2 size={14} />
                    Archive
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={openAddTransaction}
                className="inline-flex items-center gap-2 rounded-xl bg-dravik-dark px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
              >
                <Plus size={14} />
                Add Transaction
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <KpiCard icon={Calendar}  label="Pending Closings This Month" value={String(closingMonth)}           accent="#C9C3B6" sub="Active deals" />
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
                    ? "border-gold text-dravik-dark"
                    : "border-transparent text-gray-400 hover:text-dravik-dark"
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
      <TransactionFormModal
        open={formOpen}
        mode={formMode}
        form={form}
        submitting={submitting}
        onChange={updateForm}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmitTransaction}
      />
    </>
  );
}
