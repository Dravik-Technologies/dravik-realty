"use client";

import { useState } from "react";
import { DollarSign, CreditCard, Users, TrendingUp } from "lucide-react";
import { COMMISSION_TIERS } from "@/data/settings";
import type { CommissionTier } from "@/types/settings";
import { cn } from "@/lib/utils";

// ─── Split ring visual ────────────────────────────────────────
function SplitBar({ agent, company }: { agent: number; company: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-line rounded-full overflow-hidden flex">
        <div className="h-full bg-gold rounded-l-full transition-all duration-300" style={{ width: `${agent}%` }} />
        <div className="h-full bg-axen-dark rounded-r-full transition-all duration-300" style={{ width: `${company}%` }} />
      </div>
      <span className="text-[10px] text-gray-400 tabular-nums whitespace-nowrap">
        <span className="text-gold font-bold">{agent}%</span> / {company}%
      </span>
    </div>
  );
}

// ─── CommissionBilling ────────────────────────────────────────
export default function CommissionBilling({ onSave }: { onSave: () => void }) {
  const [tiers, setTiers] = useState<CommissionTier[]>(COMMISSION_TIERS);

  function updateSplit(id: string, field: "agentSplit" | "compSplit", value: number) {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const other = 100 - value;
        return field === "agentSplit"
          ? { ...t, agentSplit: value, compSplit: other }
          : { ...t, compSplit: value, agentSplit: other };
      })
    );
  }

  return (
    <div className="space-y-6">

      {/* Commission tiers */}
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-gold" />
            <div>
              <h3 className="text-sm font-bold text-axen-dark">Commission Split Rules</h3>
              <p className="text-xs text-gray-400 mt-0.5">Agent % · Company %</p>
            </div>
          </div>
          <button
            onClick={onSave}
            className="px-3 py-1.5 bg-gold text-axen-dark text-xs font-bold rounded-xl hover:bg-gold-dark transition-colors"
          >
            Save Rules
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2">
              <th className="text-left px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tier</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Condition</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Split (Agent / Co.)</th>
              <th className="px-4 py-3 w-32 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adj.</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr key={tier.id} className="border-b border-line last:border-0 hover:bg-surface/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={13} className="text-gray-300 flex-shrink-0" />
                    <span className="text-xs font-semibold text-axen-dark">{tier.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <span className="text-[11px] text-gray-400">{tier.condition}</span>
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-[200px]">
                    <SplitBar agent={tier.agentSplit} company={tier.compSplit} />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={50} max={95} step={1}
                      value={tier.agentSplit}
                      onChange={(e) => updateSplit(tier.id, "agentSplit", Math.min(95, Math.max(50, Number(e.target.value))))}
                      className="w-14 px-2 py-1 text-xs border border-line rounded-lg text-axen-dark bg-surface text-center focus:outline-none focus:border-gold transition tabular-nums"
                    />
                    <span className="text-[10px] text-gray-400">%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subscription & Billing */}
      <div className="bg-white border border-line rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <CreditCard size={16} className="text-gold" />
          <div>
            <h3 className="text-sm font-bold text-axen-dark">Subscription & Billing</h3>
            <p className="text-xs text-gray-400 mt-0.5">Current plan and payment details.</p>
          </div>
        </div>

        {/* Plan card */}
        <div className="bg-axen-dark rounded-2xl p-5 mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-gold uppercase tracking-widest">AxenONE Pro</span>
            </div>
            <p className="text-2xl font-bold text-white">$499<span className="text-sm font-normal text-gray-400">/mo</span></p>
            <p className="text-xs text-gray-400 mt-1">Billed monthly · Renews Jun 1, 2026</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">Seats used</p>
            <p className="text-lg font-bold text-white">24 <span className="text-gray-400 text-sm font-normal">/ 50</span></p>
            <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-gold rounded-full" style={{ width: "48%" }} />
            </div>
          </div>
        </div>

        {/* Payment method + invoice row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-surface-2 rounded-xl px-4 py-3">
            <CreditCard size={16} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-axen-dark">Visa ending 4242</p>
              <p className="text-[10px] text-gray-400">Expires 08/27</p>
            </div>
            <button disabled title="Payment method update coming soon" className="ml-auto text-[10px] font-semibold text-gray-300 cursor-not-allowed">Update</button>
          </div>
          <div className="flex items-center gap-3 bg-surface-2 rounded-xl px-4 py-3">
            <Users size={16} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-axen-dark">Billing Contact</p>
              <p className="text-[10px] text-gray-400">chris@axenrealty.com</p>
            </div>
            <button disabled title="Billing contact edit coming soon" className="ml-auto text-[10px] font-semibold text-gray-300 cursor-not-allowed">Edit</button>
          </div>
        </div>

        {/* Invoice history */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">Recent Invoices</p>
          <div className="space-y-2">
            {[
              { date: "May 1, 2026",  amount: "$499.00", status: "Paid" },
              { date: "Apr 1, 2026",  amount: "$499.00", status: "Paid" },
              { date: "Mar 1, 2026",  amount: "$499.00", status: "Paid" },
            ].map((inv) => (
              <div key={inv.date} className={cn(
                "flex items-center justify-between px-4 py-2.5 rounded-xl bg-surface-2"
              )}>
                <span className="text-xs text-gray-500">{inv.date}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-axen-dark tabular-nums">{inv.amount}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{inv.status}</span>
                  <button disabled title="Invoice PDF download coming soon" className="text-[10px] font-semibold text-gray-300 cursor-not-allowed">PDF</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
