// ============================================================================
// API ROUTE — POST /api/demandes/:id/documents-requests
// Le conseiller demande un (ou plusieurs) document(s) au client.
// Insère N lignes dans demande_documents_requests + envoie 1 email récap au client.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { clientDocumentDemandeEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

interface DocRequestInput {
  type_document: string;
  description?: string | null;
}

interface RequestBody {
  documents?: DocRequestInput[];
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(
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
      .select("id, role, nom, prenom")
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

    const body = (await request.json().catch(() => ({}))) as RequestBody;
    const docs = (body.documents || [])
      .map((d) => ({
        type_document: (d.type_document || "").trim().slice(0, 200),
        description: d.description ? d.description.trim().slice(0, 1000) : null,
      }))
      .filter((d) => d.type_document.length > 0);

    if (docs.length === 0) {
      return NextResponse.json(
        { success: false, error: "Au moins un document requis" },
        { status: 400 }
      );
    }
    if (docs.length > 20) {
      return NextResponse.json(
        { success: false, error: "Max 20 documents par demande" },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    const { data: demandeRow } = await admin
      .from("demandes")
      .select("id, reference, email, nom_complet")
      .eq("id", params.id)
      .single();

    const demande = demandeRow as
      | { id: string; reference: string | null; email: string; nom_complet: string }
      | null;

    if (!demande) {
      return NextResponse.json(
        { success: false, error: "Dossier introuvable" },
        { status: 404 }
      );
    }

    const rows = docs.map((d) => ({
      demande_id: params.id,
      requested_by: user.id,
      type_document: d.type_document,
      description: d.description,
      statut: "en_attente" as const,
    }));

    const { error: insErr } = await admin
      .from("demande_documents_requests")
      .insert(rows);

    if (insErr) {
      console.error("[DOC_REQ] insert error:", insErr.message);
      return NextResponse.json(
        { success: false, error: insErr.message },
        { status: 500 }
      );
    }

    // Email au client (best-effort)
    if (demande.email) {
      const conseillerNom =
        [
          (actor as { prenom?: string }).prenom,
          (actor as { nom?: string }).nom,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() || "Votre conseiller";

      const mail = clientDocumentDemandeEmail({
        clientPrenom: null,
        clientNomComplet: demande.nom_complet,
        reference: demande.reference ?? "—",
        conseillerNom,
        documentsDemandes: docs.map((d) => ({
          type: d.type_document,
          description: d.description,
        })),
        demandeId: demande.id,
      });

      await sendEmail({
        to: demande.email,
        subject: mail.subject,
        html: mail.html,
        tag: "[DOC_REQ]",
      });
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch (err) {
    console.error("[DOC_REQ] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
