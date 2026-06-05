import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { auth, signOut } from "@/auth";

import { SidebarClient } from "./sidebar-client";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "censo-dev-secret-change-in-prod"
);

async function getWalletSession() {
  const jar = await cookies();
  const token = jar.get("wallet-session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { wallet: string; name: string; network: string };
  } catch {
    return null;
  }
}

export async function AppSidebar() {
  const [session, wallet] = await Promise.all([auth(), getWalletSession()]);

  const isWallet = !session?.user && Boolean(wallet);
  const name = session?.user?.name ?? wallet?.name ?? "Agricultural operator";
  const email = session?.user?.email ?? "operator@censo.local";
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <SidebarClient
      email={email}
      initials={initials}
      name={name}
      walletAddress={isWallet ? wallet!.wallet : null}
      onSignOut={async () => {
        "use server";
        if (session?.user) {
          await signOut({ redirect: false });
        }
        // wallet cookie se borra via API route DELETE /api/wallet/session
        // el redirect lo maneja el cliente
      }}
    />
  );
}
