"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { qualityDistribution } from "@/lib/dashboard";

const TONE_GRADIENT: Record<string, { id: string; from: string; to: string }> = {
  green: { id: "qGreen",  from: "hsl(161 80% 52%)", to: "hsl(161 80% 36%)" },
  steel: { id: "qSteel",  from: "hsl(220 20% 78%)", to: "hsl(220 20% 58%)" },
  gold:  { id: "qGold",   from: "hsl(38 95% 65%)",  to: "hsl(38 90% 48%)"  },
};

const chartConfig = Object.fromEntries(
  qualityDistribution.map((q) => [q.label, { label: q.label, color: TONE_GRADIENT[q.tone].from }])
) satisfies ChartConfig;

export function QualityDistribution({ detailed = false }: { detailed?: boolean }) {
  const total = qualityDistribution.reduce((s, q) => s + q.count, 0);
  const approved = qualityDistribution.find((q) => q.tone === "green")?.count ?? 0;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Quality</p>
          <h3 className="text-base font-bold text-[var(--text-strong)] mt-0.5">Lot distribution</h3>
          {detailed && (
            <p className="text-xs text-[var(--muted)] mt-1">Approval confidence, watch-list share and recovery capacity.</p>
          )}
        </div>
        <span className="text-xs text-[var(--muted)]">{total} lots</span>
      </div>

      <div className="flex items-center gap-5">
        <ChartContainer config={chartConfig} className="relative h-[130px] w-[130px] shrink-0">
          <PieChart>
            <defs>
              {Object.values(TONE_GRADIENT).map((g) => (
                <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={g.from} />
                  <stop offset="100%" stopColor={g.to}   />
                </linearGradient>
              ))}
            </defs>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={qualityDistribution}
              dataKey="count" nameKey="label"
              cx="50%" cy="50%"
              innerRadius={38} outerRadius={58}
              strokeWidth={0} paddingAngle={3}
            >
              {qualityDistribution.map((entry) => (
                <Cell key={entry.label} fill={`url(#${TONE_GRADIENT[entry.tone].id})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex flex-col gap-1.5 flex-1">
          <div className="mb-1">
            <span className="text-3xl font-black" style={{ color: TONE_GRADIENT.green.from }}>{approved}%</span>
            <span className="block text-[10px] text-[var(--muted)] uppercase tracking-widest">approved</span>
          </div>
          {qualityDistribution.map((q) => {
            const g = TONE_GRADIENT[q.tone];
            return (
              <div key={q.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }} />
                <span className="text-xs text-[var(--muted)] flex-1">{q.label}</span>
                <span className="text-xs font-bold text-[var(--text-strong)]">{q.count}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {detailed && (
        <div className="h-2 rounded-full overflow-hidden flex gap-0.5">
          {qualityDistribution.map((q) => {
            const g = TONE_GRADIENT[q.tone];
            return (
              <div key={q.label} className="h-full rounded-full"
                style={{ width: `${q.count}%`, background: `linear-gradient(90deg, ${g.from}, ${g.to})` }} />
            );
          })}
        </div>
      )}
    </div>
  );
}
