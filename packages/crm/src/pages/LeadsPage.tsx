"use client";

import { useState, useMemo, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Users,
  Flame,
  Clock3,
  TrendingUp,
  Search,
  Upload,
  X,
} from "lucide-react";
import LeadPipeline from "../components/leads/LeadPipeline";
import LeadDetailPanel from "../components/leads/LeadDetailPanel";
import { SAMPLE_LEADS } from "../data/leads";
import type { ClientType, Lead, LeadSource, LeadStatus, SubNavTab } from "@dravik/contracts/crm";
import { KANBAN_COLUMNS, SUBNAV_TABS } from "@dravik/contracts/crm";
import { cn } from "@dravik/shared";

type ImportedLead = Lead & {
  duplicate: boolean;
  duplicateReason?: string;
  sourceRow: number;
};

const LEAD_SOURCES: LeadSource[] = [
  "Zillow",
  "Open House",
  "Website",
  "Referral",
  "Mortgage Inquiry",
  "Instagram",
  "Facebook",
  "Redfin",
  "Walk-In",
  "Cold Call",
];
const CLIENT_TYPES: ClientType[] = ["Buyer", "Seller", "Dual"];
const STATUS_OPTIONS = KANBAN_COLUMNS.map((column) => column.id);
const AVATAR_COLORS = ["#4A90A4", "#7C6A9E", "#C0786C", "#4A7A4A", "#B87333", "#1A6B8A"];

const FIELD_ALIASES = {
  name: ["name", "full name", "contact", "contact name", "client", "client name", "lead", "lead name"],
  firstName: ["first", "first name", "firstname"],
  lastName: ["last", "last name", "lastname"],
  email: ["email", "email address", "primary email", "e-mail"],
  phone: ["phone", "mobile", "cell", "cell phone", "primary phone", "telephone"],
  source: ["source", "lead source", "origin", "campaign"],
  status: ["status", "stage", "pipeline stage"],
  clientType: ["type", "client type", "lead type", "buyer/seller"],
  assignedTo: ["owner", "agent", "assigned to", "assignee"],
  notes: ["notes", "note", "comments", "description"],
  priceMin: ["min price", "price min", "min budget", "minimum budget"],
  priceMax: ["max price", "price max", "max budget", "budget", "maximum budget"],
} as const;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === "\"" && quoted && next === "\"") {
      cell += "\"";
      i += 1;
    } else if (char === "\"") {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function columnIndex(headers: string[], aliases: readonly string[]): number {
  return aliases.reduce((match, alias) => {
    if (match !== -1) return match;
    return headers.findIndex((header) => header === alias);
  }, -1);
}

function pick(row: string[], index: number): string {
  return index >= 0 ? row[index]?.trim() ?? "" : "";
}

function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "LD";
}

function normalizeSource(value: string): LeadSource {
  const lower = value.toLowerCase();
  return LEAD_SOURCES.find((source) => source.toLowerCase() === lower) ??
    LEAD_SOURCES.find((source) => lower.includes(source.toLowerCase())) ??
    "Website";
}

function normalizeStatus(value: string): LeadStatus {
  const lower = value.toLowerCase();
  return STATUS_OPTIONS.find((status) => status.toLowerCase() === lower) ??
    STATUS_OPTIONS.find((status) => lower.includes(status.toLowerCase().split(" ")[0])) ??
    "New Lead";
}

function normalizeClientType(value: string): ClientType {
  const lower = value.toLowerCase();
  return CLIENT_TYPES.find((type) => type.toLowerCase() === lower) ??
    (lower.includes("sell") ? "Seller" : lower.includes("dual") ? "Dual" : "Buyer");
}

function parseCurrency(value: string): number {
  const parsed = Number(value.replace(/[$,\s]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
}

function phoneKey(phone: string): string {
  return phone.replace(/\D/g, "");
}

function buildImportedLeads(text: string, existingLeads: Lead[]): ImportedLead[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  const indexes = Object.fromEntries(
    Object.entries(FIELD_ALIASES).map(([field, aliases]) => [field, columnIndex(headers, aliases)])
  ) as Record<keyof typeof FIELD_ALIASES, number>;
  const existingEmails = new Set(existingLeads.map((lead) => lead.email.toLowerCase()).filter(Boolean));
  const existingPhones = new Set(existingLeads.map((lead) => phoneKey(lead.phone)).filter(Boolean));
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();
  const now = new Date().toISOString();

  return rows.slice(1).map((row, index) => {
    const first = pick(row, indexes.firstName);
    const last = pick(row, indexes.lastName);
    const name = pick(row, indexes.name) || [first, last].filter(Boolean).join(" ") || `Imported Lead ${index + 1}`;
    const email = pick(row, indexes.email);
    const phone = pick(row, indexes.phone);
    const emailKey = email.toLowerCase();
    const normalizedPhone = phoneKey(phone);
    const duplicateReason =
      (emailKey && (existingEmails.has(emailKey) || seenEmails.has(emailKey)) && "Email already exists") ||
      (normalizedPhone && (existingPhones.has(normalizedPhone) || seenPhones.has(normalizedPhone)) && "Phone already exists") ||
      undefined;

    if (emailKey) seenEmails.add(emailKey);
    if (normalizedPhone) seenPhones.add(normalizedPhone);

    return {
      id: `import-${Date.now()}-${index}`,
      name,
      initials: initialsFor(name),
      avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
      email,
      phone,
      source: normalizeSource(pick(row, indexes.source)),
      clientType: normalizeClientType(pick(row, indexes.clientType)),
      status: normalizeStatus(pick(row, indexes.status)),
      behaviorScore: 55,
      lastTouchpoint: now,
      assignedTo: pick(row, indexes.assignedTo) || "Chris M.",
      createdAt: now,
      notes: pick(row, indexes.notes) || "Imported from spreadsheet.",
      priceMin: parseCurrency(pick(row, indexes.priceMin)),
      priceMax: parseCurrency(pick(row, indexes.priceMax)),
      savedProperties: 0,
      viewedThisWeek: 0,
      preApproval: "Not Started",
      creditPull: "Not Pulled",
      activities: [
        {
          id: `import-activity-${Date.now()}-${index}`,
          type: "note",
          description: "Lead imported from spreadsheet.",
          timestamp: now,
          by: "Dravik Import",
        },
      ],
      duplicate: Boolean(duplicateReason),
      duplicateReason,
      sourceRow: index + 2,
    };
  });
}

// ─── KPI card ─────────────────────────────────────────────────
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
  sub?: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}
      >
        <Icon size={17} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-lg font-bold text-dravik-dark leading-none">{value}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function LeadImportModal({
  existingLeads,
  onClose,
  onImport,
}: {
  existingLeads: Lead[];
  onClose: () => void;
  onImport: (leads: Lead[]) => void;
}) {
  const [rows, setRows] = useState<ImportedLead[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const importableRows = rows.filter((row) => !row.duplicate);
  const duplicateRows = rows.length - importableRows.length;

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setError("");

    try {
      const text = await file.text();
      const imported = buildImportedLeads(text, existingLeads);
      if (!imported.length) {
        setRows([]);
        setError("No importable rows found. Export the spreadsheet as CSV and keep the header row.");
        return;
      }
      setRows(imported);
    } catch {
      setRows([]);
      setError("Unable to read this file. Export the spreadsheet as CSV and try again.");
    }
  }

  function handleImport() {
    const cleanLeads = importableRows.map(({ duplicate, duplicateReason, sourceRow, ...lead }) => lead);
    onImport(cleanLeads);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 animate-fade-in">
      <button className="absolute inset-0 bg-dravik-dark/60 backdrop-blur-sm" aria-label="Close import" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-import-title"
        className="relative w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl bg-white border border-line shadow-2xl animate-slide-up"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-light border border-gold/20 flex items-center justify-center">
              <FileSpreadsheet size={18} className="text-gold-dark" />
            </div>
            <div>
              <h2 id="lead-import-title" className="text-base font-bold text-dravik-dark">Import Leads</h2>
              <p className="text-xs text-gray-400 mt-0.5">CSV exports from Command, Axen, and legacy CRMs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-gray-400 hover:text-dravik-dark hover:bg-surface-2 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(88vh-9rem)]">
          <label className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-6 py-8 cursor-pointer hover:border-gold/50 hover:bg-gold-light/40 transition">
            <div className="w-11 h-11 rounded-2xl bg-white border border-line flex items-center justify-center">
              <Upload size={18} className="text-gold" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-dravik-dark">{fileName || "Choose a CSV file"}</p>
              <p className="text-xs text-gray-400 mt-1">Name, email, phone, source, status, type, owner, notes, budget</p>
            </div>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => void handleFile(event.target.files?.[0])}
            />
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-dravik-dark">Preview</p>
                  <p className="text-xs text-gray-400">
                    {importableRows.length} ready · {duplicateRows} duplicate{duplicateRows === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                  <CheckCircle2 size={13} />
                  {importableRows.length} clean
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-line">
                <div className="max-h-72 overflow-y-auto divide-y divide-line">
                  {rows.slice(0, 20).map((row) => (
                    <div key={`${row.sourceRow}-${row.email}-${row.phone}`} className="grid grid-cols-[1.4fr_1.2fr_0.8fr_0.9fr] gap-3 px-4 py-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-dravik-dark truncate">{row.name}</p>
                        <p className="text-gray-400 truncate">{row.email || row.phone || `Row ${row.sourceRow}`}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-500 truncate">{row.source}</p>
                        <p className="text-gray-400 truncate">{row.clientType}</p>
                      </div>
                      <p className="font-semibold text-gray-500 truncate">{row.status}</p>
                      <div className="text-right">
                        {row.duplicate ? (
                          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            {row.duplicateReason}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            Ready
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {rows.length > 20 && (
                <p className="text-xs text-gray-400 text-center">Previewing first 20 of {rows.length} rows</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line bg-surface">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-line bg-white text-sm font-semibold text-gray-500 hover:text-dravik-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={importableRows.length === 0}
            onClick={handleImport}
            className="px-4 py-2 rounded-xl bg-dravik-dark text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black transition-colors"
          >
            Import {importableRows.length || ""} Leads
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function LeadsPage() {
  const [leads, setLeads]         = useState<Lead[]>(SAMPLE_LEADS);
  const [activeTab, setActiveTab] = useState<SubNavTab>("All Leads");
  const [query, setQuery]         = useState("");
  const [selectedLead, setSelectedLead]   = useState<Lead | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [now] = useState(() => Date.now());

  // ── Tab filtering ─────────────────────────────────────────
  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case "My Leads":    return leads.filter((l) => l.assignedTo === "Chris M.");
      case "Unassigned":  return leads.filter((l) => !l.assignedTo);
      case "Archived":    return [];  // no archived leads in sample data
      default:            return leads;
    }
  }, [activeTab, leads]);

  // ── Search filtering ──────────────────────────────────────
  const visibleLeads = useMemo(() => {
    if (!query.trim()) return tabFiltered;
    const q = query.toLowerCase();
    return tabFiltered.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.source.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q)
    );
  }, [tabFiltered, query]);

  // ── KPI computations ──────────────────────────────────────
  const kpis = useMemo(() => {
    const week   = 7 * 24 * 60 * 60 * 1000;
    const hot    = leads.filter(
      (l) =>
        l.behaviorScore >= 80 &&
        now - new Date(l.createdAt).getTime() < week * 4
    );
    const contracts = leads.filter((l) => l.status === "Under Contract");
    const rate      = leads.length
      ? Math.round((contracts.length / leads.length) * 100)
      : 0;

    return {
      total:      leads.length,
      hot:        hot.length,
      convRate:   `${rate}%`,
      avgResp:    "2.4h",  // mock
    };
  }, [leads, now]);

  // ── Lead select ───────────────────────────────────────────
  const handleSelectLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const handleImportLeads = useCallback((importedLeads: Lead[]) => {
    if (!importedLeads.length) return;
    setLeads((current) => [...importedLeads, ...current]);
    setActiveTab("All Leads");
    setQuery("");
  }, []);

  return (
    <>
      {/* Full-height column: top bar + kanban */}
      <div
        className="flex flex-col overflow-hidden bg-surface"
        style={{ height: "calc(100vh - 4rem)" }}  // 4rem = shell header height
      >
        {/* ── Top bar: KPIs + sub-nav + search ──────────────── */}
        <div className="flex-shrink-0 bg-white border-b border-line">

          {/* KPI strip */}
          <div className="flex items-center divide-x divide-line overflow-x-auto">
            <KpiCard
              icon={Users}
              label="Total Leads"
              value={String(kpis.total)}
              sub="All pipeline stages"
              accent="#C9C3B6"
            />
            <KpiCard
              icon={Flame}
              label="Hot Leads"
              value={String(kpis.hot)}
              sub="Score ≥ 80"
              accent="#EF4444"
            />
            <KpiCard
              icon={Clock3}
              label="Avg Response"
              value={kpis.avgResp}
              sub="This week"
              accent="#4A90A4"
            />
            <KpiCard
              icon={TrendingUp}
              label="Conversion Rate"
              value={kpis.convRate}
              sub="Under contract"
              accent="#10B981"
            />

            <div className="px-4 py-2.5">
              <button
                type="button"
                onClick={() => setImportOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-dravik-dark px-3.5 py-2 text-sm font-semibold text-white hover:bg-black transition-colors whitespace-nowrap"
              >
                <Upload size={14} />
                Import Leads
              </button>
            </div>

            {/* Spacer + search */}
            <div className="flex-1 px-4 py-2.5 min-w-[200px]">
              <div className="relative max-w-xs">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter leads…"
                  className="w-full pl-8 pr-8 py-2 bg-surface-2 border border-transparent rounded-xl text-sm text-dravik-dark placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dravik-dark"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sub-nav tabs */}
          <div className="flex items-center gap-0 px-4 border-t border-line overflow-x-auto">
            {SUBNAV_TABS.map((tab) => {
              const count =
                tab === "All Leads"   ? leads.length :
                tab === "My Leads"    ? leads.filter((l) => l.assignedTo === "Chris M.").length :
                tab === "Unassigned"  ? leads.filter((l) => !l.assignedTo).length :
                0;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-gold text-dravik-dark"
                      : "border-transparent text-gray-400 hover:text-dravik-dark hover:border-gray-200"
                  )}
                >
                  {tab}
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      isActive
                        ? "bg-gold-light text-gold-dark"
                        : "bg-surface-2 text-gray-400"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Kanban pipeline ───────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {visibleLeads.length === 0 && query ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center">
                <Search size={20} className="text-gray-300" />
              </div>
              <p className="font-semibold text-dravik-dark">No leads match &ldquo;{query}&rdquo;</p>
              <button
                onClick={() => setQuery("")}
                className="text-sm text-gold hover:text-gold-dark font-semibold"
              >
                Clear search
              </button>
            </div>
          ) : (
            <LeadPipeline
              leads={visibleLeads}
              setLeads={setLeads}
              onSelectLead={handleSelectLead}
            />
          )}
        </div>
      </div>

      {/* ── Lead detail panel ─────────────────────────────── */}
      <LeadDetailPanel
        lead={selectedLead}
        open={panelOpen}
        onClose={handleClosePanel}
      />

      {importOpen && (
        <LeadImportModal
          existingLeads={leads}
          onClose={() => setImportOpen(false)}
          onImport={handleImportLeads}
        />
      )}
    </>
  );
}
