/**
 * GET /api/charts/sales-over-time?days=30
 * Returns daily net sales totals for the rolling window — used by the trend line chart.
 */

import { type NextRequest, NextResponse } from "next/server";
import { fetchSalesOverTime, type ChartDays } from "@/lib/charts/queries";

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
    const data = await fetchSalesOverTime(days);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
