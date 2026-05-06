import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { sendWhatsApp } from "@/lib/whatsapp";
import { tplPaymentReceived } from "@/lib/whatsapp-templates";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── POST /api/payments/stripe-webhook ──────────────────────────────────────
// Webhook Stripe — vérifie la signature, traite les events checkout.session.*.
// Sur checkout.session.completed → marque payment_link comme verifie + envoie
// emails staff/client + WhatsApp confirmation.

const FROM_PRIMARY = "Nexus RCA <noreply@nexusrca.com>";
const FROM_FALLBACK = "Nexus RCA <onboarding@resend.dev>";
const STAFF_EMAIL = "contact@nexusrca.com";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

export async function POST(request: NextRequest) {
  console.log("===== [STRIPE_WEBHOOK] START =====");

  try {
    const sig = request.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig) {
      console.error("[STRIPE_WEBHOOK] signature manquante");
      return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
    }
    if (!webhookSecret) {
      console.error("[STRIPE_WEBHOOK] STRIPE_WEBHOOK_SECRET non configuré");
      return NextResponse.json(
        { error: "Webhook non configuré" },
        { status: 500 }
      );
    }

    // Stripe SDK exige le RAW body pour vérifier la signature
    const rawBody = await request.text();

    const stripe = getStripeClient();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Vérification signature échouée";
      console.error("[STRIPE_WEBHOOK] signature invalide:", msg);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    console.log(`[STRIPE_WEBHOOK] event=${event.type} id=${event.id}`);

    // ─── Cas géré : checkout.session.completed ─────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const reference = session.metadata?.reference || "";
      const paymentLinkId = session.metadata?.payment_link_id || "";

      if (!reference || !paymentLinkId) {
        console.warn("[STRIPE_WEBHOOK] metadata manquantes");
        return NextResponse.json({ received: true });
      }

      const admin = getAdminClient();

      // Récupère le payment_link
      const { data: paymentLink, error: fetchErr } = await admin
        .from("payment_links")
        .select("*")
        .eq("id", paymentLinkId)
        .single();

      if (fetchErr || !paymentLink) {
        console.error("[STRIPE_WEBHOOK] payment_link introuvable:", paymentLinkId);
        return NextResponse.json({ received: true });
      }

      // Idempotence : si déjà vérifié, ignorer (Stripe peut renvoyer le webhook)
      if (paymentLink.statut === "verifie") {
        console.log(`[STRIPE_WEBHOOK] déjà vérifié, skip ${reference}`);
        return NextResponse.json({ received: true });
      }

      // Update status → verifie (auto-vérifié car Stripe a validé)
      const now = new Date().toISOString();
      const { error: updateErr } = await admin
        .from("payment_links")
        .update({
          methode_choisie: "stripe_card",
          numero_transaction: session.payment_intent as string,
          statut: "verifie",
          paid_declared_at: now,
          verified_at: now,
        })
        .eq("id", paymentLinkId);

      if (updateErr) {
        console.error("[STRIPE_WEBHOOK] update error:", updateErr.message);
        return NextResponse.json({ received: true });
      }

      console.log(`[STRIPE_WEBHOOK] ✅ ${reference} → verifie`);

      // ─── Envoi emails ─────────────────────────────────────────────────────
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const staffHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
          <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
            <tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:24px 32px;">
              <p style="margin:0;color:#d1fae5;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">💳 Paiement carte validé</p>
              <h1 style="margin:6px 0 0;color:#fff;font-size:20px;">${formatMoney(paymentLink.montant, paymentLink.devise)} reçus</h1>
              <p style="margin:6px 0 0;color:#a7f3d0;font-size:12px;">Référence : <strong style="color:#fff;">${reference}</strong></p>
            </td></tr>
            <tr><td style="padding:24px 32px;">
              <table cellspacing="0" cellpadding="6" border="0" width="100%" style="font-size:14px;">
                <tr><td style="color:#64748b;width:140px;">Service</td><td style="color:#0C1C40;font-weight:600;">${paymentLink.service}</td></tr>
                <tr><td style="color:#64748b;">Client</td><td style="color:#0C1C40;font-weight:600;">${paymentLink.client_nom}</td></tr>
                <tr><td style="color:#64748b;">Email</td><td style="color:#475569;">${paymentLink.client_email}</td></tr>
                <tr><td style="color:#64748b;">Méthode</td><td style="color:#0C1C40;font-weight:600;">Carte bancaire (Stripe)</td></tr>
                <tr><td style="color:#64748b;">Stripe Payment</td><td style="font-family:monospace;font-size:12px;color:#475569;">${session.payment_intent}</td></tr>
              </table>
              <div style="margin-top:18px;padding:16px;background:#ecfdf5;border-left:3px solid #10b981;border-radius:8px;">
                <p style="margin:0;font-size:13px;color:#065f46;">✅ <strong>Auto-vérifié</strong> · Le paiement Stripe est confirmé. Aucune action manuelle requise. Le client a reçu sa confirmation.</p>
              </div>
            </td></tr>
            <tr><td style="background:#0C1C40;padding:14px 32px;text-align:center;font-size:11px;color:#94a3b8;">NEXUS RCA · Stripe Webhook · ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</td></tr>
          </table>
        </body></html>`;

        const clientHtml = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:24px;margin:0;">
          <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" style="background:#fff;border-radius:16px;overflow:hidden;">
            <tr><td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;">Paiement reçu ✓</h1>
              <p style="margin:8px 0 0;color:#d1fae5;font-size:13px;">Référence : <strong style="color:#fff;">${reference}</strong></p>
            </td></tr>
            <tr><td style="padding:28px 32px;color:#0C1C40;">
              <p style="margin:0 0 14px;font-size:15px;">Bonjour <strong>${paymentLink.client_nom}</strong>,</p>
              <p style="margin:0 0 14px;font-size:14px;line-height:1.65;color:#475569;">Nous avons bien reçu votre paiement de <strong style="color:#0C1C40;">${formatMoney(paymentLink.montant, paymentLink.devise)}</strong> par carte bancaire.</p>
              <div style="margin:20px 0;padding:16px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Service</p>
                <p style="margin:0;color:#0f172a;font-size:14px;font-weight:600;">${paymentLink.service}</p>
              </div>
              <p style="margin:0 0 6px;font-size:14px;line-height:1.65;color:#475569;">Le reçu officiel Nexus vous sera envoyé séparément par email sous 24 h.</p>
              <p style="margin:14px 0 0;font-size:13px;color:#94a3b8;">Conservez la référence <strong style="color:#FF6600;">${reference}</strong> pour toute question.</p>
            </td></tr>
            <tr><td style="background:#0C1C40;padding:18px 32px;text-align:center;color:#94a3b8;font-size:12px;">NEXUS RCA · Bangui<br/><span style="color:#64748b;font-size:11px;">+236 73 26 96 92 · contact@nexusrca.com</span></td></tr>
          </table>
        </body></html>`;

        // Email staff
        try {
          const r = await resend.emails.send({
            from: FROM_PRIMARY,
            to: STAFF_EMAIL,
            subject: `💳 Paiement carte validé · ${reference} · ${formatMoney(paymentLink.montant, paymentLink.devise)}`,
            html: staffHtml,
          });
          if (r.error) {
            await resend.emails.send({
              from: FROM_FALLBACK,
              to: STAFF_EMAIL,
              subject: `💳 Paiement carte validé · ${reference}`,
              html: staffHtml,
            });
          }
        } catch (e) {
          console.error("[STRIPE_WEBHOOK] email staff exception:", e);
        }

        // Email client
        try {
          const r = await resend.emails.send({
            from: FROM_PRIMARY,
            to: paymentLink.client_email,
            subject: `✓ Paiement reçu · ${reference} · Nexus RCA`,
            html: clientHtml,
          });
          if (r.error) {
            await resend.emails.send({
              from: FROM_FALLBACK,
              to: paymentLink.client_email,
              subject: `✓ Paiement reçu · ${reference}`,
              html: clientHtml,
            });
          }
        } catch (e) {
          console.error("[STRIPE_WEBHOOK] email client exception:", e);
        }
      } else {
        console.warn("[STRIPE_WEBHOOK] RESEND_API_KEY absente, skip emails");
      }

      // ─── WhatsApp confirmation client (best-effort) ───────────────────────
      if (paymentLink.client_telephone) {
        void sendWhatsApp(
          paymentLink.client_telephone,
          tplPaymentReceived({
            nom: paymentLink.client_nom,
            montant: Math.round(paymentLink.montant).toLocaleString("fr-FR"),
            devise: paymentLink.devise,
            reference,
          }),
          "stripe-payment-received"
        );
      }
    }

    // Toujours répondre 200 à Stripe pour éviter les retries
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[STRIPE_WEBHOOK] EXCEPTION:", err);
    // On répond 200 même sur erreur pour éviter retry infini de Stripe
    return NextResponse.json({ received: true, error: "Internal" });
  }
}
