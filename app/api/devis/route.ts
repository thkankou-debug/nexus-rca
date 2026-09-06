// ============================================================================
// API ROUTE — /api/devis
// P6, lot Devis. GET (liste, scope agent = ses dossiers / staff = tout),
// POST (creation brouillon + lignes, liee a une demande).
// Reserve staff (agent/admin/super_admin + les 5 nouveaux roles P2). RLS
// (migration 045, "Staff can manage devis") reste la garantie ultime ;
// assertPermission("devis.create") est la garantie applicative de premiere
// ligne (§P2).
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

interface LigneInput {
  description: string;
  quantity: number;
  unit_price: number;
}

interface CreateDevisBody {
  demande_id: string;
  valid_until?: string | null;
  lignes: LigneInput[];
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

    const { data: actor } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();
    const role = (actor as { role?: string } | null)?.role || "";

    const admin = getAdminClient();
    let query = admin
      .from("devis")
      .select(
        "id, reference, status, amount, currency, valid_until, sent_at, accepted_at, created_at, demande_id, client_record_id, created_by, demandes(reference, nom_complet, service, agent_id)"
      )
      .order("created_at", { ascending: false });

    // Scope "own" pour agent : uniquement les devis de ses dossiers.
    // super_admin/admin voient tout (garanti aussi par la policy RLS
    // "Staff can manage devis", is_staff() côté base).
    if (role === "agent") {
      const { data: ownDemandes } = await admin
        .from("demandes")
        .select("id")
        .eq("agent_id", user.id);
      const ids = (ownDemandes || []).map((d) => (d as { id: string }).id);
      if (ids.length === 0) {
        return NextResponse.json({ success: true, devis: [] });
      }
      query = query.in("demande_id", ids);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[DEVIS] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, devis: data });
  } catch (err) {
    console.error("[DEVIS] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("devis.create");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as CreateDevisBody | null;
    if (!body || !body.demande_id || !Array.isArray(body.lignes) || body.lignes.length === 0) {
      return NextResponse.json(
        { success: false, error: "demande_id et au moins une ligne sont requis" },
        { status: 400 }
      );
    }
    for (const ligne of body.lignes) {
      if (!ligne.description || !Number.isFinite(ligne.quantity) || !Number.isFinite(ligne.unit_price)) {
        return NextResponse.json(
          { success: false, error: "Chaque ligne requiert description, quantity, unit_price" },
          { status: 400 }
        );
      }
      if (ligne.quantity <= 0 || ligne.unit_price < 0) {
        return NextResponse.json(
          { success: false, error: "quantity doit être > 0, unit_price >= 0" },
          { status: 400 }
        );
      }
    }

    const admin = getAdminClient();

    const { data: demande } = await admin
      .from("demandes")
      .select("id, agent_id, client_record_id")
      .eq("id", body.demande_id)
      .single();

    if (!demande) {
      return NextResponse.json({ success: false, error: "Dossier introuvable" }, { status: 404 });
    }

    // Un agent ne cree un devis que sur ses propres dossiers (scope "own",
    // devis.create ne porte pas de portee — verifie ici explicitement).
    const demandeRow = demande as { id: string; agent_id: string | null; client_record_id: string | null };
    if (role === "agent" && demandeRow.agent_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Ce dossier n'est pas affecté à cet agent" },
        { status: 403 }
      );
    }

    const total = body.lignes.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);

    const { data: created, error: insertError } = await admin
      .from("devis")
      .insert({
        demande_id: body.demande_id,
        client_record_id: demandeRow.client_record_id,
        amount: total,
        valid_until: body.valid_until || null,
        created_by: user.id,
      })
      .select("id, reference")
      .single();

    if (insertError || !created) {
      console.error("[DEVIS] insert error:", insertError?.message);
      return NextResponse.json(
        { success: false, error: insertError?.message || "Échec de création" },
        { status: 500 }
      );
    }

    const devisId = (created as { id: string }).id;

    const lignesToInsert = body.lignes.map((l, idx) => ({
      devis_id: devisId,
      description: l.description,
      quantity: l.quantity,
      unit_price: l.unit_price,
      amount: l.quantity * l.unit_price,
      ordre: idx,
    }));

    const { error: lignesError } = await admin.from("devis_lignes").insert(lignesToInsert);
    if (lignesError) {
      console.error("[DEVIS] lignes insert error:", lignesError.message);
      return NextResponse.json(
        { success: false, error: lignesError.message },
        { status: 500 }
      );
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "devis.cree",
      entityType: "devis",
      entityId: devisId,
      newValue: { demande_id: body.demande_id, amount: total, reference: (created as { reference: string }).reference },
    });

    return NextResponse.json({ success: true, devis: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[DEVIS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
