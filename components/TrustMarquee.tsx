// ─── TrustMarquee Premium tech ──────────────────────────────────────────────
// Bandeau partenaires sur fond navy + dot grid + blob orange.
// Pills glass blur avec monogramme + label uppercase.
// 2 lignes croisées (sens opposés) pour effet réseau international vivant.
//
// Marquee :
// - boucle infinie sans saut (2 copies identiques des partenaires par track)
// - vitesse lente et élégante (60s + 75s)
// - pause au hover desktop (via .marquee-track + media (hover: hover))
// - défilement actif aussi sur mobile (coût GPU minimal — translation 2D)
// - prefers-reduced-motion respecté (animation:none dans globals.css)
// ────────────────────────────────────────────────────────────────────────────

interface Partner {
  monogram: string;
  label: string;
}

const PARTNERS_LINE_1: Partner[] = [
  { monogram: "WU", label: "Western Union" },
  { monogram: "MG", label: "MoneyGram" },
  { monogram: "RIA", label: "Ria" },
  { monogram: "IRC", label: "IRCC Canada" },
  { monogram: "SCH", label: "Espace Schengen" },
  { monogram: "AF", label: "Air France" },
];

const PARTNERS_LINE_2: Partner[] = [
  { monogram: "RAM", label: "Royal Air Maroc" },
  { monogram: "ETH", label: "Ethiopian Airlines" },
  { monogram: "SKY", label: "Skyscanner" },
  { monogram: "TCF", label: "TCF Canada" },
  { monogram: "AMC", label: "Ambassade du Canada" },
  { monogram: "GFL", label: "Google Flights" },
];

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export function TrustMarquee() {
  return (
    <section
      aria-label="Réseau et partenaires"
      className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-12 sm:py-16"
    >
      {/* Dot grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={DOT_GRID_DARK}
      />
      {/* Glow blob orange subtil */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-24 h-72 w-72 rounded-full bg-nexus-orange-500/10 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -bottom-24 h-72 w-72 rounded-full bg-nexus-blue-500/15 blur-[100px]"
      />
      {/* Bordure inférieure éclairée */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      {/* Header */}
      <div className="relative mx-auto mb-8 max-w-3xl px-4 text-center sm:mb-10 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
          </span>
          Réseau & partenaires
        </span>
        <h3 className="mt-4 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
          Connectés aux acteurs internationaux qui comptent.
        </h3>
      </div>

      {/* Marquee — 2 lignes croisées */}
      <div className="relative space-y-3 sm:space-y-4">
        {/* Fades latéraux pour masquer le hard-cut aux bords */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-nexus-blue-950 to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-nexus-blue-950 to-transparent sm:w-32" />

        <Track
          partners={PARTNERS_LINE_1}
          reverse={false}
          durationSec={60}
        />
        <Track
          partners={PARTNERS_LINE_2}
          reverse={true}
          durationSec={75}
        />
      </div>
    </section>
  );
}

function Track({
  partners,
  reverse,
  durationSec,
}: {
  partners: Partner[];
  reverse: boolean;
  durationSec: number;
}) {
  // Wrapper .marquee-track + overflow-hidden : permet le hover-pause CSS
  // (cf. globals.css règle @media (hover: hover))
  // Le `flex` interne contient deux copies identiques côte-à-côte ; quand la
  // 1ère atteint translateX(-100%), la 2e a pris exactement sa place visuelle
  // → reset au cycle suivant invisible (pas de saut).
  return (
    <div className="marquee-track relative flex overflow-hidden">
      <div
        className={`flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
        style={{ animationDuration: `${durationSec}s` }}
      >
        {partners.map((p) => (
          <Pill key={`a-${p.label}`} partner={p} />
        ))}
      </div>
      <div
        aria-hidden
        className={`flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
        style={{ animationDuration: `${durationSec}s` }}
      >
        {partners.map((p) => (
          <Pill key={`b-${p.label}`} partner={p} />
        ))}
      </div>
    </div>
  );
}

function Pill({ partner }: { partner: Partner }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-md transition-all duration-200 ease-out hover:scale-[1.02] hover:border-nexus-orange-400/30 hover:bg-white/[0.06]">
      {/* Monogram */}
      <span
        aria-hidden
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-950 text-[8px] font-bold tracking-wider text-white/90"
      >
        {partner.monogram}
      </span>
      <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.12em] text-white/85">
        {partner.label}
      </span>
    </div>
  );
}
