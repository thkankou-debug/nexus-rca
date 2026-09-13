// ============================================================================
// TEMPLATE — Notif au client : une facture a été validée
// P6, lot Factures. Même patron que devis-envoye.ts.
// ============================================================================

import { escapeHtml, getSiteUrl, renderCta, renderEmailLayout } from "./index";

export interface FactureValideeData {
  clientNom: string;
  reference: string;
  service: string;
  amount: number;
  currency: string;
  dueDate: string | null;
  demandeId: string;
}

function formatMoney(amount: number, currency: string): string {
  return `${amount.toLocaleString("en-US").replace(/,/g, " ")} ${currency}`;
}

export function factureValideeEmail(data: FactureValideeData): { subject: string; html: string } {
  const site = getSiteUrl();
  const link = `${site}/dashboard/client/demandes/${escapeHtml(data.demandeId)}`;

  const echeanceBlock = data.dueDate
    ? `<p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">Échéance : ${escapeHtml(data.dueDate)}</p>`
    : "";

  const content = `
    <p style="margin:0 0 14px;">Bonjour ${escapeHtml(data.clientNom)},</p>
    <p style="margin:0 0 14px;color:#475569;">
      Une facture a été émise pour votre dossier
      <strong style="color:#FF6600;font-family:monospace;">${escapeHtml(data.reference)}</strong>
      (${escapeHtml(data.service)}).
    </p>
    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:linear-gradient(135deg,#FF6600 0%,#e85d00 100%);border-radius:12px;">
      <tr><td style="padding:22px 24px;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#fff7ed;">MONTANT DE LA FACTURE</p>
        <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">${formatMoney(data.amount, data.currency)}</p>
        ${echeanceBlock}
      </td></tr>
    </table>
    ${renderCta("Voir la facture", link)}
  `;

  return {
    subject: `Facture ${data.reference} — ${data.service}`,
    html: renderEmailLayout({
      eyebrow: "NOUVELLE FACTURE",
      title: `Facture ${data.reference}`,
      contentHtml: content,
    }),
  };
}
