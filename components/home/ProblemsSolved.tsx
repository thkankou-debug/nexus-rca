import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe2,
  ShieldCheck,
  Wallet,
} from "lucide-react";

// ─── ProblemsSolved ────────────────────────────────────────────────────────
// Section homepage : 4 problèmes typiques auxquels Nexus RCA répond.
// Approche pain-point puis solution structurée. Aucun chiffre gratuit.
// ──────────────────────────────────────────────────────────────────────────

interface ProblemSolution {
  problem: {
    icon: typeof AlertCircle;
    label: string;
  };
  solution: {
    icon: typeof CheckCircle2;
    label: string;
  };
  description: string;
}

const ITEMS: ProblemSolution[] = [
  {
    problem: {
      icon: FileText,
      label: "Dossiers visa refusés pour des raisons évitables",
    },
    solution: {
      icon: ShieldCheck,
      label: "Constitution conforme aux exigences consulaires",
    },
    description:
      "Chaque dossier est cadré selon le référentiel exact du poste consulaire ciblé. Pièces, lettre de motivation, justificatifs : tout est revu avant dépôt pour limiter les motifs de refus évitables.",
  },
  {
    problem: {
      icon: Globe2,
      label: "Voyages préparés sans coordination locale",
    },
    solution: {
      icon: ShieldCheck,
      label: "Coordination internationale pilotée depuis Bangui",
    },
    description:
      "Réservation vol, hôtel vérifié, transferts aéroport, dossier de voyage complet remis avant le départ. Un interlocuteur unique pour l'ensemble du déplacement.",
  },
  {
    problem: {
      icon: AlertCircle,
      label: "Procédures consulaires peu lisibles depuis la RCA",
    },
    solution: {
      icon: CheckCircle2,
      label: "Méthodologie écrite et bilan de faisabilité",
    },
    description:
      "Avant tout engagement, un bilan écrit indique la procédure adaptée à votre situation, le délai indicatif et les pièces requises. Pas de zone grise.",
  },
  {
    problem: {
      icon: Wallet,
      label: "Transferts d'argent internationaux opaques ou risqués",
    },
    solution: {
      icon: ShieldCheck,
      label: "Canaux officiels avec traçabilité complète",
    },
    description:
      "Transferts uniquement par circuits régulés, avec confirmation d'envoi, preuve de réception et frais annoncés à l'avance. Aucune transaction informelle.",
  },
];

export function ProblemsSolved() {
  return (
    <section className="relative bg-surface-sunken py-24 sm:py-28 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-600">
            Situations fréquentes
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-nexus-blue-950 sm:text-4xl">
            Ce que Nexus RCA résout
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
            Quatre situations que nous rencontrons régulièrement — et la
            réponse méthodique que nous apportons à chacune.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {ITEMS.map((item, i) => {
            const PIcon = item.problem.icon;
            const SIcon = item.solution.icon;
            return (
              <article
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-colors hover:border-nexus-orange-200/70 sm:p-8"
              >
                {/* Problem */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <PIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-600">
                      Problème
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold leading-snug text-nexus-blue-950">
                      {item.problem.label}
                    </p>
                  </div>
                </div>

                {/* Arrow connector */}
                <div className="my-5 flex items-center gap-3 pl-12">
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                {/* Solution */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-nexus-orange-50 text-nexus-orange-600">
                    <SIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-nexus-orange-600">
                      Réponse Nexus
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold leading-snug text-nexus-blue-950">
                      {item.solution.label}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
