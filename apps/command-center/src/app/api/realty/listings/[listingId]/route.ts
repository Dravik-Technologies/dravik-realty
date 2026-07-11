import type { CommandCenterSession } from "@dravik/contracts/identity";
import type {
  ListingUpdateInput,
  ManagedListing,
} from "@dravik/contracts/realty";
import {
  archivePersistedListing,
  isDatabaseConfigured,
  updatePersistedListing,
  type CoreTenantIdentity,
} from "@dravik/database/core";
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
  localStore.__dravikListings[session.tenant.id] ??= [];
  return localStore.__dravikListings[session.tenant.id];
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ listingId: string }> }
) {
  const session = await requireSession();

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await context.params;
  const patch = (await request.json()) as ListingUpdateInput;

  if (!isDatabaseConfigured()) {
    const listings = localListings(session);
    const index = listings.findIndex((listing) => listing.id === listingId);

    if (index === -1) {
      return json({ error: "Not found" }, { status: 404 });
    }

    listings[index] = applyPatch(listings[index], patch);
    return json({ listing: listings[index], persistence: "memory" });
  }

  const listing = await updatePersistedListing(
    tenantFromSession(session),
    listingId,
    patch
  );

  if (!listing) {
    return json({ error: "Not found" }, { status: 404 });
  }

  return json({ listing, persistence: "database" });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ listingId: string }> }
) {
  const session = await requireSession();

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listingId } = await context.params;

  if (!isDatabaseConfigured()) {
    const listings = localListings(session);
    const index = listings.findIndex((listing) => listing.id === listingId);

    if (index === -1) {
      return json({ error: "Not found" }, { status: 404 });
    }

    listings.splice(index, 1);
    return json({ ok: true, persistence: "memory" });
  }

  const archived = await archivePersistedListing(
    tenantFromSession(session),
    listingId
  );

  if (!archived) {
    return json({ error: "Not found" }, { status: 404 });
  }

  return json({ ok: true, persistence: "database" });
}

function applyPatch(
  listing: ManagedListing,
  patch: ListingUpdateInput
): ManagedListing {
  const price = parseNumber(patch.price, listing.price);
  const sqft = parseNumber(patch.sqft, listing.sqft);

  return {
    ...listing,
    address: patch.address?.trim() || listing.address,
    city: patch.city?.trim() || listing.city,
    state: patch.state?.trim().toUpperCase() || listing.state,
    price,
    pricePerSqft: Math.round(price / Math.max(1, sqft)),
    beds: parseNumber(patch.beds, listing.beds),
    baths: parseNumber(patch.baths, listing.baths),
    sqft,
    status: patch.status ?? listing.status,
    networkVisibility: patch.networkVisibility ?? listing.networkVisibility,
    sellerName: patch.sellerName?.trim() || listing.sellerName,
    agentName: patch.agentName?.trim() || listing.agentName,
    description: patch.description?.trim() || listing.description,
    neighborhood: patch.city?.trim() || listing.neighborhood,
    updatedAt: "just now",
  };
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const numeric = Number(value.replace(/,/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}
