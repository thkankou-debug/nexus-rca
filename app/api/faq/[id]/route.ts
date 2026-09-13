// ============================================================================
// API ROUTE — PATCH /api/faq/:id, DELETE /api/faq/:id
// P8, lot FAQ. Édition + suppression (aucune table ne référence faq.id,
// contrairement aux catégories comptables — suppression admise ici).
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
  question?: string;
  reponse?: string;
  categorie?: string | null;
  ordre_affichage?: number;
  status?: "actif" | "inactif";
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("cms.faq.write");

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
    if (body.question !== undefined) update.question = body.question.trim();
    if (body.reponse !== undefined) update.reponse = body.reponse.trim();
    if (body.categorie !== undefined) update.categorie = body.categorie;
    if (body.ordre_affichage !== undefined) update.ordre_affichage = body.ordre_affichage;
    if (body.status !== undefined) update.status = body.status;

    const admin = getAdminClient();
    const { error: updateError } = await admin.from("faq").update(update).eq("id", params.id);
    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "faq.modifiee",
      entityType: "faq",
      entityId: params.id,
      newValue: update,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[FAQ] PATCH EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("cms.faq.write");

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
    const { error: deleteError } = await admin.from("faq").delete().eq("id", params.id);
    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "faq.supprimee",
      entityType: "faq",
      entityId: params.id,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[FAQ] DELETE EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
