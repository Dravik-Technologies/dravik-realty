"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  Inbox,
  Layers3,
  Map,
  PhoneCall,
  Sparkles,
  Target,
  TrendingUp,
  UserRoundPlus,
  Users,
} from "lucide-react";
import SellerLeadsTable from "./SellerLeadsTable";
import PowerDialer from "./PowerDialer";
import CampaignsTab from "./CampaignsTab";
import { SELLER_LEADS } from "@/data/prospecting";
import type { SellerLead } from "@/types/prospecting";
import { cn } from "@dravik/shared";

const GeoFarmingMap = dynamic(() => import("./GeoFarmingMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-white border border-line rounded-2xl p-6">
      <div className="h-full rounded-2xl bg-surface-2 animate-pulse" />
    </div>
  ),
});

type ProspectingTab = "seller-leads" | "geo-farming" | "power-dialer" | "campaigns";

const TABS: Array<{ id: ProspectingTab; label: string; icon: React.ElementType }> = [
  { id: "seller-leads", label: "Seller Leads", icon: Users },
  { id: "geo-farming", label: "Geo Farming", icon: Map },
  { id: "power-dialer", label: "Power Dialer", icon: PhoneCall },
  { id: "campaigns", label: "My Campaigns", icon: Sparkles },
];

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
    <div className="bg-white border border-line rounded-2xl px-5 py-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-xl font-bold text-axen-dark leading-none">{value}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function ProspectingDashboard() {
  const [activeTab, setActiveTab] = useState<ProspectingTab>("seller-leads");
  const [farmFilter, setFarmFilter] = useState<Set<string> | null>(null);
  const [dialQueue, setDialQueue] = useState<string[]>([]);
  const [convertedLeadIds, setConvertedLeadIds] = useState<Set<string>>(new Set());

  const queueLeads = useMemo(
    () => SELLER_LEADS.filter((lead) => dialQueue.includes(lead.id)),
    [dialQueue]
  );

  const kpis = useMemo(() => {
    const expiredsToday = SELLER_LEADS.filter((lead) => lead.leadType === "Expired" && lead.daysSinceEvent <= 1).length;
    const fsbos = SELLER_LEADS.filter((lead) => lead.leadType === "FSBO").length;
    const frbos = SELLER_LEADS.filter((lead) => lead.leadType === "FRBO").length;
    const highEquity = SELLER_LEADS.filter((lead) => lead.leadType === "High Equity").length;
    const contactedThisWeek = SELLER_LEADS.filter((lead) => lead.lastContacted).length;

    return { expiredsToday, fsbos, frbos, highEquity, contactedThisWeek };
  }, []);

  function handleToggleQueue(id: string) {
    setDialQueue((prev) => (
      prev.includes(id) ? prev.filter((queueId) => queueId !== id) : [...prev, id]
    ));
  }

  function handleConvert(lead: SellerLead) {
    setConvertedLeadIds((prev) => new Set(prev).add(lead.id));
  }

  return (
    <div className="flex flex-col bg-surface overflow-hidden" style={{ height: "calc(100vh - 4rem)" }}>
      <div className="flex-shrink-0 bg-white border-b border-line">
        <div className="px-6 py-4 flex flex-col xl:flex-row xl:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-light border border-gold/30 flex items-center justify-center flex-shrink-0">
                <Target size={18} className="text-gold" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-axen-dark">Prospecting & Seller Leads Center</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Seller data, geo farming, dialing sessions, and campaign launches in one workflow.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {convertedLeadIds.size > 0 && (
              <div className="px-3 py-2 rounded-xl bg-gold-light border border-gold/20 text-xs font-bold text-gold-dark">
                {convertedLeadIds.size} synced to Lead Engine
              </div>
            )}
            {[
              { label: "Lead Engine", href: "/leads", icon: UserRoundPlus },
              { label: "Mapping", href: "/mapping", icon: Layers3 },
              { label: "Inbox", href: "/inbox", icon: Inbox },
              { label: "Marketing", href: "/marketing", icon: BarChart3 },
            ].map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-2 border border-line rounded-xl text-xs font-semibold text-gray-500 hover:text-gold hover:border-gold transition-colors"
              >
                <Icon size={13} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard icon={TrendingUp} label="Expireds Today" value={String(kpis.expiredsToday)} sub="fresh listing fallout" accent="#EF4444" />
            <KpiCard icon={Users} label="FSBOs" value={String(kpis.fsbos)} sub="owner-led listings" accent="#F97316" />
            <KpiCard icon={Building2} label="FRBOs" value={String(kpis.frbos)} sub="landlord burnout targets" accent="#8B5CF6" />
            <KpiCard icon={Sparkles} label="High Equity Leads" value={String(kpis.highEquity)} sub="equity-rich owners" accent="#D4AF37" />
            <KpiCard icon={PhoneCall} label="Contacted This Week" value={String(kpis.contactedThisWeek)} sub={`${dialQueue.length} in call queue`} accent="#10B981" />
          </div>
        </div>

        <div className="px-6 border-t border-line flex items-center gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
                activeTab === id
                  ? "border-gold text-axen-dark"
                  : "border-transparent text-gray-400 hover:text-axen-dark"
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}

          {farmFilter && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-light border border-gold/20 text-[11px] font-bold text-gold-dark whitespace-nowrap">
              Farm list active · {farmFilter.size} sellers
              <button onClick={() => setFarmFilter(null)} className="text-gray-500 hover:text-axen-dark">
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === "seller-leads" && (
          <div className="h-full bg-white">
            <SellerLeadsTable
              farmFilter={farmFilter}
              dialQueue={dialQueue}
              onToggleQueue={handleToggleQueue}
              onConvert={handleConvert}
              onStartDialing={() => setActiveTab("power-dialer")}
              onOpenCampaigns={() => setActiveTab("campaigns")}
            />
          </div>
        )}

        {activeTab === "geo-farming" && (
          <div className="h-full">
            <GeoFarmingMap
              onFarmGenerated={(ids) => {
                setFarmFilter(ids);
                setActiveTab("seller-leads");
              }}
            />
          </div>
        )}

        {activeTab === "power-dialer" && (
          <div className="h-full overflow-y-auto">
            <PowerDialer
              queue={queueLeads}
              onToggleQueue={handleToggleQueue}
            />
          </div>
        )}

        {activeTab === "campaigns" && (
          <CampaignsTab queuedLeads={queueLeads} />
        )}
      </div>
    </div>
  );
}
