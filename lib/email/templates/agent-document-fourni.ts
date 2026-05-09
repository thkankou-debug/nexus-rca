// ============================================================================
// TEMPLATE — Notif à l'agent : le client a fourni un document précédemment demandé
// ============================================================================

import { escapeHtml, getSiteUrl, renderCta, renderEmailLayout } from "./index";

export interface AgentDocumentFourniData {
  agentPrenom: string | null;
  reference: string;
  clientNom: string;
  fileName: string;
  categorieDocument: string;
  categorieDossierSlug: string;
  demandeId: string;
}

export function agentDocumentFourniEmail(
  data: AgentDocumentFourniData
): { subject: string; html: string } {
  const site = getSiteUrl();
  const link = `${site}/dashboard/agent/dossiers/${escapeHtml(data.categorieDossierSlug)}/${escapeHtml(data.demandeId)}`;
  const greeting = data.agentPrenom ? `Bonjour ${escapeHtml(data.agentPrenom)},` : "Bonjour,";

  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;color:#475569;">
      <strong style="color:#0C1C40;">${escapeHtml(data.clientNom)}</strong> vient de
      téléverser un document pour son dossier
      <strong style="color:#FF6600;font-family:monospace;">${escapeHtml(data.reference)}</strong>.
    </p>
    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:#ecfdf5;border-radius:12px;border:1px solid #a7f3d0;">
      <tr><td style="padding:18px 22px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:#065f46;">DOCUMENT FOURNI</p>
        <p style="margin:0 0 4px;font-size:14px;color:#064e3b;"><strong>${escapeHtml(data.fileName)}</strong></p>
        <p style="margin:0;font-size:12px;color:#065f46;">Catégorie : ${escapeHtml(data.categorieDocument)}</p>
      </td></tr>
    </table>
    ${renderCta("Vérifier le document", link)}
  `;

  return {
    subject: `Document reçu · ${data.reference}`,
    html: renderEmailLayout({
      eyebrow: "DOCUMENT REÇU",
      title: `Le client a fourni un document`,
      contentHtml: content,
    }),
  };
}
