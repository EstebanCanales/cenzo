"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  };
};

type ChartContextProps = { config: ChartConfig };
const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within <ChartContainer />");
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  const colorVars = Object.entries(config).reduce<Record<string, string>>((acc, [key, val]) => {
    if (val.color) acc[`--color-${key}`] = val.color;
    return acc;
  }, {});

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        style={colorVars as React.CSSProperties}
        className={cn("w-full", className)}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

type TooltipPayloadItem = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
};

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
  }
>(({ active, payload, className, indicator = "dot", hideLabel = false, hideIndicator = false, label, nameKey }, ref) => {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] gap-1.5 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1.5 text-xs shadow-md",
        className
      )}
    >
      {!hideLabel && label ? <p className="font-medium text-[var(--text)]">{label}</p> : null}
      <div className="grid gap-1.5">
        {payload.map((item, i) => {
          const key = nameKey ?? (item.name as string) ?? String(item.dataKey ?? "value");
          const cfg = config[key];
          const dotColor = item.color ?? item.fill ?? "var(--muted)";
          return (
            <div key={`${String(item.dataKey)}-${i}`} className="flex items-center gap-1.5">
              {!hideIndicator && indicator === "dot" ? (
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: dotColor }} />
              ) : null}
              <span className="text-[var(--muted)]">{cfg?.label ?? key}</span>
              <span className="ml-auto font-mono font-medium tabular-nums text-[var(--text)]">
                {typeof item.value === "number" ? item.value.toLocaleString() : String(item.value ?? "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: Array<{ value: string; color: string }>;
    nameKey?: string;
  }
>(({ className, payload, nameKey }, ref) => {
  const { config } = useChart();
  if (!payload?.length) return null;

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-3 pt-1 text-xs", className)}>
      {payload.map((item) => {
        const key = nameKey ?? item.value;
        const cfg = config[key];
        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
            <span className="text-[var(--muted)]">{cfg?.label ?? item.value}</span>
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegendContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
};
