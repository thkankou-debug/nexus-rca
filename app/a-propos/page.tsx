import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Compass,
  Globe2,
  Handshake,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { PublicHero } from "@/components/PublicHero";
import { AboutFoundersMosaic } from "@/components/about/AboutFoundersMosaic";
import { AboutPresenceMap } from "@/components/about/AboutPresenceMap";
import { whatsappLink } from "@/lib/utils";

export const metadata = {
  title: "À propos | Nexus RCA",
  description:
    "Nexus RCA est une agence internationale basée à Bangui, spécialisée dans l'accompagnement administratif, les projets internationaux et le développement d'activités. Découvrez notre vision, notre équipe et notre approche.",
};

// ─── Pattern dot grid (Stripe-like) ─────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

// ─── Fondateurs (données métier, préservées) ───────────────────────────────
const FOUNDERS = [
  {
    name: "Thierry F. KANKOU",
    roleKey: "founders_thierry_role",
    bio: "Spécialiste de la logistique, du service client et de la gestion de projets. Thierry structure les opérations de Nexus RCA et accompagne les clients dans leurs démarches internationales avec rigueur et méthode. Sa vision : transformer chaque projet en résultat concret grâce à une approche structurée et un suivi sans faille.",
    initials: "TK",
    location: "Bangui · Canada",
    photo: "/team/thierry-kankou.jpg",
  },
  {
    name: "Orson DIBERT.K",
    roleKey: "founders_orson_role",
    bio: "Pilier de la stratégie internationale de Nexus RCA, Orson développe les ponts entre l'Europe et la Centrafrique. Son expertise en gestion et en coordination transfrontalière permet à l'agence d'accompagner des projets ambitieux à l'échelle internationale.",
    initials: "OD",
    location: "Europe · RCA",
    photo: "/team/orson-dibert.jpg",
  },
];

// ─── Empreinte institutionnelle (stats glass) ──────────────────────────────
const STATS = [
  { value: "10+", labelKey: "stat1_label" },
  { value: "2", labelKey: "stat2_label" },
  { value: "24h", labelKey: "stat3_label" },
  { value: "100%", labelKey: "stat4_label" },
] as const;

// ─── Méthode 3 étapes (bandeau bas Empreinte) ──────────────────────────────
const METHODE = [
  { step: "01", icon: Compass, key: "approach_card1" },
  { step: "02", icon: Briefcase, key: "approach_card2" },
  { step: "03", icon: Sparkles, key: "approach_card3" },
] as const;

// ─── Valeurs (présentées dans l'empreinte) ─────────────────────────────────
const VALEURS = [
  { key: "rigueur", icon: ShieldCheck },
  { key: "resultats", icon: Target },
  { key: "partenariat", icon: Handshake },
  { key: "ouverture", icon: Globe2 },
] as const;

export default function AProposPage() {
  const t = useTranslations("About");

  return (
    <>
      <Navbar />
      <main>
        {/* ============================================================ */}
        {/* 1. HERO AFFIRMATION ────────────────────────────────────────── */}
        {/* ============================================================ */}
        <PublicHero
          eyebrow={t("hero_eyebrow")}
          titleStart={t("hero_title_start")}
          accentWord={t("hero_title_accent")}
          titleEnd={t("hero_title_end")}
          subtitle={t("hero_subtitle")}
        />

        {/* ============================================================ */}
        {/* 2. MANIFESTE ÉDITORIAL — signature 1                          */}
        {/* Style : Notion (espace) × Airbnb (storytelling) × McKinsey   */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.45]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/12 blur-[160px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 top-32 h-72 w-72 rounded-full bg-nexus-blue-500/15 blur-[120px]"
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
              {/* ─── Colonne texte (5/12) ─── */}
              <div className="lg:col-span-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                  </span>
                  {t("vision_eyebrow")}
                </span>

                <h2 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                  Une mission{" "}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                      profondément humaine
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
                    />
                  </span>
                  .
                </h2>

                <div className="mt-8 space-y-5 text-base leading-relaxed text-slate-300 sm:text-lg">
                  <p>
                    {t("vision_p1_before")}
                    <strong className="text-white">
                      {t("vision_p1_strong")}
                    </strong>
                    {t("vision_p1_after")}
                  </p>
                  <p>
                    {t("vision_p2_before")}
                    <strong className="text-white">
                      {t("vision_p2_strong")}
                    </strong>
                    {t("vision_p2_after")}
                  </p>
                </div>

                {/* Trust pills */}
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
                    <MapPin className="h-3 w-3 text-nexus-orange-300" />
                    {t("hero_trust_bureau")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
                    <Globe2 className="h-3 w-3 text-nexus-orange-300" />
                    {t("hero_trust_presence")}
                  </span>
                </div>
              </div>

              {/* ─── Citation premium (7/12) ─── */}
              <div className="relative lg:col-span-7">
                {/* Halo décoratif */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-nexus-orange-500/15 via-nexus-orange-500/5 to-nexus-blue-500/10 opacity-70 blur-3xl"
                />

                <blockquote className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-white/[0.02] p-8 ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.30)] sm:p-10 lg:p-12">
                  {/* Glow décoratif */}
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
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.7)] ring-1 ring-white/15">
                      <Heart className="h-5 w-5" />
                    </div>

                    <p className="mt-7 font-display text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-3xl lg:text-[2rem]">
                      « {t("vision_quote_main")} »
                    </p>
                    <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
                      {t("vision_quote_sub")}
                    </p>

                    <div className="mt-8 border-t border-white/10 pt-6">
                      <p className="text-sm leading-relaxed text-slate-300">
                        {t("vision_p4_before")}
                        <strong className="text-white">
                          {t("vision_p4_strong")}
                        </strong>
                        {t("vision_p4_after")}
                      </p>
                    </div>
                  </div>
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. EMPREINTE INSTITUTIONNELLE — narration + bento stats       */}
        {/* + bandeau méthode 3 étapes                                    */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/30 to-transparent"
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
              {/* ─── Narration (7/12) ─── */}
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                  {t("qui_eyebrow")}
                </span>
                <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {t("qui_title")}
                </h2>
                <div className="mt-7 space-y-5 text-base leading-relaxed text-slate-300 sm:text-lg">
                  <p>
                    {t("qui_paragraph1_before")}
                    <strong className="text-white">
                      {t("qui_paragraph1_strong")}
                    </strong>
                    {t("qui_paragraph1_after")}
                  </p>
                  <p>
                    {t("qui_paragraph2_before")}
                    <strong className="text-white">
                      {t("qui_paragraph2_strong")}
                    </strong>
                    {t("qui_paragraph2_after")}
                  </p>
                </div>
              </div>

              {/* ─── Bento stats (5/12) ─── */}
              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {STATS.map((s, i) => (
                    <div
                      key={s.labelKey}
                      className={`group/stat relative overflow-hidden rounded-2xl border p-5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.07] sm:p-6 ${
                        i === 0
                          ? "border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] hover:border-nexus-orange-400/60"
                          : "border-white/10 bg-white/[0.04] hover:border-white/25"
                      }`}
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover/stat:bg-nexus-orange-500/20"
                      />
                      <div className="relative">
                        <p className="font-display text-3xl font-bold leading-none text-white sm:text-4xl">
                          <span className="bg-gradient-to-r from-nexus-orange-300 to-nexus-orange-500 bg-clip-text text-transparent">
                            {s.value}
                          </span>
                        </p>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/65">
                          {t(s.labelKey)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Bandeau méthode 3 étapes ─── */}
            <div className="mt-20 border-t border-white/10 pt-14">
              <div className="mx-auto max-w-2xl text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                  {t("approach_eyebrow")}
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                  {t("approach_title")}
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  {t("approach_subtitle")}
                </p>
              </div>

              <div className="mt-12 grid gap-5 sm:grid-cols-3 lg:gap-6">
                {METHODE.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <article
                      key={m.step}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                      />
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-5xl font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgba(251,146,60,0.4)] sm:text-6xl">
                            {m.step}
                          </span>
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 ring-1 ring-nexus-orange-400/30">
                            <Icon className="h-4 w-4 text-nexus-orange-300" />
                          </div>
                        </div>
                        <h4 className="mt-5 font-display text-lg font-bold leading-tight text-white">
                          {t(`${m.key}_title`)}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                          {t(`${m.key}_description`)}
                        </p>
                      </div>
                      {i < METHODE.length - 1 && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 translate-x-3 bg-gradient-to-r from-nexus-orange-500/40 to-transparent sm:block"
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            </div>

            {/* ─── Bandeau valeurs (4 chips premium) ─── */}
            <div className="mt-16">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-8">
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                  {t("diff_eyebrow")}
                </p>
                <h3 className="mt-2 text-center font-display text-xl font-bold text-white sm:text-2xl">
                  {t("diff_title")}
                </h3>
                <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {VALEURS.map((v) => {
                    const Icon = v.icon;
                    return (
                      <div
                        key={v.key}
                        className="group/v flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-all duration-300 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500/30 to-nexus-orange-700/20 ring-1 ring-nexus-orange-400/30 transition-transform duration-300 group-hover/v:scale-105">
                          <Icon className="h-4 w-4 text-nexus-orange-300" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-sm font-bold leading-tight text-white">
                            {t(`valeur_${v.key}_title`)}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-400">
                            {t(`valeur_${v.key}_description`)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. VOIX HUMAINES — signature 2 (mosaïque cabinet)            */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-40 top-1/3 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/12 blur-[140px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 bottom-1/4 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/15 blur-[140px]"
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                {t("founders_eyebrow")}
              </span>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
                {t("founders_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {t("founders_subtitle")}
              </p>
            </div>

            <div className="mt-14">
              <AboutFoundersMosaic
                founders={FOUNDERS.map((f) => ({
                  ...f,
                  role: t(f.roleKey),
                }))}
              />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. PRÉSENCE INTERNATIONALE — signature 3 (carte SVG)         */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.45]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[140px]"
          />

          <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <Globe2 className="h-3 w-3" />
                Présence internationale
              </span>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Trois pôles, une{" "}
                <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
                  mission commune
                </span>
                .
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Nexus opère depuis Bangui — siège historique — avec des relais
                actifs en Europe et au Canada. Une seule équipe, une seule
                méthode, partout.
              </p>
            </div>

            <div className="mt-14">
              <AboutPresenceMap />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 6. CTA ÉDITORIAL FINAL                                        */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-24 text-white sm:py-28 lg:py-32">
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

          <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
              </span>
              {t("cta_eyebrow")}
            </span>

            <h2 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              L&rsquo;avenir d&rsquo;un projet commence par une{" "}
              <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                conversation
              </span>
              .
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {t("cta_subtitle")}
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <a
                href={whatsappLink(
                  "Bonjour Nexus, je souhaite échanger sur un projet d'accompagnement."
                )}
                target="_blank"
                rel="noreferrer"
                className="group/wa relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/wa:left-[120%] group-hover/wa:opacity-100"
                />
                <MessageCircle className="h-4 w-4" />
                Démarrer la conversation
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/wa:translate-x-0.5" />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" />
                Page contact
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] uppercase tracking-[0.18em] text-white/60">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                Étude initiale gratuite
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-nexus-orange-300" />
                Plan d&rsquo;action sous 24 h
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-nexus-orange-300" />
                Bangui (siège) · Canada (bureau) · Europe (représentation)
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
