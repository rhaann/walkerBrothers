/**
 * GET /api/charts/sales-with-ly?days=30
 * Returns daily net sales for TY and LY — used by the Sales TY vs LY line chart.
 */

import { type NextRequest, NextResponse } from "next/server";
import { fetchSalesWithLY, type ChartDays } from "@/lib/charts/queries";

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
    const data = await fetchSalesWithLY(days);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/charts/sales-with-ly] DB error:", error);
    const message = error instanceof Error ? error.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
