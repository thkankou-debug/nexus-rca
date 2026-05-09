// ============================================================================
// TEMPLATE — Notif aux agents spécialistes : nouveau dossier dans leur catégorie
// ============================================================================

import { escapeHtml, getSiteUrl, renderCta, renderEmailLayout } from "./index";

export interface AgentNouveauDossierSpecialiteData {
  agentEmail: string;
  agentPrenom: string | null;
  reference: string;
  service: string;
  categorieLabel: string;
  clientNom: string;
  demandeId: string;
}

export function agentNouveauDossierSpecialiteEmail(
  data: AgentNouveauDossierSpecialiteData
): { subject: string; html: string } {
  const site = getSiteUrl();
  const link = `${site}/dashboard/agent/dossiers/${escapeHtml(data.reference)}`;
  const title = `Nouveau dossier · ${escapeHtml(data.categorieLabel)}`;
  const greeting = data.agentPrenom ? `Bonjour ${escapeHtml(data.agentPrenom)},` : "Bonjour,";

  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;color:#475569;">
      Un nouveau dossier vient d'être enregistré dans votre catégorie de spécialité
      <strong style="color:#0C1C40;">${escapeHtml(data.categorieLabel)}</strong>.
      Vous pouvez le consulter et postuler pour le prendre en charge.
    </p>
    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:#64748b;">RÉCAPITULATIF</p>
        <table cellspacing="0" cellpadding="4" border="0" width="100%" style="font-size:13px;">
          <tr><td style="color:#64748b;width:140px;">Référence</td><td style="color:#FF6600;font-family:monospace;font-weight:600;">${escapeHtml(data.reference)}</td></tr>
          <tr><td style="color:#64748b;">Service</td><td style="color:#0C1C40;font-weight:600;">${escapeHtml(data.service)}</td></tr>
          <tr><td style="color:#64748b;">Catégorie</td><td style="color:#0C1C40;">${escapeHtml(data.categorieLabel)}</td></tr>
          <tr><td style="color:#64748b;">Client</td><td style="color:#0C1C40;">${escapeHtml(data.clientNom)}</td></tr>
        </table>
      </td></tr>
    </table>
    ${renderCta("Ouvrir le dossier", `${site}/dashboard/agent/dossiers/${data.demandeId.includes("-") ? "autres" : "autres"}/${data.demandeId}`)}
    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
      Vous recevez cet email parce que vous êtes spécialiste de cette catégorie.
    </p>
  `;

  return {
    subject: `Nouveau dossier ${data.reference} dans votre spécialité`,
    html: renderEmailLayout({
      eyebrow: "VOTRE SPÉCIALITÉ",
      title,
      contentHtml: content,
    }),
  };
}
