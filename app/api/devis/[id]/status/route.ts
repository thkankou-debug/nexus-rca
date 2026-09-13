// ============================================================================
// API ROUTE — POST /api/devis/:id/status
// P6, lot Devis. Transition de statut (brouillon → envoye → accepte/refuse/
// expire). Toutes les transitions passent par devis.send : ce lot ne branche
// pas devis.validate à un statut distinct (devis n'a pas d'état "validé" —
// voir migration 060 et docs/DETTE.md). accepte/refuse enregistrent une
// décision client rapportée par le staff (pas de portail client en V3 sur
// les devis, P9 non fait).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send";
import { devisEnvoyeEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type DevisStatus = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";

const TRANSITIONS: Record<DevisStatus, DevisStatus[]> = {
  brouillon: ["envoye"],
  envoye: ["accepte", "refuse", "expire"],
  accepte: [],
  refuse: [],
  expire: [],
};

interface StatusBody {
  status: DevisStatus;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("devis.send");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase
      .from("profiles")
      .select("role, nom, prenom")
      .eq("id", user.id)
      .single();
    const actorData = actor as { role?: string; nom?: string; prenom?: string } | null;
    const role = actorData?.role || "";

    const body = (await request.json().catch(() => null)) as StatusBody | null;
    const validStatuses: DevisStatus[] = ["brouillon", "envoye", "accepte", "refuse", "expire"];
    if (!body || !validStatuses.includes(body.status)) {
      return NextResponse.json({ success: false, error: "status invalide" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: devis } = await admin
      .from("devis")
      .select(
        "id, status, reference, amount, currency, valid_until, demande_id, demandes(id, reference, nom_complet, email, service, agent_id)"
      )
      .eq("id", params.id)
      .single();

    if (!devis) {
      return NextResponse.json({ success: false, error: "Devis introuvable" }, { status: 404 });
    }

    const devisRow = devis as unknown as {
      id: string;
      status: DevisStatus;
      reference: string;
      amount: number;
      currency: string;
      valid_until: string | null;
      demande_id: string | null;
      demandes: { id: string; reference: string; nom_complet: string; email: string; service: string; agent_id: string | null } | null;
    };

    if (role === "agent" && devisRow.demandes?.agent_id !== user.id) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    const allowed = TRANSITIONS[devisRow.status] || [];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `Transition ${devisRow.status} → ${body.status} non autorisée` },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = { status: body.status };
    if (body.status === "envoye") update.sent_at = new Date().toISOString();
    if (body.status === "accepte") update.accepted_at = new Date().toISOString();

    const { error: updateError } = await admin.from("devis").update(update).eq("id", params.id);
    if (updateError) {
      console.error("[DEVIS] status update error:", updateError.message);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "devis.statut.change",
      entityType: "devis",
      entityId: params.id,
      oldValue: { status: devisRow.status },
      newValue: { status: body.status },
    });

    // Email au client uniquement lors de l'envoi effectif.
    if (body.status === "envoye" && devisRow.demandes?.email) {
      const conseillerNom = [actorData?.prenom, actorData?.nom].filter(Boolean).join(" ").trim() || null;
      const mail = devisEnvoyeEmail({
        clientNom: devisRow.demandes.nom_complet,
        reference: devisRow.reference,
        service: devisRow.demandes.service,
        amount: devisRow.amount,
        currency: devisRow.currency,
        validUntil: devisRow.valid_until,
        conseillerNom,
        demandeId: devisRow.demandes.id,
      });
      await sendEmail({
        to: devisRow.demandes.email,
        subject: mail.subject,
        html: mail.html,
        tag: "[DEVIS_ENVOYE]",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[DEVIS] STATUS EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
