// Module commercial phase 1 — catalogue = table `services` (visibilite_publique).
// Trois types d'offre dérivés du tarif existant, sans nouvelle colonne.

export type OffreKind = "achetable" | "devis" | "contact";

export interface BoutiqueOffre {
  id: string;
  slug: string;
  nom: string;
  categorie: string;
  description: string | null;
  tarif_type: "fixe" | "sur_devis" | string;
  tarif_montant: number | null;
  devise: string;
  delai_indicatif: string | null;
  kind: OffreKind;
}

export const BOUTIQUE_SELECT =
  "id, slug, nom, categorie, description, tarif_type, tarif_montant, devise, delai_indicatif";

export function offreKind(row: {
  tarif_type: string;
  tarif_montant: number | null;
}): OffreKind {
  if (row.tarif_type === "fixe" && Number(row.tarif_montant) > 0) return "achetable";
  if (row.tarif_type === "sur_devis") return "devis";
  return "contact";
}

export function mapOffre(row: {
  id: string;
  slug: string;
  nom: string;
  categorie: string;
  description: string | null;
  tarif_type: string;
  tarif_montant: number | null;
  devise: string | null;
  delai_indicatif: string | null;
}): BoutiqueOffre {
  return {
    id: row.id,
    slug: row.slug,
    nom: row.nom,
    categorie: row.categorie,
    description: row.description,
    tarif_type: row.tarif_type,
    tarif_montant: row.tarif_montant == null ? null : Number(row.tarif_montant),
    devise: row.devise || "XAF",
    delai_indicatif: row.delai_indicatif,
    kind: offreKind(row),
  };
}

export function formatXaf(amount: number, devise = "XAF"): string {
  const n = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(n);
  return `${formatted.replace(/\u202f/g, " ").replace(/\u00a0/g, " ")} ${devise}`;
}

export const KIND_LABEL: Record<OffreKind, string> = {
  achetable: "Prix fixe",
  devis: "Sur devis",
  contact: "Nous contacter",
};

export const COMMANDE_STATUS_LABEL: Record<
  string,
  { label: string; className: string }
> = {
  transmise: {
    label: "Transmise — non payée",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  en_traitement: {
    label: "En traitement",
    className: "bg-blue-50 text-blue-800 border-blue-200",
  },
  annulee: {
    label: "Annulée",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  facturee: {
    label: "Facturée",
    className: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  payee: {
    label: "Payée",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
};
