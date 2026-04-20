"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartColors } from "@/lib/theme";

export interface SalesByStoreDataPoint {
  storeName: string;
  netSales: number;
}

interface Props {
  data: SalesByStoreDataPoint[];
  isLoading?: boolean;
}

function CustomTooltip({ active, payload, label, colors }: {
  active?: boolean; payload?: readonly { value: number }[]; label?: string;
  colors: ReturnType<typeof useChartColors>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: colors.tooltipBg, borderColor: colors.tooltipBorder }} className="border rounded px-3 py-2 text-sm">
      <p style={{ color: colors.tooltipMuted }} className="mb-1">{label}</p>
      <p style={{ color: colors.tooltipText }} className="font-semibold">
        ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

export default function SalesByStoreChart({ data, isLoading = false }: Props) {
  const colors = useChartColors();

  if (isLoading) {
    return (
      <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3">
        <div className="h-4 w-32 bg-[var(--ui-hover)] rounded animate-pulse" />
        <div className="h-56 bg-[var(--ui-hover)] rounded animate-pulse" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest">Net Sales by Store</h3>
        <div className="h-56 flex items-center justify-center text-sm text-[var(--ui-text-muted)]">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest">Net Sales by Store</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis dataKey="storeName" tick={{ fill: colors.axis, fontSize: 11 }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} tickFormatter={(n: string) => n.length > 12 ? n.slice(0, 12) + "…" : n} />
            <YAxis tick={{ fill: colors.axis, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} width={40} />
            <Tooltip content={(props) => <CustomTooltip {...props} colors={colors} />} cursor={{ fill: colors.cursor }} />
            <Bar dataKey="netSales" fill="#0090FF" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
