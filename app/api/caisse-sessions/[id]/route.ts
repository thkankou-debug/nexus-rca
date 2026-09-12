// ============================================================================
// API ROUTE — GET /api/caisse-sessions/:id
// P6, lot Caisse + Espace Accueil & Caisse ("Ma journée de caisse",
// 11/09/2026). Détail d'une session + solde théorique calculé en direct
// tant qu'elle est ouverte (opening_balance + ventes rapides en espèces
// depuis l'ouverture — même source que la page Caisse existante, qui
// n'affiche que `quick_sales`, voir docs/DETTE.md P6-0 #12) + le journal des
// mouvements (toutes les ventes rapides de l'agent depuis l'ouverture,
// espèces ou non — le journal montre l'activité complète, seul le solde
// théorique ne compte que les espèces).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { computeExpectedBalance } from "@/lib/caisse-server";

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
      closed_at: string | null;
      status: string;
      opening_balance: number;
    };

    if ((role === "agent" || role === "accueil_caisse") && sessionRow.agent_id !== user.id) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    let liveExpectedBalance: number | null = null;
    if (sessionRow.status === "ouverte") {
      // Même calcul que lib/caisse-server.ts (cautions +, remboursements −).
      liveExpectedBalance = await computeExpectedBalance(
        admin,
        sessionRow.agent_id,
        sessionRow.opened_at,
        sessionRow.opening_balance
      );
    }

    let movementsQuery = admin
      .from("quick_sales")
      .select("id, type_service, description, montant_total, devise, mode_paiement, client_nom, created_at, nature")
      .eq("agent_id", sessionRow.agent_id)
      .gte("created_at", sessionRow.opened_at)
      .order("created_at", { ascending: false });
    if (sessionRow.closed_at) {
      movementsQuery = movementsQuery.lte("created_at", sessionRow.closed_at);
    }
    const { data: movements } = await movementsQuery;

    return NextResponse.json({
      success: true,
      session,
      live_expected_balance: liveExpectedBalance,
      movements: movements || [],
    });
  } catch (err) {
    console.error("[CAISSE_SESSIONS] GET/:id EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
