import { qualityDistribution } from "@/lib/dashboard";

type QualityDistributionProps = {
  detailed?: boolean;
};

export function QualityDistribution({ detailed = false }: QualityDistributionProps) {
  const total = qualityDistribution.reduce((sum, item) => sum + item.count, 0);
  const approved = qualityDistribution.find((item) => item.tone === "green")?.count ?? 0;

  return (
    <section className={`lab-chart quality-panel ${detailed ? "quality-panel--detailed" : ""}`}>
      <div className="lab-chart__header">
        <div>
          <p className="lab-kicker">Quality</p>
          <h2>Lot distribution</h2>
        </div>
        <span>{total} lots</span>
      </div>
      <div className="quality-ring" aria-label="Quality distribution chart">
        <div className="quality-ring__visual">
          <span>{approved}%</span>
          <small>approved</small>
        </div>
        <div className="quality-ring__legend">
          {qualityDistribution.map((item) => (
            <div key={item.label}>
              <span className={`legend-dot legend-dot--${item.tone}`} />
              <strong>{item.label}</strong>
              <small>{item.count}%</small>
            </div>
          ))}
        </div>
      </div>
      {detailed ? (
        <div className="quality-panel__detail">
          <div className="quality-panel__bar" aria-hidden="true">
            {qualityDistribution.map((item) => (
              <span
                key={item.label}
                className={`quality-panel__bar-segment quality-panel__bar-segment--${item.tone}`}
                style={{ width: `${item.count}%` }}
              />
            ))}
          </div>
          <p>
            La lectura combina inspeccion de calidad, evidencia de sensor y estado de aprobacion antes de liberar el
            siguiente movimiento.
          </p>
        </div>
      ) : null}
    </section>
  );
}
