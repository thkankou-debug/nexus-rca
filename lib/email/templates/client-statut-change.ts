// ============================================================================
// TEMPLATE — Notif au client : changement d'étape sur son dossier
// ============================================================================

import { escapeHtml, getSiteUrl, renderCta, renderEmailLayout } from "./index";

export interface ClientStatutChangeData {
  clientPrenom: string | null;
  clientNomComplet: string;
  reference: string;
  service: string;
  newStep: number;
  newStepLabel: string;
  conseillerNom: string | null;
  notesConseiller: string | null;
  demandeId: string;
}

export function clientStatutChangeEmail(
  data: ClientStatutChangeData
): { subject: string; html: string } {
  const site = getSiteUrl();
  const link = `${site}/dashboard/client/demandes/${escapeHtml(data.demandeId)}`;
  const greeting = data.clientPrenom
    ? `Bonjour ${escapeHtml(data.clientPrenom)},`
    : `Bonjour ${escapeHtml(data.clientNomComplet)},`;

  const notesBlock = data.notesConseiller
    ? `<table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.16em;color:#64748b;">MESSAGE DU CONSEILLER</p>
          <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">${escapeHtml(data.notesConseiller).replace(/\n/g, "<br>")}</p>
        </td></tr>
      </table>`
    : "";

  const content = `
    <p style="margin:0 0 14px;">${greeting}</p>
    <p style="margin:0 0 14px;color:#475569;">
      Votre dossier <strong style="color:#FF6600;font-family:monospace;">${escapeHtml(data.reference)}</strong>
      (${escapeHtml(data.service)}) avance.
    </p>
    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:16px 0;background:linear-gradient(135deg,#FF6600 0%,#e85d00 100%);border-radius:12px;">
      <tr><td style="padding:22px 24px;text-align:center;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.18em;color:#fff7ed;">NOUVELLE ÉTAPE — ${data.newStep}/6</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">${escapeHtml(data.newStepLabel)}</p>
      </td></tr>
    </table>
    ${notesBlock}
    ${data.conseillerNom ? `<p style="margin:0 0 14px;color:#475569;font-size:13px;">— ${escapeHtml(data.conseillerNom)}, votre conseiller</p>` : ""}
    ${renderCta("Voir l'avancement complet", link)}
  `;

  return {
    subject: `Étape ${data.newStep}/6 · ${data.newStepLabel} — dossier ${data.reference}`,
    html: renderEmailLayout({
      eyebrow: `ÉTAPE ${data.newStep} / 6`,
      title: escapeHtml(data.newStepLabel),
      contentHtml: content,
    }),
  };
}
