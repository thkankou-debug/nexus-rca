// ============================================================================
// API ROUTE — /api/accueil/factures (cahier §8-§9, 12/09/2026)
// GET  : liste des factures et avoirs (portée is_test de l'acteur).
// POST : création — libre (brouillon ou émise) OU depuis un ticket de
//        caisse déjà encaissé (ticket_key) : la facture RÉFÉRENCE les
//        ventes existantes, elle ne double ni vente, ni revenu, ni
//        paiement ; une même clé de ticket ne produit qu'une facture.
// Droits : facture.create (réceptionniste incluse, migration 094).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";
import {
  getFactureAdminClient,
  getFactureActor,
  INVOICE_FIELDS,
  type InvoiceLine,
} from "@/lib/facture-server";
import { FACTURE_CONDITIONS_DEFAUT, FACTURE_ECHEANCE_JOURS_DEFAUT } from "@/lib/facture-config";

export const dynamic = "force-dynamic";

const MAX_LINES = 30;

export async function GET() {
  try {
    await assertPermission("facture.read");
    const actor = await getFactureActor();
    if (!actor) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });

    const admin = getFactureAdminClient();
    const { data, error } = await admin
      .from("invoices")
      .select(INVOICE_FIELDS)
      .eq("is_test", actor.isTest)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, factures: data || [] });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[FACTURES] GET EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}

interface CreateBody {
  client?: { record_id?: string; nom?: string; coordonnees?: string };
  demande_id?: string;
  ticket_key?: string;
  lignes?: InvoiceLine[];
  echeance?: string;
  conditions?: string;
  emettre?: boolean;
}

function defaultEcheance(): string {
  const d = new Date();
  d.setDate(d.getDate() + FACTURE_ECHEANCE_JOURS_DEFAUT);
  return d.toISOString().split("T")[0];
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("facture.create");
    const actor = await getFactureActor();
    if (!actor) return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });

    const body = (await request.json().catch(() => null)) as CreateBody | null;
    if (!body) return NextResponse.json({ success: false, error: "Corps JSON requis" }, { status: 400 });

    const admin = getFactureAdminClient();

    // ── Depuis un ticket de caisse : référencer, jamais doubler ──
    if (body.ticket_key) {
      const { data: existing } = await admin
        .from("invoices")
        .select(INVOICE_FIELDS)
        .eq("ticket_key", body.ticket_key)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ success: true, facture: existing, replayed: true });
      }

      // Créance de comptoir liée (acompte) → la facture porte le total dû
      // et l'acompte déjà réglé ; sinon, ventes du ticket (déjà payées).
      const [{ data: credit }, { data: sales }] = await Promise.all([
        admin
          .from("pos_credits")
          .select("id, client_record_id, client_nom, lignes, total_du, total_regle")
          .eq("ticket_key", body.ticket_key)
          .maybeSingle(),
        admin
          .from("quick_sales")
          .select("description, quantite, unite, prix_unitaire, montant_total, nature, client_record_id, client_nom, demande_id")
          .eq("ticket_key", body.ticket_key)
          .order("ligne_index", { ascending: true }),
      ]);

      let lignes: InvoiceLine[] = [];
      let total = 0;
      let totalRegle = 0;
      let clientNom = body.client?.nom?.trim() || "";
      let clientRecordId = body.client?.record_id || null;
      let demandeId = body.demande_id || null;

      if (credit) {
        const c = credit as {
          client_record_id: string | null;
          client_nom: string | null;
          lignes: { label: string; quantite: number; prix_unitaire: number }[];
          total_du: number;
          total_regle: number;
        };
        lignes = (c.lignes || []).map((l) => ({
          designation: l.label,
          quantite: Number(l.quantite),
          prix_unitaire: Number(l.prix_unitaire),
        }));
        total = Number(c.total_du);
        totalRegle = Number(c.total_regle);
        clientNom = clientNom || c.client_nom || "Client de passage";
        clientRecordId = clientRecordId || c.client_record_id;
      } else {
        const rows = ((sales || []) as {
          description: string | null;
          quantite: number;
          unite: string | null;
          prix_unitaire: number;
          montant_total: number;
          nature?: string | null;
          client_record_id: string | null;
          client_nom: string | null;
          demande_id: string | null;
        }[]).filter((s) => s.nature !== "caution" && s.nature !== "caution_remboursement");
        if (rows.length === 0) {
          return NextResponse.json(
            { success: false, error: "Aucune prestation facturable pour ce ticket (les cautions ne se facturent pas)" },
            { status: 404 }
          );
        }
        lignes = rows.map((s) => ({
          designation: s.description || "Prestation",
          quantite: Number(s.quantite),
          unite: s.unite || undefined,
          prix_unitaire: Number(s.prix_unitaire),
        }));
        total = rows.reduce((sum, s) => sum + Number(s.montant_total), 0);
        totalRegle = total; // ticket comptant : déjà encaissé, rien de doublé
        clientNom = clientNom || rows[0].client_nom || "Client de passage";
        clientRecordId = clientRecordId || rows[0].client_record_id;
        demandeId = demandeId || rows[0].demande_id;
      }

      const { data: created, error } = await admin
        .from("invoices")
        .insert({
          client_record_id: clientRecordId,
          client_nom: clientNom,
          client_coordonnees: body.client?.coordonnees?.trim() || null,
          demande_id: demandeId,
          ticket_key: body.ticket_key,
          lignes,
          total,
          total_regle: totalRegle,
          echeance: body.echeance || defaultEcheance(),
          conditions: body.conditions?.trim() || FACTURE_CONDITIONS_DEFAUT,
          status: totalRegle >= total ? "reglee" : "partiellement_reglee",
          emitted_at: new Date().toISOString(),
          created_by: actor.id,
          is_test: actor.isTest,
        })
        .select(INVOICE_FIELDS)
        .single();
      if (error || !created) {
        // Course sur ticket_key : renvoyer l'existante, jamais un doublon.
        const { data: raced } = await admin
          .from("invoices")
          .select(INVOICE_FIELDS)
          .eq("ticket_key", body.ticket_key)
          .maybeSingle();
        if (raced) return NextResponse.json({ success: true, facture: raced, replayed: true });
        console.error("[FACTURES] insert ticket error:", error?.message);
        return NextResponse.json({ success: false, error: error?.message || "Échec" }, { status: 500 });
      }

      await logAudit({
        userId: actor.id,
        userRole: actor.role,
        action: "facture.creee_depuis_ticket",
        entityType: "invoices",
        entityId: (created as { id: string }).id,
        newValue: { ticket_key: body.ticket_key, total, total_regle: totalRegle },
      });
      return NextResponse.json({ success: true, facture: created });
    }

    // ── Facture libre ──
    const clientNom = body.client?.nom?.trim();
    if (!clientNom || clientNom.length < 2) {
      return NextResponse.json({ success: false, error: "Nom du client requis" }, { status: 400 });
    }
    const lignes = body.lignes || [];
    if (lignes.length === 0 || lignes.length > MAX_LINES) {
      return NextResponse.json(
        { success: false, error: `1 à ${MAX_LINES} lignes de prestation requises` },
        { status: 400 }
      );
    }
    for (const l of lignes) {
      const q = Number(l.quantite);
      const p = Number(l.prix_unitaire);
      if (!l.designation?.trim() || !Number.isInteger(q) || q <= 0 || !Number.isFinite(p) || p < 0) {
        return NextResponse.json(
          { success: false, error: "Ligne invalide (désignation, quantité > 0, prix >= 0)" },
          { status: 400 }
        );
      }
    }
    const total = lignes.reduce((s, l) => s + Number(l.quantite) * Number(l.prix_unitaire), 0);
    if (total <= 0) {
      return NextResponse.json({ success: false, error: "Le total doit être > 0" }, { status: 400 });
    }

    const emettre = Boolean(body.emettre);
    const { data: created, error } = await admin
      .from("invoices")
      .insert({
        client_record_id: body.client?.record_id || null,
        client_nom: clientNom,
        client_coordonnees: body.client?.coordonnees?.trim() || null,
        demande_id: body.demande_id || null,
        lignes: lignes.map((l) => ({
          designation: l.designation.trim().slice(0, 200),
          description: l.description?.trim().slice(0, 300) || undefined,
          quantite: Number(l.quantite),
          unite: l.unite?.trim().slice(0, 30) || undefined,
          prix_unitaire: Number(l.prix_unitaire),
        })),
        total,
        echeance: body.echeance || (emettre ? defaultEcheance() : null),
        conditions: body.conditions?.trim() || FACTURE_CONDITIONS_DEFAUT,
        status: emettre ? "emise" : "brouillon",
        emitted_at: emettre ? new Date().toISOString() : null,
        created_by: actor.id,
        is_test: actor.isTest,
      })
      .select(INVOICE_FIELDS)
      .single();
    if (error || !created) {
      console.error("[FACTURES] insert error:", error?.message);
      return NextResponse.json({ success: false, error: error?.message || "Échec" }, { status: 500 });
    }

    await logAudit({
      userId: actor.id,
      userRole: actor.role,
      action: emettre ? "facture.emise" : "facture.brouillon",
      entityType: "invoices",
      entityId: (created as { id: string }).id,
      newValue: { client: clientNom, total },
    });
    return NextResponse.json({ success: true, facture: created });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[FACTURES] POST EXCEPTION:", err);
    return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
  }
}
