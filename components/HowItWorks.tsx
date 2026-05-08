import { CheckCircle2, FileCheck, MessageSquare, Rocket } from "lucide-react";

interface Phase {
  num: string;
  icon: typeof MessageSquare;
  eyebrow: string;
  title: string;
  desc: string;
}

const PHASES: Phase[] = [
  {
    num: "01",
    icon: MessageSquare,
    eyebrow: "Phase 01",
    title: "Saisine et qualification",
    desc: "Nous écoutons l'intention, qualifions sa recevabilité juridique et identifions sans détour les risques structurels du dossier.",
  },
  {
    num: "02",
    icon: FileCheck,
    eyebrow: "Phase 02",
    title: "Bilan de faisabilité écrit",
    desc: "Sous 24 à 72 heures ouvrées, un conseiller produit un avis documenté : voie recommandée, pièces, calendrier et devis fixé à l'avance.",
  },
  {
    num: "03",
    icon: Rocket,
    eyebrow: "Phase 03",
    title: "Constitution et instruction",
    desc: "Le dossier est monté aux standards consulaires en vigueur. Pièces traduites, légalisées, ordonnées, soumises à l'autorité compétente.",
  },
  {
    num: "04",
    icon: CheckCircle2,
    eyebrow: "Phase 04",
    title: "Décision et clôture",
    desc: "Nous portons la décision finale jusqu'à vous, accompagnons les recours éventuels et conservons l'archive sous protocole sécurisé.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-nexus-blue-950 py-20 sm:py-24 lg:py-28">
      {/* === Orbes ambiantes (lumière, pas de grain) === */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/15 blur-[120px]"
      />
      {/* === Hairline top === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        {/* === Header éditorial === */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300">
            <span className="h-1 w-1 rounded-full bg-nexus-orange-400" />
            Méthodologie
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            Quatre phases.
            <br />
            <span className="text-nexus-orange-400">Une trajectoire instruite.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Nexus n&apos;improvise pas un dossier. Chaque mission s&apos;inscrit
            dans un protocole structuré, hérité de l&apos;expérience consulaire
            et adapté aux exigences institutionnelles internationales.
          </p>
        </div>

        {/* === Cards solides === */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {PHASES.map((phase) => {
            const Icon = phase.icon;
            return (
              <article
                key={phase.num}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0F1B40] p-6 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)] transition-all duration-500 hover:-translate-y-1 hover:border-nexus-orange-500/50 hover:shadow-[0_30px_60px_-25px_rgba(255,102,0,0.4)]"
              >
                {/* Glow corner hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover:bg-nexus-orange-500/30"
                />

                <div className="relative">
                  {/* Numéro orange XL + icône */}
                  <div className="flex items-center justify-between">
                    <span className="font-display text-5xl font-black tabular-nums leading-none text-nexus-orange-500">
                      {phase.num}
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
                    {phase.eyebrow}
                  </p>

                  {/* Titre */}
                  <h3 className="mt-2 font-display text-lg font-bold leading-snug text-white sm:text-xl">
                    {phase.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">
                    {phase.desc}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* === Note de bas === */}
        <p className="mt-12 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
          Ce protocole s&apos;applique à chaque dossier — sans exception, sans dérogation.
        </p>
      </div>
    </section>
  );
}
