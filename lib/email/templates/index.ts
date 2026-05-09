// ============================================================================
// LIB — Templates email (header/footer Nexus partagés + 7 templates refonte 032)
// Tous les templates exportent une fonction (data) => { subject, html }.
// ============================================================================

export { agentNouveauDossierSpecialiteEmail } from "./agent-nouveau-dossier-specialite";
export { agentDossierAssigneEmail } from "./agent-dossier-assigne";
export { clientConseillerAssigneEmail } from "./client-conseiller-assigne";
export { clientDocumentDemandeEmail } from "./client-document-demande";
export { agentDocumentFourniEmail } from "./agent-document-fourni";
export { clientStatutChangeEmail } from "./client-statut-change";
export { agentMessageClientEmail } from "./agent-message-client";

/** Échappement HTML pour interpolation sûre dans les templates. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** URL absolue du site (depuis env, fallback prod). */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com";
}

/**
 * Layout HTML partagé : header navy + zone de contenu blanche + footer.
 * Toutes les valeurs interpolées doivent déjà être HTML-échappées.
 */
export function renderEmailLayout(opts: {
  eyebrow: string;
  title: string;
  contentHtml: string;
}): string {
  return `<!DOCTYPE html><html><body style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
  <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
    <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1a2a5e 100%);padding:28px 32px;">
      <p style="margin:0;color:#FF6600;font-size:11px;font-weight:700;letter-spacing:0.18em;">${opts.eyebrow}</p>
      <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;line-height:1.3;">${opts.title}</h1>
    </td></tr>
    <tr><td style="padding:28px 32px;color:#0C1C40;font-size:14px;line-height:1.6;">
      ${opts.contentHtml}
    </td></tr>
    <tr><td style="background:#0C1C40;padding:18px 32px;text-align:center;color:#94a3b8;font-size:11px;line-height:1.5;">
      NEXUS RCA · Bangui, République Centrafricaine<br/>
      <a href="https://www.nexusrca.com" style="color:#94a3b8;text-decoration:underline;">www.nexusrca.com</a> ·
      <a href="mailto:contact@nexusrca.com" style="color:#94a3b8;text-decoration:underline;">contact@nexusrca.com</a> ·
      +236 73 26 96 92
    </td></tr>
  </table>
</body></html>`;
}

/** Bouton CTA orange, à insérer dans `contentHtml`. */
export function renderCta(label: string, href: string): string {
  return `<p style="margin:20px 0 0;text-align:center;">
    <a href="${href}" style="display:inline-block;padding:12px 24px;background:#FF6600;color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;">${escapeHtml(label)} →</a>
  </p>`;
}
