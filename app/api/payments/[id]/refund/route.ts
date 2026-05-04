// ============================================================================
// POST /api/payments/[id]/refund — Rembourser un paiement Stripe
//
// Authentication : super_admin uniquement.
// Règles métier  : status ∈ {paid, validated}, method=stripe (Stripe API).
//                  Pour les paiements offline, utiliser /void.
// State machine  : paid|validated → refunded.
// ============================================================================

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  requireRole,
  toErrorResponse,
  jsonOk,
  errors,
} from "@/lib/payments/http";
import { validateTransition, canRefundPayment } from "@/lib/payments";
import { refundStripePayment } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";

interface RefundBody {
  reason: string;
  /** Remboursement partiel (montant en devise originale humaine). Optionnel. */
  amount?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await requireRole("super_admin");

    if (!canRefundPayment(ctx.role)) {
      throw errors.forbidden("Only super_admin can refund");
    }

    const supabase = createClient();
    const body = (await request.json().catch(() => ({}))) as Partial<RefundBody>;

    if (!body.reason?.trim()) {
      throw errors.badRequest("'reason' is required for refund", "MISSING_REASON");
    }

    const { data: payment, error: queryErr } = await supabase
      .from("payments")
      .select("id, status, method, currency, amount, stripe_payment_id, notes_internes")
      .eq("id", params.id)
      .maybeSingle();

    if (queryErr) throw errors.badRequest(queryErr.message, "QUERY_FAILED");
    if (!payment) throw errors.notFound("Payment");

    if (payment.method !== "stripe") {
      throw errors.badRequest(
        `Refund via API is only for Stripe payments. For offline (${payment.method}), use /void`,
        "REFUND_NOT_SUPPORTED"
      );
    }

    if (!payment.stripe_payment_id) {
      throw errors.badRequest(
        "Stripe payment_intent_id is missing on this payment — cannot refund",
        "MISSING_STRIPE_INTENT"
      );
    }

    if (payment.status !== "paid" && payment.status !== "validated") {
      throw errors.badRequest(
        `Payment in status '${payment.status}' cannot be refunded`,
        "INVALID_STATUS_FOR_REFUND"
      );
    }

    validateTransition(payment.status, "refunded");

    // Déclencher le refund Stripe (peut throw)
    const refund = await refundStripePayment({
      payment_intent_id: payment.stripe_payment_id,
      reason: "requested_by_customer",
      amount: body.amount,
      currency: payment.currency ?? undefined,
      metadata: {
        payment_id: params.id,
        actor: ctx.userId,
        reason: body.reason,
      },
    });

    const newNotes = `${payment.notes_internes ? payment.notes_internes + "\n\n" : ""}[REFUNDED ${new Date().toISOString()} by super_admin]\nStripe refund id : ${refund.id}\nRaison : ${body.reason}`;

    const { data: updated, error: updateErr } = await supabase
      .from("payments")
      .update({
        status: "refunded",
        notes_internes: newNotes,
        metadata: {
          stripe_refund_id: refund.id,
          stripe_refund_status: refund.status,
        },
        statut: "rembourse", // legacy
      })
      .eq("id", params.id)
      .select("*")
      .single();

    if (updateErr) throw errors.badRequest(updateErr.message, "UPDATE_FAILED");

    return jsonOk({ payment: updated, refund_id: refund.id });
  } catch (err) {
    return toErrorResponse(err);
  }
}
