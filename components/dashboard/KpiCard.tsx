type TrendDirection = "up" | "down" | "neutral";

interface KpiCardProps {
  label: string;
  value: string;
  subLabel?: string;
  trend?: string;
  trendDirection?: TrendDirection;
  isLoading?: boolean;
  /** Reduces value font size for long text like product names. */
  compact?: boolean;
}

function trendColor(direction: TrendDirection): string {
  if (direction === "up") return "text-[#00C6AC]";
  if (direction === "down") return "text-[#FF3000]";
  return "text-[var(--ui-text-dim)]";
}

function trendBg(direction: TrendDirection): string {
  if (direction === "up") return "bg-[#00C6AC]/10";
  if (direction === "down") return "bg-[#FF3000]/10";
  return "bg-[var(--ui-hover)]";
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
  compact = false,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[var(--ui-card)] rounded-xl p-4 flex flex-col gap-3 animate-pulse min-h-[110px]">
        <div className="h-3 w-20 bg-[var(--ui-hover)] rounded" />
        <div className="h-6 w-28 bg-[var(--ui-hover)] rounded" />
        <div className="h-5 w-16 bg-[var(--ui-hover)] rounded" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--ui-card)] rounded-xl p-4 flex flex-col gap-2 min-h-[110px]">
      <span className="text-[11px] font-semibold text-[var(--ui-text-dim)] uppercase tracking-widest truncate">
        {label}
      </span>
      <span
        className={`${compact ? "text-sm" : "text-xl"} font-bold text-[var(--ui-text)] leading-tight overflow-hidden`}
        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        title={value}
      >
        {value}
      </span>
      {trend && (
        <span className={`self-start text-[11px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${trendColor(trendDirection)} ${trendBg(trendDirection)}`}>
          <TrendArrow direction={trendDirection} />
          {trend}
        </span>
      )}
      {subLabel && !trend && (
        <span className="text-[11px] text-[var(--ui-text-dim)]">{subLabel}</span>
      )}
    </div>
  );
}
