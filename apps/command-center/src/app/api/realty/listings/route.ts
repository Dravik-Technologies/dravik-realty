import type { CommandCenterSession } from "@dravik/contracts/identity";
import type {
  ListingCreateInput,
  ManagedListing,
} from "@dravik/contracts/realty";
import {
  createListingId,
  createPersistedListing,
  isDatabaseConfigured,
  listPersistedListings,
  type CoreTenantIdentity,
} from "@dravik/database/core";
import { buildInitialListings } from "@dravik/realty/listings-data";
import { getCommandSession } from "@/auth/server";

export const runtime = "nodejs";

const localStore = globalThis as typeof globalThis & {
  __dravikListings?: Record<string, ManagedListing[]>;
};

function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

async function requireSession() {
  const session = await getCommandSession();

  if (!session) {
    return null;
  }

  if (!session.permissions.includes("realty.manage")) {
    return null;
  }

  return session;
}

function tenantFromSession(session: CommandCenterSession): CoreTenantIdentity {
  return {
    id: session.tenant.id,
    slug: session.tenant.slug,
    name: session.tenant.name,
    plan: session.tenant.plan,
    status: session.tenant.status,
  };
}

function localListings(session: CommandCenterSession) {
  localStore.__dravikListings ??= {};
  localStore.__dravikListings[session.tenant.id] ??= buildInitialListings();
  return localStore.__dravikListings[session.tenant.id];
}

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return json({
      listings: localListings(session),
      persistence: "memory",
    });
  }

  const listings = await listPersistedListings(tenantFromSession(session));
  return json({ listings, persistence: "database" });
}

export async function POST(request: Request) {
  const session = await requireSession();

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = (await request.json()) as ListingCreateInput;
  const listing = buildListing(input);

  if (!isDatabaseConfigured()) {
    localListings(session).unshift(listing);
    return json({ listing, persistence: "memory" }, { status: 201 });
  }

  const persisted = await createPersistedListing(
    tenantFromSession(session),
    listing
  );
  return json({ listing: persisted, persistence: "database" }, { status: 201 });
}

function buildListing(input: ListingCreateInput): ManagedListing {
  const price = parseNumber(input.price, 500_000);
  const sqft = parseNumber(input.sqft, 1_500);
  const beds = parseNumber(input.beds, 3);
  const baths = parseNumber(input.baths, 2);
  const city = input.city.trim();

  return {
    id: createListingId(),
    address: input.address.trim(),
    city,
    state: input.state.trim().toUpperCase() || "FL",
    zip: "",
    price,
    pricePerSqft: Math.round(price / Math.max(1, sqft)),
    beds,
    baths,
    sqft,
    lotSqft: 0,
    yearBuilt: new Date().getFullYear(),
    type: "Single Family",
    status: input.status,
    daysOnMarket: 0,
    coordinates: { lat: 25.7617, lng: -80.1918 },
    heroImage: "https://picsum.photos/seed/dravik-listing/900/600",
    images: [],
    description: input.description.trim() || "New Dravik Realty listing.",
    features: ["Dravik Realty"],
    mlsNumber: `DRV-${Date.now().toString().slice(-6)}`,
    leadScore: 50,
    newConstruction: false,
    pool: false,
    garage: 0,
    taxesAnnual: 0,
    savedCount: 0,
    viewedThisWeek: 0,
    neighborhood: city,
    sellerName: input.sellerName.trim() || "New Seller",
    agentName: input.agentName.trim() || "Chris Macabugao",
    networkVisibility: "Private",
    inquiries: 0,
    partnerInterest: 0,
    updatedAt: "just now",
  };
}

function parseNumber(value: string, fallback: number): number {
  const numeric = Number(value.replace(/,/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}
