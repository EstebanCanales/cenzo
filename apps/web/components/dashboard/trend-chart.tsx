import { verificationTrend } from "@/lib/dashboard";

type TrendChartProps = {
  compact?: boolean;
  detailed?: boolean;
};

export function TrendChart({ compact = false, detailed = false }: TrendChartProps) {
  const points = verificationTrend.points;
  const max = Math.max(...points.map((point) => point.verified + point.pending));
  const left = 28;
  const right = 332;
  const baseline = compact ? 128 : 142;
  const top = 26;
  const width = right - left;
  const chartHeight = baseline - top;
  const xFor = (index: number) => left + index * (width / (points.length - 1));
  const yFor = (value: number) => baseline - (value / max) * chartHeight;
  const verifiedPoints = points.map((point, index) => `${xFor(index)},${yFor(point.verified)}`).join(" ");
  const pendingPoints = points.map((point, index) => `${xFor(index)},${yFor(point.pending)}`).join(" ");
  const totalVerified = points.reduce((sum, point) => sum + point.verified, 0);
  const totalPending = points.reduce((sum, point) => sum + point.pending, 0);
  const proofRate = Math.round((totalVerified / (totalVerified + totalPending)) * 100);

  return (
    <section className={`lab-chart lab-chart--wide trend-panel ${compact ? "trend-panel--compact" : ""}`}>
      <div className="lab-chart__header">
        <div>
          <p className="lab-kicker">Velocity</p>
          <h2>{verificationTrend.title}</h2>
        </div>
        <span>{proofRate}% proof rate</span>
      </div>
      <svg className="trend-chart" viewBox="0 0 360 176" role="img" aria-label="Verification trend chart">
        {[0, 1, 2].map((line) => {
          const y = top + line * (chartHeight / 2);
          return <path key={line} d={`M${left} ${y} H${right}`} className="trend-chart__grid" />;
        })}
        <path d={`M${left} ${baseline} H${right}`} className="trend-chart__axis" />
        <polygon
          points={`${left},${baseline} ${verifiedPoints} ${right},${baseline}`}
          className="trend-chart__area"
        />
        {detailed
          ? points.map((point, index) => {
              const x = xFor(index);
              const pendingHeight = baseline - yFor(point.pending);
              return (
                <rect
                  key={`${point.label}-pending`}
                  className="trend-chart__pending-bar"
                  height={pendingHeight}
                  rx="4"
                  width="10"
                  x={x - 5}
                  y={baseline - pendingHeight}
                />
              );
            })
          : null}
        <polyline points={pendingPoints} className="trend-chart__line trend-chart__line--pending" />
        <polyline points={verifiedPoints} className="trend-chart__line" />
        {points.map((point, index) => {
          const x = xFor(index);
          const y = yFor(point.verified);
          return (
            <g key={point.label}>
              <circle cx={x} cy={y} r="5" className="trend-chart__point" />
              <text x={x} y="166" textAnchor="middle">
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
      {detailed ? (
        <div className="trend-panel__stats">
          <span>
            <strong>{totalVerified}</strong>
            verified movements
          </span>
          <span>
            <strong>{totalPending}</strong>
            pending proofs
          </span>
          <span>
            <strong>{proofRate}%</strong>
            Stellar-backed
          </span>
        </div>
      ) : null}
    </section>
  );
}
