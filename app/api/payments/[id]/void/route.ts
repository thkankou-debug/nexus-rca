// ============================================================================
// POST /api/payments/[id]/void — Annuler administrativement un paiement
//
// Authentication : super_admin uniquement.
// Règles métier  : non terminal (ni voided ni refunded).
// State machine  : * → voided.
// ============================================================================

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  requireRole,
  toErrorResponse,
  jsonOk,
  errors,
} from "@/lib/payments/http";
import { validateVoidStep, validateTransition, canVoidPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

interface VoidBody {
  reason: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await requireRole("super_admin");

    if (!canVoidPayment(ctx.role)) {
      throw errors.forbidden("Only super_admin can void a payment");
    }

    const supabase = createClient();
    const body = (await request.json().catch(() => ({}))) as Partial<VoidBody>;

    if (!body.reason?.trim()) {
      throw errors.badRequest("'reason' is required to void a payment", "MISSING_REASON");
    }

    const { data: payment, error: queryErr } = await supabase
      .from("payments")
      .select("id, status, notes_internes")
      .eq("id", params.id)
      .maybeSingle();

    if (queryErr) throw errors.badRequest(queryErr.message, "QUERY_FAILED");
    if (!payment) throw errors.notFound("Payment");

    validateVoidStep({ payment: { status: payment.status } });
    if (payment.status !== null) {
      validateTransition(payment.status, "voided");
    }

    const newNotes = `${payment.notes_internes ? payment.notes_internes + "\n\n" : ""}[VOIDED ${new Date().toISOString()} by super_admin]\nRaison : ${body.reason}`;

    const { data: updated, error: updateErr } = await supabase
      .from("payments")
      .update({
        status: "voided",
        voided_at: new Date().toISOString(),
        notes_internes: newNotes,
        statut: "annule", // legacy
      })
      .eq("id", params.id)
      .select("*")
      .single();

    if (updateErr) throw errors.badRequest(updateErr.message, "UPDATE_FAILED");

    return jsonOk({ payment: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}
