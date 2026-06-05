import { ExternalLink, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActorOnboarding } from "@/components/dashboard/actor-onboarding";
import { LabShell } from "@/components/dashboard/lab-shell";
import { LoteActions } from "@/components/dashboard/lote-actions";
import { LoteEvaluation } from "@/components/dashboard/lote-evaluation";
import { LoteQr } from "@/components/dashboard/lote-qr";
import { NftScoreCard } from "@/components/dashboard/nft-score-card";
import { SensorPanel } from "@/components/dashboard/sensor-panel";
import { Badge } from "@/components/ui/badge";
import {
  explorerTx,
  getClimate,
  getLote,
  getNftScore,
  listSensorReadings,
  ROLE_LABEL,
  type EventView,
} from "@/lib/censo-api";
import { getCurrentActor } from "@/lib/censo-server";

export const dynamic = "force-dynamic";

const DEMO_LAT = 9.9281;
const DEMO_LON = -84.0907;

function tierVariant(tier: string): "green" | "gold" | "slate" | "outline" {
  switch (tier) {
    case "Diamante": return "green";
    case "Oro":      return "gold";
    case "Plata":    return "slate";
    default:         return "outline";
  }
}

function VerificationTag({ v }: { v: EventView["verification"] }) {
  if (v === "verified")
    return <span className="censo-verif censo-verif--verified"><ShieldCheck size={13} /> Verificado</span>;
  if (v === "tampered")
    return <span className="censo-verif censo-verif--tampered"><ShieldAlert size={13} /> Manipulado</span>;
  return <span className="censo-verif censo-verif--pending"><ShieldQuestion size={13} /> Pendiente</span>;
}

function TxLink({ hash, label }: { hash: string | null; label: string }) {
  if (!hash) return <span className="censo-mono">—</span>;
  return (
    <a className="censo-link" href={explorerTx(hash)} target="_blank" rel="noreferrer">
      {label}: {hash.slice(0, 10)}… <ExternalLink size={11} style={{ display: "inline" }} />
    </a>
  );
}

export default async function LoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lote, actor, readings, climate, nftScore] = await Promise.all([
    getLote(id),
    getCurrentActor(),
    listSensorReadings(Number(id)),
    getClimate(DEMO_LAT, DEMO_LON, 7),
    getNftScore(Number(id)).catch(() => null),
  ]);

  if (!lote) notFound();

  const integrityOk = lote.onchain_verified && lote.event_count > 0;

  return (
    <LabShell
      eyebrow={`Lote #${lote.id}`}
      heading={lote.producer}
      description="Trazabilidad anclada en Soroban. Cada evento verifica su hash contra la cadena."
      actions={<Badge variant={tierVariant(lote.tier)}>Certificación: {lote.tier}</Badge>}
    >
      <div className="lote-detail-layout">

        {/* ── Columna principal ── */}
        <div className="censo-section">

          {/* Estado on-chain */}
          <div className="censo-card">
            <div className="lote-onchain-status">
              <strong className="censo-section__title">Estado on-chain</strong>
              {integrityOk ? (
                <span className="censo-verif censo-verif--verified"><ShieldCheck size={13} /> Íntegro</span>
              ) : lote.event_count === 0 ? (
                <span className="censo-verif censo-verif--pending"><ShieldQuestion size={13} /> Sin eventos</span>
              ) : (
                <span className="censo-verif censo-verif--tampered"><ShieldAlert size={13} /> Revisar</span>
              )}
            </div>
            <div className="lote-onchain-rows">
              <div className="lote-onchain-row">
                <span className="lote-onchain-row__label">Eventos anclados</span>
                <strong>{lote.event_count}</strong>
              </div>
              <div className="lote-onchain-row">
                <span className="lote-onchain-row__label">Mint</span>
                <TxLink hash={lote.mint_tx_hash} label="tx" />
              </div>
              {lote.metadata_uri && (
                <div className="lote-onchain-row">
                  <span className="lote-onchain-row__label">Metadata</span>
                  <span className="censo-mono">{lote.metadata_uri}</span>
                </div>
              )}
            </div>
          </div>

          {/* Trazabilidad */}
          <div className="censo-section">
            <p className="censo-section__title">Trazabilidad ({lote.events.length})</p>
            {lote.events.length === 0 ? (
              <div className="censo-card censo-empty">
                <ShieldQuestion size={24} color="var(--muted)" />
                <strong>Sin eventos aún</strong>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>
                  Añadí el primero desde el panel lateral.
                </span>
              </div>
            ) : (
              <div className="censo-events">
                {lote.events.map((ev) => (
                  <article key={ev.idx} className="censo-event">
                    <div className="censo-event__head">
                      <div className="censo-event__meta">
                        <span className="censo-event__idx">#{ev.idx}</span>
                        <span className="censo-event__stage">{ev.stage}</span>
                        <span className="censo-event__actor">· {ev.actor}</span>
                      </div>
                      <VerificationTag v={ev.verification} />
                    </div>
                    <pre className="censo-payload">{JSON.stringify(ev.payload, null, 2)}</pre>
                    <div className="censo-event__footer">
                      <span className="censo-mono">sha256: {ev.hash.slice(0, 16)}…</span>
                      <TxLink hash={ev.onchain_tx_hash} label="tx" />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Columna aside ── */}
        <div className="lote-aside">
          <LoteQr loteId={lote.id} />
          <LoteEvaluation loteId={lote.id} evaluation={lote.evaluation} currentTier={lote.tier} />
          {actor ? (
            <LoteActions
              loteId={lote.id}
              allowedStages={actor.allowed_stages}
              roleLabel={ROLE_LABEL[actor.kind]}
            />
          ) : (
            <ActorOnboarding />
          )}
          <SensorPanel readings={readings} climate={climate} loteId={lote.id} />
          {nftScore && <NftScoreCard data={nftScore} loteId={lote.id} />}
        </div>

      </div>
    </LabShell>
  );
}
