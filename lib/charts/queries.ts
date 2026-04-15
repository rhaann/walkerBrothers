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

  return {
    totalNetSales: Number(totals.current_net_sales ?? 0),
    totalUnitSales: Number(totals.current_unit_sales ?? 0),
    netSalesLY: Number(totals.ly_net_sales ?? 0),
    unitSalesLY: Number(totals.ly_unit_sales ?? 0),
    topProduct: String(top["Item Description"] ?? "—"),
    storeCount: Number(totals.store_count ?? 0),
  };
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
