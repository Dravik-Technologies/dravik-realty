"use client";

import { useState, useRef, useEffect } from "react";
import {
  X, FileText, CheckSquare, DollarSign, Home, MessageSquare, BarChart3,
  Calendar, Users, Building2, FileCheck, AlertCircle, CheckCircle2,
  Clock, Phone, Mail, ExternalLink, Upload, Send, Plus,
} from "lucide-react";
import type {
  Transaction, TransactionTab, TransactionDocument, TransactionTask,
  TransactionParty, ActivityEntry, MortgageInfo,
} from "@dravik/contracts/realty";
import { STAGE_COLOR } from "./TransactionCard";
import CommissionBreakdown from "./CommissionBreakdown";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── Shared helpers (module level) ───────────────────────────
const TAB_CONFIG: { id: TransactionTab; label: string; icon: React.ElementType }[] = [
  { id: "overview",        label: "Overview",     icon: Home         },
  { id: "documents",       label: "Documents",    icon: FileText     },
  { id: "commission",      label: "Commission",   icon: DollarSign   },
  { id: "tasks",           label: "Tasks",        icon: CheckSquare  },
  { id: "mortgage",        label: "Mortgage",     icon: BarChart3    },
  { id: "communications",  label: "Activity",     icon: MessageSquare},
];

const DOC_ICON: Record<TransactionDocument["type"], React.ElementType> = {
  contract:   FileCheck,
  inspection: AlertCircle,
  appraisal:  Building2,
  disclosure: FileText,
  title:      FileCheck,
  loan:       DollarSign,
};

// ─── Overview tab (module level) ──────────────────────────────
function OverviewTab({ t }: { t: Transaction }) {
  const color = STAGE_COLOR[t.stage];
  return (
    <div className="space-y-5">
      {/* Property card */}
      <div className="flex gap-4 p-4 bg-surface rounded-2xl border border-line">
        <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.heroImage} alt={t.address} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-dravik-dark text-sm">{t.address}</p>
          <p className="text-xs text-gray-400">{t.city}, {t.state} {t.zip}</p>
          {t.mlsNumber && <p className="text-[10px] text-gray-300 mt-0.5">MLS# {t.mlsNumber}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: color }}>{t.stage}</span>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              t.type === "Buy"  ? "bg-blue-50 text-blue-600" :
              t.type === "Sell" ? "bg-emerald-50 text-emerald-600" :
              "bg-purple-50 text-purple-600"
            )}>{t.type === "Dual" ? "Dual Agency" : `${t.type}er Representation`}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-gold">{formatCurrency(t.contractPrice)}</p>
          {t.contractPrice !== t.listPrice && (
            <p className="text-[10px] text-gray-400 line-through">{formatCurrency(t.listPrice)}</p>
          )}
        </div>
      </div>

      {/* Key dates + progress */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Contract Date",  value: t.contractDate, icon: Calendar },
          { label: "Closing Date",   value: t.closingDate,  icon: Calendar },
          { label: "Days Remaining", value: `${t.daysUntilClose} days`, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-surface rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={11} className="text-gold" />
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-sm font-bold text-dravik-dark">{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Pipeline Progress</span>
          <span className="font-bold text-dravik-dark">{t.progress}%</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${t.progress}%`, background: color }} />
        </div>
      </div>

      {/* Parties */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Parties</p>
        <div className="space-y-2">
          {t.parties.map((p: TransactionParty) => (
            <div key={p.name} className="flex items-center gap-3 px-3 py-2 bg-surface rounded-xl border border-line">
              <div className="w-7 h-7 rounded-full bg-dravik-dark flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-dravik-dark truncate">{p.name}</p>
                <p className="text-[10px] text-gray-400">{p.role}</p>
              </div>
              <div className="flex gap-1.5">
                <a href={`mailto:${p.email}`} className="p-1.5 rounded-lg bg-surface-2 hover:bg-gold-light text-gray-400 hover:text-gold transition-colors">
                  <Mail size={10} />
                </a>
                <a href={`tel:${p.phone}`} className="p-1.5 rounded-lg bg-surface-2 hover:bg-gold-light text-gray-400 hover:text-gold transition-colors">
                  <Phone size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Documents tab (module level) ────────────────────────────
function DocumentsTab({ docs }: { docs: TransactionDocument[] }) {
  const signed   = docs.filter((d) => d.signed).length;
  const pending  = docs.filter((d) => !d.signed && d.signaturesRequired > 0).length;
  const pct      = docs.length > 0 ? Math.round((signed / docs.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Summary + actions */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">{signed}/{docs.length} documents complete</span>
            <span className="font-bold text-dravik-dark">{pct}%</span>
          </div>
          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            disabled
            title="Document upload coming soon"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 text-xs font-semibold text-gray-400 rounded-lg opacity-50 cursor-not-allowed"
          >
            <Upload size={12} /> Upload
          </button>
          {pending > 0 && (
            <button
              disabled
              title="E-signature integration coming soon"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-dravik-dark text-white text-xs font-bold rounded-lg opacity-50 cursor-not-allowed"
            >
              <Send size={12} /> Send for Signature
            </button>
          )}
        </div>
      </div>

      {/* Document grid */}
      <div className="space-y-2">
        {docs.map((d) => {
          const Icon = DOC_ICON[d.type];
          return (
            <div key={d.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-line hover:border-gold/30 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-dravik-dark truncate">{d.name}</p>
                <p className="text-[10px] text-gray-400">Uploaded {d.uploadedAt}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {d.signaturesRequired > 0 && (
                  <span className="text-[9px] text-gray-400">
                    {d.signaturesComplete}/{d.signaturesRequired} signed
                  </span>
                )}
                {d.signed ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 size={9} /> Signed
                  </span>
                ) : d.signaturesRequired > 0 ? (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Pending
                  </span>
                ) : null}
                <button
                  disabled
                  title="Document preview coming soon"
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 cursor-not-allowed transition-all"
                >
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tasks tab (module level) ─────────────────────────────────
const TASK_CATEGORY_LABEL: Record<TransactionTask["category"], string> = {
  inspection: "Inspection",
  finance:    "Financing",
  title:      "Title",
  closing:    "Closing",
  general:    "General",
};

const TASK_CATEGORY_COLOR: Record<TransactionTask["category"], string> = {
  inspection: "#F59E0B",
  finance:    "#3B82F6",
  title:      "#8B5CF6",
  closing:    "#C9C3B6",
  general:    "#9CA3AF",
};

function TasksTab({ tasks: initialTasks }: { tasks: TransactionTask[] }) {
  const [localTasks, setLocalTasks] = useState<TransactionTask[]>(initialTasks);
  const [done, setDone] = useState<Set<string>>(
    new Set(initialTasks.filter((t) => t.done).map((t) => t.id))
  );
  const [showInput, setShowInput] = useState(false);
  const [newLabel, setNewLabel]   = useState("");
  const [newDue, setNewDue]       = useState("");

  function handleAddTask() {
    if (!newLabel.trim()) return;
    const id = `task-${Date.now()}`;
    setLocalTasks((prev) => [
      ...prev,
      { id, label: newLabel.trim(), due: newDue || "TBD", done: false, category: "general" },
    ]);
    setNewLabel(""); setNewDue(""); setShowInput(false);
  }

  const byCategory = localTasks.reduce<Record<string, TransactionTask[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  const total     = localTasks.length;
  const completed = done.size;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">{completed}/{total} tasks complete</span>
          <span className="font-bold text-dravik-dark">{pct}%</span>
        </div>
        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Grouped tasks */}
      {Object.entries(byCategory).map(([cat, items]) => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ background: TASK_CATEGORY_COLOR[cat as TransactionTask["category"]] }} />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {TASK_CATEGORY_LABEL[cat as TransactionTask["category"]]}
            </p>
          </div>
          <div className="space-y-1.5">
            {items.map((t: TransactionTask) => {
              const isDone = done.has(t.id);
              return (
                <label
                  key={t.id}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors",
                    isDone ? "bg-surface border-line opacity-60" : "bg-white border-line hover:border-gold/30"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => setDone((prev) => {
                      const next = new Set(prev);
                      if (next.has(t.id)) next.delete(t.id);
                      else next.add(t.id);
                      return next;
                    })}
                    className="mt-0.5 accent-gold flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-semibold", isDone ? "line-through text-gray-400" : "text-dravik-dark")}>
                      {t.label}
                    </p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={9} /> Due {t.due}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {showInput ? (
        <div className="border border-line rounded-xl p-3 space-y-2 bg-surface">
          <input
            autoFocus
            type="text"
            placeholder="Task description…"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); if (e.key === "Escape") setShowInput(false); }}
            className="w-full px-3 py-1.5 text-xs text-dravik-dark bg-white border border-line rounded-lg focus:outline-none focus:border-gold transition"
          />
          <input
            type="date"
            value={newDue}
            onChange={(e) => setNewDue(e.target.value)}
            className="w-full px-3 py-1.5 text-xs text-dravik-dark bg-white border border-line rounded-lg focus:outline-none focus:border-gold transition"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              disabled={!newLabel.trim()}
              className="flex-1 py-1.5 bg-dravik-dark text-white text-xs font-bold rounded-lg hover:bg-gold hover:text-dravik-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Task
            </button>
            <button
              onClick={() => { setShowInput(false); setNewLabel(""); setNewDue(""); }}
              className="px-3 py-1.5 bg-surface-2 text-gray-400 text-xs font-semibold rounded-lg hover:text-dravik-dark transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-line rounded-xl text-xs font-semibold text-gray-400 hover:border-gold hover:text-gold transition-colors"
        >
          <Plus size={13} /> Add Task
        </button>
      )}
    </div>
  );
}

// ─── Mortgage tab (module level) ──────────────────────────────
function MortgageTab({ mortgage, contractPrice }: { mortgage: MortgageInfo | undefined; contractPrice: number }) {
  if (!mortgage) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
          <BarChart3 size={22} className="text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-400">Cash Transaction</p>
        <p className="text-xs text-gray-300 max-w-xs">No mortgage data — buyer is purchasing with cash or all-cash terms.</p>
      </div>
    );
  }

  const ltv = mortgage.loanAmount > 0 ? Math.round((mortgage.loanAmount / contractPrice) * 100) : 0;

  const statusColor = {
    "Pre-Approved":         "#F59E0B",
    "Submitted":            "#3B82F6",
    "Conditionally Approved":"#8B5CF6",
    "Clear to Close":       "#10B981",
    "Cash":                 "#C9C3B6",
  }[mortgage.status];

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-line bg-white">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${statusColor}18` }}>
          <BarChart3 size={16} style={{ color: statusColor }} />
        </div>
        <div>
          <p className="text-sm font-bold text-dravik-dark">{mortgage.status}</p>
          <p className="text-xs text-gray-400">{mortgage.lender}</p>
        </div>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border"
          style={{ color: statusColor, borderColor: `${statusColor}40`, background: `${statusColor}12` }}>
          {mortgage.loanType}
        </span>
      </div>

      {/* Loan details */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Loan Amount",    value: formatCurrency(mortgage.loanAmount)                    },
          { label: "Down Payment",   value: formatCurrency(mortgage.downPayment)                   },
          { label: "Interest Rate",  value: `${mortgage.rate.toFixed(3)}%`                         },
          { label: "Loan Term",      value: `${mortgage.term} years`                               },
          { label: "LTV Ratio",      value: `${ltv}%`                                              },
          { label: "Monthly Est.",   value: formatCurrency(Math.round(mortgage.loanAmount * 0.006))},
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface rounded-xl p-3">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-bold text-dravik-dark mt-0.5">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Communications tab (module level) ───────────────────────
function CommunicationsTab({ activity: initialActivity }: { activity: ActivityEntry[] }) {
  const [localActivity, setLocalActivity] = useState<ActivityEntry[]>(initialActivity);
  const [noteText, setNoteText]           = useState("");

  function handlePost() {
    if (!noteText.trim()) return;
    const id   = `note-${Date.now()}`;
    const date = new Date().toISOString().split("T")[0];
    setLocalActivity((prev) => [
      ...prev,
      { id, date, actor: "Chris Macabugao", action: noteText.trim() },
    ]);
    setNoteText("");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-0">
        {[...localActivity].reverse().map((a: ActivityEntry, i: number) => (
          <div key={a.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />
              {i < localActivity.length - 1 && <div className="w-px flex-1 bg-line mt-1 mb-0" />}
            </div>
            <div className="pb-4 flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 mb-0.5">{a.date} · {a.actor}</p>
              <p className="text-xs font-semibold text-dravik-dark leading-snug">{a.action}</p>
              {a.note && (
                <p className="text-[10px] text-gray-500 mt-0.5 bg-surface-2 rounded-lg px-2 py-1 border border-line">
                  {a.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add note */}
      <div className="border-t border-line pt-4 space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add Note</p>
        <textarea
          rows={3}
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note or update to the activity log..."
          className="w-full px-3 py-2 text-xs text-dravik-dark bg-surface-2 border border-line rounded-xl resize-none focus:outline-none focus:border-gold transition"
        />
        <button
          onClick={handlePost}
          disabled={!noteText.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-dravik-dark text-white text-xs font-bold rounded-xl hover:bg-gold hover:text-dravik-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MessageSquare size={12} /> Post Update
        </button>
      </div>
    </div>
  );
}

// ─── TransactionPanel ─────────────────────────────────────────
interface TransactionPanelProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function TransactionPanel({ transaction, onClose }: TransactionPanelProps) {
  const open      = transaction !== null;
  const panelRef  = useRef<HTMLDivElement>(null);
  const closeRef  = useRef<HTMLButtonElement>(null);
  const prevRef   = useRef<HTMLElement | null>(null);

  const [tab, setTab]             = useState<TransactionTab>("overview");
  const [trackedId, setTrackedId] = useState<string | null>(null);
  const [advanced, setAdvanced]   = useState(false);

  // Reset tab + advanced on transaction change
  if (transaction && transaction.id !== trackedId) {
    setTrackedId(transaction.id);
    setTab("overview");
    setAdvanced(false);
  }

  // Focus management
  useEffect(() => {
    if (open) {
      prevRef.current = document.activeElement as HTMLElement;
      closeRef.current?.focus();
    } else {
      prevRef.current?.focus();
    }
  }, [open]);

  // Keyboard trap + Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const els = Array.from(panel.querySelectorAll<HTMLElement>(
        "button:not([disabled]),input,textarea,select,a[href],[tabindex]:not([tabindex=\"-1\"])"
      ));
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!transaction) return null;

  const color = STAGE_COLOR[transaction.stage];

  return (
    <>
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Transaction Details"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl",
          "w-full md:w-[680px]",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-dravik-dark px-5 py-4">
          <div className="flex items-start gap-3">
            <button ref={closeRef} onClick={onClose} aria-label="Close"
              className="text-gray-400 hover:text-white p-1 transition-colors mt-0.5 flex-shrink-0">
              <X size={18} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base truncate">{transaction.address}</p>
              <p className="text-gray-400 text-xs">{transaction.city}, {transaction.state} · {transaction.client.name}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-gold font-bold text-lg">{formatCurrency(transaction.contractPrice)}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white border border-white/20">
                {transaction.daysUntilClose}d to close
              </span>
            </div>
          </div>

          {/* Stage progress */}
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${transaction.progress}%`, background: color }} />
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0.5 mt-3 overflow-x-auto">
            {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0",
                  tab === id ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"
                )}
              >
                <Icon size={11} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tab === "overview"       && <OverviewTab t={transaction} />}
          {tab === "documents"      && <DocumentsTab docs={transaction.documents} />}
          {tab === "commission"     && (
            <CommissionBreakdown
              contractPrice={transaction.contractPrice}
              commission={transaction.commission}
            />
          )}
          {tab === "tasks"          && <TasksTab tasks={transaction.tasks} />}
          {tab === "mortgage"       && (
            <MortgageTab mortgage={transaction.mortgage} contractPrice={transaction.contractPrice} />
          )}
          {tab === "communications" && <CommunicationsTab activity={transaction.activity} />}
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 border-t border-line px-5 py-3 flex items-center gap-2">
          <button
            onClick={() => setAdvanced(true)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 font-bold text-sm rounded-xl transition-all flex-1 justify-center",
              advanced
                ? "bg-emerald-500 text-white cursor-default"
                : "bg-dravik-dark text-white hover:bg-gold hover:text-dravik-dark"
            )}
          >
            <CheckCircle2 size={14} />
            {advanced
              ? "Stage Updated!"
              : transaction.stage === "Closing / Funded"
              ? "Mark as Closed"
              : "Advance Stage"}
          </button>
          <button
            onClick={() => setTab("communications")}
            title="Send update to all parties"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-surface-2 text-dravik-dark font-semibold text-sm rounded-xl hover:bg-gold-light hover:text-gold transition-all"
          >
            <Send size={14} /> Send Update
          </button>
          <button
            onClick={() => setTab("overview")}
            title="View transaction parties"
            className="p-2.5 bg-surface-2 text-gray-400 rounded-xl hover:bg-gold-light hover:text-gold transition-colors"
          >
            <Users size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
