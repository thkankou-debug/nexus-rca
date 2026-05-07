"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Globe,
  LayoutGrid,
  Sparkles,
  Clock,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type PackKey = "essentiel" | "pro" | "premium";

type Pack = {
  key: PackKey;
  name: string;
  tagline: string;
  price: string;
  duration: string;
  icon: typeof Globe;
  features: string[];
};

// ─── Données packs ─────────────────────────────────────────────────────────

const PACKS: Pack[] = [
  {
    key: "essentiel",
    name: "Essentiel",
    tagline: "Démarrer une présence digitale crédible",
    price: "150 000 - 250 000 FCFA",
    duration: "1 mois support",
    icon: Globe,
    features: [
      "Site vitrine 1 à 3 pages",
      "E-mail professionnel configuré",
      "WhatsApp Business intégré",
      "Formulaire de contact simple",
      "Mise en ligne et hébergement",
      "Formation prise en main de base",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "Une vraie image professionnelle",
    price: "300 000 - 600 000 FCFA",
    duration: "3 mois support",
    icon: LayoutGrid,
    features: [
      "Tout le pack Essentiel inclus",
      "Catalogue produits / services",
      "Réservation ou prise de rendez-vous en ligne",
      "Tableau analytics simple intégré",
      "Branding sur-mesure simple",
      "Pages services détaillées",
    ],
  },
  {
    key: "premium",
    name: "Premium",
    tagline: "Une plateforme complète pour développer",
    price: "700 000 - 1 500 000 FCFA+",
    duration: "12 mois support",
    icon: Sparkles,
    features: [
      "Tout le pack Pro inclus",
      "Module e-commerce complet",
      "Multi-langues (FR / EN)",
      "SEO avancé + stratégie contenus",
      "Automatisation WhatsApp et e-mail",
      "Tableau de bord client dédié",
    ],
  },
];

// ─── Composant ──────────────────────────────────────────────────────────────

export function PackPreviewSwitcher() {
  const [active, setActive] = useState<PackKey>("pro");
  const pack = PACKS.find((p) => p.key === active) ?? PACKS[1];
  const Icon = pack.icon;

  return (
    <div className="relative">
      {/* Toggle 3 boutons */}
      <div className="mx-auto mb-8 flex w-full max-w-2xl items-center justify-center">
        <div className="relative inline-flex w-full items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:gap-1.5">
          {PACKS.map((p) => {
            const isActive = p.key === active;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setActive(p.key)}
                aria-pressed={isActive}
                className={`group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-[0.16em] transition-all duration-300 ease-out sm:px-5 sm:py-3 sm:text-sm sm:tracking-[0.18em] ${
                  isActive
                    ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.5)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 rounded-xl bg-nexus-orange-500/30 blur-md"
                  />
                )}
                <span className="hidden sm:inline">{p.name}</span>
                <span className="sm:hidden">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live preview card */}
      <div
        key={active}
        className="relative overflow-hidden rounded-3xl border border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] p-7 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] transition-all duration-500 ease-out animate-[packFade_0.5s_ease-out] sm:p-9"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-nexus-orange-500/25 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-nexus-blue-500/20 blur-[100px]"
        />

        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-10">
          {/* Colonne gauche : nom géant + tagline + prix + CTA */}
          <div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-2xl bg-nexus-orange-500/40 blur-md"
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)] ring-1 ring-white/10">
                  <Icon className="h-7 w-7" />
                </div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-nexus-orange-400/30 bg-nexus-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-nexus-orange-400" />
                </span>
                Pack {pack.name}
              </span>
            </div>

            <h3 className="mt-6 font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                {pack.name}
              </span>
            </h3>
            <p className="mt-4 text-base leading-relaxed text-slate-200 sm:text-lg">
              {pack.tagline}
            </p>

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur ring-1 ring-white/5">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                Tarif indicatif
              </p>
              <p className="mt-2 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                {pack.price}
              </p>
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                <Clock className="h-3 w-3 text-nexus-orange-300" />
                {pack.duration}
              </p>
            </div>

            <Link
              href={`/services/digitalisation/demarrer?pack=${pack.key}`}
              className="group/cta mt-7 inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-nexus-orange-500 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-10px_rgba(255,102,0,0.6)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-nexus-orange-600 hover:shadow-[0_18px_45px_-10px_rgba(255,102,0,0.7)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 ease-out group-hover/cta:left-[120%] group-hover/cta:opacity-100"
              />
              Demander le pack {pack.name}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-0.5" />
            </Link>
          </div>

          {/* Colonne droite : liste features */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/5 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] sm:p-7">
            <p className="bg-gradient-to-r from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-[10px] font-bold uppercase tracking-[0.22em] text-transparent">
              Inclus dans ce pack
            </p>
            <ul className="mt-4 space-y-3.5">
              {pack.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed text-slate-200 sm:text-base"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow-[0_6px_14px_-6px_rgba(255,102,0,0.5)] ring-1 ring-white/10">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Hint sous le toggle */}
      <p className="mt-5 text-center text-[11px] text-white/50">
        Cliquez sur un pack pour ajuster la prévisualisation. Devis final cadré
        après étude de votre activité.
      </p>

      {/* Animation keyframe */}
      <style jsx>{`
        @keyframes packFade {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
