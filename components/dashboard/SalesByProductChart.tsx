"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartColors } from "@/lib/theme";

export interface SalesByProductDataPoint {
  itemDescription: string;
  netSales: number;
}

interface Props {
  data: SalesByProductDataPoint[];
  isLoading?: boolean;
  className?: string;
}

function CustomTooltip({ active, payload, label, colors }: {
  active?: boolean; payload?: readonly { value?: unknown }[]; label?: string | number;
  colors: ReturnType<typeof useChartColors>;
}) {
  if (!active || !payload?.length) return null;
  const val = Number(payload[0].value ?? 0);
  return (
    <div style={{ background: colors.tooltipBg, borderColor: colors.tooltipBorder }} className="border rounded px-3 py-2 text-sm max-w-72">
      <p style={{ color: colors.tooltipMuted }} className="mb-1 leading-tight">{label}</p>
      <p style={{ color: colors.tooltipText }} className="font-semibold">
        ${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function SalesByProductChart({ data, isLoading = false, className = "" }: Props) {
  const colors = useChartColors();
  const chartHeight = Math.max(200, data.length * 40);

  if (isLoading) {
    return (
      <div className={`bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3 animate-pulse ${className}`}>
        <div className="h-4 w-36 bg-[var(--ui-hover)] rounded" />
        <div className="h-64 bg-[var(--ui-hover)] rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3 ${className}`}>
        <h3 className="text-xs font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest">Top Products by Net Sales</h3>
        <div className="h-64 flex items-center justify-center text-sm text-[var(--ui-text-muted)]">No data available</div>
      </div>
    );
  }

  return (
    <div className={`bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3 ${className}`}>
      <h3 className="text-xs font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest">Top Products by Net Sales</h3>
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
            <XAxis type="number" tick={{ fill: colors.axis, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="itemDescription" tick={{ fill: colors.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={200} tickFormatter={(n: string) => n.length > 30 ? n.slice(0, 30) + "…" : n} />
            <Tooltip content={(props) => <CustomTooltip {...props} colors={colors} />} cursor={{ fill: colors.cursor }} />
            <Bar dataKey="netSales" fill="#00C6AC" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
