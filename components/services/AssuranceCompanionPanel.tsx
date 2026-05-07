"use client";

import Link from "next/link";
import {
  ArrowRight,
  Globe,
  GraduationCap,
  Headphones,
  Plane,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

/**
 * Premium companion panel — bloc assurance intégré dans le hero.
 *
 * Utilisé dans /services/visa et /services/billets pour positionner
 * l'assurance comme prolongement naturel du dossier (et non comme service
 * séparé caché plus bas).
 *
 * Style premium :
 * - Glassmorphism profond (bg + backdrop-blur + ring)
 * - Halo glow orange/navy en arrière-plan
 * - Animation flottement subtile (companion-float dans globals.css)
 * - Décoration interne : icône shield centrale avec glow orange
 * - Mini badges 2/3/4 visibles selon viewport
 * - CTA discret en bas
 *
 * Aucun ton commercial agressif — registre cabinet international.
 *
 * IMPORTANT — pourquoi `variant` (et pas un prop `badges`) :
 * Next.js interdit de passer des fonctions (donc des composants Lucide)
 * comme props d'un Server Component vers un Client Component. Les jeux de
 * badges sont donc définis ici, et la page passe seulement un variant.
 */

type Variant = "visa" | "billets";

type Badge = {
  icon: LucideIcon;
  label: string;
};

const BADGES_VISA: Badge[] = [
  { icon: ShieldCheck, label: "Schengen compliant" },
  { icon: Headphones, label: "Assistance 24/7" },
  { icon: Plane, label: "Rapatriement intl" },
  { icon: GraduationCap, label: "Études & long séjour" },
];

const BADGES_BILLETS: Badge[] = [
  { icon: Stethoscope, label: "Couverture médicale" },
  { icon: Headphones, label: "Assistance 24/7" },
  { icon: Globe, label: "Multi-destinations" },
  { icon: ShieldCheck, label: "Voyage premium" },
];

type Props = {
  variant: Variant;
};

export function AssuranceCompanionPanel({ variant }: Props) {
  const badges = variant === "billets" ? BADGES_BILLETS : BADGES_VISA;

  return (
    <div className="relative">
      {/* Halo externe — couche profondeur */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-nexus-orange-500/15 via-nexus-orange-500/5 to-nexus-blue-500/10 opacity-70 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-[2.25rem] bg-gradient-to-br from-nexus-orange-400/10 via-transparent to-nexus-blue-400/10 blur-xl"
      />

      {/* Panel flottant */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-white/[0.02] p-6 ring-1 ring-white/5 backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10),0_28px_60px_-24px_rgba(255,102,0,0.40)] sm:p-7"
        style={{
          animation: "companion-float 6.5s ease-in-out infinite",
        }}
      >
        {/* Glow décoratif interne — top right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-nexus-orange-500/25 blur-3xl"
        />
        {/* Glow décoratif interne — bottom left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-nexus-blue-500/20 blur-3xl"
        />
        {/* Liseré supérieur lumineux */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-300/60 to-transparent"
        />

        <div className="relative">
          {/* Badge eyebrow + icône shield */}
          <div className="flex items-start justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-500/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
              </span>
              Protection internationale
            </span>

            {/* Icône shield premium avec anneau et glow */}
            <div className="relative shrink-0">
              <div
                aria-hidden
                className="absolute inset-0 -m-2 rounded-2xl bg-nexus-orange-500/30 blur-xl"
              />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.7)] ring-1 ring-white/15">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Titre */}
          <h2 className="mt-5 font-display text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
            Assurance{" "}
            <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
              Voyage & Visa
            </span>
          </h2>

          {/* Texte descriptif */}
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Couverture Schengen, assistance médicale, rapatriement, protection
            long séjour et voyages internationaux.
          </p>

          {/* Mini badges responsive : 2 mobile / 3 sm / 4 lg */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-2 xl:grid-cols-2">
            {badges.slice(0, 4).map((b, i) => {
              const Icon = b.icon;
              // Visibilité progressive : 0,1 toujours · 2 dès sm · 3 dès lg
              const visibility =
                i === 2 ? "hidden sm:flex" : i === 3 ? "hidden lg:flex" : "flex";
              return (
                <div
                  key={b.label}
                  className={`group/badge ${visibility} items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[10px] font-semibold leading-tight text-white/85 ring-1 ring-white/5 backdrop-blur-md transition-all duration-300 hover:border-nexus-orange-400/40 hover:bg-white/[0.07] hover:text-white`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-nexus-orange-300 transition-transform duration-300 group-hover/badge:scale-110" />
                  <span className="truncate">{b.label}</span>
                </div>
              );
            })}
          </div>

          {/* Séparateur lumineux */}
          <div
            aria-hidden
            className="mt-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          />

          {/* CTA discret */}
          <Link
            href="/services/assurance"
            className="group/cta mt-5 inline-flex items-center gap-2 text-sm font-semibold text-nexus-orange-300 transition-colors hover:text-nexus-orange-200"
          >
            Découvrir les protections
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
