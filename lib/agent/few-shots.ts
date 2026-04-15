/**
 * Few-shot examples for the inventory AI agent.
 * Each example is a natural language question paired with an ideal SQL query.
 *
 * These are injected into the system prompt to help Claude generate accurate,
 * domain-appropriate SQL without needing to guess table or column names.
 *
 * Add new examples here as edge cases are discovered in production.
 * Aim for 5–10 examples that cover different query patterns (aggregation,
 * ranking, date ranges, comparisons, filtering).
 */

/**
 * A single few-shot training example: a user question and the ideal SQL response.
 */
export interface FewShotExample {
  question: string;
  sql: string;
}

/**
 * Curated few-shot examples covering the most common sales query patterns
 * for the wholefoods table.
 *
 * All column names are double-quoted because they contain spaces.
 * Text-typed numeric columns are explicitly CAST before arithmetic.
 * "Day ID" is CAST to DATE for date comparisons.
 */
export const fewShotExamples: FewShotExample[] = [
  {
    question: "Which stores had the highest net sales last 30 days?",
    sql: `SELECT "Store Name", SUM("Net Sales") AS total_net_sales
FROM "wholeFoods"
WHERE CAST("Day ID" AS DATE) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY "Store Name"
ORDER BY total_net_sales DESC
LIMIT 10;`,
  },
  {
    question: "How do unit sales this week compare to the same period last year?",
    sql: `SELECT
  SUM("Unit Sales") AS units_this_year,
  SUM(CAST("Unit Sales LY" AS INTEGER)) AS units_last_year
FROM "wholeFoods"
WHERE CAST("Day ID" AS DATE) >= DATE_TRUNC('week', CURRENT_DATE)
  AND CAST("Day ID" AS DATE) < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days';`,
  },
  {
    question: "What are the top 10 products by net sales this month?",
    sql: `SELECT "Item Description", SUM("Net Sales") AS total_net_sales
FROM "wholeFoods"
WHERE DATE_TRUNC('month', CAST("Day ID" AS DATE)) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY "Item Description"
ORDER BY total_net_sales DESC
LIMIT 10;`,
  },
  {
    question: "Which regions are performing best by net sales year to date?",
    sql: `SELECT "Region", SUM("Net Sales") AS total_net_sales
FROM "wholeFoods"
WHERE DATE_TRUNC('year', CAST("Day ID" AS DATE)) = DATE_TRUNC('year', CURRENT_DATE)
GROUP BY "Region"
ORDER BY total_net_sales DESC;`,
  },
  {
    question: "Show me net sales by product category for the last 7 days.",
    sql: `SELECT "Category", SUM("Net Sales") AS total_net_sales
FROM "wholeFoods"
WHERE CAST("Day ID" AS DATE) >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY "Category"
ORDER BY total_net_sales DESC;`,
  },
  {
    question: "Which products have the highest return rate?",
    sql: `SELECT
  "Item Description",
  SUM(CAST("Return Units" AS INTEGER)) AS total_returns,
  SUM(CAST("Gross Units" AS INTEGER)) AS total_gross_units,
  ROUND(
    100.0 * SUM(CAST("Return Units" AS INTEGER)) /
    NULLIF(SUM(CAST("Gross Units" AS INTEGER)), 0),
    2
  ) AS return_rate_pct
FROM "wholeFoods"
GROUP BY "Item Description"
HAVING SUM(CAST("Gross Units" AS INTEGER)) > 0
ORDER BY return_rate_pct DESC
LIMIT 10;`,
  },
  {
    question: "How have daily net sales trended over the past 4 weeks?",
    sql: `SELECT
  "Day ID" AS sale_date,
  SUM("Net Sales") AS daily_net_sales
FROM "wholeFoods"
WHERE CAST("Day ID" AS DATE) >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY "Day ID"
ORDER BY "Day ID" ASC;`,
  },
  {
    question: "What is the total net sales by channel type?",
    sql: `SELECT "chanl_tp_nm" AS channel, SUM("Net Sales") AS total_net_sales
FROM "wholeFoods"
GROUP BY "chanl_tp_nm"
ORDER BY total_net_sales DESC;`,
  },
];

/**
 * Formats the few-shot examples into a string block suitable for
 * inclusion in the Claude system prompt.
 *
 * @returns A formatted string with all question/SQL pairs.
 */
export function formatFewShots(): string {
  return fewShotExamples
    .map(
      (example, index) =>
        `Example ${index + 1}:\nQuestion: ${example.question}\nSQL:\n${example.sql}`
    )
    .join("\n\n");
}
