import {
  Briefcase,
  Code,
  GraduationCap,
  HandCoins,
  MapPin,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// ─── IdentityStatement — section éditoriale identitaire homepage ──────────
// Remplace ProblemsSolved (4 cards "Ce que Nexus RCA résout").
// Texte court, puissant, institutionnel.
// Style cabinet international × plateforme premium.
// ────────────────────────────────────────────────────────────────────────────

const PILIERS_CHIPS: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: "Mobilité" },
  { icon: GraduationCap, label: "Études" },
  { icon: HandCoins, label: "Financement" },
  { icon: Briefcase, label: "Business" },
  { icon: Code, label: "Digital" },
];

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export function IdentityStatement() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28">
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={DOT_GRID_DARK}
      />
      {/* Glow central pour donner profondeur sans surcharger */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/12 blur-[160px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-nexus-blue-500/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-1/3 h-72 w-72 rounded-full bg-nexus-blue-500/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
        {/* Eyebrow */}
        <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
          <Sparkles className="h-3 w-3" />
          Identité
        </span>

        {/* H2 court, fort */}
        <h2 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Le{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
              pont stratégique
            </span>
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
            />
          </span>{" "}
          entre l&rsquo;Afrique et l&rsquo;international.
        </h2>

        {/* Paragraphe institutionnel — court, dense */}
        <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Plateforme internationale moderne, ancrée à Bangui. Nexus RCA
          structure les projets de mobilité, d&rsquo;études, de financement,
          d&rsquo;accompagnement business et de digitalisation. Un standard
          de cabinet international au service des talents centrafricains et
          des structures qui veulent grandir.
        </p>

        {/* 5 chips piliers — discrètes */}
        <ul className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2 sm:gap-3">
          {PILIERS_CHIPS.map((p) => {
            const Icon = p.icon;
            return (
              <li
                key={p.label}
                className="group/chip inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur-md transition-all duration-200 hover:border-nexus-orange-400/40 hover:bg-white/[0.07] hover:text-white"
              >
                <Icon className="h-3 w-3 text-nexus-orange-300 transition-transform duration-300 group-hover/chip:scale-110" />
                {p.label}
              </li>
            );
          })}
        </ul>

        {/* Trust line bas */}
        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 backdrop-blur-md">
          <MapPin className="h-3 w-3 text-nexus-orange-300" />
          Bangui · Europe · Canada
        </div>
      </div>
    </section>
  );
}
