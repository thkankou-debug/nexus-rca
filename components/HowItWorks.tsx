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
    desc: "Nous écoutons l'intention, qualifions sa viabilité et identifions sans détour les leviers et les risques du projet — qu'il porte sur une mobilité, un financement, une formation ou une opération internationale.",
  },
  {
    num: "02",
    icon: FileCheck,
    eyebrow: "Phase 02",
    title: "Bilan de faisabilité écrit",
    desc: "Sous 24 à 72 heures ouvrées, un conseiller produit un avis documenté : voie recommandée, ressources requises, calendrier indicatif et devis fixé à l'avance — quel que soit le service mobilisé.",
  },
  {
    num: "03",
    icon: Rocket,
    eyebrow: "Phase 03",
    title: "Constitution et exécution",
    desc: "Le mandat est monté aux standards internationaux propres à son domaine. Pièces vérifiées, démarches coordonnées, partenaires officiels engagés. Chaque action est tracée et communiquée.",
  },
  {
    num: "04",
    icon: CheckCircle2,
    eyebrow: "Phase 04",
    title: "Aboutissement et clôture",
    desc: "Nous portons le résultat jusqu'à vous, accompagnons les itérations éventuelles et archivons le dossier sous protocole sécurisé. Le mandat ne se ferme qu'avec votre quitus.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="methode"
      className="relative scroll-mt-24 overflow-hidden bg-[#070C1A] py-24 sm:py-28 lg:py-32"
    >
      {/* === Mesh diagonal très subtil (pas de grain qui salit les textes) === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 35%, transparent 65%, rgba(56,80,160,0.07) 100%)",
        }}
      />
      {/* === Orbes ambiantes lumineuses === */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-brand/12 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[#1f3a8a]/20 blur-[120px]"
      />
      {/* === Hairline top === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        {/* === Header éditorial === */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-brand">
            <span className="h-1 w-1 rounded-full bg-brand" />
            Méthodologie
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            Quatre phases.
            <br />
            <span className="text-brand">Une trajectoire instruite.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
            Nexus n&apos;improvise pas un mandat. Mobilité internationale,
            financement, parcours académique, opération transfrontalière ou
            démarche administrative : chaque mission obéit au même protocole —
            structuré, exigeant, traçable.
          </p>
        </div>

        {/* === Cards solides denses === */}
        <div className="relative">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {PHASES.map((phase) => {
              const Icon = phase.icon;
              return (
                <article
                  key={phase.num}
                  className="group relative overflow-hidden rounded-3xl border border-white/15 bg-[#101A38] p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] transition-all duration-500 hover:-translate-y-1 hover:border-brand/50 hover:bg-[#142146] hover:shadow-[0_40px_70px_-20px_rgba(212,175,55,0.35)] sm:p-7"
                >
                  {/* Numéro fantôme XXL */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-3 -top-3 select-none font-display text-[7rem] font-black leading-none tracking-tighter text-white/[0.07] transition-all duration-500 group-hover:text-brand/[0.18]"
                  >
                    {phase.num}
                  </span>

                  {/* Glow corner hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand/0 blur-3xl transition-all duration-700 group-hover:bg-brand/25"
                  />

                  <div className="relative">
                    {/* Icône premium */}
                    <div className="relative inline-flex">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-brand/40 blur-md opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                      />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-hover text-on-brand shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)] ring-1 ring-white/15">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Numéro orange XL */}
                    <p className="mt-6 font-display text-4xl font-black tabular-nums leading-none text-brand">
                      {phase.num}
                    </p>

                    {/* Eyebrow */}
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-brand">
                      {phase.eyebrow}
                    </p>

                    {/* Titre — text-white pur pour lisibilité MAX */}
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug text-white sm:text-xl">
                      {phase.title}
                    </h3>

                    {/* Hairline */}
                    <div
                      aria-hidden
                      className="my-4 h-px w-12 bg-gradient-to-r from-brand to-transparent"
                    />

                    {/* Description — slate-200 (plus contrasté que slate-300) */}
                    <p className="text-sm leading-relaxed text-slate-200">
                      {phase.desc}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* === Note de bas === */}
        <p className="mt-14 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
          Ce protocole s&apos;applique à chaque dossier — sans exception, sans dérogation.
        </p>
      </div>
    </section>
  );
}
