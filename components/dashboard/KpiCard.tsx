/**
 * KPI metric card for the dashboard overview strip.
 * Displays a single key metric with a label, value, and optional trend indicator.
 */

type TrendDirection = "up" | "down" | "neutral";

interface KpiCardProps {
  label: string;
  value: string;
  subLabel?: string;
  trend?: string;
  trendDirection?: TrendDirection;
  isLoading?: boolean;
}

function trendColor(direction: TrendDirection): string {
  if (direction === "up") return "text-[#00C6AC]";
  if (direction === "down") return "text-[#FF3000]";
  return "text-[#8A9BB0]";
}

function trendBg(direction: TrendDirection): string {
  if (direction === "up") return "bg-[#00C6AC]/10";
  if (direction === "down") return "bg-[#FF3000]/10";
  return "bg-[#002E47]";
}

function TrendArrow({ direction }: { direction: TrendDirection }) {
  if (direction === "up") return <span>↑</span>;
  if (direction === "down") return <span>↓</span>;
  return <span>→</span>;
}

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
      <div className="bg-[#002236] rounded-xl p-4 flex flex-col gap-3 animate-pulse min-h-[110px]">
        <div className="h-3 w-20 bg-[#002E47] rounded" />
        <div className="h-6 w-28 bg-[#002E47] rounded" />
        <div className="h-5 w-16 bg-[#002E47] rounded" />
      </div>
    );
  }

  return (
    <div className="bg-[#002236] rounded-xl p-4 flex flex-col gap-2 min-h-[110px]">
      {/* Label */}
      <span className="text-[11px] font-semibold text-[#8A9BB0] uppercase tracking-widest truncate">
        {label}
      </span>

      {/* Value */}
      <span
        className="text-xl font-bold text-white leading-tight overflow-hidden"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
        title={value}
      >
        {value}
      </span>

      {/* Trend badge */}
      {trend && (
        <span
          className={`self-start text-[11px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${trendColor(trendDirection)} ${trendBg(trendDirection)}`}
        >
          <TrendArrow direction={trendDirection} />
          {trend}
        </span>
      )}

      {/* Sub-label */}
      {subLabel && !trend && (
        <span className="text-[11px] text-[#8A9BB0]">{subLabel}</span>
      )}
    </div>
  );
}
