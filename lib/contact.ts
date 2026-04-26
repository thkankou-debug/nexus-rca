// ============================================================================
// COORDONNEES NEXUS RCA — source unique de verite
// ============================================================================
// Pour modifier les coordonnees, il suffit de changer les valeurs ici.
// Tous les composants du site (Footer, WhatsAppFloat, Contact, etc.) utilisent
// ce fichier comme reference.
// ============================================================================

export const NEXUS_CONTACT = {
  // Numero principal RCA (utilise pour WhatsApp par defaut)
  phoneRca: "+236 73 26 96 92",
  phoneRcaRaw: "23673269692", // sans espaces, pour les liens wa.me et tel:

  // Numero international Canada (secondaire)
  phoneCanada: "+1 587 327 6344",
  phoneCanadaRaw: "15873276344", // sans espaces

  // Email
  email: "contact@nexusrca.com",

  // Site web
  website: "www.nexusrca.com",
  websiteUrl: "https://www.nexusrca.com",

  // Adresse
  addressLine1: "Relais Sica, vers Hôpital Général",
  addressLine2: "Bangui, République Centrafricaine",
  addressShort: "Bangui, République Centrafricaine",

  // Note importante
  appointmentOnly: "Sur rendez-vous uniquement",
} as const;

/**
 * Construit un lien WhatsApp avec un message pre-rempli
 * Utilise le numero RCA principal par defaut
 */
export function buildWhatsappLink(
  message: string,
  options?: { useCanada?: boolean }
): string {
  const number = options?.useCanada
    ? NEXUS_CONTACT.phoneCanadaRaw
    : NEXUS_CONTACT.phoneRcaRaw;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Construit un lien tel: pour clic-pour-appeler
 */
export function buildPhoneLink(useCanada = false): string {
  const number = useCanada
    ? NEXUS_CONTACT.phoneCanadaRaw
    : NEXUS_CONTACT.phoneRcaRaw;
  return `tel:+${number}`;
}
