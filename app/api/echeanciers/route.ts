// ============================================================================
// API ROUTE — /api/echeanciers
// P6, lot Échéanciers. GET (liste, scope agent = dossiers dont il est
// affecté / staff = tout ; en_retard recalculé en écriture différée),
// POST (planification d'une échéance sur une facture validée/payée —
// 'echeancier.*' n'existe pas dans l'énumération §P2, géré par
// 'facture.create', même logique que facture_lignes qui n'a pas non plus
// de permission propre).
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

interface CreateEcheancierBody {
  facture_id: string;
  amount: number;
  due_date: string;
}

async function refreshOverdue(admin: ReturnType<typeof getAdminClient>) {
  const today = new Date().toISOString().slice(0, 10);
  await admin.from("echeanciers").update({ status: "en_retard" }).eq("status", "a_venir").lt("due_date", today);
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
    await refreshOverdue(admin);

    let query = admin
      .from("echeanciers")
      .select(
        "id, facture_id, demande_id, amount, due_date, status, paid_at, created_at, factures(reference, amount, currency, status, demande_id, demandes(reference, nom_complet, service, agent_id))"
      )
      .order("due_date", { ascending: true });

    if (role === "agent") {
      const { data: ownDemandes } = await admin.from("demandes").select("id").eq("agent_id", user.id);
      const ids = (ownDemandes || []).map((d) => (d as { id: string }).id);
      if (ids.length === 0) {
        return NextResponse.json({ success: true, echeanciers: [] });
      }
      query = query.in("demande_id", ids);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[ECHEANCIERS] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, echeanciers: data });
  } catch (err) {
    console.error("[ECHEANCIERS] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("facture.create");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as CreateEcheancierBody | null;
    if (!body || !body.facture_id || !Number.isFinite(body.amount) || body.amount <= 0 || !body.due_date) {
      return NextResponse.json(
        { success: false, error: "facture_id, amount (> 0) et due_date sont requis" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    const { data: facture } = await admin
      .from("factures")
      .select("id, amount, status, demande_id, demandes(agent_id)")
      .eq("id", body.facture_id)
      .single();

    if (!facture) {
      return NextResponse.json({ success: false, error: "Facture introuvable" }, { status: 404 });
    }

    const factureRow = facture as unknown as {
      id: string;
      amount: number;
      status: string;
      demande_id: string | null;
      demandes: { agent_id: string | null } | null;
    };

    if (!["validee", "payee"].includes(factureRow.status)) {
      return NextResponse.json(
        { success: false, error: "Seule une facture validée ou payée peut recevoir un échéancier" },
        { status: 400 }
      );
    }
    if (role === "agent" && factureRow.demandes?.agent_id !== user.id) {
      return NextResponse.json({ success: false, error: "Ce dossier n'est pas affecté à cet agent" }, { status: 403 });
    }

    const { data: existing } = await admin.from("echeanciers").select("amount").eq("facture_id", body.facture_id);
    const dejaEcheance = (existing || []).reduce((sum, e) => sum + Number((e as { amount: number }).amount), 0);
    const resteAEcheancer = factureRow.amount - dejaEcheance;

    if (body.amount > resteAEcheancer + 0.01) {
      return NextResponse.json(
        { success: false, error: `Montant supérieur au reste à échéancer (${resteAEcheancer})` },
        { status: 400 }
      );
    }

    const { data: created, error: insertError } = await admin
      .from("echeanciers")
      .insert({
        facture_id: body.facture_id,
        demande_id: factureRow.demande_id,
        amount: body.amount,
        due_date: body.due_date,
      })
      .select("id, amount, due_date, status")
      .single();

    if (insertError || !created) {
      console.error("[ECHEANCIERS] insert error:", insertError?.message);
      return NextResponse.json({ success: false, error: insertError?.message || "Échec de création" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "echeancier.cree",
      entityType: "echeanciers",
      entityId: (created as { id: string }).id,
      newValue: { facture_id: body.facture_id, amount: body.amount, due_date: body.due_date },
    });

    return NextResponse.json({ success: true, echeancier: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[ECHEANCIERS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
