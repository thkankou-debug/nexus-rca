// ============================================================================
// Constantes des formulaires Accueil V4 (dossier, financement, client).
// Aucun tarif. Aligné sur le schéma demandes / clients existant.
// ============================================================================

export const PAYS_ACCUEIL = [
  "République Centrafricaine",
  "Cameroun",
  "Tchad",
  "Congo",
  "RDC",
  "Gabon",
  "France",
  "Canada",
  "Belgique",
  "Autre",
] as const;

export const UNITES_CAISSE = [
  "prestation",
  "page",
  "pièce",
  "kg",
  "heure",
  "jour",
  "unité",
] as const;

export type PrioriteAccueil = "normale" | "urgente" | "critique";

export function urgenceFromPriorite(p: PrioriteAccueil): "normale" | "elevee" | "critique" {
  if (p === "urgente") return "elevee";
  if (p === "critique") return "critique";
  return "normale";
}

export const STADES_PROJET = [
  { v: "idee", l: "Idée — pas encore structurée" },
  { v: "etude", l: "À l'étude" },
  { v: "pre_lancement", l: "Pré-lancement" },
  { v: "active_recente", l: "Activité lancée (< 2 ans)" },
  { v: "active_etablie", l: "Activité établie" },
] as const;

export const SECTEURS_PROJET = [
  "Agriculture & élevage",
  "Agroalimentaire",
  "Commerce & distribution",
  "Services B2B",
  "Éducation",
  "Santé",
  "Tech & numérique",
  "Industrie",
  "Tourisme",
  "BTP",
  "Énergie",
  "Transport",
  "Autre",
] as const;

export const PROFILS_PORTEUR = [
  "Jeune entrepreneur",
  "Commerçant / artisan",
  "Professionnel installé",
  "Groupe d'associés",
  "Diaspora / investisseur",
  "Autre",
] as const;

export const MONTANTS_FOURCHETTE = [
  "Moins de 5 M FCFA",
  "5 à 15 M",
  "15 à 50 M",
  "50 à 100 M",
  "Plus de 100 M",
] as const;

export const APPORTS_PROJET = [
  "Moins de 5 %",
  "5 à 15 %",
  "15 à 30 %",
  "30 à 50 %",
  "Plus de 50 %",
  "Non chiffré",
] as const;

export function isGuichetService(s: {
  categorie?: string | null;
  nom?: string | null;
  slug?: string | null;
}): boolean {
  if ((s.categorie || "") === "Services de proximite") return true;
  const blob = `${s.slug || ""} ${s.nom || ""} ${s.categorie || ""}`.toLowerCase();
  return /proximite|guichet|pressing|photocop|scan|saisie|traduction|plastif|location|impression|repassage/.test(
    blob
  );
}

export function isFinancementService(nom: string): boolean {
  const n = nom.toLowerCase();
  return n.includes("financement") || n.includes("incubateur");
}

export function tarifLabel(
  tarifType: string | null | undefined,
  tarifMontant: number | null | undefined
): string {
  if (tarifType === "fixe" && typeof tarifMontant === "number" && tarifMontant > 0) {
    return `${Math.round(tarifMontant).toLocaleString("fr-FR")} FCFA`;
  }
  return "À saisir · aucun tarif inventé";
}
