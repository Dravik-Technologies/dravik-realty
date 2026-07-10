"use client";

import { useState } from "react";
import {
  Calculator, TrendingUp, Home, DollarSign,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

// ─── Slider row ───────────────────────────────────────────────
function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label:    string;
  value:    number;
  min:      number;
  max:      number;
  step:     number;
  format:   (v: number) => string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-gray-500">{label}</span>
        <span className="text-[11px] font-bold text-dravik-dark tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        className="gold-slider w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--color-gold) ${pct}%, var(--color-surface-2) ${pct}%)`,
        }}
      />
      <div className="flex justify-between">
        <span className="text-[9px] text-gray-300">{format(min)}</span>
        <span className="text-[9px] text-gray-300">{format(max)}</span>
      </div>
    </div>
  );
}

// ─── Result chip ──────────────────────────────────────────────
function ResultChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn(
      "rounded-xl p-3 text-center",
      accent ? "bg-gold text-dravik-dark" : "bg-surface-2"
    )}>
      <p className={cn("text-lg font-bold tabular-nums leading-none", accent ? "text-dravik-dark" : "text-dravik-dark")}>
        {value}
      </p>
      <p className={cn("text-[10px] mt-1", accent ? "text-dravik-dark/70" : "text-gray-400")}>{label}</p>
    </div>
  );
}

// ─── Rate table ───────────────────────────────────────────────
const RATE_TABLE: Record<string, Record<string, number>> = {
  Conventional: { "760+": 6.50, "720-759": 6.875, "680-719": 7.25, "<680": 8.125 },
  FHA:          { "760+": 6.75, "720-759": 7.000, "680-719": 7.375, "<680": 7.875 },
  VA:           { "760+": 6.25, "720-759": 6.500, "680-719": 6.875, "<680": 7.500 },
  Jumbo:        { "760+": 7.00, "720-759": 7.250, "680-719": 7.750, "<680": 8.500 },
};
const CREDIT_TIERS = ["760+", "720-759", "680-719", "<680"] as const;
const LOAN_TYPES   = ["Conventional", "FHA", "VA", "Jumbo"] as const;

// ─── Mortgage math helpers ────────────────────────────────────
function calcMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return Math.round(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

function calcMaxLoan(monthlyPayment: number, annualRate: number, termYears: number): number {
  if (monthlyPayment <= 0 || annualRate <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return Math.round(monthlyPayment * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
}

function rateForScore(score: number, loanType: string): number {
  const table = RATE_TABLE[loanType] ?? RATE_TABLE.Conventional;
  if (score >= 760) return table["760+"];
  if (score >= 720) return table["720-759"];
  if (score >= 680) return table["680-719"];
  return table["<680"];
}

// ─── 1. Pre-Qual Calculator ───────────────────────────────────
function PreQualCalc() {
  const [income,  setIncome]  = useState(120_000);
  const [debts,   setDebts]   = useState(800);
  const [down,    setDown]    = useState(40_000);
  const [score,   setScore]   = useState(730);

  const rate         = rateForScore(score, "Conventional");
  const monthlyInc   = income / 12;
  const frontLimit   = Math.max(0, Math.round(monthlyInc * 0.28 - 480)); // 28% housing ratio - est taxes/ins
  const backLimit    = Math.max(0, Math.round(monthlyInc * 0.43 - debts - 480));
  const maxPI        = Math.min(frontLimit, backLimit);
  const maxLoan      = calcMaxLoan(maxPI, rate, 30);
  const maxPurchase  = maxLoan + down;
  const dti          = monthlyInc > 0
    ? Math.round(((maxPI + debts + 480) / monthlyInc) * 100)
    : 0;

  const scoreTier = score >= 760 ? "Excellent" : score >= 720 ? "Good" : score >= 680 ? "Fair" : "Below Avg";

  return (
    <div className="bg-white border border-line rounded-2xl p-5 flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gold-light flex items-center justify-center">
          <Calculator size={16} className="text-gold" />
        </div>
        <div>
          <p className="text-sm font-bold text-dravik-dark">Pre-Qual Calculator</p>
          <p className="text-[10px] text-gray-400">Estimate maximum loan amount</p>
        </div>
      </div>

      <div className="space-y-4">
        <SliderRow
          label="Annual Household Income"
          value={income}
          min={30_000} max={500_000} step={5_000}
          format={(v) => formatCurrency(v)}
          onChange={setIncome}
        />
        <SliderRow
          label="Monthly Debt Payments"
          value={debts}
          min={0} max={5_000} step={50}
          format={(v) => `${formatCurrency(v)}/mo`}
          onChange={setDebts}
        />
        <SliderRow
          label="Down Payment"
          value={down}
          min={0} max={300_000} step={5_000}
          format={(v) => formatCurrency(v)}
          onChange={setDown}
        />
        <SliderRow
          label={`Credit Score — ${scoreTier}`}
          value={score}
          min={580} max={850} step={1}
          format={(v) => String(v)}
          onChange={setScore}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ResultChip label="Max Loan"      value={maxLoan > 0 ? formatCurrency(maxLoan) : "—"} accent />
        <ResultChip label="Max Purchase"  value={maxPurchase > 0 ? formatCurrency(maxPurchase) : "—"} />
        <ResultChip label="Est. Rate"     value={`${rate}%`} />
        <ResultChip label="Backend DTI"   value={`${dti}%`} />
      </div>

      <p className="text-[9px] text-gray-300 text-center">
        Estimates based on 28/43 DTI guidelines. Actual approval subject to underwriting.
      </p>
    </div>
  );
}

// ─── 2. Rate Estimator ────────────────────────────────────────
function RateEstimator() {
  const [loanType, setLoanType] = useState<typeof LOAN_TYPES[number]>("Conventional");
  const table = RATE_TABLE[loanType];

  return (
    <div className="bg-white border border-line rounded-2xl p-5 flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
          <TrendingUp size={16} className="text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-dravik-dark">Rate Estimator</p>
          <p className="text-[10px] text-gray-400">Indicative rates by credit score</p>
        </div>
      </div>

      {/* Loan type selector */}
      <div className="flex flex-wrap gap-1.5">
        {LOAN_TYPES.map((lt) => (
          <button
            key={lt}
            onClick={() => setLoanType(lt)}
            className={cn(
              "px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors",
              loanType === lt
                ? "bg-dravik-dark text-white border-dravik-dark"
                : "bg-surface-2 text-gray-500 border-line hover:border-dravik-dark"
            )}
          >
            {lt}
          </button>
        ))}
      </div>

      {/* Rate grid */}
      <div className="space-y-2">
        {CREDIT_TIERS.map((tier) => {
          const rate = table[tier];
          const isTop = tier === "760+";
          return (
            <div
              key={tier}
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-3",
                isTop ? "bg-gold-light border border-gold/30" : "bg-surface-2"
              )}
            >
              <div>
                <p className={cn("text-xs font-bold", isTop ? "text-gold-dark" : "text-dravik-dark")}>
                  Credit {tier}
                </p>
                <p className="text-[10px] text-gray-400">
                  {tier === "760+" ? "Excellent" : tier === "720-759" ? "Good" : tier === "680-719" ? "Fair" : "Below Avg"}
                </p>
              </div>
              <div className="text-right">
                <p className={cn("text-lg font-bold tabular-nums", isTop ? "text-gold" : "text-dravik-dark")}>
                  {rate.toFixed(3)}%
                </p>
                <p className="text-[9px] text-gray-400">30-yr fixed</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] text-gray-300 text-center">
        Rates are indicative. Actual rate depends on LTV, property type, and market conditions.
      </p>
    </div>
  );
}

// ─── 3. Affordability Calculator ─────────────────────────────
function AffordabilityCalc() {
  const [targetPITI, setTargetPITI] = useState(3_500);
  const [rate,       setRate]       = useState(6.875);
  const [term,       setTerm]       = useState<15 | 20 | 30>(30);
  const [taxes,      setTaxes]      = useState(480);
  const [insurance,  setInsurance]  = useState(120);
  const [downPct,    setDownPct]    = useState(10);

  const maxPI       = Math.max(0, targetPITI - taxes - insurance);
  const maxLoan     = calcMaxLoan(maxPI, rate, term);
  const maxPurchase = downPct > 0 ? Math.round(maxLoan / (1 - downPct / 100)) : maxLoan;
  const downAmt     = maxPurchase - maxLoan;

  return (
    <div className="bg-white border border-line rounded-2xl p-5 flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Home size={16} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-dravik-dark">Affordability Calculator</p>
          <p className="text-[10px] text-gray-400">Target payment → max purchase price</p>
        </div>
      </div>

      <div className="space-y-4">
        <SliderRow
          label="Target Monthly PITI"
          value={targetPITI}
          min={500} max={15_000} step={50}
          format={(v) => `${formatCurrency(v)}/mo`}
          onChange={setTargetPITI}
        />
        <SliderRow
          label="Interest Rate"
          value={rate}
          min={3} max={12} step={0.125}
          format={(v) => `${v.toFixed(3)}%`}
          onChange={setRate}
        />
        <SliderRow
          label="Down Payment"
          value={downPct}
          min={0} max={40} step={1}
          format={(v) => `${v}%`}
          onChange={setDownPct}
        />
        <SliderRow
          label="Est. Monthly Taxes"
          value={taxes}
          min={100} max={3_000} step={50}
          format={(v) => `${formatCurrency(v)}/mo`}
          onChange={setTaxes}
        />
        <SliderRow
          label="Monthly Insurance"
          value={insurance}
          min={50} max={500} step={10}
          format={(v) => `${formatCurrency(v)}/mo`}
          onChange={setInsurance}
        />

        {/* Term buttons */}
        <div>
          <p className="text-[11px] text-gray-500 mb-1.5">Loan Term</p>
          <div className="flex gap-2">
            {([15, 20, 30] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTerm(t)}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors",
                  term === t
                    ? "bg-dravik-dark text-white border-dravik-dark"
                    : "bg-surface-2 text-gray-500 border-line hover:border-dravik-dark"
                )}
              >
                {t}yr
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ResultChip label="Max Purchase"  value={maxPurchase > 0 ? formatCurrency(maxPurchase) : "—"} accent />
        <ResultChip label="Max Loan"      value={maxLoan > 0 ? formatCurrency(maxLoan) : "—"} />
        <ResultChip label="Down Payment"  value={downAmt > 0 ? formatCurrency(downAmt) : "—"} />
        <ResultChip label="Monthly P&I"   value={maxPI > 0 ? formatCurrency(Math.round(maxPI)) : "—"} />
      </div>
    </div>
  );
}

// ─── 4. Payment Breakdown ─────────────────────────────────────
function PaymentBreakdown() {
  const [price,    setPrice]    = useState(550_000);
  const [downPct,  setDownPct]  = useState(20);
  const [rate,     setRate]     = useState(6.875);
  const [term,     setTerm]     = useState<15 | 20 | 30>(30);
  const [taxRate,  setTaxRate]  = useState(1.1);  // annual % of purchase price
  const [insPct]               = useState(0.35); // annual % of purchase price — fixed at 0.35%

  const loan         = Math.round(price * (1 - downPct / 100));
  const monthlyPI    = calcMonthlyPayment(loan, rate, term);
  const monthlyTax   = Math.round((price * taxRate / 100) / 12);
  const monthlyIns   = Math.round((price * insPct / 100) / 12);
  const totalPITI    = monthlyPI + monthlyTax + monthlyIns;
  const totalInterest = monthlyPI > 0 ? monthlyPI * term * 12 - loan : 0;

  const items = [
    { label: "Principal + Interest", amount: monthlyPI,  color: "#D4AF37", pct: totalPITI > 0 ? Math.round(monthlyPI / totalPITI * 100) : 0 },
    { label: "Property Tax",         amount: monthlyTax, color: "#6366F1", pct: totalPITI > 0 ? Math.round(monthlyTax / totalPITI * 100) : 0 },
    { label: "Homeowner's Ins.",      amount: monthlyIns, color: "#10B981", pct: totalPITI > 0 ? Math.round(monthlyIns / totalPITI * 100) : 0 },
  ];

  return (
    <div className="bg-white border border-line rounded-2xl p-5 flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
          <DollarSign size={16} className="text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-dravik-dark">Payment Breakdown</p>
          <p className="text-[10px] text-gray-400">Full PITI breakdown</p>
        </div>
      </div>

      <div className="space-y-4">
        <SliderRow
          label="Purchase Price"
          value={price}
          min={100_000} max={3_000_000} step={10_000}
          format={(v) => formatCurrency(v)}
          onChange={setPrice}
        />
        <SliderRow
          label="Down Payment"
          value={downPct}
          min={0} max={40} step={1}
          format={(v) => `${v}%`}
          onChange={setDownPct}
        />
        <SliderRow
          label="Interest Rate"
          value={rate}
          min={3} max={12} step={0.125}
          format={(v) => `${v.toFixed(3)}%`}
          onChange={setRate}
        />
        <SliderRow
          label="Annual Property Tax Rate"
          value={taxRate}
          min={0.5} max={3} step={0.05}
          format={(v) => `${v.toFixed(2)}%`}
          onChange={setTaxRate}
        />

        {/* Term */}
        <div>
          <p className="text-[11px] text-gray-500 mb-1.5">Loan Term</p>
          <div className="flex gap-2">
            {([15, 20, 30] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTerm(t)}
                className={cn(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors",
                  term === t
                    ? "bg-dravik-dark text-white border-dravik-dark"
                    : "bg-surface-2 text-gray-500 border-line hover:border-dravik-dark"
                )}
              >
                {t}yr
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Big PITI number */}
      <div className="bg-dravik-dark rounded-2xl px-5 py-4 text-center">
        <p className="text-[10px] text-gray-400 mb-1">Est. Monthly PITI</p>
        <p className="text-3xl font-bold text-white tabular-nums">{totalPITI > 0 ? formatCurrency(totalPITI) : "—"}</p>
        <p className="text-[10px] text-gray-400 mt-1">
          Loan: {formatCurrency(loan)} · Total interest: {formatCurrency(totalInterest)}
        </p>
      </div>

      {/* Breakdown bars */}
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-[11px] text-gray-500">{item.label}</span>
              </div>
              <span className="text-[11px] font-bold text-dravik-dark tabular-nums">
                {formatCurrency(item.amount)}/mo
                <span className="text-gray-400 font-normal ml-1">({item.pct}%)</span>
              </span>
            </div>
            <div className="h-2 bg-line rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${item.pct}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-gray-400">
        <ChevronRight size={11} className="text-gray-300" />
        PMI not included. Required when LTV &gt; 80% on conventional loans (~0.5–1.5%/yr of loan).
      </div>
    </div>
  );
}

// ─── PreQualCalculator (main export) ──────────────────────────
export default function PreQualCalculator() {
  return (
    <div className="px-6 py-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <PreQualCalc />
        <RateEstimator />
        <AffordabilityCalc />
        <PaymentBreakdown />
      </div>
    </div>
  );
}
