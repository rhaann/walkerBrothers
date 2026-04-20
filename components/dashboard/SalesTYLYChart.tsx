"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useChartColors } from "@/lib/theme";

export interface SalesTYLYDataPoint {
  date: string;
  netSales: number;
  netSalesLY: number;
}

interface Props {
  data: SalesTYLYDataPoint[];
  isLoading?: boolean;
}

function CustomTooltip({ active, payload, label, colors }: {
  active?: boolean; payload?: readonly { value?: unknown; name?: string | number; color?: string }[]; label?: string | number;
  colors: ReturnType<typeof useChartColors>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: colors.tooltipBg, borderColor: colors.tooltipBorder }} className="border rounded px-3 py-2 text-xs">
      <p style={{ color: colors.tooltipMuted }} className="mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name === "netSales" ? "TY" : "LY"}: ${Number(p.value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export default function SalesTYLYChart({ data, isLoading = false }: Props) {
  const colors = useChartColors();

  if (isLoading) {
    return (
      <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-24 bg-[var(--ui-hover)] rounded" />
        <div className="h-48 bg-[var(--ui-hover)] rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest">Sales</h3>
        <div className="h-48 flex items-center justify-center text-sm text-[var(--ui-text-muted)]">No data</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--ui-card)] rounded-xl p-5 flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest">Sales</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: colors.axis, fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.ceil(data.length / 6) - 1} />
            <YAxis tick={{ fill: colors.axis, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} width={36} />
            <Tooltip content={(props) => <CustomTooltip {...props} colors={colors} />} />
            <Legend content={() => (
              <div style={{ display: "flex", gap: 16, justifyContent: "center", paddingTop: 8, fontSize: 11, color: colors.axis }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#0090FF" strokeWidth="2" /></svg>
                  TY
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#0077D1" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
                  LY
                </span>
              </div>
            )} />
            <Line type="monotone" dataKey="netSales" name="netSales" stroke="#0090FF" strokeWidth={2} dot={false} activeDot={{ r: 3, fill: "#0090FF" }} />
            <Line type="monotone" dataKey="netSalesLY" name="netSalesLY" stroke="#0077D1" strokeWidth={1.5} strokeDasharray="4 2" dot={false} activeDot={{ r: 3, fill: "#0077D1" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
