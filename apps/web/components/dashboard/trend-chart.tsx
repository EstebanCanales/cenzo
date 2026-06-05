"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { verificationTrend } from "@/lib/dashboard";

const chartConfig = {
  verified: { label: "Verified", color: "hsl(161 80% 42%)" },
  pending:  { label: "Pending",  color: "hsl(220 14% 72%)" },
} satisfies ChartConfig;

export function TrendChart({ detailed = false }: { detailed?: boolean }) {
  const points = verificationTrend.points;
  const totalV = points.reduce((s, p) => s + p.verified, 0);
  const totalP = points.reduce((s, p) => s + p.pending, 0);
  const proofRate = Math.round((totalV / (totalV + totalP)) * 100);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Velocity</p>
          <h3 className="text-base font-bold text-[var(--text-strong)] mt-0.5">{verificationTrend.title}</h3>
          {detailed && (
            <p className="text-xs text-[var(--muted)] mt-1 max-w-xs">
              Verified flow stays ahead while pending proofs remain contained.
            </p>
          )}
        </div>
        <span className="shrink-0 text-sm font-black text-[var(--green)] font-mono">{proofRate}%</span>
      </div>

      <ChartContainer config={chartConfig} className="h-[200px] w-full">
        <AreaChart data={points} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--color-verified)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--color-verified)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--color-pending)" stopOpacity={0.12} />
              <stop offset="100%" stopColor="var(--color-pending)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="hsl(220 14% 95%)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(220 14% 65%)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(220 14% 65%)" }} axisLine={false} tickLine={false} width={28} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area type="monotone" dataKey="pending" stroke="var(--color-pending)" strokeWidth={1.5}
            fill="url(#gP)" dot={false} activeDot={{ r: 3 }} />
          <Area type="monotone" dataKey="verified" stroke="var(--color-verified)" strokeWidth={2}
            fill="url(#gV)" dot={{ r: 3, fill: "var(--color-verified)", strokeWidth: 0 }} activeDot={{ r: 4 }} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
