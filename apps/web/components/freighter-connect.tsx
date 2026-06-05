"use client";

import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { connectFreighter } from "@/lib/wallet";

export function FreighterConnect() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "connecting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleConnect() {
    setState("connecting");
    setErrorMsg("");
    try {
      const { publicKey, network } = await connectFreighter();

      const res = await fetch("/api/wallet/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey, network }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Error al crear sesión");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setErrorMsg(msg);
      setState("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={state === "connecting"}
        onClick={handleConnect}
        className="flex items-center justify-center gap-2.5 w-full rounded-full border-2 border-violet-400 bg-white px-6 py-3 text-sm font-semibold text-violet-700 shadow-sm transition-all hover:bg-violet-50 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Wallet size={17} />
        {state === "connecting" ? "Conectando Freighter…" : "Conectar Freighter"}
      </button>
      {state === "error" && (
        <p className="text-xs text-red-500 text-center">{errorMsg}</p>
      )}
      <p className="text-[11px] text-neutral-400 text-center">
        Necesitas{" "}
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-neutral-600"
        >
          freighter.app
        </a>{" "}
        instalado · Stellar Testnet
      </p>
    </div>
  );
}
