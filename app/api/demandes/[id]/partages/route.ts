// ============================================================================
// API ROUTE — /api/demandes/:id/partages (cahier §12, lot G5 — 13/09/2026)
// Partage d'un dossier avec un compte PARTENAIRE (profiles.role=partenaire)
// et révocation. Garde : admin / super_admin (AR-06 restant ouvert, le
// partage reste un acte de direction). La révocation supprime la ligne
// dossier_partages : la page, l'API et le dépôt partenaire se ferment
// immédiatement (mécanique 086 existante). Audité + partenaire notifié.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const MANAGER_ROLES = ["admin", "super_admin"];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getManager() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
  const p = profile as { id: string; role: string } | null;
  if (!p || !MANAGER_ROLES.includes(p.role)) return null;
  return p;
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const manager = await getManager();
    if (!manager) return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    const admin = getAdminClient();
    const [{ data: shares }, { data: partenaires }] = await Promise.all([
      admin
        .from("dossier_partages")
        .select("id, partenaire_id, shared_by, created_at, profiles!dossier_partages_partenaire_id_fkey(nom, prenom, email)")
        .eq("demande_id", params.id),
      admin
        .from("profiles")
        .select("id, nom, prenom, email")
        .eq("role", "partenaire")
        .eq("actif", true)
        .order("nom", { ascending: true }),
    ]);
    return NextResponse.json({ success: true, partages: shares || [], partenaires: partenaires || [] });
  } catch (err) {
    console.error("[PARTAGES] GET EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const manager = await getManager();
    if (!manager) return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });

    const body = (await request.json().catch(() => null)) as { partenaire_id?: string } | null;
    if (!body?.partenaire_id) {
      return NextResponse.json({ success: false, error: "partenaire_id requis" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: cible } = await admin
      .from("profiles")
      .select("id, role, actif")
      .eq("id", body.partenaire_id)
      .single();
    const c = cible as { id: string; role: string; actif: boolean | null } | null;
    if (!c || c.role !== "partenaire" || c.actif === false) {
      return NextResponse.json(
        { success: false, error: "Le destinataire doit être un compte partenaire actif" },
        { status: 400 }
      );
    }
    const { data: demande } = await admin
      .from("demandes")
      .select("id, reference, nom_complet")
      .eq("id", params.id)
      .single();
    if (!demande) return NextResponse.json({ success: false, error: "Dossier introuvable" }, { status: 404 });
    const d = demande as { id: string; reference: string | null; nom_complet: string };

    const { error } = await admin.from("dossier_partages").insert({
      demande_id: d.id,
      partenaire_id: c.id,
      shared_by: manager.id,
    });
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ success: false, error: "Dossier déjà partagé avec ce partenaire" }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await logAudit({
      userId: manager.id,
      userRole: manager.role,
      action: "dossier.partage",
      entityType: "demandes",
      entityId: d.id,
      newValue: { partenaire_id: c.id, reference: d.reference },
    });
    await createNotification(
      c.id,
      "info",
      `Dossier partagé avec vous — ${d.reference || d.nom_complet}`,
      "Consultez-le dans votre espace partenaire et déposez vos retours.",
      "/dashboard/partenaire"
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PARTAGES] POST EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const manager = await getManager();
    if (!manager) return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });

    const body = (await request.json().catch(() => null)) as { partenaire_id?: string } | null;
    if (!body?.partenaire_id) {
      return NextResponse.json({ success: false, error: "partenaire_id requis" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: deleted, error } = await admin
      .from("dossier_partages")
      .delete()
      .eq("demande_id", params.id)
      .eq("partenaire_id", body.partenaire_id)
      .select("id");
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ success: false, error: "Partage introuvable" }, { status: 404 });
    }

    await logAudit({
      userId: manager.id,
      userRole: manager.role,
      action: "dossier.partage_revoque",
      entityType: "demandes",
      entityId: params.id,
      newValue: { partenaire_id: body.partenaire_id },
    });
    await createNotification(
      body.partenaire_id,
      "info",
      "Un partage de dossier vous a été retiré",
      "L'accès à ce dossier est révoqué — page, API et dépôts fermés.",
      "/dashboard/partenaire"
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PARTAGES] DELETE EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
