"use client";

import { useState } from "react";
import { DollarSign, Users, Building2, User, ArrowRight } from "lucide-react";
import type { CommissionInfo } from "@dravik/contracts/realty";
import { formatCurrency, formatCurrencyFull } from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── SliderRow ────────────────────────────────────────────────
interface SliderRowProps {
  label: string;
  min: number; max: number; step: number;
  value: number; onChange: (v: number) => void;
  display: string;
}

function SliderRow({ label, min, max, step, value, onChange, display }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-dravik-dark">{label}</span>
        <span className="text-xs font-bold text-gold tabular-nums">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #C9C3B6 ${pct}%, #DDE2E8 ${pct}%)`,
        }}
      />
      <div className="flex justify-between text-[9px] text-gray-400">
        <span>{min}%</span><span>{max}%</span>
      </div>
    </div>
  );
}

// ─── Breakdown row ────────────────────────────────────────────
interface BreakdownRowProps {
  icon: React.ElementType;
  label: string;
  amount: number;
  sub?: string;
  accent?: string;
  deduction?: boolean;
  bold?: boolean;
}

function BreakdownRow({ icon: Icon, label, amount, sub, accent, deduction, bold }: BreakdownRowProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl",
      bold ? "bg-dravik-dark" : "bg-surface"
    )}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: accent ? `${accent}18` : "#F1F3F5" }}>
        <Icon size={13} style={{ color: accent ?? "#9CA3AF" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs font-semibold", bold ? "text-white" : "text-dravik-dark")}>{label}</p>
        {sub && <p className={cn("text-[10px]", bold ? "text-gray-400" : "text-gray-400")}>{sub}</p>}
      </div>
      <p className={cn(
        "text-sm font-bold tabular-nums",
        bold      ? "text-gold" :
        deduction ? "text-rose-500" :
        "text-dravik-dark"
      )}>
        {deduction ? "−" : ""}{formatCurrency(Math.abs(amount))}
      </p>
    </div>
  );
}

// ─── Commission Breakdown ─────────────────────────────────────
interface CommissionBreakdownProps {
  contractPrice: number;
  commission: CommissionInfo;
}

export default function CommissionBreakdown({ contractPrice, commission: c }: CommissionBreakdownProps) {
  const [rate,        setRate]        = useState(c.commissionRate);
  const [hasReferral, setHasReferral] = useState(c.hasReferral);
  const [refRate,     setRefRate]     = useState(c.referralRate || 25);
  const [txFee]                       = useState(c.transactionFee);

  const gross        = contractPrice * (rate / 100);
  const refDeduction = hasReferral ? gross * (refRate / 100) : 0;
  const postRef      = gross - refDeduction;
  const dravikShare    = postRef * (c.dravikSplitRate / 100);
  const agentGross   = postRef - dravikShare;
  const agentNet     = agentGross - txFee;

  return (
    <div className="space-y-5">
      {/* Sliders */}
      <div className="bg-white rounded-2xl border border-line p-4 space-y-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adjust Rates</p>

        <SliderRow
          label="Commission Rate"
          min={1} max={6} step={0.25}
          value={rate} onChange={setRate}
          display={`${rate.toFixed(2)}%`}
        />

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              role="switch" aria-checked={hasReferral} tabIndex={0}
              onClick={() => setHasReferral((v) => !v)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setHasReferral((v) => !v); } }}
              className={cn(
                "w-8 h-4 rounded-full transition-colors cursor-pointer",
                hasReferral ? "bg-gold" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "w-3.5 h-3.5 rounded-full bg-white mt-0.5 transition-transform shadow",
                hasReferral ? "translate-x-4" : "translate-x-0.5"
              )} />
            </div>
            <span className="text-xs font-semibold text-dravik-dark">Referral Fee</span>
          </label>
          {c.referralAgent && (
            <span className="text-[10px] text-gray-400 ml-auto">{c.referralAgent}</span>
          )}
        </div>

        {hasReferral && (
          <SliderRow
            label="Referral Rate (of gross)"
            min={10} max={50} step={5}
            value={refRate} onChange={setRefRate}
            display={`${refRate}%`}
          />
        )}
      </div>

      {/* Breakdown */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Breakdown</p>

        <BreakdownRow
          icon={DollarSign}
          label="Gross Commission"
          sub={`${rate.toFixed(2)}% of ${formatCurrency(contractPrice)}`}
          amount={gross}
          accent="#C9C3B6"
        />

        {hasReferral && (
          <>
            <div className="flex items-center gap-2 px-2 text-[10px] text-gray-400">
              <ArrowRight size={10} />
              Referral deduction ({refRate}% to {c.referralAgent ?? "Referring Agent"})
            </div>
            <BreakdownRow
              icon={Users}
              label="Referral Fee"
              sub={`${refRate}% of gross`}
              amount={refDeduction}
              accent="#EF4444"
              deduction
            />
          </>
        )}

        <BreakdownRow
          icon={Building2}
          label="Dravik Company Split"
          sub={`${c.dravikSplitRate}% of net commission`}
          amount={dravikShare}
          accent="#8B5CF6"
          deduction
        />

        <div className="border-t border-line my-1" />

        <BreakdownRow
          icon={User}
          label="Agent Gross"
          sub="Before transaction fee"
          amount={agentGross}
          accent="#10B981"
        />

        <div className="flex items-center gap-3 px-4 py-1.5 text-[10px] text-gray-400">
          <ArrowRight size={10} />
          Transaction fee: {formatCurrencyFull(txFee)}
        </div>

        <BreakdownRow
          icon={User}
          label="Agent Net Payout"
          sub="Projected deposit"
          amount={agentNet}
          accent="#C9C3B6"
          bold
        />
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Gross",       value: formatCurrency(gross)      },
          { label: "Dravik Cut",    value: formatCurrency(dravikShare)  },
          { label: "You Net",     value: formatCurrency(agentNet)   },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface rounded-xl p-3 text-center">
            <p className="text-base font-bold text-dravik-dark tabular-nums">{value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
