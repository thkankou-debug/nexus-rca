import Link from "next/link";
import {
  ArrowRight,
  FileText,
  HandshakeIcon,
  Search,
} from "lucide-react";

interface Step {
  num: string;
  icon: typeof Search;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    icon: FileText,
    eyebrow: "Saisine",
    title: "Décrivez votre projet",
    description:
      "Quelques minutes via le formulaire ou une conversation WhatsApp suffisent. Vous nous transmettez votre situation, vos objectifs et vos contraintes. Nous l'instruisons en interne — discrètement.",
    meta: "Sans inscription · Sans engagement",
  },
  {
    num: "02",
    icon: Search,
    eyebrow: "Faisabilité",
    title: "Recevez un avis documenté",
    description:
      "Sous 24 à 72 heures ouvrées, un conseiller Nexus vous remet un bilan écrit : voie recommandée, pièces, calendrier indicatif et devis fixe. Honnête, sans complaisance, par écrit.",
    meta: "Étude initiale gratuite",
  },
  {
    num: "03",
    icon: HandshakeIcon,
    eyebrow: "Mandat",
    title: "Engagez l'instruction",
    description:
      "Si vous validez, votre dossier est ouvert et instruit selon notre méthodologie. Un seul interlocuteur, un suivi documenté, jusqu'à la décision de l'autorité compétente.",
    meta: "Coordination depuis Bangui",
  },
];

export function NextSteps() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-[#0E1B47] to-[#1A1F4E] py-24 text-white sm:py-28 lg:py-32">
      {/* === Texture dot grid === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      {/* === Orbes diffuses === */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-indigo-500/15 blur-[140px]"
      />
      {/* === Hairlines === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        {/* === Header éditorial === */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-nexus-orange-300 backdrop-blur-md">
            <span className="h-1 w-1 rounded-full bg-nexus-orange-400" />
            Saisir Nexus
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            De l&apos;intention au mandat instruit,
            <br />
            <span className="bg-gradient-to-r from-white via-slate-200 to-nexus-orange-300 bg-clip-text text-transparent">
              en trois étapes lisibles.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Aucune des trois étapes ci-dessous n&apos;est facturée. Nexus ne
            perçoit aucun honoraire tant que vous n&apos;avez pas validé un
            devis écrit, signé et daté.
          </p>
        </div>

        {/* === Tracé SVG entre cards (desktop) === */}
        <div className="relative">
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            viewBox="0 0 1200 50"
            preserveAspectRatio="none"
            style={{ top: "3.25rem", height: "2px" }}
          >
            <defs>
              <linearGradient id="path-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,102,0,0)" />
                <stop offset="20%" stopColor="rgba(255,102,0,0.5)" />
                <stop offset="50%" stopColor="rgba(255,102,0,0.7)" />
                <stop offset="80%" stopColor="rgba(255,102,0,0.5)" />
                <stop offset="100%" stopColor="rgba(255,102,0,0)" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              y1="1"
              x2="1200"
              y2="1"
              stroke="url(#path-grad)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
          </svg>

          <div className="relative grid gap-5 lg:grid-cols-3 lg:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === STEPS.length - 1;
              return (
                <article
                  key={step.num}
                  className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-7 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:from-white/[0.10] hover:shadow-[0_30px_70px_-25px_rgba(255,102,0,0.4)] sm:p-8"
                >
                  {/* Numéro fantôme XXL */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-2 -top-2 select-none font-display text-[8rem] font-black leading-none tracking-tighter text-white/[0.04] transition-all duration-500 group-hover:text-nexus-orange-400/[0.10]"
                  >
                    {step.num}
                  </span>

                  {/* Glow corner hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover:bg-nexus-orange-500/35"
                  />

                  {/* Connector arrow desktop */}
                  {!isLast && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-3 top-12 hidden h-7 w-7 items-center justify-center rounded-full border border-nexus-orange-400/30 bg-nexus-blue-950 text-nexus-orange-400 shadow-[0_0_20px_rgba(255,102,0,0.4)] lg:flex"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}

                  <div className="relative">
                    {/* Icône */}
                    <div className="relative inline-flex">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                      />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Eyebrow + numéro */}
                    <div className="mt-6 flex items-center gap-3">
                      <span className="font-display text-xl font-bold tabular-nums text-nexus-orange-400">
                        {step.num}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300/70">
                        {step.eyebrow}
                      </span>
                    </div>

                    {/* Titre */}
                    <h3 className="mt-3 font-display text-xl font-bold leading-snug text-white sm:text-2xl">
                      {step.title}
                    </h3>

                    {/* Hairline */}
                    <div
                      aria-hidden
                      className="my-5 h-px w-12 bg-gradient-to-r from-nexus-orange-400/60 to-transparent"
                    />

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-slate-300/90">
                      {step.description}
                    </p>

                    {/* Meta */}
                    <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                      <span className="h-1 w-1 rounded-full bg-nexus-orange-400" />
                      {step.meta}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* === CTA principal === */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/demande/complet"
            className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 group-hover/cta:left-[120%] group-hover/cta:opacity-100"
            />
            <FileText className="h-4 w-4" />
            Soumettre mon dossier
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-0.5" />
          </Link>
        </div>

        {/* === Note discrète === */}
        <p className="mt-10 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
          Premier contact gratuit · Réponse écrite sous 72 heures ouvrées
        </p>
      </div>
    </section>
  );
}
