/**
 * Line chart showing daily net sales over a rolling time window.
 * Used in the dashboard to surface trends and spot anomalies.
 * Powered by Recharts. Data is fetched by the dashboard page and passed as props.
 */

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface SalesOverTimeDataPoint {
  /** Date string in 'YYYY-MM-DD' or short display format (e.g. 'May 12'). */
  date: string;
  netSales: number;
}

interface SalesOverTimeChartProps {
  data: SalesOverTimeDataPoint[];
  isLoading?: boolean;
}

/**
 * Custom tooltip shown on data point hover.
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
 * Line chart: daily net sales over the selected time window.
 */
export default function SalesOverTimeChart({
  data,
  isLoading = false,
}: SalesOverTimeChartProps) {
  if (isLoading) {
    return (
      <div className="bg-[#002236] rounded-lg p-5 flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-36 bg-[#002E47] rounded" />
        <div className="h-56 bg-[#002E47] rounded" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#002236] rounded-lg p-5 flex flex-col gap-3">
        <h3 className="text-sm font-medium text-[#DCDCDC] uppercase tracking-wide">
          Net Sales Over Time
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
        Net Sales Over Time
      </h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#002E47" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#DCDCDC", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              // Show every 7th label to avoid crowding
              interval={Math.ceil(data.length / 7) - 1}
            />
            <YAxis
              tick={{ fill: "#DCDCDC", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="netSales"
              stroke="#0090FF"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#0090FF", stroke: "#001A29", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
