// ============================================================================
// API ROUTE — POST /api/demandes/:id/notes
// Notes internes admin/super_admin (table demande_notes append-only).
// JAMAIS visible par l'agent ni le client (RLS).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { data: actor } = await supabase
      .from("profiles")
      .select("id, role, nom, prenom")
      .eq("id", user.id)
      .single();

    const role = (actor as { role?: string } | null)?.role || "";
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Réservé admin/super_admin" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as { content?: string };
    const content = (body.content || "").trim();
    if (!content) {
      return NextResponse.json(
        { success: false, error: "Contenu vide" },
        { status: 400 }
      );
    }
    if (content.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Contenu trop long (max 2000)" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    const { data: demandeRow } = await admin
      .from("demandes")
      .select("id")
      .eq("id", params.id)
      .single();

    if (!demandeRow) {
      return NextResponse.json(
        { success: false, error: "Dossier introuvable" },
        { status: 404 }
      );
    }

    const authorName =
      [
        (actor as { prenom?: string }).prenom,
        (actor as { nom?: string }).nom,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || "Staff Nexus";

    const { data: note, error: insErr } = await admin
      .from("demande_notes")
      .insert({
        demande_id: params.id,
        author_id: user.id,
        author_name: authorName,
        author_role: role,
        content,
      })
      .select("id, created_at")
      .single();

    if (insErr || !note) {
      console.error("[NOTES] insert error:", insErr?.message);
      return NextResponse.json(
        { success: false, error: insErr?.message || "Insert échoué" },
        { status: 500 }
      );
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "note_created",
      entityType: "demande_notes",
      entityId: (note as { id: string }).id,
      newValue: { demande_id: params.id, author_name: authorName, content },
    });

    return NextResponse.json({
      success: true,
      note_id: (note as { id: string }).id,
      created_at: (note as { created_at: string }).created_at,
    });
  } catch (err) {
    console.error("[NOTES] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
