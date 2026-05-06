import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Compass,
  Globe2,
  Handshake,
  Heart,
  Linkedin,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";

export const metadata = {
  title: "À propos | Nexus RCA",
  description:
    "Nexus RCA est une agence internationale basée à Bangui, spécialisée dans l'accompagnement administratif, les projets internationaux et le développement d'activités. Découvrez notre vision, notre équipe et notre approche.",
};

interface Founder {
  name: string;
  /** Clé de traduction pour le rôle (ex: "founders_thierry_role") */
  roleKey: string;
  /** Bio en FR (donnée métier — non traduite) */
  bio: string;
  /** Chemin vers l'image dans /public — laisse undefined pour afficher les initiales */
  photo?: string;
  email?: string;
  linkedin?: string;
  initials: string;
  location: string;
}

const FOUNDERS: Founder[] = [
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

// Valeurs : on conserve l'icône en TS, les textes sont traduits via t()
const VALEURS = [
  { key: "rigueur", icon: ShieldCheck },
  { key: "resultats", icon: Target },
  { key: "partenariat", icon: Handshake },
  { key: "ouverture", icon: Globe2 },
] as const;

// Pourquoi nous faire confiance : icône + clé de traduction
const POURQUOI = [
  { key: "card1", icon: CheckCircle2 },
  { key: "card2", icon: Briefcase },
  { key: "card3", icon: Sparkles },
  { key: "card4", icon: Users },
] as const;

// ─── Pattern dot grid (Stripe-like) ─────────────────────────────────────────
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

export default function AProposPage() {
  const t = useTranslations("About");

  return (
    <>
      <Navbar />
      <main>
        {/* ─── HERO Premium tech ──────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 pt-28 pb-16 text-white sm:pt-40 sm:pb-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-24 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          <div className="relative mx-auto max-w-5xl px-4 lg:px-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-500/40 hover:bg-white/10">
                <Building2 className="h-3 w-3" />
                {t("hero_eyebrow")}
              </span>

              <h1 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {t("hero_title")}
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                {t("hero_subtitle")}
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
                  <MapPin className="h-3.5 w-3.5 text-nexus-orange-300" />
                  {t("hero_trust_bureau")}
                </span>
                <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
                  <Globe2 className="h-3.5 w-3.5 text-nexus-orange-300" />
                  {t("hero_trust_presence")}
                </span>
                <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-300" />
                  {t("hero_trust_method")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── QUI SOMMES-NOUS ────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                  {t("qui_eyebrow")}
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                  {t("qui_title")}
                </h2>
                <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
                  <p>
                    {t("qui_paragraph1_before")}
                    <strong className="text-nexus-blue-950">
                      {t("qui_paragraph1_strong")}
                    </strong>
                    {t("qui_paragraph1_after")}
                  </p>
                  <p>
                    {t("qui_paragraph2_before")}
                    <strong className="text-nexus-blue-950">
                      {t("qui_paragraph2_strong")}
                    </strong>
                    {t("qui_paragraph2_after")}
                  </p>
                </div>
              </div>

              {/* Stats card avec dot grid + glow subtle au hover */}
              <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50/40 p-7 shadow-sm transition-all duration-500 hover:border-nexus-orange-300/40 hover:shadow-[0_20px_50px_-25px_rgba(255,102,0,0.20)] sm:p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={DOT_GRID_LIGHT}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-700 group-hover:bg-nexus-orange-500/10"
                />
                <div className="relative grid gap-3 sm:grid-cols-2">
                  <Stat number="10+" label={t("stat1_label")} />
                  <Stat number="2" label={t("stat2_label")} />
                  <Stat number="24h" label={t("stat3_label")} />
                  <Stat number="100%" label={t("stat4_label")} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── VISION (cœur orange préservé) ──────────────────────────── */}
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-nexus-orange-500/12 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-nexus-blue-500/10 blur-[100px]"
          />

          <div className="relative mx-auto max-w-3xl px-4 lg:px-8">
            <div className="text-center">
              <div className="group/heart relative mx-auto mb-5 inline-flex">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-nexus-orange-500/30 blur-xl transition-opacity duration-500 group-hover/heart:opacity-100 opacity-60"
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_12px_32px_-8px_rgba(255,102,0,0.5)] transition-transform duration-500 ease-out group-hover/heart:scale-110">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("vision_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                {t("vision_title")}
              </h2>
            </div>

            <div className="mt-12 space-y-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              <p>
                {t("vision_p1_before")}
                <strong className="text-nexus-blue-950">
                  {t("vision_p1_strong")}
                </strong>
                {t("vision_p1_after")}
              </p>

              <p>
                {t("vision_p2_before")}
                <strong className="text-nexus-blue-950">
                  {t("vision_p2_strong")}
                </strong>
                {t("vision_p2_after")}
              </p>

              <p>{t("vision_p3")}</p>

              {/* Citation Premium tech */}
              <blockquote className="group/quote relative my-10 overflow-hidden rounded-3xl border-l-4 border-nexus-orange-500 bg-white px-6 py-6 shadow-[0_20px_50px_-25px_rgba(12,28,64,0.18)] transition-all duration-500 hover:shadow-[0_24px_60px_-25px_rgba(255,102,0,0.22)] sm:px-9 sm:py-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover/quote:bg-nexus-orange-500/12"
                />
                <p className="relative font-display text-xl font-bold leading-snug text-nexus-blue-950 sm:text-2xl">
                  {t("vision_quote_main")}
                </p>
                <p className="relative mt-3 text-base leading-relaxed text-slate-600">
                  {t("vision_quote_sub")}
                </p>
              </blockquote>

              <p>
                {t("vision_p4_before")}
                <strong className="text-nexus-blue-950">
                  {t("vision_p4_strong")}
                </strong>
                {t("vision_p4_after")}
              </p>

              <p>
                {t("vision_p5_before")}
                <strong className="text-nexus-blue-950">
                  {t("vision_p5_strong")}
                </strong>
                {t("vision_p5_after")}
              </p>
            </div>
          </div>
        </section>

        {/* ─── MISSION ────────────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("mission_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                {t("mission_title")}
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <MissionCard
                icon={Compass}
                title={t("mission_card1_title")}
                description={t("mission_card1_description")}
              />
              <MissionCard
                icon={Briefcase}
                title={t("mission_card2_title")}
                description={t("mission_card2_description")}
              />
              <MissionCard
                icon={Sparkles}
                title={t("mission_card3_title")}
                description={t("mission_card3_description")}
              />
            </div>
          </div>
        </section>

        {/* ─── NOTRE APPROCHE ─────────────────────────────────────────── */}
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("approach_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                {t("approach_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                {t("approach_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              <ApproachCard
                step="01"
                title={t("approach_card1_title")}
                description={t("approach_card1_description")}
              />
              <ApproachCard
                step="02"
                title={t("approach_card2_title")}
                description={t("approach_card2_description")}
              />
              <ApproachCard
                step="03"
                title={t("approach_card3_title")}
                description={t("approach_card3_description")}
              />
            </div>
          </div>
        </section>

        {/* ─── NOTRE DIFFÉRENCE — navy Premium tech ───────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/15 blur-[100px]"
          />

          <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                {t("diff_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {t("diff_title")}
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {VALEURS.slice(0, 3).map((val) => {
                const Icon = val.icon;
                const title = t(`valeur_${val.key}_title`);
                const description = t(`valeur_${val.key}_description`);
                return (
                  <article
                    key={val.key}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/[0.08] hover:shadow-[0_18px_40px_-18px_rgba(255,102,0,0.30)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/20"
                    />
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_8px_24px_-8px_rgba(255,102,0,0.5)] transition-transform duration-300 ease-out group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-5 font-display text-lg font-bold text-white">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300/95">
                        {description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border border-nexus-orange-500/30 bg-gradient-to-br from-nexus-orange-500/15 via-nexus-orange-500/10 to-nexus-orange-500/5 p-7 text-center backdrop-blur-md transition-colors duration-300 hover:border-nexus-orange-500/50 sm:p-8">
              <p className="text-base leading-relaxed text-white sm:text-lg">
                <strong className="text-nexus-orange-300">
                  {t("diff_banner_strong")}
                </strong>
                {t("diff_banner_after")}
              </p>
            </div>
          </div>
        </section>

        {/* ─── FONDATEURS ─────────────────────────────────────────────── */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("founders_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                {t("founders_title")}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                {t("founders_subtitle")}
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:gap-8">
              {FOUNDERS.map((founder) => (
                <FounderCard
                  key={founder.name}
                  founder={founder}
                  role={t(founder.roleKey)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ─── POURQUOI NOUS FAIRE CONFIANCE ──────────────────────────── */}
        <section className="bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
                {t("pourquoi_eyebrow")}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
                {t("pourquoi_title")}
              </h2>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {POURQUOI.map((item) => {
                const Icon = item.icon;
                const title = t(`pourquoi_${item.key}_title`);
                const description = t(`pourquoi_${item.key}_description`);
                return (
                  <article
                    key={item.key}
                    className="group relative flex gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_18px_40px_-18px_rgba(255,102,0,0.22)]"
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
                    />
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="relative min-w-0">
                      <h3 className="font-display text-base font-bold text-nexus-blue-950">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {description}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CTA FINAL Premium tech ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 py-20 text-white sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
          />

          <div className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
              </span>
              {t("cta_eyebrow")}
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t("cta_title")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t("cta_subtitle")}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/demande/complet"
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.5)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_16px_40px_-10px_rgba(255,102,0,0.6)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                {t("cta_primary")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <Link
                href="/rendez-vous"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                {t("cta_secondary")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

// ─── Sous-composants Premium tech ─────────────────────────────────────────

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="group/stat relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_12px_28px_-12px_rgba(255,102,0,0.18)]">
      <p className="font-display text-2xl font-bold leading-none text-nexus-blue-950 transition-colors duration-300 group-hover/stat:text-nexus-orange-600 sm:text-3xl">
        {number}
      </p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function MissionCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_18px_40px_-18px_rgba(255,102,0,0.22)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
      />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-sm transition-transform duration-300 ease-out group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-5 font-display text-lg font-bold text-nexus-blue-950">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      </div>
    </article>
  );
}

function ApproachCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_18px_40px_-18px_rgba(255,102,0,0.22)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover:bg-nexus-orange-500/15"
      />
      <div className="relative">
        <p className="font-display text-3xl font-bold tabular-nums text-slate-200 transition-colors duration-300 group-hover:text-nexus-orange-300">
          {step}
        </p>
        <h3 className="mt-3 font-display text-lg font-bold text-nexus-blue-950">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      </div>
    </article>
  );
}

// ─── Carte fondateur Premium tech ──────────────────────────────────────────
function FounderCard({ founder, role }: { founder: Founder; role: string }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-nexus-orange-300/60 hover:shadow-[0_20px_50px_-20px_rgba(255,102,0,0.18)] sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-nexus-orange-500/0 blur-3xl transition-all duration-700 group-hover:bg-nexus-orange-500/12"
      />
      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Photo / initiales */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-nexus-orange-500/0 blur-xl transition-all duration-500 group-hover:bg-nexus-orange-500/20" />
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200 transition-all duration-500 group-hover:ring-nexus-orange-300/60 sm:h-36 sm:w-36">
            {founder.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={founder.photo}
                alt={`Portrait de ${founder.name}`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 font-display text-3xl font-bold text-white sm:text-4xl">
                {founder.initials}
              </div>
            )}
          </div>
        </div>

        {/* Texte du fondateur */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h3 className="font-display text-xl font-bold text-nexus-blue-950 sm:text-2xl">
            {founder.name}
          </h3>
          <p className="mt-1 text-sm font-bold text-nexus-orange-600">
            {role}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors duration-300 group-hover:bg-slate-200/80">
            <MapPin className="h-3 w-3 text-nexus-orange-500" />
            {founder.location}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {founder.bio}
          </p>

          {(founder.email || founder.linkedin) && (
            <div className="mt-5 flex justify-center gap-2 border-t border-slate-200 pt-5 sm:justify-start">
              {founder.email && (
                <a
                  href={`mailto:${founder.email}`}
                  aria-label={`Envoyer un email à ${founder.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-orange-100 hover:text-nexus-orange-600"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
              {founder.linkedin && (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`LinkedIn de ${founder.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-nexus-blue-100 hover:text-nexus-blue-700"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
