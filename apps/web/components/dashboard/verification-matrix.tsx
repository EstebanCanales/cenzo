"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { verificationMatrix } from "@/lib/dashboard";

const GRADIENTS = [
  { id: "gCoffee",  from: "hsl(161 80% 52%)", to: "hsl(161 80% 36%)" },
  { id: "gCacao",   from: "hsl(270 70% 70%)", to: "hsl(270 70% 50%)" },
  { id: "gBanano",  from: "hsl(217 90% 70%)", to: "hsl(217 90% 50%)" },
] as const;

const chartConfig = Object.fromEntries(
  verificationMatrix.rows.map((row, i) => [
    row.label,
    { label: row.label, color: GRADIENTS[i % GRADIENTS.length].from },
  ])
) satisfies ChartConfig;

export function VerificationMatrix({ detailed = false }: { detailed?: boolean }) {
  const stages = verificationMatrix.rows[0]?.cells.map((c) => c.stage) ?? [];
  const data = stages.map((stage) => {
    const row: Record<string, string | number> = { stage };
    for (const crop of verificationMatrix.rows) {
      const cell = crop.cells.find((c) => c.stage === stage);
      if (cell) row[crop.label] = cell.count;
    }
    return row;
  });

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Matrix</p>
          <h3 className="text-base font-bold text-[var(--text-strong)] mt-0.5">Stage verification</h3>
          {detailed && (
            <p className="text-xs text-[var(--muted)] mt-1">Cross-check crop readiness against each operational stage.</p>
          )}
        </div>
        <span className="text-xs text-[var(--muted)]">By crop</span>
      </div>

      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            {GRADIENTS.map((g) => (
              <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={g.from} stopOpacity={1} />
                <stop offset="100%" stopColor={g.to}   stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="hsl(220 14% 96%)" />
          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "hsl(220 14% 62%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(220 14% 62%)" }} axisLine={false} tickLine={false} width={28} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {verificationMatrix.rows.map((crop, i) => (
            <Bar key={crop.label} dataKey={crop.label}
              fill={`url(#${GRADIENTS[i % GRADIENTS.length].id})`}
              radius={[4, 4, 0, 0]} maxBarSize={20}
              animationDuration={700} animationBegin={i * 100} />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
}
