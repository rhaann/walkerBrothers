/**
 * KPI metric card for the dashboard overview strip.
 * Displays a single key metric with a label, value, and optional trend indicator.
 * Used for: Total Net Sales, Total Unit Sales, Top Product, Store Count.
 */

/** Direction of the trend compared to a prior period. */
type TrendDirection = "up" | "down" | "neutral";

interface KpiCardProps {
  /** Short label shown above the value (e.g. "Net Sales"). */
  label: string;
  /** The formatted value to display (e.g. "$42,310" or "1,204 units"). */
  value: string;
  /** Optional sub-label shown below the value (e.g. "last 30 days"). */
  subLabel?: string;
  /** Optional trend percentage string (e.g. "+12.4%"). */
  trend?: string;
  /** Direction of the trend — controls the color of the trend badge. */
  trendDirection?: TrendDirection;
  /** Show a loading skeleton instead of real content. */
  isLoading?: boolean;
}

/**
 * Returns the Tailwind color class for a trend badge based on direction.
 * Up = turquoise (positive), Down = orange (alert), Neutral = grey.
 */
function trendColor(direction: TrendDirection): string {
  if (direction === "up") return "text-[#00C6AC]";
  if (direction === "down") return "text-[#FF3000]";
  return "text-[#DCDCDC]";
}

/**
 * Arrow icon for the trend indicator.
 */
function TrendArrow({ direction }: { direction: TrendDirection }) {
  if (direction === "up") return <span>↑</span>;
  if (direction === "down") return <span>↓</span>;
  return <span>→</span>;
}

/**
 * Single KPI card. Renders a loading skeleton when isLoading is true.
 */
export default function KpiCard({
  label,
  value,
  subLabel,
  trend,
  trendDirection = "neutral",
  isLoading = false,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#002236] rounded-lg p-5 flex flex-col gap-2 animate-pulse">
        <div className="h-3.5 w-24 bg-[#002E47] rounded" />
        <div className="h-7 w-32 bg-[#002E47] rounded" />
        <div className="h-3 w-16 bg-[#002E47] rounded" />
      </div>
    );
  }

  return (
    <div className="bg-[#002236] rounded-lg p-5 flex flex-col gap-1">
      {/* Label */}
      <span className="text-xs font-medium text-[#DCDCDC] uppercase tracking-wide">
        {label}
      </span>

      {/* Value */}
      <span className="text-2xl font-semibold text-white leading-tight">
        {value}
      </span>

      {/* Sub-label and trend on the same row */}
      <div className="flex items-center gap-2 mt-0.5">
        {subLabel && (
          <span className="text-xs text-[#DCDCDC]">{subLabel}</span>
        )}
        {trend && (
          <span
            className={`text-xs font-medium flex items-center gap-0.5 ${trendColor(trendDirection)}`}
          >
            <TrendArrow direction={trendDirection} />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
