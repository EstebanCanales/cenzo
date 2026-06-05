import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { jwtVerify } from "jose";

import { auth } from "@/auth";

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

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const [session, wallet] = await Promise.all([auth(), getWalletSession()]);

  if (!session?.user && !wallet) {
    redirect("/");
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      {children}
    </div>
  );
}
