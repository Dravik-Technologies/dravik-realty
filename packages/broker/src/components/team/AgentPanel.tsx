"use client";

import { useState } from "react";
import {
  X, User, TrendingUp, DollarSign, Users, FileText, Activity,
  Mail, Phone, MapPin, Award, Calendar, Shield, CheckCircle,
  AlertTriangle, Clock, Briefcase, ArrowUpRight, ArrowDownLeft,
} from "lucide-react";
import type { Agent, AgentTab, AgentActivity } from "@dravik/contracts/broker";
import CommissionSettings from "./CommissionSettings";
import { cn, formatCurrency, timeAgo } from "@dravik/shared";

// ─── Shared within this file ──────────────────────────────────
const TABS: { id: AgentTab; label: string; icon: React.ElementType }[] = [
  { id: "profile",     label: "Profile",     icon: User       },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "commission",  label: "Commission",  icon: DollarSign },
  { id: "referrals",   label: "Referrals",   icon: Users      },
  { id: "documents",   label: "Documents",   icon: FileText   },
  { id: "activity",    label: "Activity",    icon: Activity   },
];

// ─── Profile tab ──────────────────────────────────────────────
function ProfileTab({ a }: { a: Agent }) {
  const joinYear = a.joinDate.slice(0, 4);

  return (
    <div className="space-y-5 p-5">
      {/* Contact */}
      <div className="bg-surface rounded-2xl border border-line p-4 space-y-3">
        <p className="text-xs font-bold text-axen-dark">Contact Information</p>
        {[
          { icon: Mail,   label: "Email",   value: a.email   },
          { icon: Phone,  label: "Phone",   value: a.phone   },
          { icon: MapPin, label: "Address", value: a.address },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon size={13} className="text-gray-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400">{label}</p>
              <p className="text-xs font-semibold text-axen-dark break-all">{value || "—"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tenure */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-xl border border-line p-3">
          <Calendar size={13} className="text-gold mb-1" />
          <p className="text-sm font-bold text-axen-dark">{a.joinDate}</p>
          <p className="text-[10px] text-gray-400">Join Date</p>
        </div>
        <div className="bg-surface rounded-xl border border-line p-3">
          <Briefcase size={13} className="text-gold mb-1" />
          <p className="text-sm font-bold text-axen-dark">Since {joinYear}</p>
          <p className="text-[10px] text-gray-400">With Axen</p>
        </div>
      </div>

      {/* Certifications */}
      {a.certifications.length > 0 && (
        <div className="bg-surface rounded-xl border border-line p-3">
          <div className="flex items-center gap-2 mb-2">
            <Award size={13} className="text-gold" />
            <p className="text-xs font-bold text-axen-dark">Certifications</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {a.certifications.map((c) => (
              <span key={c} className="px-2 py-0.5 bg-gold-light text-gold text-[10px] font-bold rounded-full border border-gold/20">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Board memberships */}
      {a.boardMemberships.length > 0 && (
        <div className="bg-surface rounded-xl border border-line p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={13} className="text-axen-dark" />
            <p className="text-xs font-bold text-axen-dark">Board Memberships</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {a.boardMemberships.map((b) => (
              <span key={b} className="px-2 py-0.5 bg-surface-2 text-gray-600 text-[10px] font-semibold rounded-full">{b}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Performance tab ──────────────────────────────────────────
function PerformanceTab({ a }: { a: Agent }) {
  const kpis = [
    { label: "YTD Volume",      value: a.ytdVolume > 0 ? `$${(a.ytdVolume / 1_000_000).toFixed(1)}M` : "—",   accent: "#D4AF37" },
    { label: "YTD GCI",         value: a.ytdGci    > 0 ? formatCurrency(a.ytdGci)                    : "—",   accent: "#10B981" },
    { label: "Closed Units",    value: a.closedUnits > 0 ? String(a.closedUnits)                      : "—",   accent: "#3B82F6" },
    { label: "Active Listings", value: String(a.activeListings),                                                accent: "#8B5CF6" },
    { label: "Conversion Rate", value: a.conversionRate > 0 ? `${a.conversionRate}%`                  : "—",   accent: "#F59E0B" },
    { label: "Avg Days/Close",  value: a.avgDaysToClose > 0 ? `${a.avgDaysToClose}d`                  : "—",   accent: "#EF4444" },
  ];

  // Build sparkline bars from monthlyVolume
  const maxVol = Math.max(...a.monthlyVolume, 1);
  const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

  return (
    <div className="space-y-5 p-5">
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-2">
        {kpis.map(({ label, value, accent }) => (
          <div key={label} className="bg-surface rounded-xl border border-line p-3">
            <p className="text-base font-bold text-axen-dark" style={{ color: value === "—" ? undefined : accent }}>{value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Referral score */}
      <div className="bg-surface rounded-xl border border-line p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-axen-dark">Referral Score</p>
          <span className="text-lg font-bold text-gold">{a.referralScore || "—"}</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${a.referralScore}%`,
              background: a.referralScore >= 80 ? "#10B981" : a.referralScore >= 60 ? "#F59E0B" : "#EF4444",
            }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">
          {a.referralScore >= 80 ? "Excellent network performance" :
           a.referralScore >= 60 ? "Good — room to grow" :
           a.referralScore  > 0  ? "Needs improvement" : "No referral history yet"}
        </p>
      </div>

      {/* Monthly production sparkline */}
      {maxVol > 0 && (
        <div className="bg-surface rounded-xl border border-line p-4">
          <p className="text-xs font-bold text-axen-dark mb-3">6-Month Volume</p>
          <div className="flex items-end gap-1.5 h-16">
            {a.monthlyVolume.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height:     `${Math.max(4, (v / maxVol) * 56)}px`,
                    background: i === a.monthlyVolume.length - 1 ? "#D4AF37" : "#E2E8F0",
                  }}
                />
                <span className="text-[8px] text-gray-400">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Referrals tab ────────────────────────────────────────────
function ReferralsTab({ a }: { a: Agent }) {
  const total = a.referralsSent + a.referralsReceived;
  const rate  = total > 0 ? Math.round((a.referralsReceived / total) * 100) : 0;

  return (
    <div className="space-y-5 p-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gold-light rounded-xl border border-gold/20 p-3 text-center">
          <ArrowUpRight size={14} className="text-gold mx-auto mb-1" />
          <p className="text-xl font-bold text-gold">{a.referralsSent}</p>
          <p className="text-[10px] text-gray-500">Sent</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 text-center">
          <ArrowDownLeft size={14} className="text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-blue-600">{a.referralsReceived}</p>
          <p className="text-[10px] text-gray-500">Received</p>
        </div>
        <div className="bg-surface rounded-xl border border-line p-3 text-center">
          <DollarSign size={14} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-sm font-bold text-emerald-600">{a.referralRevenue > 0 ? formatCurrency(a.referralRevenue) : "—"}</p>
          <p className="text-[10px] text-gray-500">Revenue</p>
        </div>
      </div>

      {total > 0 && (
        <div className="bg-surface rounded-xl border border-line p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-axen-dark">Received / Total</p>
            <span className="text-sm font-bold text-axen-dark">{rate}%</span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${rate}%` }} />
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Users size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No referral history yet</p>
        </div>
      )}
    </div>
  );
}

// ─── Documents tab ────────────────────────────────────────────
function DocumentsTab({ a }: { a: Agent }) {
  const today    = "2026-05-29"; // avoid new Date() during render
  const licOk    = a.licenseExpiry > today;
  const eoOk     = a.eAndOExpiry  > today;

  const docs = [
    { label: "RE License",          number: a.licenseNumber, expiry: a.licenseExpiry, ok: licOk },
    { label: "E&O Insurance",       number: "On File",        expiry: a.eAndOExpiry,  ok: eoOk  },
  ];

  return (
    <div className="space-y-5 p-5">
      <div className="space-y-2">
        {docs.map(({ label, number, expiry, ok }) => (
          <div key={label} className={cn(
            "flex items-center gap-3 p-3 rounded-xl border",
            ok ? "bg-white border-line" : "bg-rose-50 border-rose-200"
          )}>
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              ok ? "bg-emerald-50" : "bg-rose-100"
            )}>
              {ok
                ? <CheckCircle size={16} className="text-emerald-600" />
                : <AlertTriangle size={16} className="text-rose-500" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-axen-dark">{label}</p>
              <p className="text-[10px] text-gray-400">{number}</p>
            </div>
            <div className="text-right">
              <p className={cn("text-[10px] font-bold", ok ? "text-gray-500" : "text-rose-500")}>
                Exp: {expiry || "—"}
              </p>
              <p className={cn("text-[9px]", ok ? "text-emerald-600" : "text-rose-500")}>
                {ok ? "Current" : "Expired / Missing"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {a.boardMemberships.length > 0 && (
        <div className="bg-surface rounded-xl border border-line p-3">
          <p className="text-xs font-bold text-axen-dark mb-2">Board Memberships</p>
          <div className="space-y-1.5">
            {a.boardMemberships.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <CheckCircle size={12} className="text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-axen-dark">{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        disabled
        title="Document upload coming soon"
        className="w-full py-2.5 text-sm font-bold text-gray-400 border border-dashed border-line rounded-xl cursor-not-allowed"
      >
        + Upload Document
      </button>
    </div>
  );
}

// ─── Activity tab ─────────────────────────────────────────────
const ACTIVITY_DOT: Record<AgentActivity["type"], string> = {
  listing:    "bg-gold",
  sale:       "bg-emerald-400",
  referral:   "bg-blue-400",
  note:       "bg-gray-300",
  review:     "bg-violet-400",
  compliance: "bg-amber-400",
};

const ACTIVITY_ICON: Record<AgentActivity["type"], React.ElementType> = {
  listing:    MapPin,
  sale:       CheckCircle,
  referral:   Users,
  note:       FileText,
  review:     Award,
  compliance: Shield,
};

function ActivityTab({ a }: { a: Agent }) {
  return (
    <div className="p-5">
      {a.recentActivity.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Clock size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-0">
          {a.recentActivity.map((act, i) => {
            const Icon = ACTIVITY_ICON[act.type];
            return (
              <div key={act.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0", ACTIVITY_DOT[act.type])}>
                    <Icon size={12} className="text-white" />
                  </div>
                  {i < a.recentActivity.length - 1 && (
                    <div className="w-px flex-1 bg-line mt-1 mb-1" />
                  )}
                </div>
                <div className="flex-1 pb-4 min-w-0">
                  <p className="text-xs font-semibold text-axen-dark leading-tight">{act.description}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5" suppressHydrationWarning>{timeAgo(act.date)} · {act.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── AgentPanel ───────────────────────────────────────────────
interface Props {
  agent:   Agent | null;
  open:    boolean;
  onClose: () => void;
}

export default function AgentPanel({ agent, open, onClose }: Props) {
  const [tab, setTab]         = useState<AgentTab>("profile");
  const [trackedId, setTrackedId] = useState<string | null>(null);

  // Reset tab when a new agent is selected (normalize undefined → null)
  const agentId = agent?.id ?? null;
  if (agentId !== trackedId) {
    setTrackedId(agentId);
    setTab("profile");
  }

  return (
    <>
      {/* Backdrop (mobile only) */}
      {open && agent && (
        <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-full sm:w-[500px] bg-white border-l border-line shadow-2xl",
          "flex flex-col transition-transform duration-300 ease-out",
          open && agent ? "translate-x-0" : "translate-x-full"
        )}
      >
        {agent ? (
          <>
            {/* Panel header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-line bg-white">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: agent.color }}
                >
                  {agent.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-axen-dark truncate">{agent.name}</p>
                  <p className="text-xs text-gray-400">{agent.role} · {agent.licenseType} License</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-surface-2 text-gray-400 hover:text-axen-dark transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-0 mt-4 -mx-1 overflow-x-auto">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors",
                      tab === id
                        ? "border-gold text-axen-dark"
                        : "border-transparent text-gray-400 hover:text-axen-dark"
                    )}
                  >
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content — always mount, hide inactive */}
            <div className="flex-1 overflow-y-auto">
              <div className={tab === "profile"     ? "" : "hidden"}><ProfileTab     a={agent} /></div>
              <div className={tab === "performance" ? "" : "hidden"}><PerformanceTab a={agent} /></div>
              <div className={tab === "commission"  ? "" : "hidden"}><CommissionSettings agent={agent} /></div>
              <div className={tab === "referrals"   ? "" : "hidden"}><ReferralsTab   a={agent} /></div>
              <div className={tab === "documents"   ? "" : "hidden"}><DocumentsTab   a={agent} /></div>
              <div className={tab === "activity"    ? "" : "hidden"}><ActivityTab    a={agent} /></div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
