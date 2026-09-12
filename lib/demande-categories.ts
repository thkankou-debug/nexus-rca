// ============================================================================
// LIB — Catégories de dossiers (9 buckets)
// Source de vérité côté code TS — alignée avec la migration 032
// (CHECK constraint demandes_categorie_dossier_check + map_service_to_categorie)
// ============================================================================

import {
  type LucideIcon,
  Plane,
  GraduationCap,
  Ticket,
  ShieldCheck,
  Briefcase,
  Laptop,
  FileSearch,
  Send,
  Folder,
} from "lucide-react";

export const CATEGORIES_DOSSIER = [
  "visa",
  "etudes_bourses",
  "billets_hotels",
  "assurances",
  "financement_incubateur",
  "digitalisation",
  "recouvrement",
  "transferts",
  "autres",
] as const;

export type CategorieDossier = (typeof CATEGORIES_DOSSIER)[number];

export interface CategorieMeta {
  slug: CategorieDossier;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** Classes Tailwind pour le fond de l'icône (cards) */
  iconBg: string;
  /** Classes Tailwind pour la couleur de l'icône */
  iconColor: string;
}

export const CATEGORIE_META: Record<CategorieDossier, CategorieMeta> = {
  visa: {
    slug: "visa",
    label: "Dossiers Visa",
    shortLabel: "Visa",
    icon: Plane,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  etudes_bourses: {
    slug: "etudes_bourses",
    label: "Études & Bourses",
    shortLabel: "Études",
    icon: GraduationCap,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-700",
  },
  billets_hotels: {
    slug: "billets_hotels",
    label: "Billets & Hôtels",
    shortLabel: "Billets",
    icon: Ticket,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-700",
  },
  assurances: {
    slug: "assurances",
    label: "Assurances",
    shortLabel: "Assurances",
    icon: ShieldCheck,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
  financement_incubateur: {
    slug: "financement_incubateur",
    label: "Financement & Incubateur",
    shortLabel: "Financement",
    icon: Briefcase,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
  },
  digitalisation: {
    slug: "digitalisation",
    label: "Digitalisation",
    shortLabel: "Digital",
    icon: Laptop,
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-700",
  },
  recouvrement: {
    slug: "recouvrement",
    label: "Recouvrement de documents",
    shortLabel: "Recouvrement",
    icon: FileSearch,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  transferts: {
    slug: "transferts",
    label: "Transferts d'argent",
    shortLabel: "Transferts",
    icon: Send,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
  },
  autres: {
    slug: "autres",
    label: "Autres dossiers",
    shortLabel: "Autres",
    icon: Folder,
    iconBg: "bg-slate-100",
    iconColor: "text-slate-700",
  },
};

/**
 * Type guard — valide que la string est bien une catégorie connue.
 * Utilisé pour parser les segments d'URL [categorie].
 */
export function isCategorieDossier(value: string): value is CategorieDossier {
  return (CATEGORIES_DOSSIER as readonly string[]).includes(value);
}

/**
 * Mapping service (label libre formulaire) → catégorie (slug DB).
 * Doit rester aligné avec la fonction SQL public.map_service_to_categorie().
 *
 * Stratégie : normalisation par mots-clés (ILIKE en SQL, regex en TS).
 */
export function getCategorieFromService(service: string | null | undefined): CategorieDossier {
  const s = (service || "").toLowerCase();
  if (/(visa|e-?visa)/.test(s)) return "visa";
  if (/(étud|etud|bourse|tcf|ielts|orient)/.test(s)) return "etudes_bourses";
  if (/(billet|vol|hôtel|hotel|voyage)/.test(s)) return "billets_hotels";
  if (/(assurance|santé|sante)/.test(s)) return "assurances";
  if (/(incubateur|financement|investiss|partenariat|business)/.test(s))
    return "financement_incubateur";
  if (/(digital|site web|application|app mobile|marketing)/.test(s))
    return "digitalisation";
  if (/(recouvrement|acte|diplôme|diplome|légalisation|legalisation|apostille|casier|bulletin)/.test(s))
    return "recouvrement";
  if (/(transfert|change|mobile money)/.test(s)) return "transferts";
  return "autres";
}

/**
 * Liste ordonnée pour affichage dans les sidebars / dashboards.
 */
export function listCategoriesMeta(): CategorieMeta[] {
  return CATEGORIES_DOSSIER.map((slug) => CATEGORIE_META[slug]);
}

/**
 * Étape 6 (Espaces DG / Responsable de service) : pôle officiel
 * (services.categorie) → catégories de dossiers supervisées. Périmètre du
 * chef de service : demandes.service_id est NULL sur tous les dossiers
 * réels (11/09/2026), le pôle via categorie_dossier est le périmètre
 * réellement mesurable — service_id reste prioritaire quand il sera
 * renseigné. "Accompagnement business" et "transverse" n'ont aucune
 * catégorie de dossier correspondante.
 */
export const POLE_TO_CATEGORIES: Record<string, CategorieDossier[]> = {
  "Visa et mobilite": ["visa"],
  "Etudes internationales": ["etudes_bourses"],
  "Assurance et voyage": ["assurances", "billets_hotels"],
  "Reseau international": ["transferts"],
  "Financement et incubation": ["financement_incubateur"],
  "Digitalisation et technologie": ["digitalisation"],
  "Services administratifs": ["recouvrement", "autres"],
  "Accompagnement business": [],
  transverse: [],
};
