// ============================================================================
// POST /api/payments/[id]/validate — Valider un paiement offline
//
// Authentication : admin+
// Règles métier  : status doit être 'paid', method offline (cash/OM/MTN/virement),
//                  validator ≠ creator (séparation des pouvoirs strict).
// State machine  : paid → validated.
// ============================================================================

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  requireRole,
  toErrorResponse,
  jsonOk,
  errors,
} from "@/lib/payments/http";
import {
  validateValidationStep,
  validateTransition,
  canValidatePayment,
} from "@/lib/payments";

export const dynamic = "force-dynamic";

interface ValidateBody {
  notes?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await requireRole("admin");
    const supabase = createClient();

    const body = (await request.json().catch(() => ({}))) as Partial<ValidateBody>;

    const { data: payment, error: queryErr } = await supabase
      .from("payments")
      .select("id, status, method, created_by, notes_internes")
      .eq("id", params.id)
      .maybeSingle();

    if (queryErr) throw errors.badRequest(queryErr.message, "QUERY_FAILED");
    if (!payment) throw errors.notFound("Payment");

    // Garde-fou côté code (le trigger SQL refait le check, mais on veut un
    // 4xx propre plutôt qu'un 500 de la DB).
    if (!canValidatePayment({
      role: ctx.role,
      userId: ctx.userId,
      payment: { created_by: payment.created_by },
    })) {
      throw errors.forbidden(
        "Self-validation forbidden: validator must differ from creator",
        // Note : "FORBIDDEN" plutôt que message technique pour l'UI
      );
    }

    validateValidationStep({
      payment: {
        status: payment.status,
        method: payment.method,
        created_by: payment.created_by,
      },
      validator_id: ctx.userId,
    });
    validateTransition(payment.status, "validated");

    const newNotes = body.notes
      ? (payment.notes_internes ? `${payment.notes_internes}\n\n[Validation ${new Date().toISOString()}]\n${body.notes}` : body.notes)
      : payment.notes_internes;

    const { data: updated, error: updateErr } = await supabase
      .from("payments")
      .update({
        status: "validated",
        validated_by: ctx.userId,
        validated_at: new Date().toISOString(),
        notes_internes: newNotes,
        // Champ legacy
        statut: "paye",
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
