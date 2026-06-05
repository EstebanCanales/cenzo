"use client";

import { Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addEvent } from "@/lib/censo-actions";

export function LoteActions({
  loteId,
  allowedStages,
  roleLabel,
}: {
  loteId: number;
  allowedStages: string[];
  roleLabel: string;
}) {
  const router = useRouter();
  const isAdmin = allowedStages.length === 0; // admin = sin restricción

  const [stage, setStage] = useState(allowedStages[0] ?? "");
  const [payload, setPayload] = useState('{\n  "detalle": ""\n}');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setError("Payload no es JSON válido");
      setLoading(false);
      return;
    }
    try {
      await addEvent(loteId, { stage: stage.trim(), payload: parsed });
      setPayload('{\n  "detalle": ""\n}');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al anclar evento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="censo-card" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "grid", gap: 2 }}>
        <strong style={{ fontSize: 15 }}>Anclar evento on-chain</strong>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>
          Actuando como <strong>{roleLabel}</strong>
        </span>
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label htmlFor="stage">Etapa</Label>
        {isAdmin ? (
          <Input
            id="stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            placeholder="etapa (símbolo)"
            required
          />
        ) : (
          <select
            id="stage"
            className="ui-input"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            {allowedStages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label htmlFor="payload">Payload (JSON, se hashea y ancla)</Label>
        <textarea
          id="payload"
          className="ui-input"
          style={{ minHeight: 96, fontFamily: "var(--font-mono, monospace)", fontSize: 13 }}
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />
        <span style={{ color: "var(--muted)", fontSize: 11 }}>
          Tip: agregá <code>{'"organico": true'}</code> (u otra práctica) para subir el tier.
        </span>
      </div>
      {error ? <p style={{ color: "#b42318", fontSize: 13, margin: 0 }}>{error}</p> : null}
      <Button type="submit" disabled={loading || !stage.trim()}>
        {loading ? <Loader2 className="spin" size={16} /> : <PlusCircle size={16} />}
        {loading ? "Anclando on-chain…" : "Anclar evento"}
      </Button>
    </form>
  );
}
