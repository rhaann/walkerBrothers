"use client";

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

export default function DateRangeFilter({ selected, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-1 bg-[var(--ui-card)] rounded-lg p-1">
      {DATE_RANGE_OPTIONS.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`
            px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150
            ${selected === value
              ? "bg-[#0077D1] text-white"
              : "text-[var(--ui-text-muted)] hover:text-[var(--ui-text)] hover:bg-[var(--ui-hover)]"
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
