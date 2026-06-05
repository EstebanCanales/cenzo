"use client";

import { Factory, Loader2, Sprout, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ROLE_DESC } from "@/lib/censo-api";
import { registerActor } from "@/lib/censo-actions";

const ROLE_OPTIONS = [
  { kind: "finca", label: "Finca", icon: Sprout },
  { kind: "tostador", label: "Tostador", icon: Factory },
  { kind: "vendedor", label: "Vendedor", icon: Store },
] as const;

export function ActorOnboarding() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(kind: string) {
    setSelected(kind);
    setLoading(true);
    setError(null);
    try {
      await registerActor({ kind });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
      setLoading(false);
      setSelected(null);
    }
  }

  return (
    <div className="censo-card" style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 4 }}>
        <strong style={{ fontSize: 15 }}>Elegí tu rol</strong>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          Cada rol registra solo sus etapas de la cadena. Podés cambiarlo después.
        </span>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {ROLE_OPTIONS.map(({ kind, label, icon: Icon }) => (
          <button
            key={kind}
            type="button"
            disabled={loading}
            onClick={() => choose(kind)}
            className="censo-list__item"
            style={{ cursor: "pointer", textAlign: "left", border: "1px solid var(--line)" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {loading && selected === kind ? (
                <Loader2 className="spin" size={18} />
              ) : (
                <Icon size={18} color="var(--green-strong, #1a7a4a)" />
              )}
              <span style={{ display: "grid", gap: 2 }}>
                <strong>{label}</strong>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{ROLE_DESC[kind]}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
      {error ? <p style={{ color: "#b42318", fontSize: 13, margin: 0 }}>{error}</p> : null}
    </div>
  );
}
