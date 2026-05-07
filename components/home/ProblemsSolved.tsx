import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe2,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

// ─── ProblemsSolved Premium tech ───────────────────────────────────────────
// Section homepage : 4 cards probleme/reponse sur fond navy.
// Desktop : grid 2x2.
// Mobile : scroll-snap horizontal premium (1.15 card visible, swipe natif),
//          dots indicator, zero JS.
// ──────────────────────────────────────────────────────────────────────────

interface ProblemSolution {
  problem: { icon: LucideIcon; label: string };
  solution: { icon: LucideIcon; label: string };
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

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export function ProblemsSolved() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 sm:py-24 lg:py-32">
      {/* Dot grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={DOT_GRID_DARK}
      />
      {/* Blobs glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 bottom-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/15 blur-[120px]"
      />
      {/* Bordures eclairees */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/30 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative">
        {/* Header */}
        <div className="mx-auto mb-12 max-w-2xl px-4 text-center sm:mb-14 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
            </span>
            Situations fréquentes
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ce que Nexus RCA{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                résout
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
              />
            </span>
            .
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Quatre situations que nous rencontrons régulièrement — et la
            réponse méthodique que nous apportons à chacune.
          </p>
        </div>

        {/* DESKTOP : grid 2x2 */}
        <div className="mx-auto hidden max-w-6xl gap-5 px-4 sm:grid sm:grid-cols-2 lg:gap-6 lg:px-8">
          {ITEMS.map((item, i) => (
            <ProblemCard key={i} item={item} />
          ))}
        </div>

        {/* MOBILE : scroll-snap horizontal */}
        <div className="sm:hidden">
          <div
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4"
            style={{ scrollSnapStop: "always" }}
          >
            {ITEMS.map((item, i) => (
              <div
                key={i}
                className="w-[85vw] shrink-0 snap-center"
              >
                <ProblemCard item={item} />
              </div>
            ))}
          </div>

          {/* Dots indicator (visuel, non cliquable) */}
          <div className="mt-2 flex items-center justify-center gap-1.5">
            {ITEMS.map((_, i) => (
              <span
                key={i}
                aria-hidden
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === 0
                    ? "w-6 bg-nexus-orange-500"
                    : "w-1.5 bg-white/20"
                }`}
              />
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] text-white/40">
            Faites glisser pour explorer
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Sous-composant card glass premium ─────────────────────────────────────
function ProblemCard({ item }: { item: ProblemSolution }) {
  const PIcon = item.problem.icon;
  const SIcon = item.solution.icon;
  return (
    <article className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04),_0_20px_40px_-20px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/30 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),_0_24px_48px_-16px_rgba(255,102,0,0.18)] sm:p-7">
      {/* Glow blob orange (apparait au hover) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/18"
      />

      <div className="relative flex h-full flex-col">
        {/* PROBLEME */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/20">
            <PIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-300">
              Problème
            </p>
            <p className="mt-1 font-display text-base font-semibold leading-snug text-white sm:text-lg">
              {item.problem.label}
            </p>
          </div>
        </div>

        {/* Connector vertical */}
        <div className="my-5 ml-[22px] flex flex-col items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-nexus-orange-400/60" />
          <span className="h-6 w-px bg-gradient-to-b from-nexus-orange-400/40 via-nexus-orange-400/20 to-transparent" />
          <span className="h-1.5 w-1.5 rounded-full bg-nexus-orange-400/40" />
        </div>

        {/* REPONSE NEXUS */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-nexus-orange-500/15 text-nexus-orange-300 ring-1 ring-nexus-orange-400/30">
            <SIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
              Réponse Nexus
            </p>
            <p className="mt-1 font-display text-base font-semibold leading-snug text-white sm:text-lg">
              {item.solution.label}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="mt-4 text-sm leading-relaxed text-slate-200">
          {item.description}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-end border-t border-white/10 pt-4">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-nexus-orange-400 transition-all duration-200 group-hover:gap-2">
            Lire la méthode
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
