import { ExternalLink, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActorOnboarding } from "@/components/dashboard/actor-onboarding";
import { LabShell } from "@/components/dashboard/lab-shell";
import { LoteActions } from "@/components/dashboard/lote-actions";
import { LoteQr } from "@/components/dashboard/lote-qr";
import { Badge } from "@/components/ui/badge";
import { explorerTx, getLote, ROLE_LABEL, type EventView } from "@/lib/censo-api";
import { getCurrentActor } from "@/lib/censo-server";

export const dynamic = "force-dynamic";

function tierVariant(tier: string): "green" | "gold" | "slate" | "outline" {
  switch (tier) {
    case "Diamante":
      return "green";
    case "Oro":
      return "gold";
    case "Plata":
      return "slate";
    default:
      return "outline";
  }
}

function VerificationTag({ v }: { v: EventView["verification"] }) {
  if (v === "verified") {
    return (
      <span className="censo-verif censo-verif--verified">
        <ShieldCheck size={14} /> Verificado
      </span>
    );
  }
  if (v === "tampered") {
    return (
      <span className="censo-verif censo-verif--tampered">
        <ShieldAlert size={14} /> Manipulado
      </span>
    );
  }
  return (
    <span className="censo-verif censo-verif--pending">
      <ShieldQuestion size={14} /> Pendiente
    </span>
  );
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
  const lote = await getLote(id);
  if (!lote) {
    notFound();
  }
  const actor = await getCurrentActor();

  return (
    <LabShell
      eyebrow={`Lote #${lote.id}`}
      heading={lote.producer}
      description="Trazabilidad anclada en Soroban. Cada evento verifica su hash contra la cadena."
      actions={<Badge variant={tierVariant(lote.tier)}>Certificación: {lote.tier}</Badge>}
    >
      <div className="censo-grid">
        <section style={{ display: "grid", gap: 16 }}>
          <div className="censo-card" style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <strong style={{ fontSize: 15 }}>Estado on-chain</strong>
              {lote.onchain_verified && lote.event_count > 0 ? (
                <span className="censo-verif censo-verif--verified">
                  <ShieldCheck size={14} /> Íntegro
                </span>
              ) : lote.event_count === 0 ? (
                <span className="censo-verif censo-verif--pending">
                  <ShieldQuestion size={14} /> Sin eventos
                </span>
              ) : (
                <span className="censo-verif censo-verif--tampered">
                  <ShieldAlert size={14} /> Revisar
                </span>
              )}
            </div>
            <div style={{ display: "grid", gap: 6, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Eventos anclados</span>
                <strong>{lote.event_count}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)" }}>Mint</span>
                <TxLink hash={lote.mint_tx_hash} label="tx" />
              </div>
              {lote.metadata_uri ? (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--muted)" }}>Metadata</span>
                  <span className="censo-mono">{lote.metadata_uri}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <strong style={{ fontSize: 15 }}>Trazabilidad ({lote.events.length})</strong>
            {lote.events.length === 0 ? (
              <div className="censo-card" style={{ color: "var(--muted)", fontSize: 13 }}>
                Todavía no hay eventos. Anclá el primero a la derecha.
              </div>
            ) : (
              lote.events.map((ev) => (
                <article key={ev.idx} className="censo-event">
                  <div className="censo-event__head">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="censo-mono">#{ev.idx}</span>
                      <strong>{ev.stage}</strong>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>· {ev.actor}</span>
                    </div>
                    <VerificationTag v={ev.verification} />
                  </div>
                  <pre className="censo-payload">{JSON.stringify(ev.payload, null, 2)}</pre>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span className="censo-mono">sha256: {ev.hash.slice(0, 16)}…</span>
                    <TxLink hash={ev.onchain_tx_hash} label="tx" />
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside style={{ display: "grid", gap: 16 }}>
          <LoteQr loteId={lote.id} />
          {actor ? (
            <LoteActions
              loteId={lote.id}
              allowedStages={actor.allowed_stages}
              roleLabel={ROLE_LABEL[actor.kind]}
            />
          ) : (
            <ActorOnboarding />
          )}
        </aside>
      </div>
    </LabShell>
  );
}
