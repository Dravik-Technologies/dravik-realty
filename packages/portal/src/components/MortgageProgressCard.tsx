"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { ClientMortgage } from "@dravik/contracts/portal";
import { MORTGAGE_STAGES } from "@dravik/contracts/portal";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";

const STATUS_COLOR: Record<string, string> = {
  "Pre-Approval":          "#F59E0B",
  "Application Submitted": "#3B82F6",
  "Processing":            "#6366F1",
  "Underwriting":          "#8B5CF6",
  "Conditional Approval":  "#EC4899",
  "Clear to Close":        "#10B981",
  "Funded":                "#D4AF37",
};

interface Props {
  mortgage: ClientMortgage;
}

export default function MortgageProgressCard({ mortgage: m }: Props) {
  const currentIdx = MORTGAGE_STAGES.indexOf(m.status);
  const color = STATUS_COLOR[m.status] ?? "#D4AF37";

  return (
    <div className="bg-white rounded-2xl border border-line overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-line flex items-center justify-between">
        <div>
          <p className="font-bold text-axen-dark text-sm">{m.lender}</p>
          <p className="text-xs text-gray-400">{m.loanType} · {m.term}-year fixed</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full border"
          style={{ color, borderColor: `${color}40`, background: `${color}12` }}>
          {m.status}
        </span>
      </div>

      {/* Stage timeline */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Loan Progress</p>
        <div className="space-y-0">
          {MORTGAGE_STAGES.map((stage, i) => {
            const done   = i < currentIdx;
            const active = i === currentIdx;
            const future = i > currentIdx;
            return (
              <div key={stage} className="flex items-start gap-3">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    done   ? "bg-emerald-500" :
                    active ? "" : "bg-surface-2"
                  )}
                    style={active ? { background: color } : undefined}>
                    {done
                      ? <CheckCircle2 size={12} className="text-white" />
                      : active
                      ? <Clock size={10} className="text-white" />
                      : <Circle size={12} className="text-gray-300" />}
                  </div>
                  {i < MORTGAGE_STAGES.length - 1 && (
                    <div className={cn(
                      "w-px flex-1 my-0.5",
                      done ? "bg-emerald-300" : "bg-line"
                    )} style={{ minHeight: "18px" }} />
                  )}
                </div>
                <p className={cn(
                  "text-xs pb-3",
                  done   ? "text-emerald-600 font-semibold" :
                  active ? "font-bold text-axen-dark" :
                  future ? "text-gray-300" : "text-gray-400"
                )}>
                  {stage}
                  {active && <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: color }}>Current</span>}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-px bg-line border-t border-line">
        {[
          { label: "Approved Amount",  value: formatCurrency(m.approvedAmount)    },
          { label: "Interest Rate",    value: `${m.rate.toFixed(3)}%`             },
          { label: "Est. Monthly",     value: formatCurrency(m.monthlyPayment)    },
          { label: "Down Payment",     value: formatCurrency(m.downPayment)       },
          { label: "Est. Closing Cost",value: formatCurrency(m.closingCostEstimate)},
          { label: "Loan Term",        value: `${m.term} years`                  },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white px-4 py-3">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
            <p className="text-sm font-bold text-axen-dark mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Documents needed */}
      {m.documentsNeeded.length > 0 && (
        <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">
            Action Required — Documents Needed
          </p>
          <ul className="space-y-1">
            {m.documentsNeeded.map((doc) => (
              <li key={doc} className="flex items-center gap-2 text-xs text-amber-800">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {doc}
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-amber-600 mt-2">Upload in the Documents tab or contact your agent.</p>
        </div>
      )}

      {m.status === "Funded" && (
        <div className="px-5 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">Loan funded — transaction closed successfully.</p>
        </div>
      )}
    </div>
  );
}
