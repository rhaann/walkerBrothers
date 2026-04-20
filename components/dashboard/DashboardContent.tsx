/**
 * Client component that owns the dashboard's interactive state.
 * Fetches real data from /api/charts/* on mount and whenever the
 * date range filter changes. Shows loading skeletons while fetching.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import KpiCard from "./KpiCard";
import SalesByStoreChart from "./SalesByStoreChart";
import SalesOverTimeChart from "./SalesOverTimeChart";
import SalesByProductChart from "./SalesByProductChart";
import SalesTYLYChart from "./SalesTYLYChart";
import UnitsPerStoreChart from "./UnitsPerStoreChart";
import DateRangeFilter, { type DateRangeDays } from "./DateRangeFilter";
import type { SalesByStoreDataPoint } from "./SalesByStoreChart";
import type { SalesOverTimeDataPoint } from "./SalesOverTimeChart";
import type { SalesByProductDataPoint } from "./SalesByProductChart";
import type { SalesTYLYDataPoint } from "./SalesTYLYChart";
import type { UnitsPerStoreDataPoint } from "./UnitsPerStoreChart";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KpiData {
  totalNetSales: number;
  totalUnitSales: number;
  netSalesLY: number;
  unitSalesLY: number;
  topProduct: string;
  storeCount: number;
  perStore: number;
  perStoreLY: number;
  unitsPerStore: number;
  unitsPerStoreLY: number;
  avgPrice: number;
  avgPriceLY: number;
}

interface DashboardData {
  kpis: KpiData;
  salesOverTime: SalesOverTimeDataPoint[];
  salesByStore: SalesByStoreDataPoint[];
  salesByProduct: SalesByProductDataPoint[];
  salesWithLY: SalesTYLYDataPoint[];
  unitsPerStore: UnitsPerStoreDataPoint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Formats a number as USD currency (e.g. 84320.5 → "$84,320.50").
 */
function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Compact currency for large values that would overflow a card (e.g. 42871 → "$42.9k").
 */
function formatCompactCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 10_000) {
    return `$${(value / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(value);
}

/**
 * Formats a number with thousands separators (e.g. 6214 → "6,214").
 */
function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

/**
 * Computes a YOY percentage change string (e.g. "+12.4%" or "-3.1%").
 * Returns null if the LY value is 0 to avoid division by zero.
 */
function yoyTrend(
  current: number,
  ly: number
): { label: string; direction: "up" | "down" | "neutral" } | null {
  if (!ly) return null;
  const pct = ((current - ly) / ly) * 100;
  const direction = pct > 0 ? "up" : pct < 0 ? "down" : "neutral";
  const label = `${pct > 0 ? "+" : ""}${pct.toFixed(1)}% vs LY`;
  return { label, direction };
}

/**
 * Formats a "Day ID" string (YYYY-MM-DD) into a short display label (e.g. "May 12").
 */
function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Fetches all dashboard data for the given day window in parallel.
 */
async function fetchDashboardData(days: DateRangeDays): Promise<DashboardData> {
  const [kpisRes, overTimeRes, byStoreRes, byProductRes, salesLYRes, unitsStoreRes] = await Promise.all([
    fetch(`/api/charts/kpis?days=${days}`),
    fetch(`/api/charts/sales-over-time?days=${days}`),
    fetch(`/api/charts/sales-by-store?days=${days}`),
    fetch(`/api/charts/sales-by-product?days=${days}`),
    fetch(`/api/charts/sales-with-ly?days=${days}`),
    fetch(`/api/charts/units-per-store?days=${days}`),
  ]);

  if (!kpisRes.ok || !overTimeRes.ok || !byStoreRes.ok || !byProductRes.ok || !salesLYRes.ok || !unitsStoreRes.ok) {
    throw new Error("One or more chart endpoints returned an error");
  }

  const [kpis, salesOverTimeRaw, salesByStoreRaw, salesByProductRaw, salesWithLYRaw, unitsPerStoreRaw] =
    await Promise.all([
      kpisRes.json() as Promise<KpiData>,
      overTimeRes.json() as Promise<{ date: string; netSales: number }[]>,
      byStoreRes.json() as Promise<{ storeName: string; netSales: number }[]>,
      byProductRes.json() as Promise<{ itemDescription: string; netSales: number }[]>,
      salesLYRes.json() as Promise<{ date: string; netSales: number; netSalesLY: number }[]>,
      unitsStoreRes.json() as Promise<{ date: string; unitsPerStore: number; unitsPerStoreLY: number }[]>,
    ]);

  return {
    kpis,
    salesOverTime: salesOverTimeRaw.map((r) => ({
      date: formatDateLabel(r.date),
      netSales: r.netSales,
    })),
    salesByStore: salesByStoreRaw,
    salesByProduct: salesByProductRaw.map((r) => ({
      itemDescription: r.itemDescription,
      netSales: r.netSales,
    })),
    salesWithLY: salesWithLYRaw.map((r) => ({
      date: formatDateLabel(r.date),
      netSales: r.netSales,
      netSalesLY: r.netSalesLY,
    })),
    unitsPerStore: unitsPerStoreRaw.map((r) => ({
      date: formatDateLabel(r.date),
      unitsPerStore: r.unitsPerStore,
      unitsPerStoreLY: r.unitsPerStoreLY,
    })),
  };
}

/**
 * Dashboard content area. Fetches real data from /api/charts/* and re-fetches
 * whenever the date range filter changes. Shows skeletons while loading.
 */
export default function DashboardContent() {
  const [selectedDays, setSelectedDays] = useState<DateRangeDays>(30);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (days: DateRangeDays) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData(days);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and whenever the filter changes
  useEffect(() => {
    loadData(selectedDays);
  }, [selectedDays, loadData]);

  const periodLabel =
    selectedDays === 365 ? "last year" : `last ${selectedDays} days`;

  // Compute YOY trends from KPI data
  const netSalesTrend = data
    ? yoyTrend(data.kpis.totalNetSales, data.kpis.netSalesLY)
    : null;
  const unitSalesTrend = data
    ? yoyTrend(data.kpis.totalUnitSales, data.kpis.unitSalesLY)
    : null;

  return (
    // @container lets KPI cards reflow based on this panel's actual width,
    // not the viewport — so they behave correctly when the sidebar is resized
    <main className="@container px-6 py-5 flex flex-col gap-5">
      {/* Header row: title + date range filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--ui-text)]">Sales Overview</h1>
          <p className="text-xs text-[var(--ui-text-muted)] mt-0.5">
            Walker Brothers · Whole Foods
          </p>
        </div>
        <DateRangeFilter selected={selectedDays} onChange={setSelectedDays} />
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-[#FF3000]/10 border border-[#FF3000]/30 rounded-xl px-4 py-3 text-sm text-[#FF3000]">
          Failed to load data: {error}
        </div>
      )}

      {/* KPI strip — 2 cols narrow, 4 cols medium, 7 cols wide */}
      <div className="grid grid-cols-2 @2xl:grid-cols-4 gap-3">
        <KpiCard
          label="$/Store"
          value={data ? formatCompactCurrency(data.kpis.perStore) : "—"}
          subLabel={periodLabel}
          trend={data ? yoyTrend(data.kpis.perStore, data.kpis.perStoreLY)?.label : undefined}
          trendDirection={data ? yoyTrend(data.kpis.perStore, data.kpis.perStoreLY)?.direction : undefined}
          isLoading={isLoading}
        />
        <KpiCard
          label="Sales"
          value={data ? formatCompactCurrency(data.kpis.totalNetSales) : "—"}
          subLabel={periodLabel}
          trend={netSalesTrend?.label}
          trendDirection={netSalesTrend?.direction}
          isLoading={isLoading}
        />
        <KpiCard
          label="Units/Store"
          value={data ? data.kpis.unitsPerStore.toFixed(1) : "—"}
          subLabel={periodLabel}
          trend={data ? yoyTrend(data.kpis.unitsPerStore, data.kpis.unitsPerStoreLY)?.label : undefined}
          trendDirection={data ? yoyTrend(data.kpis.unitsPerStore, data.kpis.unitsPerStoreLY)?.direction : undefined}
          isLoading={isLoading}
        />
        <KpiCard
          label="Units"
          value={data ? formatNumber(data.kpis.totalUnitSales) : "—"}
          subLabel={periodLabel}
          trend={unitSalesTrend?.label}
          trendDirection={unitSalesTrend?.direction}
          isLoading={isLoading}
        />
        <KpiCard
          label="Avg Price"
          value={data ? formatCurrency(data.kpis.avgPrice) : "—"}
          subLabel={periodLabel}
          trend={data ? yoyTrend(data.kpis.avgPrice, data.kpis.avgPriceLY)?.label : undefined}
          trendDirection={data ? yoyTrend(data.kpis.avgPrice, data.kpis.avgPriceLY)?.direction : undefined}
          isLoading={isLoading}
        />
        <KpiCard
          label="Stores"
          value={data ? formatNumber(data.kpis.storeCount) : "—"}
          subLabel={periodLabel}
          isLoading={isLoading}
        />
        <KpiCard
          label="Top Product"
          value={data?.kpis.topProduct ?? "—"}
          subLabel="by net sales"
          isLoading={isLoading}
          compact
        />
      </div>

      {/* Sales TY vs LY and Units/Store side by side */}
      <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-3">
        <SalesTYLYChart
          data={data?.salesWithLY ?? []}
          isLoading={isLoading}
        />
        <UnitsPerStoreChart
          data={data?.unitsPerStore ?? []}
          isLoading={isLoading}
        />
      </div>

      <SalesOverTimeChart
        data={data?.salesOverTime ?? []}
        isLoading={isLoading}
      />
      <SalesByStoreChart
        data={data?.salesByStore ?? []}
        isLoading={isLoading}
      />
      <SalesByProductChart
        data={data?.salesByProduct ?? []}
        isLoading={isLoading}
        className="pb-6"
      />
    </main>
  );
}
