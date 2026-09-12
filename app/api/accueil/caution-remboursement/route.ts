// ============================================================================
// API ROUTE — POST /api/accueil/caution-remboursement
// Caisse ouverte G3 (décision Thierry, 12/09/2026) : LA RÉCEPTIONNISTE
// rembourse la caution elle-même, avec traçabilité complète.
// - Le remboursement est lié à la ligne caution d'origine (caution_ref) et
//   BORNÉ : Σ remboursements ≤ montant de la caution (jamais dépassé, même
//   en cas de tentatives répétées — vérification sur lecture fraîche +
//   idempotence par clé).
// - Sortie d'ESPÈCES du tiroir (stockée en montant positif, nature
//   'caution_remboursement', soustraite partout où les espèces sont
//   sommées — lib/caisse-server.ts). Session ouverte obligatoire.
// - Rien n'est effacé : la caution d'origine reste intacte.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertPermission, ForbiddenError } from "@/lib/permissions";
import { getAccueilAdminClient } from "@/lib/accueil-server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Body {
  sale_id: string; // ligne caution d'origine
  montant: number;
  notes?: string;
  ticket_key?: string;
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

    const body = (await request.json().catch(() => null)) as Body | null;
    const montant = Number(body?.montant);
    if (!body?.sale_id || !Number.isFinite(montant) || montant <= 0) {
      return NextResponse.json({ success: false, error: "sale_id et montant > 0 requis" }, { status: 400 });
    }

    const admin = getAccueilAdminClient();

    // Idempotence (CAI-05).
    const ticketKey = body.ticket_key && UUID_RE.test(body.ticket_key) ? body.ticket_key : null;
    if (ticketKey) {
      const { data: existing } = await admin
        .from("quick_sales")
        .select("id, reference, montant_total")
        .eq("ticket_key", ticketKey)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ success: true, remboursement: existing, replayed: true });
      }
    }

    // Session ouverte obligatoire (sortie d'espèces du tiroir).
    const { data: session } = await admin
      .from("caisse_sessions")
      .select("id")
      .eq("agent_id", user.id)
      .eq("status", "ouverte")
      .maybeSingle();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Caisse non ouverte : ouvrez votre session avant de rembourser" },
        { status: 409 }
      );
    }

    // Caution d'origine + borne (lecture fraîche des remboursements liés).
    const { data: original } = await admin
      .from("quick_sales")
      .select("id, reference, montant_total, nature, client_nom, client_record_id, demande_id")
      .eq("id", body.sale_id)
      .single();
    if (!original || (original as { nature: string }).nature !== "caution") {
      return NextResponse.json(
        { success: false, error: "La ligne d'origine n'est pas une caution" },
        { status: 400 }
      );
    }
    const orig = original as {
      id: string;
      reference: string | null;
      montant_total: number;
      client_nom: string | null;
      client_record_id: string | null;
      demande_id: string | null;
    };

    const { data: refunds } = await admin
      .from("quick_sales")
      .select("montant_total")
      .eq("caution_ref", orig.id)
      .eq("nature", "caution_remboursement");
    const dejaRembourse = ((refunds || []) as { montant_total: number }[]).reduce(
      (s, r) => s + Number(r.montant_total),
      0
    );
    const remboursable = Number(orig.montant_total) - dejaRembourse;
    if (montant > remboursable) {
      return NextResponse.json(
        {
          success: false,
          error: `Montant (${montant}) supérieur au remboursable (${remboursable} — caution ${orig.montant_total}, déjà remboursé ${dejaRembourse})`,
        },
        { status: 400 }
      );
    }

    const { data: created, error: insertError } = await admin
      .from("quick_sales")
      .insert({
        type_service: "autre" as const,
        nature: "caution_remboursement",
        caution_ref: orig.id,
        description: `Remboursement caution ${orig.reference || orig.id.slice(0, 8)}${body.notes?.trim() ? ` — ${body.notes.trim()}` : ""}`,
        quantite: 1,
        prix_unitaire: montant,
        montant_total: montant,
        devise: "XAF",
        mode_paiement: "especes",
        client_record_id: orig.client_record_id,
        client_nom: orig.client_nom,
        demande_id: orig.demande_id,
        agent_id: user.id,
        created_by: user.id,
        is_test: Boolean(actorRow?.is_test),
        ticket_key: ticketKey,
        ligne_index: ticketKey ? 0 : null,
      })
      .select("id, reference, montant_total, date_paiement")
      .single();
    if (insertError || !created) {
      console.error("[CAUTION] insert error:", insertError?.message);
      return NextResponse.json({ success: false, error: insertError?.message || "Échec" }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: actorRow?.role || "",
      action: "pos.caution_remboursee",
      entityType: "quick_sales",
      entityId: (created as { id: string }).id,
      oldValue: { caution: orig.id, montant_caution: orig.montant_total, deja_rembourse: dejaRembourse },
      newValue: { montant, session_id: (session as { id: string }).id, notes: body.notes?.trim() || null },
    });

    return NextResponse.json({ success: true, remboursement: created, remboursable_restant: remboursable - montant });
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ success: false, error: err.message }, { status: err.status });
    }
    console.error("[CAUTION] POST EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
