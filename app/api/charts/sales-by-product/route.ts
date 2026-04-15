/**
 * GET /api/charts/sales-by-product?days=30
 * Returns net sales aggregated by product for the rolling window — used by the horizontal bar chart.
 */

import { type NextRequest, NextResponse } from "next/server";
import { fetchSalesByProduct, type ChartDays } from "@/lib/charts/queries";

const VALID_DAYS: ChartDays[] = [30, 60, 90, 365];

export async function GET(request: NextRequest) {
  const daysParam = request.nextUrl.searchParams.get("days");
  const days = Number(daysParam) as ChartDays;

  if (!VALID_DAYS.includes(days)) {
    return NextResponse.json(
      { error: "days must be one of: 30, 60, 90, 365" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchSalesByProduct(days);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
