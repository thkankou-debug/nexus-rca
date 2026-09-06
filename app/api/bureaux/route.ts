// ============================================================================
// API ROUTE — /api/bureaux
// P8, lot Bureaux. GET (liste, tout staff), POST (création).
// 'bureaux' n'a pas de permission dédiée dans l'énumération §P2 — géré par
// cms.content.write, comme les témoignages et pays_destinations.
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

interface CreateBureauBody {
  nom: string;
  adresse: string;
  ville: string;
  pays: string;
  telephone?: string | null;
  email?: string | null;
  horaires?: string | null;
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
      .from("bureaux")
      .select("id, nom, adresse, ville, pays, telephone, email, horaires, status, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[BUREAUX] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, bureaux: data });
  } catch (err) {
    console.error("[BUREAUX] GET EXCEPTION:", err);
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

    const body = (await request.json().catch(() => null)) as CreateBureauBody | null;
    if (!body || !body.nom?.trim() || !body.adresse?.trim() || !body.ville?.trim() || !body.pays?.trim()) {
      return NextResponse.json({ success: false, error: "nom, adresse, ville et pays sont requis" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: created, error: insertError } = await admin
      .from("bureaux")
      .insert({
        nom: body.nom.trim(),
        adresse: body.adresse.trim(),
        ville: body.ville.trim(),
        pays: body.pays.trim(),
        telephone: body.telephone?.trim() || null,
        email: body.email?.trim() || null,
        horaires: body.horaires?.trim() || null,
      })
      .select("id, nom, adresse, ville, pays, telephone, email, horaires, status, created_at")
      .single();

    if (insertError || !created) {
      return NextResponse.json({ success: false, error: insertError?.message || "Échec de création" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "bureau.cree",
      entityType: "bureaux",
      entityId: (created as { id: string }).id,
      newValue: body,
    });

    return NextResponse.json({ success: true, bureau: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[BUREAUX] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
