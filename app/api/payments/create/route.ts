// ============================================================================
// POST /api/payments/create
//
// Crée un paiement (toutes méthodes). Si method=stripe, retourne aussi
// l'URL de Checkout Session. Pour orange_money/cash, le client paie hors
// site et un admin valide ensuite via /api/payments/[id]/validate.
//
// Auth : agent+ (RLS Supabase fait le filet final)
// Body : { client_id, dossier_id, service, method, amount, currency?, description? }
// Renvoie : { id, reference, status, checkout_url? }
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  canCreate,
  generateReference,
  createStripeCheckout,
  type CreatePaymentInput,
  type PaymentMethod,
} from "@/lib/payments";

export const dynamic = "force-dynamic";

const VALID_METHODS: PaymentMethod[] = ["stripe", "orange_money", "cash"];

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !canCreate(profile.role)) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  // Validation body
  const body = (await request.json().catch(() => ({}))) as Partial<CreatePaymentInput>;
  if (!body.client_id || !body.dossier_id || !body.service || !body.method) {
    return NextResponse.json(
      { error: "client_id, dossier_id, service, method requis" },
      { status: 400 }
    );
  }
  if (!VALID_METHODS.includes(body.method)) {
    return NextResponse.json(
      { error: `Méthode invalide. Doit être : ${VALID_METHODS.join(", ")}` },
      { status: 400 }
    );
  }
  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ error: "Montant doit être positif" }, { status: 400 });
  }

  const currency = (body.currency || "XAF").toUpperCase();

  // Vérifie que le client et le dossier existent
  const [{ data: client }, { data: dossier }] = await Promise.all([
    supabase.from("profiles").select("id, email").eq("id", body.client_id).maybeSingle(),
    supabase.from("demandes").select("id").eq("id", body.dossier_id).maybeSingle(),
  ]);
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  if (!dossier) return NextResponse.json({ error: "Dossier introuvable" }, { status: 404 });

  // Insertion
  const id = crypto.randomUUID();
  const reference = generateReference(id);

  const { error: insertErr } = await supabase
    .from("payments")
    .insert({
      id,
      reference,
      client_id: body.client_id,
      dossier_id: body.dossier_id,
      demande_id: body.dossier_id, // mirror legacy column
      service: body.service,
      method: body.method,
      status: "pending",
      amount: body.amount,
      amount_xaf: body.amount, // simple : pas de conversion devise pour l'instant
      currency,
      devise: currency, // mirror legacy
      montant_total: body.amount, // mirror legacy
      mode_paiement: legacyMethod(body.method), // mirror legacy
      statut: "non_paye", // mirror legacy
      description: body.description ?? null,
      created_by: user.id,
    });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Si Stripe : créer la Checkout Session
  let checkout_url: string | null = null;
  if (body.method === "stripe") {
    try {
      checkout_url = await createStripeCheckout({
        payment_id: id,
        reference,
        amount: body.amount,
        currency,
        description: body.description || `Paiement Nexus RCA — ${body.service}`,
        client_email: client.email,
        app_url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      });
      // Stocker la session_id (juste informatif, le webhook utilise metadata.payment_id)
      await supabase
        .from("payments")
        .update({ stripe_session_id: checkout_url.split("/").pop() ?? null })
        .eq("id", id);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stripe error";
      return NextResponse.json(
        { error: `Erreur Stripe : ${message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { id, reference, status: "pending", method: body.method, checkout_url },
    { status: 201 }
  );
}

// Mapping méthode unifiée → enum legacy mode_paiement (pour compat 26 consumers)
function legacyMethod(method: PaymentMethod): string {
  switch (method) {
    case "cash": return "especes";
    case "orange_money": return "mobile_money";
    case "stripe": return "carte";
  }
}
