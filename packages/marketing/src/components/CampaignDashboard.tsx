"use client";

import {
  Megaphone, Users, TrendingUp, Star, MoreHorizontal,
  Eye, Edit, ExternalLink, Pause, Play,
  Globe, FileText, Home, Printer,
} from "lucide-react";
import type { Campaign, CampaignType } from "@dravik/contracts/marketing";
import { SAMPLE_CAMPAIGNS } from "../data/marketing";
import { cn } from "@dravik/shared";

// ─── Status badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: Campaign["status"] }) {
  const map = {
    Active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    Draft:     "bg-gray-100 text-gray-500 border-gray-200",
    Paused:    "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-blue-50 text-blue-700 border-blue-200",
  } as const;
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", map[status])}>
      {status}
    </span>
  );
}

// ─── Type icon ────────────────────────────────────────────────
function TypeIcon({ type }: { type: CampaignType }) {
  const map: Record<CampaignType, React.ElementType> = {
    "Landing Page":  Globe,
    "Squeeze Page":  FileText,
    "Property Site": Home,
    "Flyer":         Printer,
  };
  const Icon = map[type];
  return <Icon size={14} className="text-gold flex-shrink-0" />;
}

// ─── KPI strip ────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, accent,
}: {
  icon: React.ElementType; label: string; value: string; sub?: string; accent: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18` }}>
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

// ─── Main dashboard ───────────────────────────────────────────
interface CampaignDashboardProps {
  onEdit?: (c: Campaign) => void;
}

export default function CampaignDashboard({ onEdit }: CampaignDashboardProps) {
  const active      = SAMPLE_CAMPAIGNS.filter((c) => c.status === "Active").length;
  const totalLeads  = SAMPLE_CAMPAIGNS.reduce((s, c) => s + c.leadsGenerated, 0);
  const avgConv     = (
    SAMPLE_CAMPAIGNS.filter((c) => c.conversionRate > 0).reduce((s, c) => s + c.conversionRate, 0) /
    SAMPLE_CAMPAIGNS.filter((c) => c.conversionRate > 0).length
  ).toFixed(1);
  const topPage = SAMPLE_CAMPAIGNS.reduce((best, c) =>
    c.views > (best?.views ?? 0) ? c : best
  , SAMPLE_CAMPAIGNS[0]);

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── KPI strip ──────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-line">
        <div className="flex items-center divide-x divide-line overflow-x-auto">
          <KpiCard icon={Megaphone} label="Active Campaigns" value={String(active)} sub="Currently running" accent="#D4AF37" />
          <KpiCard icon={Users}     label="Leads This Month" value={String(totalLeads)} sub="All campaigns"  accent="#10B981" />
          <KpiCard icon={TrendingUp} label="Avg Conversion"  value={`${avgConv}%`}  sub="Active pages"  accent="#4A90A4" />
          <KpiCard icon={Star}      label="Top Performing"  value={topPage.name.split("—")[0].trim()} sub={`${topPage.views.toLocaleString()} views`} accent="#EF4444" />
        </div>
      </div>

      {/* ── Campaign table ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {/* Table header */}
        <div className="sticky top-0 z-10 flex items-center px-6 py-2 bg-surface-2 border-b border-line text-[11px] font-bold text-gray-400 uppercase tracking-wide">
          <div className="flex-[4]">Campaign</div>
          <div className="w-28">Type</div>
          <div className="w-24 text-right">Views</div>
          <div className="w-24 text-right">Leads</div>
          <div className="w-24 text-right">Conv. Rate</div>
          <div className="w-24 text-right">Status</div>
          <div className="w-20" />
        </div>

        {SAMPLE_CAMPAIGNS.map((c) => (
          <div
            key={c.id}
            className="flex items-center px-6 py-3.5 border-b border-line hover:bg-surface transition-colors group"
          >
            {/* Name + thumbnail */}
            <div className="flex-[4] flex items-center gap-3 min-w-0">
              <div className="w-12 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://picsum.photos/seed/${c.thumbnailSeed}/96/72`}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-dravik-dark truncate">{c.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Modified {c.lastModified}
                  {c.publishedUrl && (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="ml-2 text-gold hover:underline inline-flex items-center gap-0.5"
                    >
                      <ExternalLink size={9} />
                      {c.publishedUrl.replace("dravikrealty.com/p/", "…/")}
                    </a>
                  )}
                </p>
              </div>
            </div>

            {/* Type */}
            <div className="w-28 flex items-center gap-1.5 text-xs text-gray-500">
              <TypeIcon type={c.type} />
              <span>{c.type}</span>
            </div>

            {/* Views */}
            <div className="w-24 text-right text-sm font-semibold text-dravik-dark">
              {c.views.toLocaleString()}
            </div>

            {/* Leads */}
            <div className="w-24 text-right text-sm font-bold text-dravik-dark">
              {c.leadsGenerated}
            </div>

            {/* Conv rate */}
            <div className="w-24 text-right">
              <span className={cn(
                "text-sm font-bold",
                c.conversionRate >= 10 ? "text-emerald-600" :
                c.conversionRate >= 5  ? "text-dravik-dark"   : "text-gray-400"
              )}>
                {c.conversionRate > 0 ? `${c.conversionRate}%` : "—"}
              </span>
            </div>

            {/* Status */}
            <div className="w-24 text-right">
              <StatusBadge status={c.status} />
            </div>

            {/* Actions */}
            <div className="w-20 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {c.status === "Active" && (
                <button title="Pause" className="p-1.5 rounded-lg text-gray-400 hover:bg-amber-50 hover:text-amber-600 transition-colors">
                  <Pause size={13} />
                </button>
              )}
              {c.status === "Paused" && (
                <button title="Resume" className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                  <Play size={13} />
                </button>
              )}
              <button
                title="Edit"
                onClick={() => onEdit?.(c)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gold-light hover:text-gold transition-colors"
              >
                <Edit size={13} />
              </button>
              <button title="Preview" onClick={() => onEdit?.(c)} className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors">
                <Eye size={13} />
              </button>
              <button title="More" className="p-1.5 rounded-lg text-gray-400 hover:bg-surface-2 transition-colors">
                <MoreHorizontal size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
