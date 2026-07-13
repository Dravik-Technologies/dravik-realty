"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearTenantBrandingFromStorage,
  DEFAULT_TENANT_BRANDING,
  normalizeTenantBranding,
  publishTenantBrandingChange,
  readTenantBrandingFromStorage,
  resolveBrandFont,
  TENANT_BRANDING_EVENT,
  TENANT_BRANDING_STORAGE_KEY,
  writeTenantBrandingToStorage,
  type TenantBranding,
} from "@dravik/shared";

type TenantBrandingContextValue = {
  branding: TenantBranding;
  applyBranding: (branding: TenantBranding) => void;
  resetBranding: () => void;
};

const TenantBrandingContext = createContext<TenantBrandingContextValue>({
  branding: DEFAULT_TENANT_BRANDING,
  applyBranding: () => {},
  resetBranding: () => {},
});

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
  ];
}

function toHex(value: number): string {
  return Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}

function mixHex(base: string, target: string, targetWeight: number): string {
  const [baseR, baseG, baseB] = hexToRgb(base);
  const [targetR, targetG, targetB] = hexToRgb(target);
  const baseWeight = 1 - targetWeight;

  return `#${toHex(baseR * baseWeight + targetR * targetWeight)}${toHex(
    baseG * baseWeight + targetG * targetWeight
  )}${toHex(baseB * baseWeight + targetB * targetWeight)}`;
}

function toRgba(hex: string, alpha: number): string {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function applyBrandingCss(branding: TenantBranding): void {
  const root = document.documentElement;
  const normalized = normalizeTenantBranding(branding);
  const headerText = normalized.headerTextColor;

  root.style.setProperty("--brand-accent", normalized.accentColor);
  root.style.setProperty("--brand-header", normalized.headerColor);
  root.style.setProperty("--brand-header-text", headerText);
  root.style.setProperty("--brand-header-muted", toRgba(headerText, 0.78));
  root.style.setProperty("--brand-header-faint", toRgba(headerText, 0.58));
  root.style.setProperty("--brand-header-hover", toRgba(headerText, 0.1));
  root.style.setProperty("--brand-sidebar", normalized.sidebarColor);
  root.style.setProperty("--brand-font-family", resolveBrandFont(normalized.fontId));

  root.style.setProperty("--color-gold", normalized.accentColor);
  root.style.setProperty("--color-gold-light", mixHex(normalized.accentColor, "#FFFFFF", 0.82));
  root.style.setProperty("--color-gold-dark", mixHex(normalized.accentColor, "#111418", 0.38));
  root.style.setProperty("--color-dravik-dark", normalized.sidebarColor);
}

export function TenantBrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<TenantBranding>(DEFAULT_TENANT_BRANDING);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBranding(readTenantBrandingFromStorage());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyBrandingCss(branding);
  }, [branding]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== TENANT_BRANDING_STORAGE_KEY) return;
      setBranding(readTenantBrandingFromStorage());
    }

    function handleBrandingChange(event: Event) {
      const detail = (event as CustomEvent<TenantBranding>).detail;
      setBranding(normalizeTenantBranding(detail));
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(TENANT_BRANDING_EVENT, handleBrandingChange);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(TENANT_BRANDING_EVENT, handleBrandingChange);
    };
  }, []);

  const applyBranding = useCallback((nextBranding: TenantBranding) => {
    const normalized = normalizeTenantBranding(nextBranding);
    setBranding(normalized);
    writeTenantBrandingToStorage(normalized);
    publishTenantBrandingChange(normalized);
  }, []);

  const resetBranding = useCallback(() => {
    clearTenantBrandingFromStorage();
    setBranding(DEFAULT_TENANT_BRANDING);
    publishTenantBrandingChange(DEFAULT_TENANT_BRANDING);
  }, []);

  const value = useMemo(
    () => ({ branding, applyBranding, resetBranding }),
    [applyBranding, branding, resetBranding]
  );

  return (
    <TenantBrandingContext.Provider value={value}>
      {children}
    </TenantBrandingContext.Provider>
  );
}

export function useTenantBranding() {
  return useContext(TenantBrandingContext);
}
