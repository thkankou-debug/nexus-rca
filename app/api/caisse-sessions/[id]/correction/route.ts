// ============================================================================
// API ROUTE — POST /api/caisse-sessions/:id/correction (cahier §8.5, lot G2)
// Le VALIDEUR (permission caisse.close, distinct de la titulaire) renvoie
// une session SOUMISE en « correction demandée » au lieu de la clôturer :
// motif obligatoire, valeurs initiales conservées (aucune transaction
// modifiée — triggers 091/093), titulaire notifiée. Elle re-compte puis
// re-soumet via /submit. Jamais d'effacement silencieux d'un écart.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("caisse.close");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as { motif?: string } | null;
    const motif = body?.motif?.trim() || "";
    if (motif.length < 3) {
      return NextResponse.json(
        { success: false, error: "Motif obligatoire — la titulaire doit savoir quoi corriger" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const { data: session } = await admin
      .from("caisse_sessions")
      .select("id, agent_id, status, actual_balance, discrepancy")
      .eq("id", params.id)
      .single();
    if (!session) return NextResponse.json({ success: false, error: "Session introuvable" }, { status: 404 });
    const s = session as { id: string; agent_id: string; status: string; actual_balance: number | null; discrepancy: number | null };

    // Séparation des tâches — même règle que /close.
    if (s.agent_id === user.id) {
      return NextResponse.json(
        { success: false, error: "Séparation des tâches : la titulaire ne traite pas sa propre soumission" },
        { status: 403 }
      );
    }
    if (s.status !== "a_cloturer") {
      return NextResponse.json(
        { success: false, error: "Seule une session soumise peut être renvoyée en correction" },
        { status: 409 }
      );
    }

    const { data: updated, error } = await admin
      .from("caisse_sessions")
      .update({
        status: "correction_demandee",
        correction_motif: motif.slice(0, 500),
        correction_by: user.id,
        correction_at: new Date().toISOString(),
      })
      .eq("id", s.id)
      .eq("status", "a_cloturer")
      .select("id, status, correction_motif");
    if (error || !updated || updated.length === 0) {
      return NextResponse.json(
        { success: false, error: error?.message || "La session a changé d'état — rechargez" },
        { status: 409 }
      );
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "caisse_session.correction_demandee",
      entityType: "caisse_sessions",
      entityId: s.id,
      oldValue: { status: "a_cloturer", actual_balance: s.actual_balance, discrepancy: s.discrepancy },
      newValue: { status: "correction_demandee", motif },
    });

    await createNotification(
      s.agent_id,
      "info",
      "Votre clôture de caisse est renvoyée en correction",
      `Motif : ${motif}. Re-comptez puis soumettez de nouveau votre rapprochement.`,
      "/dashboard/accueil/session"
    );

    return NextResponse.json({ success: true, session: updated[0] });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[CAISSE_CORRECTION] EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
