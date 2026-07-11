"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, XCircle, ShieldCheck, FileText } from "lucide-react";
import { LICENSE_RECORDS } from "../../data/settings";
import type { LicenseStatus } from "@dravik/contracts/broker";
import { cn } from "@dravik/shared";

// ─── License status config ────────────────────────────────────
const LIC_STATUS: Record<LicenseStatus, { icon: React.ElementType; cls: string; badge: string; label: string }> = {
  active:          { icon: CheckCircle2,  cls: "text-emerald-500", badge: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Active"         },
  "expiring-soon": { icon: AlertTriangle, cls: "text-amber-500",   badge: "bg-amber-50 text-amber-600 border-amber-200",       label: "Expiring Soon"  },
  expired:         { icon: XCircle,       cls: "text-rose-500",    badge: "bg-rose-50 text-rose-600 border-rose-200",          label: "Expired"        },
};

// ─── CompliancePanel ──────────────────────────────────────────
export default function CompliancePanel() {
  const expiringSoon = LICENSE_RECORDS.filter((l) => l.status === "expiring-soon").length;

  return (
    <div className="space-y-6">

      {/* Expiring alert */}
      {expiringSoon > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-800 font-medium">
            <strong>{expiringSoon} license{expiringSoon > 1 ? "s" : ""}</strong> expiring within 90 days. Renew promptly to maintain compliance.
          </p>
        </div>
      )}

      {/* License tracker */}
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-line">
          <FileText size={16} className="text-gold" />
          <div>
            <h3 className="text-sm font-bold text-dravik-dark">License Expiration Tracker</h3>
            <p className="text-xs text-gray-400 mt-0.5">DRE and NMLS licenses for all active agents.</p>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2">
              <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Agent</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">License</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expires</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {LICENSE_RECORDS.map((rec) => {
              const cfg  = LIC_STATUS[rec.status];
              const Icon = cfg.icon;
              return (
                <tr key={rec.id} className="border-b border-line last:border-0 hover:bg-surface/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className={cn("flex-shrink-0", cfg.cls)} />
                      <span className="text-xs font-semibold text-dravik-dark">{rec.agentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold uppercase">{rec.licenseType}</span>
                      <p className="text-[10px] text-gray-400 font-mono">{rec.licenseNumber}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-xs text-dravik-dark">{rec.expiryDate}</p>
                    <p className={cn("text-[10px] font-semibold", rec.daysRemaining <= 60 ? "text-amber-500" : "text-gray-400")}>
                      {rec.daysRemaining}d remaining
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-full", cfg.badge)}>
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* E&O Insurance */}
      <div className="bg-white border border-line rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck size={16} className="text-gold" />
          <div>
            <h3 className="text-sm font-bold text-dravik-dark">E&O Insurance</h3>
            <p className="text-xs text-gray-400 mt-0.5">Errors & Omissions coverage for the brokerage.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Carrier",           value: "First American Specialty Ins." },
            { label: "Policy Number",     value: "EO-2024-AXR-78234"             },
            { label: "Coverage",          value: "$1M / $3M aggregate"            },
            { label: "Policy Expires",    value: "Dec 31, 2026"                   },
            { label: "Premium",           value: "$4,800/yr"                      },
            { label: "Last Renewed",      value: "Jan 1, 2026"                    },
          ].map((item) => (
            <div key={item.label} className="bg-surface-2 rounded-xl px-4 py-3">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-bold text-dravik-dark mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <p className="text-xs font-semibold text-emerald-700">Policy is current — 216 days remaining</p>
          </div>
        </div>
      </div>

      {/* Document vault link */}
      <div className="bg-surface-2 border border-line rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-line flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-dravik-dark">Compliance Documents</p>
          <p className="text-xs text-gray-400 mt-0.5">Broker agreements, disclosure forms, and policy templates are managed in Client Portal Admin.</p>
        </div>
        <Link
          href="/realty/client-portal"
          className="flex-shrink-0 px-4 py-2 border border-line text-xs font-semibold text-gray-500 rounded-xl hover:text-dravik-dark hover:border-dravik-dark transition-colors"
        >
          Manage Vault
        </Link>
      </div>

    </div>
  );
}
