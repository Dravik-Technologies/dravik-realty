"use client";

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Info, CheckCircle } from "lucide-react";
import { Agent, SplitBreakdown } from "@/types/referral";
import { formatCurrency, formatCurrencyFull } from "@/lib/utils";

const PieChartSection = dynamic(() => import("./PieChartSection"), {
  ssr: false,
  loading: () => <div className="h-[260px] bg-surface-2 rounded-2xl animate-pulse" />,
});

// ─── Brand tokens ──────────────────────────────────────────────
const TEAL   = "#4A90A4";
const GOLD   = "#D4AF37";
const SLATE  = "#CBD5E1"; // neutral dot for "Total Commission" anchor step
const RED_DOT = "#C0524A"; // muted deep-red — deduction indicator

const SLICE_LABELS = ["Receiving Agent", "You (Net)", "Axen Realty"];

// ─── InfoTooltip ───────────────────────────────────────────────
// Hover tooltip used next to the Axen Realty Cut label.
function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative group inline-flex items-center cursor-help ml-1 align-middle">
      <Info size={12} className="text-gray-400 group-hover:text-gold transition-colors" />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl bg-axen-dark px-3 py-2 text-[11px] leading-relaxed text-gray-200 shadow-xl text-center opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-normal"
      >
        {text}
      </span>
    </span>
  );
}

// ─── SliderRow ─────────────────────────────────────────────────
interface SliderRowProps {
  label: string;
  sublabel?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  display: string;
}

function SliderRow({
  label, sublabel, min, max, step, value, onChange, display,
}: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const trackStyle = {
    background: `linear-gradient(to right, #D4AF37 ${pct}%, #E8E8E8 ${pct}%)`,
  };
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-axen-dark">{label}</span>
          {sublabel && (
            <span className="text-xs text-gray-400 ml-2">{sublabel}</span>
          )}
        </div>
        <span className="text-sm font-bold text-gold bg-gold-light px-2.5 py-0.5 rounded-full">
          {display}
        </span>
      </div>
      <input
        aria-label={label}
        type="range"
        className="gold-slider w-full"
        style={trackStyle}
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{min}%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
}

// ─── FlowStep ──────────────────────────────────────────────────
// One row in the step-by-step deduction flow.
// `dotColor`   — fills the indicator circle on the left spine
// `deduction`  — renders amount with a "−" prefix in rose text
// `hasLine`    — draws the vertical connector beneath the dot
interface FlowStepProps {
  dotColor: string;
  label: ReactNode;
  sublabel?: string;
  amount: number;
  deduction?: boolean;
  hasLine?: boolean;
}

function FlowStep({
  dotColor, label, sublabel, amount, deduction = false, hasLine = true,
}: FlowStepProps) {
  return (
    <div className="flex gap-3">
      {/* Left spine: dot + optional connector line */}
      <div className="flex flex-col items-center w-3 flex-shrink-0">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-white mt-1.5"
          style={{ background: dotColor }}
        />
        {hasLine && (
          <span className="w-px flex-1 min-h-[20px] bg-gray-200 mt-1" />
        )}
      </div>

      {/* Content: label + amount */}
      <div className="flex-1 flex items-start justify-between pb-3 min-w-0">
        <div className="min-w-0 pr-2">
          <div className="flex items-center text-[13px] font-medium text-axen-dark leading-tight">
            {label}
          </div>
          {sublabel && (
            <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{sublabel}</p>
          )}
        </div>
        <span
          className={`text-[13px] font-bold flex-shrink-0 tabular-nums ${
            deduction ? "text-rose-600" : "text-axen-dark"
          }`}
        >
          {deduction ? "−" : ""}
          {formatCurrencyFull(amount)}
        </span>
      </div>
    </div>
  );
}

// ─── SplitCalculator ───────────────────────────────────────────
interface SplitCalculatorProps {
  agent: Agent;
}

export default function SplitCalculator({ agent }: SplitCalculatorProps) {
  const [propertyValue, setPropertyValue] = useState(agent.location.avgPropertyValue);
  const [propertyInput, setPropertyInput] = useState(
    agent.location.avgPropertyValue.toLocaleString()
  );
  const [commissionRate, setCommissionRate] = useState(2.5);
  const [referralFee, setReferralFee]       = useState(25);
  const [companySplit, setCompanySplit]     = useState(25);

  const breakdown = useMemo((): SplitBreakdown => {
    const totalCommission     = propertyValue * (commissionRate / 100);
    const receivingAgentShare = totalCommission * (1 - referralFee / 100);
    const referringAgentGross = totalCommission * (referralFee / 100);
    const axenCut             = referringAgentGross * (companySplit / 100);
    const referringAgentNet   = referringAgentGross * (1 - companySplit / 100);
    return {
      totalCommission, receivingAgentShare, referringAgentGross, axenCut, referringAgentNet,
    };
  }, [propertyValue, commissionRate, referralFee, companySplit]);

  const chartData = [
    { name: SLICE_LABELS[0], value: breakdown.receivingAgentShare },
    { name: SLICE_LABELS[1], value: breakdown.referringAgentNet   },
    { name: SLICE_LABELS[2], value: breakdown.axenCut             },
  ];

  function handlePropertyBlur() {
    const raw = propertyInput.replace(/[^0-9.]/g, "");
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) {
      setPropertyValue(num);
      setPropertyInput(num.toLocaleString());
    } else {
      setPropertyInput(propertyValue.toLocaleString());
    }
  }

  return (
    <div className="space-y-7">

      {/* ── Property & Commission ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Property value text input */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-axen-dark block">
            Estimated Property Value
            <span className="text-xs font-normal text-gray-400 ml-2">
              {agent.location.city} avg: {formatCurrency(agent.location.avgPropertyValue)}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gold font-bold text-sm">
              $
            </span>
            <input
              type="text"
              value={propertyInput}
              onChange={(e) => setPropertyInput(e.target.value)}
              onBlur={handlePropertyBlur}
              className="w-full pl-7 pr-4 py-2.5 border border-line rounded-xl text-sm font-semibold text-axen-dark bg-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition"
            />
          </div>
        </div>

        {/* Commission rate slider */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-axen-dark block">
            Commission Rate
            <span className="text-xs font-normal text-gray-400 ml-2">Buyer-side</span>
          </label>
          <div className="bg-surface-2 rounded-xl p-3">
            <SliderRow
              label="Commission Rate"
              min={2} max={3.5} step={0.1}
              value={commissionRate}
              onChange={setCommissionRate}
              display={`${commissionRate.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      {/* ── Split sliders ─────────────────────────────────────── */}
      <div className="bg-surface-2 rounded-2xl p-5 space-y-5">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Split Configuration
        </h4>
        <SliderRow
          label="Referral Fee"
          sublabel="% of total commission sent to you"
          min={10} max={50} step={1}
          value={referralFee}
          onChange={setReferralFee}
          display={`${referralFee}%`}
        />
        <SliderRow
          label="Axen Company Split"
          sublabel="% of your referral share to Axen Realty"
          min={15} max={40} step={1}
          value={companySplit}
          onChange={setCompanySplit}
          display={`${companySplit}%`}
        />
      </div>

      {/* ── Total Commission Banner ────────────────────────────── */}
      <div className="flex items-center justify-between bg-axen-dark rounded-2xl px-6 py-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">
            Total Commission Generated
          </p>
          <p className="text-2xl font-bold text-white mt-0.5">
            {formatCurrencyFull(breakdown.totalCommission)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Property Value</p>
          <p className="text-base font-semibold text-gold mt-0.5">
            {formatCurrency(propertyValue)}
          </p>
        </div>
      </div>

      {/* ── Donut Chart + Deduction Flow ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* Left: Donut chart */}
        <PieChartSection data={chartData} />

        {/* Right: Step-by-step deduction flow */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Step-by-Step Breakdown
          </p>

          {/* Step 1 — anchor: total commission */}
          <FlowStep
            dotColor={SLATE}
            label="Total Commission"
            sublabel={`${commissionRate.toFixed(1)}% of sale price`}
            amount={breakdown.totalCommission}
            hasLine
          />

          {/* Step 2 — receiving agent's share (leaves with them) */}
          <FlowStep
            dotColor={TEAL}
            label="Receiving Agent Share"
            sublabel={`${100 - referralFee}% · ${agent.name} — ${agent.location.city}`}
            amount={breakdown.receivingAgentShare}
            hasLine
          />

          {/* Step 3 — referring agent's gross before company split */}
          <FlowStep
            dotColor={GOLD}
            label="Your Gross Referral Share"
            sublabel={`${referralFee}% referral fee`}
            amount={breakdown.referringAgentGross}
            hasLine
          />

          {/* Step 4 — Axen deduction: minus sign + tooltip */}
          <FlowStep
            dotColor={RED_DOT}
            label={
              <>
                Axen Realty Company Split
                <InfoTooltip text="Axen Realty's standard company split on referred transactions." />
              </>
            }
            sublabel={`${companySplit}% of your gross share`}
            amount={breakdown.axenCut}
            deduction
            hasLine={false}
          />

          {/* Dashed divider before the result */}
          <div className="my-3 border-t border-dashed border-gray-200" />

          {/* Net Payout — most prominent element */}
          <div className="rounded-xl bg-gold-light border border-gold/40 px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-gold flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] font-bold text-axen-dark">Your Net Payout</p>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 ml-[22px]">
                  What hits your bank account
                </p>
              </div>
              <p className="text-xl font-bold text-gold tabular-nums flex-shrink-0">
                {formatCurrencyFull(breakdown.referringAgentNet)}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-3 px-0.5">
            * Estimates assume {commissionRate.toFixed(1)}% commission. Actual amounts may vary.
          </p>
        </div>
      </div>

    </div>
  );
}
