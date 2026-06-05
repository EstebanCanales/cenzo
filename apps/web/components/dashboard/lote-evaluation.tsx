"use client";

import { Award, Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { type Evaluation } from "@/lib/censo-api";
import { certify } from "@/lib/censo-actions";

export function LoteEvaluation({
  loteId,
  evaluation,
  currentTier,
}: {
  loteId: number;
  evaluation: Evaluation;
  currentTier: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommended = evaluation.recommended_tier;
  const synced = currentTier === recommended;

  async function run() {
    setLoading(true);
    setError(null);
    try {
      await certify(loteId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al certificar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="censo-card" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 2 }}>
        <strong style={{ fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
          <Award size={16} /> Certificación automática
        </strong>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>
          Derivada de criterios verificables y escrita on-chain.
        </span>
      </div>
      <ul className="censo-criteria">
        {evaluation.criteria.map((c) => (
          <li key={c.key} className={c.met ? "is-met" : ""}>
            {c.met ? <Check size={14} /> : <X size={14} />}
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>Tier recomendado</span>
        <strong>{recommended}</strong>
      </div>
      {error ? <p style={{ color: "#b42318", fontSize: 13, margin: 0 }}>{error}</p> : null}
      <Button type="button" onClick={run} disabled={loading || synced}>
        {loading ? <Loader2 className="spin" size={16} /> : <Award size={16} />}
        {loading
          ? "Escribiendo on-chain…"
          : synced
            ? `Certificado: ${currentTier}`
            : `Aplicar ${recommended} on-chain`}
      </Button>
    </div>
  );
}
