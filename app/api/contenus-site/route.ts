// ============================================================================
// API ROUTE — /api/contenus-site
// P8, lot Contenus de page. GET (liste, tout staff), POST (création,
// cms.content.write). Textes et appels à l'action du site public,
// administrables sans toucher au code. Un enregistrement = un bloc de
// texte : `contenu` = { texte }. Plusieurs blocs partageant la même
// `section` composent une page (ex: section "accueil_hero" avec les clés
// "accueil_hero_titre", "accueil_hero_soustitre", "accueil_hero_cta").
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

interface CreateContenuBody {
  section: string;
  cle: string;
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
      .from("contenus_site")
      .select("id, cle, section, contenu, updated_at")
      .order("section", { ascending: true })
      .order("cle", { ascending: true });

    if (error) {
      console.error("[CONTENUS_SITE] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, contenus: data });
  } catch (err) {
    console.error("[CONTENUS_SITE] GET EXCEPTION:", err);
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

    const body = (await request.json().catch(() => null)) as CreateContenuBody | null;
    if (!body || !body.section?.trim() || !body.cle?.trim()) {
      return NextResponse.json({ success: false, error: "section et cle sont requises" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: created, error: insertError } = await admin
      .from("contenus_site")
      .insert({
        cle: body.cle.trim(),
        section: body.section.trim(),
        contenu: { texte: body.texte?.trim() || "" },
        updated_by: user.id,
      })
      .select("id, cle, section, contenu, updated_at")
      .single();

    if (insertError || !created) {
      const message = insertError?.message?.includes("duplicate") ? "Cette clé existe déjà" : insertError?.message || "Échec de création";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "contenu_site.cree",
      entityType: "contenus_site",
      entityId: (created as { id: string }).id,
      newValue: body,
    });

    return NextResponse.json({ success: true, contenu: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[CONTENUS_SITE] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
