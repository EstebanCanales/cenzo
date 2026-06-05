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

export type Criterion = {
  key: string;
  label: string;
  met: boolean;
};

export type Evaluation = {
  recommended_tier: string;
  criteria: Criterion[];
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
  evaluation: Evaluation;
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

// ── Sensores / Clima (Fase 5) ─────────────────────────────────────────────

export type SensorReading = {
  id: number;
  station_id: string;
  lote_id: number | null;
  temp_aire: number | null;
  humedad: number | null;
  temp_suelo: number | null;
  ph_suelo: number | null;
  lluvia_mm: number | null;
  lat: number | null;
  lon: number | null;
  recorded_at: string;
};

export type NasaDay = {
  date: string;         // YYYYMMDD
  t2m_max: number;
  t2m_min: number;
  prectotcorr: number;
  rh2m: number;
};

export type ClimateData = {
  lat: number;
  lon: number;
  days: NasaDay[];
};

export async function listSensorReadings(loteId?: number): Promise<SensorReading[]> {
  const qs = loteId ? `?lote_id=${loteId}&limit=20` : "?limit=20";
  const res = await fetch(`${CENSO_API_URL}/sensors/readings${qs}`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.readings ?? [];
}

export async function getClimate(lat: number, lon: number, days = 7): Promise<ClimateData | null> {
  try {
    const res = await fetch(
      `${CENSO_API_URL}/sensors/climate/${lat}/${lon}?days=${days}`,
      { next: { revalidate: 3600 } }  // cache 1h — NASA POWER no cambia en minutos
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── NFT Score ─────────────────────────────────────────────────────────────

export type NftScoreComponent = {
  score: number;
  max: number;
  label: string;
  detail: string;
};

export type NftScoreData = {
  lote_id: number;
  producer: string;
  tier: string;
  score: {
    total: number;
    grade: string;
    grade_label: string;
    summary: string;
    breakdown: {
      trazabilidad:   NftScoreComponent;
      integridad:     NftScoreComponent;
      sensores:       NftScoreComponent;
      certificacion:  NftScoreComponent;
    };
    traits: { trait_type: string; value: string; display_type?: string }[];
  };
};

export async function getNftScore(loteId: number | string): Promise<NftScoreData | null> {
  try {
    const res = await fetch(`${CENSO_API_URL}/lotes/${loteId}/nft-score`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
