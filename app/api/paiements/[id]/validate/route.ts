// ============================================================================
// API ROUTE — POST /api/paiements/:id/validate
// Chaîne §4.3, 3ᵉ maillon : « DAF valide → paiement encaissé ». Passe
// status à 'validated'. Exige un paiement DÉJÀ rapproché (« aucun rôle ne
// franchit deux étapes ») et s'appuie sur le trigger existant
// payments_check_transition pour : validated_by ≠ created_by,
// validated_at posé, transitions terminales verrouillées.
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
    await assertPermission("paiement.validate");

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
      .select("id, reference, status, reconciled_at, reconciled_by, created_by, metadata")
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
      reconciled_by: string | null;
      created_by: string | null;
      metadata: { legacy?: boolean } | null;
    };

    if (row.metadata?.legacy) {
      return NextResponse.json(
        { success: false, error: "Paiement legacy (antérieur à la chaîne) — non validable ici" },
        { status: 400 }
      );
    }
    if (row.status === "validated") {
      return NextResponse.json({ success: false, error: "Paiement déjà encaissé" }, { status: 400 });
    }
    if (row.status === "refunded" || row.status === "voided") {
      return NextResponse.json(
        { success: false, error: `Paiement ${row.status} — non validable` },
        { status: 400 }
      );
    }
    if (!row.reconciled_at) {
      return NextResponse.json(
        { success: false, error: "Rapprochement comptable requis avant validation (chaîne §4.3 : aucun rôle ne franchit deux étapes)" },
        { status: 400 }
      );
    }
    if (row.reconciled_by === user.id) {
      return NextResponse.json(
        { success: false, error: "Séparation des tâches : le validateur doit différer du rapprocheur" },
        { status: 400 }
      );
    }

    // validated_by ≠ created_by et validated_at sont imposés/posés par le
    // trigger payments_check_transition — on lui laisse le dernier mot.
    const { error: updateError } = await admin
      .from("payments")
      .update({ status: "validated", validated_by: user.id })
      .eq("id", row.id);
    if (updateError) {
      console.error("[PAIEMENTS] validate error:", updateError.message);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "paiement.valide",
      entityType: "payments",
      entityId: row.id,
      oldValue: { status: row.status },
      newValue: { status: "validated", validated_by: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[PAIEMENTS] validate EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
