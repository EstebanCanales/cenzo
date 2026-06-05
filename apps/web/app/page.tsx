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
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16 font-sans overflow-hidden">

      {/* Animated background blobs */}
      <div className="pointer-events-none select-none absolute inset-0 -z-10">
        <div className="blob-1 absolute top-[-10%] left-[-5%] w-[520px] h-[520px] rounded-full bg-emerald-200/50 blur-[100px]" />
        <div className="blob-2 absolute bottom-[-10%] right-[-5%] w-[480px] h-[480px] rounded-full bg-violet-200/40 blur-[90px]" />
        <div className="blob-3 absolute top-[35%] left-[35%] w-[320px] h-[320px] rounded-full bg-blue-100/40 blur-[80px]" />
      </div>

      {/* Logo + título */}
      <div className="flex flex-col items-center gap-2 mb-10 text-center">
        <Image src="/logo.svg" alt="Cenzo" width={48} height={48} />
        <h1 className="text-3xl font-black tracking-tight text-neutral-900">Cenzo</h1>
        <p className="text-sm text-neutral-500">Trazabilidad agrícola verificable · Stellar Soroban</p>
      </div>

      {/* Login | Boxes */}
      <div className="flex flex-col md:flex-row items-stretch gap-6 w-full max-w-3xl">

        {/* Login card */}
        <div className="w-full md:w-72 shrink-0 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Acceder</p>
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
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex gap-3 p-5 rounded-2xl border border-neutral-100 bg-white/70 backdrop-blur-sm hover:shadow-sm transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Leaf size={17} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 mb-0.5">Origen transparente</p>
              <p className="text-xs text-neutral-500 leading-relaxed">Cada etapa del ciclo agrícola registrada, desde la siembra hasta la venta.</p>
            </div>
          </div>

          <div className="flex gap-3 p-5 rounded-2xl border border-neutral-100 bg-white/70 backdrop-blur-sm hover:shadow-sm transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <ShieldCheck size={17} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 mb-0.5">Evidencia inmutable</p>
              <p className="text-xs text-neutral-500 leading-relaxed">Hashes SHA-256 anclados en Soroban — cualquier manipulación es detectable.</p>
            </div>
          </div>

          <div className="flex gap-3 p-5 rounded-2xl border border-neutral-100 bg-white/70 backdrop-blur-sm hover:shadow-sm transition-shadow">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
              <LineChart size={17} className="text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900 mb-0.5">NFT Score</p>
              <p className="text-xs text-neutral-500 leading-relaxed">Certificado A–F calculado desde métricas reales. Verificable con un QR.</p>
            </div>
          </div>
        </div>

      </div>

    </main>
  );
}
