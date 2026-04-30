import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

// ============================================================================
// API : POST /api/appointments/send-confirmation
// 
// Envoie un email de confirmation au client après création du RDV.
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
  try {
    const body = await request.json();
    const { appointment_id } = body;

    if (!appointment_id) {
      return NextResponse.json(
        { error: "appointment_id requis" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: appointment, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointment_id)
      .single();

    if (error || !appointment) {
      return NextResponse.json(
        { error: "Rendez-vous introuvable" },
        { status: 404 }
      );
    }

    // Si pas de clé Resend, on log juste et on renvoie OK (mode dégradé)
    if (!process.env.RESEND_API_KEY) {
      console.warn("[NEXUS RDV] RESEND_API_KEY manquante - email non envoyé");
      return NextResponse.json({
        success: true,
        sent: false,
        message: "Email non envoyé (configuration manquante)",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const serviceLabel =
      SERVICE_LABELS[appointment.service_type] || appointment.service_type;
    const dateLong = formatDateLong(appointment.rdv_date);

    const html = `
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
          
          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#0C1C40 0%,#1E3A8A 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,102,0,0.2);border:1px solid rgba(255,102,0,0.4);border-radius:9999px;padding:6px 14px;margin-bottom:12px;">
                <span style="color:#FF6600;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">NEXUS CONNECT</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">
                Rendez-vous enregistré ✓
              </h1>
              <p style="margin:8px 0 0 0;color:#cbd5e1;font-size:14px;">
                Nous avons bien reçu votre demande
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px 0;font-size:16px;color:#0C1C40;">
                Bonjour <strong>${appointment.client_nom}</strong>,
              </p>
              <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.6;">
                Votre demande de rendez-vous a bien été enregistrée. Notre équipe va la confirmer très prochainement.
              </p>

              <!-- DETAILS -->
              <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;">
                <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">
                  Détails de votre rendez-vous
                </p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;width:120px;">Référence</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;font-family:monospace;">${appointment.reference}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Service</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${serviceLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Date</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${dateLong}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Heure</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${appointment.rdv_heure}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Durée</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;">${appointment.duree_minutes} minutes</td>
                  </tr>
                </table>

                ${
                  appointment.notes_client
                    ? `
                <div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;">
                  <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">
                    Vos notes
                  </p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">
                    ${appointment.notes_client.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                  </p>
                </div>
                `
                    : ""
                }
              </div>

              <!-- INFO BOX -->
              <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:20px 0;">
                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                  ⏳ <strong>Statut actuel : En attente de confirmation</strong><br>
                  Notre équipe vous contactera dans les plus brefs délais pour confirmer votre rendez-vous. Vous recevrez une notification par email dès que ce sera fait.
                </p>
              </div>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com"}/dashboard/client/rdv" style="display:inline-block;background:#FF6600;color:#ffffff;padding:14px 28px;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(255,102,0,0.3);">
                      Voir mes rendez-vous
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;font-size:13px;color:#64748b;line-height:1.6;">
                Pour annuler ou modifier ce rendez-vous, connectez-vous à votre espace personnel ou contactez-nous directement.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#0C1C40;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#ffffff;">
                NEXUS RCA — Agence Internationale
              </p>
              <p style="margin:0 0 4px 0;font-size:12px;color:#94a3b8;">
                Relais Sica, vers Hôpital Général, Bangui, RCA
              </p>
              <p style="margin:0 0 4px 0;font-size:12px;color:#94a3b8;">
                +236 73 26 96 92 · contact@nexusrca.com
              </p>
              <p style="margin:12px 0 0 0;font-size:11px;color:#64748b;">
                © ${new Date().getFullYear()} Nexus RCA. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const { error: sendError } = await resend.emails.send({
      from: "Nexus RCA <noreply@nexusrca.com>",
      to: appointment.client_email,
      subject: `✓ Rendez-vous ${appointment.reference} enregistré - Nexus RCA`,
      html,
    });

    if (sendError) {
      console.error("Erreur envoi email:", sendError);
      return NextResponse.json(
        {
          success: false,
          error: sendError.message || "Erreur envoi email",
        },
        { status: 500 }
      );
    }

    console.log(
      `[NEXUS RDV] Email confirmation envoyé à ${appointment.client_email} pour ${appointment.reference}`
    );

    return NextResponse.json({ success: true, sent: true });
  } catch (err) {
    console.error("Erreur API send-confirmation:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
