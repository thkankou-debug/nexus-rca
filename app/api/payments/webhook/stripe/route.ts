// ============================================================================
// POST /api/payments/webhook/stripe
//
// Webhook Stripe : marque un paiement comme `paid` quand la session Checkout
// est complétée. PUBLIC, sécurisé par signature HMAC.
//
// Pour le flow simple, on n'écoute QUE checkout.session.completed.
// Les autres événements (refund, failure, expiration) sont gérés manuellement
// si besoin via /api/payments/[id]/validate ou directement en DB.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { verifyStripeWebhook } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = verifyStripeWebhook(rawBody, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // On ne traite que checkout.session.completed
  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const paymentId = session.metadata?.payment_id;

  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment_id in metadata" }, { status: 400 });
  }
  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true, payment_status: session.payment_status });
  }

  // Service-role client pour bypass RLS (le webhook n'a pas de session user)
  const supabase = createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await supabase
    .from("payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      statut: "paye", // mirror legacy
    })
    .eq("id", paymentId);

  if (error) {
    console.error("[stripe webhook] update failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true, payment_id: paymentId });
}
