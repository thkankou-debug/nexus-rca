// ────────────────────────────────────────────────────────────────────────────
// Templates de messages WhatsApp Nexus RCA.
// 6 événements : RDV nouveau, rappel J-1, lien paiement, paiement reçu,
// nouvelle demande visa (staff), changement statut visa (client).
//
// Format texte simple compatible Sandbox Twilio + production.
// En production avec templates approuvés, on remplacera par template SIDs.
// ────────────────────────────────────────────────────────────────────────────

const SIGNATURE = "\n\n— Nexus RCA · Bangui\n+236 73 26 96 92";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com";

/** A. Nouveau RDV créé → client */
export function tplRdvConfirmation(p: {
  nom: string;
  service: string;
  date: string;
  heure: string;
  reference: string;
}): string {
  return [
    `Bonjour ${p.nom},`,
    "",
    `Votre rendez-vous Nexus RCA est confirmé ✅`,
    "",
    `📅 ${p.date} à ${p.heure}`,
    `🎯 Service : ${p.service}`,
    `🔖 Référence : ${p.reference}`,
    "",
    `Adresse : Croisement Marabena, Route de l'Aéroport, Bangui.`,
    `Suivi : ${SITE_URL}/dashboard/client/rdv`,
  ].join("\n") + SIGNATURE;
}

/** B. Rappel RDV J-1 → client */
export function tplRdvReminder(p: {
  nom: string;
  service: string;
  heure: string;
  reference: string;
}): string {
  return [
    `Bonjour ${p.nom},`,
    "",
    `Rappel : votre rendez-vous Nexus RCA est demain.`,
    "",
    `⏰ ${p.heure}`,
    `🎯 ${p.service}`,
    `🔖 ${p.reference}`,
    "",
    `📍 Croisement Marabena, Route de l'Aéroport, Bangui.`,
    "",
    `Si empêchement, prévenez-nous au plus vite.`,
  ].join("\n") + SIGNATURE;
}

/** C. Lien de paiement créé → client */
export function tplPaymentLinkCreated(p: {
  nom: string;
  montant: string;
  devise: string;
  service: string;
  reference: string;
  url: string;
}): string {
  return [
    `Bonjour ${p.nom},`,
    "",
    `Votre lien de paiement Nexus RCA est prêt 💳`,
    "",
    `💰 ${p.montant} ${p.devise}`,
    `🎯 ${p.service}`,
    `🔖 ${p.reference}`,
    "",
    `Payer maintenant :`,
    p.url,
    "",
    `Méthodes acceptées : Orange Money, MTN MoMo, Express RCA, virement, espèces.`,
  ].join("\n") + SIGNATURE;
}

/** D. Paiement reçu → client */
export function tplPaymentReceived(p: {
  nom: string;
  montant: string;
  devise: string;
  reference: string;
  receiptUrl?: string;
}): string {
  const lines = [
    `Bonjour ${p.nom},`,
    "",
    `Paiement reçu ✅`,
    "",
    `💰 ${p.montant} ${p.devise}`,
    `🔖 ${p.reference}`,
    "",
    `Merci pour votre confiance.`,
  ];
  if (p.receiptUrl) {
    lines.push("", `Reçu PDF : ${p.receiptUrl}`);
  }
  return lines.join("\n") + SIGNATURE;
}

/** E. Nouvelle demande visa (express) → staff (alerte interne) */
export function tplVisaExpressStaff(p: {
  nomClient: string;
  pays: string;
  typeVisa: string;
  urgence: string;
  reference: string;
  whatsappClient?: string;
}): string {
  const urgenceEmoji =
    p.urgence === "critique" ? "🔴" : p.urgence === "urgent" ? "🟠" : "🟢";
  const lines = [
    `${urgenceEmoji} Nouvelle demande visa express`,
    "",
    `👤 ${p.nomClient}`,
    `🌍 ${p.pays}`,
    `📋 ${p.typeVisa}`,
    `⚡ Urgence : ${p.urgence}`,
    `🔖 ${p.reference}`,
  ];
  if (p.whatsappClient) {
    lines.push(`📱 Client : ${p.whatsappClient}`);
  }
  lines.push(
    "",
    `Dashboard : ${SITE_URL}/dashboard/super-admin/demandes-visa`
  );
  return lines.join("\n");
}

/** F. Statut visa changé → client */
export function tplVisaStatusUpdate(p: {
  nom: string;
  pays: string;
  reference: string;
  status: string;
}): string {
  const statusLabel: Record<string, string> = {
    nouveau: "Reçue ✅",
    en_cours: "En cours de traitement 🔄",
    traite: "Traitée ✅",
    annule: "Annulée ❌",
  };
  const label = statusLabel[p.status] || p.status;
  return [
    `Bonjour ${p.nom},`,
    "",
    `Votre demande visa Nexus RCA est mise à jour.`,
    "",
    `🌍 ${p.pays}`,
    `🔖 ${p.reference}`,
    `📊 Statut : ${label}`,
    "",
    `Pour toute question, répondez à ce message ou contactez votre conseiller.`,
  ].join("\n") + SIGNATURE;
}
