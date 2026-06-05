import { LabShell } from "@/components/dashboard/lab-shell";
import { MotionFade } from "@/components/dashboard/motion-fade";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SensorPanel } from "@/components/dashboard/sensor-panel";
import { StellarContractFlowClient } from "@/components/dashboard/stellar-contract-flow-client";
import { auth } from "@/auth";
import { dashboardInsights, dashboardMetrics, getGreetingByDate } from "@/lib/dashboard";
import { getClimate, listSensorReadings } from "@/lib/censo-api";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user?.name ?? "Operator";
  const greeting = getGreetingByDate(new Date());
  const [readings, climate] = await Promise.all([
    listSensorReadings(),
    getClimate(9.9281, -84.0907, 7),
  ]);

  return (
    <LabShell
      description="Visibilidad clara sobre lotes, validaciones y calidad a medida que el producto avanza."
      eyebrow="Overview"
      heading={`${greeting}, ${user}.`}
      hideHeader
      variant="overview"
    >
      <section className="command-surface">
        <MotionFade className="command-surface__greeting">
          <p className="lab-kicker">Live field command</p>
          <h2>
            {greeting}, {user}
          </h2>
          <p>
            Movimientos, sensores y evidencia verificable agrupados para saber que lote avanza,
            cual espera revision y que prueba ya existe.
          </p>
        </MotionFade>

        <MotionFade className="command-surface__signal" delay={0.08}>
          <span>{dashboardInsights.sensorSignal.title}</span>
          <strong>{dashboardInsights.sensorSignal.value}</strong>
          <p>{dashboardInsights.sensorSignal.label}</p>
          <div className="command-surface__live">Live signal</div>
        </MotionFade>
      </section>

      <div className="metrics-strip">
        {dashboardMetrics.map((metric, index) => (
          <MotionFade key={metric.id} delay={index * 0.04}>
            <MetricCard metric={metric} />
          </MotionFade>
        ))}
      </div>

      <MotionFade delay={0.08} className="overview-full">
        <StellarContractFlowClient />
      </MotionFade>

      <MotionFade delay={0.12} className="overview-full">
        <SensorPanel readings={readings} climate={climate} />
      </MotionFade>
    </LabShell>
  );
}
