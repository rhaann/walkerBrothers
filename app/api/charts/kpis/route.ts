/**
 * GET /api/charts/kpis?days=30
 * Returns KPI card values for the dashboard: net sales, unit sales,
 * YOY comparisons, top product, and active store count.
 */

import { type NextRequest, NextResponse } from "next/server";
import { fetchKpis, type ChartDays } from "@/lib/charts/queries";

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
    const data = await fetchKpis(days);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/charts/kpis] DB error:", error);
    const message = error instanceof Error ? error.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
