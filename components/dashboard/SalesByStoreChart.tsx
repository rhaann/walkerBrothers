/**
 * Bar chart showing net sales broken down by store.
 * Used in the main dashboard to identify top and bottom performing locations.
 * Powered by Recharts. Data is fetched by the dashboard page and passed as props.
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface SalesByStoreDataPoint {
  storeName: string;
  netSales: number;
}

interface SalesByStoreChartProps {
  data: SalesByStoreDataPoint[];
  isLoading?: boolean;
}

/**
 * Custom tooltip shown on bar hover.
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#002E47] border border-[#003A5C] rounded px-3 py-2 text-sm">
      <p className="text-[#DCDCDC] mb-1">{label}</p>
      <p className="text-white font-semibold">
        ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

/**
 * Renders a loading skeleton matching the chart height.
 */
function ChartSkeleton() {
  return (
    <div className="w-full h-full flex items-end gap-2 px-4 pb-4 animate-pulse">
      {[60, 85, 45, 70, 90, 55, 75, 40].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-[#002E47] rounded-t"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Bar chart: net sales by Whole Foods store location.
 * Truncates long store names for readability on the X axis.
 */
export default function SalesByStoreChart({
  data,
  isLoading = false,
}: SalesByStoreChartProps) {
  if (isLoading) {
    return (
      <div className="bg-[#002236] rounded-lg p-5 flex flex-col gap-3">
        <div className="h-4 w-32 bg-[#002E47] rounded animate-pulse" />
        <div className="h-56">
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#002236] rounded-lg p-5 flex flex-col gap-3">
        <h3 className="text-sm font-medium text-[#DCDCDC] uppercase tracking-wide">
          Net Sales by Store
        </h3>
        <div className="h-56 flex items-center justify-center text-sm text-[#DCDCDC]">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#002236] rounded-lg p-5 flex flex-col gap-3">
      <h3 className="text-sm font-medium text-[#DCDCDC] uppercase tracking-wide">
        Net Sales by Store
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#002E47" vertical={false} />
            <XAxis
              dataKey="storeName"
              tick={{ fill: "#DCDCDC", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              angle={-35}
              textAnchor="end"
              interval={0}
              // Truncate long store names
              tickFormatter={(name: string) =>
                name.length > 12 ? name.slice(0, 12) + "…" : name
              }
            />
            <YAxis
              tick={{ fill: "#DCDCDC", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#002E47" }} />
            <Bar dataKey="netSales" fill="#0090FF" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
