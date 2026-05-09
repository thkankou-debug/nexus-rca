// ============================================================================
// TEMPLATE — Notif au client : un conseiller a été assigné à son dossier
// ============================================================================

import { escapeHtml, getSiteUrl, renderCta, renderEmailLayout } from "./index";

export interface ClientConseillerAssigneData {
  clientPrenom: string | null;
  clientNomComplet: string;
  reference: string;
  service: string;
  conseillerNom: string;
  conseillerEmail: string | null;
  conseillerPoste: string | null;
  demandeId: string;
}

export function clientConseillerAssigneEmail(
  data: ClientConseillerAssigneData
): { subject: string; html: string } {
  const site = getSiteUrl();
  const link = `${site}/dashboard/client/demandes/${escapeHtml(data.demandeId)}`;
  const greeting = data.clientPrenom
    ? `Bonjour ${escapeHtml(data.clientPrenom)},`
    : `Bonjour ${escapeHtml(data.clientNomComplet)},`;

  const conseillerLine = data.conseillerEmail
    ? `<a href="mailto:${escapeHtml(data.conseillerEmail)}" style="color:#FF6600;">${escapeHtml(data.conseillerEmail)}</a>`
    : "";

  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;color:#475569;">
      Bonne nouvelle : un conseiller Nexus RCA a été assigné à votre dossier
      <strong style="color:#FF6600;font-family:monospace;">${escapeHtml(data.reference)}</strong>
      (${escapeHtml(data.service)}).
    </p>
    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:#ecfdf5;border-radius:12px;border:1px solid #a7f3d0;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:#065f46;">VOTRE CONSEILLER</p>
        <p style="margin:0 0 4px;font-size:16px;color:#064e3b;font-weight:700;">${escapeHtml(data.conseillerNom)}</p>
        ${data.conseillerPoste ? `<p style="margin:0 0 6px;font-size:12px;color:#065f46;">${escapeHtml(data.conseillerPoste)}</p>` : ""}
        ${conseillerLine ? `<p style="margin:8px 0 0;font-size:13px;color:#064e3b;">${conseillerLine}</p>` : ""}
      </td></tr>
    </table>
    <p style="margin:0 0 14px;color:#475569;">
      Vous pouvez le contacter directement depuis votre espace Nexus Connect.
      Toutes les pièces, messages et étapes de votre dossier y sont centralisés.
    </p>
    ${renderCta("Ouvrir mon dossier", link)}
  `;

  return {
    subject: `Un conseiller prend en charge votre dossier ${data.reference}`,
    html: renderEmailLayout({
      eyebrow: "DOSSIER ASSIGNÉ",
      title: "Un conseiller vous a été assigné",
      contentHtml: content,
    }),
  };
}
