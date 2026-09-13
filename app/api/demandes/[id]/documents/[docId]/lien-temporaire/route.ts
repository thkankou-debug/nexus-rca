// ============================================================================
// API ROUTE — POST /api/demandes/:id/documents/:docId/lien-temporaire
// Cahier §11 (lot G4, 13/09/2026) : lien TEMPORAIRE vers une pièce du
// dossier — URL signée Supabase Storage valable 1 heure, générée par le
// staff habilité (agent affecté, chef, admin, super admin) et AUDITÉE
// (qui a partagé quoi, quand). Aucune pièce n'est jamais publique.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const STORAGE_BUCKET = "demande-documents";
const LINK_TTL_SECONDS = 60 * 60; // 1 heure — durée courte, régénérable
const ALLOWED_ROLES = ["agent", "chef_service", "admin", "super_admin"];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";
    if (!ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    const admin = getAdminClient();
    const { data: doc } = await admin
      .from("demande_documents")
      .select("id, demande_id, storage_path, file_name")
      .eq("id", params.docId)
      .eq("demande_id", params.id)
      .single();
    if (!doc) return NextResponse.json({ success: false, error: "Document introuvable" }, { status: 404 });
    const d = doc as { id: string; demande_id: string; storage_path: string; file_name: string };

    // L'agent : uniquement sur SES dossiers (même portée que le contrôle).
    if (role === "agent") {
      const { data: demande } = await admin
        .from("demandes")
        .select("agent_id")
        .eq("id", params.id)
        .single();
      if ((demande as { agent_id?: string | null } | null)?.agent_id !== user.id) {
        return NextResponse.json(
          { success: false, error: "Ce dossier n'est pas affecté à cet agent" },
          { status: 403 }
        );
      }
    }

    const { data: signed, error } = await admin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(d.storage_path, LINK_TTL_SECONDS);
    if (error || !signed?.signedUrl) {
      return NextResponse.json(
        { success: false, error: error?.message || "Échec de la génération du lien" },
        { status: 500 }
      );
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "document.lien_temporaire",
      entityType: "demande_documents",
      entityId: d.id,
      newValue: { file_name: d.file_name, expire_dans_secondes: LINK_TTL_SECONDS },
    });

    return NextResponse.json({
      success: true,
      url: signed.signedUrl,
      expires_in_seconds: LINK_TTL_SECONDS,
    });
  } catch (err) {
    console.error("[DOC_LIEN] EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
