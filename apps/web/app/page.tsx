import { redirect } from "next/navigation";
import Image from "next/image";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FreighterConnect } from "@/components/freighter-connect";
import { Sprout, ShieldCheck, LineChart, Leaf, ArrowRight, Network, TreePine, Droplets, Wheat } from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-emerald-200">
      {/* Navigation */}
      <nav className="border-b border-neutral-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Censo Logo" width={40} height={40} className="w-10 h-10" />
            <span className="text-2xl font-black tracking-tight text-emerald-900">Censo</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-neutral-600">
            <a href="#features" className="hover:text-emerald-700 transition-colors">Características</a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition-colors">Cómo Funciona</a>
            <a href="#blockchain" className="hover:text-emerald-700 transition-colors">Tecnología Stellar</a>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="hidden md:flex bg-emerald-50 border-emerald-200 text-emerald-800">
              Stellar Network
            </Badge>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/50 via-neutral-50 to-neutral-50" />
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-400/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-blue-300/20 blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Hero Copy & CTA */}
            <div className="lg:col-span-6 flex flex-col gap-8">
              <Badge className="w-fit bg-white text-emerald-700 border-emerald-200 px-4 py-1.5 text-sm font-semibold shadow-sm">
                Plataforma de Confianza Agrícola
              </Badge>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-neutral-950">
                Trazabilidad <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">verificable</span> en cada grano.
              </h1>
              
              <p className="text-lg lg:text-xl text-neutral-600 leading-relaxed max-w-xl">
                Censo convierte movimientos, controles de calidad y evidencia operativa de tus cultivos en 
                confianza digital y NFTs visibles para toda tu cadena de suministro, impulsado por Stellar.
              </p>

              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-emerald-900/5 border border-neutral-100 max-w-md">
                <h3 className="text-sm font-bold text-neutral-900 mb-4 text-center">Accede a tu cuenta</h3>
                <div className="flex flex-col gap-3">
                  <FreighterConnect />

                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-neutral-100" />
                    <span className="text-xs font-medium text-neutral-400">o también</span>
                    <div className="flex-1 h-px bg-neutral-100" />
                  </div>

                  <form
                    action={async () => {
                      "use server";
                      await signIn("google", { redirectTo: "/dashboard" });
                    }}
                  >
                    <Button size="lg" type="submit" variant="outline" className="w-full rounded-2xl h-12 border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 font-semibold transition-all">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                      Continuar con Google
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration (Abstract) */}
            <div className="lg:col-span-6 relative hidden md:block">
              <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden border border-white/40 shadow-2xl bg-gradient-to-br from-emerald-100/50 to-white/20 backdrop-blur-xl">
                {/* Simulated App UI */}
                <div className="absolute inset-4 bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden flex flex-col">
                  <div className="h-16 border-b border-neutral-100 flex items-center px-6 gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Sprout className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-neutral-100 rounded-full" />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                  </div>
                  <div className="flex-1 p-6 flex gap-6">
                    <div className="w-1/3 flex flex-col gap-4">
                      <div className="h-24 w-full bg-emerald-50 rounded-2xl border border-emerald-100" />
                      <div className="h-24 w-full bg-blue-50 rounded-2xl border border-blue-100" />
                      <div className="h-24 w-full bg-amber-50 rounded-2xl border border-amber-100" />
                    </div>
                    <div className="w-2/3 bg-neutral-50 rounded-2xl border border-neutral-100 p-6">
                       {/* Chart simulation */}
                       <div className="h-full w-full flex items-end gap-2">
                         {[40, 70, 45, 90, 65, 100, 85].map((h, i) => (
                           <div key={i} className="flex-1 bg-emerald-200 rounded-t-sm" style={{ height: `${h}%` }} />
                         ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-neutral-100 flex items-center gap-4 z-20">
                <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">Lote Certificado</p>
                  <p className="text-xs text-neutral-500 font-mono">Hash: 0x8f...4e2a</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">El ecosistema para el agro del futuro</h2>
            <p className="text-neutral-600 text-lg">
              Una plataforma integral que conecta la realidad física del campo con la seguridad de la blockchain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100 hover:border-emerald-200 transition-colors">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Network className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trazabilidad End-to-End</h3>
              <p className="text-neutral-600">
                Desde la siembra hasta la exportación. Cada actor de la cadena registra su parte, creando una historia completa y auditada del producto.
              </p>
            </div>
            
            <div className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100 hover:border-blue-200 transition-colors">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <LineChart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">NFT Score de Calidad</h3>
              <p className="text-neutral-600">
                Evaluamos cada lote y emitimos un NFT dinámico que representa su calidad, facilitando la negociación y mejorando los precios de venta.
              </p>
            </div>

            <div className="bg-neutral-50 p-8 rounded-3xl border border-neutral-100 hover:border-amber-200 transition-colors">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Evidencia Inmutable</h3>
              <p className="text-neutral-600">
                Documentos, certificaciones y datos de sensores son anclados en la red Stellar mediante Soroban, garantizando que nada ha sido alterado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / Stats */}
      <section id="how-it-works" className="py-24 bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Transparencia que da valor a tu trabajo</h2>
              <p className="text-emerald-100 text-lg mb-8 leading-relaxed">
                El mercado global exige saber de dónde vienen sus alimentos. Censo te da las herramientas para demostrar la calidad, la sostenibilidad y el origen de tus productos de forma criptográficamente segura.
              </p>
              
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="mt-1 bg-emerald-800 p-2 rounded-lg text-emerald-300">
                    <TreePine className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-xl mb-1">1. Registra tu Lote</strong>
                    <p className="text-emerald-200">Crea un gemelo digital de tu producción en nuestra plataforma.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-emerald-800 p-2 rounded-lg text-emerald-300">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-xl mb-1">2. Añade Evidencia</strong>
                    <p className="text-emerald-200">Sube fotos, documentos y resultados de laboratorio. Todo se encripta y se sube a blockchain.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 bg-emerald-800 p-2 rounded-lg text-emerald-300">
                    <Wheat className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-xl mb-1">3. Obtén tu NFT y Vende</strong>
                    <p className="text-emerald-200">Comparte el pasaporte digital con compradores para cerrar mejores tratos.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-emerald-800/50 border border-emerald-700 p-8 rounded-[2.5rem] backdrop-blur-sm">
              <div className="text-center mb-8">
                <p className="text-emerald-400 font-mono text-sm mb-2">NETWORK STATUS</p>
                <div className="inline-flex items-center gap-2 bg-emerald-950/50 px-4 py-2 rounded-full border border-emerald-800">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-semibold tracking-wider">STELLAR MAINNET</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-900/50 p-6 rounded-2xl text-center">
                  <div className="text-4xl font-black mb-2 text-white">+2.4k</div>
                  <div className="text-emerald-300 text-sm">Lotes Registrados</div>
                </div>
                <div className="bg-emerald-900/50 p-6 rounded-2xl text-center">
                  <div className="text-4xl font-black mb-2 text-white">100%</div>
                  <div className="text-emerald-300 text-sm">Datos Verificados</div>
                </div>
                <div className="bg-emerald-900/50 p-6 rounded-2xl text-center">
                  <div className="text-4xl font-black mb-2 text-white">+15</div>
                  <div className="text-emerald-300 text-sm">Cooperativas</div>
                </div>
                <div className="bg-emerald-900/50 p-6 rounded-2xl text-center">
                  <div className="text-4xl font-black mb-2 text-white">&lt; 3s</div>
                  <div className="text-emerald-300 text-sm">Tiempo de Anclaje</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 text-neutral-400 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-white rounded-lg p-1">
                <Image src="/logo.svg" alt="Censo Logo" width={24} height={24} className="w-full h-full" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Censo</span>
            </div>
            <p className="max-w-sm text-neutral-500">
              Capa de confianza agrícola impulsada por la red Stellar. Construyendo puentes seguros entre el campo y el mercado.
            </p>
          </div>
          <div>
            <strong className="text-white block mb-4">Producto</strong>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400">Características</a></li>
              <li><a href="#" className="hover:text-emerald-400">Casos de Uso</a></li>
              <li><a href="#" className="hover:text-emerald-400">Precios</a></li>
            </ul>
          </div>
          <div>
            <strong className="text-white block mb-4">Legal</strong>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-emerald-400">Términos de Servicio</a></li>
              <li><a href="#" className="hover:text-emerald-400">Privacidad</a></li>
              <li><a href="#" className="hover:text-emerald-400">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Censo. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <Badge variant="outline" className="bg-transparent border-neutral-700 text-neutral-300">
              Stellar Network
            </Badge>
          </div>
        </div>
      </footer>
    </main>
  );
}
