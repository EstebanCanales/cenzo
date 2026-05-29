import { EvidencePanel } from "@/components/dashboard/evidence-panel";
import { LabShell } from "@/components/dashboard/lab-shell";
import { MotionFade } from "@/components/dashboard/motion-fade";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { VerificationMatrix } from "@/components/dashboard/verification-matrix";
import { auth } from "@/auth";
import { dashboardInsights, dashboardMetrics, getGreetingByDate } from "@/lib/dashboard";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user?.name ?? "Operator";
  const greeting = getGreetingByDate(new Date());

  return (
    <LabShell
      description="Visibilidad clara sobre lotes, validaciones y calidad a medida que el producto avanza."
      eyebrow="Overview"
      heading="Agro Tech Lab"
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
        </MotionFade>
      </section>

      <div className="metrics-strip">
        {dashboardMetrics.map((metric, index) => (
          <MotionFade key={metric.id} delay={index * 0.04}>
            <MetricCard metric={metric} />
          </MotionFade>
        ))}
      </div>

      <section className="overview-lab-grid">
        <MotionFade delay={0.08}>
          <EvidencePanel />
        </MotionFade>
        <div className="overview-lab-grid__charts">
          <MotionFade delay={0.12}>
            <TrendChart compact />
          </MotionFade>
          <MotionFade delay={0.16}>
            <VerificationMatrix compact />
          </MotionFade>
        </div>
      </section>
    </LabShell>
  );
}
