import { Activity, ShieldCheck, Siren, Waves } from "lucide-react";

import { IncidentStageChart } from "@/components/dashboard/incident-stage-chart";
import { LabShell } from "@/components/dashboard/lab-shell";
import { QualityDistribution } from "@/components/dashboard/quality-distribution";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { VerificationMatrix } from "@/components/dashboard/verification-matrix";

const heroMetrics = [
  { label: "Verified flow", value: "94%", icon: ShieldCheck },
  { label: "Open alerts", value: "12", icon: Siren },
  { label: "Sensor cadence", value: "4.2m", icon: Waves },
];

export default function GraphsPage() {
  return (
    <LabShell
      description="Lecturas operativas sobre calidad, alertas y registros verificables a lo largo de la cadena."
      eyebrow="Graphs"
      heading="Traceability command room"
      variant="graphs"
    >
      <section className="graphs-command">
        <div className="graphs-command__hero">
          <div className="graphs-command__hero-copy">
            <p className="lab-kicker">Live signal orchestration</p>
            <h2>Visibility across verification, pressure points and lot quality.</h2>
            <p>
              Un solo tablero para leer que se mueve con confianza, que lote acumula friccion y
              donde conviene intervenir antes de romper la cadena de evidencia.
            </p>
          </div>
          <div className="graphs-command__hero-status">
            <span>
              <Activity size={16} />
              Monitoring chain health
            </span>
            <strong>Stable with active review zones</strong>
            <p>
              Transport y packing concentran la mayor presion; calidad sigue arriba del umbral
              operativo.
            </p>
          </div>
        </div>

        <div className="graphs-command__hero-metrics">
          {heroMetrics.map(({ label, value, icon: Icon }) => (
            <article key={label} className="graphs-command__metric">
              <span>
                <Icon size={16} />
                {label}
              </span>
              <strong>{value}</strong>
            </article>
          ))}
        </div>

        <div className="graphs-command__grid">
          <TrendChart detailed />
          <div className="graphs-command__rail">
            <VerificationMatrix detailed />
            <QualityDistribution detailed />
          </div>
          <IncidentStageChart detailed />
        </div>
      </section>
    </LabShell>
  );
}
