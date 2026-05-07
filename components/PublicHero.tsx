import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

// ─── Pattern dot grid (Stripe-like) ─────────────────────────────────────────
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

interface CtaProps {
  href: string;
  label: string;
  icon?: LucideIcon;
}

interface PublicHeroProps {
  /** Petite étiquette uppercase au-dessus du titre */
  eyebrow: string;
  /** Texte du titre placé AVANT le mot accent (peut se terminer par un espace) */
  titleStart?: string;
  /** Mot ou groupe de mots à afficher en gradient orange */
  accentWord: string;
  /** Texte du titre placé APRÈS le mot accent */
  titleEnd?: string;
  /** Sous-titre descriptif sous le H1 */
  subtitle: string;
  /** CTA primaire (bouton orange) — optionnel */
  ctaPrimary?: CtaProps;
  /** CTA secondaire (bouton bordure white/20) — optionnel */
  ctaSecondary?: CtaProps;
}

/**
 * Hero public partagé Premium tech.
 * Reproduction fidèle du pattern hero NEXUS CONNECT :
 * - Fond navy gradient + dot grid + 3 blobs (orb central, top-right orange,
 *   bottom-left blue).
 * - Eyebrow badge avec dot pulse orange.
 * - H1 avec mot accent en gradient orange + underline gradient sous le span.
 * - Sous-titre slate-300.
 * - 0, 1 ou 2 CTAs (primary orange shimmer + secondary border white/20).
 *
 * Server component — aucun "use client" requis.
 */
export function PublicHero({
  eyebrow,
  titleStart,
  accentWord,
  titleEnd,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: PublicHeroProps) {
  const PrimaryIcon = ctaPrimary?.icon;
  const SecondaryIcon = ctaSecondary?.icon;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-4 pt-16 pb-24 text-white sm:px-6 sm:pt-20 sm:pb-32 lg:px-8">
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
          {eyebrow}
        </span>

        {/* Titre principal */}
        <h1 className="mt-6 font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          {titleStart}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-nexus-orange-400 via-nexus-orange-500 to-nexus-orange-600 bg-clip-text text-transparent">
              {accentWord}
            </span>
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/60 to-transparent"
            />
          </span>
          {titleEnd}
        </h1>

        {/* Sous-titre */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {subtitle}
        </p>

        {/* CTAs — full width sur mobile pour impact immédiat */}
        {(ctaPrimary || ctaSecondary) && (
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            {ctaPrimary && (
              <Link
                href={ctaPrimary.href}
                className="group/cta relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-7 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
                />
                {PrimaryIcon && <PrimaryIcon className="h-4 w-4" />}
                {ctaPrimary.label}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
              </Link>
            )}
            {ctaSecondary && (
              <Link
                href={ctaSecondary.href}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
              >
                {SecondaryIcon && <SecondaryIcon className="h-4 w-4" />}
                {ctaSecondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
