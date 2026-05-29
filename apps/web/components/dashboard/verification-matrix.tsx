import { Check, Clock3, TriangleAlert } from "lucide-react";

import { verificationMatrix } from "@/lib/dashboard";

const statusIcon = {
  verified: Check,
  pending: Clock3,
  review: TriangleAlert,
};

type VerificationMatrixProps = {
  compact?: boolean;
  detailed?: boolean;
};

export function VerificationMatrix({ compact = false, detailed = false }: VerificationMatrixProps) {
  const stages = verificationMatrix.rows[0]?.cells.map((cell) => cell.stage) ?? [];

  return (
    <section className={`lab-chart matrix-panel ${compact ? "matrix-panel--compact" : ""}`}>
      <div className="lab-chart__header">
        <div>
          <p className="lab-kicker">Matrix</p>
          <h2>Stage verification</h2>
        </div>
        <span>By crop</span>
      </div>
      <div className="verification-matrix">
        {detailed ? (
          <div className="verification-matrix__stage-row" aria-hidden="true">
            <span />
            <div>
              {stages.map((stage) => (
                <small key={stage}>{stage}</small>
              ))}
            </div>
          </div>
        ) : null}
        {verificationMatrix.rows.map((row) => (
          <div key={row.label} className="verification-matrix__row">
            <strong>{row.label}</strong>
            <div className="verification-matrix__cells">
              {row.cells.map((cell) => {
                const Icon = statusIcon[cell.status];
                return (
                  <span key={`${row.label}-${cell.stage}`} className={`matrix-cell matrix-cell--${cell.status}`}>
                    <Icon size={14} />
                    <strong>{cell.count}</strong>
                    {detailed ? <small>{cell.stage}</small> : null}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {detailed ? (
        <div className="matrix-panel__legend">
          <span><Check size={13} /> verified</span>
          <span><Clock3 size={13} /> pending</span>
          <span><TriangleAlert size={13} /> review</span>
        </div>
      ) : null}
    </section>
  );
}
