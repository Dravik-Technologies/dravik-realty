export type PropertyType =
  | "Single Family"
  | "Condo"
  | "Townhouse"
  | "Luxury Estate"
  | "Multi-Family"
  | "Land";

export type ListingStatus =
  | "Active"
  | "Pending"
  | "Coming Soon"
  | "Price Reduced";

export type ViewMode = "map" | "list";
export type SortField = "price" | "daysOnMarket" | "beds" | "sqft" | "leadScore";
export type SortDir = "asc" | "desc";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  originalPrice?: number;
  pricePerSqft: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft: number;
  yearBuilt: number;
  type: PropertyType;
  status: ListingStatus;
  daysOnMarket: number;
  coordinates: Coordinates;
  heroImage: string;
  images: string[];
  description: string;
  features: string[];
  mlsNumber: string;
  leadScore: number;
  newConstruction: boolean;
  pool: boolean;
  garage: number;
  hoaMonthly?: number;
  taxesAnnual: number;
  savedCount: number;
  viewedThisWeek: number;
  neighborhood: string;
}

export interface PropertyFilters {
  priceMin: number;
  priceMax: number;
  types: PropertyType[];
  bedsMin: number;
  bathsMin: number;
  newConstruction: boolean;
  priceReduced: boolean;
  statuses: ListingStatus[];
}

export const DEFAULT_FILTERS: PropertyFilters = {
  priceMin: 0,
  priceMax: 10_000_000,
  types: [],
  bedsMin: 0,
  bathsMin: 0,
  newConstruction: false,
  priceReduced: false,
  statuses: ["Active", "Coming Soon", "Price Reduced"],
};
