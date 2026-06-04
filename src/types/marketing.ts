export type CampaignStatus = "Active" | "Draft" | "Paused" | "Completed";
export type CampaignType   = "Landing Page" | "Squeeze Page" | "Property Site" | "Flyer";
export type MarketingTab   = "campaigns" | "pages" | "flyers" | "templates";
export type CreateNewType  = "landing-page" | "squeeze-page" | "flyer" | "property-site";

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  createdAt: string;
  lastModified: string;
  publishedUrl?: string;
  leadsGenerated: number;
  views: number;
  conversionRate: number;
  thumbnailSeed: string;
  templateId?: string;
  propertyId?: string;
}

// ─── Page Builder ─────────────────────────────────────────────
export type SectionType =
  | "hero"
  | "gallery"
  | "mortgage_cta"
  | "testimonials"
  | "contact"
  | "map"
  | "stats"
  | "agent_bio";

export interface BuilderSection {
  id: string;
  type: SectionType;
  content: Record<string, string>;
}

// ─── Templates ────────────────────────────────────────────────
export type TemplateCategory =
  | "Luxury Listing"
  | "First-Time Buyer"
  | "Home Valuation"
  | "Mortgage"
  | "Squeeze Page"
  | "Open House";

export interface PageTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  sections: SectionType[];
  thumbnailSeed: string;
  popular: boolean;
  conversionRate: string;
  usedCount: number;
}

// ─── Flyer Designer ───────────────────────────────────────────
export type FlyerLayout = "luxury" | "modern" | "classic" | "minimal";

export interface FlyerTemplate {
  id: string;
  name: string;
  layout: FlyerLayout;
  description: string;
  accentColor: string;
}

export interface FlyerContent {
  templateId: string;
  headline: string;
  subheadline: string;
  price: string;
  address: string;
  beds: string;
  baths: string;
  sqft: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  imageSeed: string;
  qrCodeUrl: string;
}
