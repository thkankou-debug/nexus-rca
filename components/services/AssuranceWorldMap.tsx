"use client";

import { Globe, Headphones, ShieldCheck, Stethoscope } from "lucide-react";

/**
 * Assurance — Carte du monde stylisée (signature visuelle de la page).
 *
 * Pattern unique de cette page : pas une vraie carte géographique mais une
 * constellation de capitales connectées au hub Bangui. Évoque la couverture
 * mondiale + l'accompagnement depuis la RCA.
 *
 * Design system :
 * - Fond navy (déjà fourni par le wrapper section parent)
 * - Dots faibles dispersés (atmosphère)
 * - Capitales clés en orange pulsant
 * - Hub Bangui en gros disque pulsant (signature)
 * - Routes courbes depuis Bangui vers 8 grandes destinations
 * - KPIs latéraux (responsive : haut sur mobile, droite sur desktop)
 *
 * Aucune dépendance lourde — SVG inline pur.
 */

type Coord = { id: string; label: string; x: number; y: number; tier: 1 | 2 };

// Coordonnées approximatives sur projection schématique 1000×500.
// Tier 1 = capitales mises en avant (orange + label visible desktop)
// Tier 2 = points contextuels (atmosphère)
const CAPITALS: Coord[] = [
  // Europe
  { id: "paris", label: "Paris", x: 488, y: 178, tier: 1 },
  { id: "londres", label: "Londres", x: 472, y: 168, tier: 1 },
  { id: "bruxelles", label: "Bruxelles", x: 490, y: 172, tier: 2 },
  { id: "berlin", label: "Berlin", x: 512, y: 168, tier: 2 },
  { id: "madrid", label: "Madrid", x: 472, y: 200, tier: 2 },
  { id: "rome", label: "Rome", x: 510, y: 198, tier: 2 },
  { id: "geneve", label: "Genève", x: 495, y: 185, tier: 2 },
  { id: "lisbonne", label: "Lisbonne", x: 458, y: 200, tier: 2 },
  { id: "athenes", label: "Athènes", x: 538, y: 208, tier: 2 },

  // Amériques
  { id: "newyork", label: "New York", x: 290, y: 198, tier: 1 },
  { id: "montreal", label: "Montréal", x: 290, y: 180, tier: 1 },
  { id: "toronto", label: "Toronto", x: 278, y: 188, tier: 2 },
  { id: "washington", label: "Washington", x: 285, y: 208, tier: 2 },
  { id: "miami", label: "Miami", x: 282, y: 232, tier: 2 },
  { id: "saopaulo", label: "São Paulo", x: 348, y: 358, tier: 2 },
  { id: "buenosaires", label: "Buenos Aires", x: 340, y: 410, tier: 2 },
  { id: "mexico", label: "Mexico", x: 248, y: 245, tier: 2 },

  // Afrique
  { id: "casablanca", label: "Casablanca", x: 462, y: 232, tier: 1 },
  { id: "lecaire", label: "Le Caire", x: 552, y: 238, tier: 2 },
  { id: "dakar", label: "Dakar", x: 432, y: 280, tier: 2 },
  { id: "abidjan", label: "Abidjan", x: 472, y: 304, tier: 2 },
  { id: "douala", label: "Douala", x: 518, y: 318, tier: 2 },
  { id: "kinshasa", label: "Kinshasa", x: 530, y: 348, tier: 2 },
  { id: "nairobi", label: "Nairobi", x: 580, y: 350, tier: 2 },
  { id: "johannesburg", label: "Johannesburg", x: 558, y: 408, tier: 1 },
  { id: "tunis", label: "Tunis", x: 510, y: 220, tier: 2 },
  { id: "addisabeba", label: "Addis-Abeba", x: 588, y: 308, tier: 2 },
  { id: "lagos", label: "Lagos", x: 492, y: 312, tier: 2 },

  // Moyen-Orient
  { id: "dubai", label: "Dubaï", x: 612, y: 248, tier: 1 },
  { id: "istanbul", label: "Istanbul", x: 545, y: 198, tier: 2 },
  { id: "riyad", label: "Riyad", x: 595, y: 258, tier: 2 },
  { id: "telaviv", label: "Tel-Aviv", x: 560, y: 222, tier: 2 },

  // Asie
  { id: "tokyo", label: "Tokyo", x: 832, y: 200, tier: 1 },
  { id: "shanghai", label: "Shanghai", x: 798, y: 218, tier: 1 },
  { id: "pekin", label: "Pékin", x: 790, y: 198, tier: 2 },
  { id: "seoul", label: "Séoul", x: 815, y: 205, tier: 2 },
  { id: "singapour", label: "Singapour", x: 768, y: 318, tier: 1 },
  { id: "bangkok", label: "Bangkok", x: 745, y: 285, tier: 2 },
  { id: "mumbai", label: "Mumbai", x: 678, y: 270, tier: 2 },
  { id: "delhi", label: "New Delhi", x: 690, y: 245, tier: 2 },
  { id: "kuala", label: "Kuala Lumpur", x: 760, y: 312, tier: 2 },
  { id: "hochiminh", label: "Hô Chi Minh", x: 762, y: 298, tier: 2 },

  // Océanie
  { id: "sydney", label: "Sydney", x: 850, y: 395, tier: 1 },
  { id: "melbourne", label: "Melbourne", x: 838, y: 410, tier: 2 },
  { id: "auckland", label: "Auckland", x: 905, y: 408, tier: 2 },
];

// Hub Bangui — RCA
const HUB = { x: 535, y: 322 };

// Routes depuis Bangui vers grandes destinations (bezier courbe)
const ROUTES: { id: string; toId: string; offsetY: number }[] = [
  { id: "r-paris", toId: "paris", offsetY: -110 },
  { id: "r-montreal", toId: "montreal", offsetY: -120 },
  { id: "r-newyork", toId: "newyork", offsetY: -90 },
  { id: "r-dubai", toId: "dubai", offsetY: -70 },
  { id: "r-tokyo", toId: "tokyo", offsetY: -130 },
  { id: "r-singapour", toId: "singapour", offsetY: -50 },
  { id: "r-johannesburg", toId: "johannesburg", offsetY: 30 },
  { id: "r-sydney", toId: "sydney", offsetY: -90 },
  { id: "r-casablanca", toId: "casablanca", offsetY: -90 },
];

function bezierPath(toX: number, toY: number, offsetY: number): string {
  const cx = (HUB.x + toX) / 2;
  const cy = (HUB.y + toY) / 2 + offsetY;
  return `M ${HUB.x} ${HUB.y} Q ${cx} ${cy} ${toX} ${toY}`;
}

// KPIs latéraux
const KPIS = [
  {
    icon: Globe,
    value: "150+",
    label: "Pays couverts",
    detail: "Réseau d'assistance international",
  },
  {
    icon: Headphones,
    value: "24 / 7",
    label: "Assistance multilingue",
    detail: "Plateforme téléphonique mondiale",
  },
  {
    icon: Stethoscope,
    value: "30 000 €+",
    label: "Plafond médical conforme",
    detail: "Standard consulaire Schengen",
  },
  {
    icon: ShieldCheck,
    value: "99,2 %",
    label: "Taux de sinistres traités",
    detail: "Sur dossiers déposés via Nexus",
  },
];

export function AssuranceWorldMap() {
  return (
    <div className="relative">
      {/* ─── Layout : carte (xl 8 cols) + KPIs (xl 4 cols) ─── */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* ─── Carte du monde — colonne large ─── */}
        <div className="relative lg:col-span-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-4 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-6">
            {/* Glow d'ambiance derrière la carte */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/10 blur-[120px]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-nexus-blue-500/15 blur-[100px]"
            />

            <svg
              viewBox="0 0 1000 500"
              className="relative w-full"
              role="img"
              aria-label="Carte mondiale stylisée — réseau Nexus depuis Bangui"
            >
              {/* Defs : gradients + filtres glow */}
              <defs>
                <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
                  <stop offset="60%" stopColor="#f97316" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="capital-glow-orange" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fdba74" stopOpacity="0.55" />
                  <stop offset="80%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.55" />
                  <stop offset="50%" stopColor="#fb923c" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity="0.1" />
                </linearGradient>
                <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grille latitudes/longitudes très subtile */}
              <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.5">
                {[100, 200, 300, 400].map((y) => (
                  <line key={`lat-${y}`} x1="20" y1={y} x2="980" y2={y} />
                ))}
                {[150, 350, 550, 750].map((x) => (
                  <line key={`lng-${x}`} x1={x} y1="40" x2={x} y2="460" />
                ))}
              </g>

              {/* Continents stylisés — grandes tâches diffuses pour suggérer */}
              <g fill="rgba(255,255,255,0.025)">
                {/* Amérique du Nord */}
                <ellipse cx="265" cy="195" rx="95" ry="65" />
                {/* Amérique du Sud */}
                <ellipse cx="345" cy="380" rx="55" ry="80" />
                {/* Europe */}
                <ellipse cx="495" cy="190" rx="65" ry="38" />
                {/* Afrique */}
                <ellipse cx="525" cy="335" rx="80" ry="105" />
                {/* Asie */}
                <ellipse cx="745" cy="240" rx="135" ry="85" />
                {/* Océanie */}
                <ellipse cx="855" cy="400" rx="55" ry="35" />
              </g>

              {/* Routes depuis Bangui */}
              <g
                fill="none"
                stroke="url(#route-grad)"
                strokeWidth="1.2"
                strokeLinecap="round"
              >
                {ROUTES.map((route) => {
                  const dest = CAPITALS.find((c) => c.id === route.toId);
                  if (!dest) return null;
                  return (
                    <path
                      key={route.id}
                      d={bezierPath(dest.x, dest.y, route.offsetY)}
                      strokeDasharray="3 6"
                      style={{
                        animation: "dashflow 6s linear infinite",
                      }}
                    />
                  );
                })}
              </g>

              {/* Capitales tier 2 (atmosphère) */}
              <g>
                {CAPITALS.filter((c) => c.tier === 2).map((c) => (
                  <g key={c.id}>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="4.5"
                      fill="rgba(251,146,60,0.12)"
                    />
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="1.6"
                      fill="rgba(255,255,255,0.7)"
                    />
                  </g>
                ))}
              </g>

              {/* Capitales tier 1 (mises en avant) */}
              <g filter="url(#soft-glow)">
                {CAPITALS.filter((c) => c.tier === 1).map((c, i) => (
                  <g key={c.id}>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="14"
                      fill="url(#capital-glow-orange)"
                      style={{
                        animation: `assurance-pulse 3.6s ease-in-out ${
                          i * 0.18
                        }s infinite`,
                        transformOrigin: `${c.x}px ${c.y}px`,
                      }}
                    />
                    <circle cx={c.x} cy={c.y} r="3" fill="#fdba74" />
                    <circle cx={c.x} cy={c.y} r="1.4" fill="#fff7ed" />
                  </g>
                ))}
              </g>

              {/* Hub Bangui — disque pulsant signature */}
              <g>
                <circle
                  cx={HUB.x}
                  cy={HUB.y}
                  r="32"
                  fill="url(#hub-glow)"
                  style={{
                    animation: "assurance-pulse 2.4s ease-in-out infinite",
                    transformOrigin: `${HUB.x}px ${HUB.y}px`,
                  }}
                />
                <circle
                  cx={HUB.x}
                  cy={HUB.y}
                  r="7"
                  fill="#f97316"
                  stroke="#fff7ed"
                  strokeWidth="1.5"
                />
                <circle cx={HUB.x} cy={HUB.y} r="2.4" fill="#ffffff" />
              </g>

              {/* Labels capitales tier 1 (desktop seulement, peu intrusifs) */}
              <g
                className="hidden sm:block"
                fontFamily="var(--font-plus-jakarta), sans-serif"
                fontSize="9"
                fontWeight="600"
                fill="rgba(255,255,255,0.55)"
              >
                {CAPITALS.filter((c) => c.tier === 1).map((c) => (
                  <text
                    key={`lbl-${c.id}`}
                    x={c.x + 8}
                    y={c.y - 6}
                    textAnchor="start"
                  >
                    {c.label}
                  </text>
                ))}
              </g>

              {/* Label hub Bangui */}
              <g>
                <rect
                  x={HUB.x - 36}
                  y={HUB.y + 10}
                  width="72"
                  height="18"
                  rx="9"
                  fill="rgba(2,7,31,0.85)"
                  stroke="rgba(249,115,22,0.4)"
                  strokeWidth="0.8"
                />
                <text
                  x={HUB.x}
                  y={HUB.y + 22}
                  textAnchor="middle"
                  fontFamily="var(--font-plus-jakarta), sans-serif"
                  fontSize="9"
                  fontWeight="700"
                  letterSpacing="1.5"
                  fill="#fdba74"
                >
                  BANGUI · RCA
                </text>
              </g>
            </svg>

            {/* Légende sous la carte */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 sm:gap-6">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-nexus-orange-500 ring-2 ring-nexus-orange-500/30" />
                Hub Bangui
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-nexus-orange-300" />
                Capitales partenaires
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-px w-6 bg-gradient-to-r from-nexus-orange-500/60 to-nexus-orange-300/0" />
                Réseau d&rsquo;assistance
              </span>
            </div>
          </div>
        </div>

        {/* ─── KPIs (4 cartes premium) ─── */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-4 lg:grid-cols-1">
          {KPIS.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                />
                <div className="relative">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 ring-1 ring-nexus-orange-400/30">
                    <Icon className="h-4 w-4 text-nexus-orange-300" />
                  </div>
                  <div className="mt-4 font-display text-3xl font-bold leading-none text-white sm:text-4xl">
                    {kpi.value}
                  </div>
                  <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                    {kpi.label}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {kpi.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
