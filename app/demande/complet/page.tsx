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
        {/* HERO institutionnel — espace vertical généreux + responsive contrôlé */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-28 pb-16 text-white sm:pt-36 sm:pb-20 md:pt-40 lg:pt-48 lg:pb-24 xl:pt-56 xl:pb-28">
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

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Hero contenu — hiérarchie aérée */}
            <div className="mx-auto max-w-3xl">
              {/* 1. Eyebrow / pré-titre */}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/55 backdrop-blur-md">
                Espace de soumission
              </span>

              {/* 2. Titre principal — espace généreux au-dessus */}
              <h1 className="mt-6 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:mt-7 sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.05] xl:text-[3.75rem]">
                Soumettre votre dossier
              </h1>

              {/* 3. Sous-titre — espace généreux entre titre et sous-titre */}
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-slate-300 sm:mt-8 sm:text-lg lg:text-xl lg:leading-[1.65]">
                Veuillez renseigner les informations nécessaires afin de
                permettre à notre équipe d&rsquo;analyser votre dossier et de
                vous orienter vers le service adapté.
              </p>

              {/* 4. Badge confidentialité — espace généreux + meta-info */}
              <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-12">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65 backdrop-blur-md">
                  <Lock className="h-3 w-3 text-nexus-orange-300" />
                  Espace sécurisé
                  <span className="mx-0.5 text-white/30">·</span>
                  <ShieldCheck className="h-3 w-3 text-nexus-orange-300" />
                  Traitement confidentiel
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Formulaire — section séparée avec son propre rythme */}
        <section className="relative overflow-hidden bg-gradient-to-b from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pb-16 text-white sm:pb-20 lg:pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={DOT_GRID_DARK}
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Suspense
              fallback={
                <div className="flex h-96 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                  <p className="text-sm text-slate-300">
                    Chargement du formulaire…
                  </p>
                </div>
              }
            >
              <DemandeFormComplete />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
