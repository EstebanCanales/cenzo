// Helpers server-only (NO es un módulo de server actions). Se importan desde
// server components para resolver el actor del usuario logueado.

import { auth } from "@/auth";
import { type Actor, CENSO_API_URL } from "@/lib/censo-api";

export async function getCurrentActor(): Promise<Actor | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return null;
  }
  const res = await fetch(`${CENSO_API_URL}/actors/me`, {
    headers: {
      "x-api-key": process.env.CENSO_API_SECRET ?? "",
      "x-actor-email": email,
    },
    cache: "no-store",
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`actors/me falló: ${res.status}`);
  }
  return res.json();
}
