import type { ListingStatus, Property } from "./property";

export type ListingVisibility = "Private" | "Partner Network";

export interface ManagedListing extends Property {
  sellerName: string;
  agentName: string;
  ownerTenantId?: string;
  ownerTenantName?: string;
  isNetworkListing?: boolean;
  networkVisibility: ListingVisibility;
  inquiries: number;
  partnerInterest: number;
  updatedAt: string;
}

export interface ListingFormState {
  address: string;
  city: string;
  state: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  status: ListingStatus;
  sellerName: string;
  agentName: string;
  description: string;
}

export interface ListingCreateInput extends ListingFormState {}

export interface ListingUpdateInput extends Partial<ListingFormState> {
  networkVisibility?: ListingVisibility;
  status?: ListingStatus;
}
