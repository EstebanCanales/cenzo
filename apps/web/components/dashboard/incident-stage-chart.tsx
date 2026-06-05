"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { incidentStageData } from "@/lib/dashboard";

const SEV_GRADIENT: Record<string, { id: string; from: string; to: string }> = {
  high:   { id: "iHigh",   from: "hsl(0 85% 68%)",  to: "hsl(0 80% 52%)"  },
  medium: { id: "iMedium", from: "hsl(38 95% 65%)",  to: "hsl(38 90% 48%)" },
  low:    { id: "iLow",    from: "hsl(161 80% 52%)", to: "hsl(161 80% 36%)" },
};

const chartConfig = { count: { label: "Signals" } } satisfies ChartConfig;

export function IncidentStageChart({ detailed = false }: { detailed?: boolean }) {
  const total = incidentStageData.reduce((s, i) => s + i.count, 0);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Incidents</p>
          <h3 className="text-base font-bold text-[var(--text-strong)] mt-0.5">Review pressure</h3>
          {detailed && (
            <p className="text-xs text-[var(--muted)] mt-1">Stage-level friction ranked by operational pressure.</p>
          )}
        </div>
        <span className="text-xs font-bold text-[var(--muted)]">{total} signals</span>
      </div>

      <ChartContainer config={chartConfig} className="h-[160px] w-full">
        <BarChart data={incidentStageData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {Object.values(SEV_GRADIENT).map((g) => (
              <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={g.from} />
                <stop offset="100%" stopColor={g.to}   />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid horizontal={false} stroke="hsl(220 14% 96%)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(220 14% 62%)" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "hsl(220 14% 62%)" }}
            axisLine={false} tickLine={false} width={72} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[0, 5, 5, 0]} maxBarSize={22}>
            {incidentStageData.map((entry) => (
              <Cell key={entry.stage} fill={`url(#${SEV_GRADIENT[entry.severity].id})`} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      {detailed && (
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(SEV_GRADIENT).map(([sev, g]) => (
            <span key={sev} className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
              <span className="w-2.5 h-2.5 rounded-full"
                style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }} />
              {sev}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
