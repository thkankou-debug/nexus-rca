// ============================================================================
// API ROUTE — /api/services
// P8, lot Services et tarifs. GET (liste, tout staff), POST (création,
// cms.service.write). Le super_admin gère les services sans toucher au
// code — aucune valeur en dur : catégorie, tarif, statut viennent d'ici.
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

interface CreateServiceBody {
  slug: string;
  nom: string;
  categorie: string;
  description?: string | null;
  tarif_type: "fixe" | "sur_devis";
  tarif_montant?: number | null;
  devise?: string;
  delai_indicatif?: string | null;
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
      .from("services")
      .select("id, slug, nom, categorie, description, tarif_type, tarif_montant, devise, delai_indicatif, status, ordre_affichage, visibilite_publique, created_at")
      .order("categorie", { ascending: true })
      .order("ordre_affichage", { ascending: true });

    if (error) {
      console.error("[SERVICES] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, services: data });
  } catch (err) {
    console.error("[SERVICES] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("cms.service.write");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as CreateServiceBody | null;
    if (!body || !body.slug?.trim() || !body.nom?.trim() || !body.categorie?.trim()) {
      return NextResponse.json({ success: false, error: "slug, nom et categorie sont requis" }, { status: 400 });
    }
    if (!["fixe", "sur_devis"].includes(body.tarif_type)) {
      return NextResponse.json({ success: false, error: "tarif_type invalide" }, { status: 400 });
    }
    if (body.tarif_type === "fixe" && (!body.tarif_montant || body.tarif_montant <= 0)) {
      return NextResponse.json({ success: false, error: "tarif_montant requis (> 0) si tarif_type = fixe" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: created, error: insertError } = await admin
      .from("services")
      .insert({
        slug: body.slug.trim(),
        nom: body.nom.trim(),
        categorie: body.categorie.trim(),
        description: body.description || null,
        tarif_type: body.tarif_type,
        tarif_montant: body.tarif_type === "fixe" ? body.tarif_montant : null,
        devise: body.devise || "XAF",
        delai_indicatif: body.delai_indicatif || null,
      })
      .select("id, slug, nom, categorie, description, tarif_type, tarif_montant, devise, delai_indicatif, status, ordre_affichage, visibilite_publique, created_at")
      .single();

    if (insertError || !created) {
      const message = insertError?.message?.includes("duplicate") ? "Ce slug existe déjà" : insertError?.message || "Échec de création";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "service.cree",
      entityType: "services",
      entityId: (created as { id: string }).id,
      newValue: body,
    });

    return NextResponse.json({ success: true, service: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[SERVICES] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
