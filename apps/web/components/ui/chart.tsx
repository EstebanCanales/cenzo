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

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a <ChartContainer />");
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & { config: ChartConfig; children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"] }) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> & React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    indicator?: "line" | "dot" | "dashed";
  }
>(({ active, payload, className, indicator = "dot", hideLabel = false, label }, ref) => {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div ref={ref} className={cn("grid min-w-[8rem] gap-1.5 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1.5 text-xs shadow-md", className)}>
      {!hideLabel && label ? (
        <p className="font-medium text-[var(--text)]">{label}</p>
      ) : null}
      <div className="grid gap-1">
        {payload.map((item, i) => {
          const key = item.dataKey as string;
          const cfg = config[key];
          return (
            <div key={i} className="flex items-center gap-1.5">
              {indicator === "dot" ? (
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color }} />
              ) : null}
              <span className="text-[var(--muted)]">{cfg?.label ?? key}</span>
              <span className="ml-auto font-mono font-medium tabular-nums text-[var(--text)]">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

export {
  ChartContainer,
  ChartTooltipContent,
  RechartsPrimitive as Recharts,
};
