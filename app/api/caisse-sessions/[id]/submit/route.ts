// ============================================================================
// API ROUTE — POST /api/caisse-sessions/:id/submit
// Espace Accueil & Caisse (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md, §3.3/§4.3).
// Première moitié de la chaîne de validation : la caissière soumet son
// comptage de fin de journée, le serveur calcule le solde théorique et
// l'écart — statut -> "a_cloturer". Elle ne clôture pas ; la validation
// finale appartient à /close (permission caisse.close, DAF/admin).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { computeExpectedBalance } from "@/lib/caisse-server";
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

interface SubmitBody {
  actual_balance: number;
  notes?: string;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("caisse.reconcile.submit");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as SubmitBody | null;
    if (!body || !Number.isFinite(body.actual_balance) || body.actual_balance < 0) {
      return NextResponse.json({ success: false, error: "actual_balance requis (nombre >= 0)" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: session } = await admin
      .from("caisse_sessions")
      .select("id, agent_id, opened_at, opening_balance, status")
      .eq("id", params.id)
      .single();

    if (!session) {
      return NextResponse.json({ success: false, error: "Session introuvable" }, { status: 404 });
    }

    const sessionRow = session as {
      id: string;
      agent_id: string;
      opened_at: string;
      opening_balance: number;
      status: string;
    };

    // Une caissière ne soumet que sa propre session (une exception admin/
    // super_admin n'est pas nécessaire ici : ce sont eux qui valident/closent,
    // pas eux qui soumettent).
    if (sessionRow.agent_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Vous ne pouvez soumettre que votre propre session" },
        { status: 403 }
      );
    }

    if (sessionRow.status !== "ouverte") {
      return NextResponse.json(
        { success: false, error: "Cette session n'est pas ouverte (déjà soumise ou clôturée)" },
        { status: 400 }
      );
    }

    const expectedBalance = await computeExpectedBalance(
      admin,
      sessionRow.agent_id,
      sessionRow.opened_at,
      sessionRow.opening_balance
    );
    const discrepancy = body.actual_balance - expectedBalance;

    const { error: updateError } = await admin
      .from("caisse_sessions")
      .update({
        status: "a_cloturer",
        expected_balance: expectedBalance,
        actual_balance: body.actual_balance,
        discrepancy,
        notes: body.notes || null,
      })
      .eq("id", params.id);

    if (updateError) {
      console.error("[CAISSE_SESSIONS] submit error:", updateError.message);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "caisse_session.soumise",
      entityType: "caisse_sessions",
      entityId: params.id,
      newValue: { expected_balance: expectedBalance, actual_balance: body.actual_balance, discrepancy },
    });

    return NextResponse.json({ success: true, expected_balance: expectedBalance, discrepancy });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[CAISSE_SESSIONS] SUBMIT EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
