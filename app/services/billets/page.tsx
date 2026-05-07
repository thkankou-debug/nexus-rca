import Link from "next/link";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import { FlightSearchMock } from "@/components/services/FlightSearchMock";
import {
  Plane,
  Hotel,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calendar,
  MessageCircle,
  FileText,
  Search,
  ClipboardCheck,
  Wallet,
  ShieldCheck,
  Globe,
  MapPin,
  Headphones,
  Receipt,
  Sparkles,
  Building2,
  Star,
  Compass,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Billets d'avion & hôtels | Nexus RCA — Bangui",
  description:
    "L'expertise centrafricaine pour vos voyages. Recherche multi-compagnies, hôtels vérifiés, paiement local en FCFA, suivi avant et pendant le voyage.",
};

// ─── Pattern dot grid sombre ─────────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

// ─── Données : icônes + clés de traduction ─────────────────────────────────

const METHODOLOGIE = [
  { num: "01", icon: FileText, key: "metho_01" },
  { num: "02", icon: Search, key: "metho_02" },
  { num: "03", icon: ClipboardCheck, key: "metho_03" },
  { num: "04", icon: Plane, key: "metho_04" },
] as const;

const PRESTATIONS = [
  { icon: Plane, key: "presta_1" },
  { icon: Hotel, key: "presta_2" },
  { icon: Receipt, key: "presta_3" },
] as const;

const TARIFS = [
  { icon: Search, key: "tarif_1" },
  { icon: Plane, key: "tarif_2", highlight: true },
  { icon: Wallet, key: "tarif_3" },
] as const;

// ─── Données : Route Map (signature billets) ──────────────────────────────
// viewBox 800x500, centre Bangui = (400, 250)
type RouteNode = {
  id: string;
  flag: string;
  label: string;
  x: number; // en %
  y: number; // en %
  dur: string;
};

const ROUTE_NODES: RouteNode[] = [
  { id: "fr", flag: "🇫🇷", label: "Paris", x: 52, y: 8, dur: "5.5s" },
  { id: "ma", flag: "🇲🇦", label: "Casablanca", x: 12, y: 22, dur: "4.5s" },
  { id: "et", flag: "🇪🇹", label: "Addis Abeba", x: 88, y: 28, dur: "4s" },
  { id: "ae", flag: "🇦🇪", label: "Dubai", x: 90, y: 70, dur: "6s" },
  { id: "cm", flag: "🇨🇲", label: "Yaoundé", x: 18, y: 78, dur: "3s" },
  { id: "qa", flag: "🇶🇦", label: "Doha", x: 50, y: 90, dur: "5s" },
];

// Coordonnées SVG (viewBox 800x500) calculées depuis les % nodes pour les courbes
function nodeSvgCoords(node: RouteNode) {
  const xSvg = (node.x / 100) * 800 + 60; // viser milieu pill
  const ySvg = (node.y / 100) * 500 + 22;
  return { x: xSvg, y: ySvg };
}

// Génère un path Bezier courbe entre Bangui (400,250) et un node
function bezierPath(node: RouteNode): string {
  const { x, y } = nodeSvgCoords(node);
  const cx = 400;
  const cy = 250;
  // Point de contrôle : milieu décalé perpendiculairement
  const mx = (cx + x) / 2;
  const my = (cy + y) / 2;
  const dx = x - cx;
  const dy = y - cy;
  // Décalage perpendiculaire (rotation 90°), amplitude proportionnelle à la distance
  const len = Math.sqrt(dx * dx + dy * dy);
  const offset = Math.min(80, len * 0.25);
  const nx = -dy / len;
  const ny = dx / len;
  const ctrlX = mx + nx * offset;
  const ctrlY = my + ny * offset;
  return `M ${cx} ${cy} Q ${ctrlX} ${ctrlY} ${x} ${y}`;
}

// ─── Données : Compagnies aériennes (signature bento) ──────────────────────
type Airline = {
  id: string;
  name: string;
  hub: string;
  emoji: string;
  desc: string;
};

const AIRLINES_MASTER: Airline = {
  id: "af",
  name: "Air France",
  hub: "Paris CDG",
  emoji: "🇫🇷",
  desc: "Liaison directe via correspondance européenne. Standards Skyteam, bagages généreux, programme Flying Blue accessible.",
};

const AIRLINES_SMALL: Airline[] = [
  {
    id: "at",
    name: "Royal Air Maroc",
    hub: "Casablanca",
    emoji: "🇲🇦",
    desc: "Hub Casablanca, vols vers Europe et Afrique du Nord.",
  },
  {
    id: "et",
    name: "Ethiopian Airlines",
    hub: "Addis Abeba",
    emoji: "🇪🇹",
    desc: "Réseau africain dense, connexions vers Asie et Moyen-Orient.",
  },
  {
    id: "kq",
    name: "Kenya Airways",
    hub: "Nairobi",
    emoji: "🇰🇪",
    desc: "Liaisons régionales et long-courrier vers Asie.",
  },
  {
    id: "qr",
    name: "Qatar Airways",
    hub: "Doha",
    emoji: "🇶🇦",
    desc: "Standards 5 étoiles, hub Doha vers Asie et Océanie.",
  },
  {
    id: "tk",
    name: "Turkish Airlines",
    hub: "Istanbul",
    emoji: "🇹🇷",
    desc: "Réseau parmi les plus larges, connexions Europe-Asie.",
  },
];

// ─── Données : Hôtels partenaires ──────────────────────────────────────────
const HOTELS = [
  {
    region: "Europe",
    emoji: "🌍",
    desc: "Hôtels affaires & loisirs vérifiés à Paris, Bruxelles, Madrid.",
    standing: "3★ → 5★",
  },
  {
    region: "Maghreb & Afrique",
    emoji: "🌍",
    desc: "Riads à Marrakech, business hotels Casablanca, lodges Nairobi.",
    standing: "3★ → 5★",
  },
  {
    region: "Asie & Moyen-Orient",
    emoji: "🌏",
    desc: "Établissements Dubai, Doha, Bangkok, Mumbai sélectionnés.",
    standing: "3★ → 5★",
  },
] as const;

// ─── Composant ──────────────────────────────────────────────────────────────

export default function BilletsPage() {
  const t = useTranslations("ServiceBillets");

  const SCOPE_ITEMS = [
    { title: t("scope_item1_title"), desc: t("scope_item1_desc") },
    { title: t("scope_item2_title"), desc: t("scope_item2_desc") },
    { title: t("scope_item3_title"), desc: t("scope_item3_desc") },
    { title: t("scope_item4_title"), desc: t("scope_item4_desc") },
  ];

  const RESULT_ITEMS = [
    { title: t("result_item1_title"), desc: t("result_item1_desc") },
    { title: t("result_item2_title"), desc: t("result_item2_desc") },
    { title: t("result_item3_title"), desc: t("result_item3_desc") },
    { title: t("result_item4_title"), desc: t("result_item4_desc") },
  ];

  const POURQUI_OUI = [
    t("pourqui_oui_1"),
    t("pourqui_oui_2"),
    t("pourqui_oui_3"),
  ];
  const POURQUI_NON = [
    t("pourqui_non_1"),
    t("pourqui_non_2"),
    t("pourqui_non_3"),
  ];

  const ENGAGEMENT_NO = [
    t("engagement_no_1"),
    t("engagement_no_2"),
    t("engagement_no_3"),
  ];
  const ENGAGEMENT_YES = [
    t("engagement_yes_1"),
    t("engagement_yes_2"),
    t("engagement_yes_3"),
    t("engagement_yes_4"),
  ];

  const CAS = [
    {
      badge: t("cas_1_badge"),
      title: t("cas_1_title"),
      desc: t("cas_1_desc"),
      stats: [
        { label: "Trajet", value: "Bangui → Paris" },
        { label: "Format", value: "A-R + 4 nuits" },
        { label: "Hôtel", value: "Centre affaires" },
        { label: "Délai", value: "5 jours" },
      ],
    },
    {
      badge: t("cas_2_badge"),
      title: t("cas_2_title"),
      desc: t("cas_2_desc"),
      stats: [
        { label: "Trajet", value: "Bangui → Marrakech" },
        { label: "Voyageurs", value: "2 ad. + 2 enf." },
        { label: "Hôtel", value: "Riad central" },
        { label: "Durée", value: "8 nuits" },
      ],
    },
    {
      badge: "🏢 Mission ONG",
      title: "Bangui → Nairobi, équipe de 4",
      desc: "Mission terrain de 12 jours. Recherche multi-compagnies, hôtel proche bureaux régionaux, transferts coordonnés. Paiement consolidé en FCFA, dossier de voyage par participant.",
      stats: [
        { label: "Trajet", value: "Bangui → Nairobi" },
        { label: "Équipe", value: "4 voyageurs" },
        { label: "Format", value: "A-R + 11 nuits" },
        { label: "Suivi", value: "Pendant mission" },
      ],
    },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* 1. HERO Premium tech (préservé) ───────────────────────── */}
        <PublicHero
          eyebrow={t("hero_eyebrow")}
          titleStart={t("hero_title_before") + " "}
          accentWord={t("hero_title_highlight")}
          subtitle={t("hero_subtitle")}
          ctaPrimary={{
            href: "/services/billets/demarrer",
            label: t("hero_cta_primary"),
            icon: FileText,
          }}
          ctaSecondary={{
            href: "/rendez-vous?service=billets",
            label: t("hero_cta_secondary"),
            icon: Calendar,
          }}
        />

        {/* 2. FLIGHT SEARCH MOCK — signature unique ──────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Outil de recherche
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Composez votre vol{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    en quelques clics
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Indiquez votre projet de voyage. Nous vous reviendrons avec 2 à
                3 options réelles — compagnies, escales, prix exacts en FCFA.
              </p>
            </div>

            <FlightSearchMock />
          </div>
        </section>

        {/* 3. ROUTE MAP animée — signature unique ───────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Routes principales
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                De Bangui vers{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                    le monde
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Six destinations clés desservies depuis Bangui via les
                principales compagnies internationales. Autres routes possibles
                au cas par cas.
              </p>
            </div>

            {/* SVG flow map (desktop) + grille fallback (mobile) */}
            <div className="relative mx-auto h-[520px] w-full max-w-4xl sm:h-[560px]">
              {/* SVG lignes courbes + avions animés */}
              <svg
                aria-hidden
                viewBox="0 0 800 500"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient
                    id="routeGradOrange"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(255,102,0,0.65)" />
                    <stop offset="100%" stopColor="rgba(255,102,0,0.10)" />
                  </linearGradient>
                  <linearGradient
                    id="routeGradBlue"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(96,138,255,0.55)" />
                    <stop offset="100%" stopColor="rgba(96,138,255,0.10)" />
                  </linearGradient>
                  <radialGradient id="routeCoreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255,102,0,0.30)" />
                    <stop offset="100%" stopColor="rgba(255,102,0,0)" />
                  </radialGradient>
                </defs>

                {/* halo central */}
                <circle cx="400" cy="250" r="140" fill="url(#routeCoreGlow)" />

                {/* Courbes Bezier vers chaque node + avion animé */}
                {ROUTE_NODES.map((n, i) => {
                  const path = bezierPath(n);
                  const isOrange = i % 2 === 0;
                  return (
                    <g key={n.id}>
                      <path
                        id={`route-${n.id}`}
                        d={path}
                        fill="none"
                        stroke={
                          isOrange
                            ? "url(#routeGradOrange)"
                            : "url(#routeGradBlue)"
                        }
                        strokeWidth={1.5}
                        strokeDasharray="6 6"
                        strokeLinecap="round"
                        style={{
                          animation: `dashflow ${n.dur} linear infinite`,
                        }}
                      />
                      {/* Avion qui suit la courbe */}
                      <g
                        fill={isOrange ? "#FF6600" : "#608aff"}
                        opacity="0.95"
                      >
                        <text
                          fontSize="18"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          ✈️
                          <animateMotion
                            dur={n.dur}
                            repeatCount="indefinite"
                            rotate="auto"
                            path={path}
                          />
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Center node BANGUI RCA */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-3xl bg-nexus-orange-500/40 blur-2xl"
                  />
                  <div className="relative rounded-3xl border border-nexus-orange-400/50 bg-gradient-to-br from-nexus-orange-500/20 via-white/[0.06] to-white/[0.02] px-5 py-4 ring-1 ring-orange-400/30 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_24px_48px_-16px_rgba(255,102,0,0.40)] sm:px-7 sm:py-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          aria-hidden
                          className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
                        />
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
                          <span className="text-2xl">🇨🇫</span>
                        </div>
                        <span className="absolute -right-1 -top-1 flex h-3 w-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-nexus-orange-400" />
                        </span>
                      </div>
                      <div>
                        <p className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text font-display text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                          Hub principal
                        </p>
                        <p className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                          Bangui M&apos;Poko
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination nodes pills */}
              {ROUTE_NODES.map((n) => (
                <div
                  key={n.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <div className="group relative flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 ring-1 ring-white/5 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.10]">
                    <span className="text-base leading-none">{n.flag}</span>
                    <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-white">
                      {n.label}
                    </span>
                    <span aria-hidden className="text-xs">
                      ✈️
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-2xl text-center text-xs text-white/60">
              Liste indicative des principales destinations. Autres villes
              accessibles via correspondance — étudiées au cas par cas.
            </div>
          </div>
        </section>

        {/* 4. COMPAGNIES bento — signature unique ──────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Compagnies aériennes
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                Un réseau{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    multi-compagnies
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                pertinent.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Comparaison sur les compagnies réellement disponibles depuis
                Bangui. Transparence sur escales, durée, conditions.
              </p>
            </div>

            {/* Mobile : scroll-snap */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {[AIRLINES_MASTER, ...AIRLINES_SMALL].map((a) => (
                  <article
                    key={a.id}
                    className="relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                      <Plane className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold leading-tight text-white">
                      {a.name} <span className="text-base">{a.emoji}</span>
                    </h3>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                      Hub · {a.hub}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-200">
                      {a.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* Desktop : bento varié */}
            <div className="hidden sm:grid sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {/* Master card 2x large */}
              <article className="group relative overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/15 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/60 sm:col-span-3 sm:row-span-2 sm:p-9 lg:col-span-2 lg:row-span-2">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-nexus-orange-500/25 blur-[100px] transition-all duration-500 group-hover:bg-nexus-orange-500/35"
                />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
                      />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
                        <Plane className="h-8 w-8" />
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-nexus-orange-400/40 bg-nexus-orange-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                        <Star className="h-2.5 w-2.5" />
                        Partenaire principal
                      </span>
                      <h3 className="mt-1.5 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                        {AIRLINES_MASTER.name}{" "}
                        <span className="text-2xl">
                          {AIRLINES_MASTER.emoji}
                        </span>
                      </h3>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                    Hub · {AIRLINES_MASTER.hub}
                  </p>
                  <p className="mt-5 text-base leading-relaxed text-slate-200">
                    {AIRLINES_MASTER.desc}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[
                      { label: "Alliance", value: "Skyteam" },
                      { label: "Bagages", value: "23 kg eco" },
                      { label: "Programme", value: "Flying Blue" },
                      { label: "Connexion", value: "via CDG/AMS" },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur"
                      >
                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexus-orange-300">
                          {s.label}
                        </p>
                        <p className="mt-1 font-display text-xs font-bold leading-tight text-white">
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              {/* 5 small cards */}
              {AIRLINES_SMALL.map((a) => (
                <article
                  key={a.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                  />
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
                      <Plane className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold leading-tight text-white">
                      {a.name} <span className="text-base">{a.emoji}</span>
                    </h3>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                      Hub · {a.hub}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-200">
                      {a.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. INTRO COURTE éditoriale ──────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-16 text-white sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/8 blur-[120px]"
          />

          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <p className="font-display text-2xl font-bold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
              {t("intro_before")}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  {t("intro_highlight")}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                />
              </span>
              {t("intro_after")}
            </p>
          </div>
        </section>

        {/* 6. CE QUE NOUS FAISONS — navy + cards glass ─────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start lg:gap-16">
              <div>
                <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                  {t("scope_eyebrow")}
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                  {t("scope_title")}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {t("scope_subtitle")}
                </p>
              </div>

              <ul className="space-y-4">
                {SCOPE_ITEMS.map((item, i) => (
                  <li
                    key={i}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/20"
                    />
                    <div className="relative flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
                        <span className="font-display text-xs font-bold tabular-nums">
                          0{i + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold leading-tight text-white sm:text-lg">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-200">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 7. CE QUE VOUS OBTENEZ — navy + scroll-snap mobile ─── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-32 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("result_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {t("result_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {t("result_subtitle")}
              </p>
            </div>

            {/* Desktop : grid 4 col */}
            <div className="hidden sm:grid sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {RESULT_ITEMS.map((item, i) => (
                <article
                  key={i}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] sm:p-7"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                  />
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold leading-tight text-white sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">
                      {item.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Mobile : scroll-snap horizontal */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {RESULT_ITEMS.map((item, i) => (
                  <article
                    key={i}
                    className="relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-base font-bold leading-tight text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">
                      {item.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. POUR QUI — navy split emerald/rose ───────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-emerald-500/12 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/3 h-[32rem] w-[32rem] rounded-full bg-rose-500/12 blur-[140px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("pourqui_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("pourqui_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                {t("pourqui_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-emerald-400/20 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-emerald-400/40 hover:bg-white/[0.06] sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-[100px] transition-all duration-500 group-hover:bg-emerald-500/25"
                />
                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30 backdrop-blur transition-transform duration-300 ease-out group-hover:scale-105">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                      {t("pourqui_oui_title")}
                    </h3>
                  </div>
                  <ul className="space-y-3.5">
                    {POURQUI_OUI.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-slate-200"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-rose-400/20 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-rose-400/40 hover:bg-white/[0.06] sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-500/10 blur-[100px] transition-all duration-500 group-hover:bg-rose-500/25"
                />
                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30 backdrop-blur transition-transform duration-300 ease-out group-hover:scale-105">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                      {t("pourqui_non_title")}
                    </h3>
                  </div>
                  <ul className="space-y-3.5">
                    {POURQUI_NON.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-slate-200"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 9. MÉTHODOLOGIE timeline numéros 7xl gradient orange ─── */}
        <section
          id="methodologie"
          className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-32 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-32 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("metho_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("metho_title_before")}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    {t("metho_title_highlight")}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                {t("metho_title_after")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {t("metho_subtitle")}
              </p>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute left-8 top-4 bottom-4 w-px bg-gradient-to-b from-nexus-orange-500/40 via-nexus-orange-500/20 to-transparent sm:left-[3.75rem]"
              />

              <div className="space-y-7">
                {METHODOLOGIE.map((etape) => {
                  const Icon = etape.icon;
                  return (
                    <div
                      key={etape.num}
                      className="group relative grid grid-cols-[4rem_1fr] gap-5 sm:grid-cols-[7.5rem_1fr] sm:gap-7"
                    >
                      <div className="relative flex justify-center sm:justify-start">
                        <div className="relative">
                          <div
                            aria-hidden
                            className="absolute inset-0 rounded-3xl bg-nexus-orange-500/40 blur-md transition-all duration-500 group-hover:bg-nexus-orange-500/60"
                          />
                          <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-nexus-orange-400/30 bg-nexus-blue-900/60 backdrop-blur-md font-display text-5xl font-bold tabular-nums shadow-[0_10px_28px_-10px_rgba(255,102,0,0.4)] sm:h-[7.5rem] sm:w-[7.5rem] sm:text-7xl">
                            <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                              {etape.num}
                            </span>
                          </span>
                        </div>
                      </div>

                      <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-nexus-orange-400/40 group-hover:bg-white/[0.06] sm:p-7">
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                        />
                        <div className="relative">
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-nexus-orange-300" />
                            <h3 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
                              {t(`${etape.key}_title`)}
                            </h3>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
                            {t(`${etape.key}_desc`)}
                          </p>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA milieu glass orange */}
            <div className="mt-12 overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                    {t("metho_cta_eyebrow")}
                  </span>
                  <p className="mt-3 font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                    {t("metho_cta_title")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {t("metho_cta_subtitle")}
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/billets/demarrer"
                    className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                    />
                    <FileText className="h-4 w-4" />
                    {t("metho_cta_primary")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=billets"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
                  >
                    <Calendar className="h-4 w-4" />
                    {t("metho_cta_secondary")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. HÔTELS PARTENAIRES cards glass ──────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 bottom-1/4 h-96 w-96 rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <div className="relative mx-auto mb-4 inline-flex">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
                />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-8px_rgba(255,102,0,0.55)] ring-1 ring-white/10">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                Hôtels partenaires
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Des établissements{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    vérifiés
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>{" "}
                par région.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
                Sélection sur plateformes reconnues, vérification des notes,
                proximité points d&apos;intérêt, sécurité du quartier.
              </p>
            </div>

            {/* Mobile : scroll-snap */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {HOTELS.map((h) => (
                  <article
                    key={h.region}
                    className="relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{h.emoji}</span>
                      <div>
                        <h3 className="font-display text-base font-bold leading-tight text-white">
                          {h.region}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                          <Star className="h-2.5 w-2.5" />
                          {h.standing}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-200">
                      {h.desc}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* Desktop : grid 3 cols */}
            <div className="hidden sm:grid sm:grid-cols-3 sm:gap-5">
              {HOTELS.map((h) => (
                <article
                  key={h.region}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                  />
                  <div className="relative">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl transition-transform duration-300 ease-out group-hover:scale-110">
                        {h.emoji}
                      </span>
                      <div>
                        <h3 className="font-display text-base font-bold leading-tight text-white sm:text-lg">
                          {h.region}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                          <Star className="h-2.5 w-2.5" />
                          Standing {h.standing}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-200">
                      {h.desc}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Encart "prestations" — 3 cards */}
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {PRESTATIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.key}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22"
                    />
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-display text-base font-bold leading-tight text-white sm:text-lg">
                        {t(`${item.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {t(`${item.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 11. CAS TYPES — 3 cards tech case study ─────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-[32rem] w-[32rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("cas_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("cas_title")}
              </h2>
            </div>

            {/* Mobile + tablet : scroll-snap */}
            <div className="xl:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-1 pb-4 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0">
                {CAS.map((cas, idx) => (
                  <article
                    key={idx}
                    className="group relative w-[85vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] sm:w-auto sm:p-7"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-nexus-orange-500/10 blur-[80px] transition-all duration-500 group-hover:bg-nexus-orange-500/25"
                    />
                    <div className="relative flex h-full flex-col">
                      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-nexus-orange-400/40 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                        <Sparkles className="h-3 w-3" />
                        {cas.badge}
                      </span>
                      <h3 className="mt-4 font-display text-lg font-bold leading-tight text-white">
                        {cas.title}
                      </h3>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        {cas.stats.map((s) => (
                          <div
                            key={s.label}
                            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur"
                          >
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexus-orange-300">
                              {s.label}
                            </p>
                            <p className="mt-1 font-display text-xs font-bold leading-tight text-white">
                              {s.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <p className="mt-5 text-sm leading-relaxed text-slate-200">
                        {cas.desc}
                      </p>

                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.18em] text-transparent">
                          Approche méthodologique
                        </span>
                        <ArrowRight className="h-4 w-4 text-nexus-orange-300 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="hidden xl:grid xl:grid-cols-3 xl:gap-5">
              {CAS.map((cas, idx) => (
                <article
                  key={idx}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/10 blur-[100px] transition-all duration-500 group-hover:bg-nexus-orange-500/30"
                  />
                  <div className="relative flex h-full flex-col">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-nexus-orange-400/40 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300 backdrop-blur">
                      <Sparkles className="h-3 w-3" />
                      {cas.badge}
                    </span>
                    <h3 className="mt-4 font-display text-xl font-bold leading-tight text-white">
                      {cas.title}
                    </h3>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {cas.stats.map((s) => (
                        <div
                          key={s.label}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur transition-all duration-300 group-hover:border-nexus-orange-400/30"
                        >
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-nexus-orange-300">
                            {s.label}
                          </p>
                          <p className="mt-1 font-display text-xs font-bold leading-tight text-white">
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <p className="mt-5 text-sm leading-relaxed text-slate-200">
                      {cas.desc}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
                      <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.18em] text-transparent">
                        Approche méthodologique
                      </span>
                      <ArrowRight className="h-4 w-4 text-nexus-orange-300 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 12. ENGAGEMENT TRANSPARENCE — asymétrique 1+2 col ──── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 bottom-1/3 h-96 w-96 rounded-full bg-rose-500/10 blur-[140px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("engagement_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("engagement_title_before")}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                    {t("engagement_title_highlight")}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                  />
                </span>
                {t("engagement_title_after")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {t("engagement_subtitle")}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-rose-400/20 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-rose-400/40 hover:bg-white/[0.06]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-rose-500/10 blur-[80px] transition-all duration-500 group-hover:bg-rose-500/25"
                />
                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30 backdrop-blur">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-rose-300">
                    {t("engagement_no_title")}
                  </span>
                  <ul className="mt-4 space-y-3">
                    {ENGAGEMENT_NO.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-slate-200"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-nexus-orange-400/60 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_30px_60px_-16px_rgba(255,102,0,0.40)] sm:p-9 lg:col-span-2">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/25 blur-[100px] transition-all duration-500 group-hover:bg-nexus-orange-500/40"
                />
                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
                      />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                    </div>
                    <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                      {t("engagement_yes_title")}
                    </span>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {ENGAGEMENT_YES.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-slate-200 sm:text-base"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 13. CADRE TARIFAIRE — 3 cards glass ─────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[140px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
                {t("tarif_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {t("tarif_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300">
                {t("tarif_subtitle")}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {TARIFS.map((tarif) => {
                const Icon = tarif.icon;
                const isHi = "highlight" in tarif && tarif.highlight;
                return (
                  <article
                    key={tarif.key}
                    className={`group relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 sm:p-7 ${
                      isHi
                        ? "border-nexus-orange-400/40 bg-gradient-to-br from-nexus-orange-500/15 via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] hover:border-nexus-orange-400/60"
                        : "border-white/10 bg-white/[0.04] ring-1 ring-white/5 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full ${
                        isHi
                          ? "bg-nexus-orange-500/20"
                          : "bg-nexus-orange-500/0"
                      } blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/25`}
                    />
                    <div className="relative">
                      <div
                        className={`flex items-center justify-center rounded-2xl text-white shadow-sm ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105 ${
                          isHi
                            ? "h-14 w-14 bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)]"
                            : "h-11 w-11 bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900"
                        }`}
                      >
                        <Icon className={isHi ? "h-7 w-7" : "h-5 w-5"} />
                      </div>
                      <h3 className="mt-5 font-display text-base font-bold leading-tight text-white sm:text-lg">
                        {t(`${tarif.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-200">
                        {t(`${tarif.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 13 bis. BANDE CTA — ASSURANCE VOYAGE & MOBILITÉ ───────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-12 text-white sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-nexus-orange-500/15 blur-[100px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-nexus-orange-400/25 bg-gradient-to-br from-nexus-orange-500/8 via-white/[0.04] to-white/[0.02] ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.20)]">
              <div className="flex flex-col gap-6 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
                <div className="flex items-start gap-5 lg:items-center">
                  <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10 sm:flex">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                      Voyagez accompagné
                    </p>
                    <h3 className="mt-1.5 font-display text-xl font-bold leading-tight text-white sm:text-2xl lg:text-3xl">
                      Une{" "}
                      <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                        assurance voyage
                      </span>{" "}
                      à la hauteur de votre dossier.
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                      Médical, rapatriement, bagages, annulation : notre
                      cabinet de courtage sélectionne et accompagne votre
                      couverture sur l&rsquo;ensemble du séjour. Conforme aux
                      exigences consulaires Schengen.
                    </p>
                  </div>
                </div>

                <Link
                  href="/services/assurance"
                  className="group/cta relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-nexus-orange-400/40 bg-nexus-orange-500/10 px-6 py-3.5 text-sm font-bold text-nexus-orange-200 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/60 hover:bg-nexus-orange-500/15 hover:text-white"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                  />
                  Découvrir notre cabinet assurance
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 14. CTA FINAL — hero card premium navy ─────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-nexus-orange-500/20 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-nexus-blue-500/25 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/8 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
              </span>
              {t("cta_final_eyebrow")}
            </span>

            <h2 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("cta_final_title")}
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {t("cta_final_subtitle")}
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                <Compass className="mx-auto mb-1 h-4 w-4 text-nexus-orange-300" />
                {t("cta_final_chip1")}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                <Calendar className="mx-auto mb-1 h-4 w-4 text-nexus-orange-300" />
                {t("cta_final_chip2")}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                <Wallet className="mx-auto mb-1 h-4 w-4 text-nexus-orange-300" />
                {t("cta_final_chip3")}
              </div>
            </div>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a
                href={whatsappLink(t("cta_final_wa_msg"))}
                target="_blank"
                rel="noreferrer"
                className="group/wa relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/wa:left-[120%] group-hover/wa:opacity-100"
                />
                <MessageCircle className="h-4 w-4" />
                {t("cta_final_wa")}
              </a>
              <Link
                href="/rendez-vous?service=billets"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" />
                {t("cta_final_rdv")}
              </Link>
            </div>

            {/* Tagline éditoriale */}
            <div className="relative mx-auto mt-14 max-w-2xl">
              <p className="font-display text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
                Devis +{" "}
                <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  réservation
                </span>{" "}
                + suivi avant et pendant le voyage.
              </p>
            </div>

            {/* 3 trust signals */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/60">
              <span className="flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5 text-nexus-orange-300" />
                {t("cta_final_foot1")}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-nexus-orange-300" />
                {t("cta_final_foot2")}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                {t("cta_final_foot3")}
              </span>
            </div>

            {/* Adresse de précision */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 backdrop-blur">
              <MapPin className="h-3 w-3 text-nexus-orange-300" />
              Bangui, République Centrafricaine
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
