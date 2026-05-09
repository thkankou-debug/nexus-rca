// ============================================================================
// TEMPLATE — Notif au client : le conseiller demande un document complémentaire
// ============================================================================

import { escapeHtml, getSiteUrl, renderCta, renderEmailLayout } from "./index";

export interface ClientDocumentDemandeData {
  clientPrenom: string | null;
  clientNomComplet: string;
  reference: string;
  conseillerNom: string;
  documentsDemandes: { type: string; description: string | null }[];
  demandeId: string;
}

export function clientDocumentDemandeEmail(
  data: ClientDocumentDemandeData
): { subject: string; html: string } {
  const site = getSiteUrl();
  const link = `${site}/dashboard/client/demandes/${escapeHtml(data.demandeId)}`;
  const greeting = data.clientPrenom
    ? `Bonjour ${escapeHtml(data.clientPrenom)},`
    : `Bonjour ${escapeHtml(data.clientNomComplet)},`;

  const docsList = data.documentsDemandes
    .map(
      (d) =>
        `<li style="margin:0 0 8px;font-size:13px;color:#0C1C40;">
          <strong>${escapeHtml(d.type)}</strong>${d.description ? ` — <span style="color:#475569;">${escapeHtml(d.description)}</span>` : ""}
        </li>`
    )
    .join("");

  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;color:#475569;">
      Pour faire avancer votre dossier
      <strong style="color:#FF6600;font-family:monospace;">${escapeHtml(data.reference)}</strong>,
      votre conseiller <strong style="color:#0C1C40;">${escapeHtml(data.conseillerNom)}</strong>
      vous demande de fournir le(s) document(s) suivant(s) :
    </p>
    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:#fff7ed;border-radius:12px;border:1px solid #fed7aa;">
      <tr><td style="padding:18px 22px;">
        <ul style="margin:0;padding-left:20px;">
          ${docsList}
        </ul>
      </td></tr>
    </table>
    <p style="margin:0 0 14px;color:#475569;">
      Téléversez les fichiers directement depuis votre espace Nexus Connect.
      Formats acceptés : PDF, JPG, PNG, DOC. Taille maximale : 10 Mo par fichier.
    </p>
    ${renderCta("Ouvrir mon dossier et téléverser", link)}
  `;

  return {
    subject: `Action requise · documents pour le dossier ${data.reference}`,
    html: renderEmailLayout({
      eyebrow: "DOCUMENTS REQUIS",
      title: "Votre conseiller a besoin de documents",
      contentHtml: content,
    }),
  };
}
