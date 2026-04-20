/**
 * SQL queries for the dashboard chart endpoints.
 *
 * All queries use MAX("Day ID") as the reference date rather than CURRENT_DATE.
 * This ensures the date range filter always returns data relative to the most
 * recent records in the table, regardless of how old the data is.
 *
 * The `days` parameter maps directly to the dashboard date range filter:
 * 30 → Last 30D, 60 → Last 60D, 90 → Last 90D, 365 → Last 1Y
 */

import { runReadonlyQuery } from "@/lib/supabase/readonly";

/** Supported rolling window sizes — must match DateRangeDays in the UI. */
export type ChartDays = 30 | 60 | 90 | 365;

/** Builds a Postgres INTERVAL string from a day count. */
function interval(days: ChartDays): string {
  return days === 365 ? "1 year" : `${days} days`;
}

/** Converts a postgres DATE value (may be a JS Date object or string) to YYYY-MM-DD. */
function toDateStr(val: unknown): string {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

/**
 * Postgres subquery that returns the most recent date in the table.
 * Used as the anchor for all rolling window calculations.
 */
const MAX_DATE = `(SELECT MAX(CAST("Day ID" AS DATE)) FROM "wholeFoods")`;

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export interface KpiData {
  totalNetSales: number;
  totalUnitSales: number;
  netSalesLY: number;
  unitSalesLY: number;
  topProduct: string;
  storeCount: number;
  // Derived metrics
  perStore: number;
  perStoreLY: number;
  unitsPerStore: number;
  unitsPerStoreLY: number;
  avgPrice: number;
  avgPriceLY: number;
}

/**
 * Fetches all KPI card values for the given rolling window.
 * Returns current period totals, last-year equivalents (for YOY trend),
 * the top product by net sales, and the number of distinct active stores.
 *
 * @param days - Rolling window size in days
 */
export async function fetchKpis(days: ChartDays): Promise<KpiData> {
  const windowFilter = `CAST("Day ID" AS DATE) >= ${MAX_DATE} - INTERVAL '${interval(days)}'`;

  const [totalsRows, topProductRows] = await Promise.all([
    runReadonlyQuery(`
      SELECT
        SUM("Net Sales")                          AS current_net_sales,
        SUM(CAST("Net Sales LY" AS FLOAT))        AS ly_net_sales,
        SUM("Unit Sales")                         AS current_unit_sales,
        SUM(CAST("Unit Sales LY" AS INTEGER))     AS ly_unit_sales,
        COUNT(DISTINCT "Store Name")              AS store_count
      FROM "wholeFoods"
      WHERE ${windowFilter}
    `),
    runReadonlyQuery(`
      SELECT "Item Description", SUM("Net Sales") AS total_net_sales
      FROM "wholeFoods"
      WHERE ${windowFilter}
      GROUP BY "Item Description"
      ORDER BY total_net_sales DESC
      LIMIT 1
    `),
  ]);

  const totals = totalsRows[0] ?? {};
  const top = topProductRows[0] ?? {};

  const totalNetSales = Number(totals.current_net_sales ?? 0);
  const totalUnitSales = Number(totals.current_unit_sales ?? 0);
  const netSalesLY = Number(totals.ly_net_sales ?? 0);
  const unitSalesLY = Number(totals.ly_unit_sales ?? 0);
  const storeCount = Number(totals.store_count ?? 0);

  return {
    totalNetSales,
    totalUnitSales,
    netSalesLY,
    unitSalesLY,
    topProduct: String(top["Item Description"] ?? "—"),
    storeCount,
    perStore: storeCount > 0 ? totalNetSales / storeCount : 0,
    perStoreLY: storeCount > 0 ? netSalesLY / storeCount : 0,
    unitsPerStore: storeCount > 0 ? totalUnitSales / storeCount : 0,
    unitsPerStoreLY: storeCount > 0 ? unitSalesLY / storeCount : 0,
    avgPrice: totalUnitSales > 0 ? totalNetSales / totalUnitSales : 0,
    avgPriceLY: unitSalesLY > 0 ? netSalesLY / unitSalesLY : 0,
  };
}

// ─── Sales TY vs LY over time ─────────────────────────────────────────────────

export interface SalesWithLYRow {
  date: string;
  netSales: number;
  netSalesLY: number;
}

/**
 * Fetches daily net sales for both this year and last year over the rolling window.
 * Used for the TY vs LY comparison line chart.
 */
export async function fetchSalesWithLY(days: ChartDays): Promise<SalesWithLYRow[]> {
  const rows = await runReadonlyQuery(`
    SELECT
      CAST(DATE_TRUNC('week', CAST("Day ID" AS DATE)) AS DATE) AS date,
      SUM("Net Sales")                            AS net_sales,
      SUM(CAST("Net Sales LY" AS FLOAT))          AS net_sales_ly
    FROM "wholeFoods"
    WHERE CAST("Day ID" AS DATE) >= ${MAX_DATE} - INTERVAL '${interval(days)}'
    GROUP BY DATE_TRUNC('week', CAST("Day ID" AS DATE))
    ORDER BY DATE_TRUNC('week', CAST("Day ID" AS DATE)) ASC
    LIMIT 200
  `);
  return rows.map((r) => ({
    date: toDateStr(r.date),
    netSales: Number(r.net_sales ?? 0),
    netSalesLY: Number(r.net_sales_ly ?? 0),
  }));
}

// ─── Units per store TY vs LY over time ───────────────────────────────────────

export interface UnitsPerStoreRow {
  date: string;
  unitsPerStore: number;
  unitsPerStoreLY: number;
}

/**
 * Fetches daily units/store for TY and LY over the rolling window.
 * Units/Store = total unit sales divided by distinct store count for that day.
 */
export async function fetchUnitsPerStoreOverTime(days: ChartDays): Promise<UnitsPerStoreRow[]> {
  const rows = await runReadonlyQuery(`
    SELECT
      CAST(DATE_TRUNC('week', CAST("Day ID" AS DATE)) AS DATE) AS date,
      SUM("Unit Sales")                               AS unit_sales,
      SUM(CAST("Unit Sales LY" AS INTEGER))           AS unit_sales_ly,
      COUNT(DISTINCT "Store Name")                    AS store_count
    FROM "wholeFoods"
    WHERE CAST("Day ID" AS DATE) >= ${MAX_DATE} - INTERVAL '${interval(days)}'
    GROUP BY DATE_TRUNC('week', CAST("Day ID" AS DATE))
    ORDER BY DATE_TRUNC('week', CAST("Day ID" AS DATE)) ASC
    LIMIT 200
  `);
  return rows.map((r) => {
    const storeCount = Number(r.store_count ?? 1);
    return {
      date: toDateStr(r.date),
      unitsPerStore: storeCount > 0 ? Number(r.unit_sales ?? 0) / storeCount : 0,
      unitsPerStoreLY: storeCount > 0 ? Number(r.unit_sales_ly ?? 0) / storeCount : 0,
    };
  });
}

// ─── Sales over time ──────────────────────────────────────────────────────────

export interface SalesOverTimeRow {
  date: string;
  netSales: number;
}

/**
 * Fetches daily net sales totals for the given rolling window.
 * Returns one row per day, sorted ascending — used for the trend line chart.
 *
 * @param days - Rolling window size in days
 */
export async function fetchSalesOverTime(days: ChartDays): Promise<SalesOverTimeRow[]> {
  const rows = await runReadonlyQuery(`
    SELECT
      "Day ID"            AS date,
      SUM("Net Sales")    AS net_sales
    FROM "wholeFoods"
    WHERE CAST("Day ID" AS DATE) >= ${MAX_DATE} - INTERVAL '${interval(days)}'
    GROUP BY "Day ID"
    ORDER BY "Day ID" ASC
    LIMIT 1000
  `);

  return rows.map((r) => ({
    date: String(r.date),
    netSales: Number(r.net_sales ?? 0),
  }));
}

// ─── Sales by store ───────────────────────────────────────────────────────────

export interface SalesByStoreRow {
  storeName: string;
  netSales: number;
}

/**
 * Fetches net sales aggregated by store for the given rolling window.
 * Returns the top 15 stores by net sales, sorted descending.
 *
 * @param days - Rolling window size in days
 */
export async function fetchSalesByStore(days: ChartDays): Promise<SalesByStoreRow[]> {
  const rows = await runReadonlyQuery(`
    SELECT
      "Store Name"        AS store_name,
      SUM("Net Sales")    AS net_sales
    FROM "wholeFoods"
    WHERE CAST("Day ID" AS DATE) >= ${MAX_DATE} - INTERVAL '${interval(days)}'
    GROUP BY "Store Name"
    ORDER BY net_sales DESC
    LIMIT 15
  `);

  return rows.map((r) => ({
    storeName: String(r.store_name ?? ""),
    netSales: Number(r.net_sales ?? 0),
  }));
}

// ─── Sales by product ─────────────────────────────────────────────────────────

export interface SalesByProductRow {
  itemDescription: string;
  netSales: number;
}

/**
 * Fetches net sales aggregated by product for the given rolling window.
 * Returns the top 8 products by net sales, sorted descending.
 *
 * @param days - Rolling window size in days
 */
export async function fetchSalesByProduct(days: ChartDays): Promise<SalesByProductRow[]> {
  const rows = await runReadonlyQuery(`
    SELECT
      "Item Description"  AS item_description,
      SUM("Net Sales")    AS net_sales
    FROM "wholeFoods"
    WHERE CAST("Day ID" AS DATE) >= ${MAX_DATE} - INTERVAL '${interval(days)}'
    GROUP BY "Item Description"
    ORDER BY net_sales DESC
    LIMIT 8
  `);

  return rows.map((r) => ({
    itemDescription: String(r.item_description ?? ""),
    netSales: Number(r.net_sales ?? 0),
  }));
}
