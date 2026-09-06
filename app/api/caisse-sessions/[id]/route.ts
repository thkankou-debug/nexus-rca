// ============================================================================
// API ROUTE — GET /api/caisse-sessions/:id
// P6, lot Caisse. Détail d'une session + solde théorique calculé en direct
// tant qu'elle est ouverte (opening_balance + ventes rapides en espèces
// depuis l'ouverture — même source que la page Caisse existante, qui
// n'affiche que `quick_sales`, voir docs/DETTE.md P6-0 #12).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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
    const { data: session } = await admin
      .from("caisse_sessions")
      .select("id, agent_id, opened_at, closed_at, opening_balance, expected_balance, actual_balance, discrepancy, status, notes")
      .eq("id", params.id)
      .single();

    if (!session) {
      return NextResponse.json({ success: false, error: "Session introuvable" }, { status: 404 });
    }

    const sessionRow = session as {
      id: string;
      agent_id: string;
      opened_at: string;
      status: string;
      opening_balance: number;
    };

    if (role === "agent" && sessionRow.agent_id !== user.id) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    let liveExpectedBalance: number | null = null;
    if (sessionRow.status === "ouverte") {
      const { data: ventes } = await admin
        .from("quick_sales")
        .select("montant_total")
        .eq("agent_id", sessionRow.agent_id)
        .eq("mode_paiement", "especes")
        .gte("created_at", sessionRow.opened_at);
      const total = (ventes || []).reduce((sum, v) => sum + Number((v as { montant_total: number }).montant_total), 0);
      liveExpectedBalance = sessionRow.opening_balance + total;
    }

    return NextResponse.json({ success: true, session, live_expected_balance: liveExpectedBalance });
  } catch (err) {
    console.error("[CAISSE_SESSIONS] GET/:id EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
