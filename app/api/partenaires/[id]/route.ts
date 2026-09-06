// ============================================================================
// API ROUTE — PATCH/DELETE /api/partenaires/:id
// P8, lot Partenaires. Édition (remet is_verified à false par trigger DB,
// migration 063), vérification, publication (impossible sans vérification
// préalable — règle P8 "aucun faux partenaire"), suppression.
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
  nom?: string;
  logo_url?: string | null;
  site_url?: string | null;
  description?: string | null;
  ordre_affichage?: number;
  is_verified?: boolean;
  is_published?: boolean;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("cms.partenaire.write");

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
      const { data: current } = await admin.from("partenaires").select("is_verified").eq("id", params.id).single();
      const isVerified = body.is_verified === true || (current as { is_verified: boolean } | null)?.is_verified;
      if (!isVerified) {
        return NextResponse.json(
          { success: false, error: "Impossible de publier un partenaire non vérifié" },
          { status: 400 }
        );
      }
    }

    const update: Record<string, unknown> = {};
    if (body.nom !== undefined) update.nom = body.nom.trim();
    if (body.logo_url !== undefined) update.logo_url = body.logo_url;
    if (body.site_url !== undefined) update.site_url = body.site_url;
    if (body.description !== undefined) update.description = body.description;
    if (body.ordre_affichage !== undefined) update.ordre_affichage = body.ordre_affichage;
    if (body.is_verified !== undefined) update.is_verified = body.is_verified;
    if (body.is_published !== undefined) update.is_published = body.is_published;

    const { error: updateError } = await admin.from("partenaires").update(update).eq("id", params.id);
    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "partenaire.modifie",
      entityType: "partenaires",
      entityId: params.id,
      newValue: update,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[PARTENAIRES] PATCH EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("cms.partenaire.write");

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
    const { error: deleteError } = await admin.from("partenaires").delete().eq("id", params.id);
    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "partenaire.supprime",
      entityType: "partenaires",
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[PARTENAIRES] DELETE EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
