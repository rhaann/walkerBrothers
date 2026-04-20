"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartColors } from "@/lib/theme";

export interface SalesOverTimeDataPoint {
  date: string;
  netSales: number;
}

interface Props {
  data: SalesOverTimeDataPoint[];
  isLoading?: boolean;
}

function CustomTooltip({ active, payload, label, colors }: {
  active?: boolean;
  payload?: readonly { value: number }[];
  label?: string;
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

export default function SalesOverTimeChart({ data, isLoading = false }: Props) {
  const colors = useChartColors();

  if (isLoading) {
    return (
      <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-36 bg-[var(--ui-hover)] rounded" />
        <div className="h-56 bg-[var(--ui-hover)] rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest">Net Sales Over Time</h3>
        <div className="h-56 flex items-center justify-center text-sm text-[var(--ui-text-muted)]">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest">Net Sales Over Time</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: colors.axis, fontSize: 11 }} tickLine={false} axisLine={false} interval={Math.ceil(data.length / 7) - 1} />
            <YAxis tick={{ fill: colors.axis, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} width={40} />
            <Tooltip content={(props) => <CustomTooltip {...props} colors={colors} />} />
            <Line type="monotone" dataKey="netSales" stroke="#0090FF" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#0090FF", stroke: colors.tooltipBg, strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
