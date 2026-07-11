"use client";

import { useState } from "react";
import { Check, Mail, Palette } from "lucide-react";
import { COLOR_THEMES } from "../../data/settings";
import type { ColorTheme } from "@dravik/contracts/broker";
import { cn } from "@dravik/shared";

// ─── Color swatch ─────────────────────────────────────────────
function Swatch({ theme, active, onSelect }: {
  theme:    ColorTheme;
  active:   boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(theme.id)}
      className={cn(
        "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
        active ? "border-gold shadow-md scale-105" : "border-line hover:border-gray-300"
      )}
    >
      {/* Color preview */}
      <div className="flex gap-1">
        <div className="w-8 h-8 rounded-lg" style={{ background: theme.primary }} />
        <div className="w-8 h-8 rounded-lg" style={{ background: theme.dark }} />
      </div>
      <p className="text-[10px] font-semibold text-dravik-dark text-center leading-tight">{theme.label}</p>
      {active && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
          <Check size={11} className="text-dravik-dark" />
        </span>
      )}
    </button>
  );
}

// ─── Email template preview ───────────────────────────────────
function EmailPreview({ primary, dark }: { primary: string; dark: string }) {
  return (
    <div className="bg-surface-2 rounded-2xl p-4 max-w-sm mx-auto">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-3 text-center">
        Email Template Preview
      </p>
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-line">
        {/* Header band */}
        <div className="h-10 flex items-center px-4 gap-2" style={{ background: dark }}>
          <div className="w-6 h-6 rounded border flex items-center justify-center" style={{ borderColor: `${primary}40`, background: `${primary}10` }}>
            <span className="font-bold text-xs leading-none" style={{ color: primary }}>DR</span>
          </div>
          <span className="text-xs font-bold text-white/90">Dravik Realty</span>
        </div>
        {/* Body */}
        <div className="px-5 py-4 space-y-2">
          <div className="h-3.5 rounded" style={{ background: `${primary}22`, width: "60%" }} />
          <div className="h-2 bg-gray-100 rounded w-full" />
          <div className="h-2 bg-gray-100 rounded w-4/5" />
          <div className="h-2 bg-gray-100 rounded w-3/5" />
          {/* CTA button */}
          <div className="pt-2">
            <div className="inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: primary }}>
              View Details
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="px-5 py-3 border-t border-line">
          <div className="h-2 bg-gray-100 rounded w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// ─── BrandingCustomizer ───────────────────────────────────────
export default function BrandingCustomizer({ onSave }: { onSave: () => void }) {
  const [activeTheme, setActiveTheme] = useState("gold");
  const [customHex,   setCustomHex]   = useState("#D4AF37");
  const [useCustom,   setUseCustom]   = useState(false);

  const selectedTheme = COLOR_THEMES.find((t) => t.id === activeTheme) ?? COLOR_THEMES[0];
  const displayPrimary = useCustom ? customHex : selectedTheme.primary;
  const displayDark    = selectedTheme.dark;

  function handleThemeSelect(id: string) {
    setActiveTheme(id);
    setUseCustom(false);
  }

  function handleCustomHex(v: string) {
    setCustomHex(v);
    setUseCustom(true);
  }

  return (
    <div className="space-y-6">

      {/* Theme picker */}
      <div className="bg-white border border-line rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette size={16} className="text-gold" />
          <div>
            <h3 className="text-sm font-bold text-dravik-dark">Color Theme</h3>
            <p className="text-xs text-gray-400 mt-0.5">Applied to sidebar, buttons, and accents across the platform.</p>
          </div>
        </div>

        {/* Preset swatches */}
        <div className="flex flex-wrap gap-3 mb-5">
          {COLOR_THEMES.map((theme) => (
            <Swatch
              key={theme.id}
              theme={theme}
              active={activeTheme === theme.id && !useCustom}
              onSelect={handleThemeSelect}
            />
          ))}
        </div>

        {/* Custom hex */}
        <div className="flex items-center gap-3 p-4 bg-surface-2 rounded-xl">
          <div
            className="w-8 h-8 rounded-lg border border-line flex-shrink-0"
            style={{ background: customHex }}
          />
          <div className="flex-1">
            <p className="text-xs font-semibold text-dravik-dark mb-1">Custom Accent Color</p>
            <input
              type="color"
              value={customHex}
              onChange={(e) => handleCustomHex(e.target.value)}
              className="h-7 w-20 rounded cursor-pointer border border-line bg-white"
              title="Pick a custom brand color"
            />
          </div>
          <span className="text-xs text-gray-400 font-mono">{customHex.toUpperCase()}</span>
          {useCustom && (
            <span className="text-[10px] font-semibold text-gold border border-gold/30 bg-gold-light px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Email preview */}
      <div className="bg-white border border-line rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Mail size={16} className="text-gold" />
          <div>
            <h3 className="text-sm font-bold text-dravik-dark">Email Template Preview</h3>
            <p className="text-xs text-gray-400 mt-0.5">Outbound emails use your active brand colors.</p>
          </div>
        </div>
        <EmailPreview primary={displayPrimary} dark={displayDark} />
      </div>

      {/* Typography + logo notes */}
      <div className="bg-white border border-line rounded-2xl p-6">
        <h3 className="text-sm font-bold text-dravik-dark mb-3">Typography & Assets</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Primary Font",    value: "Geist Sans",      locked: true  },
            { label: "Monospace Font",  value: "Geist Mono",      locked: true  },
            { label: "Logo (Light BG)", value: "dravik-logo.svg",   locked: false },
            { label: "Logo (Dark BG)",  value: "dravik-logo-inv.svg",locked: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between bg-surface-2 rounded-xl px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-dravik-dark">{item.label}</p>
                <p className="text-[10px] text-gray-400">{item.value}</p>
              </div>
              {item.locked ? (
                <span className="text-[10px] text-gray-300 border border-gray-200 px-2 py-0.5 rounded">Locked</span>
              ) : (
                <button disabled title="Logo upload coming soon" className="text-[10px] font-semibold text-gray-300 cursor-not-allowed">Replace</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={onSave}
          className="px-5 py-2.5 bg-gold text-dravik-dark text-sm font-bold rounded-xl hover:bg-gold-dark transition-colors"
        >
          Apply Theme
        </button>
      </div>
    </div>
  );
}
