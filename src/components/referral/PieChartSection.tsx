"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrencyFull } from "@/lib/utils";

const GOLD  = "#D4AF37";
const TEAL  = "#4A90A4";
const NAVY  = "#1A1A2E";
const COLORS = [TEAL, GOLD, NAVY];

interface ChartSlice { name: string; value: number; }

interface LabelProps {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number;
}
function CustomLabel({
  cx = 0, cy = 0, midAngle = 0,
  innerRadius = 0, outerRadius = 0, percent = 0,
}: LabelProps) {
  if (percent < 0.04) return null;
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle"
      dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

interface TooltipPayload { name: string; value: number; }
function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-line rounded-xl px-4 py-2 shadow-lg text-sm">
      <p className="font-semibold text-axen-dark">{payload[0].name}</p>
      <p className="text-gold font-bold">{formatCurrencyFull(payload[0].value)}</p>
    </div>
  );
}

export default function PieChartSection({ data }: { data: ChartSlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          labelLine={false}
          label={(props) => <CustomLabel {...props} />}
          strokeWidth={2}
          stroke="#ffffff"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
            <span style={{ fontSize: 12, fontWeight: 500, color: "#1A1A2E" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
