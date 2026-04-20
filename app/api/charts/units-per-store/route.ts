/**
 * GET /api/charts/units-per-store?days=30
 * Returns daily units/store for TY and LY — used by the Units/Store line chart.
 */

import { type NextRequest, NextResponse } from "next/server";
import { fetchUnitsPerStoreOverTime, type ChartDays } from "@/lib/charts/queries";

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
    const data = await fetchUnitsPerStoreOverTime(days);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/charts/units-per-store] DB error:", error);
    const message = error instanceof Error ? error.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
