// ============================================================================
// CONFIGURATION FACTURATION — Nexus RCA (cahier §8, décisions Thierry
// 12/09/2026 : « pas de taxe et pas de TVA, NIF et RCCM viendront plus
// tard »). AUCUNE valeur fiscale inventée : les champs vides sont OMIS du
// PDF. Quand le NIF/RCCM arrivent, il suffit de remplir les constantes
// ci-dessous — un seul fichier à modifier.
// ============================================================================

/** Identité légale — chaîne vide = ligne absente de la facture. */
export const FACTURE_IDENTITE = {
  raisonSociale: "NEXUS RCA",
  adresse: "Croisement Marabena, route de l'aéroport, P.O. Box 1204, Bangui, République centrafricaine",
  telephone: "+236 70 21 95 25",
  email: "contact@nexusrca.com",
  siteWeb: "www.nexusrca.com",
  nif: "", // à renseigner dès attribution — jamais inventé
  rccm: "", // à renseigner dès attribution — jamais inventé
} as const;

/** Aucune taxe ni TVA appliquée (décision du 12/09/2026). */
export const FACTURE_TAXES_APPLICABLES = false;

/** Échéance par défaut en jours après émission (0 = payable à réception). */
export const FACTURE_ECHEANCE_JOURS_DEFAUT = 0;

/**
 * Conditions de règlement par défaut — rédigées pour protéger Nexus RCA
 * (modifiables facture par facture à la création).
 */
export const FACTURE_CONDITIONS_DEFAUT = [
  "Facture payable à réception, sauf échéance expressément indiquée.",
  "Toute prestation engagée est due dans son intégralité, y compris en cas de décision négative d'un tiers (ambassade, consulat, compagnie ou partenaire), NEXUS RCA étant tenue à une obligation de moyens et non de résultat.",
  "Les frais engagés auprès de tiers pour le compte du client ne sont pas remboursables.",
  "Les montants réglés restent acquis à NEXUS RCA à hauteur des prestations effectuées.",
  "Toute réclamation doit être formulée par écrit dans les sept (7) jours suivant l'émission de la présente facture.",
  "En cas de retard de paiement, NEXUS RCA se réserve le droit de suspendre les prestations en cours jusqu'à régularisation.",
].join("\n");

/** Pied de page légal du PDF. */
export const FACTURE_MENTIONS_PIED = "Document généré par NEXUS RCA — la présente facture décrit les sommes dues ; seul un reçu de paiement atteste d'un règlement.";
