// ============================================================================
// API ROUTE — /api/categories-compta
// P6, lot Catégories comptables. GET (liste, tout staff), POST (création,
// admin uniquement — donnée de référence proche d'un paramétrage, voir
// migration 062).
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

interface CreateCategorieBody {
  code: string;
  label: string;
  type: "revenu" | "depense";
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
      .from("categories_compta")
      .select("id, code, label, type, status, created_at")
      .order("type", { ascending: true })
      .order("code", { ascending: true });

    if (error) {
      console.error("[CATEGORIES_COMPTA] list error:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, categories: data });
  } catch (err) {
    console.error("[CATEGORIES_COMPTA] GET EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = (await request.json().catch(() => null)) as CreateCategorieBody | null;
    if (!body || !body.code?.trim() || !body.label?.trim() || !["revenu", "depense"].includes(body.type)) {
      return NextResponse.json(
        { success: false, error: "code, label et type ('revenu' ou 'depense') sont requis" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const { data: created, error: insertError } = await admin
      .from("categories_compta")
      .insert({ code: body.code.trim(), label: body.label.trim(), type: body.type })
      .select("id, code, label, type, status, created_at")
      .single();

    if (insertError || !created) {
      const message = insertError?.message?.includes("duplicate")
        ? "Ce code existe déjà"
        : insertError?.message || "Échec de création";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "categorie_compta.creee",
      entityType: "categories_compta",
      entityId: (created as { id: string }).id,
      newValue: body,
    });

    return NextResponse.json({ success: true, categorie: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[CATEGORIES_COMPTA] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
