import { Activity, ShieldCheck, Siren, TrendingUp, Waves } from "lucide-react";

import { IncidentStageChart } from "@/components/dashboard/incident-stage-chart";
import { LabShell } from "@/components/dashboard/lab-shell";
import { NftScoreRadar } from "@/components/dashboard/nft-score-radar";
import { QualityDistribution } from "@/components/dashboard/quality-distribution";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { VerificationMatrix } from "@/components/dashboard/verification-matrix";
import { getNftScore, listLotes } from "@/lib/censo-api";
import {
  incidentStageData,
  qualityDistribution,
  verificationTrend,
} from "@/lib/dashboard";

export const dynamic = "force-dynamic";

// ── KPIs derivados de datos reales ─────────────────────────────────────────

async function buildKpis() {
  const lotes = await listLotes().catch(() => []);
  const scores = await Promise.all(lotes.map((l) => getNftScore(l.id).catch(() => null)));

  const withScore = scores.filter(Boolean);
  const avgScore = withScore.length
    ? Math.round(withScore.reduce((s, n) => s + (n?.score.total ?? 0), 0) / withScore.length)
    : null;

  const verified = lotes.filter((l) => l.mint_tx_hash).length;
  const tiers = lotes.reduce<Record<string, number>>((acc, l) => {
    acc[l.tier] = (acc[l.tier] ?? 0) + 1;
    return acc;
  }, {});

  const points = verificationTrend.points;
  const totalV = points.reduce((s, p) => s + p.verified, 0);
  const totalP = points.reduce((s, p) => s + p.pending, 0);
  const proofRate = Math.round((totalV / (totalV + totalP)) * 100);

  const totalIncidents = incidentStageData.reduce((s, i) => s + i.count, 0);
  const approved = qualityDistribution.find((q) => q.tone === "green")?.count ?? 0;

  return { lotes: lotes.length, verified, avgScore, tiers, proofRate, totalIncidents, approved, scores };
}

// ── KPI cards con gradiente ───────────────────────────────────────────────

type KpiVariant = "emerald" | "blue" | "violet" | "rose"; // kept for call-site compat

function KpiCard({
  label, value, sub, icon: Icon,
}: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; variant: KpiVariant;
}) {
  return (
    <article className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-[var(--line)] bg-white">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-[var(--surface-soft)] text-[var(--muted)]">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1 text-[var(--muted)]">{label}</p>
        <p className="text-2xl font-black leading-none text-[var(--text-strong)]">{value}</p>
        {sub && <p className="text-[11px] mt-1 text-[var(--muted)]">{sub}</p>}
      </div>
    </article>
  );
}

function TierPill({ tier, count }: { tier: string; count: number }) {
  const colors: Record<string, string> = {
    Diamante: "bg-cyan-50 border-cyan-200 text-cyan-700",
    Oro: "bg-amber-50 border-amber-200 text-amber-700",
    Plata: "bg-slate-100 border-slate-200 text-slate-600",
    None: "bg-[var(--surface-soft)] border-[var(--line)] text-[var(--muted)]",
  };
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${colors[tier] ?? colors.None}`}>
      <span className="font-black text-sm">{count}</span> {tier === "None" ? "Sin cert." : tier}
    </span>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────

export default async function GraphsPage() {
  const kpis = await buildKpis();

  return (
    <LabShell
      eyebrow="Stellar · Soroban"
      heading="Traceability Command Room"
      description="Lecturas operativas sobre calidad, alertas y registros verificables a lo largo de la cadena."
    >
      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Proof rate"        value={`${kpis.proofRate}%`}                        sub="eventos verificados"               icon={ShieldCheck} variant="emerald" />
        <KpiCard label="Lotes on-chain"    value={`${kpis.verified}/${kpis.lotes}`}            sub="con mint tx"                       icon={TrendingUp}  variant="blue"    />
        <KpiCard label="Score NFT promedio" value={kpis.avgScore !== null ? kpis.avgScore : "—"} sub="sobre 100"                        icon={Activity}    variant="violet"  />
        <KpiCard label="Open signals"      value={kpis.totalIncidents}                          sub={`calidad: ${kpis.approved}% aprobado`} icon={Siren}  variant="rose"    />
      </div>

      {/* ── Tier distribution ── */}
      {kpis.lotes > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-[var(--line)] bg-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
            Distribución por tier
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(kpis.tiers).map(([tier, count]) => (
              <TierPill key={tier} tier={tier} count={count} />
            ))}
          </div>
        </div>
      )}

      {/* ── Main chart grid: 1 / 1x1 / 1x1 ── */}
      <div className="flex flex-col gap-4 mb-4">
        <TrendChart detailed />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <VerificationMatrix detailed />
          <QualityDistribution detailed />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <IncidentStageChart detailed />
          <NftScoreRadar scores={kpis.scores} />
        </div>
      </div>

      {/* ── Signal status footer ── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-sm">
        <span className="flex items-center gap-1.5 text-[var(--green)] font-semibold">
          <Waves size={14} />
          Live monitoring
        </span>
        <span className="text-[var(--muted)] text-xs">
          Transport concentra la mayor presión — revisar temperatura, tiempos y firma del operador antes de avanzar etapa.
        </span>
      </div>
    </LabShell>
  );
}
