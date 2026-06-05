import { redirect } from "next/navigation";
import Image from "next/image";
import { Leaf, ShieldCheck, LineChart } from "lucide-react";

import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { FreighterConnect } from "@/components/freighter-connect";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16 font-sans">

      {/* Logo + título */}
      <div className="flex flex-col items-center gap-3 mb-10 text-center">
        <Image src="/logo.svg" alt="Cenzo" width={48} height={48} />
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">Cenzo</h1>
        <p className="text-sm text-neutral-500 max-w-xs">
          Trazabilidad agrícola verificable en Stellar · Soroban
        </p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-sm bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3 mb-10">
        <FreighterConnect />
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-100" />
          <span className="text-xs text-neutral-400">o</span>
          <div className="flex-1 h-px bg-neutral-100" />
        </div>
        <form action={async () => { "use server"; await signIn("google", { redirectTo: "/dashboard" }); }}>
          <Button type="submit" variant="outline" className="w-full rounded-xl">
            Continuar con Google
          </Button>
        </form>
      </div>

      {/* 3 feature boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        <div className="flex flex-col gap-2 p-5 rounded-2xl border border-neutral-100 bg-neutral-50">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Leaf size={17} className="text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-neutral-900">Origen transparente</p>
          <p className="text-xs text-neutral-500 leading-relaxed">Cada etapa del ciclo agrícola registrada, desde la siembra hasta la venta.</p>
        </div>

        <div className="flex flex-col gap-2 p-5 rounded-2xl border border-neutral-100 bg-neutral-50">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <ShieldCheck size={17} className="text-blue-600" />
          </div>
          <p className="text-sm font-bold text-neutral-900">Evidencia inmutable</p>
          <p className="text-xs text-neutral-500 leading-relaxed">Hashes SHA-256 anclados en Soroban — cualquier manipulación es detectable.</p>
        </div>

        <div className="flex flex-col gap-2 p-5 rounded-2xl border border-neutral-100 bg-neutral-50">
          <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
            <LineChart size={17} className="text-violet-600" />
          </div>
          <p className="text-sm font-bold text-neutral-900">NFT Score</p>
          <p className="text-xs text-neutral-500 leading-relaxed">Certificado A–F calculado desde métricas reales. Verificable con un QR.</p>
        </div>
      </div>

    </main>
  );
}
