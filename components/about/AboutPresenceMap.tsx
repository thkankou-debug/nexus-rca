import { Globe2, Network, Zap } from "lucide-react";

/**
 * Carte de présence internationale — signature visuelle de /a-propos.
 *
 * Composition différente de la grosse carte assurance (45 capitales) :
 * 3 points clés seulement — Bangui (hub), Europe (Paris), Canada (Montréal).
 * Lignes courbes Bezier connectant Bangui aux 2 autres avec dashflow CSS.
 * Continents stylisés en background à très faible opacité.
 *
 * Style : Visa global firms × Stripe (carte minimaliste premium).
 * Server component — animations CSS via style inline.
 */

const HUB = { x: 530, y: 280, label: "Bangui · RCA" };
const POINTS = [
  { id: "paris", x: 488, y: 165, label: "Paris", region: "Europe" },
  { id: "montreal", x: 290, y: 175, label: "Montréal", region: "Canada" },
];

const KPIS = [
  {
    icon: Globe2,
    value: "3",
    label: "Continents actifs",
    detail: "Afrique · Europe · Amérique du Nord",
  },
  {
    icon: Network,
    value: "10+",
    label: "Services internationaux",
    detail: "Visa, études, transferts, billets, financement",
  },
  {
    icon: Zap,
    value: "24 h",
    label: "Délai de réponse",
    detail: "Sur tout dossier ouvert dans les 3 pôles",
  },
];

function bezier(toX: number, toY: number, offsetY: number): string {
  const cx = (HUB.x + toX) / 2;
  const cy = (HUB.y + toY) / 2 + offsetY;
  return `M ${HUB.x} ${HUB.y} Q ${cx} ${cy} ${toX} ${toY}`;
}

export function AboutPresenceMap() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      {/* ─── Carte SVG ─── */}
      <div className="relative lg:col-span-7">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-4 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-6">
          {/* Glow d'ambiance */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/12 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-nexus-blue-500/15 blur-[100px]"
          />

          <svg
            viewBox="0 0 1000 460"
            className="relative w-full"
            role="img"
            aria-label="Carte mondiale stylisée — présence Nexus : Bangui (siège), Canada (bureau), Europe (représentation)"
          >
            <defs>
              <radialGradient id="about-hub-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#f97316" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="about-point-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fdba74" stopOpacity="0.6" />
                <stop offset="80%" stopColor="#f97316" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="about-route" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#fb923c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#fb923c" stopOpacity="0.15" />
              </linearGradient>
              <filter
                id="about-soft-glow"
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
              {[100, 200, 300].map((y) => (
                <line key={`lat-${y}`} x1="20" y1={y} x2="980" y2={y} />
              ))}
              {[200, 400, 600, 800].map((x) => (
                <line key={`lng-${x}`} x1={x} y1="40" x2={x} y2="430" />
              ))}
            </g>

            {/* Continents stylisés en background diffus */}
            <g fill="rgba(255,255,255,0.025)">
              {/* Amérique du Nord */}
              <ellipse cx="265" cy="180" rx="105" ry="72" />
              {/* Europe */}
              <ellipse cx="495" cy="175" rx="70" ry="42" />
              {/* Afrique */}
              <ellipse cx="525" cy="300" rx="85" ry="115" />
              {/* Asie */}
              <ellipse cx="745" cy="220" rx="140" ry="90" />
              {/* Océanie */}
              <ellipse cx="855" cy="380" rx="60" ry="40" />
              {/* Amérique du Sud */}
              <ellipse cx="345" cy="370" rx="58" ry="80" />
            </g>

            {/* Routes Bangui → Paris / Montréal */}
            <g
              fill="none"
              stroke="url(#about-route)"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <path
                d={bezier(POINTS[0].x, POINTS[0].y, -90)}
                strokeDasharray="3 6"
                style={{ animation: "dashflow 6s linear infinite" }}
              />
              <path
                d={bezier(POINTS[1].x, POINTS[1].y, -120)}
                strokeDasharray="3 6"
                style={{ animation: "dashflow 7s linear infinite" }}
              />
            </g>

            {/* Points secondaires (Paris, Montréal) */}
            <g filter="url(#about-soft-glow)">
              {POINTS.map((p, i) => (
                <g key={p.id}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="18"
                    fill="url(#about-point-glow)"
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

            {/* Hub Bangui — disque central pulsant */}
            <g>
              <circle
                cx={HUB.x}
                cy={HUB.y}
                r="38"
                fill="url(#about-hub-glow)"
                style={{
                  animation: "assurance-pulse 2.6s ease-in-out infinite",
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
              fill="rgba(255,255,255,0.6)"
            >
              {POINTS.map((p) => (
                <g key={`lbl-${p.id}`}>
                  <text x={p.x + 10} y={p.y - 8} textAnchor="start">
                    {p.label}
                  </text>
                  <text
                    x={p.x + 10}
                    y={p.y + 5}
                    textAnchor="start"
                    fontSize="9"
                    fontWeight="600"
                    fill="rgba(255,255,255,0.4)"
                    letterSpacing="1.2"
                  >
                    {p.region.toUpperCase()}
                  </text>
                </g>
              ))}
            </g>

            {/* Label hub */}
            <g>
              <rect
                x={HUB.x - 50}
                y={HUB.y + 14}
                width="100"
                height="22"
                rx="11"
                fill="rgba(2,7,31,0.9)"
                stroke="rgba(249,115,22,0.5)"
                strokeWidth="0.8"
              />
              <text
                x={HUB.x}
                y={HUB.y + 28}
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

          {/* Légende sous la carte */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 sm:gap-6">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-nexus-orange-500 ring-2 ring-nexus-orange-500/30" />
              Hub historique
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-nexus-orange-300" />
              Pôles internationaux
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-px w-6 bg-gradient-to-r from-nexus-orange-500/60 to-nexus-orange-300/0" />
              Liens actifs
            </span>
          </div>
        </div>
      </div>

      {/* ─── KPIs latéraux ─── */}
      <div className="space-y-4 lg:col-span-5">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
              />
              <div className="relative flex gap-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 ring-1 ring-nexus-orange-400/30">
                  <Icon className="h-5 w-5 text-nexus-orange-300" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-3xl font-bold leading-none text-white sm:text-4xl">
                    {kpi.value}
                  </p>
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {kpi.detail}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
