import Link from "next/link";
import {
  ArrowRight,
  FileText,
  HandshakeIcon,
  MessageCircle,
  Search,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

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
      "Quelques minutes via le formulaire ou une conversation WhatsApp suffisent. Vous nous transmettez votre situation et vos objectifs. Nous l'instruisons en interne, discrètement.",
    meta: "Sans inscription · Sans engagement",
  },
  {
    num: "02",
    icon: Search,
    eyebrow: "Faisabilité",
    title: "Recevez un avis documenté",
    description:
      "Sous 24 à 72 heures ouvrées, un conseiller Nexus vous remet un bilan écrit : voie recommandée, pièces, calendrier indicatif et devis fixe. Honnête, sans complaisance.",
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
    <section className="relative overflow-hidden bg-nexus-blue-950 py-20 sm:py-24 lg:py-28">
      {/* === Orbes ambiantes === */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/15 blur-[140px]"
      />
      {/* === Hairlines === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        {/* === Header éditorial === */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300">
            <span className="h-1 w-1 rounded-full bg-nexus-orange-400" />
            Saisir Nexus
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            De l&apos;intention au mandat instruit,
            <br />
            <span className="text-nexus-orange-400">en trois étapes lisibles.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Aucune des trois étapes ci-dessous n&apos;est facturée. Nexus ne
            perçoit aucun honoraire tant que vous n&apos;avez pas validé un
            devis écrit, signé et daté.
          </p>
        </div>

        {/* === 3 cards solides === */}
        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === STEPS.length - 1;
            return (
              <article
                key={step.num}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0F1B40] p-6 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-1 hover:border-nexus-orange-500/50 hover:shadow-[0_30px_60px_-25px_rgba(255,102,0,0.4)] sm:p-7"
              >
                {/* Glow corner hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover:bg-nexus-orange-500/35"
                />

                {/* Connector arrow desktop */}
                {!isLast && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-3 top-12 hidden h-7 w-7 items-center justify-center rounded-full border border-nexus-orange-500/40 bg-nexus-blue-950 text-nexus-orange-400 shadow-[0_0_20px_rgba(255,102,0,0.4)] lg:flex"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}

                <div className="relative">
                  {/* Numéro orange XL + icône */}
                  <div className="flex items-center justify-between">
                    <span className="font-display text-5xl font-black tabular-nums leading-none text-nexus-orange-500">
                      {step.num}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-nexus-orange-500/10 ring-1 ring-nexus-orange-500/30 backdrop-blur-md transition-transform duration-500 group-hover:scale-105">
                      <Icon className="h-5 w-5 text-nexus-orange-300" />
                    </div>
                  </div>

                  {/* Hairline */}
                  <div
                    aria-hidden
                    className="my-5 h-px w-full bg-gradient-to-r from-nexus-orange-500/40 via-white/10 to-transparent"
                  />

                  {/* Eyebrow */}
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300/80">
                    {step.eyebrow}
                  </p>

                  {/* Titre */}
                  <h3 className="mt-2 font-display text-xl font-bold leading-snug text-white sm:text-2xl">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {step.description}
                  </p>

                  {/* Meta */}
                  <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                    <span className="h-1 w-1 rounded-full bg-nexus-orange-400" />
                    {step.meta}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* === CTA double premium === */}
        <div className="mt-14 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
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
          <a
            href={whatsappLink(
              "Bonjour Nexus, je souhaite échanger sur un projet avant de soumettre une demande."
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-emerald-500/10"
          >
            <MessageCircle className="h-4 w-4 text-emerald-300" />
            Échanger sur WhatsApp
          </a>
        </div>

        {/* === Note discrète === */}
        <p className="mt-8 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
          Premier contact gratuit · Réponse écrite sous 72 heures ouvrées
        </p>
      </div>
    </section>
  );
}
