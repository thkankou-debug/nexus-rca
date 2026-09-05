import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { rateLimitOrNull } from "@/lib/rate-limit";

// ============================================================================
// API : POST /api/appointments/send-confirmation
// VERSION DURCIE avec logs explicites et fallback from
// ============================================================================

const SERVICE_LABELS: Record<string, string> = {
  visa: "Visa / e-Visa",
  bourse: "Études / Bourses",
  tcf: "TCF / Test de français",
  billet: "Billet d'avion",
  hotel: "Hôtel",
  transfert: "Transfert d'argent",
  consultation_generale: "Consultation générale",
  autre: "Autre",
};

function formatDateLong(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export async function POST(request: NextRequest) {
  console.log("===== [RDV EMAIL] START =====");

  const limited = await rateLimitOrNull(request, "appointments-send-confirmation", { max: 20 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { appointment_id } = body;

    console.log("[RDV EMAIL] Appointment ID:", appointment_id);

    if (!appointment_id) {
      console.error("[RDV EMAIL] ERREUR: appointment_id manquant");
      return NextResponse.json(
        { error: "appointment_id requis", email_sent: false },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointment_id)
      .single();

    if (fetchError || !appointment) {
      console.error("[RDV EMAIL] ERREUR: RDV introuvable", fetchError);
      return NextResponse.json(
        { error: "Rendez-vous introuvable", email_sent: false },
        { status: 404 }
      );
    }

    console.log("[RDV EMAIL] RDV trouvé:", appointment.reference, "→", appointment.client_email);

    // ========================================================================
    // VÉRIFICATION CONFIG RESEND
    // ========================================================================
    if (!process.env.RESEND_API_KEY) {
      console.error("[RDV EMAIL] ERREUR CRITIQUE: RESEND_API_KEY manquante dans .env");
      return NextResponse.json({
        success: false,
        email_sent: false,
        error: "RESEND_API_KEY manquante - vérifie tes variables d'environnement",
      });
    }

    console.log("[RDV EMAIL] RESEND_API_KEY présente (longueur:", process.env.RESEND_API_KEY.length, ")");

    const resend = new Resend(process.env.RESEND_API_KEY);
    const serviceLabel = SERVICE_LABELS[appointment.service_type] || appointment.service_type;
    const dateLong = formatDateLong(appointment.rdv_date);

    const html = buildEmailHTML({
      clientNom: appointment.client_nom,
      reference: appointment.reference,
      serviceLabel,
      dateLong,
      heure: appointment.rdv_heure,
      duree: appointment.duree_minutes || 60,
      notesClient: appointment.notes_client,
    });

    // ========================================================================
    // TENTATIVE 1 : avec from = noreply@nexusrca.com
    // ========================================================================
    const FROM_PRIMARY = "Nexus RCA <noreply@nexusrca.com>";
    const FROM_FALLBACK = "Nexus RCA <onboarding@resend.dev>";
    const subject = `✓ Rendez-vous ${appointment.reference} enregistré - Nexus RCA`;

    let attempt1Error: unknown = null;

    try {
      console.log("[RDV EMAIL] TENTATIVE 1 from:", FROM_PRIMARY, "→", appointment.client_email);

      const result = await resend.emails.send({
        from: FROM_PRIMARY,
        to: appointment.client_email,
        subject,
        html,
      });

      if (result.error) {
        console.error("[RDV EMAIL] TENTATIVE 1 ÉCHEC (Resend error):", JSON.stringify(result.error));
        attempt1Error = result.error;
      } else {
        console.log("[RDV EMAIL] ✅ SUCCESS via", FROM_PRIMARY, "- ID:", result.data?.id);
        return NextResponse.json({
          success: true,
          email_sent: true,
          from_used: FROM_PRIMARY,
          email_id: result.data?.id,
        });
      }
    } catch (e) {
      console.error("[RDV EMAIL] TENTATIVE 1 EXCEPTION:", e instanceof Error ? e.message : e);
      attempt1Error = e;
    }

    // ========================================================================
    // TENTATIVE 2 : fallback onboarding@resend.dev
    // ========================================================================
    try {
      console.log("[RDV EMAIL] TENTATIVE 2 fallback from:", FROM_FALLBACK);

      const result = await resend.emails.send({
        from: FROM_FALLBACK,
        to: appointment.client_email,
        subject,
        html,
      });

      if (result.error) {
        console.error("[RDV EMAIL] TENTATIVE 2 ÉCHEC:", JSON.stringify(result.error));
        return NextResponse.json({
          success: false,
          email_sent: false,
          error: "Les 2 tentatives ont échoué",
          attempt1: attempt1Error,
          attempt2: result.error,
        });
      }

      console.log("[RDV EMAIL] ✅ SUCCESS via FALLBACK", FROM_FALLBACK, "- ID:", result.data?.id);
      return NextResponse.json({
        success: true,
        email_sent: true,
        from_used: FROM_FALLBACK,
        email_id: result.data?.id,
        warning: "Domaine principal a échoué - fallback utilisé. Vérifie nexusrca.com sur Resend.",
      });
    } catch (e) {
      console.error("[RDV EMAIL] TENTATIVE 2 EXCEPTION:", e instanceof Error ? e.message : e);
      return NextResponse.json({
        success: false,
        email_sent: false,
        error: e instanceof Error ? e.message : "Erreur inconnue",
      });
    }
  } catch (err) {
    console.error("[RDV EMAIL] EXCEPTION GLOBALE:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { error: message, email_sent: false },
      { status: 500 }
    );
  } finally {
    console.log("===== [RDV EMAIL] END =====");
  }
}

// ============================================================================
function buildEmailHTML(data: {
  clientNom: string;
  reference: string;
  serviceLabel: string;
  dateLong: string;
  heure: string;
  duree: number;
  notesClient: string | null;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de rendez-vous - Nexus RCA</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f1f5f9;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="background:linear-gradient(135deg,#0C1C40 0%,#1E3A8A 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,102,0,0.2);border:1px solid rgba(255,102,0,0.4);border-radius:9999px;padding:6px 14px;margin-bottom:12px;">
                <span style="color:#FF6600;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">NEXUS CONNECT</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Rendez-vous enregistré ✓</h1>
              <p style="margin:8px 0 0 0;color:#cbd5e1;font-size:14px;">Nous avons bien reçu votre demande</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px 0;font-size:16px;color:#0C1C40;">Bonjour <strong>${data.clientNom}</strong>,</p>
              <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.6;">Votre demande de rendez-vous a bien été enregistrée. Notre équipe va la confirmer très prochainement.</p>

              <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;">
                <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Détails de votre rendez-vous</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:120px;">Référence</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;font-family:monospace;">${data.reference}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Service</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.serviceLabel}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Date</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.dateLong}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Heure</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.heure}</td></tr>
                  <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Durée</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;">${data.duree} minutes</td></tr>
                </table>
                ${
                  data.notesClient
                    ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Vos notes</p><p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">${data.notesClient.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p></div>`
                    : ""
                }
              </div>

              <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:20px 0;">
                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">⏳ <strong>Statut actuel : En attente de confirmation</strong><br>Notre équipe vous contactera dans les plus brefs délais.</p>
              </div>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
                <tr><td align="center"><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com"}/dashboard/client/rdv" style="display:inline-block;background:#FF6600;color:#ffffff;padding:14px 28px;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:600;">Voir mes rendez-vous</a></td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#0C1C40;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#ffffff;">NEXUS RCA — Agence Internationale</p>
              <p style="margin:0 0 4px 0;font-size:12px;color:#94a3b8;">Relais Sica, vers Hôpital Général, Bangui, RCA</p>
              <p style="margin:0 0 4px 0;font-size:12px;color:#94a3b8;">+236 73 26 96 92 · contact@nexusrca.com</p>
              <p style="margin:12px 0 0 0;font-size:11px;color:#64748b;">© ${new Date().getFullYear()} Nexus RCA. Tous droits réservés.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
