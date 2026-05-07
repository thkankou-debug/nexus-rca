import Link from "next/link";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { ArrowLeft, Lock, ShieldCheck, Sparkles } from "lucide-react";

// Wizard lazy-loaded — composant client lourd avec validation + Supabase
const AssuranceQuoteWizard = dynamic(() =>
  import("@/components/services/AssuranceQuoteWizard").then(
    (m) => m.AssuranceQuoteWizard
  )
);

export const metadata = {
  title: "Devis assurance personnalisé | Nexus RCA — courtage premium",
  description:
    "Soumettez votre dossier de courtage assurance Nexus RCA — voyage, Schengen, santé internationale, études et business. Référence dédiée, suivi du dossier, accompagnement complet par notre cabinet.",
};

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export default function AssuranceDevisPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ─── HERO compact + wizard plein écran ─────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-24 pb-20 text-white sm:pt-28 lg:pt-32 lg:pb-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            {/* Breadcrumb retour */}
            <Link
              href="/services/assurance"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 backdrop-blur-md transition-all duration-200 hover:border-white/25 hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              Retour à la page Assurance
            </Link>

            {/* Header */}
            <div className="mt-8 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Cabinet de courtage · Devis personnalisé
              </span>

              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                Construisons votre{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    couverture sur mesure
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Quatre étapes guidées. Une référence dédiée. Un cabinet
                derrière chaque dossier. Vous recevez un email de confirmation
                immédiat avec le suivi de votre dossier.
              </p>

              {/* Trust line */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-white/55">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-nexus-orange-300" />
                  Données confidentielles
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-nexus-orange-300" />
                  Conforme code visas UE
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-nexus-orange-300" />
                  Accompagnement cabinet
                </span>
              </div>
            </div>

            {/* Wizard plein écran */}
            <div className="mt-14">
              <AssuranceQuoteWizard />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
