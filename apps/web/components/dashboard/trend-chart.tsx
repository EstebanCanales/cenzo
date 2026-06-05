"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { verificationTrend } from "@/lib/dashboard";

const chartConfig = {
  verified: { label: "Verified", color: "#1a7a4a" },
  pending: { label: "Pending", color: "#bbbbbb" },
};

type TrendChartProps = {
  compact?: boolean;
  detailed?: boolean;
};

export function TrendChart({ compact = false, detailed = false }: TrendChartProps) {
  const points = verificationTrend.points;
  const totalVerified = points.reduce((s, p) => s + p.verified, 0);
  const totalPending = points.reduce((s, p) => s + p.pending, 0);
  const proofRate = Math.round((totalVerified / (totalVerified + totalPending)) * 100);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className={`lab-chart lab-chart--flex trend-panel ${compact ? "trend-panel--compact" : ""}`}>
      <div className="lab-chart__header trend-panel__header">
        <div>
          <p className="lab-kicker">Velocity</p>
          <h2>{verificationTrend.title}</h2>
          {detailed ? (
            <p className="lab-chart__lede">
              Verified flow stays ahead while pending proofs remain contained.
            </p>
          ) : null}
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--green)" }}>
          {proofRate}% proof rate
        </span>
      </div>

      <ChartContainer config={chartConfig} className="flex-1 min-h-0">
        <AreaChart key={inView ? 1 : 0} data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradVerified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-verified)" stopOpacity={0.3} />
              <stop offset="80%" stopColor="var(--color-verified)" stopOpacity={0.04} />
              <stop offset="100%" stopColor="var(--color-verified)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-pending)" stopOpacity={0.15} />
              <stop offset="100%" stopColor="var(--color-pending)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
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
          <Area
            type="monotone"
            dataKey="pending"
            stroke="var(--color-pending)"
            strokeWidth={1.5}
            fill="url(#gradPending)"
            dot={false}
            activeDot={{ r: 3 }}
            animationDuration={1000}
            animationEasing="ease-out"
            animationBegin={0}
          />
          <Area
            type="monotone"
            dataKey="verified"
            stroke="var(--color-verified)"
            strokeWidth={2}
            fill="url(#gradVerified)"
            dot={{ r: 3, fill: "var(--color-verified)", strokeWidth: 0 }}
            activeDot={{ r: 4 }}
            animationDuration={1000}
            animationEasing="ease-out"
            animationBegin={150}
          />
        </AreaChart>
      </ChartContainer>
    </section>
  );
}
