// ============================================================================
// API ROUTE — POST /api/accueil/factures/:id/emettre (cahier §8)
// Brouillon → émise : pose emitted_at (le trigger 094 fige alors le
// contenu). Échéance par défaut si absente. Émission = acte définitif.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import { getFactureAdminClient, getFactureActor, INVOICE_FIELDS } from "@/lib/facture-server";
import { FACTURE_ECHEANCE_JOURS_DEFAUT } from "@/lib/facture-config";

export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("facture.create");
    const actor = await getFactureActor();
    if (!actor) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });

    const admin = getFactureAdminClient();
    const { data: facture } = await admin
      .from("invoices")
      .select("id, reference, status, echeance, emitted_at")
      .eq("id", params.id)
      .single();
    if (!facture) return NextResponse.json({ success: false, error: "Facture introuvable" }, { status: 404 });
    const f = facture as { id: string; reference: string; status: string; echeance: string | null; emitted_at: string | null };
    if (f.status !== "brouillon" || f.emitted_at) {
      return NextResponse.json({ success: false, error: "Seul un brouillon s'émet" }, { status: 409 });
    }

    const echeance =
      f.echeance ||
      (() => {
        const d = new Date();
        d.setDate(d.getDate() + FACTURE_ECHEANCE_JOURS_DEFAUT);
        return d.toISOString().split("T")[0];
      })();

    const { data: updated, error } = await admin
      .from("invoices")
      .update({ status: "emise", emitted_at: new Date().toISOString(), echeance })
      .eq("id", f.id)
      .eq("status", "brouillon")
      .select(INVOICE_FIELDS)
      .single();
    if (error || !updated) {
      return NextResponse.json({ success: false, error: error?.message || "Échec de l'émission" }, { status: 500 });
    }

    await logAudit({
      userId: actor.id,
      userRole: actor.role,
      action: "facture.emise",
      entityType: "invoices",
      entityId: f.id,
      newValue: { reference: f.reference, echeance },
    });
    return NextResponse.json({ success: true, facture: updated });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[FACTURES] EMETTRE EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
