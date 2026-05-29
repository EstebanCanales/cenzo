"use client";

import { ArrowUpRight } from "lucide-react";
import { Area, AreaChart } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { DashboardMetric } from "@/lib/dashboard";

const toneMap = {
  green: "green",
  gold: "gold",
  slate: "slate",
} as const;

const sparklineData: Record<string, number[]> = {
  active: [98, 104, 110, 108, 115, 122, 128],
  moves: [900, 1020, 1100, 1050, 1190, 1240, 1284],
  alerts: [12, 9, 8, 10, 7, 9, 7],
  contracts: [28, 31, 33, 36, 38, 40, 41],
};

const toneColor: Record<string, string> = {
  green: "#1a7a4a",
  gold: "#c98b24",
  slate: "#5f8192",
};

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  const spark = (sparklineData[metric.id] ?? []).map((v) => ({ v }));
  const color = toneColor[metric.tone] ?? "#1a7a4a";

  return (
    <Card className="metric-card">
      <CardHeader className="metric-card__header">
        <CardTitle>{metric.label}</CardTitle>
        <Badge variant={toneMap[metric.tone]}>{metric.change}</Badge>
      </CardHeader>
      <CardContent className="metric-card__content">
        <strong>{metric.value}</strong>
        <ChartContainer
          config={{ v: { label: metric.label, color } }}
          className="metric-sparkline"
        >
          <AreaChart data={spark} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spark-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <ChartTooltip content={<ChartTooltipContent hideLabel indicator="dot" />} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#spark-${metric.id})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
        <span>
          <ArrowUpRight size={14} />
          Updated live
        </span>
      </CardContent>
    </Card>
  );
}
