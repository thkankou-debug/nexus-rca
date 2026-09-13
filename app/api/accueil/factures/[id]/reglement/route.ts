// ============================================================================
// API ROUTE — POST /api/accueil/factures/:id/reglement (cahier §9)
// Une même facture peut recevoir plusieurs règlements : chacun passe par la
// CAISSE (quick_sales.invoice_id — le trigger 091 exige une session
// ouverte), produit son propre reçu côté client, et met à jour le reste dû.
// Verrou optimiste sur total_regle (consommation simultanée du même reste
// dû impossible) ; idempotence par ticket_key (double clic / coupure réseau
// → le résultat initial est renvoyé, jamais un second paiement).
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

const SALE_FIELDS =
  "id, reference, description, quantite, prix_unitaire, montant_total, mode_paiement, client_nom, created_at, invoice_id";

interface ReglementBody {
  montant: number;
  mode_paiement: "especes" | "mobile_money";
  confirmation_reference?: string;
  ticket_key?: string;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await assertPermission("paiement.record");
    const actor = await getFactureActor();
    if (!actor) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });

    const body = (await request.json().catch(() => null)) as ReglementBody | null;
    const montant = Number(body?.montant);
    if (!body || !["especes", "mobile_money"].includes(body.mode_paiement)) {
      return NextResponse.json({ success: false, error: "mode_paiement invalide" }, { status: 400 });
    }
    if (!Number.isFinite(montant) || montant <= 0) {
      return NextResponse.json({ success: false, error: "montant > 0 requis" }, { status: 400 });
    }
    if (body.mode_paiement !== "especes" && !body.confirmation_reference?.trim()) {
      return NextResponse.json(
        { success: false, error: "Référence de confirmation Mobile Money requise (vérifiée, pas annoncée)" },
        { status: 400 }
      );
    }

    const admin = getFactureAdminClient();

    // Idempotence : même ticket_key déjà passé → résultat initial.
    if (body.ticket_key) {
      const { data: existing } = await admin
        .from("quick_sales")
        .select(SALE_FIELDS)
        .eq("ticket_key", body.ticket_key);
      if (existing && existing.length > 0) {
        const { data: fNow } = await admin.from("invoices").select(INVOICE_FIELDS).eq("id", params.id).single();
        return NextResponse.json({ success: true, sales: existing, facture: fNow, replayed: true });
      }
    }

    // Session ouverte obligatoire (pré-check propre — le trigger 091 reste
    // la garantie ultime).
    const { data: session } = await admin
      .from("caisse_sessions")
      .select("id")
      .eq("agent_id", actor.id)
      .eq("status", "ouverte")
      .maybeSingle();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Caisse non ouverte : ouvrez votre session avant tout encaissement" },
        { status: 409 }
      );
    }

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
      demande_id: string | null;
    };
    if (f.type !== "facture") {
      return NextResponse.json({ success: false, error: "Un avoir ne se règle pas" }, { status: 400 });
    }
    if (!["emise", "partiellement_reglee"].includes(f.status)) {
      return NextResponse.json(
        { success: false, error: `Facture ${f.status === "brouillon" ? "non émise" : "déjà soldée ou annulée"} — règlement impossible` },
        { status: 409 }
      );
    }
    const avoirs = await sumAvoirs(admin, f.id);
    const reste = resteDu(Number(f.total), Number(f.total_regle), avoirs);
    if (montant > reste) {
      return NextResponse.json(
        { success: false, error: `Le règlement (${montant}) dépasse le reste dû (${reste})` },
        { status: 400 }
      );
    }

    // Verrou optimiste : total_regle n'a pas bougé depuis la lecture.
    const newRegle = Number(f.total_regle) + montant;
    const { data: locked, error: lockError } = await admin
      .from("invoices")
      .update({ total_regle: newRegle, status: statusFromAmounts(Number(f.total), newRegle, avoirs) })
      .eq("id", f.id)
      .eq("total_regle", f.total_regle)
      .select("id");
    if (lockError || !locked || locked.length === 0) {
      return NextResponse.json(
        { success: false, error: "Un autre règlement vient d'être enregistré sur cette facture — rechargez et réessayez" },
        { status: 409 }
      );
    }

    const { data: sale, error: saleError } = await admin
      .from("quick_sales")
      .insert({
        type_service: "autre" as const,
        nature: "prestation",
        description: `Règlement facture ${f.reference} (reste dû ${reste - montant} FCFA après)`,
        quantite: 1,
        prix_unitaire: montant,
        montant_total: montant,
        devise: "XAF",
        mode_paiement: body.mode_paiement,
        client_record_id: f.client_record_id,
        client_nom: f.client_nom,
        demande_id: f.demande_id,
        invoice_id: f.id,
        notes_internes:
          body.mode_paiement !== "especes" && body.confirmation_reference
            ? `Confirmation Mobile Money : ${body.confirmation_reference.trim()}`
            : null,
        agent_id: actor.id,
        created_by: actor.id,
        is_test: actor.isTest,
        ticket_key: body.ticket_key || null,
        ligne_index: body.ticket_key ? 0 : null,
      })
      .select(SALE_FIELDS)
      .single();
    if (saleError || !sale) {
      // La vente a échoué : rétablir le compteur (l'update inverse ne peut
      // pas courser un autre règlement grâce au verrou eq(newRegle)).
      await admin
        .from("invoices")
        .update({ total_regle: f.total_regle, status: f.status })
        .eq("id", f.id)
        .eq("total_regle", newRegle);
      console.error("[FACTURES] reglement sale error:", saleError?.message);
      return NextResponse.json({ success: false, error: saleError?.message || "Échec" }, { status: 500 });
    }

    await logAudit({
      userId: actor.id,
      userRole: actor.role,
      action: "facture.reglement",
      entityType: "invoices",
      entityId: f.id,
      oldValue: { total_regle: f.total_regle },
      newValue: { total_regle: newRegle, montant, mode: body.mode_paiement },
    });

    const { data: fNow } = await admin.from("invoices").select(INVOICE_FIELDS).eq("id", f.id).single();
    return NextResponse.json({
      success: true,
      sales: [sale],
      facture: fNow,
      reste_du: resteDu(Number(f.total), newRegle, avoirs),
    });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[FACTURES] REGLEMENT EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
