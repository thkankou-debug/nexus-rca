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
  { icon: CircleDollarSign, key: "mode_2" },
  { icon: ShoppingBag, key: "mode_3" },
  { icon: Sprout, key: "mode_4" },
  { icon: TrendingUp, key: "mode_5" },
  { icon: Building2, key: "mode_6" },
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

        {/* 1.5 TRUST STATS ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white py-12 lg:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={DOT_GRID_LIGHT_SUBTLE}
          />
          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { top: t("trust_1_top"), bot: t("trust_1_bot") },
                { top: t("trust_2_top"), bot: t("trust_2_bot") },
                { top: t("trust_3_top"), bot: t("trust_3_bot") },
              ].map((s, i) => (
                <article
                  key={i}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_16px_36px_-16px_rgba(255,102,0,0.20)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/12"
                  />
                  <div className="relative">
                    <p className="font-display text-lg font-bold leading-tight text-nexus-blue-950 sm:text-xl">
                      <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                        {s.top}
                      </span>
                    </p>
                    <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                      {s.bot}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 2. CE QUE NEXUS N'EST PAS ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("nepas_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                {t("nepas_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
                {t("nepas_subtitle")}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {NEXUS_NEST_PAS.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.key}
                    className="group relative overflow-hidden rounded-3xl border-2 border-rose-200/70 bg-white p-7 ring-1 ring-rose-100/60 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-300/80 hover:shadow-[0_16px_36px_-16px_rgba(244,63,94,0.20)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-rose-400/0 blur-2xl transition-all duration-500 group-hover:bg-rose-400/15"
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

        {/* 3. CE QUE NEXUS EST ────────────────────────────────────────── */}
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
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
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

            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-5">
              {MODELE.map((item) => {
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

        {/* 4. NOS 6 MODES D'ENGAGEMENT ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("modes_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
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

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {MODES.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.key}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900 text-white shadow-sm transition-all duration-300 ease-out group-hover:scale-105 group-hover:from-nexus-orange-500 group-hover:to-nexus-orange-700">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
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

        {/* 5. INCUBATEUR NEXUS ───────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
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
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                {t("incub_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {t("incub_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {t("incub_subtitle")}
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {INCUBATEUR_AUDIENCES.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.key}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl ring-1 ring-white/5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/30 hover:bg-white/[0.07]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/20"
                    />
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_20px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold leading-tight text-white">
                        {t(`${item.key}_title`)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">
                        {t(`${item.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Sous bloc — sept apports */}
            <div className="mt-16">
              <div className="mx-auto mb-8 max-w-2xl text-center">
                <h3 className="font-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
                  {t("apports_title")}
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  {t("apports_subtitle")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
                {APPORTS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className="group flex flex-col items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/30 hover:bg-white/[0.08]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500/20 to-nexus-orange-500/5 text-nexus-orange-300 ring-1 ring-nexus-orange-400/20 transition-transform duration-300 ease-out group-hover:scale-110">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-[11px] font-bold uppercase leading-tight tracking-[0.05em] text-white">
                        {t(`${item.key}_label`)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 6. NOTRE MÉTHODOLOGIE ─────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-32 h-96 w-96 rounded-full bg-nexus-blue-500/8 blur-[100px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("metho_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
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

            <div className="grid gap-5 lg:grid-cols-2">
              {METHODOLOGIE.map((etape) => {
                const Icon = etape.icon;
                return (
                  <article
                    key={etape.num}
                    className="group relative flex items-start gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-6 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)] sm:p-7"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative shrink-0">
                      <div
                        aria-hidden
                        className="absolute inset-0 rounded-2xl bg-nexus-orange-500/30 opacity-50 blur-md transition-all duration-500 group-hover:opacity-100"
                      />
                      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 font-display text-base font-bold text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105">
                        {etape.num}
                      </div>
                    </div>
                    <div className="relative min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-nexus-orange-600" />
                        <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                          {t(`${etape.key}_title`)}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {t(`${etape.key}_desc`)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* CTA milieu */}
            <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-nexus-orange-50/30 p-7 shadow-[0_20px_50px_-20px_rgba(255,102,0,0.20)] ring-1 ring-slate-100/80 sm:p-8">
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

        {/* 7. CRITÈRES DE SÉLECTION ─────────────────────────────────── */}
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
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                {t("pourqui_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
                {t("pourqui_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border-2 border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(16,185,129,0.18)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-emerald-300/80 hover:shadow-[0_24px_48px_-18px_rgba(16,185,129,0.30)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/0 blur-2xl transition-all duration-500 group-hover:bg-emerald-400/20"
                />
                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                      {t("pourqui_oui_label")}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {POURQUI_OUI.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-3xl border-2 border-rose-200/70 bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(244,63,94,0.16)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-300/80 hover:shadow-[0_24px_48px_-18px_rgba(244,63,94,0.28)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-rose-400/0 blur-2xl transition-all duration-500 group-hover:bg-rose-400/18"
                />
                <div className="relative">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                      {t("pourqui_non_label")}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {POURQUI_NON.map((item, i) => (
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
            </div>
          </div>
        </section>

        {/* 8. CAS TYPES ──────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[100px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("cas_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                {t("cas_title_start")}
                <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
                  {t("cas_title_accent")}
                </span>
                {t("cas_title_end")}
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {CAS.map((cas) => (
                <article
                  key={cas.title}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50/40 p-7 shadow-[0_16px_36px_-16px_rgba(12,28,64,0.16)] ring-1 ring-slate-100/80 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_22px_48px_-18px_rgba(255,102,0,0.22)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                  />
                  <div className="relative">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-nexus-orange-200/70 bg-nexus-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-700">
                      {cas.badge}
                    </div>
                    <h3 className="font-display text-base font-bold leading-tight text-nexus-blue-950 sm:text-lg">
                      {cas.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {cas.desc}
                    </p>
                    <p className="mt-3 text-sm font-bold leading-relaxed text-nexus-orange-700">
                      {cas.result}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 9. ENGAGEMENT TRANSPARENCE ────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/40 to-white py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={DOT_GRID_LIGHT_SUBTLE}
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("engagement_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
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

            <div className="grid gap-5 lg:grid-cols-2">
              <article className="group relative overflow-hidden rounded-3xl border-2 border-rose-200/70 bg-gradient-to-br from-rose-50/60 via-white to-rose-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(244,63,94,0.16)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-rose-300/80">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-rose-400/0 blur-2xl transition-all duration-500 group-hover:bg-rose-400/18"
                />
                <div className="relative">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700">
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

              <article className="group relative overflow-hidden rounded-3xl border-2 border-nexus-orange-300/70 bg-gradient-to-br from-nexus-orange-50/60 via-white to-nexus-orange-50/30 p-7 shadow-[0_16px_36px_-16px_rgba(255,102,0,0.20)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/80">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/18"
                />
                <div className="relative">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-700">
                    {t("engagement_yes_label")}
                  </span>
                  <ul className="mt-4 space-y-3">
                    {ENGAGEMENT_YES.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm leading-relaxed text-nexus-blue-950"
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

        {/* 10. CTA FINAL Premium tech ────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
          />

          <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
              </span>
              {t("cta_final_eyebrow")}
            </span>

            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("cta_final_title_start")}
              <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                {t("cta_final_title_accent")}
              </span>
              {t("cta_final_title_end")}
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
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
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/50">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                {t("cta_final_foot1")}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{t("cta_final_foot2")}</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{t("cta_final_foot3")}</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{t("cta_final_foot4")}</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
