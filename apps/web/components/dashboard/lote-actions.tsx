"use client";

import { Award, Loader2, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addEvent, setCertification } from "@/lib/censo-actions";

const TIERS = ["Plata", "Oro", "Diamante"] as const;

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

  // --- Agregar evento ---
  const [stage, setStage] = useState(allowedStages[0] ?? "");
  const [payload, setPayload] = useState('{\n  "detalle": ""\n}');
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  async function submitEvent(e: React.FormEvent) {
    e.preventDefault();
    setEventLoading(true);
    setEventError(null);
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(payload);
    } catch {
      setEventError("Payload no es JSON válido");
      setEventLoading(false);
      return;
    }
    try {
      await addEvent(loteId, { stage: stage.trim(), payload: parsed });
      setPayload('{\n  "detalle": ""\n}');
      router.refresh();
    } catch (err) {
      setEventError(err instanceof Error ? err.message : "Error al anclar evento");
    } finally {
      setEventLoading(false);
    }
  }

  // --- Certificar ---
  const [tier, setTier] = useState<string>("Diamante");
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  async function submitCert(e: React.FormEvent) {
    e.preventDefault();
    setCertLoading(true);
    setCertError(null);
    try {
      await setCertification(loteId, tier);
      router.refresh();
    } catch (err) {
      setCertError(err instanceof Error ? err.message : "Error al certificar");
    } finally {
      setCertLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <form onSubmit={submitEvent} className="censo-card" style={{ display: "grid", gap: 12 }}>
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
        </div>
        {eventError ? <p style={{ color: "#b42318", fontSize: 13, margin: 0 }}>{eventError}</p> : null}
        <Button type="submit" disabled={eventLoading || !stage.trim()}>
          {eventLoading ? <Loader2 className="spin" size={16} /> : <PlusCircle size={16} />}
          {eventLoading ? "Anclando on-chain…" : "Anclar evento"}
        </Button>
      </form>

      <form onSubmit={submitCert} className="censo-card" style={{ display: "grid", gap: 12 }}>
        <strong style={{ fontSize: 15 }}>Certificación</strong>
        <div style={{ display: "grid", gap: 6 }}>
          <Label htmlFor="tier">Tier</Label>
          <select
            id="tier"
            className="ui-input"
            value={tier}
            onChange={(e) => setTier(e.target.value)}
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        {certError ? <p style={{ color: "#b42318", fontSize: 13, margin: 0 }}>{certError}</p> : null}
        <Button type="submit" variant="secondary" disabled={certLoading}>
          {certLoading ? <Loader2 className="spin" size={16} /> : <Award size={16} />}
          {certLoading ? "Certificando on-chain…" : `Certificar ${tier}`}
        </Button>
      </form>
    </div>
  );
}
