import { IncidentStageChart } from "@/components/dashboard/incident-stage-chart";
import { LabShell } from "@/components/dashboard/lab-shell";
import { QualityDistribution } from "@/components/dashboard/quality-distribution";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { VerificationMatrix } from "@/components/dashboard/verification-matrix";

export default function GraphsPage() {
  return (
    <LabShell
      description="Lecturas operativas sobre calidad, alertas y registros verificables a lo largo de la cadena."
      eyebrow="Graphs"
      heading="Traceability data lab"
      variant="graphs"
    >
      <div className="graphs-lab">
        <TrendChart detailed />
        <VerificationMatrix detailed />
        <QualityDistribution detailed />
        <IncidentStageChart detailed />
      </div>
    </LabShell>
  );
}
