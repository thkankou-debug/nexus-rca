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

// ─── Hero homepage Premium tech ─────────────────────────────────────────────
// Hero custom navy + dot grid + 2 blobs.
// Stats + trust badges INTÉGRÉS dans le hero (cards glass navy compactes).
// Plus de bandeau blanc séparé qui cassait l'ambiance navy.
// Cohérent avec les heros services (visa, billets, a-propos).
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
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-orange-500/15 blur-[140px]"
      />
      {/* Blob top-right (orange) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-nexus-orange-500/10 blur-[120px]"
      />
      {/* Blob bottom-left (bleu) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-nexus-blue-500/15 blur-[120px]"
      />

      {/* Bordure inférieure éclairée */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Eyebrow badge avec pulse dot orange */}
        <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-500/50 hover:bg-nexus-orange-500/15">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
          </span>
          {t("eyebrow")}
        </span>

        {/* Titre principal */}
        <h1 className="mt-6 font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          {t("title_start")}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
              {t("title_accent")}
            </span>
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
            />
          </span>
          {t("title_end")}
        </h1>

        {/* Sous-titre */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {t("subtitle")}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/demande/complet"
            className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
          >
            <Calendar className="h-4 w-4" />
            {t("cta_secondary")}
          </Link>
        </div>

        {/* Trust pills — intégrés dans le hero navy */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-white/60">
          {TRUST.map((trust) => {
            const Icon = trust.icon;
            return (
              <span
                key={trust.label}
                className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-white/85"
              >
                <Icon className="h-3 w-3 text-nexus-orange-300" />
                {trust.label}
              </span>
            );
          })}
        </div>

        {/* Stats compactes — cards glass navy intégrées */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {STATS.map((stat) => (
            <article
              key={stat.label}
              className={`group/stat relative overflow-hidden rounded-2xl border bg-white/[0.04] px-5 py-4 backdrop-blur-md ring-1 ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/[0.07] ${
                stat.highlight
                  ? "border-nexus-orange-400/30 hover:border-nexus-orange-400/60"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover/stat:bg-nexus-orange-500/20"
              />
              <div className="relative">
                <p className="font-display text-2xl font-bold leading-none text-white sm:text-3xl">
                  <span className="bg-gradient-to-r from-nexus-orange-300 to-nexus-orange-500 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
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
