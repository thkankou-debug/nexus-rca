// ============================================================================
// API ROUTE — /api/agency-settings
// P8, lot Informations institutionnelles. GET (liste, super_admin/admin en
// lecture — RLS "Staff can read agency_settings"), POST (création,
// 'settings.write' — seul super_admin l'a réellement, RLS ne permet
// d'ailleurs l'écriture qu'à ce rôle, voir migration 046).
// Chaque ligne = un champ institutionnel : `valeur` = { label, texte }.
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

interface CreateSettingBody {
  cle: string;
  label: string;
  texte: string;
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
      .from("agency_settings")
      .select("id, cle, valeur, is_verified, is_published, updated_at")
      .order("cle", { ascending: true });

    if (error) {
      console.error("[AGENCY_SETTINGS] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (err) {
    console.error("[AGENCY_SETTINGS] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("settings.write");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as CreateSettingBody | null;
    if (!body || !body.cle?.trim() || !body.label?.trim()) {
      return NextResponse.json({ success: false, error: "cle et label sont requis" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: created, error: insertError } = await admin
      .from("agency_settings")
      .insert({
        cle: body.cle.trim(),
        valeur: { label: body.label.trim(), texte: body.texte?.trim() || "" },
        updated_by: user.id,
      })
      .select("id, cle, valeur, is_verified, is_published, updated_at")
      .single();

    if (insertError || !created) {
      const message = insertError?.message?.includes("duplicate") ? "Cette clé existe déjà" : insertError?.message || "Échec de création";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "agency_setting.cree",
      entityType: "agency_settings",
      entityId: (created as { id: string }).id,
      newValue: body,
    });

    return NextResponse.json({ success: true, setting: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[AGENCY_SETTINGS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
