export type BrandFontId = "modern" | "system" | "serif" | "compact";

export interface TenantBranding {
  companyName: string;
  companyInitials: string;
  accentColor: string;
  headerColor: string;
  headerTextColor: string;
  sidebarColor: string;
  fontId: BrandFontId;
  logoDataUrl: string | null;
}

export const TENANT_BRANDING_STORAGE_KEY = "dravik.tenant-branding.v1";
export const TENANT_BRANDING_EVENT = "dravik:tenant-branding-change";

export const BRAND_FONT_OPTIONS: readonly {
  id: BrandFontId;
  label: string;
  cssFamily: string;
}[] = [
  {
    id: "modern",
    label: "Modern Sans",
    cssFamily: "var(--font-manrope), Arial, Helvetica, sans-serif",
  },
  {
    id: "system",
    label: "System UI",
    cssFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  {
    id: "serif",
    label: "Editorial Serif",
    cssFamily: "Georgia, 'Times New Roman', serif",
  },
  {
    id: "compact",
    label: "Compact Sans",
    cssFamily: "'Arial Narrow', var(--font-manrope), Arial, Helvetica, sans-serif",
  },
];

export const DEFAULT_TENANT_BRANDING: TenantBranding = {
  companyName: "Dravik Realty",
  companyInitials: "DR",
  accentColor: "#C9C3B6",
  headerColor: "#E5E4E2",
  headerTextColor: "#2F2F2F",
  sidebarColor: "#111418",
  fontId: "modern",
  logoDataUrl: null,
};

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const FONT_IDS = new Set(BRAND_FONT_OPTIONS.map((option) => option.id));

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR_RE.test(value);
}

export function resolveBrandFont(fontId: BrandFontId): string {
  return (
    BRAND_FONT_OPTIONS.find((option) => option.id === fontId)?.cssFamily ??
    BRAND_FONT_OPTIONS[0].cssFamily
  );
}

export function normalizeTenantBranding(input: Partial<TenantBranding> | null | undefined): TenantBranding {
  const source = input ?? {};
  const companyName =
    typeof source.companyName === "string" && source.companyName.trim()
      ? source.companyName.trim().slice(0, 80)
      : DEFAULT_TENANT_BRANDING.companyName;
  const companyInitials =
    typeof source.companyInitials === "string" && source.companyInitials.trim()
      ? source.companyInitials.trim().slice(0, 4).toUpperCase()
      : DEFAULT_TENANT_BRANDING.companyInitials;
  const fontId =
    typeof source.fontId === "string" && FONT_IDS.has(source.fontId)
      ? source.fontId
      : DEFAULT_TENANT_BRANDING.fontId;
  const logoDataUrl =
    typeof source.logoDataUrl === "string" && source.logoDataUrl.startsWith("data:image/")
      ? source.logoDataUrl
      : null;

  return {
    companyName,
    companyInitials,
    accentColor: isValidHexColor(source.accentColor ?? "")
      ? source.accentColor!
      : DEFAULT_TENANT_BRANDING.accentColor,
    headerColor: isValidHexColor(source.headerColor ?? "")
      ? source.headerColor!
      : DEFAULT_TENANT_BRANDING.headerColor,
    headerTextColor: isValidHexColor(source.headerTextColor ?? "")
      ? source.headerTextColor!
      : DEFAULT_TENANT_BRANDING.headerTextColor,
    sidebarColor: isValidHexColor(source.sidebarColor ?? "")
      ? source.sidebarColor!
      : DEFAULT_TENANT_BRANDING.sidebarColor,
    fontId,
    logoDataUrl,
  };
}

export function readTenantBrandingFromStorage(): TenantBranding {
  if (typeof window === "undefined") return DEFAULT_TENANT_BRANDING;

  try {
    const raw = window.localStorage.getItem(TENANT_BRANDING_STORAGE_KEY);
    if (!raw) return DEFAULT_TENANT_BRANDING;
    const parsed = JSON.parse(raw) as Partial<TenantBranding>;
    return normalizeTenantBranding(parsed);
  } catch {
    return DEFAULT_TENANT_BRANDING;
  }
}

export function writeTenantBrandingToStorage(branding: TenantBranding): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    TENANT_BRANDING_STORAGE_KEY,
    JSON.stringify(normalizeTenantBranding(branding))
  );
}

export function clearTenantBrandingFromStorage(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TENANT_BRANDING_STORAGE_KEY);
}

export function publishTenantBrandingChange(branding: TenantBranding): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<TenantBranding>(TENANT_BRANDING_EVENT, { detail: branding }));
}
