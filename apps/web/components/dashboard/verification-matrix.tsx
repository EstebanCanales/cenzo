"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { verificationMatrix } from "@/lib/dashboard";

const chartConfig = {
  verified: { label: "Verified", color: "#1a7a4a" },
  pending: { label: "Pending", color: "#bbbbbb" },
  review: { label: "Review", color: "#c98b24" },
};

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
  const cropColors = ["#1a7a4a", "#c98b24", "#5f8192"];

  return (
    <section className={`lab-chart matrix-panel ${compact ? "matrix-panel--compact" : ""}`}>
      <div className="lab-chart__header">
        <div>
          <p className="lab-kicker">Matrix</p>
          <h2>Stage verification</h2>
        </div>
        <span>By crop</span>
      </div>

      <ChartContainer
        config={Object.fromEntries(crops.map((c, i) => [c, { label: c, color: cropColors[i] }]))}
        className="h-[140px] w-full"
      >
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
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
          />
          <Tooltip content={<ChartTooltipContent />} />
          {crops.map((crop, i) => (
            <Bar
              key={crop}
              dataKey={crop}
              fill={cropColors[i % cropColors.length]}
              radius={[3, 3, 0, 0]}
              maxBarSize={18}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </section>
  );
}
