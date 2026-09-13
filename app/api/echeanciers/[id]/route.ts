// ============================================================================
// API ROUTE — PATCH /api/echeanciers/:id
// P6, lot Échéanciers. Marque une échéance comme payée. Permission
// 'paiement.record' (admin/comptable/daf) — un agent peut planifier une
// échéance (facture.create) mais pas la marquer payée lui-même, séparation
// des tâches cohérente avec le reste de P6.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("paiement.record");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const admin = getAdminClient();
    const { data: echeancier } = await admin.from("echeanciers").select("id, status").eq("id", params.id).single();
    if (!echeancier) {
      return NextResponse.json({ success: false, error: "Échéance introuvable" }, { status: 404 });
    }
    const echeancierRow = echeancier as { id: string; status: string };
    if (echeancierRow.status === "paye") {
      return NextResponse.json({ success: false, error: "Cette échéance est déjà payée" }, { status: 400 });
    }

    const { error: updateError } = await admin
      .from("echeanciers")
      .update({ status: "paye", paid_at: new Date().toISOString() })
      .eq("id", params.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "echeancier.paye",
      entityType: "echeanciers",
      entityId: params.id,
      oldValue: { status: echeancierRow.status },
      newValue: { status: "paye" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[ECHEANCIERS] PATCH EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
