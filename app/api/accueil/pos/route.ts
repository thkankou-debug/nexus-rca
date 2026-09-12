// ============================================================================
// API ROUTE — POST /api/accueil/pos
// Comptoir POS (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md §3.2, maquette
// POS ECRAN 1). Encaissement d'un ticket multi-lignes :
//
// - Règle d'ordre (§3.1) : AUCUN encaissement sans session de caisse ouverte
//   — vérifiée côté serveur, pas seulement un bouton désactivé.
// - Une ligne quick_sales par ligne de ticket (table existante, pas de
//   dossier vide pour une photocopie). Rattachement optionnel à un dossier
//   via quick_sales.demande_id (migration 080).
// - Paiements électroniques (§3.2 sécurité) : une référence de confirmation
//   vérifiée est OBLIGATOIRE — un Mobile Money annoncé n'est pas un Mobile
//   Money reçu. Elle est tracée dans notes_internes et dans l'audit.
// - Le mouvement entre immédiatement dans la session (le solde théorique et
//   le journal lisent quick_sales depuis l'ouverture — lib/caisse-server.ts).
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

interface PosLine {
  service_slug?: string;
  label: string;
  quantite: number;
  prix_unitaire: number;
}

interface PosCheckoutBody {
  client?: {
    record_id?: string | null;
    nom?: string;
    email?: string;
    telephone?: string;
  };
  demande_id?: string | null;
  lignes: PosLine[];
  mode_paiement: PosPaymentMode;
  montant_recu?: number;
  confirmation_reference?: string;
  notes?: string;
  /** CAI-05 : clé d'idempotence du ticket (uuid généré par le POS). */
  ticket_key?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SALE_FIELDS =
  "id, reference, description, quantite, prix_unitaire, montant_total, devise, mode_paiement, date_paiement";

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
    const role = (actor as { role?: string } | null)?.role || "";

    const body = (await request.json().catch(() => null)) as PosCheckoutBody | null;
    if (!body || !Array.isArray(body.lignes) || body.lignes.length === 0) {
      return NextResponse.json({ success: false, error: "Ticket vide" }, { status: 400 });
    }
    if (body.lignes.length > MAX_LINES) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_LINES} lignes par ticket` },
        { status: 400 }
      );
    }
    if (!ALLOWED_MODES.includes(body.mode_paiement)) {
      return NextResponse.json({ success: false, error: "Mode de paiement invalide" }, { status: 400 });
    }

    for (const ligne of body.lignes) {
      const qte = Number(ligne.quantite);
      const prix = Number(ligne.prix_unitaire);
      if (!ligne.label?.trim() || !Number.isInteger(qte) || qte <= 0 || !Number.isFinite(prix) || prix < 0) {
        return NextResponse.json(
          { success: false, error: "Ligne invalide (libellé, quantité > 0 et prix >= 0 requis)" },
          { status: 400 }
        );
      }
    }
    const total = body.lignes.reduce((s, l) => s + Number(l.quantite) * Number(l.prix_unitaire), 0);
    if (total <= 0) {
      return NextResponse.json({ success: false, error: "Le total du ticket doit être > 0" }, { status: 400 });
    }

    // §3.2 sécurité : confirmation vérifiée obligatoire hors espèces.
    const confirmationRef = body.confirmation_reference?.trim() || "";
    if (body.mode_paiement !== "especes" && !confirmationRef) {
      return NextResponse.json(
        {
          success: false,
          error: "Référence de confirmation requise pour un paiement électronique (un paiement annoncé n'est pas un paiement reçu)",
        },
        { status: 400 }
      );
    }

    const admin = getAccueilAdminClient();

    // CAI-05 : idempotence. Si ce ticket a déjà été enregistré (double clic,
    // reprise après coupure réseau), renvoyer le résultat INITIAL — jamais
    // un second encaissement.
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

    const notesParts: string[] = [];
    if (body.mode_paiement !== "especes") {
      notesParts.push(`Confirmation ${body.mode_paiement === "mobile_money" ? "Mobile Money" : "carte"} : ${confirmationRef}`);
    }
    if (body.notes?.trim()) notesParts.push(body.notes.trim());
    const notesInternes = notesParts.length > 0 ? notesParts.join(" — ") : null;

    const rows = body.lignes.map((l, i) => ({
      type_service: "autre" as const,
      description: l.label.trim(),
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
      ticket_key: ticketKey,
      ligne_index: ticketKey ? i : null,
    }));

    const { data: created, error: insertError } = await admin
      .from("quick_sales")
      .insert(rows)
      .select(SALE_FIELDS);

    if (insertError) {
      // CAI-05, cas concurrent : deux requêtes identiques simultanées — la
      // seconde perd la course (contrainte UNIQUE ticket_key/ligne_index)
      // et renvoie le résultat de la première, sans doublon.
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
        session_id: (session as { id: string }).id,
        demande_id: demandeId,
        mode_paiement: body.mode_paiement,
        confirmation_reference: confirmationRef || null,
        total,
        lignes: body.lignes.map((l) => ({ label: l.label, quantite: l.quantite, prix: l.prix_unitaire })),
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
