"use client";

// Thin wrapper around @stellar/freighter-api
// Importado solo en client components — Freighter accede a window.freighter

export type WalletState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected"; publicKey: string; network: string }
  | { status: "error"; message: string };

export async function connectFreighter(): Promise<{ publicKey: string; network: string }> {
  // Dynamic import keeps Freighter API fuera del bundle de servidor
  const { isConnected, requestAccess, getAddress, getNetwork } = await import(
    "@stellar/freighter-api"
  );

  const connected = await isConnected();
  if (!connected.isConnected) {
    throw new Error("Freighter no está instalado. Instálalo en freighter.app");
  }

  const access = await requestAccess();
  if (access.error) throw new Error(access.error);

  const addr = await getAddress();
  if (addr.error) throw new Error(addr.error);

  const net = await getNetwork();
  if (net.error) throw new Error(net.error);

  return { publicKey: addr.address, network: net.network };
}

export async function getFreighterAddress(): Promise<string | null> {
  try {
    const { isConnected, getAddress } = await import("@stellar/freighter-api");
    const c = await isConnected();
    if (!c.isConnected) return null;
    const a = await getAddress();
    return a.error ? null : a.address;
  } catch {
    return null;
  }
}
