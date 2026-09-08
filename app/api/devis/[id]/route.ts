// ============================================================================
// API ROUTE — /api/devis/:id
// P6, lot Devis. GET (détail + lignes + dossier + client), PATCH (édition
// des lignes, uniquement tant que status = 'brouillon').
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

async function getActorAndDevis(admin: ReturnType<typeof getAdminClient>, userId: string, devisId: string) {
  const { data: devis } = await admin
    .from("devis")
    .select(
      "id, reference, status, amount, currency, valid_until, sent_at, accepted_at, created_by, demande_id, client_record_id, created_at, clients(profile_id), demandes(id, reference, nom_complet, service, agent_id), devis_lignes(id, description, quantity, unit_price, amount, ordre)"
    )
    .eq("id", devisId)
    .single();
  return devis;
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

    const { data: actor } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = (actor as { role?: string } | null)?.role || "";

    const admin = getAdminClient();
    const devis = await getActorAndDevis(admin, user.id, params.id);
    if (!devis) {
      return NextResponse.json({ success: false, error: "Devis introuvable" }, { status: 404 });
    }

    const devisTyped = devis as unknown as {
      demandes: { agent_id: string | null } | null;
      clients: { profile_id: string | null } | null;
    };
    const dossier = devisTyped.demandes;
    const isStaff = role === "admin" || role === "super_admin";
    if (role === "agent" && dossier?.agent_id !== user.id) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }
    // Client : IDOR — même contrôle que /api/devis/[id]/pdf (voir docs/DETTE.md).
    if (!isStaff && role !== "agent" && devisTyped.clients?.profile_id !== user.id) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    return NextResponse.json({ success: true, devis });
  } catch (err) {
    console.error("[DEVIS] GET/:id EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

interface LigneInput {
  description: string;
  quantity: number;
  unit_price: number;
}

interface PatchBody {
  valid_until?: string | null;
  lignes?: LigneInput[];
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
      .select("role")
      .eq("id", user.id)
      .single();
    const role = (actor as { role?: string } | null)?.role || "";

    const admin = getAdminClient();
    const { data: existing } = await admin
      .from("devis")
      .select("id, status, demandes(agent_id)")
      .eq("id", params.id)
      .single();

    if (!existing) {
      return NextResponse.json({ success: false, error: "Devis introuvable" }, { status: 404 });
    }
    const existingRow = existing as unknown as { id: string; status: string; demandes: { agent_id: string | null } | null };
    if (role === "agent" && existingRow.demandes?.agent_id !== user.id) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }
    if (existingRow.status !== "brouillon") {
      return NextResponse.json(
        { success: false, error: "Un devis envoyé ne peut plus être modifié" },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => null)) as PatchBody | null;
    if (!body) {
      return NextResponse.json({ success: false, error: "Corps invalide" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (body.valid_until !== undefined) update.valid_until = body.valid_until;

    if (body.lignes) {
      if (body.lignes.length === 0) {
        return NextResponse.json({ success: false, error: "Au moins une ligne requise" }, { status: 400 });
      }
      for (const ligne of body.lignes) {
        if (!ligne.description || !Number.isFinite(ligne.quantity) || !Number.isFinite(ligne.unit_price)) {
          return NextResponse.json(
            { success: false, error: "Chaque ligne requiert description, quantity, unit_price" },
            { status: 400 }
          );
        }
      }
      const total = body.lignes.reduce((sum, l) => sum + l.quantity * l.unit_price, 0);
      update.amount = total;

      await admin.from("devis_lignes").delete().eq("devis_id", params.id);
      const lignesToInsert = body.lignes.map((l, idx) => ({
        devis_id: params.id,
        description: l.description,
        quantity: l.quantity,
        unit_price: l.unit_price,
        amount: l.quantity * l.unit_price,
        ordre: idx,
      }));
      const { error: lignesError } = await admin.from("devis_lignes").insert(lignesToInsert);
      if (lignesError) {
        return NextResponse.json({ success: false, error: lignesError.message }, { status: 500 });
      }
    }

    if (Object.keys(update).length > 0) {
      const { error: updateError } = await admin.from("devis").update(update).eq("id", params.id);
      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "devis.modifie",
      entityType: "devis",
      entityId: params.id,
      newValue: update,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[DEVIS] PATCH EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
