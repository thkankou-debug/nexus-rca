// ============================================================================
// API ROUTE — /api/commissions
// P6, lot Commissions. GET (liste, scope agent = les siennes / staff =
// toutes), POST (création manuelle — décision confirmée par Thierry le
// 06/09/2026 : pas de formule automatique, le schéma ne porte aucun taux
// configurable par agent/service).
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

interface CreateCommissionBody {
  agent_id: string;
  amount: number;
  rate?: number | null;
  demande_id?: string | null;
  payment_id?: string | null;
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
      .from("commissions")
      .select(
        "id, agent_id, demande_id, payment_id, amount, rate, status, validated_by, validated_at, created_at, profiles!commissions_agent_id_fkey(nom, prenom), demandes(reference, service)"
      )
      .order("created_at", { ascending: false });

    if (role === "agent") {
      query = query.eq("agent_id", user.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[COMMISSIONS] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, commissions: data });
  } catch (err) {
    console.error("[COMMISSIONS] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("commission.create");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as CreateCommissionBody | null;
    if (!body || !body.agent_id || !Number.isFinite(body.amount) || body.amount <= 0) {
      return NextResponse.json({ success: false, error: "agent_id et amount (> 0) sont requis" }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: agentProfile } = await admin.from("profiles").select("id, role").eq("id", body.agent_id).single();
    if (!agentProfile || (agentProfile as { role?: string }).role !== "agent") {
      return NextResponse.json({ success: false, error: "agent_id doit être un agent existant" }, { status: 400 });
    }

    const { data: created, error: insertError } = await admin
      .from("commissions")
      .insert({
        agent_id: body.agent_id,
        amount: body.amount,
        rate: body.rate ?? null,
        demande_id: body.demande_id || null,
        payment_id: body.payment_id || null,
      })
      .select("id, agent_id, amount, rate, status, created_at")
      .single();

    if (insertError || !created) {
      console.error("[COMMISSIONS] insert error:", insertError?.message);
      return NextResponse.json({ success: false, error: insertError?.message || "Échec de création" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "commission.creee",
      entityType: "commissions",
      entityId: (created as { id: string }).id,
      newValue: body,
    });

    return NextResponse.json({ success: true, commission: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[COMMISSIONS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
