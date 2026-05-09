// ============================================================================
// TEMPLATE — Notif générique : nouveau message dans un dossier
// (Sert client→agent ET agent→client. La route /api/demandes/[id]/messages
// continue d'utiliser son HTML inline existant ; ce template est exposé pour
// les nouvelles routes API qui veulent un rendu cohérent.)
// ============================================================================

import { escapeHtml, getSiteUrl, renderCta, renderEmailLayout } from "./index";

export interface AgentMessageClientData {
  recipientPrenom: string | null;
  recipientRole: "client" | "agent" | "admin" | "super_admin";
  reference: string;
  authorName: string;
  contentMessage: string;
  demandeId: string;
}

export function agentMessageClientEmail(
  data: AgentMessageClientData
): { subject: string; html: string } {
  const site = getSiteUrl();
  const link =
    data.recipientRole === "client"
      ? `${site}/dashboard/client/demandes/${escapeHtml(data.demandeId)}`
      : `${site}/dashboard/agent/demandes`;
  const greeting = data.recipientPrenom
    ? `Bonjour ${escapeHtml(data.recipientPrenom)},`
    : "Bonjour,";

  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;color:#475569;">
      Vous avez reçu un nouveau message sur le dossier
      <strong style="color:#FF6600;font-family:monospace;">${escapeHtml(data.reference)}</strong>.
    </p>
    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:#f8fafc;border-radius:12px;border-left:4px solid #FF6600;">
      <tr><td style="padding:14px 18px;">
        <p style="margin:0 0 6px;font-size:12px;color:#0C1C40;font-weight:700;">${escapeHtml(data.authorName)}</p>
        <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.contentMessage).replace(/\n/g, "<br>")}</p>
      </td></tr>
    </table>
    ${renderCta("Répondre", link)}
  `;

  return {
    subject: `Message · ${data.reference} — ${data.authorName}`,
    html: renderEmailLayout({
      eyebrow: "NOUVEAU MESSAGE",
      title: `Message de ${escapeHtml(data.authorName)}`,
      contentHtml: content,
    }),
  };
}
