// ============================================================================
// API ROUTE — PATCH /api/demandes/:id/documents-requests/:requestId
// Le conseiller referme une demande de document/correction sans nouveau
// document (résolue autrement : téléphone, WhatsApp, vérification directe).
// P9 Lot 4 — réutilise demande_documents_requests, aucun nouveau mécanisme.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const ALLOWED_STATUTS = ["fourni", "annule"] as const;
type AllowedStatut = (typeof ALLOWED_STATUTS)[number];

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; requestId: string } }
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

    const actorRole = (actor as { role?: string } | null)?.role || "";
    const isStaff =
      actorRole === "agent" || actorRole === "admin" || actorRole === "super_admin";
    if (!isStaff) {
      return NextResponse.json(
        { success: false, error: "Réservé staff" },
        { status: 403 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      statut?: string;
    };
    const statut = body.statut as AllowedStatut;
    if (!ALLOWED_STATUTS.includes(statut)) {
      return NextResponse.json(
        { success: false, error: "Statut invalide" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    const { data: reqRow } = await admin
      .from("demande_documents_requests")
      .select("id, demande_id, statut")
      .eq("id", params.requestId)
      .single();

    if (!reqRow || (reqRow as { demande_id: string }).demande_id !== params.id) {
      return NextResponse.json(
        { success: false, error: "Demande introuvable" },
        { status: 404 }
      );
    }

    if ((reqRow as { statut: string }).statut !== "en_attente") {
      return NextResponse.json(
        { success: false, error: "Cette demande est déjà refermée" },
        { status: 409 }
      );
    }

    const { error: updErr } = await admin
      .from("demande_documents_requests")
      .update({
        statut,
        fulfilled_at: statut === "fourni" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.requestId);

    if (updErr) {
      console.error("[DOC_REQ] update error:", updErr.message);
      return NextResponse.json(
        { success: false, error: updErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DOC_REQ] PATCH EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
