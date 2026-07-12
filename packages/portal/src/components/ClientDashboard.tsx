"use client";

import { useState } from "react";
import {
  Home, FileText, BarChart3, MessageSquare,
  Phone, Mail, Calendar, Clock, Send,
  Bed, Bath, Ruler, Bookmark, Share2, AlertCircle,
  ArrowRight, Building2,
} from "lucide-react";
import type { ClientPortalData, ClientMessage, ActivityEntry, SavedProperty } from "@dravik/contracts/portal";
import ClientTransactionCard from "./ClientTransactionCard";
import MortgageProgressCard from "./MortgageProgressCard";
import DocumentVault from "./DocumentVault";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── Types ─────────────────────────────────────────────────
type PortalTab = "dashboard" | "transactions" | "properties" | "mortgage" | "documents" | "messages";

const TABS: { id: PortalTab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard",    label: "Dashboard",     icon: Home          },
  { id: "transactions", label: "Transactions",  icon: Building2     },
  { id: "properties",   label: "Saved",         icon: Bookmark      },
  { id: "mortgage",     label: "Mortgage",      icon: BarChart3     },
  { id: "documents",    label: "Documents",     icon: FileText      },
  { id: "messages",     label: "Messages",      icon: MessageSquare },
];

// ─── KPI card (module level) ──────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-line px-4 py-3.5 flex items-center gap-3">
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

// ─── Agent card (module level) ───────────────────────────
function AgentCard({ agent }: { agent: ClientPortalData["agent"] }) {
  return (
    <div className="bg-white rounded-2xl border border-line p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-dravik-dark flex items-center justify-center text-gold font-bold text-lg flex-shrink-0">
        {agent.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-dravik-dark text-sm">{agent.name}</p>
        <p className="text-xs text-gray-400">{agent.title}</p>
        <p className="text-[10px] text-gray-300 mt-0.5">License #{agent.license}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <a href={`tel:${agent.phone}`}
          className="p-2.5 rounded-xl bg-surface-2 text-gray-400 hover:bg-gold-light hover:text-gold transition-colors"
          title={`Call ${agent.phone}`}>
          <Phone size={14} />
        </a>
        <a href={`mailto:${agent.email}`}
          className="p-2.5 rounded-xl bg-surface-2 text-gray-400 hover:bg-gold-light hover:text-gold transition-colors"
          title={`Email ${agent.email}`}>
          <Mail size={14} />
        </a>
      </div>
    </div>
  );
}

// ─── Saved property card (module level) ──────────────────
function PropertyCard({
  p,
  onRemove,
  onShare,
  isShared,
}: {
  p: SavedProperty;
  onRemove: (id: string) => void;
  onShare: (property: SavedProperty) => void;
  isShared: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-line overflow-hidden hover:shadow-md hover:border-gold/20 transition-all group">
      <div className="relative h-36 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.heroImage} alt={p.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-2 left-2">
          <span className={cn(
            "text-[9px] font-bold px-2 py-0.5 rounded-full",
            p.status === "Active"  ? "bg-emerald-500 text-white" :
            p.status === "Pending" ? "bg-amber-500 text-white"   :
                                     "bg-gray-500 text-white"
          )}>{p.status}</span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-dravik-dark/80 text-gold text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
            {formatCurrency(p.price)}
          </span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div>
          <p className="text-xs font-bold text-dravik-dark truncate">{p.address}</p>
          <p className="text-[10px] text-gray-400">{p.city}, {p.state}</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><Bed size={10} /> {p.beds} bd</span>
          <span className="flex items-center gap-1"><Bath size={10} /> {p.baths} ba</span>
          <span className="flex items-center gap-1"><Ruler size={10} /> {p.sqft.toLocaleString()} sqft</span>
        </div>
        {p.notes && (
          <p className="text-[10px] text-gray-400 italic truncate">{p.notes}</p>
        )}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onRemove(p.id)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-semibold text-gray-400 bg-surface-2 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors"
          >
            Remove
          </button>
          <button
            onClick={() => onShare(p)}
            aria-pressed={isShared}
            title={isShared ? "Shared with agent" : "Share with agent"}
            className={cn(
              "flex items-center justify-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-lg transition-colors",
              isShared
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "text-gold bg-gold-light hover:bg-gold hover:text-dravik-dark"
            )}
          >
            <Share2 size={10} /> {isShared ? "Shared" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Message bubble (module level) ───────────────────────
function MessageBubble({ msg }: { msg: ClientMessage }) {
  const isAgent = msg.from === "agent";
  return (
    <div className={cn("flex gap-2.5", isAgent ? "justify-start" : "justify-end")}>
      {isAgent && (
        <div className="w-7 h-7 rounded-full bg-dravik-dark flex items-center justify-center text-gold text-[10px] font-bold flex-shrink-0 mt-1">
          CM
        </div>
      )}
      <div className={cn(
        "max-w-[80%] rounded-2xl px-3.5 py-2.5",
        isAgent
          ? "bg-white border border-line rounded-tl-sm"
          : "bg-dravik-dark rounded-tr-sm"
      )}>
        <p className={cn("text-xs leading-snug", isAgent ? "text-dravik-dark" : "text-white")}>
          {msg.content}
        </p>
        <p className={cn("text-[9px] mt-1", isAgent ? "text-gray-400" : "text-gray-400")}>
          {msg.displayTime}
        </p>
      </div>
    </div>
  );
}

// ─── Activity item (module level) ────────────────────────
function ActivityItem({ entry: a, isLast }: { entry: ActivityEntry; isLast: boolean }) {
  const dotColor =
    a.actorRole === "agent"  ? "#C9C3B6" :
    a.actorRole === "client" ? "#3B82F6" : "#9CA3AF";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: dotColor }} />
        {!isLast && <div className="w-px flex-1 bg-line mt-1" style={{ minHeight: "20px" }} />}
      </div>
      <div className="pb-4 flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 mb-0.5">{a.date} · {a.actor}</p>
        <p className="text-xs font-semibold text-dravik-dark leading-snug">{a.message}</p>
      </div>
    </div>
  );
}

// ─── Dashboard overview (module level) ───────────────────
function DashboardTab({ data, onTabChange }: { data: ClientPortalData; onTabChange: (t: PortalTab) => void }) {
  const activeTx       = data.transactions.filter((t) => t.status === "Active");
  const closingSoon    = activeTx.filter((t) => t.daysUntilClose > 0 && t.daysUntilClose <= 30);
  const savedCount     = data.savedProperties.length;
  const hasMortgage    = activeTx.some((t) => t.mortgage);
  const unread         = data.messages.filter((m) => !m.read).length;

  const allDocs        = data.transactions.flatMap((t) => t.documents);
  const docsNeeded     = allDocs.filter((d) => d.status === "needed").length;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Building2}     label="Active Transactions"  value={String(activeTx.length)}       accent="#3B82F6"  sub={activeTx.length > 0 ? "In progress" : "None active"} />
        <KpiCard icon={Bookmark}      label="Saved Properties"     value={String(savedCount)}             accent="#C9C3B6"  sub="Watchlist" />
        <KpiCard icon={BarChart3}     label="Mortgage Status"      value={hasMortgage ? "Active" : "N/A"} accent="#10B981"  sub={activeTx.find(t => t.mortgage)?.mortgage?.status} />
        <KpiCard icon={AlertCircle}   label="Docs Needed"          value={String(docsNeeded)}             accent={docsNeeded > 0 ? "#EF4444" : "#10B981"} sub="Upload required" />
      </div>

      {/* Agent card */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Your Agent</p>
        <AgentCard agent={data.agent} />
      </div>

      {/* Upcoming deadlines */}
      {closingSoon.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock size={10} /> Upcoming Closings
          </p>
          <div className="space-y-2">
            {closingSoon.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <Calendar size={14} className="text-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-dravik-dark truncate">{t.address}</p>
                  <p className="text-[10px] text-amber-600">{t.closingDate} · {t.daysUntilClose} days away</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
        <div className="grid grid-cols-1 sm:max-w-sm gap-3">
          <button
            onClick={() => onTabChange("messages")}
            className="flex items-center gap-3 p-4 bg-dravik-dark text-white rounded-2xl hover:bg-gold hover:text-dravik-dark transition-all group"
          >
            <MessageSquare size={18} className="flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-bold">Message Agent</p>
              {unread > 0 && <p className="text-[10px] opacity-70">{unread} unread</p>}
            </div>
            <ArrowRight size={14} className="ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Recent Activity</p>
        <div className="bg-white rounded-2xl border border-line p-4 space-y-0">
          {[...data.activity].reverse().slice(0, 5).map((a, i, arr) => (
            <ActivityItem key={a.id} entry={a} isLast={i === arr.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Messages tab (module level) ────────────────────────────
function MessagesTab({ data }: { data: ClientPortalData }) {
  const [localMessages, setLocalMessages] = useState<ClientMessage[]>(data.messages);
  const [draft, setDraft]                 = useState("");

  function handleSend() {
    if (!draft.trim()) return;
    const id  = `msg-${Date.now()}`;
    const now = new Date();
    setLocalMessages((prev) => [
      ...prev,
      {
        id,
        from: "client",
        fromName: data.client.name,
        content: draft.trim(),
        timestamp: now.toISOString(),
        displayTime: now.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
        read: true,
      },
    ]);
    setDraft("");
  }

  return (
    <div className="flex flex-col h-full space-y-0">
      <div className="flex items-center gap-3 pb-4 border-b border-line mb-4">
        <div className="w-9 h-9 rounded-full bg-dravik-dark flex items-center justify-center text-gold font-bold text-sm flex-shrink-0">
          {data.agent.initials}
        </div>
        <div>
          <p className="text-sm font-bold text-dravik-dark">{data.agent.name}</p>
          <p className="text-xs text-gray-400">{data.agent.title}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 pb-4 overflow-y-auto" style={{ maxHeight: "420px" }}>
        {localMessages.map((m) => <MessageBubble key={m.id} msg={m} />)}
      </div>

      <div className="border-t border-line pt-4 flex gap-2 items-end">
        <textarea
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message to your agent…"
          className="flex-1 px-3 py-2 text-xs text-dravik-dark bg-surface-2 border border-line rounded-xl resize-none focus:outline-none focus:border-gold transition"
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          className="p-2.5 bg-dravik-dark text-white rounded-xl hover:bg-gold hover:text-dravik-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Saved properties tab (module level) ────────────────────
function SavedPropertiesTab({ data }: { data: ClientPortalData }) {
  const [properties, setProperties] = useState(data.savedProperties);
  const [sharedIds, setSharedIds] = useState<Set<string>>(new Set());
  const [sharedProperty, setSharedProperty] = useState<SavedProperty | null>(null);

  function handleRemove(id: string) {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }

  function handleShare(property: SavedProperty) {
    setSharedIds((prev) => {
      const next = new Set(prev);
      next.add(property.id);
      return next;
    });
    setSharedProperty(property);
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <Bookmark size={32} className="text-gray-200" />
        <p className="text-sm font-semibold text-gray-400">No saved properties</p>
        <p className="text-xs text-gray-300">Properties you save while browsing will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sharedProperty && (
        <div role="status" className="rounded-xl border border-gold/25 bg-gold-light px-3 py-2 text-xs font-semibold text-dravik-dark">
          {sharedProperty.address} shared with your agent.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((p) => (
          <PropertyCard
            key={p.id}
            p={p}
            onRemove={handleRemove}
            onShare={handleShare}
            isShared={sharedIds.has(p.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Mortgage tab (module level) ────────────────────────────
function MortgageTab({ data }: { data: ClientPortalData }) {
  const mortgages = data.transactions
    .filter((t) => t.mortgage)
    .map((t) => ({ mortgage: t.mortgage!, address: t.address }));

  if (mortgages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <BarChart3 size={32} className="text-gray-200" />
        <p className="text-sm font-semibold text-gray-400">No mortgage applications</p>
        <p className="text-xs text-gray-300">Cash transaction or no loan on file.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {mortgages.map(({ mortgage, address }) => (
        <div key={mortgage.id}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{address}</p>
          <MortgageProgressCard mortgage={mortgage} />
        </div>
      ))}
    </div>
  );
}

// ─── ClientDashboard ─────────────────────────────────────────
interface Props {
  data: ClientPortalData;
}

export default function ClientDashboard({ data }: Props) {
  const [tab, setTab]               = useState<PortalTab>("dashboard");
  const [trackedClient, setTracked] = useState(data.client.id);

  // Reset to dashboard when client switches
  if (data.client.id !== trackedClient) {
    setTracked(data.client.id);
    setTab("dashboard");
  }

  const unread = data.messages.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-surface">
      {/* Top nav */}
      <nav className="sticky top-0 z-20 bg-white border-b border-line shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Brand */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-dravik-dark flex items-center justify-center">
                <span className="text-gold font-bold text-[11px]">DR</span>
              </div>
              <span className="font-bold text-dravik-dark text-sm hidden sm:inline">Dravik Realty Portal</span>
            </div>

            {/* Tabs — desktop */}
            <div className="hidden md:flex items-center gap-0.5">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors",
                    tab === id ? "bg-gold-light text-gold-dark" : "text-gray-400 hover:text-dravik-dark hover:bg-surface"
                  )}
                >
                  <Icon size={13} /> {label}
                  {id === "messages" && unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Client pill */}
            <div className="flex items-center gap-2 bg-dravik-dark text-white px-3 py-1.5 rounded-full">
              <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-dravik-dark text-[9px] font-bold flex-shrink-0">
                {data.client.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <span className="text-xs font-semibold hidden sm:inline">{data.client.name}</span>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="md:hidden flex gap-0.5 pb-2 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex items-center gap-1 px-3 py-1.5 text-[10px] font-semibold rounded-lg whitespace-nowrap flex-shrink-0 transition-colors",
                  tab === id ? "bg-gold-light text-gold-dark" : "text-gray-400"
                )}
              >
                <Icon size={11} /> {label}
                {id === "messages" && unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Welcome header */}
      <div className="bg-dravik-dark">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <p className="text-gray-400 text-sm mb-1">Welcome back,</p>
          <h1 className="text-2xl font-bold text-white">{data.client.name}</h1>
          {data.transactions.some((t) => t.status === "Active") && (
            <p className="text-gold text-sm mt-1">
              {data.transactions.filter((t) => t.status === "Active").length} active transaction
              {data.transactions.filter((t) => t.status === "Active").length !== 1 ? "s" : ""} in progress
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stateless tabs — conditional render is fine */}
        {tab === "dashboard"    && <DashboardTab data={data} onTabChange={setTab} />}
        {tab === "transactions" && (
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {data.transactions.length} Transaction{data.transactions.length !== 1 ? "s" : ""}
            </p>
            {data.transactions.map((t) => (
              <ClientTransactionCard key={t.id} transaction={t} />
            ))}
          </div>
        )}
        {tab === "mortgage" && <MortgageTab data={data} />}

        {/* Stateful tabs — always mounted so local state survives tab switches */}
        <div className={tab === "properties" ? "" : "hidden"}><SavedPropertiesTab data={data} /></div>
        <div className={tab === "documents"  ? "" : "hidden"}><DocumentVault      transactions={data.transactions} /></div>
        <div className={tab === "messages"   ? "" : "hidden"}><MessagesTab        data={data} /></div>
      </div>

      {/* Footer */}
      <footer className="border-t border-line mt-12 py-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-dravik-dark flex items-center justify-center">
              <span className="text-gold font-bold text-[8px]">DR</span>
            </div>
            <span className="text-xs text-gray-400">Dravik Realty Client Portal</span>
          </div>
          <p className="text-[10px] text-gray-300">Secure Client Portal</p>
        </div>
      </footer>
    </div>
  );
}
