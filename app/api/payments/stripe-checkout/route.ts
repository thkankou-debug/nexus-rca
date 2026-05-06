import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  getStripeClient,
  toStripeAmount,
  isSupportedCurrency,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── POST /api/payments/stripe-checkout ─────────────────────────────────────
// Crée une Stripe Checkout Session pour un payment_link existant et retourne
// l'URL hébergée par Stripe. Le client est redirigé vers cette URL.
//
// Body : { reference: string }
//
// Workflow :
// 1. Vérifie que le payment_link existe + statut valide + non expiré
// 2. Crée Session Stripe avec montant + devise + metadata
// 3. Retourne { url } pour redirection côté client

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

interface CheckoutBody {
  reference: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as CheckoutBody;
    const reference = String(body.reference || "").trim();

    if (!reference) {
      return NextResponse.json(
        { error: "reference manquante" },
        { status: 400 }
      );
    }

    // Récupère le payment_link via service_role (bypass RLS — page publique)
    const admin = getAdminClient();
    const { data: paymentLink, error } = await admin
      .from("payment_links")
      .select("*")
      .eq("reference", reference)
      .single();

    if (error || !paymentLink) {
      return NextResponse.json(
        { error: "Lien de paiement introuvable" },
        { status: 404 }
      );
    }

    // Validations métier
    if (paymentLink.statut === "verifie") {
      return NextResponse.json(
        { error: "Paiement déjà vérifié" },
        { status: 400 }
      );
    }
    if (paymentLink.statut === "annule") {
      return NextResponse.json(
        { error: "Lien annulé" },
        { status: 400 }
      );
    }
    if (paymentLink.expires_at && new Date(paymentLink.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Lien expiré" },
        { status: 400 }
      );
    }

    if (!isSupportedCurrency(paymentLink.devise)) {
      return NextResponse.json(
        { error: `Devise ${paymentLink.devise} non supportée par Stripe` },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: paymentLink.client_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: paymentLink.devise.toLowerCase(),
            unit_amount: toStripeAmount(paymentLink.montant, paymentLink.devise),
            product_data: {
              name: paymentLink.service,
              description: paymentLink.description || `Paiement Nexus RCA · ${reference}`,
            },
          },
        },
      ],
      success_url: `${baseUrl}/payer/${reference}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payer/${reference}`,
      metadata: {
        payment_link_id: paymentLink.id,
        reference: paymentLink.reference,
        client_nom: paymentLink.client_nom,
      },
      // Locale FR par défaut
      locale: "fr",
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe n'a pas renvoyé d'URL de session" },
        { status: 500 }
      );
    }

    console.log(
      `[STRIPE_CHECKOUT] ✅ session=${session.id} reference=${reference} amount=${paymentLink.montant} ${paymentLink.devise}`
    );

    return NextResponse.json({ success: true, url: session.url });
  } catch (err) {
    console.error("[STRIPE_CHECKOUT] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
