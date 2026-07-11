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

export function buildInitialListings(ownerTenantName = "Dravik Realty", ownerTenantId = "local-tenant"): ManagedListing[] {
  return SAMPLE_PROPERTIES.slice(0, 8).map((property, index) => ({
    ...property,
    sellerName: ["Avery Morgan", "Patricia Chen", "Michael Rivera", "Dana Patel"][index % 4],
    agentName: ["Chris Macabugao", "Maya Thompson", "Jordan Lee"][index % 3],
    ownerTenantId,
    ownerTenantName,
    isNetworkListing: false,
    networkVisibility: index % 3 === 0 ? "Partner Network" : "Private",
    inquiries: property.viewedThisWeek + index,
    partnerInterest: property.savedCount,
    updatedAt: `${Math.max(1, property.daysOnMarket || index + 1)}d ago`,
  }));
}

export function buildNetworkExchangeListings(): ManagedListing[] {
  const owners = [
    { tenantId: "network-coastal-key", tenantName: "Coastal Key Realty", agentName: "Leah Morgan" },
    { tenantId: "network-summit-homes", tenantName: "Summit Homes Group", agentName: "Andre Blake" },
    { tenantId: "network-valor-estates", tenantName: "Valor Estates", agentName: "Nina Brooks" },
    { tenantId: "network-harborline", tenantName: "Harborline Properties", agentName: "Diana Rivera" },
  ];

  return SAMPLE_PROPERTIES.slice(8, 12).map((property, index) => {
    const owner = owners[index % owners.length];

    return {
      ...property,
      id: `network-${property.id}`,
      sellerName: "Network Seller",
      agentName: owner.agentName,
      ownerTenantId: owner.tenantId,
      ownerTenantName: owner.tenantName,
      isNetworkListing: true,
      networkVisibility: "Partner Network",
      inquiries: property.viewedThisWeek + 12 + index,
      partnerInterest: property.savedCount + 3,
      updatedAt: `${Math.max(1, property.daysOnMarket || index + 2)}d ago`,
    };
  });
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
