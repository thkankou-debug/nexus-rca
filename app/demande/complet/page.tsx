import { Suspense } from "react";
import {
  ArrowDown,
  Globe2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { DemandeFormComplete } from "@/components/DemandeFormComplete";
import { HeroDemandeVisual } from "@/components/demande/HeroDemandeVisual";

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
            {/* Layout 2 colonnes — contenu gauche / visuel cinématographique droite */}
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-16">
              {/* ─── Colonne gauche : contenu premium (lg:col-span-7) ─── */}
              <div className="lg:col-span-7">
                {/* 1. Badge institutionnel premium */}
                <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                  </span>
                  Espace de soumission · cabinet international
                </span>

                {/* 2. Titre — grande typo display */}
                <h1 className="mt-6 font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:mt-7 sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.75rem]">
                  Soumettre votre{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                      dossier
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                    />
                  </span>
                </h1>

                {/* 3. Texte institutionnel */}
                <p className="mt-7 max-w-xl text-base leading-relaxed text-slate-300 sm:mt-8 sm:text-lg lg:text-xl lg:leading-[1.65]">
                  Renseignez les informations nécessaires pour permettre à
                  notre équipe d&rsquo;analyser votre dossier et de vous
                  orienter vers le service adapté.
                </p>

                {/* 4. Indicateurs premium (3 stats institutionnels) */}
                <div className="mt-10 grid grid-cols-3 gap-3 sm:mt-12 sm:gap-4">
                  <HeroIndicator
                    icon={Globe2}
                    value="150+"
                    label="Pays couverts"
                  />
                  <HeroIndicator
                    icon={Sparkles}
                    value="24 h"
                    label="Délai de réponse"
                  />
                  <HeroIndicator
                    icon={ShieldCheck}
                    value="100%"
                    label="Confidentiel"
                  />
                </div>

                {/* 5. CTAs */}
                <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <a
                    href="#dossier-form"
                    className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                    />
                    Démarrer ma demande
                    <ArrowDown className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-y-0.5" />
                  </a>
                  <span className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65 backdrop-blur-md">
                    <Lock className="h-3 w-3 text-nexus-orange-300" />
                    Espace sécurisé · Traitement confidentiel
                  </span>
                </div>
              </div>

              {/* ─── Colonne droite : visuel cinématographique (lg:col-span-5) ─── */}
              <div className="relative lg:col-span-5">
                <HeroDemandeVisual />
              </div>
            </div>
          </div>
        </section>

        {/* Formulaire — section séparée avec son propre rythme */}
        <section
          id="dossier-form"
          className="relative overflow-hidden bg-gradient-to-b from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-8 pb-16 text-white sm:pb-20 lg:pt-12 lg:pb-24"
        >
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

// ─── Indicateur premium hero ──────────────────────────────────────────────
function HeroIndicator({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Globe2;
  value: string;
  label: string;
}) {
  return (
    <article className="group/ind relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 ring-1 ring-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.07] sm:px-4 sm:py-4">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover/ind:bg-nexus-orange-500/15"
      />
      <div className="relative">
        <Icon className="h-3.5 w-3.5 text-nexus-orange-300" />
        <p className="mt-2 font-display text-xl font-bold leading-none text-white sm:text-2xl">
          <span className="bg-gradient-to-r from-nexus-orange-300 to-nexus-orange-500 bg-clip-text text-transparent">
            {value}
          </span>
        </p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-[10px]">
          {label}
        </p>
      </div>
    </article>
  );
}
