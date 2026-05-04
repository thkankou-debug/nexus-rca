// ============================================================================
// POST /api/payments/[id]/validate
//
// Marque un paiement comme validé (status='validated'). Pour les paiements
// orange_money/cash où le client a payé hors site et un admin confirme la
// réception. Pour stripe, la validation est automatique via le webhook —
// inutile d'appeler cette route.
//
// Auth : admin+
// Règle : un agent ne peut pas valider ses propres paiements (le trigger DB
//         payments_check_transition l'enforce, mais on retourne un 403 propre).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canValidate } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !canValidate(profile.role)) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  // Charger le paiement
  const { data: payment } = await supabase
    .from("payments")
    .select("id, status, method, created_by")
    .eq("id", params.id)
    .maybeSingle();

  if (!payment) return NextResponse.json({ error: "Paiement introuvable" }, { status: 404 });

  // Validator ≠ creator (séparation des pouvoirs)
  if (payment.created_by === user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas valider un paiement que vous avez créé" },
      { status: 403 }
    );
  }

  // Stripe est validé automatiquement par le webhook
  if (payment.method === "stripe") {
    return NextResponse.json(
      { error: "Les paiements Stripe sont validés automatiquement par le webhook" },
      { status: 400 }
    );
  }

  // Update
  const now = new Date().toISOString();
  const { error: updateErr } = await supabase
    .from("payments")
    .update({
      status: "validated",
      validated_by: user.id,
      validated_at: now,
      paid_at: now,
      statut: "paye", // mirror legacy
      montant_recu: undefined, // pas modifié ici, laissé à l'existant
    })
    .eq("id", params.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: params.id, status: "validated" });
}
