"use client";

import { useState } from "react";
import {
  Lock, ShieldCheck, AlertTriangle, Info,
  XCircle, Monitor, Clock, ChevronDown,
} from "lucide-react";
import { AUDIT_LOG } from "../../data/settings";
import type { AuditSeverity } from "@dravik/contracts/broker";
import { cn } from "@dravik/shared";

// ─── Toggle switch (reused here) ─────────────────────────────
function Toggle({ enabled, onChange, label }: {
  enabled: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={() => onChange(!enabled)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
        enabled ? "bg-gold" : "bg-gray-200"
      )}
    >
      <span className={cn(
        "absolute top-[3px] w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
        enabled ? "translate-x-[18px]" : "translate-x-[3px]"
      )} />
    </button>
  );
}

// ─── Audit severity config ────────────────────────────────────
const SEVERITY_CFG: Record<AuditSeverity, { icon: React.ElementType; cls: string; row: string }> = {
  info:    { icon: Info,          cls: "text-blue-400",   row: ""                     },
  warning: { icon: AlertTriangle, cls: "text-amber-400",  row: "bg-amber-50/40"       },
  error:   { icon: XCircle,       cls: "text-rose-500",   row: "bg-rose-50/40"        },
};

// ─── SecurityAuditLog ─────────────────────────────────────────
export default function SecurityAuditLog({ onSave }: { onSave: () => void }) {
  const [twoFA,    setTwoFA]    = useState(true);
  const [ipLock,   setIpLock]   = useState(false);
  const [timeout,  setTimeout_] = useState("30");
  const [logLimit, setLogLimit] = useState(10);

  const visibleLog = AUDIT_LOG.slice(0, logLimit);
  const hasMore    = logLimit < AUDIT_LOG.length;

  return (
    <div className="space-y-6">

      {/* Security settings */}
      <div className="bg-white border border-line rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-gold" />
          <div>
            <h3 className="text-sm font-bold text-dravik-dark">Security Settings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Authentication and access controls for the platform.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* 2FA */}
          <div className="flex items-start justify-between gap-4 py-4 border-b border-line">
            <div className="flex items-start gap-3">
              <ShieldCheck size={16} className="text-gold mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-dravik-dark">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 mt-0.5">Require 2FA for all admin and Principal Broker accounts.</p>
              </div>
            </div>
            <Toggle enabled={twoFA} onChange={setTwoFA} label="Two-factor authentication" />
          </div>

          {/* IP Whitelist */}
          <div className="flex items-start justify-between gap-4 py-4 border-b border-line">
            <div className="flex items-start gap-3">
              <Monitor size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-dravik-dark">IP Allowlist</p>
                <p className="text-xs text-gray-400 mt-0.5">Restrict access to known office and VPN IP addresses.</p>
                {ipLock && (
                  <p className="text-[10px] text-gold mt-1.5 font-semibold">
                    192.168.1.0/24, 10.0.0.0/24 — configured
                  </p>
                )}
              </div>
            </div>
            <Toggle enabled={ipLock} onChange={setIpLock} label="IP allowlist" />
          </div>

          {/* Session timeout */}
          <div className="flex items-start justify-between gap-4 py-4">
            <div className="flex items-start gap-3">
              <Clock size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-dravik-dark">Session Timeout</p>
                <p className="text-xs text-gray-400 mt-0.5">Auto-sign out inactive users after this period.</p>
              </div>
            </div>
            <select
              value={timeout}
              onChange={(e) => setTimeout_(e.target.value)}
              className="px-3 py-1.5 bg-surface border border-line rounded-xl text-sm text-dravik-dark focus:outline-none focus:border-gold transition"
            >
              {[["15","15 minutes"],["30","30 minutes"],["60","1 hour"],["240","4 hours"],["480","8 hours"]].map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-gold text-dravik-dark text-xs font-bold rounded-xl hover:bg-gold-dark transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Audit log */}
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h3 className="text-sm font-bold text-dravik-dark">Audit Log</h3>
            <p className="text-xs text-gray-400 mt-0.5">Recent activity across all modules.</p>
          </div>
          <div className="flex items-center gap-2">
            {[
              { s: "warning", label: "Warnings", cls: "bg-amber-50 text-amber-600 border-amber-200" },
              { s: "error",   label: "Errors",   cls: "bg-rose-50 text-rose-600 border-rose-200"   },
            ].map(({ s, label, cls }) => {
              const count = AUDIT_LOG.filter((a) => a.severity === s).length;
              return count > 0 ? (
                <span key={s} className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-full", cls)}>
                  {count} {label}
                </span>
              ) : null;
            })}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2">
              <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[160px]">Timestamp</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">User</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Action</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Module</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">IP</th>
            </tr>
          </thead>
          <tbody>
            {visibleLog.map((entry) => {
              const cfg  = SEVERITY_CFG[entry.severity];
              const Icon = cfg.icon;
              return (
                <tr key={entry.id} className={cn("border-b border-line last:border-0", cfg.row)}>
                  <td className="px-5 py-3 font-mono text-[10px] text-gray-400 whitespace-nowrap">{entry.timestamp}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-dravik-dark font-medium">{entry.user}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon size={12} className={cn("flex-shrink-0", cfg.cls)} />
                      <span className="text-xs text-dravik-dark">{entry.action}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[10px] text-gray-400">{entry.module}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-gray-400 hidden lg:table-cell">
                    {entry.ip}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {hasMore && (
          <div className="border-t border-line px-5 py-3 flex justify-center">
            <button
              onClick={() => setLogLimit((v) => Math.min(v + 10, AUDIT_LOG.length))}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-dravik-dark transition-colors"
            >
              <ChevronDown size={13} /> Load more ({AUDIT_LOG.length - logLimit} remaining)
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
