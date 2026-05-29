import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardMetric } from "@/lib/dashboard";

const toneMap = {
  green: "green",
  gold: "gold",
  slate: "slate",
} as const;

export function MetricCard({ metric }: { metric: DashboardMetric }) {
  return (
    <Card className="metric-card">
      <CardHeader className="metric-card__header">
        <CardTitle>{metric.label}</CardTitle>
        <Badge variant={toneMap[metric.tone]}>{metric.change}</Badge>
      </CardHeader>
      <CardContent className="metric-card__content">
        <strong>{metric.value}</strong>
        <span>
          <ArrowUpRight size={16} />
          Updated live
        </span>
      </CardContent>
    </Card>
  );
}

