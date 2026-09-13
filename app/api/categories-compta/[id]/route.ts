// ============================================================================
// API ROUTE — PATCH /api/categories-compta/:id
// P6, lot Catégories comptables. Bascule actif/inactif ou édition du libellé
// — jamais de suppression (catégorie potentiellement déjà référencée).
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
  label?: string;
  status?: "actif" | "inactif";
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("categorie_compta.write");

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
    if (!body || (body.label === undefined && body.status === undefined)) {
      return NextResponse.json({ success: false, error: "Rien à modifier" }, { status: 400 });
    }
    if (body.status && !["actif", "inactif"].includes(body.status)) {
      return NextResponse.json({ success: false, error: "status invalide" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (body.label !== undefined) update.label = body.label.trim();
    if (body.status !== undefined) update.status = body.status;

    const admin = getAdminClient();
    const { error: updateError } = await admin.from("categories_compta").update(update).eq("id", params.id);
    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "categorie_compta.modifiee",
      entityType: "categories_compta",
      entityId: params.id,
      newValue: update,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[CATEGORIES_COMPTA] PATCH EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
