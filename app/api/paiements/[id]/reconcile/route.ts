// ============================================================================
// API ROUTE — POST /api/paiements/:id/reconcile
// Chaîne §4.3, 2ᵉ maillon : « Comptable saisit et rapproche → paiement
// à valider ». Pose reconciled_by/reconciled_at (migration 081). Le
// comptable rapproche, il ne valide pas — la validation reste /validate
// (paiement.validate, DAF). Séparation des tâches : le rapprocheur doit
// différer du créateur du paiement, comme validated_by ≠ created_by.
// Jamais appliqué aux 3 paiements legacy (metadata.legacy, P6-0).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { getFinanceAdminClient } from "@/lib/finance-server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("paiement.reconcile");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const admin = getFinanceAdminClient();
    const { data: payment } = await admin
      .from("payments")
      .select("id, reference, status, reconciled_at, created_by, metadata")
      .eq("id", params.id)
      .single();
    if (!payment) {
      return NextResponse.json({ success: false, error: "Paiement introuvable" }, { status: 404 });
    }

    const row = payment as {
      id: string;
      reference: string | null;
      status: string | null;
      reconciled_at: string | null;
      created_by: string | null;
      metadata: { legacy?: boolean } | null;
    };

    if (row.metadata?.legacy) {
      return NextResponse.json(
        { success: false, error: "Paiement legacy (antérieur à la chaîne) — non rapprochable" },
        { status: 400 }
      );
    }
    if (row.status === "validated" || row.status === "refunded" || row.status === "voided") {
      return NextResponse.json(
        { success: false, error: `Paiement déjà ${row.status} — rien à rapprocher` },
        { status: 400 }
      );
    }
    if (row.reconciled_at) {
      return NextResponse.json({ success: false, error: "Paiement déjà rapproché" }, { status: 400 });
    }
    if (row.created_by === user.id) {
      return NextResponse.json(
        { success: false, error: "Séparation des tâches : le rapprocheur doit différer du créateur du paiement" },
        { status: 400 }
      );
    }

    const { error: updateError } = await admin
      .from("payments")
      .update({ reconciled_by: user.id, reconciled_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updateError) {
      console.error("[PAIEMENTS] reconcile error:", updateError.message);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "paiement.rapproche",
      entityType: "payments",
      entityId: row.id,
      oldValue: { status: row.status, reconciled_at: null },
      newValue: { reconciled_by: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[PAIEMENTS] reconcile EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
