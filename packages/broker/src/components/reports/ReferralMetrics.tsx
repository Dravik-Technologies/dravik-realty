"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { ReferralPartner } from "@/types/analytics";
import { formatCurrency } from "@dravik/shared";
import { cn } from "@dravik/shared";
import { Users, Building2, User, TrendingUp } from "lucide-react";

// ─── Pie tooltip ─────────────────────────────────────────────
interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function PieTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white border border-line rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-bold text-axen-dark">{p.name}</p>
      <p className="text-sm font-bold" style={{ color: p.payload.color }}>{p.value}</p>
    </div>
  );
}

// ─── Type icon (module level) ─────────────────────────────────
function TypeIcon({ type }: { type: ReferralPartner["type"] }) {
  const Icon =
    type === "agent"   ? User       :
    type === "company" ? Building2  : Users;
  return <Icon size={12} className="text-gray-400 flex-shrink-0" />;
}

// ─── Partner row (module level) ───────────────────────────────
function PartnerRow({ p, topFee }: { p: ReferralPartner; topFee: number }) {
  const total    = p.sent + p.received;
  const rate     = total > 0 ? Math.round((p.closed / total) * 100) : 0;
  const barWidth = topFee > 0 ? (p.totalFees / topFee) * 100 : 0;

  return (
    <div className="py-3 border-b border-line last:border-0">
      <div className="flex items-center gap-3">
        <TypeIcon type={p.type} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-axen-dark truncate">{p.name}</p>
          <p className="text-[10px] text-gray-400 capitalize">{p.type}</p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="text-[11px] font-bold text-axen-dark">{p.sent + p.received}</p>
          <p className="text-[9px] text-gray-400">total</p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="text-[11px] font-bold text-emerald-600">{p.closed}</p>
          <p className="text-[9px] text-gray-400">closed</p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className={cn("text-[11px] font-bold", rate >= 50 ? "text-gold" : "text-gray-500")}>{rate}%</p>
          <p className="text-[9px] text-gray-400">rate</p>
        </div>
        {p.totalFees > 0 && (
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold text-gold">{formatCurrency(p.totalFees)}</p>
            <p className="text-[9px] text-gray-400">fees</p>
          </div>
        )}
      </div>
      {p.totalFees > 0 && (
        <div className="mt-2 h-1 bg-surface-2 rounded-full overflow-hidden ml-5">
          <div className="h-full bg-gold rounded-full" style={{ width: `${barWidth}%` }} />
        </div>
      )}
    </div>
  );
}

// ─── ReferralMetrics ─────────────────────────────────────────
interface Props {
  partners: ReferralPartner[];
  referralsSent: number;
  referralsReceived: number;
  referralSuccessRate: number;
  avgReferralFee: number;
  referralRevenue: number;
}

export default function ReferralMetrics({
  partners, referralsSent, referralsReceived,
  referralSuccessRate, avgReferralFee, referralRevenue,
}: Props) {
  const pieData = [
    { name: "Sent",     value: referralsSent,     color: "#D4AF37" },
    { name: "Received", value: referralsReceived,  color: "#3B82F6" },
  ];

  const topFee = Math.max(...partners.map((p) => p.totalFees), 1);

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Sent",         value: referralsSent,                    accent: "#D4AF37" },
          { label: "Received",     value: referralsReceived,                accent: "#3B82F6" },
          { label: "Success Rate", value: `${referralSuccessRate}%`,        accent: "#10B981" },
          { label: "Avg Fee",      value: formatCurrency(avgReferralFee),   accent: "#8B5CF6" },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white rounded-2xl border border-line px-4 py-3">
            <p className="text-xl font-bold text-axen-dark" style={{ color: accent }}>{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pie + partner table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Donut chart */}
        <div className="bg-white rounded-2xl border border-line p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-gold" />
            <p className="text-sm font-bold text-axen-dark">Sent vs Received</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                formatter={(value) => <span style={{ fontSize: 11, color: "#6B7280" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="text-center -mt-2">
            <p className="text-2xl font-bold text-axen-dark">{referralsSent + referralsReceived}</p>
            <p className="text-xs text-gray-400">Total referrals</p>
          </div>
          <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
            <p className="text-xs text-gray-400">Total revenue</p>
            <p className="text-sm font-bold text-gold">{formatCurrency(referralRevenue)}</p>
          </div>
        </div>

        {/* Partner table */}
        <div className="bg-white rounded-2xl border border-line p-5">
          <p className="text-sm font-bold text-axen-dark mb-1">Top Partners</p>
          <p className="text-xs text-gray-400 mb-3">By referrals exchanged</p>
          <div>
            {partners
              .slice()
              .sort((a, b) => (b.sent + b.received) - (a.sent + a.received))
              .map((p) => (
                <PartnerRow key={p.id} p={p} topFee={topFee} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
