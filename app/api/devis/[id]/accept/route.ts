// ============================================================================
// API ROUTE — POST /api/devis/:id/accept
// P9, Lot 1. Acceptation d'un devis PAR LE CLIENT lui-même (distinct de
// /api/devis/[id]/status, réservée au staff pour rapporter une décision
// client transmise hors ligne — voir ce fichier).
//
// L'acceptation n'est pas un booléen : elle fige un instantané du devis
// (montant, devise, lignes) dans audit_log, avec horodatage, identité de
// l'acceptant et IP. Un devis accepté ne peut plus être modifié en silence
// : PATCH /api/devis/[id] refuse déjà toute modification hors status
// "brouillon", donc "envoye"/"accepte" sont déjà protégés (voir ce fichier).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip");
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
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }

    const { data: actor } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = (actor as { role?: string } | null)?.role || "";

    // Cette route est réservée au client titulaire : le staff rapporte une
    // décision client via /api/devis/[id]/status (assertPermission devis.send).
    if (role !== "client") {
      return NextResponse.json(
        { success: false, error: "Réservé au client titulaire du devis" },
        { status: 403 }
      );
    }

    const admin = getAdminClient();
    const { data: devis } = await admin
      .from("devis")
      .select(
        "id, reference, status, amount, currency, valid_until, client_record_id, clients(profile_id), devis_lignes(description, quantity, unit_price, amount, ordre)"
      )
      .eq("id", params.id)
      .single();

    if (!devis) {
      return NextResponse.json({ success: false, error: "Devis introuvable" }, { status: 404 });
    }

    const devisRow = devis as unknown as {
      reference: string;
      status: string;
      amount: number;
      currency: string;
      valid_until: string | null;
      client_record_id: string | null;
      clients: { profile_id: string | null } | null;
      devis_lignes: { description: string; quantity: number; unit_price: number; amount: number; ordre: number }[];
    };

    if (devisRow.clients?.profile_id !== user.id) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 });
    }

    if (devisRow.status !== "envoye") {
      return NextResponse.json(
        { success: false, error: `Impossible d'accepter un devis au statut "${devisRow.status}"` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { error: updateError } = await admin
      .from("devis")
      .update({ status: "accepte", accepted_at: now })
      .eq("id", params.id)
      .eq("status", "envoye"); // ceinture-bretelles contre une double acceptation concurrente

    if (updateError) {
      console.error("[DEVIS_ACCEPT] update error:", updateError.message);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    await logAudit({
      userId: user.id,
      userRole: role,
      action: "devis.accepte_par_client",
      entityType: "devis",
      entityId: params.id,
      oldValue: { status: devisRow.status },
      newValue: {
        status: "accepte",
        accepted_at: now,
        snapshot: {
          reference: devisRow.reference,
          amount: devisRow.amount,
          currency: devisRow.currency,
          valid_until: devisRow.valid_until,
          lignes: [...devisRow.devis_lignes].sort((a, b) => a.ordre - b.ordre),
        },
      },
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, accepted_at: now });
  } catch (err) {
    console.error("[DEVIS_ACCEPT] EXCEPTION:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
