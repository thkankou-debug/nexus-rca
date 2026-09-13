// ============================================================================
// API ROUTE — POST /api/depenses/:id/validate
// Trésorerie DAF (§2.4 : « À valider — dépenses »). Valide ou rejette une
// dépense en attente (permission depense.validate — migration 081 : admin,
// daf ; super_admin court-circuite). Motif obligatoire en cas de rejet.
// La validation de dépense existait déjà côté UI admin/super_admin
// (ExpensesManager, écriture directe sous RLS) — cette route donne le même
// pouvoir au DAF, qui n'est pas couvert par ces policies, avec audit.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { getFinanceAdminClient } from "@/lib/finance-server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

interface ValidateBody {
  decision: "valide" | "rejete";
  motif_rejet?: string;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("depense.validate");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as ValidateBody | null;
    if (!body || !["valide", "rejete"].includes(body.decision)) {
      return NextResponse.json({ success: false, error: "decision requise (valide | rejete)" }, { status: 400 });
    }
    if (body.decision === "rejete" && !body.motif_rejet?.trim()) {
      return NextResponse.json({ success: false, error: "motif_rejet requis pour un rejet" }, { status: 400 });
    }

    const admin = getFinanceAdminClient();
    const { data: expense } = await admin
      .from("expenses")
      .select("id, reference, statut, montant, employee_id")
      .eq("id", params.id)
      .single();
    if (!expense) {
      return NextResponse.json({ success: false, error: "Dépense introuvable" }, { status: 404 });
    }

    const row = expense as {
      id: string;
      reference: string | null;
      statut: string;
      montant: number;
      employee_id: string | null;
    };
    if (row.statut !== "en_attente") {
      return NextResponse.json(
        { success: false, error: `Dépense déjà ${row.statut === "valide" ? "validée" : "rejetée"}` },
        { status: 400 }
      );
    }
    if (row.employee_id === user.id) {
      return NextResponse.json(
        { success: false, error: "Séparation des tâches : on ne valide pas sa propre dépense" },
        { status: 400 }
      );
    }

    const { error: updateError } = await admin
      .from("expenses")
      .update({
        statut: body.decision,
        validated_by: user.id,
        validated_at: new Date().toISOString(),
        motif_rejet: body.decision === "rejete" ? body.motif_rejet!.trim() : null,
      })
      .eq("id", row.id);
    if (updateError) {
      console.error("[DEPENSES] validate error:", updateError.message);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: body.decision === "valide" ? "depense.validee" : "depense.rejetee",
      entityType: "expenses",
      entityId: row.id,
      oldValue: { statut: "en_attente" },
      newValue: { statut: body.decision, montant: row.montant, motif_rejet: body.motif_rejet || null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[DEPENSES] validate EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
