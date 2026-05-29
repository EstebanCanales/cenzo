"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { verificationTrend } from "@/lib/dashboard";

const chartConfig = {
  verified: { label: "Verified", color: "#1a7a4a" },
  pending: { label: "Pending", color: "#bbbbbb" },
};

type TrendChartProps = {
  compact?: boolean;
  detailed?: boolean;
};

export function TrendChart({ compact = false }: TrendChartProps) {
  const points = verificationTrend.points;
  const totalVerified = points.reduce((s, p) => s + p.verified, 0);
  const totalPending = points.reduce((s, p) => s + p.pending, 0);
  const proofRate = Math.round((totalVerified / (totalVerified + totalPending)) * 100);

  return (
    <section className={`lab-chart lab-chart--wide trend-panel ${compact ? "trend-panel--compact" : ""}`}>
      <div className="lab-chart__header">
        <div>
          <p className="lab-kicker">Velocity</p>
          <h2>{verificationTrend.title}</h2>
        </div>
        <span>{proofRate}% proof rate</span>
      </div>

      <ChartContainer config={chartConfig} className="h-[140px] w-full">
        <AreaChart data={points} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="gradVerified" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a7a4a" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1a7a4a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bbbbbb" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#bbbbbb" stopOpacity={0} />
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
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="pending"
            stroke="#bbbbbb"
            strokeWidth={1.5}
            fill="url(#gradPending)"
            dot={false}
            activeDot={{ r: 3, fill: "#bbbbbb" }}
          />
          <Area
            type="monotone"
            dataKey="verified"
            stroke="#1a7a4a"
            strokeWidth={2}
            fill="url(#gradVerified)"
            dot={{ r: 3, fill: "#1a7a4a", strokeWidth: 0 }}
            activeDot={{ r: 4, fill: "#1a7a4a" }}
          />
        </AreaChart>
      </ChartContainer>
    </section>
  );
}
