# /components/dashboard

React components for the inventory analytics dashboard.

## Component List

| Component | Description |
|---|---|
| `KpiCard.tsx` | Single KPI metric card — title, value, optional trend indicator |
| `InventoryBarChart.tsx` | Bar chart: inventory units by store (Recharts) |
| `InventoryLineChart.tsx` | Line chart: inventory over time — trend view (Recharts) |
| `SkuBarChart.tsx` | Horizontal bar chart: stock levels by SKU (Recharts) |
| `FilterBar.tsx` | Filter controls: vendor/store, date range, product/SKU |

## Chart Data Structure

Charts receive typed props — no raw API responses are passed directly. Each chart component defines its own `Props` interface in the same file.

Example for `InventoryBarChart`:
```typescript
interface InventoryBarChartProps {
  data: { storeName: string; units: number }[];
  isLoading?: boolean;
}
```

Chart data is fetched in the page component (`/app/dashboard/page.tsx`) via `/api/charts` endpoints and passed down as props. Charts do not fetch their own data.

## Chart Colors

Use colors from the brand palette in this order for multi-series charts:
1. `#0090FF` — Sky Blue (primary series)
2. `#00C6AC` — Thoughtful Turquoise (secondary series)
3. `#0013DC` — Electric Blue (tertiary series)
4. `#FF3000` — Sharp Orange (only for alerts/anomalies)

## Loading & Empty States

Every chart component must handle:
- `isLoading={true}` → render a skeleton placeholder
- `data={[]}` → render a clear empty state message ("No data available")
