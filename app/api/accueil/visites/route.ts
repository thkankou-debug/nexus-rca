// ============================================================================
// API ROUTE — POST /api/accueil/visites
// File d'accueil (§7.3, migration 085) : enregistrer une ARRIVÉE physique
// (visiteur + motif, fiche client optionnelle). Réservé au poste d'accueil
// (accueil_caisse) et à la supervision admin/super_admin — le préfixe
// /api/accueil est déjà gardé par rôle dans le middleware, re-vérifié ici.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccueilAdminClient } from "@/lib/accueil-server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["accueil_caisse", "admin", "super_admin"];

interface CreateVisitBody {
  visitor_name: string;
  motif: string;
  client_record_id?: string | null;
}

export async function POST(request: NextRequest) {
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
      .select("role, is_test")
      .eq("id", user.id)
      .single();
    const actorRow = actor as { role?: string; is_test?: boolean } | null;
    if (!actorRow?.role || !ALLOWED_ROLES.includes(actorRow.role)) {
      return NextResponse.json({ success: false, error: "Réservé au poste d'accueil" }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as CreateVisitBody | null;
    if (!body?.visitor_name?.trim() || !body.motif?.trim()) {
      return NextResponse.json(
        { success: false, error: "Nom du visiteur et motif requis" },
        { status: 400 }
      );
    }

    const admin = getAccueilAdminClient();
    if (body.client_record_id) {
      const { data: client } = await admin
        .from("clients")
        .select("id")
        .eq("id", body.client_record_id)
        .maybeSingle();
      if (!client) {
        return NextResponse.json({ success: false, error: "Fiche client introuvable" }, { status: 404 });
      }
    }

    const { data: created, error } = await admin
      .from("reception_visits")
      .insert({
        visitor_name: body.visitor_name.trim(),
        motif: body.motif.trim(),
        client_record_id: body.client_record_id || null,
        created_by: user.id,
        is_test: Boolean(actorRow.is_test),
      })
      .select("id, visitor_name, motif, status, arrived_at, client_record_id")
      .single();
    if (error || !created) {
      console.error("[VISITES] insert error:", error?.message);
      return NextResponse.json({ success: false, error: error?.message || "Échec" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: actorRow.role,
      action: "accueil.arrivee",
      entityType: "reception_visits",
      entityId: (created as { id: string }).id,
      newValue: { visitor_name: body.visitor_name.trim(), motif: body.motif.trim() },
    });

    return NextResponse.json({ success: true, visit: created });
  } catch (err) {
    console.error("[VISITES] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
