"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { NftScoreData } from "@/lib/censo-api";

type Props = { scores: (NftScoreData | null)[] };

const GRADE_META: Record<string, { label: string; from: string; to: string }> = {
  A: { label: "Excelente",       from: "hsl(161 80% 52%)", to: "hsl(161 80% 36%)" },
  B: { label: "Bueno",           from: "hsl(217 90% 65%)", to: "hsl(217 90% 48%)" },
  C: { label: "Aceptable",       from: "hsl(38 95% 65%)",  to: "hsl(38 90% 48%)"  },
  D: { label: "En desarrollo",   from: "hsl(20 90% 62%)",  to: "hsl(20 90% 46%)"  },
  F: { label: "No verificable",  from: "hsl(0 80% 65%)",   to: "hsl(0 80% 50%)"   },
};

const chartConfig = { total: { label: "Score NFT" } } satisfies ChartConfig;

export function NftScoreRadar({ scores }: Props) {
  const valid = scores.filter(Boolean) as NftScoreData[];

  if (valid.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-white p-5 flex items-center justify-center h-[200px]">
        <p className="text-xs text-[var(--muted)]">Sin datos de score disponibles</p>
      </div>
    );
  }

  const data = valid.map((n, i) => ({
    name: `#${i + 1} ${n.producer.length > 14 ? n.producer.slice(0, 12) + "…" : n.producer}`,
    total: n.score.total,
    grade: n.score.grade,
  }));

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">NFT Score</p>
          <h3 className="text-base font-bold text-[var(--text-strong)] mt-0.5">Score por lote</h3>
          <p className="text-xs text-[var(--muted)] mt-1">Puntuación total del certificado NFT por productor.</p>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          {Object.entries(GRADE_META).map(([grade, meta]) => (
            <span key={grade} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: meta.from + "18", color: meta.from, border: `1px solid ${meta.from}44` }}>
              {grade} · {meta.label}
            </span>
          ))}
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[180px] w-full">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            {Object.entries(GRADE_META).map(([grade, meta]) => (
              <linearGradient key={grade} id={`sg${grade}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={meta.from} />
                <stop offset="100%" stopColor={meta.to}   />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="hsl(220 14% 96%)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(220 14% 60%)" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(220 14% 60%)" }} axisLine={false} tickLine={false} width={28} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="total" radius={[5, 5, 0, 0]} maxBarSize={48}>
            {data.map((entry, i) => (
              <Cell key={i} fill={`url(#sg${entry.grade})`} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Grade pills */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-[var(--line)]">
        {valid.map((n, i) => {
          const meta = GRADE_META[n.score.grade] ?? GRADE_META.F;
          return (
            <span key={i} className="text-[11px] px-2.5 py-1 rounded-full font-bold"
              style={{ background: meta.from + "15", color: meta.from, border: `1px solid ${meta.from}40` }}>
              {n.producer} — {n.score.grade} ({n.score.total}/100)
            </span>
          );
        })}
      </div>
    </div>
  );
}
