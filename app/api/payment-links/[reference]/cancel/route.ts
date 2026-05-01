import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// API : POST /api/payment-links/[reference]/cancel
// 
// Le STAFF annule un lien de paiement.
// Body : { reason?: string }
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    const supabase = createClient();
    const reference = params.reference;

    // Auth staff
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (!profile || !["agent", "admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Permission refusée" },
        { status: 403 }
      );
    }

    // Récupération
    const { data: paymentLink } = await supabase
      .from("payment_links")
      .select("*")
      .eq("reference", reference)
      .single();

    if (!paymentLink) {
      return NextResponse.json(
        { error: "Lien introuvable" },
        { status: 404 }
      );
    }

    if (paymentLink.statut === "verifie") {
      return NextResponse.json(
        { error: "Impossible d'annuler un paiement déjà vérifié" },
        { status: 400 }
      );
    }

    if (paymentLink.statut === "annule") {
      return NextResponse.json(
        { error: "Ce lien est déjà annulé" },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const reason = (body.reason || "").trim();

    const newNotes = [
      paymentLink.notes_staff || "",
      reason ? `Annulé : ${reason}` : "Annulé par staff",
    ]
      .filter(Boolean)
      .join("\n");

    const { error: updateError } = await supabase
      .from("payment_links")
      .update({
        statut: "annule",
        notes_staff: newNotes,
      })
      .eq("reference", reference);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Erreur" },
        { status: 500 }
      );
    }

    console.log(
      `[NEXUS PAY-LINK] Lien annulé : ${reference} par ${profile.id}`
    );

    return NextResponse.json({
      success: true,
      reference,
      statut: "annule",
    });
  } catch (err) {
    console.error("Erreur API cancel:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
