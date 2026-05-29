import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <Badge variant="green">Censo + Stellar</Badge>
        <p className="eyebrow">Agricultural trust layer</p>
        <h1>Trazabilidad agricola verificable desde el primer login.</h1>
        <p className="lede">
          Convierte movimientos, controles de calidad y evidencia operativa en
          confianza visible para productores, cooperativas y compradores.
        </p>

        <div className="cta-stack">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button size="lg" type="submit">
              Continuar con Google
            </Button>
          </form>

          <p className="helper-text">
            Entras al dashboard y desde ahi ves lotes, productos, graficas y la
            capa de verificacion en Stellar.
          </p>
        </div>
      </section>
    </main>
  );
}
