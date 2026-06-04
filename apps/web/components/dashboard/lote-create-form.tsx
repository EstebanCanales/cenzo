"use client";

import { Loader2, Sprout } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLote } from "@/lib/censo-actions";

export function LoteCreateForm() {
  const router = useRouter();
  const [producer, setProducer] = useState("");
  const [uri, setUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createLote({
        producer: producer.trim(),
        metadata_uri: uri.trim() || undefined,
      });
      router.push(`/dashboard/lotes/${res.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al mintear el lote");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="censo-card" style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 4 }}>
        <strong style={{ fontSize: 15 }}>Mintear nuevo lote</strong>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          Crea un lote-NFT en Soroban (testnet). La transacción la firma el backend custodial.
        </span>
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label htmlFor="producer">Productor / finca</Label>
        <Input
          id="producer"
          value={producer}
          onChange={(e) => setProducer(e.target.value)}
          placeholder="Finca Santa Lucía"
          required
        />
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        <Label htmlFor="uri">Metadata URI (opcional)</Label>
        <Input
          id="uri"
          value={uri}
          onChange={(e) => setUri(e.target.value)}
          placeholder="ipfs://censo/lote/…"
        />
      </div>
      {error ? (
        <p style={{ color: "#b42318", fontSize: 13, margin: 0 }}>{error}</p>
      ) : null}
      <Button type="submit" disabled={loading || !producer.trim()}>
        {loading ? <Loader2 className="spin" size={16} /> : <Sprout size={16} />}
        {loading ? "Minteando on-chain…" : "Mintear lote"}
      </Button>
    </form>
  );
}
