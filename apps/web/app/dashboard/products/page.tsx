import { Award, ExternalLink, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import Link from "next/link";

import { LabShell } from "@/components/dashboard/lab-shell";
import { explorerTx, listLotes, getNftScore, type LoteSummary, type NftScoreData } from "@/lib/censo-api";

export const dynamic = "force-dynamic";

type LoteWithScore = LoteSummary & { score: NftScoreData | null };

const TIER_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
  Diamante: { dot: "bg-cyan-400",   badge: "bg-cyan-50 border-cyan-200 text-cyan-700",   label: "Diamante" },
  Oro:      { dot: "bg-amber-400",  badge: "bg-amber-50 border-amber-200 text-amber-700", label: "Oro" },
  Plata:    { dot: "bg-slate-400",  badge: "bg-slate-100 border-slate-200 text-slate-600", label: "Plata" },
  None:     { dot: "bg-[var(--muted)]", badge: "bg-[var(--surface-soft)] border-[var(--line)] text-[var(--muted)]", label: "Sin cert." },
};

const GRADE_STYLES: Record<string, { ring: string; text: string; bg: string }> = {
  A: { ring: "ring-[var(--green)]", text: "text-[var(--green)]",   bg: "bg-[var(--green-soft)]" },
  B: { ring: "ring-blue-400",       text: "text-blue-600",         bg: "bg-blue-50" },
  C: { ring: "ring-amber-400",      text: "text-amber-600",        bg: "bg-amber-50" },
  D: { ring: "ring-orange-400",     text: "text-orange-600",       bg: "bg-orange-50" },
  F: { ring: "ring-red-300",        text: "text-red-500",          bg: "bg-red-50" },
};

function GradeBadge({ score }: { score: NftScoreData | null }) {
  if (!score) return <span className="text-xs text-[var(--muted)]">—</span>;
  const g = GRADE_STYLES[score.score.grade] ?? GRADE_STYLES.F;
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 text-xs font-black ${g.ring} ${g.bg} ${g.text}`}>
      {score.score.grade}
    </span>
  );
}

function ScoreBar({ score }: { score: NftScoreData | null }) {
  if (!score) return <div className="h-1.5 w-full rounded-full bg-[var(--line)]" />;
  const pct = score.score.total;
  const color = pct >= 88 ? "bg-[var(--green)]" : pct >= 72 ? "bg-blue-400" : pct >= 55 ? "bg-amber-400" : pct >= 38 ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[var(--line)]">
        <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-mono text-[var(--muted)] shrink-0">{pct}/100</span>
    </div>
  );
}

function VerifiedDot({ hash }: { hash: string | null }) {
  if (hash) return <span title="Anclado on-chain"><ShieldCheck size={14} className="text-[var(--green)]" /></span>;
  return <span title="Sin mint"><ShieldQuestion size={14} className="text-[var(--muted)]" /></span>;
}

export default async function ProductsPage() {
  const lotes = await listLotes().catch(() => [] as LoteSummary[]);

  const withScores: LoteWithScore[] = await Promise.all(
    lotes.map(async (l) => ({
      ...l,
      score: await getNftScore(l.id).catch(() => null),
    }))
  );

  return (
    <LabShell
      eyebrow="Stellar · Soroban"
      heading="Lotes registrados"
      description="Todos los lotes con trazabilidad on-chain. Cada fila es un NFT anclado en Soroban."
    >
      {withScores.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-[var(--muted)]">
          <ShieldQuestion size={32} />
          <p className="text-sm">No hay lotes registrados aún.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {withScores.map((lote) => {
            const tier = TIER_STYLES[lote.tier] ?? TIER_STYLES.None;
            const bd = lote.score?.score.breakdown;

            return (
              <article
                key={lote.id}
                className="censo-card flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                {/* ── Row principal ── */}
                <div className="flex items-start gap-4">

                  {/* NFT Image */}
                  <div className="shrink-0 w-[72px] h-[40px] rounded-md overflow-hidden border border-[var(--line)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/nft-image/${lote.id}`}
                      alt={`NFT lote ${lote.id}`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[var(--text-strong)] truncate">{lote.producer}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tier.badge}`}>
                        {tier.label}
                      </span>
                      <VerifiedDot hash={lote.mint_tx_hash} />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--muted)]">
                      <span className="font-mono">Lote #{lote.id}</span>
                      <span>·</span>
                      <span>{lote.status}</span>
                      {lote.mint_tx_hash && (
                        <>
                          <span>·</span>
                          <a
                            href={explorerTx(lote.mint_tx_hash)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 hover:text-[var(--green)] transition-colors"
                          >
                            tx {lote.mint_tx_hash.slice(0, 8)}… <ExternalLink size={10} />
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Grade */}
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <GradeBadge score={lote.score} />
                    {lote.score && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        {lote.score.score.grade_label}
                      </span>
                    )}
                  </div>

                  {/* Link */}
                  <Link
                    href={`/dashboard/lotes/${lote.id}`}
                    className="shrink-0 p-2 rounded-lg text-[var(--muted)] hover:text-[var(--green)] hover:bg-[var(--green-soft)] transition-colors"
                    title="Ver detalle"
                  >
                    <ExternalLink size={15} />
                  </Link>
                </div>

                {/* ── Score bar ── */}
                <ScoreBar score={lote.score} />

                {/* ── Breakdown chips ── */}
                {bd && (
                  <div className="flex flex-wrap gap-2">
                    <Chip label="Trazabilidad" score={bd.trazabilidad.score} max={bd.trazabilidad.max} />
                    <Chip label="Integridad" score={bd.integridad.score} max={bd.integridad.max} />
                    <Chip label="Sensores" score={bd.sensores.score} max={bd.sensores.max} />
                    <Chip label="Certificación" score={bd.certificacion.score} max={bd.certificacion.max} icon={<Award size={10} />} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </LabShell>
  );
}

function Chip({
  label, score, max, icon,
}: {
  label: string; score: number; max: number; icon?: React.ReactNode;
}) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? "text-[var(--green)]" : pct >= 60 ? "text-amber-600" : "text-[var(--muted)]";
  return (
    <span className="flex items-center gap-1 px-2 py-1 rounded-full border border-[var(--line)] bg-[var(--surface-soft)] text-[11px]">
      {icon}
      <span className="text-[var(--muted)]">{label}</span>
      <span className={`font-bold ${color}`}>{score}/{max}</span>
    </span>
  );
}
