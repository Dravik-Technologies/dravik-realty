"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Globe, Users, BarChart3, Landmark, Receipt, Map, Megaphone,
  Inbox, DollarSign, TrendingUp, ArrowRight, Activity, Settings,
  X, HelpCircle, CheckCircle2, LayoutDashboard, Target,
} from "lucide-react";
import { SAMPLE_LEADS } from "@/data/leads";
import { SAMPLE_TRANSACTIONS } from "@/data/transactions";
import { MORTGAGE_APPS } from "@/data/mortgage";
import { formatCurrency, cn } from "@/lib/utils";

// ─── Module-level precomputed data ────────────────────────────
const totalLeads  = SAMPLE_LEADS.length;
const pipelineVol = SAMPLE_TRANSACTIONS.reduce((s, t) => s + t.contractPrice, 0);
const activeApps  = MORTGAGE_APPS.filter(a => a.stage !== "declined").length;

const LEAD_STAGES = [
  { key: "New Lead",          short: "New"      },
  { key: "Contacted",         short: "Contacted"},
  { key: "Engaged",           short: "Engaged"  },
  { key: "Active / Showing",  short: "Showing"  },
  { key: "Under Contract",    short: "Contract" },
] as const;

const MORT_STAGES = [
  { key: "pre-qual",     label: "Pre-Qual"    },
  { key: "application",  label: "Application" },
  { key: "underwriting", label: "Underwriting"},
  { key: "approved",     label: "Approved"    },
  { key: "closing",      label: "Closing"     },
] as const;

const leadCounts    = LEAD_STAGES.map(s => ({ ...s, count: SAMPLE_LEADS.filter(l => l.status === s.key).length }));
const mortgageCounts = MORT_STAGES.map(s => ({ ...s, count: MORTGAGE_APPS.filter(a => a.stage === s.key).length }));

const approvedClosing = mortgageCounts[3].count + mortgageCounts[4].count;

const KPIS = [
  { label: "Active Leads",    value: String(totalLeads),                sub: "+8 this week",                      accent: "#4A90A4" },
  { label: "Pipeline Volume", value: formatCurrency(pipelineVol),        sub: `${SAMPLE_TRANSACTIONS.length} active deals`, accent: "#D4AF37" },
  { label: "Closings MTD",    value: "7",                               sub: "On target for May",                 accent: "#4A7A4A" },
  { label: "Mortgage Apps",   value: String(activeApps),                sub: `${approvedClosing} approved/closing`, accent: "#C0786C" },
];

interface ActivityItem {
  id:     string;
  icon:   React.ElementType;
  accent: string;
  module: string;
  href:   string;
  text:   string;
  time:   string;
}

const ACTIVITY: ActivityItem[] = [
  { id:"a1", icon:Users,     accent:"#4A90A4", module:"Leads",        href:"/leads",            text:"Sarah Johnson moved to Under Contract",              time:"2m ago"    },
  { id:"a2", icon:Receipt,   accent:"#4A7A4A", module:"Transactions", href:"/transactions",     text:"Document signed: Purchase Agreement on 12 Ocean Dr", time:"14m ago"   },
  { id:"a3", icon:Landmark,  accent:"#C0786C", module:"Mortgage",     href:"/mortgage",         text:"Chloe Nguyen's FHA loan approved — Closing stage",   time:"1h ago"    },
  { id:"a4", icon:Globe,     accent:"#D4AF37", module:"Referrals",    href:"/referral-network", text:"Marcus Thompson sent referral: David & Amy Park",    time:"2h ago"    },
  { id:"a5", icon:Users,     accent:"#4A90A4", module:"Leads",        href:"/leads",            text:"5 new leads added from Zillow Spring campaign",      time:"3h ago"    },
  { id:"a6", icon:Receipt,   accent:"#4A7A4A", module:"Transactions", href:"/transactions",     text:"Inspection report delivered for 580 Sunset Isle Dr", time:"5h ago"    },
  { id:"a7", icon:Megaphone, accent:"#7C6A9E", module:"Marketing",    href:"/marketing",        text:"Spring Listings 2026 sent to 148 contacts",          time:"6h ago"    },
  { id:"a8", icon:Landmark,  accent:"#C0786C", module:"Mortgage",     href:"/mortgage",         text:"New pre-qual application: Evan & Rachel Torres",     time:"Yesterday" },
];

const MODULES = [
  { label:"Global Referral Network", desc:"Manage and initiate agent referrals across the network.", icon:Globe,     href:"/referral-network", accent:"#D4AF37" },
  { label:"Lead Engine & Smart CRM", desc:"Track, nurture, and convert leads with AI scoring.",      icon:Users,     href:"/leads",            accent:"#4A90A4" },
  { label:"Reports & Analytics",     desc:"Production reports, team metrics, and revenue forecasts.",icon:BarChart3, href:"/reports",          accent:"#7C6A9E" },
  { label:"Mortgage Tools",          desc:"Rate sheets, loan calculators, and pipeline tracking.",   icon:Landmark,  href:"/mortgage",         accent:"#C0786C" },
  { label:"Transactions",            desc:"End-to-end transaction management and document tracking.",icon:Receipt,   href:"/transactions",     accent:"#4A7A4A" },
  { label:"Marketing & Pages",       desc:"Landing pages, email campaigns, and flyer designer.",     icon:Megaphone, href:"/marketing",        accent:"#B87333" },
];

const HELP_LINKS = [
  { label:"Dashboard",        icon:LayoutDashboard, href:"/dashboard"        },
  { label:"Lead Engine",      icon:Users,           href:"/leads"            },
  { label:"Referral Network", icon:Globe,           href:"/referral-network" },
  { label:"Mapping & IDX",    icon:Map,             href:"/mapping"          },
  { label:"Marketing",        icon:Megaphone,       href:"/marketing"        },
  { label:"Transactions",     icon:Receipt,         href:"/transactions"     },
  { label:"Inbox",            icon:Inbox,           href:"/inbox"            },
  { label:"Mortgage Tools",   icon:Landmark,        href:"/mortgage"         },
  { label:"Reports",          icon:BarChart3,       href:"/reports"          },
  { label:"Settings",         icon:Settings,        href:"/settings"         },
];

const GOAL     = 10_000_000;
const GOAL_PCT = Math.min(100, Math.round((pipelineVol / GOAL) * 100));

// ─── KpiCard ──────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }: { label:string; value:string; sub:string; accent:string }) {
  return (
    <div className="bg-white rounded-2xl border border-line p-5 space-y-2">
      <div className="w-2.5 h-2.5 rounded-full" style={{ background: accent }} />
      <p className="text-2xl font-bold text-axen-dark leading-none">{value}</p>
      <div>
        <p className="text-xs font-semibold text-axen-dark">{label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── StageColumn ──────────────────────────────────────────────
function StageColumn({ label, count, maxCount, accent }: {
  label:    string;
  count:    number;
  maxCount: number;
  accent:   string;
}) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex-1 min-w-0">
      <p className="text-lg font-bold text-axen-dark leading-none mb-1.5">{count}</p>
      <div className="h-1.5 bg-line rounded-full overflow-hidden mb-1.5">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
      </div>
      <p className="text-[10px] text-gray-400 truncate leading-tight">{label}</p>
    </div>
  );
}

// ─── HelpModal ────────────────────────────────────────────────
function HelpModal({ onClose }: { onClose: () => void }) {
  const modalRef       = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Save return-focus, set initial focus, restore on close
  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement;
    const id = requestAnimationFrame(() => {
      modalRef.current?.querySelector<HTMLElement>(
        "button:not([disabled]), [href], input, [tabindex]:not([tabindex='-1'])"
      )?.focus();
    });
    return () => {
      cancelAnimationFrame(id);
      returnFocusRef.current?.focus();
    };
  }, []);

  // Escape + Tab trap
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>(
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
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-axen-dark/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-line overflow-hidden animate-slide-up"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-light flex items-center justify-center">
              <HelpCircle size={16} className="text-gold" />
            </div>
            <div>
              <h2 id="help-modal-title" className="text-sm font-bold text-axen-dark">Getting Started</h2>
              <p className="text-[10px] text-gray-400">AxenONE v1.0 · Platform Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-gray-400 hover:text-axen-dark hover:bg-surface-2 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-gray-500 leading-relaxed">
            AxenONE is the complete real estate and mortgage CRM for Axen Realty —
            built for agents, loan officers, and brokers in one unified platform.
          </p>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Platform Modules</p>
            <div className="grid grid-cols-2 gap-2">
              {HELP_LINKS.map(({ label, icon: Icon, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-surface-2 hover:bg-gold-light border border-transparent hover:border-gold/30 transition-all"
                >
                  <Icon size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-axen-dark">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Keyboard Shortcuts</p>
            <div className="space-y-2">
              {[["⌘K", "Global search"], ["ESC", "Close panels & modals"], ["↑↓", "Navigate search results"]] .map(([k, d]) => (
                <div key={k} className="flex items-center gap-3">
                  <kbd className="min-w-[44px] text-center px-2 py-1 rounded border border-line text-[10px] font-mono text-gray-500 bg-surface-2">{k}</kbd>
                  <span className="text-xs text-gray-500">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-line bg-surface-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border border-gold/40 bg-axen-dark flex items-center justify-center">
              <span className="text-gold text-[10px] font-bold leading-none">A</span>
            </div>
            <span className="text-xs font-bold text-axen-dark">AxenONE <span className="text-gold">v1.0</span></span>
          </div>
          <p className="text-[10px] text-gray-400">© 2026 Axen Realty Group</p>
        </div>
      </div>
    </div>
  );
}

// ─── DashboardClient ──────────────────────────────────────────
export default function DashboardClient() {
  const [greeting, setGreeting] = useState("Good morning");
  const [dateStr,  setDateStr]  = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const closeHelp = useCallback(() => setShowHelp(false), []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const h = new Date().getHours();
      setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
      setDateStr(new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      }));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const leadMax    = Math.max(...leadCounts.map(s => s.count), 1);
  const mortgageMax = Math.max(...mortgageCounts.map(s => s.count), 1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

      {/* ── Welcome ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-axen-dark">{greeting}, Chris.</h2>
          <p className="text-sm text-gray-400 mt-1 min-h-[1.25rem]">{dateStr}</p>
        </div>
        <div className="flex items-center gap-2 bg-gold-light border border-gold/30 rounded-xl px-4 py-2.5">
          <DollarSign size={15} className="text-gold" />
          <span className="text-sm font-semibold text-axen-dark">Principal Broker · Axen Realty</span>
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPIS.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* ── Pipeline at a Glance ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-line p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-blue-400 inline-block" />
              <p className="text-sm font-bold text-axen-dark">Lead Pipeline</p>
            </div>
            <Link href="/leads" className="flex items-center gap-1 text-[11px] font-semibold text-gold hover:text-gold-dark transition-colors">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex gap-3">
            {leadCounts.map(s => (
              <StageColumn key={s.key} label={s.short} count={s.count} maxCount={leadMax} accent="#4A90A4" />
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
            <Users size={11} className="text-blue-400" />
            {totalLeads} total leads across all stages
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-line p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-amber-400 inline-block" />
              <p className="text-sm font-bold text-axen-dark">Mortgage Pipeline</p>
            </div>
            <Link href="/mortgage" className="flex items-center gap-1 text-[11px] font-semibold text-gold hover:text-gold-dark transition-colors">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex gap-3">
            {mortgageCounts.map(s => (
              <StageColumn key={s.key} label={s.label} count={s.count} maxCount={mortgageMax} accent="#C0786C" />
            ))}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400">
            <Landmark size={11} className="text-amber-400" />
            {activeApps} active applications in pipeline
          </p>
        </div>
      </div>

      {/* ── Activity Feed + Production ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Activity — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-line overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-gold" />
              <p className="text-sm font-bold text-axen-dark">Recent Activity</p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>
          <div className="divide-y divide-line">
            {ACTIVITY.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-surface/50 transition-colors group"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${item.accent}18` }}
                  >
                    <Icon size={13} style={{ color: item.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-axen-dark leading-relaxed">{item.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-gray-400 bg-surface-2 border border-line px-1.5 py-0.5 rounded-full">
                        {item.module}
                      </span>
                      <span className="text-[10px] text-gray-300">{item.time}</span>
                    </div>
                  </div>
                  <ArrowRight size={12} className="text-gray-200 group-hover:text-gray-400 flex-shrink-0 mt-1 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Production widget — 1/3 */}
        <div className="space-y-4">
          <div className="bg-axen-dark rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={14} className="text-gold" />
              <p className="text-xs font-bold text-white">Monthly Production</p>
            </div>
            <p className="text-3xl font-bold text-white leading-none">{formatCurrency(pipelineVol)}</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">of {formatCurrency(GOAL)} goal · May 2026</p>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gold rounded-full" style={{ width: `${GOAL_PCT}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gold font-bold">{GOAL_PCT}% achieved</span>
              <span className="text-gray-400">{SAMPLE_TRANSACTIONS.length} active deals</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-line p-5 space-y-3.5">
            <p className="text-xs font-bold text-axen-dark">Quick Stats</p>
            {[
              {
                label: "Avg Deal Size",
                value: formatCurrency(pipelineVol / Math.max(SAMPLE_TRANSACTIONS.length, 1)),
                icon:  TrendingUp,
                color: "text-gold",
              },
              {
                label: "Approval Rate",
                value: `${Math.round((activeApps / Math.max(MORTGAGE_APPS.length, 1)) * 100)}%`,
                icon:  CheckCircle2,
                color: "text-emerald-500",
              },
              {
                label: "Active Transactions",
                value: String(SAMPLE_TRANSACTIONS.length),
                icon:  Receipt,
                color: "text-blue-500",
              },
            ].map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={13} className={cn("flex-shrink-0", stat.color)} />
                    <span className="text-[11px] text-gray-500">{stat.label}</span>
                  </div>
                  <span className="text-xs font-bold text-axen-dark">{stat.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Module Launcher ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <span className="w-1 h-5 rounded-full bg-gold inline-block" />
          <h3 className="text-base font-bold text-axen-dark">Platform Modules</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(({ label, desc, icon: Icon, href, accent }) => (
            <Link
              key={label}
              href={href}
              className="group bg-white rounded-2xl border border-line p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}18` }}
                >
                  <Icon size={20} style={{ color: accent }} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-gray-300 group-hover:text-gold group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-axen-dark">{label}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-4 pb-2 border-t border-line">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border border-gold/40 bg-axen-dark flex items-center justify-center">
              <span className="text-gold text-[10px] font-bold leading-none">A</span>
            </div>
            <span className="text-xs font-bold text-axen-dark">AxenONE</span>
            <span className="text-[10px] font-bold text-axen-dark bg-gold px-1.5 py-0.5 rounded-full leading-none">v1.0</span>
          </div>
          <span className="text-[10px] text-gray-300 hidden sm:inline">Axen Realty Group · © 2026</span>
        </div>
        <button
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 hover:text-axen-dark transition-colors"
        >
          <HelpCircle size={13} /> Getting Started
        </button>
      </div>

      {showHelp && <HelpModal onClose={closeHelp} />}
    </div>
  );
}
