"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useChartColors } from "@/lib/theme";

export interface UnitsPerStoreDataPoint {
  date: string;
  unitsPerStore: number;
  unitsPerStoreLY: number;
}

interface Props {
  data: UnitsPerStoreDataPoint[];
  isLoading?: boolean;
}

function CustomTooltip({ active, payload, label, colors }: {
  active?: boolean; payload?: readonly { value: number; name: string; color: string }[]; label?: string;
  colors: ReturnType<typeof useChartColors>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: colors.tooltipBg, borderColor: colors.tooltipBorder }} className="border rounded px-3 py-2 text-xs">
      <p style={{ color: colors.tooltipMuted }} className="mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === "unitsPerStore" ? "TY" : "LY"}: {p.value.toFixed(1)}
        </p>
      ))}
    </div>
  );
}

export default function UnitsPerStoreChart({ data, isLoading = false }: Props) {
  const colors = useChartColors();

  if (isLoading) {
    return (
      <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-28 bg-[var(--ui-hover)] rounded" />
        <div className="h-48 bg-[var(--ui-hover)] rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest">Units / Store</h3>
        <div className="h-48 flex items-center justify-center text-sm text-[var(--ui-text-muted)]">No data</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest">Units / Store</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: colors.axis, fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.ceil(data.length / 6) - 1} />
            <YAxis tick={{ fill: colors.axis, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => v.toFixed(1)} width={36} />
            <Tooltip content={(props) => <CustomTooltip {...props} colors={colors} />} />
            <Legend wrapperStyle={{ fontSize: 11, color: colors.axis, paddingTop: 8 }} formatter={(value) => value === "unitsPerStore" ? "TY" : "LY"} />
            <Line type="monotone" dataKey="unitsPerStore" name="unitsPerStore" stroke="#00C6AC" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: "#00C6AC" }} />
            <Line type="monotone" dataKey="unitsPerStoreLY" name="unitsPerStoreLY" stroke="#FF3000" strokeWidth={1.5} strokeDasharray="4 2" dot={false} activeDot={{ r: 3, fill: "#FF3000" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
