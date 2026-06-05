import {
  Award,
  Check,
  Coffee,
  ExternalLink,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  X,
} from "lucide-react";
import type { Metadata } from "next";

import { explorerTx, getPublicLote, type EventView, type LoteView } from "@/lib/censo-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Censo · Trazabilidad verificada",
  description: "Verificá el origen y las certificaciones de este producto, ancladas en Stellar.",
};

function tierClass(tier: string): string {
  switch (tier) {
    case "Diamante":
      return "pub-tier--diamante";
    case "Oro":
      return "pub-tier--oro";
    case "Plata":
      return "pub-tier--plata";
    default:
      return "pub-tier--none";
  }
}

function Verification({ v }: { v: EventView["verification"] }) {
  if (v === "verified") {
    return (
      <span className="censo-verif censo-verif--verified">
        <ShieldCheck size={13} /> Verificado
      </span>
    );
  }
  if (v === "tampered") {
    return (
      <span className="censo-verif censo-verif--tampered">
        <ShieldAlert size={13} /> Alterado
      </span>
    );
  }
  return (
    <span className="censo-verif censo-verif--pending">
      <ShieldQuestion size={13} /> Pendiente
    </span>
  );
}

function NotFound({ id }: { id: string }) {
  return (
    <main className="pub">
      <div className="pub-card" style={{ textAlign: "center", display: "grid", gap: 10, placeItems: "center" }}>
        <ShieldQuestion size={36} color="var(--muted)" />
        <h1 style={{ margin: 0, fontSize: 20 }}>Lote no encontrado</h1>
        <p style={{ color: "var(--muted)", margin: 0 }}>
          No existe un lote con id <strong>{id}</strong> en Censo.
        </p>
      </div>
    </main>
  );
}

export default async function PublicTracePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let lote: LoteView | null = null;
  try {
    lote = await getPublicLote(id);
  } catch {
    lote = null;
  }
  if (!lote) {
    return <NotFound id={id} />;
  }

  const integral = lote.onchain_verified && lote.event_count > 0;

  return (
    <main className="pub">
      <header className="pub-brand">
        <Leaf size={18} color="var(--green-strong, #1a7a4a)" />
        <span>Censo</span>
        <small>Trazabilidad verificada en Stellar</small>
      </header>

      <section className="pub-card pub-hero">
        <div className="pub-hero__icon">
          <Coffee size={26} />
        </div>
        <p className="pub-eyebrow">Lote #{lote.id}</p>
        <h1>{lote.producer}</h1>

        <div className={`pub-tier ${tierClass(lote.tier)}`}>
          <Award size={16} />
          {lote.tier === "None" ? "Sin certificación" : `Certificación ${lote.tier}`}
        </div>

        <div className={`pub-integrity ${integral ? "pub-integrity--ok" : "pub-integrity--warn"}`}>
          {integral ? <ShieldCheck size={16} /> : <ShieldQuestion size={16} />}
          {integral
            ? "Trazabilidad íntegra y verificada on-chain"
            : lote.event_count === 0
              ? "Aún sin eventos registrados"
              : "Algún evento no coincide con la cadena"}
        </div>
        {lote.mint_tx_hash ? (
          <a className="censo-link" href={explorerTx(lote.mint_tx_hash)} target="_blank" rel="noreferrer">
            Ver emisión en Stellar Explorer <ExternalLink size={11} style={{ display: "inline" }} />
          </a>
        ) : null}
      </section>

      <section className="pub-card" style={{ display: "grid", gap: 12 }}>
        <strong style={{ fontSize: 15 }}>Criterios de certificación</strong>
        <ul className="censo-criteria">
          {lote.evaluation.criteria.map((c) => (
            <li key={c.key} className={c.met ? "is-met" : ""}>
              {c.met ? <Check size={14} /> : <X size={14} />}
              <span>{c.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pub-trace">
        <h2>Recorrido del producto</h2>
        {lote.events.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>Todavía no hay eventos registrados para este lote.</p>
        ) : (
          <ol className="pub-timeline">
            {lote.events.map((ev) => (
              <li key={ev.idx} className="pub-step">
                <div className="pub-step__dot" />
                <div className="pub-step__body">
                  <div className="pub-step__head">
                    <strong>{ev.stage}</strong>
                    <Verification v={ev.verification} />
                  </div>
                  <span className="pub-step__actor">{ev.actor}</span>
                  <dl className="pub-step__data">
                    {Object.entries(ev.payload).map(([k, val]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{typeof val === "object" ? JSON.stringify(val) : String(val)}</dd>
                      </div>
                    ))}
                  </dl>
                  {ev.onchain_tx_hash ? (
                    <a
                      className="censo-link"
                      href={explorerTx(ev.onchain_tx_hash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      tx on-chain <ExternalLink size={11} style={{ display: "inline" }} />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer className="pub-footer">
        Cada evento está anclado por su hash SHA-256 en un contrato Soroban (Stellar).
        Si el dato cambiara, la verificación lo detecta.
      </footer>
    </main>
  );
}
