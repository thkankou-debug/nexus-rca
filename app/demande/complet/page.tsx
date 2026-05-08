import { Suspense } from "react";
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { DemandeFormComplete } from "@/components/DemandeFormComplete";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Demande de service complète | Nexus RCA",
  description:
    "Formulaire de traitement de dossier complet : visa, études, business, voyages. Joignez vos documents et obtenez un accompagnement personnalisé.",
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
        {/* Section principale — navy unifié + form + sidebar */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-24 pb-20 text-white sm:pt-28 lg:pt-32 lg:pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/12 blur-[140px]"
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
            {/* ─── Hero compact ─── */}
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <ShieldCheck className="h-3 w-3" />
                Formulaire complet · traitement de dossier
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Faites traiter votre{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    dossier
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Renseignez votre dossier, joignez vos pièces justificatives, et
                un conseiller Nexus RCA prend le relais. Trois étapes guidées —
                aucun jargon, aucun champ inutile.
              </p>

              {/* Trust pills */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-nexus-orange-300" />
                  Réponse sous 24 h
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3 text-nexus-orange-300" />
                  Documents protégés
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-nexus-orange-300" />
                  Conseiller dédié
                </span>
              </div>
            </div>

            {/* ─── Formulaire (avec sidebar interne) ─── */}
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

            {/* ─── Alternative WhatsApp (discrète) ─── */}
            <div className="mx-auto mt-10 max-w-2xl">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center backdrop-blur-md">
                <p className="text-sm text-slate-300">
                  Vous préférez d&rsquo;abord parler à quelqu&rsquo;un ?
                </p>
                <Link
                  href={whatsappLink(
                    "Bonjour Nexus RCA, j'aimerais échanger avant de remplir un formulaire."
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-nexus-orange-300 transition-colors hover:text-nexus-orange-200"
                >
                  <MessageCircle className="h-4 w-4" />
                  Discuter d&rsquo;abord sur WhatsApp
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
