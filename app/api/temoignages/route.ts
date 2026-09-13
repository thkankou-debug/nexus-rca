// ============================================================================
// API ROUTE — /api/temoignages
// P8, lot Témoignages. GET (liste, tout staff), POST (création, brouillon
// non vérifié/non publié par défaut — cms.content.write, 'temoignage.*'
// n'existe pas dans l'énumération §P2, traité comme du contenu générique).
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

interface CreateTemoignageBody {
  auteur_nom: string;
  auteur_role?: string | null;
  contenu: string;
  note?: number | null;
  source?: string | null;
}

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("temoignages")
      .select("id, auteur_nom, auteur_role, contenu, note, source, is_verified, is_published, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[TEMOIGNAGES] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, temoignages: data });
  } catch (err) {
    console.error("[TEMOIGNAGES] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = (await request.json().catch(() => null)) as CreateTemoignageBody | null;
    if (!body || !body.auteur_nom?.trim() || !body.contenu?.trim()) {
      return NextResponse.json({ success: false, error: "auteur_nom et contenu sont requis" }, { status: 400 });
    }
    if (body.note !== undefined && body.note !== null && (body.note < 1 || body.note > 5)) {
      return NextResponse.json({ success: false, error: "note doit être entre 1 et 5" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: created, error: insertError } = await admin
      .from("temoignages")
      .insert({
        auteur_nom: body.auteur_nom.trim(),
        auteur_role: body.auteur_role?.trim() || null,
        contenu: body.contenu.trim(),
        note: body.note ?? null,
        source: body.source?.trim() || null,
      })
      .select("id, auteur_nom, auteur_role, contenu, note, source, is_verified, is_published, created_at")
      .single();

    if (insertError || !created) {
      return NextResponse.json({ success: false, error: insertError?.message || "Échec de création" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "temoignage.cree",
      entityType: "temoignages",
      entityId: (created as { id: string }).id,
      newValue: body,
    });

    return NextResponse.json({ success: true, temoignage: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[TEMOIGNAGES] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
