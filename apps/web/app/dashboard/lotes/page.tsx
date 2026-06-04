import { ChevronRight, PackageSearch, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { LabShell } from "@/components/dashboard/lab-shell";
import { LoteCreateForm } from "@/components/dashboard/lote-create-form";
import { Badge } from "@/components/ui/badge";
import { listLotes, type LoteSummary } from "@/lib/censo-api";

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

export default async function LotesPage() {
  let lotes: LoteSummary[] = [];
  let error: string | null = null;
  try {
    lotes = await listLotes();
  } catch (e) {
    error = e instanceof Error ? e.message : "No se pudo conectar al backend";
  }

  return (
    <LabShell
      eyebrow="On-chain"
      heading="Lotes en Stellar"
      description="Cada lote es un NFT en Soroban (testnet) que acumula su trazabilidad y su certificación. Mintea, ancla eventos y verifica de forma inmutable."
    >
      <div className="censo-grid">
        <section className="censo-list">
          {error ? (
            <div className="censo-card" style={{ color: "#b42318" }}>
              Backend no disponible: {error}
              <br />
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                Arrancá la API con <code>npm run dev:api</code>.
              </span>
            </div>
          ) : lotes.length === 0 ? (
            <div className="censo-card" style={{ display: "grid", gap: 8, placeItems: "center", padding: 40 }}>
              <PackageSearch size={28} color="var(--muted)" />
              <strong>Aún no hay lotes</strong>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>
                Mintea el primero con el formulario de la derecha.
              </span>
            </div>
          ) : (
            lotes.map((lote) => (
              <Link
                key={lote.id}
                href={`/dashboard/lotes/${lote.id}`}
                className="censo-list__item"
              >
                <div style={{ display: "grid", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ShieldCheck size={16} color="var(--green-strong, #1a7a4a)" />
                    <strong>Lote #{lote.id}</strong>
                    <Badge variant={tierVariant(lote.tier)}>{lote.tier}</Badge>
                  </div>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>{lote.producer}</span>
                </div>
                <ChevronRight size={18} color="var(--muted)" />
              </Link>
            ))
          )}
        </section>

        <aside>
          <LoteCreateForm />
        </aside>
      </div>
    </LabShell>
  );
}
