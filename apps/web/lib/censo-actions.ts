"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { type Actor, CENSO_API_URL } from "@/lib/censo-api";

async function sessionEmail(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    throw new Error("No autenticado");
  }
  return email;
}

function apiKey(): string {
  return process.env.CENSO_API_SECRET ?? "";
}

async function authHeaders(): Promise<HeadersInit> {
  return {
    "content-type": "application/json",
    "x-api-key": apiKey(),
    "x-actor-email": await sessionEmail(),
  };
}

async function post(path: string, body: unknown, headers: HeadersInit) {
  const res = await fetch(`${CENSO_API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export async function registerActor(input: { kind: string; name?: string }): Promise<Actor> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    throw new Error("No autenticado");
  }
  const name = input.name?.trim() || session.user?.name || email;
  const result = await post(
    "/actors",
    { kind: input.kind, name, email },
    { "content-type": "application/json", "x-api-key": apiKey() },
  );
  revalidatePath("/dashboard/lotes");
  return result;
}

export type CreateLoteResult = { id: number; mint_tx_hash: string | null };

export async function createLote(input: {
  producer: string;
  metadata_uri?: string;
}): Promise<CreateLoteResult> {
  const result = await post("/lotes", input, await authHeaders());
  revalidatePath("/dashboard/lotes");
  return result;
}

export async function addEvent(
  loteId: number,
  input: { stage: string; payload: Record<string, unknown> },
): Promise<{ idx: number; hash: string; onchain_tx_hash: string | null }> {
  const result = await post(`/lotes/${loteId}/events`, input, await authHeaders());
  revalidatePath(`/dashboard/lotes/${loteId}`);
  return result;
}

export async function setCertification(
  loteId: number,
  tier: string,
): Promise<{ ok: boolean; tx_hash: string | null }> {
  const result = await post(`/lotes/${loteId}/certification`, { tier }, await authHeaders());
  revalidatePath(`/dashboard/lotes/${loteId}`);
  return result;
}

/** Certifica automáticamente: el backend computa el tier del rubro y lo escribe on-chain. */
export async function certify(
  loteId: number,
): Promise<{ tier: string; tx_hash: string | null }> {
  const result = await post(`/lotes/${loteId}/certify`, {}, await authHeaders());
  revalidatePath(`/dashboard/lotes/${loteId}`);
  return result;
}

/** Genera lectura IoT simulada y la guarda (demo / testing). */
export async function simulateSensorReading(
  stationId: string,
  loteId?: number,
): Promise<{ id: number; reading: Record<string, unknown> }> {
  const result = await post(
    "/sensors/simulate",
    { station_id: stationId, lote_id: loteId ?? null },
    await authHeaders(),
  );
  revalidatePath("/dashboard");
  if (loteId) revalidatePath(`/dashboard/lotes/${loteId}`);
  return result;
}
