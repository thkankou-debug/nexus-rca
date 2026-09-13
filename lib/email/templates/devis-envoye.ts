// ============================================================================
// TEMPLATE — Notif au client : un devis lui a été envoyé
// P6, lot Devis. Même patron que client-statut-change.ts.
// ============================================================================

import { escapeHtml, getSiteUrl, renderCta, renderEmailLayout } from "./index";

export interface DevisEnvoyeData {
  clientNom: string;
  reference: string;
  service: string;
  amount: number;
  currency: string;
  validUntil: string | null;
  conseillerNom: string | null;
  demandeId: string;
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("en-US").replace(/,/g, " ")} ${currency}`;
}

export function devisEnvoyeEmail(data: DevisEnvoyeData): { subject: string; html: string } {
  const site = getSiteUrl();
  const link = `${site}/dashboard/client/demandes/${escapeHtml(data.demandeId)}`;

  const validiteBlock = data.validUntil
    ? `<p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">Valable jusqu'au ${escapeHtml(data.validUntil)}</p>`
    : "";

  const content = `
    <p style="margin:0 0 14px;">Bonjour ${escapeHtml(data.clientNom)},</p>
    <p style="margin:0 0 14px;color:#475569;">
      Un devis a été préparé pour votre dossier
      <strong style="color:#FF6600;font-family:monospace;">${escapeHtml(data.reference)}</strong>
      (${escapeHtml(data.service)}).
    </p>
    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:linear-gradient(135deg,#FF6600 0%,#e85d00 100%);border-radius:12px;">
      <tr><td style="padding:22px 24px;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#fff7ed;">MONTANT DU DEVIS</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">${formatMoney(data.amount, data.currency)}</p>
        ${validiteBlock}
      </td></tr>
    </table>
    ${data.conseillerNom ? `<p style="margin:0 0 14px;color:#475569;font-size:13px;">— ${escapeHtml(data.conseillerNom)}, votre conseiller</p>` : ""}
    ${renderCta("Voir le devis", link)}
  `;

  return {
    subject: `Devis ${data.reference} — ${data.service}`,
    html: renderEmailLayout({
      eyebrow: "NOUVEAU DEVIS",
      title: `Devis ${data.reference}`,
      contentHtml: content,
    }),
  };
}
