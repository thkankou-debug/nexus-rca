// ============================================================================
// GET /api/payments/[id] — Récupérer un paiement
// PATCH /api/payments/[id] — Mettre à jour les notes internes (créateur/admin+)
//
// Authentication : auth requis ; visibilité contrôlée par RLS payments_select.
// ============================================================================

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  requireAuthenticated,
  toErrorResponse,
  jsonOk,
  errors,
} from "@/lib/payments/http";
import { canEditPaymentNotes } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuthenticated();
    const supabase = createClient();

    // RLS payments_select fait le filtrage — si l'utilisateur n'a pas accès,
    // la query retourne 0 row.
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (error) throw errors.badRequest(error.message, "QUERY_FAILED");
    if (!data) throw errors.notFound("Payment");

    return jsonOk({ payment: data });
  } catch (err) {
    return toErrorResponse(err);
  }
}

interface PatchBody {
  notes_internes?: string | null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ctx = await requireAuthenticated();
    const supabase = createClient();

    const body = (await request.json()) as Partial<PatchBody>;

    // Charger le paiement pour vérifier l'autorisation côté code
    const { data: payment } = await supabase
      .from("payments")
      .select("created_by")
      .eq("id", params.id)
      .maybeSingle();

    if (!payment) throw errors.notFound("Payment");

    if (!canEditPaymentNotes({
      role: ctx.role,
      userId: ctx.userId,
      payment: { created_by: payment.created_by },
    })) {
      throw errors.forbidden("You cannot edit notes on this payment");
    }

    const update: Record<string, unknown> = {};
    if (body.notes_internes !== undefined) {
      update.notes_internes = body.notes_internes;
    }

    if (Object.keys(update).length === 0) {
      throw errors.badRequest("No editable fields provided", "NO_FIELDS");
    }

    const { data: updated, error: updateErr } = await supabase
      .from("payments")
      .update(update)
      .eq("id", params.id)
      .select("*")
      .single();

    if (updateErr) throw errors.badRequest(updateErr.message, "UPDATE_FAILED");

    return jsonOk({ payment: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}
