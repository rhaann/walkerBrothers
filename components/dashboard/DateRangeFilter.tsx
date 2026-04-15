/**
 * Date range filter toggle for the dashboard.
 * Renders a pill-style button group for selecting a rolling time window.
 * The selected value is lifted to the parent — this component is purely presentational.
 */

"use client";

/** Supported rolling time windows in days. */
export type DateRangeDays = 30 | 60 | 90 | 365;

export const DATE_RANGE_OPTIONS: { label: string; value: DateRangeDays }[] = [
  { label: "30D", value: 30 },
  { label: "60D", value: 60 },
  { label: "90D", value: 90 },
  { label: "1Y", value: 365 },
];

interface DateRangeFilterProps {
  selected: DateRangeDays;
  onChange: (value: DateRangeDays) => void;
}

/**
 * Pill-style toggle group for selecting a rolling date range.
 * Active option is highlighted with the primary blue; inactive options
 * use a subtle dark surface so they don't compete with chart data.
 */
export default function DateRangeFilter({ selected, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-[#002236] rounded-lg p-1">
      {DATE_RANGE_OPTIONS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`
            px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150
            ${selected === value
              ? "bg-[#0077D1] text-white"
              : "text-[#DCDCDC] hover:text-white hover:bg-[#002E47]"
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
