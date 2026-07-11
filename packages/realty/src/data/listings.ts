import type { ListingFormState, ManagedListing } from "@dravik/contracts/realty";
import { SAMPLE_PROPERTIES } from "./properties";

export const EMPTY_LISTING_FORM: ListingFormState = {
  address: "",
  city: "",
  state: "FL",
  price: "",
  beds: "",
  baths: "",
  sqft: "",
  status: "Coming Soon",
  sellerName: "",
  agentName: "Chris Macabugao",
  description: "",
};

export function buildInitialListings(): ManagedListing[] {
  return SAMPLE_PROPERTIES.slice(0, 8).map((property, index) => ({
    ...property,
    sellerName: ["Avery Morgan", "Patricia Chen", "Michael Rivera", "Dana Patel"][index % 4],
    agentName: ["Chris Macabugao", "Maya Thompson", "Jordan Lee"][index % 3],
    networkVisibility: index % 3 === 0 ? "Partner Network" : "Private",
    inquiries: property.viewedThisWeek + index,
    partnerInterest: property.savedCount,
    updatedAt: `${Math.max(1, property.daysOnMarket || index + 1)}d ago`,
  }));
}

export function listingToForm(listing: ManagedListing): ListingFormState {
  return {
    address: listing.address,
    city: listing.city,
    state: listing.state,
    price: String(listing.price),
    beds: String(listing.beds),
    baths: String(listing.baths),
    sqft: String(listing.sqft),
    status: listing.status,
    sellerName: listing.sellerName,
    agentName: listing.agentName,
    description: listing.description,
  };
}
