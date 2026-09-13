// ============================================================================
// API ROUTE — /api/pays-destinations
// P8, lot Pays & destinations. GET (liste, tout staff), POST (création).
// 'pays_destinations' n'a pas de permission dédiée dans l'énumération §P2 —
// géré par cms.content.write, comme les témoignages (voir docs/DETTE.md).
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

interface CreatePaysBody {
  nom: string;
  code_iso?: string | null;
  continent?: string | null;
  ordre_affichage?: number;
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
      .from("pays_destinations")
      .select("id, nom, code_iso, continent, status, ordre_affichage, created_at")
      .order("continent", { ascending: true, nullsFirst: false })
      .order("ordre_affichage", { ascending: true });

    if (error) {
      console.error("[PAYS_DESTINATIONS] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, pays: data });
  } catch (err) {
    console.error("[PAYS_DESTINATIONS] GET EXCEPTION:", err);
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

    const body = (await request.json().catch(() => null)) as CreatePaysBody | null;
    if (!body || !body.nom?.trim()) {
      return NextResponse.json({ success: false, error: "nom est requis" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: created, error: insertError } = await admin
      .from("pays_destinations")
      .insert({
        nom: body.nom.trim(),
        code_iso: body.code_iso?.trim().toUpperCase() || null,
        continent: body.continent?.trim() || null,
        ordre_affichage: body.ordre_affichage ?? 0,
      })
      .select("id, nom, code_iso, continent, status, ordre_affichage, created_at")
      .single();

    if (insertError || !created) {
      return NextResponse.json({ success: false, error: insertError?.message || "Échec de création" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "pays_destination.cree",
      entityType: "pays_destinations",
      entityId: (created as { id: string }).id,
      newValue: body,
    });

    return NextResponse.json({ success: true, pays: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[PAYS_DESTINATIONS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
