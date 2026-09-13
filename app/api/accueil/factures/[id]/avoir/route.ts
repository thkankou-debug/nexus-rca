// ============================================================================
// API ROUTE — POST /api/accueil/factures/:id/avoir (cahier §8)
// Correction TRACÉE d'une facture émise : jamais de réécriture invisible.
// L'avoir porte un motif obligatoire, référence la facture corrigée, est
// émis immédiatement, et réduit le RESTE DÛ (jamais les paiements déjà
// encaissés — un remboursement d'espèces est une autre opération, tracée en
// caisse). Le statut de la facture est recalculé depuis les montants.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import {
  getFactureAdminClient,
  getFactureActor,
  INVOICE_FIELDS,
  sumAvoirs,
  resteDu,
  statusFromAmounts,
} from "@/lib/facture-server";

export const dynamic = "force-dynamic";

interface AvoirBody {
  montant: number;
  motif: string;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("facture.create");
    const actor = await getFactureActor();
    if (!actor) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });

    const body = (await request.json().catch(() => null)) as AvoirBody | null;
    const montant = Number(body?.montant);
    const motif = body?.motif?.trim() || "";
    if (!Number.isFinite(montant) || montant <= 0) {
      return NextResponse.json({ success: false, error: "montant > 0 requis" }, { status: 400 });
    }
    if (motif.length < 3) {
      return NextResponse.json(
        { success: false, error: "Motif obligatoire — un avoir est un circuit tracé" },
        { status: 400 }
      );
    }

    const admin = getFactureAdminClient();
    const { data: facture } = await admin.from("invoices").select(INVOICE_FIELDS).eq("id", params.id).single();
    if (!facture) return NextResponse.json({ success: false, error: "Facture introuvable" }, { status: 404 });
    const f = facture as {
      id: string;
      reference: string;
      type: string;
      status: string;
      total: number;
      total_regle: number;
      client_record_id: string | null;
      client_nom: string;
      emitted_at: string | null;
    };
    if (f.type !== "facture" || !f.emitted_at) {
      return NextResponse.json({ success: false, error: "Un avoir corrige une facture ÉMISE" }, { status: 409 });
    }
    const avoirs = await sumAvoirs(admin, f.id);
    const reste = resteDu(Number(f.total), Number(f.total_regle), avoirs);
    if (montant > reste) {
      return NextResponse.json(
        {
          success: false,
          error: `L'avoir (${montant}) dépasse le reste dû (${reste}) — les paiements encaissés ne s'annulent pas par avoir`,
        },
        { status: 400 }
      );
    }

    const { data: avoir, error } = await admin
      .from("invoices")
      .insert({
        type: "avoir",
        parent_id: f.id,
        motif,
        client_record_id: f.client_record_id,
        client_nom: f.client_nom,
        lignes: [{ designation: `Avoir sur facture ${f.reference} — ${motif}`, quantite: 1, prix_unitaire: montant }],
        total: montant,
        status: "emise",
        emitted_at: new Date().toISOString(),
        created_by: actor.id,
        is_test: actor.isTest,
      })
      .select(INVOICE_FIELDS)
      .single();
    if (error || !avoir) {
      console.error("[FACTURES] avoir insert error:", error?.message);
      return NextResponse.json({ success: false, error: error?.message || "Échec" }, { status: 500 });
    }

    // Statut du parent recalculé (les montants font foi). Le contenu de la
    // facture reste intact — seul status/total_regle sont mutables (094).
    const newStatus = statusFromAmounts(Number(f.total), Number(f.total_regle), avoirs + montant);
    await admin.from("invoices").update({ status: newStatus }).eq("id", f.id);

    await logAudit({
      userId: actor.id,
      userRole: actor.role,
      action: "facture.avoir",
      entityType: "invoices",
      entityId: f.id,
      newValue: { avoir: (avoir as { reference: string }).reference, montant, motif, nouveau_statut: newStatus },
    });

    const { data: fNow } = await admin.from("invoices").select(INVOICE_FIELDS).eq("id", f.id).single();
    return NextResponse.json({ success: true, avoir, facture: fNow });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[FACTURES] AVOIR EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
