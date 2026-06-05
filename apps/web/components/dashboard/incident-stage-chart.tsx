import { incidentStageData } from "@/lib/dashboard";

type IncidentStageChartProps = {
  detailed?: boolean;
};

export function IncidentStageChart({ detailed = false }: IncidentStageChartProps) {
  const max = Math.max(...incidentStageData.map((item) => item.count));
  const total = incidentStageData.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className={`lab-chart incident-panel ${detailed ? "incident-panel--detailed" : ""}`}>
      <div className="lab-chart__header incident-panel__header">
        <div>
          <p className="lab-kicker">Incidents</p>
          <h2>Review pressure</h2>
          {detailed ? (
            <p className="lab-chart__lede">Stage-level friction ranked by operational pressure.</p>
          ) : null}
        </div>
        <span>{total} open signals</span>
      </div>
      <div className="incident-stage-chart">
        {incidentStageData.map((item) => (
          <div key={item.stage} className="incident-stage-chart__row">
            <span>{item.stage}</span>
            <div className="incident-stage-chart__track">
              <div
                className={`incident-stage-chart__fill incident-stage-chart__fill--${item.severity}`}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <strong>{item.count}</strong>
            {detailed ? (
              <small className={`incident-stage-chart__tag incident-stage-chart__tag--${item.severity}`}>
                {item.severity}
              </small>
            ) : null}
          </div>
        ))}
      </div>
      {detailed ? (
        <div className="incident-panel__note">
          Transport concentra la mayor presion: revisar temperatura, tiempos de espera y firma del operador antes de
          marcar la etapa como verificada.
        </div>
      ) : null}
    </section>
  );
}
