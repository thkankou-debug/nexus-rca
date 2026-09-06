// ============================================================================
// PAYSLIP EMAIL — Notification automatique fiche de paie validee
// ----------------------------------------------------------------------------
// Pattern Resend (best-effort silent : si RESEND_API_KEY manque, log + skip,
// ne fait jamais echouer la validation cote business).
// ============================================================================

import { Resend } from "resend";

interface SendPayslipEmailOpts {
  to: string;
  employeeFirstName: string;
  employeeFullName: string;
  moisLibelle: string; // "Mai 2026"
  reference: string; // "PAIE-2026-MAI-001"
  salaireNet: number;
  pdfDownloadUrl: string; // signed URL Supabase 7 jours
  pdfBytes?: Uint8Array; // optionnel : attacher direct le PDF
}

function formatMoney(amount: number, currency = "FCFA"): string {
  const intPart = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${intPart} ${currency}`;
}

const FROM_PRIMARY = "Nexus RCA Paie <paie@nexusrca.com>";
const FROM_FALLBACK = "Nexus RCA <noreply@nexusrca.com>";

function buildHtml(opts: SendPayslipEmailOpts): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Fiche de paie</title></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#0C1C40 0%,#1E2A5C 100%);padding:32px 28px;border-radius:16px 16px 0 0;">
      <p style="color:rgba(255,255,255,0.7);margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">Fiche de paie</p>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:700;line-height:1.2;">NEXUS RCA</h1>
      <p style="color:rgba(255,255,255,0.6);margin:6px 0 0 0;font-size:13px;">Agence internationale · Bangui, RCA</p>
    </div>

    <div style="background:white;padding:32px 28px;border:1px solid #E2E8F0;border-top:none;">
      <p style="color:#0C1C40;font-size:16px;margin:0 0 16px 0;">
        Bonjour ${opts.employeeFirstName},
      </p>
      <p style="color:#475569;line-height:1.6;font-size:14px;margin:0 0 24px 0;">
        Votre fiche de paie pour <strong>${opts.moisLibelle}</strong> a été validée et est désormais disponible.
      </p>

      <div style="background:linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 100%);border:1px solid #FED7AA;border-radius:12px;padding:20px;margin:0 0 24px 0;">
        <p style="margin:0 0 6px 0;color:#9A3412;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Net à payer</p>
        <p style="margin:0;color:#0C1C40;font-size:32px;font-weight:700;letter-spacing:-0.02em;">${formatMoney(opts.salaireNet)}</p>
        <p style="margin:8px 0 0 0;color:#9A3412;font-size:12px;font-family:'SF Mono',Monaco,Consolas,monospace;">${opts.reference}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:0 0 24px 0;">
        <tr>
          <td style="padding:8px 0;color:#64748B;font-size:13px;width:40%;">Bénéficiaire</td>
          <td style="padding:8px 0;color:#0C1C40;font-size:13px;font-weight:600;">${opts.employeeFullName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748B;font-size:13px;border-top:1px solid #F1F5F9;">Période</td>
          <td style="padding:8px 0;color:#0C1C40;font-size:13px;font-weight:600;border-top:1px solid #F1F5F9;">${opts.moisLibelle}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#64748B;font-size:13px;border-top:1px solid #F1F5F9;">Référence</td>
          <td style="padding:8px 0;color:#0C1C40;font-size:13px;font-weight:600;font-family:'SF Mono',Monaco,Consolas,monospace;border-top:1px solid #F1F5F9;">${opts.reference}</td>
        </tr>
      </table>

      <div style="text-align:center;margin:0 0 16px 0;">
        <a href="${opts.pdfDownloadUrl}"
           style="display:inline-block;background:#FF6600;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.02em;box-shadow:0 4px 12px rgba(255,102,0,0.3);">
          Télécharger ma fiche PDF →
        </a>
      </div>
      <p style="color:#94A3B8;text-align:center;font-size:11px;margin:0 0 0 0;">
        Lien valide 7 jours
      </p>
    </div>

    <div style="background:#F8FAFC;padding:20px 28px;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 16px 16px;text-align:center;">
      <p style="margin:0;color:#64748B;font-size:11px;line-height:1.5;">
        Une question sur cette fiche ? Contactez votre administration RH.<br>
        <span style="color:#94A3B8;">Nexus RCA · Croisement Marabena, Bangui · contact@nexusrca.com</span>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Envoie la notification email "fiche validee".
 * Best-effort silent : ne throw jamais. Retourne success/error pour audit.
 */
export async function sendPayslipValidatedEmail(
  opts: SendPayslipEmailOpts
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[PAYSLIP_EMAIL] RESEND_API_KEY manquante — skip");
    return { success: false, error: "RESEND_API_KEY manquante" };
  }

  if (!opts.to) {
    console.warn("[PAYSLIP_EMAIL] destinataire manquant — skip");
    return { success: false, error: "destinataire manquant" };
  }

  const resend = new Resend(apiKey);
  const html = buildHtml(opts);
  const subject = `Votre fiche de paie ${opts.moisLibelle} — Nexus RCA`;

  const attachments = opts.pdfBytes
    ? [
        {
          filename: `${opts.reference}.pdf`,
          content: Buffer.from(opts.pdfBytes).toString("base64"),
        },
      ]
    : undefined;

  // Try primary FROM, fallback to noreply if domain mismatch
  for (const from of [FROM_PRIMARY, FROM_FALLBACK]) {
    try {
      const { data, error } = await resend.emails.send({
        from,
        to: opts.to,
        subject,
        html,
        attachments,
      });
      if (error) {
        console.error(`[PAYSLIP_EMAIL] from=${from}`, error);
        continue;
      }
      return { success: true, sid: data?.id };
    } catch (e) {
      console.error(`[PAYSLIP_EMAIL] exception from=${from}`, e);
    }
  }

  return { success: false, error: "Échec sur les 2 senders Resend" };
}
