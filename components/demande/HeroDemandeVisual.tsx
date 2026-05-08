/**
 * HeroDemandeVisual — visuel cinématographique premium pour le hero /demande/complet.
 *
 * Composition :
 * - Globe digital SVG (cercles concentriques perspective + méridiens)
 * - Hub Bangui pulsant + 7 capitales internationales avec dots glow
 * - 7 lignes courbes Bezier dashflow animées (Bangui ↔ destinations)
 * - 3 cartes glass flottantes (Passeport / Visa / Dossier validation)
 * - 12 particules lumineuses dispersées avec drift
 *
 * Style : portail diplomatique premium × interface gouvernementale moderne.
 * Server component — animations CSS pures via style inline.
 */

import {
  CheckCircle2,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

const CENTER = { x: 250, y: 250 };

// 7 capitales internationales (autour de Bangui)
const CAPITALS = [
  { id: "paris", x: 235, y: 110, label: "Paris", region: "EU" },
  { id: "newyork", x: 95, y: 145, label: "New York", region: "AM" },
  { id: "montreal", x: 100, y: 95, label: "Montréal", region: "AM" },
  { id: "dubai", x: 360, y: 195, label: "Dubaï", region: "ME" },
  { id: "tokyo", x: 415, y: 130, label: "Tokyo", region: "AS" },
  { id: "sydney", x: 425, y: 380, label: "Sydney", region: "OC" },
  { id: "johannesburg", x: 280, y: 405, label: "Johannesburg", region: "AF" },
];

function bezier(toX: number, toY: number, offsetY: number): string {
  const cx = (CENTER.x + toX) / 2;
  const cy = (CENTER.y + toY) / 2 + offsetY;
  return `M ${CENTER.x} ${CENTER.y} Q ${cx} ${cy} ${toX} ${toY}`;
}

// 12 particules lumineuses dispersées
const PARTICLES = [
  { x: 60, y: 60, size: 1.2, delay: 0 },
  { x: 440, y: 80, size: 1.5, delay: 0.6 },
  { x: 90, y: 240, size: 1, delay: 1.2 },
  { x: 460, y: 280, size: 1.3, delay: 1.8 },
  { x: 70, y: 420, size: 1.1, delay: 2.4 },
  { x: 430, y: 450, size: 1.2, delay: 0.3 },
  { x: 200, y: 60, size: 0.9, delay: 0.9 },
  { x: 320, y: 60, size: 1, delay: 1.5 },
  { x: 180, y: 460, size: 1.1, delay: 2.1 },
  { x: 350, y: 460, size: 1, delay: 0.45 },
  { x: 50, y: 160, size: 0.8, delay: 1.05 },
  { x: 460, y: 360, size: 1.4, delay: 1.65 },
];

export function HeroDemandeVisual() {
  return (
    <div className="relative aspect-square w-full">
      {/* Halo externe — couche profondeur */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-full bg-gradient-to-br from-nexus-orange-500/15 via-nexus-orange-500/5 to-nexus-blue-500/15 opacity-70 blur-3xl"
      />

      {/* SVG globe + connexions + particules */}
      <svg
        viewBox="0 0 500 500"
        className="relative h-full w-full"
        role="img"
        aria-label="Globe interactif — réseau international Nexus RCA"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="hero-hub-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#f97316" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-cap-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fdba74" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-globe-bg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(59,99,255,0.15)" />
            <stop offset="50%" stopColor="rgba(10,26,107,0.10)" />
            <stop offset="100%" stopColor="rgba(2,7,31,0.05)" />
          </radialGradient>
          <linearGradient id="hero-route" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#fb923c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.15" />
          </linearGradient>
          <filter id="hero-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="hero-particle-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* === GLOBE DIGITAL === */}

        {/* Disque de fond du globe */}
        <circle cx={CENTER.x} cy={CENTER.y} r="180" fill="url(#hero-globe-bg)" />

        {/* Latitudes (ellipses concentriques pour effet sphère) */}
        <g
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="0.6"
          fill="none"
        >
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="180" ry="180" />
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="180" ry="60" />
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="180" ry="120" />
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="160" ry="160" />
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="120" ry="120" />
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="80" ry="80" />
        </g>

        {/* Méridiens (lignes verticales courbes) */}
        <g stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" fill="none">
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="60" ry="180" />
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="120" ry="180" />
          <ellipse cx={CENTER.x} cy={CENTER.y} rx="20" ry="180" />
        </g>

        {/* Continents stylisés (silhouettes diffuses) */}
        <g fill="rgba(255,255,255,0.03)">
          {/* Amérique du Nord */}
          <ellipse cx="120" cy="170" rx="55" ry="40" />
          {/* Europe */}
          <ellipse cx="240" cy="155" rx="35" ry="22" />
          {/* Afrique */}
          <ellipse cx="265" cy="280" rx="50" ry="65" />
          {/* Asie */}
          <ellipse cx="380" cy="190" rx="70" ry="48" />
          {/* Océanie */}
          <ellipse cx="410" cy="370" rx="35" ry="22" />
          {/* Amérique du Sud */}
          <ellipse cx="155" cy="350" rx="35" ry="55" />
        </g>

        {/* === ROUTES Bangui → 7 capitales === */}
        <g
          fill="none"
          stroke="url(#hero-route)"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          {CAPITALS.map((c, i) => (
            <path
              key={`route-${c.id}`}
              d={bezier(c.x, c.y, c.y < CENTER.y ? -40 - i * 8 : 40 + i * 8)}
              strokeDasharray="3 5"
              style={{
                animation: `dashflow ${5 + i * 0.6}s linear infinite`,
              }}
            />
          ))}
        </g>

        {/* === Capitales (dots glow + label) === */}
        <g filter="url(#hero-soft-glow)">
          {CAPITALS.map((c, i) => (
            <g key={c.id}>
              <circle
                cx={c.x}
                cy={c.y}
                r="14"
                fill="url(#hero-cap-glow)"
                style={{
                  animation: `assurance-pulse ${3.4 + i * 0.2}s ease-in-out ${i * 0.25}s infinite`,
                  transformOrigin: `${c.x}px ${c.y}px`,
                }}
              />
              <circle cx={c.x} cy={c.y} r="3" fill="#fdba74" />
              <circle cx={c.x} cy={c.y} r="1.4" fill="#fff7ed" />
            </g>
          ))}
        </g>

        {/* Labels capitales (très discrets) */}
        <g
          fontFamily="var(--font-plus-jakarta), sans-serif"
          fontSize="9"
          fontWeight="600"
          fill="rgba(255,255,255,0.4)"
        >
          {CAPITALS.map((c) => (
            <text
              key={`lbl-${c.id}`}
              x={c.x + 7}
              y={c.y - 6}
              textAnchor="start"
            >
              {c.label}
            </text>
          ))}
        </g>

        {/* === Hub Bangui (centre, gros pulsant) === */}
        <g>
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r="42"
            fill="url(#hero-hub-glow)"
            style={{
              animation: "assurance-pulse 2.4s ease-in-out infinite",
              transformOrigin: `${CENTER.x}px ${CENTER.y}px`,
            }}
          />
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r="9"
            fill="#f97316"
            stroke="#fff7ed"
            strokeWidth="2"
          />
          <circle cx={CENTER.x} cy={CENTER.y} r="3" fill="#ffffff" />
        </g>

        {/* Label hub */}
        <g>
          <rect
            x={CENTER.x - 50}
            y={CENTER.y + 16}
            width="100"
            height="22"
            rx="11"
            fill="rgba(2,7,31,0.85)"
            stroke="rgba(249,115,22,0.5)"
            strokeWidth="0.8"
          />
          <text
            x={CENTER.x}
            y={CENTER.y + 30}
            textAnchor="middle"
            fontFamily="var(--font-plus-jakarta), sans-serif"
            fontSize="9"
            fontWeight="700"
            letterSpacing="1.6"
            fill="#fdba74"
          >
            BANGUI · RCA
          </text>
        </g>

        {/* === Particules lumineuses === */}
        <g filter="url(#hero-particle-glow)">
          {PARTICLES.map((p, i) => (
            <circle
              key={`particle-${i}`}
              cx={p.x}
              cy={p.y}
              r={p.size}
              fill="#fdba74"
              opacity="0.5"
              style={{
                animation: `particle-drift ${12 + i * 0.8}s ease-in-out ${p.delay}s infinite`,
                transformOrigin: `${p.x}px ${p.y}px`,
              }}
            />
          ))}
        </g>
      </svg>

      {/* === 3 Cartes glass flottantes en overlay === */}
      {/* Card 1 : Passeport — top-left */}
      <div
        className="absolute left-2 top-4 sm:left-6 sm:top-10"
        style={{ animation: "companion-float 6s ease-in-out infinite" }}
      >
        <FloatingCard
          icon={ShieldCheck}
          eyebrow="Passeport"
          value="P-N° XX42"
          status="Validé"
          statusTone="emerald"
        />
      </div>

      {/* Card 2 : Visa — bottom-right */}
      <div
        className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-4"
        style={{
          animation: "companion-float 7.5s ease-in-out infinite",
          animationDelay: "1.5s",
        }}
      >
        <FloatingCard
          icon={FileCheck}
          eyebrow="Visa Schengen"
          value="Conformité"
          status="OK"
          statusTone="emerald"
        />
      </div>

      {/* Card 3 : Dossier validation — bottom-center */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:bottom-4"
        style={{
          animation: "companion-float 8s ease-in-out infinite",
          animationDelay: "0.8s",
        }}
      >
        <FloatingCard
          icon={CheckCircle2}
          eyebrow="Dossier"
          value="NX-DEM-2026"
          status="En cours"
          statusTone="orange"
          showProgress
        />
      </div>
    </div>
  );
}

// ─── Carte glass flottante ──────────────────────────────────────────────────
function FloatingCard({
  icon: Icon,
  eyebrow,
  value,
  status,
  statusTone,
  showProgress,
}: {
  icon: typeof ShieldCheck;
  eyebrow: string;
  value: string;
  status: string;
  statusTone: "emerald" | "orange";
  showProgress?: boolean;
}) {
  const toneClass =
    statusTone === "emerald"
      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
      : "border-nexus-orange-400/40 bg-nexus-orange-500/15 text-nexus-orange-200";

  return (
    <div className="relative">
      {/* Halo subtil */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-2xl bg-gradient-to-br from-nexus-orange-500/15 via-transparent to-nexus-blue-500/10 blur-xl"
      />
      <div className="relative w-[145px] overflow-hidden rounded-xl border border-white/15 bg-gradient-to-br from-white/[0.10] via-white/[0.05] to-white/[0.02] p-2.5 ring-1 ring-white/10 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_18px_40px_-18px_rgba(255,102,0,0.30)] sm:w-[170px] sm:p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 ring-1 ring-nexus-orange-400/30">
            <Icon className="h-3.5 w-3.5 text-nexus-orange-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/55">
              {eyebrow}
            </p>
            <p className="truncate font-mono text-[11px] font-bold text-white">
              {value}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] backdrop-blur-md ${toneClass}`}
          >
            {status}
          </span>
          {showProgress && (
            <div className="flex-1">
              <div className="h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-300"
                  style={{ width: "62%" }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
