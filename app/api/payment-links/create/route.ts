import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// API : POST /api/payment-links/create
// 
// Crée un lien de paiement public (réservé staff).
// Body : {
//   client_nom: string,
//   client_email: string,
//   client_telephone?: string,
//   service: string,
//   description?: string,
//   montant: number,
//   devise?: "XAF" | "EUR" | "USD" | "CAD",
//   demande_id?: string,
//   appointment_id?: string,
//   notes_staff?: string
// }
// ============================================================================

const ALLOWED_DEVISES = ["XAF", "EUR", "USD", "CAD"];

interface CreatePaymentLinkBody {
  client_nom: string;
  client_email: string;
  client_telephone?: string;
  service: string;
  description?: string;
  montant: number;
  devise?: string;
  demande_id?: string;
  appointment_id?: string;
  notes_staff?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Vérification authentification staff
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
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

    const body: CreatePaymentLinkBody = await request.json();

    // ========================================================================
    // VALIDATION
    // ========================================================================
    if (!body.client_nom?.trim() || !body.client_email?.trim() || !body.service?.trim()) {
      return NextResponse.json(
        { error: "Nom client, email et service requis" },
        { status: 400 }
      );
    }

    if (!body.montant || body.montant <= 0) {
      return NextResponse.json(
        { error: "Montant doit être positif" },
        { status: 400 }
      );
    }

    if (body.montant > 100000000) {
      return NextResponse.json(
        { error: "Montant trop élevé (max 100M)" },
        { status: 400 }
      );
    }

    const devise = (body.devise || "XAF").toUpperCase();
    if (!ALLOWED_DEVISES.includes(devise)) {
      return NextResponse.json(
        { error: `Devise invalide. Doit être : ${ALLOWED_DEVISES.join(", ")}` },
        { status: 400 }
      );
    }

    // Email validation simple
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.client_email)) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      );
    }

    // Recherche client_id par email
    let clientId: string | null = null;
    const { data: clientProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", body.client_email.trim().toLowerCase())
      .single();

    if (clientProfile) {
      clientId = clientProfile.id;
    }

    // ========================================================================
    // CRÉATION DU LIEN
    // ========================================================================
    const { data: newLink, error: insertError } = await supabase
      .from("payment_links")
      .insert({
        client_id: clientId,
        client_nom: body.client_nom.trim(),
        client_email: body.client_email.trim().toLowerCase(),
        client_telephone: body.client_telephone?.trim() || null,
        service: body.service.trim(),
        description: body.description?.trim() || null,
        montant: body.montant,
        devise,
        demande_id: body.demande_id || null,
        appointment_id: body.appointment_id || null,
        notes_staff: body.notes_staff?.trim() || null,
        statut: "en_attente",
        created_by: profile.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erreur création payment_link:", insertError);
      return NextResponse.json(
        { error: insertError.message || "Erreur création lien" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.nexusrca.com";
    const publicUrl = `${baseUrl}/payer/${newLink.reference}`;

    console.log(
      `[NEXUS PAY-LINK] Nouveau lien créé : ${newLink.reference} - ${body.client_nom} - ${body.montant} ${devise}`
    );

    return NextResponse.json(
      {
        success: true,
        payment_link: newLink,
        public_url: publicUrl,
        reference: newLink.reference,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Erreur API /api/payment-links/create:", err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
