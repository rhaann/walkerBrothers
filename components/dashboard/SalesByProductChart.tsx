/**
 * Horizontal bar chart showing net sales broken down by product (item description).
 * Renders full-width — product names have more room and bars are easier to compare.
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

export interface SalesByProductDataPoint {
  itemDescription: string;
  netSales: number;
}

interface SalesByProductChartProps {
  data: SalesByProductDataPoint[];
  isLoading?: boolean;
  className?: string;
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
    <div className="bg-[#002E47] border border-[#003A5C] rounded px-3 py-2 text-sm max-w-72">
      <p className="text-[#DCDCDC] mb-1 leading-tight">{label}</p>
      <p className="text-white font-semibold">
        ${payload[0].value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}

/**
 * Horizontal bar chart: top products by net sales.
 * Now full-width — Y-axis labels have more room so fewer names need truncating.
 */
export default function SalesByProductChart({
  data,
  isLoading = false,
  className = "",
}: SalesByProductChartProps) {
  // Chart height grows with the number of products — 40px per bar, min 200px
  const chartHeight = Math.max(200, data.length * 40);

  if (isLoading) {
    return (
      <div className={`bg-[#002236] rounded-lg p-5 flex flex-col gap-3 animate-pulse ${className}`}>
        <div className="h-4 w-36 bg-[#002E47] rounded" />
        <div className="h-64 bg-[#002E47] rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-[#002236] rounded-lg p-5 flex flex-col gap-3 ${className}`}>
        <h3 className="text-sm font-medium text-[#DCDCDC] uppercase tracking-wide">
          Top Products by Net Sales
        </h3>
        <div className="h-64 flex items-center justify-center text-sm text-[#DCDCDC]">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#002236] rounded-lg p-5 flex flex-col gap-3 ${className}`}>
      <h3 className="text-sm font-medium text-[#DCDCDC] uppercase tracking-wide">
        Top Products by Net Sales
      </h3>
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#002E47" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#DCDCDC", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="itemDescription"
              tick={{ fill: "#DCDCDC", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={200}
              // Truncate only very long names — full name always visible in tooltip
              tickFormatter={(name: string) =>
                name.length > 30 ? name.slice(0, 30) + "…" : name
              }
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#002E47" }} />
            <Bar dataKey="netSales" fill="#00C6AC" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
