"use client";

import Link from "next/link";
import { ArrowRight, Mail, Megaphone, PhoneCall, Sparkles } from "lucide-react";
import { CAMPAIGN_TEMPLATES } from "../../data/prospecting";
import type { CampaignTemplate, SellerLead } from "@dravik/contracts/crm";

function TemplateCard({
  template,
  queuedCount,
}: {
  template: CampaignTemplate;
  queuedCount: number;
}) {
  return (
    <div className="group bg-white border border-line rounded-2xl overflow-hidden hover:border-gold/30 hover:shadow-md transition-all">
      <div
        className="h-28 px-5 py-4 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${template.colorA}, ${template.colorB})`,
        }}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_white,_transparent_55%)]" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold leading-tight">{template.name}</p>
            <p className="text-[11px] text-white/80 mt-1">{template.duration} · {template.touchpoints} touches</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Megaphone size={16} />
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-gray-500 leading-relaxed">{template.description}</p>

        <div className="flex flex-wrap gap-2">
          {template.targetTypes.map((type) => (
            <span
              key={type}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-light text-gold-dark border border-gold/20"
            >
              {type}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface p-3 border border-line">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Channels</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {template.channels.map((channel) => (
                <span key={channel} className="text-[11px] font-semibold text-axen-dark">
                  {channel}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-surface p-3 border border-line">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Queue Match</p>
            <p className="text-lg font-bold text-axen-dark leading-none">{queuedCount}</p>
            <p className="text-[10px] text-gray-400 mt-1">queued prospect{queuedCount === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/marketing"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gold text-axen-dark text-sm font-bold rounded-xl hover:bg-gold-dark transition-colors"
          >
            Open in Marketing
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/inbox"
            className="px-3 py-2.5 rounded-xl border border-line text-gray-500 hover:text-gold hover:border-gold transition-colors"
            title="Open Unified Inbox"
          >
            <Mail size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface CampaignsTabProps {
  queuedLeads: SellerLead[];
}

export default function CampaignsTab({ queuedLeads }: CampaignsTabProps) {
  const queueTypeSet = new Set(queuedLeads.map((lead) => lead.leadType));

  return (
    <div className="h-full overflow-y-auto px-5 py-5">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] mb-5">
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-gold" />
            <p className="text-sm font-bold text-axen-dark">Prospecting Campaign Templates</p>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Launch seller outreach sequences built for expireds, FSBOs, absentee owners, and high-equity homeowners.
            Each template is designed to hand off cleanly into the Marketing module for landing pages, email drips, and branded follow-up.
          </p>
        </div>

        <div className="bg-axen-dark rounded-2xl p-5 text-white">
          <p className="text-xs font-bold text-gold uppercase tracking-widest mb-2">Campaign Stack</p>
          <div className="space-y-3">
            {[
              { label: "Email Sequences", icon: Mail },
              { label: "Voicemail Drops", icon: PhoneCall },
              { label: "Landing Pages", icon: Megaphone },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon size={16} className="text-gold" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-[11px] text-gray-400">Connected to Marketing + Inbox</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {CAMPAIGN_TEMPLATES.map((template) => {
          const queuedCount = queuedLeads.filter((lead) => queueTypeSet.has(lead.leadType) && template.targetTypes.includes(lead.leadType)).length;
          return (
            <TemplateCard
              key={template.id}
              template={template}
              queuedCount={queuedCount}
            />
          );
        })}
      </div>
    </div>
  );
}
