"use client";

import { useState, useCallback } from "react";
import { Save, RotateCcw, CheckCircle2, Settings } from "lucide-react";
import type { SettingsSection } from "@dravik/contracts/broker";
import SettingsSidebar    from "./SettingsSidebar";
import GeneralSettings    from "./GeneralSettings";
import PermissionsManager from "./PermissionsManager";
import CommissionBilling  from "./CommissionBilling";
import IntegrationStatus  from "./IntegrationStatus";
import CompliancePanel    from "./CompliancePanel";
import BrandingCustomizer from "./BrandingCustomizer";
import NotificationsPanel from "./NotificationsPanel";
import SecurityAuditLog   from "./SecurityAuditLog";
import { cn } from "@dravik/shared";

// ─── Section title map ────────────────────────────────────────
const SECTION_TITLES: Record<SettingsSection, { title: string; sub: string }> = {
  general:       { title: "General",              sub: "Company identity, contact info, and branding."  },
  users:         { title: "Users & Permissions",  sub: "Manage team access, roles, and invitations."   },
  commission:    { title: "Commission & Billing", sub: "Split rules, subscription, and invoice history."},
  integrations:  { title: "Integrations",         sub: "Connected services and API access."             },
  compliance:    { title: "Compliance & Docs",    sub: "License tracking, E&O insurance, and documents."},
  appearance:    { title: "Appearance",           sub: "Theme, colors, and email template preview."     },
  notifications: { title: "Notifications",        sub: "Email, SMS, and push alert preferences."        },
  security:      { title: "Security & Audit",     sub: "Authentication controls and activity log."      },
};

// ─── Toast ────────────────────────────────────────────────────
function Toast({ show }: { show: boolean }) {
  return (
    <div
      aria-live="polite"
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 bg-dravik-dark text-white text-sm font-semibold rounded-2xl shadow-2xl border border-white/10 transition-all duration-300",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <CheckCircle2 size={16} className="text-gold flex-shrink-0" />
      Settings saved successfully
    </div>
  );
}

// ─── SettingsDashboard ────────────────────────────────────────
export default function SettingsDashboard() {
  const [section,  setSection]  = useState<SettingsSection>("general");
  const [toast,    setToast]    = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleSave = useCallback(() => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }, []);

  const handleDiscard = useCallback(() => setResetKey((k) => k + 1), []);

  const { title, sub } = SECTION_TITLES[section];

  return (
    <div className="flex bg-surface" style={{ minHeight: "calc(100vh - 4rem)" }}>

      {/* Left settings nav */}
      <SettingsSidebar active={section} onSelect={setSection} />

      {/* Right content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <div className="flex-shrink-0 bg-white border-b border-line px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gold-light flex items-center justify-center flex-shrink-0">
              <Settings size={14} className="text-gold" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-dravik-dark leading-tight truncate">{title}</h2>
              <p className="text-[11px] text-gray-400 truncate">{sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-500 border border-line rounded-xl hover:text-dravik-dark hover:border-dravik-dark transition-colors"
            >
              <RotateCcw size={12} /> Discard
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold text-dravik-dark text-xs font-bold rounded-xl hover:bg-gold-dark transition-colors"
            >
              <Save size={12} /> Save Changes
            </button>
          </div>
        </div>

        {/* Scrollable content — key forces remount on Discard to reset all section state */}
        <div key={resetKey} className="flex-1 overflow-y-auto px-8 py-6">
          {/* Always-mount all sections; hide non-active with CSS */}
          <div hidden={section !== "general"}>
            <GeneralSettings onSave={handleSave} />
          </div>
          <div hidden={section !== "users"}>
            <PermissionsManager onSave={handleSave} />
          </div>
          <div hidden={section !== "commission"}>
            <CommissionBilling onSave={handleSave} />
          </div>
          <div hidden={section !== "integrations"}>
            <IntegrationStatus />
          </div>
          <div hidden={section !== "compliance"}>
            <CompliancePanel />
          </div>
          <div hidden={section !== "appearance"}>
            <BrandingCustomizer onSave={handleSave} />
          </div>
          <div hidden={section !== "notifications"}>
            <NotificationsPanel onSave={handleSave} />
          </div>
          <div hidden={section !== "security"}>
            <SecurityAuditLog onSave={handleSave} />
          </div>
        </div>
      </div>

      <Toast show={toast} />
    </div>
  );
}
