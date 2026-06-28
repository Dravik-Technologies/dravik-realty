"use client";

import { Clock, MapPin, TrendingUp } from "lucide-react";
import { ReferralPipeline, ReferralStatus } from "@/types/referral";
import { cn, formatCurrency, formatCurrencyFull } from "@dravik/shared";

// ──────────────────────────────────────────────
// Status config
// ──────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ReferralStatus,
  { dot: string; bg: string; text: string; label: string; step: number }
> = {
  Pending: {
    dot: "bg-amber-400",
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    label: "Pending",
    step: 1,
  },
  Accepted: {
    dot: "bg-blue-400",
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    label: "Accepted",
    step: 2,
  },
  "Under Contract": {
    dot: "bg-violet-400",
    bg: "bg-violet-50 border-violet-200",
    text: "text-violet-700",
    label: "Under Contract",
    step: 3,
  },
  Closed: {
    dot: "bg-emerald-400",
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    label: "Closed",
    step: 4,
  },
};

const STEPS: ReferralStatus[] = ["Pending", "Accepted", "Under Contract", "Closed"];

// ──────────────────────────────────────────────
// Progress track
// ──────────────────────────────────────────────
function ProgressTrack({ status }: { status: ReferralStatus }) {
  const currentStep = STATUS_CONFIG[status].step;
  return (
    <div className="flex items-center gap-1 w-full">
      {STEPS.map((step, i) => {
        const cfg = STATUS_CONFIG[step];
        const done = i + 1 <= currentStep;
        return (
          <div key={step} className="flex items-center flex-1">
            <div
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0 transition-all",
                done ? cfg.dot : "bg-gray-200"
              )}
            />
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-0.5 rounded-full transition-all",
                  i + 1 < currentStep ? "bg-gold" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────
interface PipelineCardProps {
  referral: ReferralPipeline;
}

export default function PipelineCard({ referral }: PipelineCardProps) {
  const cfg = STATUS_CONFIG[referral.status];

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="card-lift bg-white rounded-2xl border border-line flex flex-col gap-4 p-5 min-w-[280px]">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-axen-dark text-sm">{referral.clientName}</p>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <MapPin size={10} className="text-gold" />
            {referral.agentName} · {referral.agentCity}
          </p>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap",
            cfg.bg, cfg.text
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
          {cfg.label}
        </span>
      </div>

      {/* ── Progress track ── */}
      <ProgressTrack status={referral.status} />

      {/* ── Property details ── */}
      <div className="grid grid-cols-3 gap-2 bg-surface rounded-xl p-3">
        <div className="text-center">
          <p className="text-xs font-bold text-axen-dark">{formatCurrency(referral.propertyValue)}</p>
          <p className="text-[9px] uppercase tracking-wide text-gray-400 mt-0.5">Prop. Value</p>
        </div>
        <div className="text-center border-x border-line">
          <p className="text-xs font-bold text-axen-dark">{referral.referralFee}%</p>
          <p className="text-[9px] uppercase tracking-wide text-gray-400 mt-0.5">Ref. Fee</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-gold flex items-center justify-center gap-0.5">
            <TrendingUp size={10} />
            {formatCurrencyFull(referral.estimatedEarning)}
          </p>
          <p className="text-[9px] uppercase tracking-wide text-gray-400 mt-0.5">Est. Net</p>
        </div>
      </div>

      {/* ── Property type ── */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{referral.propertyType}</span>
        <div className="flex items-center gap-1 text-gray-400">
          <Clock size={10} />
          <span>Updated {formatDate(referral.lastUpdate)}</span>
        </div>
      </div>
    </div>
  );
}
