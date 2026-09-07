import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Compass, FilePlus } from "lucide-react";

// ─── Hero homepage — structure maquette (P10, révision post-retour Thierry) ─
// Composition éditoriale 2 colonnes : texte serif à gauche, illustration
// "réseau international" (SVG, données réelles : Bangui + 4 zones) à droite.
// Aucune photo : en attente de la photo réelle autorisée pour un lot futur —
// voir docs/DETTE.md, section P10.
// ────────────────────────────────────────────────────────────────────────────

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.05) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

// Globe — viewBox carré 0 0 600 600, disque centré (300,300) rayon 230.
const GLOBE_CENTER = { x: 300, y: 300 };
const GLOBE_R = 230;

const HUB = { x: 300, y: 330, label: "Bangui" };
const NODES = [
  { x: 300, y: 88, label: "Europe" },
  { x: 96, y: 168, label: "Amériques" },
  { x: 452, y: 142, label: "Moyen-Orient" },
  { x: 522, y: 268, label: "Asie" },
];

// Arcs prononcés (façon vol long-courrier) pour suggérer la courbure du globe.
function routePath(toX: number, toY: number): string {
  const midX = (HUB.x + toX) / 2;
  const midY = (HUB.y + toY) / 2;
  const dx = toX - HUB.x;
  const dy = toY - HUB.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const arcHeight = dist * 0.42;
  return `M ${HUB.x} ${HUB.y} Q ${midX} ${midY - arcHeight} ${toX} ${toY}`;
}

export function Hero() {
  const t = useTranslations("Hero");

  const TAGLINE = [t("tagline1"), t("tagline2"), t("tagline3")];

  return (
    <section className="relative overflow-hidden bg-nexus-blue-950 pb-12 pt-24 text-white sm:pb-14 sm:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={DOT_GRID_DARK}
      />
      {/* Bordure inférieure discrète */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* ─── Colonne gauche — texte ─── */}
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-brand">
              <span aria-hidden className="h-px w-6 bg-brand" />
              {t("eyebrow")}
            </span>

            <h1 className="mt-5 font-serif text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-[3.2rem]">
              <span className="text-white">{t("title_line1")}</span>
              <br />
              <span className="text-brand">{t("title_line2")}</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t("subtitle")}
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row">
              <Link
                href="/demande/complet"
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-brand px-7 py-3.5 text-sm font-bold text-on-brand shadow-[0_10px_30px_-10px_rgba(201,162,39,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-hover"
              >
                <FilePlus className="h-4 w-4" />
                {t("cta_primary")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-transparent px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/10"
              >
                <Compass className="h-4 w-4" />
                {t("cta_secondary")}
              </Link>
            </div>

            {/* Tagline — Talents · Opportunités · Impact durable */}
            <div className="mt-8 flex items-center gap-4">
              <span aria-hidden className="h-px w-10 bg-brand" />
              <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                {TAGLINE.map((item, i) => (
                  <li key={item} className="inline-flex items-center gap-4">
                    {item}
                    {i < TAGLINE.length - 1 && (
                      <span aria-hidden className="text-white/25">
                        ·
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ─── Colonne droite — globe international (SVG, pas de photo) ─── */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto aspect-square w-full max-w-[540px]">
              <svg
                viewBox="0 0 600 600"
                className="h-full w-full overflow-visible"
                role="img"
                aria-label={`Réseau Nexus RCA depuis ${HUB.label} vers ${NODES.map((n) => n.label).join(", ")}`}
              >
                <defs>
                  <radialGradient id="hero-sphere" cx="36%" cy="30%" r="75%">
                    <stop offset="0%" stopColor="#2a4a8a" />
                    <stop offset="45%" stopColor="#122a5c" />
                    <stop offset="80%" stopColor="#050f27" />
                    <stop offset="100%" stopColor="#01040f" />
                  </radialGradient>
                  <radialGradient id="hero-atmosphere" cx="50%" cy="50%" r="50%">
                    <stop offset="82%" stopColor="#d4af37" stopOpacity="0" />
                    <stop offset="96%" stopColor="#d4af37" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="hero-hub-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f3dfa0" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="hero-route" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f3dfa0" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0.25" />
                  </linearGradient>
                  <clipPath id="hero-globe-clip">
                    <circle cx={GLOBE_CENTER.x} cy={GLOBE_CENTER.y} r={GLOBE_R} />
                  </clipPath>
                </defs>

                {/* Halo d'atmosphère */}
                <circle
                  cx={GLOBE_CENTER.x}
                  cy={GLOBE_CENTER.y}
                  r={GLOBE_R + 14}
                  fill="url(#hero-atmosphere)"
                />

                {/* Sphère */}
                <g clipPath="url(#hero-globe-clip)">
                  <circle cx={GLOBE_CENTER.x} cy={GLOBE_CENTER.y} r={GLOBE_R} fill="url(#hero-sphere)" />

                  {/* Méridiens/parallèles très discrets — donnent le volume */}
                  <g stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none">
                    <ellipse cx={GLOBE_CENTER.x} cy={GLOBE_CENTER.y} rx={GLOBE_R} ry={GLOBE_R * 0.42} />
                    <ellipse cx={GLOBE_CENTER.x} cy={GLOBE_CENTER.y} rx={GLOBE_R * 0.55} ry={GLOBE_R} />
                    <line x1={GLOBE_CENTER.x - GLOBE_R} y1={GLOBE_CENTER.y} x2={GLOBE_CENTER.x + GLOBE_R} y2={GLOBE_CENTER.y} />
                  </g>

                  {/* Continents — silhouettes stylisées, Afrique au centre */}
                  <g fill="rgba(212,175,55,0.16)" stroke="rgba(212,175,55,0.4)" strokeWidth="1">
                    {/* Afrique */}
                    <path d="M 300 178 C 338 181 368 196 383 220 C 393 238 388 258 399 278 C 409 298 403 314 389 329 C 379 344 384 364 374 384 C 366 404 371 424 359 444 C 349 461 334 470 319 480 C 307 470 299 455 289 440 C 277 425 264 429 254 409 C 244 391 229 384 224 364 C 219 344 204 334 209 314 C 214 294 204 274 214 254 C 221 237 214 217 229 201 C 244 187 265 181 300 178 Z" />
                    {/* Europe (nord) */}
                    <path d="M 262 96 C 288 88 322 90 344 102 C 352 108 346 118 332 120 C 310 123 284 120 266 112 C 258 108 254 100 262 96 Z" opacity="0.7" />
                    {/* Péninsule arabique / Moyen-Orient */}
                    <path d="M 372 158 C 392 154 412 162 418 180 C 422 194 410 204 396 200 C 382 196 368 184 366 170 C 365 164 366 160 372 158 Z" opacity="0.7" />
                    {/* Amérique (bord gauche, tronquée) */}
                    <path d="M 70 140 C 96 132 118 146 122 168 C 126 190 112 210 92 214 C 76 217 62 204 60 184 C 59 166 60 148 70 140 Z" opacity="0.6" />
                    {/* Asie (bord droit, tronquée) */}
                    <path d="M 470 200 C 500 192 528 206 536 230 C 542 250 528 268 506 270 C 486 272 468 258 464 236 C 462 222 462 208 470 200 Z" opacity="0.6" />
                  </g>

                  {/* Ombre du terminateur (bord non éclairé) */}
                  <ellipse
                    cx={GLOBE_CENTER.x + 90}
                    cy={GLOBE_CENTER.y + 60}
                    rx={GLOBE_R * 0.95}
                    ry={GLOBE_R * 0.95}
                    fill="black"
                    opacity="0.28"
                  />
                </g>

                {/* Cerclage fin de la sphère */}
                <circle
                  cx={GLOBE_CENTER.x}
                  cy={GLOBE_CENTER.y}
                  r={GLOBE_R}
                  fill="none"
                  stroke="rgba(212,175,55,0.35)"
                  strokeWidth="1"
                />

                {/* Arcs de vol Bangui → zones (par-dessus la sphère) */}
                <g fill="none" stroke="url(#hero-route)" strokeWidth="1.6" strokeLinecap="round">
                  {NODES.map((n) => (
                    <path
                      key={n.label}
                      d={routePath(n.x, n.y)}
                      strokeDasharray="2 7"
                      style={{ animation: "dashflow 9s linear infinite" }}
                    />
                  ))}
                </g>

                {/* Nœuds internationaux */}
                {NODES.map((n) => (
                  <g key={n.label}>
                    <circle cx={n.x} cy={n.y} r="4.5" fill="#f3dfa0" />
                    <circle cx={n.x} cy={n.y} r="2" fill="#fffdf5" />
                    <text
                      x={n.x}
                      y={n.y - 14}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="700"
                      letterSpacing="0.5"
                      fill="#ffffff"
                      fontFamily="var(--font-plus-jakarta), sans-serif"
                    >
                      {n.label.toUpperCase()}
                    </text>
                  </g>
                ))}

                {/* Hub Bangui */}
                <circle
                  cx={HUB.x}
                  cy={HUB.y}
                  r="34"
                  fill="url(#hero-hub-glow)"
                  style={{
                    animation: "assurance-pulse 3s ease-in-out infinite",
                    transformOrigin: `${HUB.x}px ${HUB.y}px`,
                  }}
                />
                <circle cx={HUB.x} cy={HUB.y} r="6.5" fill="#f3dfa0" stroke="#fffdf5" strokeWidth="1.5" />
                <rect
                  x={HUB.x - 48}
                  y={HUB.y + 14}
                  width="96"
                  height="22"
                  rx="11"
                  fill="rgba(1,4,15,0.9)"
                  stroke="rgba(212,175,55,0.6)"
                  strokeWidth="0.8"
                />
                <text
                  x={HUB.x}
                  y={HUB.y + 28.5}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  letterSpacing="1.8"
                  fill="#f3dfa0"
                  fontFamily="var(--font-plus-jakarta), sans-serif"
                >
                  BANGUI
                </text>
              </svg>
            </div>

            {/* Mention latérale discrète */}
            <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
              {t("side_tagline")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
