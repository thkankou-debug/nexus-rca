// ============================================================================
// API ROUTE — /api/caisse-sessions
// P6, lot Caisse. GET (liste, scope agent = ses sessions / staff = toutes),
// POST (ouverture d'une session — solde d'ouverture déclaré par l'agent).
// Une seule session "ouverte" à la fois par agent (contrainte applicative,
// pas de contrainte DB — cohérent avec le reste du dépôt qui privilégie la
// validation serveur explicite sur cette table sensible).
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

interface OpenSessionBody {
  opening_balance: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const admin = getAdminClient();
    let query = admin
      .from("caisse_sessions")
      .select("id, agent_id, opened_at, closed_at, opening_balance, expected_balance, actual_balance, discrepancy, status, notes, created_at, profiles(nom, prenom)")
      .order("opened_at", { ascending: false });

    if (role === "agent") {
      query = query.eq("agent_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[CAISSE_SESSIONS] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessions: data });
  } catch (err) {
    console.error("[CAISSE_SESSIONS] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("caisse.write");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as OpenSessionBody | null;
    if (!body || !Number.isFinite(body.opening_balance) || body.opening_balance < 0) {
      return NextResponse.json({ success: false, error: "opening_balance requis (nombre >= 0)" }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: existingOpen } = await admin
      .from("caisse_sessions")
      .select("id")
      .eq("agent_id", user.id)
      .eq("status", "ouverte")
      .maybeSingle();

    if (existingOpen) {
      return NextResponse.json(
        { success: false, error: "Une session est déjà ouverte pour cet agent" },
        { status: 400 }
      );
    }

    const { data: created, error: insertError } = await admin
      .from("caisse_sessions")
      .insert({ agent_id: user.id, opening_balance: body.opening_balance })
      .select("id, opened_at, opening_balance, status")
      .single();

    if (insertError || !created) {
      console.error("[CAISSE_SESSIONS] insert error:", insertError?.message);
      return NextResponse.json({ success: false, error: insertError?.message || "Échec d'ouverture" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "caisse_session.ouverte",
      entityType: "caisse_sessions",
      entityId: (created as { id: string }).id,
      newValue: { opening_balance: body.opening_balance },
    });

    return NextResponse.json({ success: true, session: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[CAISSE_SESSIONS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
