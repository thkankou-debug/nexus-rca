// ============================================================================
// TEMPLATE — Notif à l'agent quand un admin/super_admin l'assigne à un dossier
// ============================================================================

import { escapeHtml, getSiteUrl, renderCta, renderEmailLayout } from "./index";

export interface AgentDossierAssigneData {
  agentPrenom: string | null;
  reference: string;
  service: string;
  categorieSlug: string;
  categorieLabel: string;
  clientNom: string;
  demandeId: string;
  assigneParNom: string;
}

export function agentDossierAssigneEmail(
  data: AgentDossierAssigneData
): { subject: string; html: string } {
  const site = getSiteUrl();
  const link = `${site}/dashboard/agent/dossiers/${escapeHtml(data.categorieSlug)}/${escapeHtml(data.demandeId)}`;
  const greeting = data.agentPrenom ? `Bonjour ${escapeHtml(data.agentPrenom)},` : "Bonjour,";

  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;color:#475569;">
      <strong style="color:#0C1C40;">${escapeHtml(data.assigneParNom)}</strong> vient
      de vous assigner un dossier. Vous êtes désormais le conseiller en charge.
    </p>
    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:#fff7ed;border-radius:12px;border:1px solid #fed7aa;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:#9a3412;">DOSSIER ASSIGNÉ</p>
        <table cellspacing="0" cellpadding="4" border="0" width="100%" style="font-size:13px;">
          <tr><td style="color:#9a3412;width:140px;">Référence</td><td style="color:#9a3412;font-family:monospace;font-weight:600;">${escapeHtml(data.reference)}</td></tr>
          <tr><td style="color:#9a3412;">Service</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(data.service)}</td></tr>
          <tr><td style="color:#9a3412;">Catégorie</td><td style="color:#0C1C40;">${escapeHtml(data.categorieLabel)}</td></tr>
          <tr><td style="color:#9a3412;">Client</td><td style="color:#0C1C40;">${escapeHtml(data.clientNom)}</td></tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 14px;color:#475569;">
      Merci de prendre contact avec le client sous 24 h ouvrées et de mettre à jour
      l'état d'avancement du dossier au fil de votre traitement.
    </p>
    ${renderCta("Ouvrir le dossier", link)}
  `;

  return {
    subject: `Dossier ${data.reference} vous a été assigné`,
    html: renderEmailLayout({
      eyebrow: "ASSIGNATION",
      title: `Vous êtes désormais en charge du dossier ${escapeHtml(data.reference)}`,
      contentHtml: content,
    }),
  };
}
