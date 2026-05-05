import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotificationsForRoles } from "@/lib/notifications";
import { Resend } from "resend";

// ============================================================================
// API : POST /api/payment-links/[reference]/declare
// VERSION DURCIE - SESSION 20B-FIX
// ============================================================================

const VALID_METHODS = ["orange_money", "mtn_money", "express_union", "virement", "especes", "stripe_card"];

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
    return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
  } catch {
    return dateStr;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  console.log("===== [PAY-DECLARE] START =====", params.reference);

  try {
    const supabase = createClient();
    const reference = params.reference;

    const { data: paymentLink, error: fetchError } = await supabase
      .from("payment_links")
      .select("*")
      .eq("reference", reference)
      .single();

    if (fetchError || !paymentLink) {
      console.error("[PAY-DECLARE] Lien introuvable");
      return NextResponse.json({ error: "Lien introuvable" }, { status: 404 });
    }

    if (paymentLink.statut === "verifie") {
      return NextResponse.json({ error: "Déjà vérifié" }, { status: 400 });
    }
    if (paymentLink.statut === "annule") {
      return NextResponse.json({ error: "Annulé" }, { status: 400 });
    }

    const now = new Date();
    if (now > new Date(paymentLink.expires_at)) {
      return NextResponse.json({ error: "Lien expiré" }, { status: 400 });
    }

    const body = await request.json();

    if (!VALID_METHODS.includes(body.methode_choisie)) {
      return NextResponse.json({ error: "Méthode invalide" }, { status: 400 });
    }

    const numeroTransaction = (body.numero_transaction || "").trim();
    if (!numeroTransaction || numeroTransaction.length < 3) {
      return NextResponse.json({ error: "N° transaction requis" }, { status: 400 });
    }

    console.log("[PAY-DECLARE] Déclaration:", reference, "→", METHOD_LABELS[body.methode_choisie], "Tx:", numeroTransaction);

    // UPDATE
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
      console.error("[PAY-DECLARE] Erreur update:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log("[PAY-DECLARE] Statut → paiement_declare");

    // ─── NOTIFICATION CLOCHE — tous les admin + super_admin ───────────────
    // Non bloquant : si l'insert notif échoue, l'action continue (email + 200).
    await createNotificationsForRoles(
      ["admin", "super_admin"],
      "payment_declared",
      `Paiement déclaré · ${reference}`,
      `${paymentLink.client_nom} a déclaré un paiement de ${formatMoney(paymentLink.montant, paymentLink.devise)} via ${METHOD_LABELS[body.methode_choisie] || body.methode_choisie}.`,
      "/dashboard/super-admin/paiements/en-attente"
    );

    // ========================================================================
    // ENVOI EMAILS
    // ========================================================================
    let staffEmailSent = false;
    let clientEmailSent = false;

    if (!process.env.RESEND_API_KEY) {
      console.error("[PAY-DECLARE] ❌ RESEND_API_KEY manquante");
      return NextResponse.json({
        success: true,
        reference,
        statut: "paiement_declare",
        warning: "RESEND_API_KEY manquante",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const FROM_PRIMARY = "Nexus RCA <noreply@nexusrca.com>";
    const FROM_FALLBACK = "Nexus RCA <onboarding@resend.dev>";

    // EMAIL STAFF
    console.log("[PAY-DECLARE] EMAIL STAFF START → ", NEXUS_STAFF_EMAIL);
    try {
      const result = await resend.emails.send({
        from: FROM_PRIMARY,
        to: NEXUS_STAFF_EMAIL,
        subject: `🔔 Nouveau paiement déclaré - ${reference} - ${formatMoney(paymentLink.montant, paymentLink.devise)}`,
        html: buildStaffEmail({
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

      if (result.error) {
        console.error("[PAY-DECLARE] STAFF email échec primary:", JSON.stringify(result.error));
        // Fallback
        const r2 = await resend.emails.send({
          from: FROM_FALLBACK,
          to: NEXUS_STAFF_EMAIL,
          subject: `🔔 Nouveau paiement déclaré - ${reference}`,
          html: buildStaffEmail({
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
        if (!r2.error) {
          console.log("[PAY-DECLARE] ✅ STAFF email envoyé via FALLBACK");
          staffEmailSent = true;
        } else {
          console.error("[PAY-DECLARE] STAFF email échec fallback:", JSON.stringify(r2.error));
        }
      } else {
        console.log("[PAY-DECLARE] ✅ STAFF email envoyé, ID:", result.data?.id);
        staffEmailSent = true;
      }
    } catch (e) {
      console.error("[PAY-DECLARE] STAFF email exception:", e instanceof Error ? e.message : e);
    }

    // EMAIL CLIENT
    console.log("[PAY-DECLARE] EMAIL CLIENT START → ", paymentLink.client_email);
    try {
      const result = await resend.emails.send({
        from: FROM_PRIMARY,
        to: paymentLink.client_email,
        subject: `✓ Paiement reçu - ${reference} - Nexus RCA`,
        html: buildClientEmail({
          reference: paymentLink.reference,
          clientNom: paymentLink.client_nom,
          service: paymentLink.service,
          montant: paymentLink.montant,
          devise: paymentLink.devise,
          methode: METHOD_LABELS[body.methode_choisie] || body.methode_choisie,
          numeroTransaction,
        }),
      });

      if (result.error) {
        console.error("[PAY-DECLARE] CLIENT email échec primary:", JSON.stringify(result.error));
        const r2 = await resend.emails.send({
          from: FROM_FALLBACK,
          to: paymentLink.client_email,
          subject: `✓ Paiement reçu - ${reference}`,
          html: buildClientEmail({
            reference: paymentLink.reference,
            clientNom: paymentLink.client_nom,
            service: paymentLink.service,
            montant: paymentLink.montant,
            devise: paymentLink.devise,
            methode: METHOD_LABELS[body.methode_choisie] || body.methode_choisie,
            numeroTransaction,
          }),
        });
        if (!r2.error) {
          console.log("[PAY-DECLARE] ✅ CLIENT email envoyé via FALLBACK");
          clientEmailSent = true;
        } else {
          console.error("[PAY-DECLARE] CLIENT email échec fallback:", JSON.stringify(r2.error));
        }
      } else {
        console.log("[PAY-DECLARE] ✅ CLIENT email envoyé, ID:", result.data?.id);
        clientEmailSent = true;
      }
    } catch (e) {
      console.error("[PAY-DECLARE] CLIENT email exception:", e instanceof Error ? e.message : e);
    }

    console.log("===== [PAY-DECLARE] END =====", { staff: staffEmailSent, client: clientEmailSent });

    return NextResponse.json({
      success: true,
      reference,
      statut: "paiement_declare",
      staff_email_sent: staffEmailSent,
      client_email_sent: clientEmailSent,
    });
  } catch (err) {
    console.error("[PAY-DECLARE] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ============================================================================
function buildStaffEmail(data: {
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
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f1f5f9;">
  <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table cellspacing="0" cellpadding="0" border="0" width="600" style="background:#fff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#FF6600 0%,#cc5200 100%);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;">🔔 Nouveau paiement déclaré</h1>
          <p style="margin:8px 0 0 0;color:#ffe5d6;font-size:14px;">Action requise : vérifier la transaction</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <div style="background:#0C1C40;border-radius:12px;padding:20px;margin:16px 0;text-align:center;">
            <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Montant déclaré</p>
            <p style="margin:0;font-size:32px;font-weight:700;color:#fff;">${formatMoney(data.montant, data.devise)}</p>
            <p style="margin:8px 0 0 0;font-family:monospace;font-size:13px;color:#FF6600;">${data.reference}</p>
          </div>
          <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:16px 0;">
            <table cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:140px;">Service</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.service}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Client</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.clientNom}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Email</td><td style="padding:6px 0;font-size:13px;color:#475569;">${data.clientEmail}</td></tr>
              ${data.clientTel ? `<tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Tél</td><td style="padding:6px 0;font-size:13px;color:#475569;">${data.clientTel}</td></tr>` : ""}
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Méthode</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.methode}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">N° transaction</td><td style="padding:6px 0;font-family:monospace;font-size:13px;color:#0C1C40;font-weight:600;background:#fff3e0;border-radius:4px;">${data.numeroTransaction}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Déclaré le</td><td style="padding:6px 0;font-size:13px;color:#475569;">${data.declaredAt}</td></tr>
            </table>
            ${data.notesClient ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 4px 0;font-size:11px;font-weight:700;text-transform:uppercase;color:#64748b;">Notes du client</p><p style="margin:0;font-size:13px;color:#475569;">${data.notesClient.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p></div>` : ""}
          </div>
          <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:20px 0;">
            <p style="margin:0;font-size:13px;color:#92400e;">⚠️ <strong>Action requise :</strong><br>1. Vérifiez la réception sur votre Mobile Money<br>2. Confirmez dans le tableau de bord</p>
          </div>
          <table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0;">
            <tr><td align="center"><a href="${baseUrl}/dashboard/super-admin/paiements/en-attente" style="display:inline-block;background:#0C1C40;color:#fff;padding:14px 28px;border-radius:9999px;text-decoration:none;font-size:14px;font-weight:600;">Vérifier maintenant</a></td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
  `.trim();
}

function buildClientEmail(data: {
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
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f1f5f9;">
  <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:24px 0;">
    <tr><td align="center">
      <table cellspacing="0" cellpadding="0" border="0" width="600" style="background:#fff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#0C1C40 0%,#1E3A8A 100%);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:24px;">Merci pour votre paiement ✓</h1>
          <p style="margin:8px 0 0 0;color:#cbd5e1;font-size:14px;">Nous vérifions votre transaction</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 20px 0;font-size:16px;color:#0C1C40;">Bonjour <strong>${data.clientNom}</strong>,</p>
          <p style="margin:0 0 20px 0;font-size:14px;color:#475569;line-height:1.6;">Nous avons bien reçu votre déclaration. Notre équipe va vérifier sous 24h et vous enverra le reçu officiel.</p>
          <div style="background:#f8fafc;border-radius:12px;padding:20px;margin:20px 0;">
            <table cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:140px;">Référence</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;font-family:monospace;">${data.reference}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Service</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.service}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Montant</td><td style="padding:6px 0;font-size:18px;color:#0C1C40;font-weight:700;">${formatMoney(data.montant, data.devise)}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">Méthode</td><td style="padding:6px 0;font-size:14px;color:#0C1C40;font-weight:600;">${data.methode}</td></tr>
              <tr><td style="padding:6px 0;font-size:13px;color:#64748b;">N° transaction</td><td style="padding:6px 0;font-family:monospace;font-size:13px;color:#0C1C40;">${data.numeroTransaction}</td></tr>
            </table>
          </div>
        </td></tr>
        <tr><td style="background:#0C1C40;padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">NEXUS RCA</p>
          <p style="margin:4px 0;font-size:12px;color:#94a3b8;">+236 73 26 96 92 · contact@nexusrca.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>
  `.trim();
}
