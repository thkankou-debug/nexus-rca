import { useTranslations } from "next-intl";
import { FilePlus, Calendar, ShieldCheck, Clock, Sparkles } from "lucide-react";
import { PublicHero } from "@/components/PublicHero";

// ─── Hero homepage Premium tech ─────────────────────────────────────────────
// Server component, zero framer-motion, animations CSS pures.
// S'appuie sur <PublicHero> partagé avec toutes les pages publiques.
// Les signaux de confiance + stats sont conservés dans une section dédiée
// juste après le hero.
// ────────────────────────────────────────────────────────────────────────────
export function Hero() {
  const t = useTranslations("Hero");

  return (
    <>
      <PublicHero
        eyebrow={t("eyebrow")}
        titleStart={t("title_start")}
        accentWord={t("title_accent")}
        titleEnd={t("title_end")}
        subtitle={t("subtitle")}
        ctaPrimary={{
          href: "/demande/complet",
          label: t("cta_primary"),
          icon: FilePlus,
        }}
        ctaSecondary={{
          href: "/rendez-vous",
          label: t("cta_secondary"),
          icon: Calendar,
        }}
      />

      {/* ─── Bandeau confiance + stats — après le hero ──────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white py-10 sm:py-12">
        <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-800">
              <ShieldCheck className="h-3.5 w-3.5 text-nexus-orange-500" />
              {t("trust_free")}
            </span>
            <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-800">
              <Clock className="h-3.5 w-3.5 text-nexus-orange-500" />
              {t("trust_24h")}
            </span>
            <span className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-800">
              <Sparkles className="h-3.5 w-3.5 text-nexus-orange-500" />
              {t("trust_confidential")}
            </span>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              number={t("stat1_value")}
              label={t("stat1_label")}
              highlight
            />
            <StatCard number={t("stat2_value")} label={t("stat2_label")} />
            <StatCard
              number={t("stat3_value")}
              label={t("stat3_label")}
              hint={t("stat3_hint")}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({
  number,
  label,
  hint,
  highlight = false,
}: {
  number: string;
  label: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group/stat relative overflow-hidden rounded-2xl border bg-white px-5 py-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(12,28,64,0.18)] ${
        highlight
          ? "border-nexus-orange-300/60 hover:border-nexus-orange-400/70"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-nexus-orange-500/0 blur-2xl transition-all duration-500 group-hover/stat:bg-nexus-orange-500/15"
      />
      <div className="relative">
        <p className="font-display text-2xl font-bold leading-none text-nexus-blue-950 sm:text-3xl">
          <span className="bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-700 bg-clip-text text-transparent">
            {number}
          </span>
        </p>
        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </p>
        {hint && <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
