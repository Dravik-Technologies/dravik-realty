"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  DollarSign,
  Eye,
  Home,
  Plus,
  Search,
  Share2,
  Users,
  X,
} from "lucide-react";
import type { ListingStatus, Property } from "@dravik/contracts/realty";
import { SAMPLE_PROPERTIES } from "../data/properties";
import { cn, formatCurrency } from "@dravik/shared";

type ListingVisibility = "Private" | "Partner Network";
type StatusFilter = "All" | ListingStatus;
type VisibilityFilter = "All" | ListingVisibility;

interface ManagedListing extends Property {
  sellerName: string;
  agentName: string;
  networkVisibility: ListingVisibility;
  inquiries: number;
  partnerInterest: number;
  updatedAt: string;
}

interface ListingFormState {
  address: string;
  city: string;
  state: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  status: ListingStatus;
}

const STATUS_OPTIONS: ListingStatus[] = ["Active", "Coming Soon", "Pending", "Price Reduced"];

const STATUS_STYLES: Record<ListingStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Coming Soon": "bg-blue-50 text-blue-700 border-blue-200",
  Pending: "bg-violet-50 text-violet-700 border-violet-200",
  "Price Reduced": "bg-amber-50 text-amber-700 border-amber-200",
};

const EMPTY_FORM: ListingFormState = {
  address: "",
  city: "",
  state: "FL",
  price: "",
  beds: "",
  baths: "",
  sqft: "",
  status: "Coming Soon",
};

function buildInitialListings(): ManagedListing[] {
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

function parseNumber(value: string, fallback: number): number {
  const numeric = Number(value.replace(/,/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
  return formatCurrency(amount);
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
  onToggleVisibility,
  onUpdateStatus,
}: {
  listing: ManagedListing;
  selected: boolean;
  onSelect: (listing: ManagedListing) => void;
  onToggleVisibility: (id: string) => void;
  onUpdateStatus: (id: string, status: ListingStatus) => void;
}) {
  const action = statusAction(listing.status);
  const isShared = listing.networkVisibility === "Partner Network";

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
                Partner Network
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        <button
          type="button"
          onClick={() => onSelect(listing)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-bold text-gray-600 hover:bg-surface transition-colors"
        >
          <Eye size={13} />
          Details
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
      </div>
    </article>
  );
}

function AddListingModal({
  open,
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  form: ListingFormState;
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
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-line shadow-2xl overflow-hidden animate-slide-up"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-line">
          <div>
            <h2 className="text-lg font-bold text-dravik-dark">Add Listing</h2>
            <p className="text-sm text-gray-400 mt-0.5">Private by default</p>
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

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-line bg-surface">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-line text-sm font-semibold text-gray-600 hover:bg-surface-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dravik-dark text-white text-sm font-bold hover:bg-dravik-navy transition-colors"
          >
            <Plus size={15} />
            Save Listing
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ListingsPage() {
  const [listings, setListings] = useState<ManagedListing[]>(buildInitialListings);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ListingFormState>(EMPTY_FORM);

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesQuery =
        !q ||
        listing.address.toLowerCase().includes(q) ||
        listing.city.toLowerCase().includes(q) ||
        listing.neighborhood.toLowerCase().includes(q) ||
        listing.sellerName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || listing.status === statusFilter;
      const matchesVisibility = visibilityFilter === "All" || listing.networkVisibility === visibilityFilter;
      return matchesQuery && matchesStatus && matchesVisibility;
    });
  }, [listings, query, statusFilter, visibilityFilter]);

  const selectedListing = listings.find((listing) => listing.id === selectedId) ?? filteredListings[0] ?? null;
  const sharedCount = listings.filter((listing) => listing.networkVisibility === "Partner Network").length;
  const activeCount = listings.filter((listing) => listing.status === "Active").length;
  const totalVolume = listings.reduce((sum, listing) => sum + listing.price, 0);

  function updateForm(patch: Partial<ListingFormState>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function toggleVisibility(id: string) {
    setListings((current) =>
      current.map((listing) =>
        listing.id === id
          ? {
              ...listing,
              networkVisibility: listing.networkVisibility === "Partner Network" ? "Private" : "Partner Network",
              updatedAt: "just now",
            }
          : listing
      )
    );
  }

  function updateStatus(id: string, status: ListingStatus) {
    setListings((current) =>
      current.map((listing) => listing.id === id ? { ...listing, status, updatedAt: "just now" } : listing)
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = parseNumber(form.price, 500_000);
    const sqft = parseNumber(form.sqft, 1_500);
    const beds = parseNumber(form.beds, 3);
    const baths = parseNumber(form.baths, 2);
    const id = `listing-${Date.now()}`;

    const listing: ManagedListing = {
      id,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim() || "FL",
      zip: "",
      price,
      pricePerSqft: Math.round(price / sqft),
      beds,
      baths,
      sqft,
      lotSqft: 0,
      yearBuilt: new Date().getFullYear(),
      type: "Single Family",
      status: form.status,
      daysOnMarket: 0,
      coordinates: { lat: 25.7617, lng: -80.1918 },
      heroImage: "https://picsum.photos/seed/dravik-listing/900/600",
      images: [],
      description: "New Dravik Realty listing.",
      features: ["Dravik Realty"],
      mlsNumber: `DRV-${Date.now().toString().slice(-6)}`,
      leadScore: 50,
      newConstruction: false,
      pool: false,
      garage: 0,
      taxesAnnual: 0,
      savedCount: 0,
      viewedThisWeek: 0,
      neighborhood: form.city.trim(),
      sellerName: "New Seller",
      agentName: "Chris Macabugao",
      networkVisibility: "Private",
      inquiries: 0,
      partnerInterest: 0,
      updatedAt: "just now",
    };

    setListings((current) => [listing, ...current]);
    setSelectedId(id);
    setForm(EMPTY_FORM);
    setModalOpen(false);
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
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-dravik-dark px-4 py-2.5 text-sm font-bold text-white hover:bg-dravik-navy transition-colors shadow-sm"
          >
            <Plus size={15} />
            Add Listing
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Building2} label="Listings" value={String(listings.length)} sub={`${activeCount} active`} accent="#C9C3B6" />
          <KpiCard icon={Share2} label="Partner Network" value={String(sharedCount)} sub="Shared listings" accent="#4A90A4" />
          <KpiCard icon={DollarSign} label="Inventory Value" value={formatCompactCurrency(totalVolume)} sub="Current list price" accent="#4A7A4A" />
          <KpiCard icon={Users} label="Partner Interest" value={String(listings.reduce((sum, listing) => sum + listing.partnerInterest, 0))} sub="Saved by partners" accent="#C0786C" />
        </div>

        <div className="bg-white rounded-2xl border border-line p-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search listings, sellers, or neighborhoods..."
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

        {listings.length === 0 ? (
          <section className="bg-white rounded-2xl border border-line py-16 px-6 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center">
              <Home size={24} className="text-gold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-dravik-dark">No listings yet</h2>
              <p className="text-sm text-gray-400 mt-1 max-w-sm">Create the first listing for this workspace.</p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-dravik-dark px-4 py-2.5 text-sm font-bold text-white hover:bg-dravik-navy transition-colors"
            >
              <Plus size={15} />
              Add Listing
            </button>
          </section>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-dravik-dark">Listing Workspace</h2>
                <span className="text-sm text-gray-400 font-medium">
                  {filteredListings.length} of {listings.length}
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
                      onToggleVisibility={toggleVisibility}
                      onUpdateStatus={updateStatus}
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
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Selected Listing</p>
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
                    <p className="text-xs text-gray-400">Seller</p>
                    <p className="text-sm font-bold text-dravik-dark mt-1 truncate">{selectedListing.sellerName}</p>
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
        form={form}
        onChange={updateForm}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
