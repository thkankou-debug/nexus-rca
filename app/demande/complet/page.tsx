import { Suspense } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { DemandeFormComplete } from "@/components/DemandeFormComplete";

export const metadata = {
  title: "Soumettre votre dossier | Nexus RCA",
  description:
    "Espace de soumission de dossier — visa, études, business, voyages. Traitement confidentiel par notre équipe.",
};

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export default function DemandeCompletePage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-24 pb-20 text-white sm:pt-28 lg:pt-32 lg:pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.45]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/10 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/30 to-transparent"
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            {/* Hero institutionnel sobre */}
            <div className="mx-auto max-w-3xl">
              <h1 className="font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
                Soumettre votre dossier
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Veuillez renseigner les informations nécessaires afin de
                permettre à notre équipe d&rsquo;analyser votre dossier et de
                vous orienter vers le service adapté.
              </p>

              {/* Badge confidentialité discret */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65 backdrop-blur-md">
                <Lock className="h-3 w-3 text-nexus-orange-300" />
                Espace sécurisé
                <span className="text-white/30">·</span>
                <ShieldCheck className="h-3 w-3 text-nexus-orange-300" />
                Traitement confidentiel
              </div>
            </div>

            {/* Formulaire (avec sidebar interne) */}
            <div className="mt-12 lg:mt-14">
              <Suspense
                fallback={
                  <div className="flex h-96 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                    <p className="text-sm text-slate-300">
                      Chargement du formulaire…
                    </p>
                  </div>
                }
              >
                <DemandeFormComplete />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
