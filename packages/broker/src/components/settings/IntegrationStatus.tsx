"use client";

import { useState } from "react";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle,
  RefreshCw, Plug, Key, Eye, EyeOff,
} from "lucide-react";
import type { Integration, IntegStatus } from "@dravik/contracts/broker";
import { INTEGRATIONS } from "../../data/settings";
import { cn } from "@dravik/shared";

// ─── Status config ────────────────────────────────────────────
const STATUS_CFG: Record<IntegStatus, { icon: React.ElementType; label: string; cls: string; dot: string }> = {
  connected:    { icon: CheckCircle2,  label: "Connected",    cls: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
  disconnected: { icon: XCircle,       label: "Disconnected", cls: "text-gray-400 bg-gray-50 border-gray-200",          dot: "bg-gray-300"    },
  error:        { icon: AlertTriangle, label: "Error",        cls: "text-rose-600 bg-rose-50 border-rose-200",          dot: "bg-rose-400"    },
  pending:      { icon: Clock,         label: "Pending",      cls: "text-amber-600 bg-amber-50 border-amber-200",       dot: "bg-amber-400"   },
};

// ─── Category icons (emoji to avoid extra icon imports) ──────
const CATEGORY_COLORS: Record<string, string> = {
  Listings:       "#3B82F6",
  Communications: "#10B981",
  Documents:      "#8B5CF6",
  Mortgage:       "#D4AF37",
  Productivity:   "#F97316",
  Automation:     "#6366F1",
  Billing:        "#EC4899",
};

// ─── Integration card ─────────────────────────────────────────
function IntegCard({ integ, onToggle }: {
  integ:    Integration;
  onToggle: (id: string) => void;
}) {
  const cfg    = STATUS_CFG[integ.status];
  const accent = CATEGORY_COLORS[integ.category] ?? "#6B7280";

  return (
    <div className="bg-white border border-line rounded-2xl p-5 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}18` }}
          >
            <Plug size={16} style={{ color: accent }} />
          </div>
          <div>
            <p className="text-sm font-bold text-dravik-dark">{integ.name}</p>
            <p className="text-[10px] text-gray-400">{integ.provider} · {integ.category}</p>
          </div>
        </div>
        <span className={cn("flex items-center gap-1 text-[10px] font-semibold border px-2 py-0.5 rounded-full flex-shrink-0", cfg.cls)}>
          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
          {cfg.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">{integ.description}</p>

      {/* Last sync */}
      {integ.lastSync && (
        <p className="text-[10px] text-gray-400 mb-3 flex items-center gap-1">
          <RefreshCw size={9} className="text-gray-300" /> Last sync: {integ.lastSync}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(integ.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
            integ.status === "connected"
              ? "border-rose-200 text-rose-600 hover:bg-rose-50"
              : "border-gold/40 bg-gold text-dravik-dark hover:bg-gold-dark"
          )}
        >
          {integ.status === "connected" ? "Disconnect" : "Connect"}
        </button>
        <button
          disabled
          title="Integration settings coming soon"
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-line text-gray-300 cursor-not-allowed"
        >
          Settings
        </button>
        {integ.status === "error" && (
          <span className="text-[10px] text-rose-500 ml-auto">Check credentials</span>
        )}
      </div>
    </div>
  );
}

// ─── API Keys panel ───────────────────────────────────────────
function ApiKeysPanel() {
  const [showKey, setShowKey] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const key = "drv_sk_placeholder_not_configured";
  const masked = "drv_sk_" + "•".repeat(20);

  function handleCopy() {
    void navigator.clipboard.writeText(key).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Key size={15} className="text-gold" />
        <h4 className="text-sm font-bold text-dravik-dark">API Keys</h4>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Use your secret key to authenticate requests from external systems. Keep it private.
      </p>
      <div className="flex items-center gap-2 bg-surface-2 border border-line rounded-xl px-4 py-2.5 mb-3">
        <code className="flex-1 text-xs text-dravik-dark font-mono truncate">
          {showKey ? key : masked}
        </code>
        <button
          onClick={() => setShowKey((v) => !v)}
          className="text-gray-400 hover:text-dravik-dark transition-colors flex-shrink-0"
          aria-label={showKey ? "Hide API key" : "Show API key"}
        >
          {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
            copied
              ? "border-emerald-200 text-emerald-600 bg-emerald-50"
              : "border-line text-gray-500 hover:text-dravik-dark"
          )}
        >
          {copied ? "Copied!" : "Copy Key"}
        </button>
      </div>
    </div>
  );
}

// ─── IntegrationStatus ────────────────────────────────────────
export default function IntegrationStatus() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);

  function handleToggle(id: string) {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id !== id ? i : {
          ...i,
          status: i.status === "connected" ? "disconnected" : "connected",
          lastSync: i.status === "connected" ? undefined : "Just now",
        }
      )
    );
  }

  const connected = integrations.filter((i) => i.status === "connected").length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-dravik-dark">Integrations</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {connected} of {integrations.length} connected
          </p>
        </div>
        <div className="flex gap-3">
          {(["connected","error","pending","disconnected"] as IntegStatus[]).map((s) => {
            const count = integrations.filter((i) => i.status === s).length;
            if (!count) return null;
            const cfg = STATUS_CFG[s];
            return (
              <span key={s} className={cn("text-[10px] font-semibold border px-2.5 py-1 rounded-full", cfg.cls)}>
                {count} {cfg.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Integration grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map((integ) => (
          <IntegCard key={integ.id} integ={integ} onToggle={handleToggle} />
        ))}
      </div>

      {/* API keys */}
      <ApiKeysPanel />
    </div>
  );
}
