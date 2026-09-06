// ============================================================================
// API ROUTE — PATCH/DELETE /api/temoignages/:id
// P8, lot Témoignages. Édition de contenu (remet is_verified à false par
// trigger DB, migration 063), vérification, publication (impossible sans
// vérification préalable — règle P8), suppression.
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

interface PatchBody {
  auteur_nom?: string;
  auteur_role?: string | null;
  contenu?: string;
  note?: number | null;
  source?: string | null;
  is_verified?: boolean;
  is_published?: boolean;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("cms.content.write");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as PatchBody | null;
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ success: false, error: "Rien à modifier" }, { status: 400 });
    }

    const admin = getAdminClient();

    if (body.is_published === true) {
      const { data: current } = await admin.from("temoignages").select("is_verified").eq("id", params.id).single();
      const isVerified = body.is_verified === true || (current as { is_verified: boolean } | null)?.is_verified;
      if (!isVerified) {
        return NextResponse.json(
          { success: false, error: "Impossible de publier un témoignage non vérifié" },
          { status: 400 }
        );
      }
    }

    const update: Record<string, unknown> = {};
    if (body.auteur_nom !== undefined) update.auteur_nom = body.auteur_nom.trim();
    if (body.auteur_role !== undefined) update.auteur_role = body.auteur_role;
    if (body.contenu !== undefined) update.contenu = body.contenu.trim();
    if (body.note !== undefined) update.note = body.note;
    if (body.source !== undefined) update.source = body.source;
    if (body.is_verified !== undefined) update.is_verified = body.is_verified;
    if (body.is_published !== undefined) update.is_published = body.is_published;

    const { error: updateError } = await admin.from("temoignages").update(update).eq("id", params.id);
    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "temoignage.modifie",
      entityType: "temoignages",
      entityId: params.id,
      newValue: update,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[TEMOIGNAGES] PATCH EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("cms.content.write");

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
    const { error: deleteError } = await admin.from("temoignages").delete().eq("id", params.id);
    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "temoignage.supprime",
      entityType: "temoignages",
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[TEMOIGNAGES] DELETE EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
