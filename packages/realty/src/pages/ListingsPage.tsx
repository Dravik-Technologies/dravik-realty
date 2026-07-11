"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  Bookmark,
  Building2,
  CheckCircle2,
  DollarSign,
  Edit3,
  Eye,
  Home,
  Plus,
  Search,
  Share2,
  Users,
  X,
  Loader2,
} from "lucide-react";
import type {
  ListingFormState,
  ListingStatus,
  ListingUpdateInput,
  ListingVisibility,
  ManagedListing,
} from "@dravik/contracts/realty";
import { EMPTY_LISTING_FORM, listingToForm } from "../data/listings";
import { cn, formatCurrency } from "@dravik/shared";

type StatusFilter = "All" | ListingStatus;
type VisibilityFilter = "All" | ListingVisibility;
type ListingView = "mine" | "network";

const STATUS_OPTIONS: ListingStatus[] = ["Active", "Coming Soon", "Pending", "Price Reduced"];

const STATUS_STYLES: Record<ListingStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Coming Soon": "bg-blue-50 text-blue-700 border-blue-200",
  Pending: "bg-violet-50 text-violet-700 border-violet-200",
  "Price Reduced": "bg-amber-50 text-amber-700 border-amber-200",
};

function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return formatCurrency(amount);
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? "Listing request failed");
  }

  return response.json() as Promise<T>;
}

async function fetchListings() {
  return parseApiResponse<{
    listings: ManagedListing[];
    persistence: string;
  }>(await fetch("/api/realty/listings", { cache: "no-store" }));
}

async function createListing(input: ListingFormState) {
  return parseApiResponse<{
    listing: ManagedListing;
    persistence: string;
  }>(
    await fetch("/api/realty/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
}

async function updateListing(id: string, patch: ListingUpdateInput) {
  return parseApiResponse<{
    listing: ManagedListing;
    persistence: string;
  }>(
    await fetch(`/api/realty/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
  );
}

async function archiveListingRequest(id: string) {
  return parseApiResponse<{ ok: boolean; persistence: string }>(
    await fetch(`/api/realty/listings/${id}`, { method: "DELETE" })
  );
}

function statusAction(status: ListingStatus): { label: string; next: ListingStatus } {
  if (status === "Pending") return { label: "Mark Active", next: "Active" };
  if (status === "Coming Soon") return { label: "Go Active", next: "Active" };
  return { label: "Mark Pending", next: "Pending" };
}

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-line p-5 flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold text-dravik-dark leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
        <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">{sub}</p>
      </div>
    </div>
  );
}

function ListingCard({
  listing,
  selected,
  onSelect,
  onEdit,
  onArchive,
  onToggleVisibility,
  onUpdateStatus,
  saved,
  onToggleSaved,
}: {
  listing: ManagedListing;
  selected: boolean;
  onSelect: (listing: ManagedListing) => void;
  onEdit: (listing: ManagedListing) => void;
  onArchive: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onUpdateStatus: (id: string, status: ListingStatus) => void;
  saved: boolean;
  onToggleSaved: (id: string) => void;
}) {
  const action = statusAction(listing.status);
  const isShared = listing.networkVisibility === "Partner Network";
  const isExternal = listing.isNetworkListing === true;
  const sourceName = listing.ownerTenantName ?? "Partner Brokerage";

  return (
    <article
      className={cn(
        "bg-white rounded-2xl border p-5 space-y-4 transition-all",
        selected ? "border-gold shadow-lg shadow-gold/10" : "border-line card-lift"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", STATUS_STYLES[listing.status])}>
              {listing.status}
            </span>
            {isShared && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-gold/40 bg-gold-light text-gold-dark">
                {isExternal ? "Network Listing" : "Partner Network"}
              </span>
            )}
            {isExternal && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                {sourceName}
              </span>
            )}
          </div>
          <h2 className="mt-3 text-base font-bold text-dravik-dark leading-tight">{listing.address}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {listing.city}, {listing.state} {listing.zip}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0">
          <Home size={20} className="text-gold" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-surface rounded-xl p-3">
        <div>
          <p className="text-sm font-bold text-dravik-dark">{listing.beds}</p>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Beds</p>
        </div>
        <div className="border-x border-line px-2">
          <p className="text-sm font-bold text-dravik-dark">{listing.baths}</p>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Baths</p>
        </div>
        <div>
          <p className="text-sm font-bold text-dravik-dark">{listing.sqft.toLocaleString()}</p>
          <p className="text-[10px] uppercase tracking-wide text-gray-400">Sq Ft</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-dravik-dark">{formatCurrency(listing.price)}</span>
        <span className="text-xs text-gray-400">Updated {listing.updatedAt}</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Eye size={12} className="text-gray-400" />
          {listing.inquiries} views
        </span>
        <span className="inline-flex items-center gap-1">
          <Users size={12} className="text-gray-400" />
          {listing.partnerInterest} partner saves
        </span>
      </div>

      <div className={cn("grid grid-cols-2 gap-2 pt-1", isExternal ? "sm:grid-cols-2" : "sm:grid-cols-5")}>
        <button
          type="button"
          onClick={() => onSelect(listing)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-bold text-gray-600 hover:bg-surface transition-colors"
        >
          <Eye size={13} />
          Details
        </button>
        {isExternal ? (
          <button
            type="button"
            onClick={() => onToggleSaved(listing.id)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors",
              saved
                ? "border border-gold/40 bg-gold-light text-gold-dark"
                : "bg-dravik-dark text-white hover:bg-dravik-navy"
            )}
          >
            <Bookmark size={13} />
            {saved ? "Saved" : "Save"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(listing)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-bold text-gray-600 hover:bg-surface transition-colors"
            >
              <Edit3 size={13} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => onToggleVisibility(listing.id)}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors",
                isShared
                  ? "border border-line text-gray-600 hover:bg-surface"
                  : "bg-dravik-dark text-white hover:bg-dravik-navy"
              )}
            >
              <Share2 size={13} />
              {isShared ? "Make Private" : "Share"}
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(listing.id, action.next)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold text-white px-3 py-2 text-xs font-bold hover:bg-gold-dark transition-colors"
            >
              <CheckCircle2 size={13} />
              {action.label}
            </button>
            <button
              type="button"
              onClick={() => onArchive(listing.id)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-100 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <Archive size={13} />
              Archive
            </button>
          </>
        )}
      </div>
    </article>
  );
}

function AddListingModal({
  open,
  mode,
  form,
  submitting,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "add" | "edit";
  form: ListingFormState;
  submitting: boolean;
  onChange: (patch: Partial<ListingFormState>) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-dravik-dark/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <form
        onSubmit={onSubmit}
        className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col bg-white rounded-2xl border border-line shadow-2xl overflow-hidden animate-slide-up"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-line">
          <div>
            <h2 className="text-lg font-bold text-dravik-dark">{mode === "add" ? "Add Listing" : "Edit Listing"}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{mode === "add" ? "Private by default" : "Update listing details"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add listing"
            className="p-2 rounded-xl text-gray-400 hover:text-dravik-dark hover:bg-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-gray-500">Address</span>
            <input
              required
              value={form.address}
              onChange={(event) => onChange({ address: event.target.value })}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">City</span>
            <input
              required
              value={form.city}
              onChange={(event) => onChange({ city: event.target.value })}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">State</span>
            <input
              required
              maxLength={2}
              value={form.state}
              onChange={(event) => onChange({ state: event.target.value.toUpperCase() })}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Price</span>
            <input
              required
              inputMode="numeric"
              value={form.price}
              onChange={(event) => onChange({ price: event.target.value })}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Status</span>
            <select
              value={form.status}
              onChange={(event) => onChange({ status: event.target.value as ListingStatus })}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Beds</span>
            <input
              required
              inputMode="numeric"
              value={form.beds}
              onChange={(event) => onChange({ beds: event.target.value })}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Baths</span>
            <input
              required
              inputMode="decimal"
              value={form.baths}
              onChange={(event) => onChange({ baths: event.target.value })}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-gray-500">Square Feet</span>
            <input
              required
              inputMode="numeric"
              value={form.sqft}
              onChange={(event) => onChange({ sqft: event.target.value })}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Seller</span>
            <input
              value={form.sellerName}
              onChange={(event) => onChange({ sellerName: event.target.value })}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label>
            <span className="text-xs font-bold text-gray-500">Agent</span>
            <input
              value={form.agentName}
              onChange={(event) => onChange({ agentName: event.target.value })}
              className="mt-1 w-full rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-bold text-gray-500">Description</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => onChange({ description: event.target.value })}
              className="mt-1 w-full resize-none rounded-xl border border-line px-3 py-2.5 text-sm text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
        </div>

        <div className="flex flex-shrink-0 items-center justify-end gap-3 px-6 py-5 border-t border-line bg-surface">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-line text-sm font-semibold text-gray-600 hover:bg-surface-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dravik-dark text-white text-sm font-bold hover:bg-dravik-navy transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {submitting ? "Saving..." : "Save Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ListingsPage() {
  const [listings, setListings] = useState<ManagedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ListingView>("mine");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("All");
  const [savedNetworkIds, setSavedNetworkIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ListingFormState>(EMPTY_LISTING_FORM);

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchListings();
      setListings(payload.listings);
      setSelectedId((current) => current ?? payload.listings[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const ownListings = useMemo(() => listings.filter((listing) => listing.isNetworkListing !== true), [listings]);
  const networkListings = useMemo(
    () => listings.filter((listing) => listing.networkVisibility === "Partner Network"),
    [listings]
  );
  const scopedListings = view === "mine" ? ownListings : networkListings;

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scopedListings.filter((listing) => {
      const matchesQuery =
        !q ||
        listing.address.toLowerCase().includes(q) ||
        listing.city.toLowerCase().includes(q) ||
        listing.neighborhood.toLowerCase().includes(q) ||
        listing.sellerName.toLowerCase().includes(q) ||
        listing.agentName.toLowerCase().includes(q) ||
        listing.ownerTenantName?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || listing.status === statusFilter;
      const matchesVisibility = visibilityFilter === "All" || listing.networkVisibility === visibilityFilter;
      return matchesQuery && matchesStatus && matchesVisibility;
    });
  }, [scopedListings, query, statusFilter, visibilityFilter]);

  const selectedListing = scopedListings.find((listing) => listing.id === selectedId) ?? filteredListings[0] ?? null;
  const sharedCount = networkListings.length;
  const externalNetworkCount = listings.filter((listing) => listing.isNetworkListing === true).length;
  const activeCount = ownListings.filter((listing) => listing.status === "Active").length;
  const totalVolume = scopedListings.reduce((sum, listing) => sum + listing.price, 0);
  const partnerInterest = ownListings.reduce((sum, listing) => sum + listing.partnerInterest, 0) + savedNetworkIds.size;

  function updateForm(patch: Partial<ListingFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function openAddListing() {
    setView("mine");
    setModalMode("add");
    setEditingId(null);
    setForm(EMPTY_LISTING_FORM);
    setModalOpen(true);
  }

  function openEditListing(listing: ManagedListing) {
    setSelectedId(listing.id);
    setModalMode("edit");
    setEditingId(listing.id);
    setForm(listingToForm(listing));
    setModalOpen(true);
  }

  function replaceListing(nextListing: ManagedListing) {
    setListings((current) =>
      current.map((listing) => listing.id === nextListing.id ? nextListing : listing)
    );
  }

  function toggleSavedNetworkListing(id: string) {
    setSavedNetworkIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function toggleVisibility(id: string) {
    const listing = listings.find((item) => item.id === id);

    if (!listing) {
      return;
    }

    setError(null);
    try {
      const nextVisibility = listing.networkVisibility === "Partner Network" ? "Private" : "Partner Network";
      const payload = await updateListing(id, { networkVisibility: nextVisibility });
      replaceListing(payload.listing);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update listing visibility.");
    }
  }

  async function updateStatus(id: string, status: ListingStatus) {
    setError(null);
    try {
      const payload = await updateListing(id, { status });
      replaceListing(payload.listing);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update listing status.");
    }
  }

  async function archiveListing(id: string) {
    setError(null);
    try {
      await archiveListingRequest(id);
      setListings((current) => current.filter((listing) => listing.id !== id));
      setSelectedId((current) => current === id ? null : current);
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to archive listing.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (modalMode === "edit" && editingId) {
        const payload = await updateListing(editingId, form);
        replaceListing(payload.listing);
        setSelectedId(payload.listing.id);
      } else {
        const payload = await createListing(form);
        setListings((current) => [payload.listing, ...current]);
        setSelectedId(payload.listing.id);
      }

      setForm(EMPTY_LISTING_FORM);
      setEditingId(null);
      setModalOpen(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface min-h-full">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-1 h-7 rounded-full bg-gold inline-block" />
            <div>
              <h1 className="text-xl font-bold text-dravik-dark">Listings</h1>
              <p className="text-sm text-gray-400 mt-0.5">Dravik Realty inventory and Partner Network visibility</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1">
              {([
                { value: "mine", label: "My Listings" },
                { value: "network", label: "Network Exchange" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setView(option.value)}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-xs font-bold transition-colors",
                    view === option.value
                      ? "bg-dravik-dark text-white shadow-sm"
                      : "text-gray-500 hover:bg-surface"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={openAddListing}
              className="inline-flex items-center gap-2 rounded-xl bg-dravik-dark px-4 py-2.5 text-sm font-bold text-white hover:bg-dravik-navy transition-colors shadow-sm"
            >
              <Plus size={15} />
              Add Listing
            </button>
          </div>
        </div>

        {error && (
          <div
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"
          >
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Building2} label="My Listings" value={String(ownListings.length)} sub={`${activeCount} active`} accent="#C9C3B6" />
          <KpiCard icon={Share2} label="Network Exchange" value={String(sharedCount)} sub={`${externalNetworkCount} partner listings`} accent="#4A90A4" />
          <KpiCard icon={DollarSign} label="Inventory Value" value={formatCompactCurrency(totalVolume)} sub={view === "mine" ? "My current list price" : "Network list price"} accent="#4A7A4A" />
          <KpiCard icon={Users} label="Partner Interest" value={String(partnerInterest)} sub="Saves and watchlist" accent="#C0786C" />
        </div>

        <div className="bg-white rounded-2xl border border-line p-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={view === "mine" ? "Search listings, sellers, or neighborhoods..." : "Search network listings, agents, or brokerages..."}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line text-sm text-dravik-dark placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
              />
            </div>
            <select
              aria-label="Listing status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              aria-label="Network visibility"
              value={visibilityFilter}
              onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)}
              className="rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-dravik-dark focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            >
              <option value="All">All Visibility</option>
              <option value="Private">Private</option>
              <option value="Partner Network">Partner Network</option>
            </select>
          </div>
        </div>

        {loading ? (
          <section className="bg-white rounded-2xl border border-line py-16 px-6 flex flex-col items-center text-center gap-4">
            <Loader2 size={26} className="animate-spin text-gold" />
            <p className="text-sm font-semibold text-gray-400">Loading listings...</p>
          </section>
        ) : scopedListings.length === 0 ? (
          <section className="bg-white rounded-2xl border border-line py-16 px-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center">
              <Home size={24} className="text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-dravik-dark">{view === "mine" ? "No listings yet" : "No network listings yet"}</h2>
              <p className="text-sm text-gray-400 mt-1 max-w-sm">
                {view === "mine"
                  ? "Create the first listing for this workspace."
                  : "Shared listings from subscribers will appear here once they publish to the network."}
              </p>
            </div>
            {view === "mine" && (
              <button
                type="button"
                onClick={openAddListing}
                className="inline-flex items-center gap-2 rounded-xl bg-dravik-dark px-4 py-2.5 text-sm font-bold text-white hover:bg-dravik-navy transition-colors"
              >
                <Plus size={15} />
                Add Listing
              </button>
            )}
          </section>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-dravik-dark">{view === "mine" ? "Listing Workspace" : "Network Exchange"}</h2>
                <span className="text-sm text-gray-400 font-medium">
                  {filteredListings.length} of {scopedListings.length}
                </span>
              </div>

              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      selected={selectedListing?.id === listing.id}
                      onSelect={(item) => setSelectedId(item.id)}
                      onEdit={openEditListing}
                      onArchive={archiveListing}
                      onToggleVisibility={toggleVisibility}
                      onUpdateStatus={updateStatus}
                      saved={savedNetworkIds.has(listing.id)}
                      onToggleSaved={toggleSavedNetworkListing}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-line py-14 px-6 text-center">
                  <p className="font-semibold text-dravik-dark">No listings match the current filters</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setStatusFilter("All");
                      setVisibilityFilter("All");
                    }}
                    className="mt-3 text-sm font-semibold text-gold hover:text-gold-dark"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>

            {selectedListing && (
              <aside className="bg-white rounded-2xl border border-line p-5 space-y-5 xl:sticky xl:top-20">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      {selectedListing.isNetworkListing ? "Network Listing" : "Selected Listing"}
                    </p>
                    <h2 className="mt-2 text-base font-bold text-dravik-dark leading-tight">{selectedListing.address}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedListing.city}, {selectedListing.state}
                    </p>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", STATUS_STYLES[selectedListing.status])}>
                    {selectedListing.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="text-sm font-bold text-dravik-dark mt-1">{formatCurrency(selectedListing.price)}</p>
                  </div>
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-xs text-gray-400">Visibility</p>
                    <p className="text-sm font-bold text-dravik-dark mt-1">{selectedListing.networkVisibility}</p>
                  </div>
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-xs text-gray-400">
                      {selectedListing.isNetworkListing ? "Source" : "Seller"}
                    </p>
                    <p className="text-sm font-bold text-dravik-dark mt-1 truncate">
                      {selectedListing.isNetworkListing
                        ? selectedListing.ownerTenantName ?? "Partner Brokerage"
                        : selectedListing.sellerName}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface p-3">
                    <p className="text-xs text-gray-400">Agent</p>
                    <p className="text-sm font-bold text-dravik-dark mt-1 truncate">{selectedListing.agentName}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Listing Notes</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{selectedListing.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedListing.features.slice(0, 6).map((feature) => (
                    <span key={feature} className="text-[11px] font-semibold rounded-full bg-surface-2 text-gray-600 px-2.5 py-1">
                      {feature}
                    </span>
                  ))}
                </div>
              </aside>
            )}
          </div>
        )}
      </div>

      <AddListingModal
        open={modalOpen}
        mode={modalMode}
        form={form}
        submitting={submitting}
        onChange={updateForm}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
