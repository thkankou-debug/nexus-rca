// ============================================================================
// API ROUTE — POST /api/accueil/pos
// Comptoir POS (§3.2 + addendum Caisse ouverte du 12/09/2026, GO Thierry).
//
// Trois opérations, même garde (paiement.record + session ouverte) :
// 1. Encaissement comptant d'un ticket (catalogue et/ou prestations libres,
//    lignes nature 'prestation' ou 'caution' — une caution entre dans le
//    tiroir mais n'est jamais une recette).
// 2. Encaissement PARTIEL (acompte) : le détail des prestations est porté
//    par une créance pos_credits ; la ligne quick_sales enregistrée vaut le
//    MONTANT PAYÉ (le tiroir et les recettes ne comptent que l'argent reçu,
//    jamais le dû). Cautions interdites sur un ticket partiel (une caution
//    se paie comptant).
// 3. Règlement complémentaire d'une créance existante : verrou optimiste
//    sur total_regle (deux règlements concurrents ne dépassent jamais le
//    dû — R09), la même créance est rechargée (jamais une seconde).
//
// CAI-05 : clé d'idempotence sur les trois chemins. AR-01 : réservé à la
// réception (middleware + policies). L2 : is_test propagé depuis le profil.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { getAccueilAdminClient } from "@/lib/accueil-server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const ALLOWED_MODES = ["especes", "mobile_money", "carte"] as const;
type PosPaymentMode = (typeof ALLOWED_MODES)[number];

const MAX_LINES = 20;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SALE_FIELDS =
  "id, reference, description, quantite, prix_unitaire, montant_total, devise, mode_paiement, date_paiement, nature, credit_id";

interface PosLine {
  service_slug?: string;
  label: string;
  description?: string;
  quantite: number;
  prix_unitaire: number;
  /** Caisse ouverte G3 : 'caution' = remboursable, jamais une recette. */
  nature?: "prestation" | "caution";
}

interface PosCheckoutBody {
  client?: {
    record_id?: string | null;
    nom?: string;
    email?: string;
    telephone?: string;
  };
  demande_id?: string | null;
  lignes?: PosLine[];
  mode_paiement: PosPaymentMode;
  montant_recu?: number;
  confirmation_reference?: string;
  notes?: string;
  ticket_key?: string;
  /** G2 : acompte — montant affecté maintenant (< total du ticket). */
  montant_affecte?: number;
  /** G2 : règlement complémentaire d'une créance existante. */
  credit_reglement?: { credit_id: string; montant: number };
}

export async function POST(request: NextRequest) {
  try {
    await assertPermission("paiement.record");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const { data: actor } = await supabase
      .from("profiles")
      .select("role, is_test")
      .eq("id", user.id)
      .single();
    const actorRow = actor as { role?: string; is_test?: boolean } | null;
    const role = actorRow?.role || "";
    const isTest = Boolean(actorRow?.is_test);

    const body = (await request.json().catch(() => null)) as PosCheckoutBody | null;
    if (!body || !ALLOWED_MODES.includes(body.mode_paiement)) {
      return NextResponse.json({ success: false, error: "Mode de paiement invalide" }, { status: 400 });
    }

    // §3.2 sécurité : confirmation vérifiée obligatoire hors espèces.
    const confirmationRef = body.confirmation_reference?.trim() || "";
    if (body.mode_paiement !== "especes" && !confirmationRef) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Référence de confirmation requise pour un paiement électronique (un paiement annoncé n'est pas un paiement reçu)",
        },
        { status: 400 }
      );
    }

    const admin = getAccueilAdminClient();

    // CAI-05 : idempotence — résultat initial renvoyé sur rejeu.
    const ticketKey = body.ticket_key && UUID_RE.test(body.ticket_key) ? body.ticket_key : null;
    if (ticketKey) {
      const { data: existing } = await admin
        .from("quick_sales")
        .select(SALE_FIELDS)
        .eq("ticket_key", ticketKey)
        .order("ligne_index", { ascending: true });
      if (existing && existing.length > 0) {
        const totalExisting = (existing as { montant_total: number }[]).reduce(
          (s, r) => s + Number(r.montant_total),
          0
        );
        return NextResponse.json({ success: true, sales: existing, total: totalExisting, replayed: true });
      }
    }

    // §3.1 règle d'ordre : session de caisse ouverte obligatoire.
    const { data: session } = await admin
      .from("caisse_sessions")
      .select("id, opened_at")
      .eq("agent_id", user.id)
      .eq("status", "ouverte")
      .maybeSingle();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Caisse non ouverte : ouvrez votre session avant tout encaissement" },
        { status: 409 }
      );
    }
    const sessionId = (session as { id: string }).id;

    const notesParts: string[] = [];
    if (body.mode_paiement !== "especes") {
      notesParts.push(
        `Confirmation ${body.mode_paiement === "mobile_money" ? "Mobile Money" : "carte"} : ${confirmationRef}`
      );
    }
    if (body.notes?.trim()) notesParts.push(body.notes.trim());
    const notesInternes = notesParts.length > 0 ? notesParts.join(" — ") : null;

    // ── Chemin 3 : règlement complémentaire d'une créance existante ──
    if (body.credit_reglement) {
      const { credit_id, montant } = body.credit_reglement;
      const paid = Number(montant);
      if (!credit_id || !Number.isFinite(paid) || paid <= 0) {
        return NextResponse.json({ success: false, error: "credit_id et montant > 0 requis" }, { status: 400 });
      }
      const { data: credit } = await admin
        .from("pos_credits")
        .select("id, ticket_key, client_record_id, demande_id, client_nom, total_du, total_regle, status")
        .eq("id", credit_id)
        .single();
      if (!credit) {
        return NextResponse.json({ success: false, error: "Créance introuvable" }, { status: 404 });
      }
      const c = credit as {
        id: string;
        client_record_id: string | null;
        demande_id: string | null;
        client_nom: string | null;
        total_du: number;
        total_regle: number;
        status: string;
      };
      if (c.status !== "ouverte") {
        return NextResponse.json({ success: false, error: "Créance déjà soldée" }, { status: 400 });
      }
      const reste = Number(c.total_du) - Number(c.total_regle);
      if (paid > reste) {
        return NextResponse.json(
          { success: false, error: `Le règlement (${paid}) dépasse le reste dû (${reste})` },
          { status: 400 }
        );
      }

      // Verrou optimiste (R09) : l'update n'aboutit que si total_regle n'a
      // pas bougé depuis la lecture — sinon 409, à réessayer.
      const newRegle = Number(c.total_regle) + paid;
      const { data: lockRows, error: lockError } = await admin
        .from("pos_credits")
        .update({ total_regle: newRegle, status: newRegle >= Number(c.total_du) ? "soldee" : "ouverte" })
        .eq("id", c.id)
        .eq("total_regle", c.total_regle)
        .select("id");
      if (lockError || !lockRows || lockRows.length === 0) {
        return NextResponse.json(
          { success: false, error: "Un autre règlement vient d'être enregistré sur cette créance — rechargez et réessayez" },
          { status: 409 }
        );
      }

      const { data: created, error: insertError } = await admin
        .from("quick_sales")
        .insert({
          type_service: "autre" as const,
          nature: "prestation",
          description: `Règlement créance comptoir (reste dû ${Math.max(0, reste - paid)} FCFA après)`,
          quantite: 1,
          prix_unitaire: paid,
          montant_total: paid,
          devise: "XAF",
          mode_paiement: body.mode_paiement,
          client_record_id: c.client_record_id,
          client_nom: c.client_nom,
          demande_id: c.demande_id,
          credit_id: c.id,
          notes_internes: notesInternes,
          agent_id: user.id,
          created_by: user.id,
          is_test: isTest,
          ticket_key: ticketKey,
          ligne_index: ticketKey ? 0 : null,
        })
        .select(SALE_FIELDS)
        .single();
      if (insertError || !created) {
        console.error("[POS] reglement insert error:", insertError?.message);
        return NextResponse.json({ success: false, error: insertError?.message || "Échec" }, { status: 500 });
      }

      await logAudit({
        userId: user.id,
        userRole: role,
        action: "pos.reglement_creance",
        entityType: "pos_credits",
        entityId: c.id,
        oldValue: { total_regle: c.total_regle },
        newValue: { total_regle: newRegle, paiement: paid, session_id: sessionId },
      });

      return NextResponse.json({
        success: true,
        sales: [created],
        total: paid,
        credit: { id: c.id, total_du: Number(c.total_du), total_regle: newRegle, reste_du: Math.max(0, Number(c.total_du) - newRegle) },
      });
    }

    // ── Chemins 1 & 2 : ticket (comptant ou acompte) ──
    const lignes = body.lignes || [];
    if (lignes.length === 0) {
      return NextResponse.json({ success: false, error: "Ticket vide" }, { status: 400 });
    }
    if (lignes.length > MAX_LINES) {
      return NextResponse.json({ success: false, error: `Maximum ${MAX_LINES} lignes par ticket` }, { status: 400 });
    }
    for (const ligne of lignes) {
      const qte = Number(ligne.quantite);
      const prix = Number(ligne.prix_unitaire);
      if (!ligne.label?.trim() || !Number.isInteger(qte) || qte <= 0 || !Number.isFinite(prix) || prix < 0) {
        return NextResponse.json(
          { success: false, error: "Ligne invalide (libellé, quantité > 0 et prix >= 0 requis)" },
          { status: 400 }
        );
      }
      if (ligne.nature && !["prestation", "caution"].includes(ligne.nature)) {
        return NextResponse.json({ success: false, error: "nature de ligne invalide" }, { status: 400 });
      }
    }
    const total = lignes.reduce((s, l) => s + Number(l.quantite) * Number(l.prix_unitaire), 0);
    if (total <= 0) {
      return NextResponse.json({ success: false, error: "Le total du ticket doit être > 0" }, { status: 400 });
    }
    const hasCaution = lignes.some((l) => l.nature === "caution");

    // Rattachement dossier (étape 3) : vérifié, jamais implicite.
    let demandeId: string | null = null;
    if (body.demande_id) {
      const { data: demande } = await admin
        .from("demandes")
        .select("id, client_record_id")
        .eq("id", body.demande_id)
        .single();
      if (!demande) {
        return NextResponse.json({ success: false, error: "Dossier introuvable" }, { status: 404 });
      }
      const demandeClient = (demande as { client_record_id: string | null }).client_record_id;
      if (body.client?.record_id && demandeClient && demandeClient !== body.client.record_id) {
        return NextResponse.json(
          { success: false, error: "Ce dossier n'appartient pas au client sélectionné" },
          { status: 400 }
        );
      }
      demandeId = (demande as { id: string }).id;
    }

    // ── Chemin 2 : acompte (paiement partiel) ──
    const montantAffecte = body.montant_affecte !== undefined ? Number(body.montant_affecte) : null;
    if (montantAffecte !== null) {
      if (!Number.isFinite(montantAffecte) || montantAffecte <= 0 || montantAffecte >= total) {
        return NextResponse.json(
          { success: false, error: "L'acompte doit être > 0 et inférieur au total du ticket" },
          { status: 400 }
        );
      }
      if (hasCaution) {
        return NextResponse.json(
          { success: false, error: "Une caution se paie comptant — retirez-la du ticket partiel" },
          { status: 400 }
        );
      }
      if (!ticketKey) {
        return NextResponse.json({ success: false, error: "ticket_key requis pour un acompte" }, { status: 400 });
      }

      const { data: credit, error: creditError } = await admin
        .from("pos_credits")
        .insert({
          ticket_key: ticketKey,
          client_record_id: body.client?.record_id || null,
          demande_id: demandeId,
          client_nom: body.client?.nom?.trim() || null,
          lignes: lignes.map((l) => ({
            label: l.label.trim(),
            quantite: Number(l.quantite),
            prix_unitaire: Number(l.prix_unitaire),
            montant_total: Number(l.quantite) * Number(l.prix_unitaire),
          })),
          total_du: total,
          total_regle: montantAffecte,
          status: "ouverte",
          is_test: isTest,
          created_by: user.id,
        })
        .select("id, total_du, total_regle")
        .single();
      if (creditError || !credit) {
        // Rejeu (ticket_key UNIQUE) : renvoyer le résultat initial.
        if (creditError?.code === "23505") {
          const { data: existing } = await admin
            .from("quick_sales")
            .select(SALE_FIELDS)
            .eq("ticket_key", ticketKey);
          if (existing && existing.length > 0) {
            return NextResponse.json({ success: true, sales: existing, total: montantAffecte, replayed: true });
          }
        }
        console.error("[POS] credit insert error:", creditError?.message);
        return NextResponse.json({ success: false, error: creditError?.message || "Échec" }, { status: 500 });
      }
      const creditRow = credit as { id: string; total_du: number; total_regle: number };

      const { data: created, error: insertError } = await admin
        .from("quick_sales")
        .insert({
          type_service: "autre" as const,
          nature: "prestation",
          description: `Acompte comptoir — ${lignes.length} prestation(s), reste dû ${total - montantAffecte} FCFA`,
          quantite: 1,
          prix_unitaire: montantAffecte,
          montant_total: montantAffecte,
          devise: "XAF",
          mode_paiement: body.mode_paiement,
          client_record_id: body.client?.record_id || null,
          client_nom: body.client?.nom?.trim() || null,
          client_email: body.client?.email?.trim() || null,
          client_telephone: body.client?.telephone?.trim() || null,
          demande_id: demandeId,
          credit_id: creditRow.id,
          notes_internes: notesInternes,
          agent_id: user.id,
          created_by: user.id,
          is_test: isTest,
          ticket_key: ticketKey,
          ligne_index: 0,
        })
        .select(SALE_FIELDS)
        .single();
      if (insertError || !created) {
        console.error("[POS] acompte insert error:", insertError?.message);
        return NextResponse.json({ success: false, error: insertError?.message || "Échec" }, { status: 500 });
      }

      await logAudit({
        userId: user.id,
        userRole: role,
        action: "pos.acompte",
        entityType: "pos_credits",
        entityId: creditRow.id,
        newValue: {
          session_id: sessionId,
          total_du: total,
          acompte: montantAffecte,
          mode_paiement: body.mode_paiement,
          lignes: lignes.map((l) => ({ label: l.label, quantite: l.quantite, prix: l.prix_unitaire })),
        },
      });

      return NextResponse.json({
        success: true,
        sales: [created],
        total: montantAffecte,
        credit: {
          id: creditRow.id,
          total_du: total,
          total_regle: montantAffecte,
          reste_du: total - montantAffecte,
        },
      });
    }

    // ── Chemin 1 : encaissement comptant (comportement historique) ──
    const rows = lignes.map((l, i) => ({
      type_service: "autre" as const,
      nature: l.nature === "caution" ? ("caution" as const) : ("prestation" as const),
      description: [l.nature === "caution" ? "Caution — " : "", l.label.trim(), l.description?.trim() ? ` · ${l.description.trim()}` : ""].join(""),
      quantite: Number(l.quantite),
      prix_unitaire: Number(l.prix_unitaire),
      montant_total: Number(l.quantite) * Number(l.prix_unitaire),
      devise: "XAF",
      mode_paiement: body.mode_paiement,
      client_record_id: body.client?.record_id || null,
      client_nom: body.client?.nom?.trim() || null,
      client_email: body.client?.email?.trim() || null,
      client_telephone: body.client?.telephone?.trim() || null,
      demande_id: demandeId,
      notes_internes: notesInternes,
      agent_id: user.id,
      created_by: user.id,
      is_test: isTest,
      ticket_key: ticketKey,
      ligne_index: ticketKey ? i : null,
    }));

    const { data: created, error: insertError } = await admin
      .from("quick_sales")
      .insert(rows)
      .select(SALE_FIELDS);

    if (insertError) {
      if (insertError.code === "23505" && ticketKey) {
        const { data: existing } = await admin
          .from("quick_sales")
          .select(SALE_FIELDS)
          .eq("ticket_key", ticketKey)
          .order("ligne_index", { ascending: true });
        if (existing && existing.length > 0) {
          const totalExisting = (existing as { montant_total: number }[]).reduce(
            (s, r) => s + Number(r.montant_total),
            0
          );
          return NextResponse.json({ success: true, sales: existing, total: totalExisting, replayed: true });
        }
      }
      console.error("[POS] insert error:", insertError.message);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }
    if (!created || created.length === 0) {
      return NextResponse.json({ success: false, error: "Échec de l'encaissement" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "pos.encaissement",
      entityType: "quick_sales",
      entityId: (created[0] as { id: string }).id,
      newValue: {
        session_id: sessionId,
        demande_id: demandeId,
        mode_paiement: body.mode_paiement,
        confirmation_reference: confirmationRef || null,
        total,
        cautions: hasCaution,
        lignes: lignes.map((l) => ({ label: l.label, quantite: l.quantite, prix: l.prix_unitaire, nature: l.nature || "prestation" })),
      },
    });

    return NextResponse.json({ success: true, sales: created, total });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[POS] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
