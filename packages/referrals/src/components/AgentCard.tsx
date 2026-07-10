"use client";

import { MapPin, Star, ArrowUpRight, BadgeCheck } from "lucide-react";
import { Agent } from "@dravik/contracts/referrals";
import { cn, formatCurrency } from "@dravik/shared";

// ──────────────────────────────────────────────
// Certification badge config
// ──────────────────────────────────────────────
const CERT_CONFIG = {
  "RE Broker": {
    bg: "bg-gold-light",
    border: "border-gold/40",
    text: "text-gold-dark",
  },
  "Dual Licensed": {
    bg: "bg-dravik-dark",
    border: "border-dravik-dark",
    text: "text-white",
  },
  "RE + Mortgage": {
    bg: "bg-gold",
    border: "border-gold",
    text: "text-white",
  },
};

// ──────────────────────────────────────────────
// Star renderer
// ──────────────────────────────────────────────
function Stars({ score }: { score: number }) {
  const full    = Math.floor(score);
  const partial = score % 1;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          className={cn(
            i < full
              ? "fill-gold text-gold"
              : i === full && partial >= 0.5
              ? "fill-gold/50 text-gold"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </span>
  );
}

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────
interface AgentCardProps {
  agent: Agent;
  onInitiate: (agent: Agent) => void;
}

export default function AgentCard({ agent, onInitiate }: AgentCardProps) {
  const cert = CERT_CONFIG[agent.certification];

  return (
    <div className="card-lift bg-white rounded-2xl border border-line flex flex-col overflow-hidden">

      {/* ── Card top stripe ── */}
      <div className="h-1.5 w-full" style={{ background: agent.avatarColor }} />

      <div className="p-5 flex flex-col flex-1 gap-4">

        {/* ── Header row ── */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
            style={{ background: agent.avatarColor }}
          >
            {agent.initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-1">
              <p className="font-bold text-dravik-dark text-sm leading-tight truncate">{agent.name}</p>
              <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                {agent.yearsExperience}y
              </span>
            </div>

            {/* Cert badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1",
                cert.bg, cert.border, cert.text
              )}
            >
              <BadgeCheck size={9} />
              {agent.certification}
            </span>
          </div>
        </div>

        {/* ── Location + Score ── */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={11} className="text-gold" />
            {agent.location.city}, {agent.location.state}
          </span>
          <div className="flex items-center gap-1.5">
            <Stars score={agent.productionScore} />
            <span className="text-xs font-bold text-dravik-dark">
              {agent.productionScore.toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-400">({agent.totalReviews})</span>
          </div>
        </div>

        {/* ── Specialization tags ── */}
        <div className="flex flex-wrap gap-1.5">
          {agent.specializations.map((s) => (
            <span
              key={s}
              className="text-[10px] font-semibold bg-surface-2 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-2 bg-surface rounded-xl p-3">
          <div className="text-center">
            <p className="text-sm font-bold text-dravik-dark">{agent.closedVolumeMTD}</p>
            <p className="text-[9px] uppercase tracking-wide text-gray-400 mt-0.5">Vol. MTD</p>
          </div>
          <div className="text-center border-x border-line">
            <p className="text-sm font-bold text-dravik-dark">{agent.closedTransactions}</p>
            <p className="text-[9px] uppercase tracking-wide text-gray-400 mt-0.5">Closings</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-dravik-dark">{agent.avgDaysToClose}d</p>
            <p className="text-[9px] uppercase tracking-wide text-gray-400 mt-0.5">Avg Close</p>
          </div>
        </div>

        {/* ── Avg property value ── */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Avg. Market Value</span>
          <span className="font-bold text-dravik-dark">
            {formatCurrency(agent.location.avgPropertyValue)}
          </span>
        </div>

        {/* ── CTA ── */}
        <button
          onClick={() => onInitiate(agent)}
          className="mt-auto w-full flex items-center justify-center gap-2 bg-dravik-dark hover:bg-dravik-navy text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-sm group"
        >
          Initiate Referral
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>
    </div>
  );
}
