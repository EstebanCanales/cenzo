"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { CENSO_API_URL } from "@/lib/censo-api";

async function requireSession() {
  const session = await auth();
  if (!session) {
    throw new Error("No autenticado");
  }
}

function writeHeaders(): HeadersInit {
  return {
    "content-type": "application/json",
    "x-api-key": process.env.CENSO_API_SECRET ?? "",
  };
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${CENSO_API_URL}${path}`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export type CreateLoteResult = { id: number; mint_tx_hash: string | null };

export async function createLote(input: {
  producer: string;
  metadata_uri?: string;
}): Promise<CreateLoteResult> {
  await requireSession();
  const result = await post("/lotes", input);
  revalidatePath("/dashboard/lotes");
  return result;
}

export async function addEvent(
  loteId: number,
  input: { stage: string; actor: string; payload: Record<string, unknown> },
): Promise<{ idx: number; hash: string; onchain_tx_hash: string | null }> {
  await requireSession();
  const result = await post(`/lotes/${loteId}/events`, input);
  revalidatePath(`/dashboard/lotes/${loteId}`);
  return result;
}

export async function setCertification(
  loteId: number,
  tier: string,
): Promise<{ ok: boolean; tx_hash: string | null }> {
  await requireSession();
  const result = await post(`/lotes/${loteId}/certification`, { tier });
  revalidatePath(`/dashboard/lotes/${loteId}`);
  return result;
}
