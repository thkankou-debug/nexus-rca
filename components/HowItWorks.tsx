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
    desc: "Nous écoutons l'intention, qualifions sa recevabilité juridique et identifions sans détour les risques structurels du dossier. Aucune mission n'est ouverte sans cette lecture initiale.",
  },
  {
    num: "02",
    icon: FileCheck,
    eyebrow: "Phase 02",
    title: "Bilan de faisabilité écrit",
    desc: "Sous 24 à 72 heures ouvrées, un conseiller produit un avis documenté : voie recommandée, pièces requises, calendrier indicatif et devis fixé à l'avance — honnêtement, sans complaisance.",
  },
  {
    num: "03",
    icon: Rocket,
    eyebrow: "Phase 03",
    title: "Constitution et instruction",
    desc: "Le dossier est monté aux standards consulaires en vigueur. Pièces traduites, légalisées, ordonnées, puis soumises auprès de l'autorité compétente. Chaque action est tracée.",
  },
  {
    num: "04",
    icon: CheckCircle2,
    eyebrow: "Phase 04",
    title: "Décision et clôture",
    desc: "Nous portons la décision finale jusqu'à vous, accompagnons les recours éventuels et conservons l'archive sous protocole sécurisé. Le mandat ne se ferme qu'avec votre quitus.",
  },
];

const NOISE_PATTERN: React.CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
};

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#070C1A] py-24 sm:py-28 lg:py-32">
      {/* === Texture grain === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={NOISE_PATTERN}
      />
      {/* === Diagonal mesh === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,102,0,0.06) 0%, transparent 35%, transparent 65%, rgba(56,80,160,0.08) 100%)",
        }}
      />
      {/* === Orbes ambiantes === */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[#1f3a8a]/15 blur-[120px]"
      />
      {/* === Hairline top === */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        {/* === Header éditorial === */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300 backdrop-blur-md">
            <span className="h-1 w-1 rounded-full bg-nexus-orange-400" />
            Méthodologie
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl">
            Quatre phases.
            <br />
            <span className="bg-gradient-to-r from-white via-slate-200 to-nexus-orange-300 bg-clip-text text-transparent">
              Une trajectoire instruite.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Nexus n&apos;improvise pas un dossier. Chaque mission s&apos;inscrit
            dans un protocole structuré, hérité de l&apos;expérience consulaire
            et adapté aux exigences institutionnelles internationales.
          </p>
        </div>

        {/* === Timeline cards === */}
        <div className="relative">
          {/* Timeline vertical mark */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-nexus-orange-500/30 to-transparent lg:block"
          />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {PHASES.map((phase, i) => {
              const Icon = phase.icon;
              return (
                <article
                  key={phase.num}
                  className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent p-6 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-nexus-orange-400/30 hover:from-white/[0.10] hover:shadow-[0_30px_60px_-25px_rgba(255,102,0,0.35)] sm:p-7"
                >
                  {/* Numéro fantôme XXL */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-4 -top-4 select-none font-display text-[7rem] font-black leading-none tracking-tighter text-white/[0.04] transition-all duration-500 group-hover:text-nexus-orange-400/[0.12]"
                  >
                    {phase.num}
                  </span>

                  {/* Glow corner hover */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover:bg-nexus-orange-500/30"
                  />

                  <div className="relative">
                    {/* Icône premium */}
                    <div className="relative inline-flex">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                      />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Eyebrow + titre */}
                    <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.24em] text-nexus-orange-300/80">
                      {phase.eyebrow}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug text-white sm:text-xl">
                      {phase.title}
                    </h3>

                    {/* Hairline */}
                    <div
                      aria-hidden
                      className="my-4 h-px w-10 bg-gradient-to-r from-nexus-orange-400/60 to-transparent"
                    />

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-slate-300/90">
                      {phase.desc}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* === Note de bas === */}
        <p className="mt-14 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
          Ce protocole s&apos;applique à chaque dossier — sans exception, sans dérogation.
        </p>
      </div>
    </section>
  );
}
