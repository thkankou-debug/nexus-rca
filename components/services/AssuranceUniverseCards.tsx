"use client";

import { useState } from "react";
import {
  Briefcase,
  ChevronDown,
  GraduationCap,
  Heart,
  Plane,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

/**
 * Assurance — Les 5 univers de couverture.
 *
 * Présentation cabinet : ce ne sont PAS 5 produits à acheter, mais 5
 * domaines de couverture conseillés et accompagnés par Nexus.
 *
 * Layout bento asymétrique :
 * - Ligne 1 : Voyage (col-span-2 = highlight) + Schengen (col-span-1)
 * - Ligne 2 : Santé internationale + Études + Business (col-span-1 chacune)
 *
 * Chaque card :
 * - Icon premium gradient
 * - Eyebrow + h3 sobre
 * - Description courte
 * - Toggle expansion → garanties détaillées + cible
 * - CTA "Demander un diagnostic"
 *
 * Hover : ring orange subtil + glow + lift discret. Aucun "économisez X%".
 */

type Universe = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  highlighted?: boolean;
  garanties: string[];
  cible: string;
  contexte: string;
};

const UNIVERSES: Universe[] = [
  {
    id: "voyage",
    eyebrow: "Univers 01",
    title: "Voyage & loisirs",
    description:
      "La couverture de référence pour vos séjours touristiques, courts et moyens. Médical, rapatriement, bagages, annulation — l'essentiel sans compromis.",
    icon: Plane,
    highlighted: true,
    garanties: [
      "Frais médicaux & hospitalisation à l'étranger",
      "Rapatriement sanitaire 24/7 multilingue",
      "Bagages & effets personnels (vol, perte, retard)",
      "Annulation, interruption & retour anticipé",
      "Responsabilité civile vie privée à l'étranger",
      "Assistance juridique & avance de caution",
    ],
    cible: "Voyageurs occasionnels & familles",
    contexte:
      "Adapté pour séjours touristiques jusqu'à 90 jours · Couverture mondiale.",
  },
  {
    id: "schengen",
    eyebrow: "Univers 02",
    title: "Visa Schengen obligatoire",
    description:
      "Conformité stricte au standard exigé par les consulats : 30 000 € minimum, espace Schengen, durée du séjour. Délivrée en 24 h ouvrées.",
    icon: ShieldCheck,
    garanties: [
      "Plafond médical 30 000 € minimum",
      "Validité géographique espace Schengen",
      "Conforme code visas UE (règlement 810/2009)",
      "Attestation officielle remise immédiatement",
      "Acceptée par tous les consulats Schengen",
    ],
    cible: "Demandeurs de visa Schengen",
    contexte:
      "Document indispensable pour le dossier consulaire · Délivrance 24 h.",
  },
  {
    id: "sante-internationale",
    eyebrow: "Univers 03",
    title: "Santé internationale",
    description:
      "Pour les séjours longue durée et les expatriations. Une vraie couverture santé internationale, pas un simple voyage prolongé.",
    icon: Stethoscope,
    garanties: [
      "Hospitalisation & soins courants à l'étranger",
      "Maternité & soins dentaires (selon formule)",
      "Médecine de prévention & bilans",
      "Évacuation médicale internationale",
      "Réseau de praticiens conventionnés mondial",
      "Tiers-payant hôpitaux partenaires",
    ],
    cible: "Expatriés, longue durée, familles",
    contexte:
      "Souscription par paliers (1, 2, 3 ans) · Renouvellement étudié au cas par cas.",
  },
  {
    id: "etudes",
    eyebrow: "Univers 04",
    title: "Études à l'étranger",
    description:
      "Couverture étudiant pensée pour les exigences des universités canadiennes, françaises et européennes. Compatible CAQ, Campus France, Schengen long séjour.",
    icon: GraduationCap,
    garanties: [
      "Santé internationale longue durée",
      "Responsabilité civile scolaire & vie privée",
      "Assistance rapatriement étudiant",
      "Bagages & effets personnels",
      "Interruption d'études (raisons médicales)",
      "Attestation pour université / consulat",
    ],
    cible: "Étudiants RCA → Canada, France, Europe",
    contexte:
      "Conforme aux exigences CAQ Québec, Campus France, visas long séjour.",
  },
  {
    id: "business",
    eyebrow: "Univers 05",
    title: "Business & déplacements pro",
    description:
      "Pour les dirigeants, missions répétées et déplacements professionnels exigeants. Couverture renforcée + conciergerie d'assistance dédiée.",
    icon: Briefcase,
    garanties: [
      "Frais médicaux relevés (jusqu'à 1 M €)",
      "Rapatriement VIP & accompagnement famille",
      "Annulation & interruption mission pro",
      "Matériel professionnel & data devices",
      "Responsabilité civile professionnelle voyage",
      "Conciergerie médicale & juridique 24/7",
    ],
    cible: "Dirigeants, cadres, missions répétées",
    contexte:
      "Souscriptions annuelles multi-déplacements · Tarif négocié grands comptes.",
  },
];

export function AssuranceUniverseCards() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
      {UNIVERSES.map((u) => {
        const Icon = u.icon;
        const isOpen = openId === u.id;
        const wide = u.highlighted; // Voyage = highlight col-span-2

        return (
          <article
            key={u.id}
            className={`group relative overflow-hidden rounded-3xl border backdrop-blur-xl ring-1 transition-all duration-300 ease-out hover:-translate-y-1 ${
              wide
                ? "lg:col-span-2 border-nexus-orange-400/30 bg-gradient-to-br from-nexus-orange-500/10 via-white/[0.04] to-white/[0.02] ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.30)] hover:border-nexus-orange-400/50"
                : "border-white/10 bg-white/[0.04] ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-nexus-orange-400/40 hover:bg-white/[0.06] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(255,102,0,0.25)]"
            }`}
          >
            {/* Glow d'ambiance */}
            <div
              aria-hidden
              className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl transition-all duration-500 ${
                wide
                  ? "bg-nexus-orange-500/20"
                  : "bg-nexus-orange-500/0 group-hover:bg-nexus-orange-500/15"
              }`}
            />

            <div className="relative flex flex-col p-6 sm:p-7">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div
                  className={`flex shrink-0 items-center justify-center rounded-2xl text-white shadow-sm ring-1 ring-white/10 transition-transform duration-300 ease-out group-hover:scale-105 ${
                    wide
                      ? "h-14 w-14 bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 shadow-[0_10px_28px_-10px_rgba(255,102,0,0.6)]"
                      : "h-12 w-12 bg-gradient-to-br from-nexus-blue-700 to-nexus-blue-900"
                  }`}
                >
                  <Icon className={wide ? "h-7 w-7" : "h-5 w-5"} />
                </div>

                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
                    {u.eyebrow}
                  </p>
                  <h3
                    className={`mt-1.5 font-display font-bold leading-tight text-white ${
                      wide
                        ? "text-2xl sm:text-3xl"
                        : "text-lg sm:text-xl"
                    }`}
                  >
                    {u.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p
                className={`mt-4 leading-relaxed text-slate-300 ${
                  wide ? "text-base sm:text-lg" : "text-sm"
                }`}
              >
                {u.description}
              </p>

              {/* Cible badge */}
              <div className="mt-5 inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                <Heart className="h-3 w-3 text-nexus-orange-300" />
                {u.cible}
              </div>

              {/* Toggle expansion */}
              <button
                type="button"
                onClick={() => toggle(u.id)}
                aria-expanded={isOpen}
                aria-controls={`universe-${u.id}-detail`}
                className="mt-5 inline-flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:border-nexus-orange-400/40 hover:bg-white/[0.06]"
              >
                <span>
                  {isOpen
                    ? "Réduire les garanties"
                    : "Voir les garanties détaillées"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-nexus-orange-300 transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Détails dépliés */}
              <div
                id={`universe-${u.id}-detail`}
                className={`grid transition-all duration-500 ease-out ${
                  isOpen
                    ? "mt-5 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="rounded-2xl border border-white/10 bg-nexus-blue-950/40 p-5 backdrop-blur">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-300">
                      Garanties principales
                    </p>
                    <ul
                      className={`mt-3 space-y-2 text-sm leading-relaxed text-slate-200 ${
                        wide ? "sm:grid sm:grid-cols-2 sm:gap-x-6 sm:space-y-0" : ""
                      }`}
                    >
                      {u.garanties.map((g, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-nexus-orange-400" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 border-t border-white/10 pt-3 text-xs italic leading-relaxed text-slate-400">
                      {u.contexte}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA discret */}
              <div className="mt-6 flex flex-1 items-end">
                <Link
                  href="/services/assurance/devis"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-nexus-orange-300 transition-colors hover:text-nexus-orange-200"
                >
                  Demander un diagnostic
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
