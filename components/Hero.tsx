import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Calendar,
  Clock,
  FilePlus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ServiceCover } from "@/components/services/ServiceCover";

// ─── Hero homepage Premium tech ─────────────────────────────────────────────
// Layout 2 colonnes : copie complète à gauche, visuel service (Visa) à droite.
// Stats + trust badges INTÉGRÉS. Tous les textes i18n Hero.* sont conservés.
// ────────────────────────────────────────────────────────────────────────────

const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

export function Hero() {
  const t = useTranslations("Hero");

  const STATS = [
    { value: t("stat1_value"), label: t("stat1_label"), highlight: true },
    { value: t("stat2_value"), label: t("stat2_label") },
    {
      value: t("stat3_value"),
      label: t("stat3_label"),
      hint: t("stat3_hint"),
    },
  ];

  const TRUST = [
    { icon: ShieldCheck, label: t("trust_free") },
    { icon: Clock, label: t("trust_24h") },
    { icon: Sparkles, label: t("trust_confidential") },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-4 pt-20 pb-16 text-white sm:px-6 sm:pt-24 sm:pb-20 lg:px-8 lg:pt-32 lg:pb-24">
      {/* Dot grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.6]"
        style={DOT_GRID_DARK}
      />

      {/* Orb central rayonnant */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-[140px]"
      />
      {/* Blob top-right (or) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-brand/10 blur-[120px]"
      />
      {/* Blob bottom-left (bleu) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/15 blur-[120px]"
      />

      {/* Bordure inférieure éclairée */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.22fr)_minmax(17rem,0.78fr)] lg:gap-x-12 xl:gap-x-16">
          {/* ── Colonne texte — tous les libellés Hero.* conservés ── */}
          <div className="min-w-0 text-center lg:text-left">
            {/* Eyebrow badge avec pulse dot or */}
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-brand backdrop-blur-md transition-all duration-300 hover:border-brand/50 hover:bg-brand/15">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              {t("eyebrow")}
            </span>

            <h1 className="mt-6 text-balance font-display text-[1.7rem] font-bold leading-[1.08] tracking-tight text-white min-[400px]:text-[1.95rem] sm:text-[2.7rem] lg:text-[2.55rem] xl:text-[2.9rem] 2xl:text-[3.15rem]">
              {t("title_start")}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-brand via-brand to-brand-hover bg-clip-text text-transparent">
                  {t("title_accent")}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent"
                />
              </span>
              {t("title_end")}
            </h1>

            {/* Sous-titre */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0">
              {t("subtitle")}
            </p>

            {/* CTAs — mêmes routes, mêmes libellés */}
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/demande/complet"
                className="group/cta relative inline-flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-2xl bg-brand px-7 py-3.5 text-sm font-bold text-on-brand shadow-[0_10px_30px_-10px_rgba(185,151,96,0.5)] outline-none transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-[0_18px_45px_-10px_rgba(185,151,96,0.6)] focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-nexus-blue-950"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                <FilePlus className="h-4 w-4" />
                {t("cta_primary")}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
              <Link
                href="/rendez-vous"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                <Calendar className="h-4 w-4" />
                {t("cta_secondary")}
              </Link>
            </div>

            {/* Trust pills — intégrés dans le hero navy */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-white/60 lg:justify-start">
              {TRUST.map((trust) => {
                const Icon = trust.icon;
                return (
                  <span
                    key={trust.label}
                    className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-white/85"
                  >
                    <Icon className="h-3 w-3 text-brand" />
                    {trust.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* ── Colonne visuel — photo Visa déjà approuvée, pas un employé nommé ── */}
          <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand/25 via-brand/5 to-transparent opacity-80 blur-2xl"
            />
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-brand/25 bg-nexus-blue-950 shadow-[0_28px_60px_-24px_rgba(2,7,31,0.7)] ring-1 ring-white/10">
              <ServiceCover
                slug="visa"
                variant="hero"
                priority
                className="!aspect-auto h-full w-full rounded-none"
                imgClassName="object-center opacity-95"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-nexus-blue-950/55 via-transparent to-nexus-blue-950/15"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent"
              />
            </div>
          </div>
        </div>

        {/* Stats compactes — cards glass navy, tous les libellés conservés */}
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3">
          {STATS.map((stat) => (
            <article
              key={stat.label}
              className={`group/stat relative overflow-hidden rounded-2xl border bg-white/[0.04] px-5 py-4 backdrop-blur-md ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] ${
                stat.highlight
                  ? "border-brand/30 hover:border-brand/60"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/0 blur-2xl transition-all duration-500 group-hover/stat:bg-brand/20"
              />
              <div className="relative">
                <p className="font-display text-2xl font-bold leading-none text-white sm:text-3xl">
                  <span className="text-brand">{stat.value}</span>
                </p>
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {stat.label}
                </p>
                {stat.hint && (
                  <p className="mt-0.5 text-[10px] text-slate-500">{stat.hint}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
