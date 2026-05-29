"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { verificationMatrix } from "@/lib/dashboard";

const cropColors = ["#1a7a4a", "#c98b24", "#5f8192"] as const;

const chartConfig = Object.fromEntries(
  verificationMatrix.rows.map((row, i) => [
    row.label,
    { label: row.label, color: cropColors[i % cropColors.length] },
  ])
);

type VerificationMatrixProps = {
  compact?: boolean;
  detailed?: boolean;
};

export function VerificationMatrix({ compact = false }: VerificationMatrixProps) {
  const stages = verificationMatrix.rows[0]?.cells.map((c) => c.stage) ?? [];

  const data = stages.map((stage) => {
    const row: Record<string, string | number> = { stage };
    for (const crop of verificationMatrix.rows) {
      const cell = crop.cells.find((c) => c.stage === stage);
      if (cell) row[crop.label] = cell.count;
    }
    return row;
  });

  const crops = verificationMatrix.rows.map((r) => r.label);

  return (
    <section className={`lab-chart lab-chart--flex matrix-panel ${compact ? "matrix-panel--compact" : ""}`}>
      <div className="lab-chart__header">
        <div>
          <p className="lab-kicker">Matrix</p>
          <h2>Stage verification</h2>
        </div>
        <span>By crop</span>
      </div>

      <ChartContainer config={chartConfig} className="flex-1 min-h-0">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="stage"
            tick={{ fontSize: 10, fill: "#bbbbbb" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#bbbbbb" }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {crops.map((crop) => (
            <Bar
              key={crop}
              dataKey={crop}
              fill={`var(--color-${crop})`}
              radius={[3, 3, 0, 0]}
              maxBarSize={20}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </section>
  );
}
