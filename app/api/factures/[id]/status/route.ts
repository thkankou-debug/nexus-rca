// ============================================================================
// API ROUTE — POST /api/factures/:id/status
// P6, lot Factures. Transition de statut (brouillon → validee → payee,
// annulee accessible depuis brouillon/validee, jamais depuis payee).
// Permission différenciée par transition (séparation des tâches, §P2) :
// - → validee ou → payee : facture.validate (contrôle financier)
// - → annulee : facture.cancel
// 'payee' reste une transition manuelle dans ce lot : aucun rapprochement
// automatique avec `payments` (échéanciers/rapprochement = lot suivant de
// P6) — voir docs/DETTE.md.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { hasPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email/send";
import { factureValideeEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type FactureStatus = "brouillon" | "validee" | "payee" | "annulee";

const TRANSITIONS: Record<FactureStatus, FactureStatus[]> = {
  brouillon: ["validee", "annulee"],
  validee: ["payee", "annulee"],
  payee: [],
  annulee: [],
};

const PERMISSION_FOR_TARGET: Record<string, string> = {
  validee: "facture.validate",
  payee: "facture.validate",
  annulee: "facture.cancel",
};

interface StatusBody {
  status: FactureStatus;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as StatusBody | null;
    const validStatuses: FactureStatus[] = ["brouillon", "validee", "payee", "annulee"];
    if (!body || !validStatuses.includes(body.status)) {
      return NextResponse.json({ success: false, error: "status invalide" }, { status: 400 });
    }

    const requiredPermission = PERMISSION_FOR_TARGET[body.status];
    if (requiredPermission && !(await hasPermission(requiredPermission))) {
      throw new ForbiddenError(`Permission '${requiredPermission}' requise`);
    }

    const admin = getAdminClient();
    const { data: facture } = await admin
      .from("factures")
      .select(
        "id, status, reference, amount, currency, due_date, demande_id, demandes(id, reference, nom_complet, email, service, agent_id)"
      )
      .eq("id", params.id)
      .single();

    if (!facture) {
      return NextResponse.json({ success: false, error: "Facture introuvable" }, { status: 404 });
    }

    const factureRow = facture as unknown as {
      id: string;
      status: FactureStatus;
      reference: string;
      amount: number;
      currency: string;
      due_date: string | null;
      demande_id: string | null;
      demandes: { id: string; reference: string; nom_complet: string; email: string; service: string; agent_id: string | null } | null;
    };

    if (role === "agent" && factureRow.demandes?.agent_id !== user.id) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    const allowed = TRANSITIONS[factureRow.status] || [];
    if (!allowed.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: `Transition ${factureRow.status} → ${body.status} non autorisée` },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = { status: body.status };
    if (body.status === "validee") update.validated_by = user.id;
    if (body.status === "validee") update.validated_at = new Date().toISOString();

    const { error: updateError } = await admin.from("factures").update(update).eq("id", params.id);
    if (updateError) {
      console.error("[FACTURES] status update error:", updateError.message);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "facture.statut.change",
      entityType: "factures",
      entityId: params.id,
      oldValue: { status: factureRow.status },
      newValue: { status: body.status },
    });

    if (body.status === "validee" && factureRow.demandes?.email) {
      const mail = factureValideeEmail({
        clientNom: factureRow.demandes.nom_complet,
        reference: factureRow.reference,
        service: factureRow.demandes.service,
        amount: factureRow.amount,
        currency: factureRow.currency,
        dueDate: factureRow.due_date,
        demandeId: factureRow.demandes.id,
      });
      await sendEmail({
        to: factureRow.demandes.email,
        subject: mail.subject,
        html: mail.html,
        tag: "[FACTURE_VALIDEE]",
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[FACTURES] STATUS EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
