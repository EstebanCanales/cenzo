// Cliente del backend Censo (Rust). Tipos espejo de `apps/api/src/models.rs`.
// Las lecturas se hacen desde server components directo al backend.

export type Verification = "verified" | "tampered" | "pending";

export type EventView = {
  idx: number;
  stage: string;
  actor: string;
  payload: Record<string, unknown>;
  hash: string;
  onchain_tx_hash: string | null;
  verification: Verification;
  created_at: string;
};

export type LoteView = {
  id: number;
  producer: string;
  metadata_uri: string;
  tier: string;
  status: string;
  mint_tx_hash: string | null;
  event_count: number;
  onchain_verified: boolean;
  events: EventView[];
};

export type LoteSummary = {
  id: number;
  producer: string;
  tier: string;
  status: string;
  mint_tx_hash: string | null;
};

export type ActorKind = "finca" | "tostador" | "vendedor" | "admin";

export type Actor = {
  id: string;
  kind: ActorKind;
  name: string;
  email: string | null;
  allowed_stages: string[];
};

export const ROLE_LABEL: Record<string, string> = {
  finca: "Finca",
  tostador: "Tostador",
  vendedor: "Vendedor",
  admin: "Admin",
};

export const ROLE_DESC: Record<string, string> = {
  finca: "Origina el lote y registra siembra, fertilización, riego y cosecha.",
  tostador: "Registra recepción, tueste y empaque.",
  vendedor: "Registra calidad y venta.",
};

/** ¿Este rol puede originar (mintear) lotes? */
export function canMint(kind: string): boolean {
  return kind === "finca" || kind === "admin";
}

export const CENSO_API_URL = process.env.CENSO_API_URL ?? "http://127.0.0.1:4000";
export const STELLAR_NETWORK = process.env.STELLAR_NETWORK ?? "testnet";

/** Link al explorer de una transacción Stellar. */
export function explorerTx(hash: string): string {
  return `https://stellar.expert/explorer/${STELLAR_NETWORK}/tx/${hash}`;
}

/** Link al explorer del contrato. */
export function explorerContract(contractId: string): string {
  return `https://stellar.expert/explorer/${STELLAR_NETWORK}/contract/${contractId}`;
}

// ---- Lecturas (server-only) ----

export async function listLotes(): Promise<LoteSummary[]> {
  const res = await fetch(`${CENSO_API_URL}/lotes`, { cache: "no-store" });
  if (!res.ok) throw new Error(`listLotes falló: ${res.status}`);
  return res.json();
}

export async function getLote(id: number | string): Promise<LoteView | null> {
  const res = await fetch(`${CENSO_API_URL}/lotes/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getLote falló: ${res.status}`);
  return res.json();
}

/** Lectura pública (sin auth) — target del QR del empaque. */
export async function getPublicLote(id: number | string): Promise<LoteView | null> {
  const res = await fetch(`${CENSO_API_URL}/public/lotes/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getPublicLote falló: ${res.status}`);
  return res.json();
}
