// ============================================================================
// POST /api/payments/webhook/stripe — Webhook Stripe handler
//
// PUBLIC (pas d'auth user). Sécurisé par signature HMAC + idempotence.
//
// Flow :
//   1. Lire le raw body (CRITICAL: ne pas parser avant signature check)
//   2. Vérifier la signature via STRIPE_WEBHOOK_SECRET
//   3. Idempotence : insérer dans stripe_webhook_log (PK = stripe event id).
//      Si conflit (clé déjà présente), on a déjà traité → 200 OK rapide.
//   4. Switch sur event.type : appliquer la transition de statut au paiement
//      via le service-role client (bypass RLS).
//   5. Marquer processed=true sur stripe_webhook_log.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";
import {
  verifyWebhookSignature,
  getPaymentIdFromEvent,
  getStripeChargeId,
} from "@/lib/payments/stripe";
import { toErrorResponse } from "@/lib/payments/http";

export const dynamic = "force-dynamic";

// Critical : Stripe attend le raw body pour vérifier la signature.
// Next.js App Router : par défaut, request.text() retourne le raw body — OK.

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature({ rawBody, signature });
  } catch (err) {
    return toErrorResponse(err);
  }

  const supabase = createServiceClient();

  // ─── Idempotence ────────────────────────────────────────────────────────
  // Insert dans stripe_webhook_log avec ON CONFLICT pour détecter les replays.
  const { error: logErr } = await supabase
    .from("stripe_webhook_log")
    .insert({
      id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
      processed: false,
    });

  if (logErr) {
    // 23505 = unique_violation → déjà traité, on retourne 200 sans rien faire
    if (logErr.code === "23505") {
      return NextResponse.json({ received: true, replayed: true }, { status: 200 });
    }
    // Autre erreur DB : on log mais on retourne 500 pour que Stripe retry
    console.error("[stripe webhook] Failed to log event:", logErr);
    return NextResponse.json(
      { error: "Failed to log event" },
      { status: 500 }
    );
  }

  // ─── Dispatch sur event.type ────────────────────────────────────────────
  let result: { ok: boolean; error?: string } = { ok: true };

  try {
    switch (event.type) {
      case "checkout.session.completed":
        result = await onCheckoutCompleted(supabase, event);
        break;
      case "checkout.session.expired":
        result = await onCheckoutExpired(supabase, event);
        break;
      case "charge.failed":
      case "payment_intent.payment_failed":
        result = await onPaymentFailed(supabase, event);
        break;
      case "charge.refunded":
        // Le refund est aussi déclenché côté API par /refund — on évite la
        // double-transition. Si déjà refunded, no-op.
        result = await onChargeRefunded(supabase, event);
        break;
      default:
        // Event non géré, on l'archive sans erreur
        result = { ok: true };
        break;
    }
  } catch (handlerErr) {
    const message = handlerErr instanceof Error ? handlerErr.message : "Unknown handler error";
    result = { ok: false, error: message };
  }

  // Marquer comme traité (avec ou sans erreur — pour traçabilité)
  await supabase
    .from("stripe_webhook_log")
    .update({
      processed: result.ok,
      processed_at: new Date().toISOString(),
      error: result.ok ? null : result.error ?? "Unknown error",
    })
    .eq("id", event.id);

  if (!result.ok) {
    console.error(`[stripe webhook] ${event.type} failed: ${result.error}`);
    // 500 → Stripe retry plus tard avec backoff
    return NextResponse.json(
      { error: result.error ?? "Handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ─── Handlers par event type ────────────────────────────────────────────────

type ServiceClient = ReturnType<typeof createServiceClient>;

async function onCheckoutCompleted(
  supabase: ServiceClient,
  event: Stripe.Event
): Promise<{ ok: boolean; error?: string }> {
  const session = event.data.object as Stripe.Checkout.Session;
  const paymentId = getPaymentIdFromEvent(event);
  const chargeId = getStripeChargeId(event);

  if (!paymentId) {
    return { ok: false, error: "Missing payment_id in session metadata" };
  }
  if (session.payment_status !== "paid") {
    return {
      ok: false,
      error: `Unexpected session.payment_status=${session.payment_status}`,
    };
  }

  // Charger le paiement existant pour s'assurer qu'on est bien en pending.
  const { data: payment } = await supabase
    .from("payments")
    .select("status")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment) {
    return { ok: false, error: `Payment ${paymentId} not found` };
  }
  if (payment.status === "paid" || payment.status === "validated") {
    // Déjà appliqué (probable replay malgré idempotence), no-op
    return { ok: true };
  }
  if (payment.status !== "pending") {
    return { ok: false, error: `Cannot transition from ${payment.status} to paid` };
  }

  const { error } = await supabase
    .from("payments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_id: chargeId,
      metadata: {
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
      },
      // Champ legacy
      statut: "paye",
    })
    .eq("id", paymentId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function onCheckoutExpired(
  supabase: ServiceClient,
  event: Stripe.Event
): Promise<{ ok: boolean; error?: string }> {
  const paymentId = getPaymentIdFromEvent(event);
  if (!paymentId) return { ok: true }; // ignore les sessions sans metadata

  const { data: payment } = await supabase
    .from("payments")
    .select("status")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment || payment.status !== "pending") return { ok: true };

  const { error } = await supabase
    .from("payments")
    .update({
      status: "voided",
      voided_at: new Date().toISOString(),
      notes_internes: "Stripe Checkout session expired without payment",
      statut: "annule",
    })
    .eq("id", paymentId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function onPaymentFailed(
  supabase: ServiceClient,
  event: Stripe.Event
): Promise<{ ok: boolean; error?: string }> {
  const paymentId = getPaymentIdFromEvent(event);
  if (!paymentId) return { ok: true };

  const { data: payment } = await supabase
    .from("payments")
    .select("status")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment || payment.status !== "pending") return { ok: true };

  const { error } = await supabase
    .from("payments")
    .update({
      status: "failed",
      metadata: { stripe_failure_event: event.id },
    })
    .eq("id", paymentId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

async function onChargeRefunded(
  supabase: ServiceClient,
  event: Stripe.Event
): Promise<{ ok: boolean; error?: string }> {
  const paymentId = getPaymentIdFromEvent(event);
  if (!paymentId) return { ok: true };

  const { data: payment } = await supabase
    .from("payments")
    .select("status")
    .eq("id", paymentId)
    .maybeSingle();

  if (!payment) return { ok: true };
  if (payment.status === "refunded") return { ok: true }; // déjà fait via /refund

  // Si refund initié hors Nexus (depuis dashboard Stripe), on aligne le statut
  if (payment.status === "paid" || payment.status === "validated") {
    const { error } = await supabase
      .from("payments")
      .update({
        status: "refunded",
        notes_internes: "Refund detected from Stripe webhook",
        statut: "rembourse",
      })
      .eq("id", paymentId);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}
