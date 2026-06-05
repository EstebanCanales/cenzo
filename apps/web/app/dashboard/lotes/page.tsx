import { ChevronRight, PackageSearch, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { ActorOnboarding } from "@/components/dashboard/actor-onboarding";
import { LabShell } from "@/components/dashboard/lab-shell";
import { LoteCreateForm } from "@/components/dashboard/lote-create-form";
import { Badge } from "@/components/ui/badge";
import { canMint, listLotes, ROLE_LABEL, type LoteSummary } from "@/lib/censo-api";
import { getCurrentActor } from "@/lib/censo-server";

export const dynamic = "force-dynamic";

function tierVariant(tier: string): "green" | "gold" | "slate" | "outline" {
  switch (tier) {
    case "Diamante": return "green";
    case "Oro":      return "gold";
    case "Plata":    return "slate";
    default:         return "outline";
  }
}

export default async function LotesPage() {
  let lotes: LoteSummary[] = [];
  let error: string | null = null;
  try {
    lotes = await listLotes();
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudo conectar al backend";
  }
  const actor = await getCurrentActor();

  return (
    <LabShell
      eyebrow="On-chain"
      heading="Lotes en Stellar"
      description="Cada lote es un NFT en Soroban (testnet) con trazabilidad y certificación inmutables."
      actions={
        actor ? <Badge variant="green">Actuando como {ROLE_LABEL[actor.kind]}</Badge> : null
      }
    >
      <div className="lotes-layout">

        {/* ── Lista ── */}
        <section className="censo-section">
          {error ? (
            <div className="censo-error">
              Backend no disponible: {error}
              <code>Arrancá la API con npm run dev:api</code>
            </div>
          ) : lotes.length === 0 ? (
            <div className="censo-card censo-empty">
              <PackageSearch size={28} color="var(--muted)" />
              <strong>Aún no hay lotes</strong>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                {actor && canMint(actor.kind)
                  ? "Mintea el primero con el formulario de la derecha."
                  : "Un agricultor puede mintear el primer lote."}
              </span>
            </div>
          ) : (
            <div className="censo-list">
              {lotes.map((lote) => (
                <Link
                  key={lote.id}
                  href={`/dashboard/lotes/${lote.id}`}
                  className="censo-list__item"
                >
                  <div className="censo-list__item__info">
                    <div className="censo-list__item__head">
                      <ShieldCheck size={16} color="var(--green-strong)" />
                      <strong>Lote #{lote.id}</strong>
                      <Badge variant={tierVariant(lote.tier)}>{lote.tier}</Badge>
                    </div>
                    <span className="censo-list__item__sub">{lote.producer}</span>
                  </div>
                  <ChevronRight size={18} color="var(--muted)" />
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Aside: crear / info de rol ── */}
        <aside>
          {!actor ? (
            <ActorOnboarding />
          ) : canMint(actor.kind) ? (
            <LoteCreateForm />
          ) : (
            <div className="censo-card censo-section">
              <p className="censo-section__title">Rol {ROLE_LABEL[actor.kind]}</p>
              <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>
                Tu rol no origina lotes. Abrí uno existente para registrar tus etapas:
                {" "}<strong>{actor.allowed_stages.join(", ")}</strong>.
              </p>
            </div>
          )}
        </aside>

      </div>
    </LabShell>
  );
}
