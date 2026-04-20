"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface SalesTYLYDataPoint {
  date: string;
  netSales: number;
  netSalesLY: number;
}

interface Props {
  data: SalesTYLYDataPoint[];
  isLoading?: boolean;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#002E47] border border-[#003A5C] rounded px-3 py-2 text-xs">
      <p className="text-[#DCDCDC] mb-1.5">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: ${p.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  );
}

export default function SalesTYLYChart({ data, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <div className="bg-[#002236] rounded-xl p-5 flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-24 bg-[#002E47] rounded" />
        <div className="h-48 bg-[#002E47] rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#002236] rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-xs font-semibold text-[#8A9BB0] uppercase tracking-widest">Sales</h3>
        <div className="h-48 flex items-center justify-center text-sm text-[#DCDCDC]">No data</div>
      </div>
    );
  }

  const interval = Math.ceil(data.length / 6) - 1;

  return (
    <div className="bg-[#002236] rounded-xl p-5 flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-[#8A9BB0] uppercase tracking-widest">Sales</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#002E47" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8A9BB0", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={interval}
            />
            <YAxis
              tick={{ fill: "#8A9BB0", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#8A9BB0", paddingTop: 8 }}
              formatter={(value) => value === "netSales" ? "TY" : "LY"}
            />
            <Line
              type="monotone"
              dataKey="netSales"
              name="netSales"
              stroke="#0090FF"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: "#0090FF" }}
            />
            <Line
              type="monotone"
              dataKey="netSalesLY"
              name="netSalesLY"
              stroke="#FF3000"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 3, fill: "#FF3000" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
