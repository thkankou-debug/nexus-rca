/** Visuels de services — fichiers dans /public/images/services/*.webp */

export interface ServiceVisual {
  src: string;
  alt: string;
}

const VISUALS: Record<string, ServiceVisual> = {
  visa: {
    src: "/images/services/visa.webp",
    alt: "Conseiller Nexus RCA examinant un passeport avec une cliente à Bangui",
  },
  billets: {
    src: "/images/services/billets.webp",
    alt: "Voyageurs africains en salle d’embarquement, billets et hôtel",
  },
  "billet-avion-hotel": {
    src: "/images/services/billets.webp",
    alt: "Voyageurs africains en salle d’embarquement, billets et hôtel",
  },
  assurance: {
    src: "/images/services/assurance.webp",
    alt: "Famille centrafricaine préparant un départ avec sérénité",
  },
  tcf: {
    src: "/images/services/tcf.webp",
    alt: "Cours de français TCF dans une salle de classe à Bangui",
  },
  etudes: {
    src: "/images/services/etudes.webp",
    alt: "Étudiante centrafricaine sur un campus universitaire",
  },
  bourses: {
    src: "/images/services/bourses.webp",
    alt: "Étudiant préparant un dossier de bourse d’études",
  },
  financement: {
    src: "/images/services/financement.webp",
    alt: "Entrepreneurs et conseiller travaillant sur un projet d’incubation",
  },
  incubateur: {
    src: "/images/services/financement.webp",
    alt: "Entrepreneurs et conseiller travaillant sur un projet d’incubation",
  },
  administratif: {
    src: "/images/services/administratif.webp",
    alt: "Préparation de documents officiels au guichet Nexus RCA",
  },
  transfert: {
    src: "/images/services/transfert.webp",
    alt: "Opération de transfert d’argent au comptoir, cadre professionnel",
  },
  change: {
    src: "/images/services/change.webp",
    alt: "Échange de devises au bureau de change Nexus RCA",
  },
  rdv: {
    src: "/images/services/rdv.webp",
    alt: "Accueil d’un client pour une consultation à l’agence",
  },
  "rendez-vous": {
    src: "/images/services/rdv.webp",
    alt: "Accueil d’un client pour une consultation à l’agence",
  },
  "nexus-connect": {
    src: "/images/services/nexus-connect.webp",
    alt: "Cliente suivant ses dossiers NEXUS CONNECT avec un conseiller",
  },
  digitalisation: {
    src: "/images/services/digitalisation.webp",
    alt: "Création d’un site et d’une présence digitale à Bangui",
  },
  "nexus-ia": {
    src: "/images/services/nexus-ia.webp",
    alt: "Utilisateur échangeant avec l’assistant NEXUS IA sur ordinateur",
  },
  "accompagnement-business": {
    src: "/images/services/accompagnement-business.webp",
    alt: "Réunion de stratégie business avec l’équipe Nexus",
  },
  "reseau-international": {
    src: "/images/services/reseau-international.webp",
    alt: "Coordination professionnelle entre Bangui, le Canada et l’Europe",
  },
};

const CATEGORY_HINTS: { test: RegExp; key: string }[] = [
  { test: /visa|mobilit/i, key: "visa" },
  { test: /billet|h[oô]tel|avion|voyage a[eé]rien/i, key: "billets" },
  { test: /assurance/i, key: "assurance" },
  { test: /\btcf\b|fran[cç]ais/i, key: "tcf" },
  { test: /bourse/i, key: "bourses" },
  { test: /[eé]tude/i, key: "etudes" },
  { test: /financ|incubat/i, key: "financement" },
  { test: /administ|bureaut|document|l[eé]galis|photocop|scan|traduction|plastif|saisie/i, key: "administratif" },
  { test: /transfert|argent/i, key: "transfert" },
  { test: /change|devise/i, key: "change" },
  { test: /rendez|rdv|consult/i, key: "rdv" },
  { test: /connect/i, key: "nexus-connect" },
  { test: /digital/i, key: "digitalisation" },
  { test: /\bia\b|assistant/i, key: "nexus-ia" },
  { test: /business|accompagn/i, key: "accompagnement-business" },
  { test: /r[eé]seau|international/i, key: "reseau-international" },
];

export function resolveServiceVisual(
  slug?: string | null,
  categorie?: string | null
): ServiceVisual {
  const s = (slug || "").toLowerCase().trim();
  if (s && VISUALS[s]) return VISUALS[s];
  for (const { test, key } of CATEGORY_HINTS) {
    if (s && test.test(s)) return VISUALS[key];
  }
  const c = categorie || "";
  for (const { test, key } of CATEGORY_HINTS) {
    if (test.test(c)) return VISUALS[key];
  }
  return VISUALS.administratif;
}
