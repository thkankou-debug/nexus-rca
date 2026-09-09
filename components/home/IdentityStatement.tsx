import {
  Briefcase,
  Code,
  GraduationCap,
  HandCoins,
  MapPin,
  Network,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// ─── IdentityStatement — section éditoriale identitaire homepage ──────────
// Layout asymétrique 2 cols : texte gauche fort + carte signature droite.
// Background premium multi-couches (dot grid + 3 blobs + lignes lumineuses).
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

// Mini carte stylisée — Bangui (hub) + Europe + Canada
const HUB = { x: 250, y: 215 };
const EUROPE = { x: 235, y: 130, label: "Europe", region: "Paris" };
const CANADA = { x: 100, y: 135, label: "Canada", region: "Montréal" };

function bezier(toX: number, toY: number, offsetY: number): string {
  const cx = (HUB.x + toX) / 2;
  const cy = (HUB.y + toY) / 2 + offsetY;
  return `M ${HUB.x} ${HUB.y} Q ${cx} ${cy} ${toX} ${toY}`;
}

export function IdentityStatement() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28">
      {/* ─── Background multi-couches premium ─── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={DOT_GRID_DARK}
      />
      {/* Grand orb central rayonnant */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/14 blur-[160px]"
      />
      {/* Blob top-right (orange) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/12 blur-[140px]"
      />
      {/* Blob bottom-left (bleu) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/18 blur-[140px]"
      />
      {/* Lignes lumineuses haut + bas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/30 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-16">
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* COLONNE GAUCHE — texte éditorial fort                       */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              <Sparkles className="h-3 w-3" />
              Identité Nexus RCA
            </span>

            <h2 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.6rem] xl:text-6xl">
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

            <p className="mt-7 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Plateforme internationale moderne, ancrée à Bangui. Nexus RCA
              structure les projets de mobilité, d&rsquo;études, de
              financement, d&rsquo;accompagnement business et de
              digitalisation.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
              Un standard de cabinet international au service des talents
              centrafricains et des structures qui veulent grandir.
            </p>

            {/* 5 chips piliers */}
            <ul className="mt-8 flex flex-wrap items-center gap-2 sm:gap-2.5">
              {PILIERS_CHIPS.map((p) => {
                const Icon = p.icon;
                return (
                  <li
                    key={p.label}
                    className="group/chip inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md transition-all duration-200 hover:border-nexus-orange-400/40 hover:bg-white/[0.07] hover:text-white"
                  >
                    <Icon className="h-3 w-3 text-nexus-orange-300 transition-transform duration-300 group-hover/chip:scale-110" />
                    {p.label}
                  </li>
                );
              })}
            </ul>

            {/* Trust line */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 backdrop-blur-md">
              <MapPin className="h-3 w-3 text-nexus-orange-300" />
              Bangui (siège) · Canada (bureau) · Europe (représentation)
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* COLONNE DROITE — visuel signature : mini carte stylisée    */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="relative lg:col-span-6">
            {/* Halo externe — couche profondeur */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-nexus-orange-500/20 via-nexus-orange-500/8 to-nexus-blue-500/15 opacity-80 blur-3xl"
            />

            <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.30)] sm:p-8">
              {/* Glow décoratif interne */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-nexus-orange-500/25 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-nexus-blue-500/20 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-300/60 to-transparent"
              />

              <div className="relative">
                {/* Mini eyebrow */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                    </span>
                    Réseau actif
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 ring-1 ring-nexus-orange-400/30">
                    <Network className="h-4 w-4 text-nexus-orange-300" />
                  </div>
                </div>

                {/* SVG mini carte stylisée */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-nexus-blue-950/40 p-4">
                  <svg
                    viewBox="0 0 500 320"
                    className="w-full"
                    role="img"
                    aria-label="Réseau Nexus : Bangui (siège), Canada (bureau), Europe (représentation)"
                  >
                    <defs>
                      <radialGradient id="hub-glow-id" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fb923c" stopOpacity="0.7" />
                        <stop offset="60%" stopColor="#f97316" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient
                        id="point-glow-id"
                        cx="50%"
                        cy="50%"
                        r="50%"
                      >
                        <stop offset="0%" stopColor="#fdba74" stopOpacity="0.6" />
                        <stop offset="80%" stopColor="#f97316" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient
                        id="route-grad-id"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#fb923c" stopOpacity="0.15" />
                      </linearGradient>
                      <filter
                        id="soft-glow-id"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feGaussianBlur stdDeviation="2.4" result="b" />
                        <feMerge>
                          <feMergeNode in="b" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Latitudes/longitudes très subtiles */}
                    <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.5">
                      {[80, 160, 240].map((y) => (
                        <line key={`lat-${y}`} x1="20" y1={y} x2="480" y2={y} />
                      ))}
                      {[120, 240, 360].map((x) => (
                        <line key={`lng-${x}`} x1={x} y1="40" x2={x} y2="290" />
                      ))}
                    </g>

                    {/* Continents stylisés */}
                    <g fill="rgba(255,255,255,0.025)">
                      {/* Amérique du Nord */}
                      <ellipse cx="100" cy="135" rx="65" ry="48" />
                      {/* Europe */}
                      <ellipse cx="240" cy="135" rx="42" ry="28" />
                      {/* Afrique */}
                      <ellipse cx="255" cy="225" rx="55" ry="70" />
                      {/* Asie partielle */}
                      <ellipse cx="380" cy="160" rx="80" ry="55" />
                    </g>

                    {/* Routes Bangui → Europe / Canada */}
                    <g
                      fill="none"
                      stroke="url(#route-grad-id)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    >
                      <path
                        d={bezier(EUROPE.x, EUROPE.y, -50)}
                        strokeDasharray="3 6"
                        style={{
                          animation: "dashflow 6s linear infinite",
                        }}
                      />
                      <path
                        d={bezier(CANADA.x, CANADA.y, -75)}
                        strokeDasharray="3 6"
                        style={{
                          animation: "dashflow 7s linear infinite",
                        }}
                      />
                    </g>

                    {/* Points Europe & Canada */}
                    <g filter="url(#soft-glow-id)">
                      {[EUROPE, CANADA].map((p, i) => (
                        <g key={p.label}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="16"
                            fill="url(#point-glow-id)"
                            style={{
                              animation: `assurance-pulse 3.6s ease-in-out ${i * 0.4}s infinite`,
                              transformOrigin: `${p.x}px ${p.y}px`,
                            }}
                          />
                          <circle cx={p.x} cy={p.y} r="4" fill="#fdba74" />
                          <circle cx={p.x} cy={p.y} r="1.6" fill="#fff7ed" />
                        </g>
                      ))}
                    </g>

                    {/* Hub Bangui — disque pulsant signature */}
                    <g>
                      <circle
                        cx={HUB.x}
                        cy={HUB.y}
                        r="36"
                        fill="url(#hub-glow-id)"
                        style={{
                          animation:
                            "assurance-pulse 2.6s ease-in-out infinite",
                          transformOrigin: `${HUB.x}px ${HUB.y}px`,
                        }}
                      />
                      <circle
                        cx={HUB.x}
                        cy={HUB.y}
                        r="9"
                        fill="#f97316"
                        stroke="#fff7ed"
                        strokeWidth="2"
                      />
                      <circle cx={HUB.x} cy={HUB.y} r="3" fill="#ffffff" />
                    </g>

                    {/* Labels */}
                    <g
                      fontFamily="var(--font-plus-jakarta), sans-serif"
                      fontSize="11"
                      fontWeight="700"
                      fill="rgba(255,255,255,0.65)"
                    >
                      <text x={CANADA.x} y={CANADA.y - 22} textAnchor="middle">
                        {CANADA.label}
                      </text>
                      <text
                        x={CANADA.x}
                        y={CANADA.y - 9}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="600"
                        fill="rgba(255,255,255,0.4)"
                        letterSpacing="1.4"
                      >
                        {CANADA.region.toUpperCase()}
                      </text>

                      <text x={EUROPE.x} y={EUROPE.y - 22} textAnchor="middle">
                        {EUROPE.label}
                      </text>
                      <text
                        x={EUROPE.x}
                        y={EUROPE.y - 9}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="600"
                        fill="rgba(255,255,255,0.4)"
                        letterSpacing="1.4"
                      >
                        {EUROPE.region.toUpperCase()}
                      </text>
                    </g>

                    {/* Label hub */}
                    <g>
                      <rect
                        x={HUB.x - 50}
                        y={HUB.y + 16}
                        width="100"
                        height="22"
                        rx="11"
                        fill="rgba(2,7,31,0.9)"
                        stroke="rgba(249,115,22,0.5)"
                        strokeWidth="0.8"
                      />
                      <text
                        x={HUB.x}
                        y={HUB.y + 30}
                        textAnchor="middle"
                        fontFamily="var(--font-plus-jakarta), sans-serif"
                        fontSize="10"
                        fontWeight="700"
                        letterSpacing="1.8"
                        fill="#fdba74"
                      >
                        BANGUI · RCA
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Mini KPIs sous la carte */}
                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  <MiniKpi value="3" label="Continents" />
                  <MiniKpi value="10+" label="Services" />
                  <MiniKpi value="24h" label="Réponse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniKpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center backdrop-blur-md">
      <p className="font-display text-lg font-bold leading-none text-white sm:text-xl">
        <span className="bg-gradient-to-r from-nexus-orange-300 to-nexus-orange-500 bg-clip-text text-transparent">
          {value}
        </span>
      </p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">
        {label}
      </p>
    </div>
  );
}
