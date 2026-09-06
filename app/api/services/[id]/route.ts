// ============================================================================
// API ROUTE — PATCH /api/services/:id
// P8, lot Services et tarifs. Édition (description, tarif, délai, statut,
// ordre) — jamais de suppression (service potentiellement référencé par
// des dossiers réels, cf. demandes.service_id ajouté en P3).
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

interface PatchBody {
  nom?: string;
  categorie?: string;
  description?: string | null;
  tarif_type?: "fixe" | "sur_devis";
  tarif_montant?: number | null;
  delai_indicatif?: string | null;
  status?: "actif" | "inactif";
  ordre_affichage?: number;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const body = (await request.json().catch(() => null)) as PatchBody | null;
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ success: false, error: "Rien à modifier" }, { status: 400 });
    }
    if (body.status && !["actif", "inactif"].includes(body.status)) {
      return NextResponse.json({ success: false, error: "status invalide" }, { status: 400 });
    }
    if (body.tarif_type && !["fixe", "sur_devis"].includes(body.tarif_type)) {
      return NextResponse.json({ success: false, error: "tarif_type invalide" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (body.nom !== undefined) update.nom = body.nom.trim();
    if (body.categorie !== undefined) update.categorie = body.categorie.trim();
    if (body.description !== undefined) update.description = body.description;
    if (body.tarif_type !== undefined) {
      update.tarif_type = body.tarif_type;
      if (body.tarif_type === "sur_devis") update.tarif_montant = null;
    }
    if (body.tarif_montant !== undefined) update.tarif_montant = body.tarif_montant;
    if (body.delai_indicatif !== undefined) update.delai_indicatif = body.delai_indicatif;
    if (body.status !== undefined) update.status = body.status;
    if (body.ordre_affichage !== undefined) update.ordre_affichage = body.ordre_affichage;

    const admin = getAdminClient();
    const { error: updateError } = await admin.from("services").update(update).eq("id", params.id);
    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "service.modifie",
      entityType: "services",
      entityId: params.id,
      newValue: update,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[SERVICES] PATCH EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
