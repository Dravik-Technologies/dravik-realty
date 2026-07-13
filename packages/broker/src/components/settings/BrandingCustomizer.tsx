"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, ImagePlus, Mail, Palette, RotateCcw, Type, Upload, X } from "lucide-react";
import { COLOR_THEMES } from "../../data/settings";
import type { ColorTheme } from "@dravik/contracts/broker";
import {
  BRAND_FONT_OPTIONS,
  DEFAULT_TENANT_BRANDING,
  normalizeTenantBranding,
  publishTenantBrandingChange,
  readTenantBrandingFromStorage,
  resolveReadableTextColor,
  writeTenantBrandingToStorage,
  cn,
  type BrandFontId,
  type TenantBranding,
} from "@dravik/shared";

const MAX_LOGO_BYTES = 3_000_000;
export const APPEARANCE_SAVE_EVENT = "dravik:appearance-save";

function findTheme(branding: TenantBranding) {
  return COLOR_THEMES.find(
    (theme) =>
      theme.primary.toLowerCase() === branding.accentColor.toLowerCase() &&
      theme.dark.toLowerCase() === branding.sidebarColor.toLowerCase()
  );
}

function buildThemeBranding(theme: ColorTheme, current: TenantBranding): TenantBranding {
  const headerColor = theme.id === "gold" ? DEFAULT_TENANT_BRANDING.headerColor : theme.primary;

  return {
    ...current,
    accentColor: theme.primary,
    headerColor,
    headerTextColor: resolveReadableTextColor(headerColor),
    sidebarColor: theme.dark,
  };
}

function commitTenantBranding(draft: TenantBranding): TenantBranding {
  const normalized = normalizeTenantBranding({
    ...draft,
    headerTextColor: resolveReadableTextColor(draft.headerColor),
  });
  writeTenantBrandingToStorage(normalized);
  publishTenantBrandingChange(normalized);
  return normalized;
}

function publishBrandingPreview(draft: TenantBranding): void {
  publishTenantBrandingChange(
    normalizeTenantBranding({
      ...draft,
      headerTextColor: resolveReadableTextColor(draft.headerColor),
    })
  );
}

// Color swatch
function Swatch({
  theme,
  active,
  onSelect,
}: {
  theme: ColorTheme;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all",
        active ? "border-gold shadow-md scale-105" : "border-line hover:border-gray-300"
      )}
    >
      <div className="flex gap-1">
        <span className="h-8 w-8 rounded-lg" style={{ background: theme.primary }} />
        <span className="h-8 w-8 rounded-lg" style={{ background: theme.dark }} />
      </div>
      <span className="text-center text-[10px] font-semibold leading-tight text-dravik-dark">
        {theme.label}
      </span>
      {active && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold">
          <Check size={11} className="text-dravik-dark" />
        </span>
      )}
    </button>
  );
}

function PreviewLogo({
  branding,
  size = "md",
}: {
  branding: TenantBranding;
  size?: "sm" | "md" | "lg";
}) {
  const isSmall = size === "sm";
  const isLarge = size === "lg";

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#FDFDFD_0%,#E5E4E2_38%,#D1CFCF_66%,#AEB6BF_100%)] shadow-[0_8px_18px_rgba(17,20,24,0.14),0_1px_0_rgba(253,253,253,0.8)_inset]",
        isSmall ? "h-8 w-8" : isLarge ? "h-28 w-40" : "h-12 w-12"
      )}
    >
      {branding.logoDataUrl ? (
        <Image
          src={branding.logoDataUrl}
          alt={branding.companyName || "Company logo"}
          width={isLarge ? 192 : 80}
          height={isLarge ? 128 : 80}
          unoptimized
          className="h-full w-full object-contain drop-shadow-[0_3px_6px_rgba(17,20,24,0.18)]"
          draggable={false}
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            "font-black leading-none text-[#2F2F2F]",
            isSmall ? "text-sm" : isLarge ? "text-4xl" : "text-[1.35rem]"
          )}
        >
          {branding.companyInitials || DEFAULT_TENANT_BRANDING.companyInitials}
        </span>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(253,253,253,0.54),rgba(253,253,253,0.08)_38%,rgba(47,47,47,0.1)_100%)]"
      />
    </span>
  );
}

function ShellPreview({ branding }: { branding: TenantBranding }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div
        className="flex items-center gap-3 border-b border-[#D1CFCF]/80 px-4 py-3"
        style={{ background: branding.headerColor, color: branding.headerTextColor }}
      >
        <PreviewLogo branding={branding} />
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
            {branding.companyName}
          </p>
          <p className="truncate text-sm font-black">Dashboard</p>
        </div>
        <div className="ml-auto hidden h-8 w-36 rounded-xl border border-black/10 bg-white/65 sm:block" />
      </div>
      <div className="flex min-h-36">
        <div className="w-24 p-3" style={{ background: branding.sidebarColor }}>
          <div className="mb-3 h-2 w-12 rounded-full bg-white/25" />
          <div className="space-y-2">
            <div className="h-7 rounded-lg" style={{ background: `${branding.accentColor}26` }} />
            <div className="h-7 rounded-lg bg-white/5" />
            <div className="h-7 rounded-lg bg-white/5" />
          </div>
        </div>
        <div className="flex-1 space-y-3 bg-surface p-4">
          <div className="h-4 w-36 rounded-full" style={{ background: `${branding.accentColor}44` }} />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 rounded-xl border border-line bg-white" />
            <div className="h-16 rounded-xl border border-line bg-white" />
          </div>
          <button
            type="button"
            className="rounded-xl px-4 py-2 text-xs font-bold text-dravik-dark"
            style={{ background: branding.accentColor }}
          >
            Primary Action
          </button>
        </div>
      </div>
    </div>
  );
}

function EmailPreview({ branding }: { branding: TenantBranding }) {
  return (
    <div className="mx-auto max-w-sm rounded-2xl bg-surface-2 p-4">
      <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        Email Template Preview
      </p>
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="flex h-10 items-center gap-2 px-4" style={{ background: branding.sidebarColor }}>
          <PreviewLogo branding={branding} size="sm" />
          <span className="text-xs font-bold text-white/90">{branding.companyName}</span>
        </div>
        <div className="space-y-2 px-5 py-4">
          <div className="h-3.5 rounded" style={{ background: `${branding.accentColor}33`, width: "60%" }} />
          <div className="h-2 w-full rounded bg-gray-100" />
          <div className="h-2 w-4/5 rounded bg-gray-100" />
          <div className="h-2 w-3/5 rounded bg-gray-100" />
          <div className="pt-2">
            <div className="inline-flex items-center rounded-lg px-4 py-1.5 text-xs font-bold text-dravik-dark" style={{ background: branding.accentColor }}>
              View Details
            </div>
          </div>
        </div>
        <div className="border-t border-line px-5 py-3">
          <div className="mx-auto h-2 w-1/2 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function BrandingCustomizer({ onSave }: { onSave: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewReadyRef = useRef(false);
  const skipNextPreviewRef = useRef(true);
  const [draft, setDraft] = useState<TenantBranding>(DEFAULT_TENANT_BRANDING);
  const [activeTheme, setActiveTheme] = useState("gold");
  const [useCustom, setUseCustom] = useState(false);
  const [logoError, setLogoError] = useState("");

  useEffect(() => {
    const stored = readTenantBrandingFromStorage();
    const matched = findTheme(stored);
    setDraft(stored);
    setActiveTheme(matched?.id ?? "gold");
    setUseCustom(!matched);
    publishTenantBrandingChange(stored);
    previewReadyRef.current = true;
    skipNextPreviewRef.current = true;
  }, []);

  useEffect(() => {
    if (!previewReadyRef.current) return;
    if (skipNextPreviewRef.current) {
      skipNextPreviewRef.current = false;
      return;
    }

    publishBrandingPreview(draft);
  }, [draft]);

  function updateDraft(update: Partial<TenantBranding>) {
    setDraft((current) => ({ ...current, ...update }));
  }

  function handleThemeSelect(id: string) {
    const theme = COLOR_THEMES.find((item) => item.id === id) ?? COLOR_THEMES[0];
    setActiveTheme(theme.id);
    setUseCustom(false);
    setDraft((current) => buildThemeBranding(theme, current));
  }

  function handleCustomAccent(value: string) {
    setActiveTheme("custom");
    setUseCustom(true);
    updateDraft({ accentColor: value });
  }

  useEffect(() => {
    function handleExternalSave() {
      setDraft(commitTenantBranding(draft));
    }

    window.addEventListener(APPEARANCE_SAVE_EVENT, handleExternalSave);
    return () => window.removeEventListener(APPEARANCE_SAVE_EVENT, handleExternalSave);
  }, [draft]);

  function handleLogoFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Choose a PNG, JPG, WEBP, or SVG file.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setLogoError("Choose an image under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoError("");
      updateDraft({ logoDataUrl: typeof reader.result === "string" ? reader.result : null });
    };
    reader.onerror = () => setLogoError("Logo upload failed.");
    reader.readAsDataURL(file);
  }

  function handleApply() {
    setDraft(commitTenantBranding(draft));
    onSave();
  }

  function handleReset() {
    setDraft(DEFAULT_TENANT_BRANDING);
    setActiveTheme("gold");
    setUseCustom(false);
    setLogoError("");
    writeTenantBrandingToStorage(DEFAULT_TENANT_BRANDING);
    publishTenantBrandingChange(DEFAULT_TENANT_BRANDING);
    onSave();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <Palette size={16} className="text-gold" />
              <div>
                <h3 className="text-sm font-bold text-dravik-dark">Color Theme</h3>
                <p className="mt-0.5 text-xs text-gray-400">Applied to the header, sidebar, buttons, and accents.</p>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-3">
              {COLOR_THEMES.map((theme) => (
                <Swatch
                  key={theme.id}
                  theme={theme}
                  active={activeTheme === theme.id && !useCustom}
                  onSelect={handleThemeSelect}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="rounded-xl bg-surface-2 p-4">
                <span className="mb-2 block text-xs font-semibold text-dravik-dark">Accent</span>
                <div className="flex items-center gap-3">
                  <input
                    aria-label="Custom accent color"
                    type="color"
                    value={draft.accentColor}
                    onChange={(event) => handleCustomAccent(event.target.value)}
                    className="h-8 w-12 cursor-pointer rounded border border-line bg-white"
                  />
                  <span className="font-mono text-xs text-gray-500">{draft.accentColor.toUpperCase()}</span>
                </div>
              </label>
              <label className="rounded-xl bg-surface-2 p-4">
                <span className="mb-2 block text-xs font-semibold text-dravik-dark">Header</span>
                <div className="flex items-center gap-3">
                  <input
                    aria-label="Header color"
                    type="color"
                    value={draft.headerColor}
                    onChange={(event) => {
                      const headerColor = event.target.value;
                      updateDraft({
                        headerColor,
                        headerTextColor: resolveReadableTextColor(headerColor),
                      });
                    }}
                    className="h-8 w-12 cursor-pointer rounded border border-line bg-white"
                  />
                  <span className="font-mono text-xs text-gray-500">{draft.headerColor.toUpperCase()}</span>
                </div>
              </label>
              <label className="rounded-xl bg-surface-2 p-4">
                <span className="mb-2 block text-xs font-semibold text-dravik-dark">Sidebar</span>
                <div className="flex items-center gap-3">
                  <input
                    aria-label="Sidebar color"
                    type="color"
                    value={draft.sidebarColor}
                    onChange={(event) => updateDraft({ sidebarColor: event.target.value })}
                    className="h-8 w-12 cursor-pointer rounded border border-line bg-white"
                  />
                  <span className="font-mono text-xs text-gray-500">{draft.sidebarColor.toUpperCase()}</span>
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <Type size={16} className="text-gold" />
              <div>
                <h3 className="text-sm font-bold text-dravik-dark">Typography</h3>
                <p className="mt-0.5 text-xs text-gray-400">Controls the app shell and feature surfaces.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {BRAND_FONT_OPTIONS.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => updateDraft({ fontId: font.id as BrandFontId })}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
                    draft.fontId === font.id
                      ? "border-gold bg-gold-light text-dravik-dark"
                      : "border-line bg-white text-gray-500 hover:border-gray-300"
                  )}
                  style={{ fontFamily: font.cssFamily }}
                >
                  <span className="text-sm font-bold">{font.label}</span>
                  {draft.fontId === font.id && <Check size={15} className="text-gold-dark" />}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <ImagePlus size={16} className="text-gold" />
              <div>
                <h3 className="text-sm font-bold text-dravik-dark">Logo & Identity</h3>
                <p className="mt-0.5 text-xs text-gray-400">The initials appear when no company logo is uploaded.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
              <div
                aria-label="Logo preview"
                className="flex min-h-44 items-center justify-center rounded-2xl border border-line bg-surface-2 p-4"
              >
                <PreviewLogo branding={draft} size="lg" />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-dravik-dark">Company Name</span>
                    <input
                      value={draft.companyName}
                      onChange={(event) => updateDraft({ companyName: event.target.value })}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm font-medium text-dravik-dark outline-none transition-colors focus:border-gold"
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-xs font-semibold text-dravik-dark">Initials</span>
                    <input
                      value={draft.companyInitials}
                      onChange={(event) => updateDraft({ companyInitials: event.target.value.toUpperCase() })}
                      maxLength={4}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm font-bold uppercase tracking-[0.08em] text-dravik-dark outline-none transition-colors focus:border-gold"
                    />
                  </label>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  aria-label="Tenant logo upload"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  onChange={(event) => handleLogoFile(event.target.files?.[0])}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-xs font-bold text-dravik-dark transition-colors hover:bg-gold-dark"
                  >
                    <Upload size={14} /> Upload Logo
                  </button>
                  {draft.logoDataUrl && (
                    <button
                      type="button"
                      onClick={() => updateDraft({ logoDataUrl: null })}
                      className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-dravik-dark hover:text-dravik-dark"
                    >
                      <X size={14} /> Remove Logo
                    </button>
                  )}
                </div>
                {logoError && <p className="text-xs font-semibold text-rose-500">{logoError}</p>}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-6">
            <h3 className="mb-4 text-sm font-bold text-dravik-dark">Shell Preview</h3>
            <ShellPreview branding={draft} />
          </section>

          <section className="rounded-2xl border border-line bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <Mail size={16} className="text-gold" />
              <h3 className="text-sm font-bold text-dravik-dark">Email Preview</h3>
            </div>
            <EmailPreview branding={draft} />
          </section>
        </aside>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-gray-500 transition-colors hover:border-dravik-dark hover:text-dravik-dark"
        >
          <RotateCcw size={14} /> Reset Dravik Default
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-bold text-dravik-dark transition-colors hover:bg-gold-dark"
        >
          <Check size={15} /> Apply Theme
        </button>
      </div>
    </div>
  );
}
