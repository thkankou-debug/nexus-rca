// ============================================================================
// API ROUTE — PATCH /api/accueil/visites/:id
// File d'accueil (§7.3) : prise en charge → orientation (rattachement d'un
// dossier possible) ou départ. La chronologie de l'arrivée est conservée
// (taken_by/taken_at/closed_at) — rien n'est supprimé.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccueilAdminClient } from "@/lib/accueil-server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["accueil_caisse", "admin", "super_admin"];

interface PatchBody {
  action: "prendre" | "orientee" | "partie";
  demande_id?: string | null;
  client_record_id?: string | null;
  notes?: string;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: "Réservé au poste d'accueil" }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as PatchBody | null;
    if (!body || !["prendre", "orientee", "partie"].includes(body.action)) {
      return NextResponse.json({ success: false, error: "action invalide" }, { status: 400 });
    }

    const admin = getAccueilAdminClient();
    const { data: visit } = await admin
      .from("reception_visits")
      .select("id, status")
      .eq("id", params.id)
      .single();
    if (!visit) {
      return NextResponse.json({ success: false, error: "Arrivée introuvable" }, { status: 404 });
    }
    const row = visit as { id: string; status: string };

    const update: Record<string, unknown> = {};
    if (body.action === "prendre") {
      if (row.status !== "en_attente") {
        return NextResponse.json({ success: false, error: `Arrivée déjà ${row.status}` }, { status: 400 });
      }
      update.status = "en_charge";
      update.taken_by = user.id;
      update.taken_at = new Date().toISOString();
    } else {
      if (row.status === "orientee" || row.status === "partie") {
        return NextResponse.json({ success: false, error: `Arrivée déjà ${row.status}` }, { status: 400 });
      }
      update.status = body.action;
      update.closed_at = new Date().toISOString();
      if (body.demande_id) update.demande_id = body.demande_id;
      if (body.client_record_id) update.client_record_id = body.client_record_id;
      if (body.notes?.trim()) update.notes = body.notes.trim();
    }

    const { error } = await admin.from("reception_visits").update(update).eq("id", row.id);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: `accueil.visite.${body.action === "prendre" ? "prise_en_charge" : body.action}`,
      entityType: "reception_visits",
      entityId: row.id,
      oldValue: { status: row.status },
      newValue: update,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[VISITES] PATCH EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
