import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "censo-dev-secret-change-in-prod"
);

export async function POST(req: NextRequest) {
  const { publicKey, network } = await req.json();

  if (!publicKey || typeof publicKey !== "string") {
    return NextResponse.json({ error: "publicKey requerido" }, { status: 400 });
  }

  // Verifica que sea una clave pública Stellar válida (comienza con G, 56 chars)
  if (!/^G[A-Z2-7]{55}$/.test(publicKey)) {
    return NextResponse.json({ error: "Clave pública Stellar inválida" }, { status: 400 });
  }

  // Verifica en el backend si esta wallet tiene un actor registrado
  const apiUrl = process.env.CENSO_API_URL ?? "http://127.0.0.1:4000";
  let actorKind: string | null = null;
  try {
    const res = await fetch(`${apiUrl}/actors`, { cache: "no-store" });
    if (res.ok) {
      const actors: { id: string; kind: string; wallet_address?: string }[] = await res.json();
      const match = actors.find((a) => a.wallet_address === publicKey);
      if (match) actorKind = match.kind;
    }
  } catch {
    // backend no disponible — igual permitimos conectar la wallet
  }

  // Genera JWT con la misma estructura que Auth.js espera
  const jwt = await new SignJWT({
    sub: publicKey,
    name: `${publicKey.slice(0, 6)}…${publicKey.slice(-4)}`,
    email: `${publicKey.toLowerCase()}@stellar.network`,
    wallet: publicKey,
    network: network ?? "TESTNET",
    actorKind,
    provider: "freighter",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);

  const res = NextResponse.json({ ok: true, publicKey, actorKind });
  res.cookies.set("wallet-session", jwt, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("wallet-session");
  return res;
}
