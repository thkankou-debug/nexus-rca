import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  HandshakeIcon,
  MessageCircle,
  Search,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

// ─── NextSteps ─────────────────────────────────────────────────────────────
// Section homepage : "Quoi faire ensuite" — parcours en 3 étapes claires.
// Conclusion forte avant le FinalCTA. Sobre, sans répétition.
// ──────────────────────────────────────────────────────────────────────────

interface Step {
  num: string;
  icon: typeof Search;
  title: string;
  description: string;
  meta?: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    icon: FileText,
    title: "Soumettez votre demande",
    description:
      "Quelques minutes via le formulaire en ligne ou un message WhatsApp. Vous décrivez votre projet — nous analysons.",
    meta: "Sans inscription · Sans engagement",
  },
  {
    num: "02",
    icon: Search,
    title: "Recevez un bilan de faisabilité écrit",
    description:
      "Sous 24 à 72 heures ouvrées, un conseiller Nexus vous transmet un bilan honnête : procédure adaptée, pièces requises, délai indicatif et devis fixe.",
    meta: "Étude initiale gratuite",
  },
  {
    num: "03",
    icon: HandshakeIcon,
    title: "Démarrez l'accompagnement structuré",
    description:
      "Si vous validez, votre dossier est constitué selon notre méthodologie. Un seul interlocuteur, un suivi documenté, jusqu'à la décision finale.",
    meta: "Coordination depuis Bangui",
  },
];

export function NextSteps() {
  return (
    <section className="relative bg-surface-sunken py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
            Démarrer
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-nexus-blue-950 sm:text-4xl">
            Quoi faire ensuite
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            Trois étapes simples pour passer de l'intention au dossier réellement
            instruit. Aucune des trois n'est facturée tant que vous n'avez pas
            validé un devis.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-5 lg:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === STEPS.length - 1;
            return (
              <article
                key={step.num}
                className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-colors hover:border-nexus-orange-200/70 sm:p-8"
              >
                {/* Connector flèche entre cards (desktop only) */}
                {!isLast && (
                  <div
                    aria-hidden
                    className="absolute -right-4 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-300 shadow-sm lg:flex"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}

                {/* Numéro + icône */}
                <div className="flex items-center gap-4">
                  <span className="font-display text-3xl font-bold text-slate-200 tabular-nums">
                    {step.num}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="mt-6 font-display text-lg font-bold leading-snug text-nexus-blue-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>

                {step.meta && (
                  <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                    <ClipboardList className="h-3 w-3" />
                    {step.meta}
                  </p>
                )}
              </article>
            );
          })}
        </div>

        {/* CTA double sobre */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/demande/complet"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nexus-orange-600"
          >
            Démarrer ma demande
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={whatsappLink(
              "Bonjour Nexus, je souhaite échanger sur un projet avant de soumettre une demande."
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-nexus-blue-950 shadow-sm transition-colors hover:border-nexus-orange-300/70 hover:bg-slate-50/60"
          >
            <MessageCircle className="h-4 w-4 text-nexus-orange-600" />
            Discuter sur WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
