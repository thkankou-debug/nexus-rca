/**
 * Estimation tarifaire indicative pour les devis assurance.
 *
 * Modèle simplifié de courtier : la fonction estimate() calcule une
 * fourchette à partir des paramètres du formulaire. Le tarif définitif est
 * établi par le cabinet après étude — c'est une fourchette indicative qui
 * sert à donner un ordre de grandeur crédible au client.
 *
 * Bases tarifaires (en euros) issues de moyennes marché 2025-2026
 * pour des assurances équivalentes voyage/santé internationale.
 */

import type { CoverageType, QuoteFormData, Estimate } from "./types";

// Tarif journalier de base pour une assurance voyage standard adulte 26-65 ans
// Fourchette : min (offres économiques pertinentes) → max (offres premium).
const SCHENGEN_BASE_PER_DAY: { min: number; max: number } = { min: 1.1, max: 2.4 };
const VOYAGE_INTL_BASE_PER_DAY: { min: number; max: number } = { min: 1.4, max: 3.0 };

// Tarifs longue durée annuels (en euros)
const SANTE_INTL_ANNUAL: { min: number; max: number } = { min: 800, max: 1500 };
const ETUDES_ANNUAL: { min: number; max: number } = { min: 600, max: 1100 };
const BUSINESS_ANNUAL: { min: number; max: number } = { min: 1500, max: 3500 };

// Multiplicateur âge (par tranche)
function ageFactor(age: number): number {
  if (age < 0) return 1;
  if (age <= 25) return 0.8;
  if (age <= 65) return 1.0;
  if (age <= 75) return 1.6;
  return 2.2;
}

// Multiplicateur groupe — léger discount à partir de 2 voyageurs
function groupFactor(n: number): number {
  if (n <= 1) return 1;
  if (n <= 3) return 0.95;
  if (n <= 6) return 0.88;
  return 0.82;
}

function durationDays(formData: QuoteFormData): number {
  if (!formData.date_depart || !formData.date_retour) return 0;
  const a = new Date(formData.date_depart);
  const b = new Date(formData.date_retour);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}

/**
 * Estime la fourchette tarifaire pour un dossier.
 * Retourne null si pas assez d'informations pour estimer.
 */
export function estimate(formData: QuoteFormData): Estimate | null {
  const types = formData.coverage_types;
  if (types.length === 0) return null;

  const ages = formData.traveler_ages.length > 0 ? formData.traveler_ages : [30];
  const avgAgeFactor =
    ages.reduce((sum, a) => sum + ageFactor(a), 0) / ages.length;

  const groupF = groupFactor(formData.num_travelers);
  const days = durationDays(formData);

  let minTotal = 0;
  let maxTotal = 0;
  const breakdown: string[] = [];

  // Pour chaque type de couverture sélectionné, accumule la fourchette
  for (const type of types) {
    const sub = computeSubtotal(type, days, formData.num_travelers, avgAgeFactor, groupF);
    if (sub) {
      minTotal += sub.min;
      maxTotal += sub.max;
      breakdown.push(sub.label);
    }
  }

  if (minTotal === 0 && maxTotal === 0) return null;

  return {
    min: Math.round(minTotal),
    max: Math.round(maxTotal),
    currency: "EUR",
    breakdown,
  };
}

function computeSubtotal(
  type: CoverageType,
  days: number,
  nTravelers: number,
  ageF: number,
  groupF: number
): { min: number; max: number; label: string } | null {
  switch (type) {
    case "schengen": {
      // Si pas de durée, on prend 30 jours par défaut
      const d = days > 0 ? days : 30;
      const min = SCHENGEN_BASE_PER_DAY.min * d * nTravelers * ageF * groupF;
      const max = SCHENGEN_BASE_PER_DAY.max * d * nTravelers * ageF * groupF;
      return {
        min,
        max,
        label: `Schengen (${d} jours · ${nTravelers} voyageur${nTravelers > 1 ? "s" : ""})`,
      };
    }
    case "voyage_intl": {
      const d = days > 0 ? days : 14;
      const min = VOYAGE_INTL_BASE_PER_DAY.min * d * nTravelers * ageF * groupF;
      const max = VOYAGE_INTL_BASE_PER_DAY.max * d * nTravelers * ageF * groupF;
      return {
        min,
        max,
        label: `Voyage international (${d} jours · ${nTravelers} voyageur${nTravelers > 1 ? "s" : ""})`,
      };
    }
    case "sante_intl": {
      // Annuel par voyageur
      const min = SANTE_INTL_ANNUAL.min * nTravelers * ageF * groupF;
      const max = SANTE_INTL_ANNUAL.max * nTravelers * ageF * groupF;
      return {
        min,
        max,
        label: `Santé internationale annuelle (${nTravelers} bénéficiaire${nTravelers > 1 ? "s" : ""})`,
      };
    }
    case "etudes": {
      // Annuel par étudiant
      const min = ETUDES_ANNUAL.min * nTravelers * ageF;
      const max = ETUDES_ANNUAL.max * nTravelers * ageF;
      return {
        min,
        max,
        label: `Études à l'étranger annuelle (${nTravelers} étudiant${nTravelers > 1 ? "s" : ""})`,
      };
    }
    case "business": {
      // Forfait annuel par voyageur business
      const min = BUSINESS_ANNUAL.min * nTravelers * ageF * groupF;
      const max = BUSINESS_ANNUAL.max * nTravelers * ageF * groupF;
      return {
        min,
        max,
        label: `Business multi-déplacements (${nTravelers} voyageur${nTravelers > 1 ? "s" : ""})`,
      };
    }
    default:
      return null;
  }
}

/**
 * Format affichage : "180 € — 320 €" ou "1 200 € — 2 400 €"
 */
export function formatRange(est: Estimate | null): string {
  if (!est) return "—";
  const f = (n: number) => n.toLocaleString("fr-FR").replace(/ /g, " ");
  return `${f(est.min)} ${est.currency === "EUR" ? "€" : est.currency} — ${f(est.max)} ${est.currency === "EUR" ? "€" : est.currency}`;
}

/**
 * Calcule la durée en jours pour stockage / affichage.
 */
export function computeDurationDays(
  date_depart: string,
  date_retour: string
): number | null {
  if (!date_depart || !date_retour) return null;
  const a = new Date(date_depart);
  const b = new Date(date_retour);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;
  const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}
