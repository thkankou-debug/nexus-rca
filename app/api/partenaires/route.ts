// ============================================================================
// API ROUTE — /api/partenaires
// P8, lot Partenaires. GET (liste, tout staff), POST (création, brouillon
// non vérifié/non publié par défaut — cms.partenaire.write).
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

interface CreatePartenaireBody {
  nom: string;
  logo_url?: string | null;
  site_url?: string | null;
  description?: string | null;
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
      .from("partenaires")
      .select("id, nom, logo_url, site_url, description, is_verified, is_published, ordre_affichage, created_at")
      .order("ordre_affichage", { ascending: true });

    if (error) {
      console.error("[PARTENAIRES] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, partenaires: data });
  } catch (err) {
    console.error("[PARTENAIRES] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = (await request.json().catch(() => null)) as CreatePartenaireBody | null;
    if (!body || !body.nom?.trim()) {
      return NextResponse.json({ success: false, error: "nom est requis" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: created, error: insertError } = await admin
      .from("partenaires")
      .insert({
        nom: body.nom.trim(),
        logo_url: body.logo_url?.trim() || null,
        site_url: body.site_url?.trim() || null,
        description: body.description?.trim() || null,
      })
      .select("id, nom, logo_url, site_url, description, is_verified, is_published, ordre_affichage, created_at")
      .single();

    if (insertError || !created) {
      return NextResponse.json({ success: false, error: insertError?.message || "Échec de création" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "partenaire.cree",
      entityType: "partenaires",
      entityId: (created as { id: string }).id,
      newValue: body,
    });

    return NextResponse.json({ success: true, partenaire: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[PARTENAIRES] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
