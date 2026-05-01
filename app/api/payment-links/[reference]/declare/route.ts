import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

// ============================================================================
// API : POST /api/payment-links/[reference]/declare
// 
// Le CLIENT (visiteur public) déclare avoir effectué un paiement.
// Body : {
//   methode_choisie: "orange_money" | "mtn_money" | "express_union" | "virement" | "especes",
//   numero_transaction: string,
//   notes_client?: string
// }
// ============================================================================

const VALID_METHODS = [
  "orange_money",
  "mtn_money",
  "express_union",
  "virement",
  "especes",
  "stripe_card",
];

const METHOD_LABELS: Record<string, string> = {
  orange_money: "Orange Money RCA",
  mtn_money: "MTN Mobile Money RCA",
  express_union: "Express Union Mobile",
  virement: "Virement bancaire",
  especes: "Espèces (en agence)",
  stripe_card: "Carte bancaire",
};

const NEXUS_STAFF_EMAIL = "contact@nexusrca.com";

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return dateStr;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const supabase = createClient();
    const reference = params.reference;

    if (!reference) {
      return NextResponse.json(
        { error: "Référence manquante" },
        { status: 400 }
      );
    }

    // ========================================================================
    // RÉCUPÉRATION DU LIEN
    // ========================================================================
    const { data: paymentLink, error: fetchError } = await supabase
      .from("payment_links")
      .select("*")
      .eq("reference", reference)
      .single();

    if (fetchError || !paymentLink) {
      return NextResponse.json(
        { error: "Lien de paiement introuvable" },
        { status: 404 }
      );
    }

    // Vérifications
    if (paymentLink.statut === "verifie") {
      return NextResponse.json(
        { error: "Ce paiement a déjà été vérifié" },
        { status: 400 }
      );
    }

    if (paymentLink.statut === "annule") {
      return NextResponse.json(
        { error: "Ce lien de paiement a été annulé" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now > new Date(paymentLink.expires_at)) {
      return NextResponse.json(
        { error: "Ce lien de paiement a expiré" },
        { status: 400 }
      );
    }

    // ========================================================================
    // VALIDATION BODY
    // ========================================================================
    const body = await request.json();

    if (!VALID_METHODS.includes(body.methode_choisie)) {
      return NextResponse.json(
        { error: `Méthode invalide. Doit être : ${VALID_METHODS.join(", ")}` },
        { status: 400 }
      );
    }

    const numeroTransaction = (body.numero_transaction || "").trim();
    if (!numeroTransaction) {
      return NextResponse.json(
        { error: "Numéro de transaction requis" },
        { status: 400 }
      );
    }

    if (numeroTransaction.length < 3 || numeroTransaction.length > 200) {
      return NextResponse.json(
        { error: "Numéro de transaction invalide (3-200 caractères)" },
        { status: 400 }
      );
    }

    // ========================================================================
    // MISE À JOUR DU LIEN
    // ========================================================================
    const { error: updateError } = await supabase
      .from("payment_links")
      .update({
        methode_choisie: body.methode_choisie,
        numero_transaction: numeroTransaction,
        notes_client: (body.notes_client || "").trim() || null,
        statut: "paiement_declare",
        paid_declared_at: now.toISOString(),
      })
      .eq("reference", reference);

    if (updateError) {
      console.error("Erreur update payment_link:", updateError);
      return NextResponse.json(
        { error: updateError.message || "Erreur mise à jour" },
        { status: 500 }
      );
    }

    console.log(
      `[NEXUS PAY-LINK] Paiement déclaré : ${reference} - ${METHOD_LABELS[body.methode_choisie]} - Tx: ${numeroTransaction}`
    );

    // ========================================================================
    // ENVOI DES EMAILS (best-effort, non bloquant)
    // ========================================================================
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Email 1 : Notification au staff
      try {
        await resend.emails.send({
          from: "Nexus RCA <noreply@nexusrca.com>",
          to: NEXUS_STAFF_EMAIL,
          subject: `🔔 Nouveau paiement déclaré - ${reference} - ${formatMoney(paymentLink.montant, paymentLink.devise)}`,
          html: buildStaffNotificationEmail({
            reference: paymentLink.reference,
            clientNom: paymentLink.client_nom,
            clientEmail: paymentLink.client_email,
            clientTel: paymentLink.client_telephone,
            service: paymentLink.service,
            description: paymentLink.description,
            montant: paymentLink.montant,
            devise: paymentLink.devise,
            methode: METHOD_LABELS[body.methode_choisie] || body.methode_choisie,
            numeroTransaction,
            notesClient: (body.notes_client || "").trim(),
            declaredAt: formatDateTime(now.toISOString()),
          }),
        });
        console.log(`[NEXUS PAY-LINK] Email staff envoyé pour ${reference}`);
      } catch (e) {
        console.warn("Erreur envoi email staff:", e);
      }

      // Email 2 : Confirmation au client
      try {
        await resend.emails.send({
          from: "Nexus RCA <noreply@nexusrca.com>",
          to: paymentLink.client_email,
          subject: `✓ Paiement reçu - ${reference} - Nexus RCA`,
          html: buildClientConfirmationEmail({
            reference: paymentLink.reference,
            clientNom: paymentLink.client_nom,
            service: paymentLink.service,
            montant: paymentLink.montant,
            devise: paymentLink.devise,
            methode: METHOD_LABELS[body.methode_choisie] || body.methode_choisie,
            numeroTransaction,
          }),
        });
        console.log(`[NEXUS PAY-LINK] Email client envoyé à ${paymentLink.client_email}`);
      } catch (e) {
        console.warn("Erreur envoi email client:", e);
      }
    } else {
      console.warn("[NEXUS PAY-LINK] RESEND_API_KEY manquante - emails non envoyés");
    }

    return NextResponse.json({
      success: true,
      reference,
      statut: "paiement_declare",
    });
  } catch (err) {
    console.error("Erreur API declare:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================================
// TEMPLATES EMAIL
// ============================================================================

function buildStaffNotificationEmail(data: {
  reference: string;
  clientNom: string;
  clientEmail: string;
  clientTel: string | null;
  service: string;
  description: string | null;
  montant: number;
  devise: string;
  methode: string;
  numeroTransaction: string;
  notesClient: string;
  declaredAt: string;
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveau paiement déclaré - Nexus RCA</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f1f5f9;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          
          <tr>
            <td style="background:linear-gradient(135deg,#FF6600 0%,#cc5200 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">
                🔔 Nouveau paiement déclaré
              </h1>
              <p style="margin:8px 0 0 0;color:#ffe5d6;font-size:14px;">
                Action requise : vérifier la transaction
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.6;">
                Un client vient de déclarer avoir effectué un paiement. Vérifiez la transaction puis confirmez-la dans votre tableau de bord.
              </p>

              <!-- INFOS PAIEMENT -->
              <div style="background:#0C1C40;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
                <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">
                  Montant déclaré
                </p>
                <p style="margin:0;font-size:32px;font-weight:700;color:#ffffff;">
                  ${formatMoney(data.montant, data.devise)}
                </p>
                <p style="margin:8px 0 0 0;font-family:monospace;font-size:13px;color:#FF6600;">
                  ${data.reference}
                </p>
              </div>

              <!-- DÉTAILS -->
              <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:16px 0;">
                <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">
                  Détails
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;width:140px;">Service</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.service}</td>
                  </tr>
                  ${
                    data.description
                      ? `<tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;vertical-align:top;">Description</td>
                    <td style="padding:6px 0;font-size:13px;color:#475569;">${data.description.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Client</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.clientNom}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Email client</td>
                    <td style="padding:6px 0;font-size:13px;color:#475569;">${data.clientEmail}</td>
                  </tr>
                  ${
                    data.clientTel
                      ? `<tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Téléphone</td>
                    <td style="padding:6px 0;font-size:13px;color:#475569;">${data.clientTel}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Méthode</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.methode}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">N° transaction</td>
                    <td style="padding:6px 0;font-family:monospace;font-size:13px;color:#0C1C40;font-weight:600;background:#fff3e0;border-radius:4px;">${data.numeroTransaction}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Déclaré le</td>
                    <td style="padding:6px 0;font-size:13px;color:#475569;">${data.declaredAt}</td>
                  </tr>
                </table>

                ${
                  data.notesClient
                    ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;">
                  <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">
                    Notes du client
                  </p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">
                    ${data.notesClient.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                  </p>
                </div>`
                    : ""
                }
              </div>

              <!-- ACTION -->
              <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:20px 0;">
                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                  ⚠️ <strong>Action requise :</strong><br>
                  1. Vérifiez la réception sur votre Mobile Money (n° transaction : ${data.numeroTransaction})<br>
                  2. Confirmez le paiement dans le tableau de bord
                </p>
              </div>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}/dashboard/super-admin/paiements" style="display:inline-block;background:#0C1C40;color:#ffffff;padding:14px 28px;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(12,28,64,0.3);">
                      Vérifier dans le dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#0C1C40;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                Notification automatique · Nexus RCA
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
}

function buildClientConfirmationEmail(data: {
  reference: string;
  clientNom: string;
  service: string;
  montant: number;
  devise: string;
  methode: string;
  numeroTransaction: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paiement reçu - Nexus RCA</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background:#f1f5f9;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          
          <tr>
            <td style="background:linear-gradient(135deg,#0C1C40 0%,#1E3A8A 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,102,0,0.2);border:1px solid rgba(255,102,0,0.4);border-radius:9999px;padding:6px 14px;margin-bottom:12px;">
                <span style="color:#FF6600;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">PAIEMENT REÇU</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">
                Merci pour votre paiement ✓
              </h1>
              <p style="margin:8px 0 0 0;color:#cbd5e1;font-size:14px;">
                Nous vérifions votre transaction
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px 0;font-size:16px;color:#0C1C40;">
                Bonjour <strong>${data.clientNom}</strong>,
              </p>
              <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.6;">
                Nous avons bien reçu votre déclaration de paiement. Notre équipe va vérifier la transaction sous 24h et vous enverra le reçu officiel dès validation.
              </p>

              <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;">
                <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;">
                  Récapitulatif
                </p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;width:140px;">Référence</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;font-family:monospace;">${data.reference}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Service</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.service}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Montant</td>
                    <td style="padding:6px 0;font-size:18px;color:#0C1C40;font-weight:700;">${formatMoney(data.montant, data.devise)}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">Méthode</td>
                    <td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.methode}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:13px;color:#64748b;">N° transaction</td>
                    <td style="padding:6px 0;font-family:monospace;font-size:13px;color:#0C1C40;">${data.numeroTransaction}</td>
                  </tr>
                </table>
              </div>

              <div style="background:#dbeafe;border-radius:12px;padding:16px;margin:20px 0;">
                <p style="margin:0;font-size:13px;color:#1e3a8a;line-height:1.6;">
                  ✓ <strong>Que se passe-t-il maintenant ?</strong><br>
                  1. Notre équipe vérifie la réception du paiement (sous 24h)<br>
                  2. Vous recevrez un email de confirmation officielle<br>
                  3. Le reçu Nexus en PDF vous sera envoyé
                </p>
              </div>

              <p style="margin:24px 0 0 0;font-size:13px;color:#64748b;line-height:1.6;">
                Pour toute question, conservez la référence <strong style="font-family:monospace;color:#0C1C40;">${data.reference}</strong>.
              </p>
            </td>
          </tr>

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
}
