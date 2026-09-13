// ============================================================================
// API ROUTE — POST /api/commissions/:id/status
// P6, lot Commissions. Transition calculee → validee → payee. Permission
// unique 'commission.validate' pour les deux transitions (même logique que
// facture.validate pour validee/payee — voir docs/DETTE.md).
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

type CommissionStatus = "calculee" | "validee" | "payee";

const TRANSITIONS: Record<CommissionStatus, CommissionStatus[]> = {
  calculee: ["validee"],
  validee: ["payee"],
  payee: [],
};

interface StatusBody {
  status: CommissionStatus;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("commission.validate");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as StatusBody | null;
    const validStatuses: CommissionStatus[] = ["calculee", "validee", "payee"];
    if (!body || !validStatuses.includes(body.status)) {
      return NextResponse.json({ success: false, error: "status invalide" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: commission } = await admin.from("commissions").select("id, status").eq("id", params.id).single();
    if (!commission) {
      return NextResponse.json({ success: false, error: "Commission introuvable" }, { status: 404 });
    }

    const commissionRow = commission as { id: string; status: CommissionStatus };
    const allowed = TRANSITIONS[commissionRow.status] || [];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `Transition ${commissionRow.status} → ${body.status} non autorisée` },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = { status: body.status };
    if (body.status === "validee") {
      update.validated_by = user.id;
      update.validated_at = new Date().toISOString();
    }

    const { error: updateError } = await admin.from("commissions").update(update).eq("id", params.id);
    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "commission.statut.change",
      entityType: "commissions",
      entityId: params.id,
      oldValue: { status: commissionRow.status },
      newValue: { status: body.status },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[COMMISSIONS] STATUS EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
