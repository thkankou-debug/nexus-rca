// ============================================================================
// API ROUTE — PUT /api/agents/:id/specialites
// Réservé super_admin. Met à jour le tableau specialites d'un profil agent.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORIES_DOSSIER,
  isCategorieDossier,
} from "@/lib/demande-categories";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function PUT(
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
      .select("role")
      .eq("id", user.id)
      .single();

    if ((actor as { role?: string } | null)?.role !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Réservé super_admin" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      specialites?: unknown;
    };
    if (!Array.isArray(body.specialites)) {
      return NextResponse.json(
        { success: false, error: "specialites doit être un tableau" },
        { status: 400 }
      );
    }

    // Filtre + déduplication + validation contre l'enum CATEGORIES_DOSSIER
    const cleaned = Array.from(
      new Set(
        (body.specialites as unknown[])
          .map((v) => (typeof v === "string" ? v.trim() : ""))
          .filter((v): v is string => v.length > 0 && isCategorieDossier(v))
      )
    );

    if (cleaned.length > CATEGORIES_DOSSIER.length) {
      return NextResponse.json(
        { success: false, error: "Trop de spécialités" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    const { data: target } = await admin
      .from("profiles")
      .select("id, role")
      .eq("id", params.id)
      .single();

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Agent introuvable" },
        { status: 404 }
      );
    }
    if ((target as { role?: string }).role !== "agent") {
      return NextResponse.json(
        { success: false, error: "Le profil cible n'est pas un agent" },
        { status: 400 }
      );
    }

    const { error: updErr } = await admin
      .from("profiles")
      .update({ specialites: cleaned })
      .eq("id", params.id);

    if (updErr) {
      console.error("[SPECIALITES] update error:", updErr.message);
      return NextResponse.json(
        { success: false, error: updErr.message },
        { status: 500 }
      );
    }

    console.log(`[SPECIALITES] OK ${params.id} → [${cleaned.join(",")}]`);
    return NextResponse.json({ success: true, specialites: cleaned });
  } catch (err) {
    console.error("[SPECIALITES] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
