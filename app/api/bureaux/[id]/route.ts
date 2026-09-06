// ============================================================================
// API ROUTE — PATCH/DELETE /api/bureaux/:id
// P8, lot Bureaux.
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
  adresse?: string;
  ville?: string;
  pays?: string;
  telephone?: string | null;
  email?: string | null;
  horaires?: string | null;
  status?: "actif" | "inactif";
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
    if (body.status && !["actif", "inactif"].includes(body.status)) {
      return NextResponse.json({ success: false, error: "status invalide" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (body.nom !== undefined) update.nom = body.nom.trim();
    if (body.adresse !== undefined) update.adresse = body.adresse.trim();
    if (body.ville !== undefined) update.ville = body.ville.trim();
    if (body.pays !== undefined) update.pays = body.pays.trim();
    if (body.telephone !== undefined) update.telephone = body.telephone;
    if (body.email !== undefined) update.email = body.email;
    if (body.horaires !== undefined) update.horaires = body.horaires;
    if (body.status !== undefined) update.status = body.status;

    const admin = getAdminClient();
    const { error: updateError } = await admin.from("bureaux").update(update).eq("id", params.id);
    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "bureau.modifie",
      entityType: "bureaux",
      entityId: params.id,
      newValue: update,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[BUREAUX] PATCH EXCEPTION:", err);
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
    const { error: deleteError } = await admin.from("bureaux").delete().eq("id", params.id);
    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "bureau.supprime",
      entityType: "bureaux",
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[BUREAUX] DELETE EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
