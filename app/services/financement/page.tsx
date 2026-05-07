import Link from "next/link";
import { useTranslations } from "next-intl";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import {
  Handshake,
  Network,
  TrendingUp,
  Target,
  Briefcase,
  Coins,
  CircleDollarSign,
  Building2,
  ShoppingBag,
  Sprout,
  Rocket,
  Users,
  ShieldCheck,
  FileSignature,
  ClipboardList,
  Eye,
  Activity,
  Search,
  XCircle,
  CheckCircle2,
  FilePlus,
  Calendar,
  MessageCircle,
  FileText,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  Compass,
} from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "Incubateur & Financement en partenariat | Nexus RCA — Bangui",
  description:
    "Partenaire de croissance qui investit capital ET méthode dans des projets sélectionnés. Pas une banque, pas une microfinance, pas une ONG : un incubateur stratégique pour entrepreneurs, PME et porteurs de projets en RCA.",
};

// ─── Patterns dot grid ──────────────────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};
const DOT_GRID_LIGHT: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.05) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};
const DOT_GRID_LIGHT_SUBTLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.04) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};

// ─── Données : icônes + clés de traduction ─────────────────────────────────

const NEXUS_NEST_PAS = [
  { icon: XCircle, key: "nepas_1" },
  { icon: XCircle, key: "nepas_2" },
  { icon: XCircle, key: "nepas_3" },
  { icon: XCircle, key: "nepas_4" },
] as const;

const MODELE = [
  {
    icon: Handshake,
    iconBg: "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700",
    key: "modele_1",
  },
  {
    icon: Network,
    iconBg: "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900",
    key: "modele_2",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700",
    key: "modele_3",
  },
  {
    icon: Users,
    iconBg: "bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900",
    key: "modele_4",
  },
  {
    icon: Target,
    iconBg: "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700",
    key: "modele_5",
  },
] as const;

const MODES = [
  { icon: Coins, key: "mode_1" },
  { icon: CircleDollarSign, key: "mode_2", highlight: true, badge: "100%" },
  { icon: ShoppingBag, key: "mode_3" },
  { icon: Sprout, key: "mode_4" },
  { icon: TrendingUp, key: "mode_5" },
  { icon: Building2, key: "mode_6", highlight: true },
] as const;

const INCUBATEUR_AUDIENCES = [
  { icon: Briefcase, key: "audience_1" },
  { icon: ShoppingBag, key: "audience_2" },
  { icon: Building2, key: "audience_3" },
  { icon: Rocket, key: "audience_4" },
  { icon: Users, key: "audience_5" },
  { icon: Network, key: "audience_6" },
] as const;

const APPORTS = [
  { icon: ClipboardList, key: "apport_1" },
  { icon: Target, key: "apport_2" },
  { icon: FileText, key: "apport_3" },
  { icon: Eye, key: "apport_4" },
  { icon: TrendingUp, key: "apport_5" },
  { icon: Network, key: "apport_6" },
  { icon: Activity, key: "apport_7" },
] as const;

const METHODOLOGIE = [
  { num: "01", icon: FileText, key: "metho_01" },
  { num: "02", icon: Search, key: "metho_02" },
  { num: "03", icon: FileSignature, key: "metho_03" },
  { num: "04", icon: Eye, key: "metho_04" },
] as const;

// ─── SVG mockups abstraits cas types ─────────────────────────────────────
function CaseGraphicNetwork() {
  return (
    <svg
      viewBox="0 0 320 240"
      className="h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="nexGradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6600" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0C1C40" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="nexGlowOrange" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6600" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="120" r="90" fill="url(#nexGlowOrange)" />
      <g stroke="url(#nexGradOrange)" strokeWidth="1.2" fill="none" opacity="0.85">
        <line x1="60" y1="60" x2="160" y2="120" />
        <line x1="260" y1="60" x2="160" y2="120" />
        <line x1="60" y1="180" x2="160" y2="120" />
        <line x1="260" y1="180" x2="160" y2="120" />
        <line x1="160" y1="40" x2="160" y2="120" />
        <line x1="160" y1="200" x2="160" y2="120" />
      </g>
      <g fill="#FF6600">
        <circle cx="160" cy="120" r="6" />
      </g>
      <g fill="#0C1C40" stroke="#FF6600" strokeWidth="1.2">
        <circle cx="60" cy="60" r="4" />
        <circle cx="260" cy="60" r="4" />
        <circle cx="60" cy="180" r="4" />
        <circle cx="260" cy="180" r="4" />
        <circle cx="160" cy="40" r="4" />
        <circle cx="160" cy="200" r="4" />
      </g>
    </svg>
  );
}

function CaseGraphicGrowth() {
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="nexGradLine" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0C1C40" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF6600" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="nexGlowBlue" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6600" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FF6600" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="220" cy="80" r="80" fill="url(#nexGlowBlue)" />
      {/* axes subtils */}
      <g stroke="rgba(12,28,64,0.10)" strokeWidth="1">
        <line x1="40" y1="200" x2="290" y2="200" />
        <line x1="40" y1="40" x2="40" y2="200" />
      </g>
      {/* path croissance */}
      <path
        d="M40 190 L90 175 L140 150 L190 110 L240 80 L290 50"
        stroke="url(#nexGradLine)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* dots */}
      <g fill="#FF6600">
        <circle cx="40" cy="190" r="3.5" />
        <circle cx="90" cy="175" r="3.5" />
        <circle cx="140" cy="150" r="3.5" />
        <circle cx="190" cy="110" r="3.5" />
        <circle cx="240" cy="80" r="3.5" />
        <circle cx="290" cy="50" r="5" />
      </g>
    </svg>
  );
}

// ─── Composant ──────────────────────────────────────────────────────────────

export default function FinancementPage() {
  const t = useTranslations("ServiceFinancement");

  const POURQUI_OUI = [
    t("pourqui_oui_1"),
    t("pourqui_oui_2"),
    t("pourqui_oui_3"),
    t("pourqui_oui_4"),
  ];
  const POURQUI_NON = [
    t("pourqui_non_1"),
    t("pourqui_non_2"),
    t("pourqui_non_3"),
    t("pourqui_non_4"),
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
      result: t("cas_1_result"),
    },
    {
      badge: t("cas_2_badge"),
      title: t("cas_2_title"),
      desc: t("cas_2_desc"),
      result: t("cas_2_result"),
    },
    {
      badge: t("cas_3_badge"),
      title: t("cas_3_title"),
      desc: t("cas_3_desc"),
      result: t("cas_3_result"),
    },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* 1. HERO via PublicHero ─────────────────────────────────────── */}
        <PublicHero
          eyebrow={t("hero_eyebrow")}
          titleStart={t("hero_title_start")}
          accentWord={t("hero_title_accent")}
          titleEnd={t("hero_title_end")}
          subtitle={t("hero_subtitle")}
          ctaPrimary={{
            href: "/services/financement/demarrer",
            label: t("hero_cta_primary"),
            icon: FilePlus,
          }}
          ctaSecondary={{
            href: whatsappLink(t("hero_wa_msg")),
            label: t("hero_cta_secondary"),
            icon: MessageCircle,
          }}
        />

        {/* 1.5 TRUST BANDEAU — bento asymétrique 1 grande + 2 petites ─── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-14 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-nexus-orange-500/8 blur-[110px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-nexus-blue-500/10 blur-[110px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Card master 2 col */}
              <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-7 ring-1 ring-slate-100/80 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)] sm:p-9 lg:col-span-2">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/10 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/20"
                />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
                  <div className="relative shrink-0">
                    <div
                      aria-hidden
                      className="absolute inset-0 rounded-3xl bg-nexus-orange-500/30 blur-md"
                    />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)]">
                      <BadgeCheck className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                      {t("trust_1_top")}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold leading-tight text-nexus-blue-950 sm:text-2xl">
                      {t("trust_1_bot")}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                      {t("nepas_subtitle")}
                    </p>
                  </div>
                </div>
              </article>

              {/* 2 petites cards stacked */}
              <div className="grid gap-5">
                <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 ring-1 ring-slate-100/80 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_18px_42px_-18px_rgba(255,102,0,0.20)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                  />
                  <div className="relative flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-sm">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold leading-tight text-nexus-blue-950">
                        {t("trust_2_top")}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        {t("trust_2_bot")}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 ring-1 ring-slate-100/80 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_18px_42px_-18px_rgba(255,102,0,0.20)]">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                  />
                  <div className="relative flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold leading-tight text-nexus-blue-950">
                        {t("trust_3_top")}
                      </p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        {t("trust_3_bot")}
                      </p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CE QUE NEXUS N'EST PAS — bento avec hero card ─────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-16 h-[28rem] w-[28rem] rounded-full bg-rose-400/10 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("nepas_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl lg:text-5xl">
                {t("nepas_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
                {t("nepas_subtitle")}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {/* HERO card 2 col */}
              {(() => {
                const first = NEXUS_NEST_PAS[0];
                const Icon = first.icon;
                return (
                  <article
                    key={first.key}
                    className="group relative overflow-hidden rounded-3xl border-2 border-rose-200/70 bg-white p-7 ring-1 ring-rose-100/60 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-300/80 hover:shadow-[0_22px_50px_-18px_rgba(244,63,94,0.28)] sm:p-9 lg:col-span-2 lg:row-span-2"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-400/0 blur-2xl transition-all duration-500 group-hover:bg-rose-400/22"
                    />
                    <div className="relative flex h-full flex-col gap-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 text-rose-600 ring-1 ring-rose-400/30 transition-transform duration-300 ease-out group-hover:scale-105">
                          <Icon className="h-7 w-7" />
                        </div>
                        <span className="rounded-full border border-rose-300/40 bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-700">
                          {t("nepas_eyebrow")}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-bold leading-tight text-nexus-blue-950 sm:text-3xl">
                        {t(`${first.key}_title`)}
                      </h3>
                      <p className="text-base leading-relaxed text-slate-600">
                        {t(`${first.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })()}

              {/* 3 petites cards */}
              {NEXUS_NEST_PAS.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.key}
                    className="group relative overflow-hidden rounded-3xl border-2 border-rose-200/60 bg-white p-6 ring-1 ring-rose-100/60 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-300/80 hover:shadow-[0_18px_42px_-18px_rgba(244,63,94,0.22)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-rose-400/0 blur-2xl transition-all duration-500 group-hover:bg-rose-400/16"
                    />
                    <div className="relative flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-400/30 transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                          {t(`${item.key}_title`)}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {t(`${item.key}_desc`)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. LE MODÈLE — bento asymétrique avec master card ──────── */}
        <section className="relative overflow-hidden bg-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("modele_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl lg:text-5xl">
                {t("modele_title_start")}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  {t("modele_title_accent")}
                </span>
                {t("modele_title_end")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
                {t("modele_subtitle")}
              </p>
            </div>

            {/* Mobile : scroll-snap */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {MODELE.map((item, i) => {
                  const Icon = item.icon;
                  const isMaster = i === 0;
                  return (
                    <article
                      key={item.key}
                      className={`group relative w-[78vw] shrink-0 snap-start overflow-hidden rounded-3xl border p-6 transition-all duration-300 ease-out ${
                        isMaster
                          ? "border-nexus-orange-200/60 bg-gradient-to-br from-nexus-orange-50/80 via-white to-nexus-blue-50/40 ring-1 ring-nexus-orange-200/40"
                          : "border-slate-200 bg-white ring-1 ring-slate-100/80"
                      }`}
                    >
                      <div
                        className={`flex ${isMaster ? "h-14 w-14" : "h-11 w-11"} items-center justify-center rounded-2xl text-white shadow-sm ${item.iconBg}`}
                      >
                        <Icon className={isMaster ? "h-7 w-7" : "h-5 w-5"} />
                      </div>
                      <h3
                        className={`mt-4 font-display font-bold leading-tight text-nexus-blue-950 ${
                          isMaster ? "text-xl" : "text-base"
                        }`}
                      >
                        {t(`${item.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {t(`${item.key}_desc`)}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Desktop : bento 4 col */}
            <div className="hidden sm:grid sm:grid-cols-4 sm:gap-5">
              {/* Master 2x2 */}
              {(() => {
                const m = MODELE[0];
                const Icon = m.icon;
                return (
                  <article
                    key={m.key}
                    className="group relative overflow-hidden rounded-3xl border border-nexus-orange-200/60 bg-gradient-to-br from-nexus-orange-50/80 via-white to-nexus-blue-50/40 p-7 ring-1 ring-nexus-orange-200/40 shadow-[0_18px_50px_-20px_rgba(255,102,0,0.24)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-20px_rgba(255,102,0,0.32)] sm:col-span-2 sm:row-span-2 sm:p-9"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-nexus-orange-500/15 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/25"
                    />
                    <div className="relative flex h-full flex-col">
                      <div className="relative">
                        <div
                          aria-hidden
                          className="absolute inset-0 rounded-3xl bg-nexus-orange-500/30 blur-md"
                        />
                        <div
                          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ${m.iconBg}`}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                      </div>
                      <h3 className="mt-6 font-display text-2xl font-bold leading-tight text-nexus-blue-950 lg:text-3xl">
                        {t(`${m.key}_title`)}
                      </h3>
                      <p className="mt-4 text-base leading-relaxed text-slate-600">
                        {t(`${m.key}_desc`)}
                      </p>
                      <div className="mt-auto pt-6">
                        <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-nexus-orange-600">
                          &laquo; Capital + m&eacute;thode &raquo;
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })()}

              {/* 4 cards autour */}
              {MODELE.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.key}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/40 hover:shadow-[0_18px_42px_-18px_rgba(255,102,0,0.20)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/12"
                    />
                    <div className="relative">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105 ${item.iconBg}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold leading-tight text-nexus-blue-950">
                        {t(`${item.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {t(`${item.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. 6 MODES D'ENGAGEMENT — magazine éditorial avec hero ─── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("modes_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl lg:text-5xl">
                {t("modes_title_start")}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  {t("modes_title_accent")}
                </span>
                {t("modes_title_end")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
                {t("modes_subtitle")}
              </p>
            </div>

            {/* Mobile : scroll-snap horizontal */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {MODES.map((item) => {
                  const Icon = item.icon;
                  const isHi = "highlight" in item && item.highlight;
                  return (
                    <article
                      key={item.key}
                      className={`group relative w-[80vw] shrink-0 snap-start overflow-hidden rounded-3xl border p-6 transition-all duration-300 ease-out ${
                        isHi
                          ? "border-nexus-orange-200/70 bg-gradient-to-br from-nexus-orange-50/60 via-white to-white ring-1 ring-nexus-orange-200/40"
                          : "border-slate-200 bg-white ring-1 ring-slate-100/80"
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                        {t(`${item.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {t(`${item.key}_desc`)}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Desktop : bento varié 6 cards */}
            <div className="hidden sm:grid sm:grid-cols-6 sm:gap-5">
              {MODES.map((item, i) => {
                const Icon = item.icon;
                const isHi = "highlight" in item && item.highlight;
                const badge = "badge" in item ? item.badge : undefined;
                // Spans : 0=2col, 1=2col tall(2x2), 2=2col, 3=3col wide, 4=3col with mockup, 5=2col
                let span = "";
                if (i === 0) span = "sm:col-span-2";
                else if (i === 1) span = "sm:col-span-2 sm:row-span-2"; // hero
                else if (i === 2) span = "sm:col-span-2";
                else if (i === 3) span = "sm:col-span-3"; // wide
                else if (i === 4) span = "sm:col-span-3"; // wide w/ mockup
                else if (i === 5) span = "sm:col-span-2"; // tall

                return (
                  <article
                    key={item.key}
                    className={`group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 sm:p-7 ${span} ${
                      isHi
                        ? "border-nexus-orange-200/70 bg-gradient-to-br from-nexus-orange-50/70 via-white to-white ring-1 ring-nexus-orange-200/40 shadow-[0_18px_42px_-18px_rgba(255,102,0,0.22)] hover:shadow-[0_28px_56px_-18px_rgba(255,102,0,0.32)]"
                        : "border-slate-200 bg-white ring-1 ring-slate-100/80 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${isHi ? "bg-nexus-orange-500/15" : "bg-nexus-orange-500/0"} blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22`}
                    />
                    {i === 4 && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute right-4 top-4 h-24 w-32 opacity-60"
                      >
                        <CaseGraphicGrowth />
                      </div>
                    )}
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105 ${
                            isHi
                              ? "h-14 w-14 bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700"
                              : "h-12 w-12 bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 group-hover:from-nexus-orange-500 group-hover:to-nexus-orange-700"
                          }`}
                        >
                          <Icon className={isHi ? "h-7 w-7" : "h-5 w-5"} />
                        </div>
                        {badge && (
                          <span className="rounded-full border border-nexus-orange-200/70 bg-nexus-orange-50 px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.16em] text-nexus-orange-700">
                            {badge}
                          </span>
                        )}
                      </div>
                      <h3
                        className={`mt-4 font-display font-bold leading-tight text-nexus-blue-950 ${
                          isHi ? "text-lg sm:text-xl" : "text-base sm:text-lg"
                        }`}
                      >
                        {t(`${item.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {t(`${item.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. INCUBATEUR NEXUS — navy avec timeline 7 apports ────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/15 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                {t("incub_eyebrow")}
              </span>
              <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {t("incub_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {t("incub_subtitle")}
              </p>
            </div>

            {/* Mobile : scroll-snap audiences */}
            <div className="sm:hidden">
              <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4">
                {INCUBATEUR_AUDIENCES.map((item, i) => {
                  const Icon = item.icon;
                  const isMaster = i === 0;
                  return (
                    <article
                      key={item.key}
                      className={`group relative w-[78vw] shrink-0 snap-start overflow-hidden rounded-3xl border p-6 backdrop-blur-xl ${
                        isMaster
                          ? "border-nexus-orange-400/30 bg-white/[0.07] ring-1 ring-nexus-orange-400/10"
                          : "border-white/10 bg-white/[0.04] ring-1 ring-white/5"
                      }`}
                    >
                      <div className={`flex ${isMaster ? "h-14 w-14" : "h-11 w-11"} items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)]`}>
                        <Icon className={isMaster ? "h-7 w-7" : "h-5 w-5"} />
                      </div>
                      <h3 className={`mt-4 font-display font-bold leading-tight text-white ${isMaster ? "text-lg" : "text-base"}`}>
                        {t(`${item.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {t(`${item.key}_desc`)}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Desktop : bento avec master */}
            <div className="hidden sm:grid sm:grid-cols-3 sm:gap-5">
              {INCUBATEUR_AUDIENCES.map((item, i) => {
                const Icon = item.icon;
                const isMaster = i === 0;
                return (
                  <article
                    key={item.key}
                    className={`group relative overflow-hidden rounded-3xl border backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 ${
                      isMaster
                        ? "border-nexus-orange-400/30 bg-white/[0.07] p-7 ring-1 ring-nexus-orange-400/10 sm:col-span-2 sm:row-span-1 sm:p-9"
                        : "border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 hover:border-nexus-orange-400/30 hover:bg-white/[0.07]"
                    }`}
                  >
                    <div
                      aria-hidden
                      className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${isMaster ? "bg-nexus-orange-500/15" : "bg-nexus-orange-500/0"} blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/22`}
                    />
                    <div className="relative">
                      <div
                        className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105 ${
                          isMaster ? "h-14 w-14" : "h-11 w-11"
                        }`}
                      >
                        <Icon className={isMaster ? "h-7 w-7" : "h-5 w-5"} />
                      </div>
                      <h3
                        className={`mt-4 font-display font-bold leading-tight text-white ${
                          isMaster ? "text-xl sm:text-2xl" : "text-base"
                        }`}
                      >
                        {t(`${item.key}_title`)}
                      </h3>
                      <p
                        className={`mt-3 leading-relaxed text-slate-300 ${
                          isMaster ? "text-base" : "text-sm"
                        }`}
                      >
                        {t(`${item.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Sept apports en timeline visuelle */}
            <div className="mt-20">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <h3 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                  {t("apports_title")}
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  {t("apports_subtitle")}
                </p>
              </div>

              {/* Desktop : timeline horizontale */}
              <div className="relative hidden lg:block">
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-0 right-0 top-7 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/50 to-transparent"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-0 right-0 top-7 h-[2px] bg-gradient-to-r from-transparent via-nexus-orange-500/30 to-transparent blur-sm"
                />
                <div className="relative grid grid-cols-7 gap-3">
                  {APPORTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.key}
                        className="group flex flex-col items-center gap-3"
                      >
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-nexus-blue-900/80 text-nexus-orange-300 ring-1 ring-nexus-orange-400/20 backdrop-blur-md transition-all duration-300 ease-out group-hover:scale-110 group-hover:border-nexus-orange-400/40 group-hover:bg-nexus-blue-800/80">
                          <div
                            aria-hidden
                            className="absolute inset-0 rounded-2xl bg-nexus-orange-500/20 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
                          />
                          <Icon className="relative h-5 w-5" />
                        </div>
                        <p className="text-center text-[11px] font-bold uppercase leading-tight tracking-[0.08em] text-white">
                          {t(`${item.key}_label`)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile : timeline verticale */}
              <div className="relative lg:hidden">
                <div
                  aria-hidden
                  className="pointer-events-none absolute left-7 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-nexus-orange-500/50 to-transparent"
                />
                <div className="relative space-y-4">
                  {APPORTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.key}
                        className="group flex items-center gap-4"
                      >
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-nexus-blue-900/80 text-nexus-orange-300 ring-1 ring-nexus-orange-400/20 backdrop-blur-md">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-[0.08em] text-white">
                          {t(`${item.key}_label`)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. MÉTHODOLOGIE — timeline éditoriale verticale ──────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-20 sm:py-24 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-32 h-96 w-96 rounded-full bg-nexus-blue-500/8 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 bottom-32 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[100px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("metho_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl lg:text-5xl">
                {t("metho_title_start")}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  {t("metho_title_accent")}
                </span>
                {t("metho_title_end")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                {t("metho_subtitle")}
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute left-8 top-4 bottom-4 w-px bg-gradient-to-b from-nexus-orange-500/0 via-nexus-orange-500/50 to-nexus-orange-500/0 sm:left-[3.75rem]"
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
                            className="absolute inset-0 rounded-3xl bg-nexus-orange-500/30 blur-md transition-all duration-500 group-hover:bg-nexus-orange-500/50"
                          />
                          <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-nexus-orange-200/70 bg-white font-display text-3xl font-bold tabular-nums text-nexus-orange-600 shadow-[0_10px_28px_-10px_rgba(255,102,0,0.4)] sm:h-[7.5rem] sm:w-[7.5rem] sm:text-6xl">
                            {etape.num}
                          </span>
                        </div>
                      </div>

                      <article className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 ring-1 ring-slate-100/80 transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:border-nexus-orange-300/60 group-hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)] sm:p-7">
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                        />
                        <div className="relative">
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-nexus-orange-600" />
                            <h3 className="font-display text-lg font-bold leading-tight text-nexus-blue-950 sm:text-xl">
                              {t(`${etape.key}_title`)}
                            </h3>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                            {t(`${etape.key}_desc`)}
                          </p>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA milieu */}
            <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-nexus-orange-50/30 p-7 shadow-[0_20px_50px_-20px_rgba(255,102,0,0.20)] ring-1 ring-slate-100/80 sm:p-8">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                    {t("metho_cta_eyebrow")}
                  </span>
                  <p className="mt-3 font-display text-xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-2xl">
                    {t("metho_cta_title")}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {t("metho_cta_subtitle")}
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:gap-3">
                  <Link
                    href="/services/financement/demarrer"
                    className="group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
                  >
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/btn:left-[120%] group-hover/btn:opacity-100"
                    />
                    <FilePlus className="h-4 w-4" />
                    {t("metho_cta_primary")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/rendez-vous?service=financement"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-nexus-blue-950 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-nexus-orange-300/70 hover:bg-slate-50"
                  >
                    <Calendar className="h-4 w-4" />
                    {t("metho_cta_secondary")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CRITÈRES DE SÉLECTION — split asymétrique 50/50 ──── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("pourqui_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl lg:text-5xl">
                {t("pourqui_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
                {t("pourqui_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border-2 border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(16,185,129,0.18)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-300/80 hover:shadow-[0_24px_56px_-18px_rgba(16,185,129,0.32)] sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/0 blur-2xl transition-all duration-500 group-hover:bg-emerald-400/22"
                />
                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                        {t("pourqui_eyebrow")}
                      </span>
                      <h3 className="font-display text-lg font-bold leading-tight text-nexus-blue-950 sm:text-xl">
                        {t("pourqui_oui_label")}
                      </h3>
                    </div>
                  </div>
                  <ul className="space-y-3.5">
                    {POURQUI_OUI.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950 sm:text-base"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border-2 border-rose-200/70 bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(244,63,94,0.16)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-300/80 hover:shadow-[0_24px_56px_-18px_rgba(244,63,94,0.30)] sm:p-9">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-400/0 blur-2xl transition-all duration-500 group-hover:bg-rose-400/20"
                />
                <div className="relative">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-rose-700">
                        {t("pourqui_eyebrow")}
                      </span>
                      <h3 className="font-display text-lg font-bold leading-tight text-nexus-blue-950 sm:text-xl">
                        {t("pourqui_non_label")}
                      </h3>
                    </div>
                  </div>
                  <ul className="space-y-3.5">
                    {POURQUI_NON.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950 sm:text-base"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 8. CAS TYPES — magazine éditorial alterné navy/white ── */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-24">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("cas_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl lg:text-5xl">
                {t("cas_title_start")}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  {t("cas_title_accent")}
                </span>
                {t("cas_title_end")}
              </h2>
            </div>
          </div>

          {/* Mobile : scroll-snap */}
          <div className="sm:hidden">
            <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-12">
              {CAS.map((cas) => (
                <article
                  key={cas.title}
                  className="group relative w-[80vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 ring-1 ring-slate-100/80"
                >
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-nexus-orange-200/70 bg-nexus-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-700">
                    {cas.badge}
                  </div>
                  <h3 className="font-display text-lg font-bold leading-tight text-nexus-blue-950">
                    {cas.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {cas.desc}
                  </p>
                  <p className="mt-4 text-sm font-bold leading-relaxed text-nexus-orange-700">
                    {cas.result}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Desktop : magazine alterné */}
          <div className="hidden sm:block">
            {/* Cas 1 — navy + horizontal mockup-left */}
            <div className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-16 text-white lg:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.4]"
                style={DOT_GRID_DARK}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -left-32 top-12 h-96 w-96 rounded-full bg-nexus-orange-500/12 blur-[120px]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
              />
              <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
                <div className="grid items-center gap-10 lg:grid-cols-5">
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl ring-1 ring-white/5 lg:col-span-2">
                    <div className="aspect-[4/3] w-full">
                      <CaseGraphicNetwork />
                    </div>
                  </div>
                  <div className="lg:col-span-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-300/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-300 backdrop-blur-md">
                      <Sparkles className="h-3 w-3" />
                      {CAS[0].badge}
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                      {CAS[0].title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                      {CAS[0].desc}
                    </p>
                    <p className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-nexus-orange-400/30 bg-white/5 px-4 py-2.5 font-display text-sm font-bold text-nexus-orange-300 backdrop-blur-md sm:text-base">
                      <ArrowRight className="h-4 w-4" />
                      {CAS[0].result}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cas 2 — white + quote géante centrée */}
            <div className="relative overflow-hidden bg-slate-50 py-16 lg:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-50"
                style={DOT_GRID_LIGHT}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-32 top-12 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[120px]"
              />
              <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-200/70 bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-700 shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  {CAS[1].badge}
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold leading-tight text-nexus-blue-950 sm:text-3xl lg:text-4xl">
                  {CAS[1].title}
                </h3>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  {CAS[1].desc}
                </p>
                <div className="relative mx-auto mt-10 max-w-3xl">
                  <span
                    aria-hidden
                    className="absolute -left-4 -top-6 font-display text-7xl font-bold leading-none text-nexus-orange-500/20 sm:-left-8 sm:-top-10 sm:text-9xl"
                  >
                    &ldquo;
                  </span>
                  <p className="relative font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl lg:text-3xl">
                    <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                      {CAS[1].result}
                    </span>
                  </p>
                  <span
                    aria-hidden
                    className="absolute -bottom-12 -right-4 font-display text-7xl font-bold leading-none text-nexus-orange-500/20 sm:-bottom-16 sm:-right-8 sm:text-9xl"
                  >
                    &rdquo;
                  </span>
                </div>
              </div>
            </div>

            {/* Cas 3 — navy inversé : texte gauche, mockup droite */}
            <div className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-16 text-white lg:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.4]"
                style={DOT_GRID_DARK}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -right-32 top-12 h-96 w-96 rounded-full bg-nexus-orange-500/12 blur-[120px]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
              />
              <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
                <div className="grid items-center gap-10 lg:grid-cols-5">
                  <div className="lg:col-span-3 lg:order-1">
                    <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-300/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-300 backdrop-blur-md">
                      <Sparkles className="h-3 w-3" />
                      {CAS[2].badge}
                    </span>
                    <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                      {CAS[2].title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
                      {CAS[2].desc}
                    </p>
                    <p className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-nexus-orange-400/30 bg-white/5 px-4 py-2.5 font-display text-sm font-bold text-nexus-orange-300 backdrop-blur-md sm:text-base">
                      <ArrowRight className="h-4 w-4" />
                      {CAS[2].result}
                    </p>
                  </div>
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl ring-1 ring-white/5 lg:col-span-2 lg:order-2">
                    <div className="aspect-[4/3] w-full">
                      <CaseGraphicGrowth />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. ENGAGEMENT TRANSPARENCE — asymétrique 1col + 2col ─── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[120px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("engagement_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl lg:text-5xl">
                {t("engagement_title_start")}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  {t("engagement_title_accent")}
                </span>
                {t("engagement_title_end")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                {t("engagement_subtitle")}
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {/* "Ce que nous ne pouvons pas" — 1 col */}
              <article className="group relative overflow-hidden rounded-3xl border-2 border-rose-200/70 bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(244,63,94,0.16)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-300/80">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-rose-400/0 blur-2xl transition-all duration-500 group-hover:bg-rose-400/18"
                />
                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-rose-700">
                    {t("engagement_no_label")}
                  </span>
                  <ul className="mt-4 space-y-3">
                    {ENGAGEMENT_NO.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950"
                      >
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              {/* "Ce que nous garantissons" — 2 col, plus grande, glow orange */}
              <article className="group relative overflow-hidden rounded-3xl border-2 border-nexus-orange-300/70 bg-gradient-to-br from-nexus-orange-50/70 via-white to-nexus-orange-50/40 p-7 shadow-[0_22px_50px_-18px_rgba(255,102,0,0.28)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/80 hover:shadow-[0_30px_60px_-18px_rgba(255,102,0,0.36)] sm:p-9 lg:col-span-2">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-nexus-orange-500/15 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/30"
                />
                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="relative">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-nexus-orange-500/30 blur-md"
                      />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)]">
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                    </div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-700">
                      {t("engagement_yes_label")}
                    </span>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {ENGAGEMENT_YES.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950 sm:text-base"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-nexus-orange-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 10. CTA FINAL — hero card premium ──────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
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
              {t("cta_final_title_start")}
              <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                {t("cta_final_title_accent")}
              </span>
              {t("cta_final_title_end")}
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t("cta_final_subtitle")}
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/services/financement/demarrer"
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                <FilePlus className="h-4 w-4" />
                {t("cta_final_primary")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <a
                href={whatsappLink(t("cta_final_wa_msg"))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                {t("cta_final_secondary")}
              </a>
              <Link
                href="#methodologie"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-3.5 text-sm font-bold text-white/70 transition-all duration-300 hover:text-white"
              >
                {t("metho_cta_secondary")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Quote éditoriale */}
            <div className="relative mx-auto mt-14 max-w-2xl">
              <span
                aria-hidden
                className="absolute -left-4 -top-6 font-display text-7xl font-bold leading-none text-nexus-orange-500/25 sm:-left-8 sm:-top-10 sm:text-9xl"
              >
                &ldquo;
              </span>
              <p className="relative font-display text-xl font-bold leading-snug text-white sm:text-2xl lg:text-3xl">
                Capital +{" "}
                <span className="bg-gradient-to-r from-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                  m&eacute;thode
                </span>{" "}
                + suivi long terme.
              </p>
              <span
                aria-hidden
                className="absolute -bottom-10 -right-4 font-display text-7xl font-bold leading-none text-nexus-orange-500/25 sm:-bottom-12 sm:-right-8 sm:text-9xl"
              >
                &rdquo;
              </span>
            </div>

            {/* 4 trust signals avec icônes */}
            <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                { icon: ShieldCheck, label: t("cta_final_foot1") },
                { icon: FileText, label: t("cta_final_foot2") },
                { icon: Activity, label: t("cta_final_foot3") },
                { icon: Eye, label: t("cta_final_foot4") },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-4 text-center backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-400/30 hover:bg-white/[0.06]"
                  >
                    <Icon className="h-4 w-4 text-nexus-orange-300" />
                    <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.16em] text-white/70">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
