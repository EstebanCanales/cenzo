import Image from "next/image";
import { Activity, ShieldCheck, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { dashboardInsights, stellarVerificationRecords } from "@/lib/dashboard";

export function EvidencePanel() {
  return (
    <section className="evidence-panel" aria-label="Stellar verification evidence">
      <div className="evidence-panel__media">
        <Image
          alt="Field sensor monitoring agricultural traceability"
          fill
          priority
          src="/agro-assets/field-sensor.png"
          sizes="(max-width: 900px) 100vw, 420px"
        />
      </div>
      <div className="evidence-panel__body">
        <Badge variant="green">
          <ShieldCheck size={14} />
          Stellar proof
        </Badge>
        <div>
          <h2>{dashboardInsights.primary.title}</h2>
          <p>{dashboardInsights.primary.body}</p>
        </div>
        <div className="evidence-panel__stats">
          <div>
            <strong>{dashboardInsights.primary.value}</strong>
            <span>{dashboardInsights.primary.label}</span>
          </div>
          <div>
            <strong>{dashboardInsights.qualityRisk.value}</strong>
            <span>{dashboardInsights.qualityRisk.label}</span>
          </div>
          <div>
            <strong>{dashboardInsights.sensorSignal.value}</strong>
            <span>{dashboardInsights.sensorSignal.label}</span>
          </div>
        </div>
        <div className="evidence-panel__records">
          {stellarVerificationRecords.map((record) => (
            <div key={record.id} className="evidence-panel__record">
              {record.status === "verified" ? <Activity size={15} /> : <TriangleAlert size={15} />}
              <div>
                <span>{record.label}</span>
                <strong>{record.value}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

