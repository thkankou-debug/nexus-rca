// ============================================================================
// POST /api/payments/create — Créer un paiement unifié
//
// Authentication : agent+ (assertion + RLS)
// Validation     : state machine (lib/payments/rules)
// Side effects   : si method=stripe, crée une Checkout Session et stocke
//                  stripe_session_id sur la ligne payments. Retourne checkout_url.
// ============================================================================

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  requireRole,
  toErrorResponse,
  jsonOk,
  errors,
} from "@/lib/payments/http";
import {
  validateCreateInput,
  generatePaymentReference,
  type CreatePaymentInput,
  type PaymentMethod,
} from "@/lib/payments";
import { createCheckoutSession } from "@/lib/payments/stripe";

export const dynamic = "force-dynamic";

interface CreateBody extends CreatePaymentInput {
  // alias éventuel ; aucune extension côté request
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireRole("agent");
    const supabase = createClient();

    const body = (await request.json()) as Partial<CreateBody>;

    // Validation des inputs minimaux
    if (!body.client_id || !body.dossier_id || !body.service || !body.method
        || body.amount == null || body.amount_xaf == null || !body.currency) {
      throw errors.badRequest(
        "Missing required fields: client_id, dossier_id, service, method, amount, amount_xaf, currency",
        "MISSING_FIELDS"
      );
    }

    validateCreateInput({
      client_id: body.client_id,
      dossier_id: body.dossier_id,
      service: body.service,
      method: body.method as PaymentMethod,
      amount: body.amount,
      amount_xaf: body.amount_xaf,
      currency: body.currency,
      created_by: ctx.userId,
    });

    // Vérifications référentielles légères (pour 404 explicite avant trigger SQL)
    const [{ data: client }, { data: dossier }] = await Promise.all([
      supabase.from("profiles").select("id, email").eq("id", body.client_id).maybeSingle(),
      supabase.from("demandes").select("id, client_id").eq("id", body.dossier_id).maybeSingle(),
    ]);

    if (!client) throw errors.notFound("Client");
    if (!dossier) throw errors.notFound("Dossier");

    // Génération de la référence + insertion
    const paymentId = crypto.randomUUID();
    const reference = generatePaymentReference(paymentId);

    const { data: inserted, error: insertErr } = await supabase
      .from("payments")
      .insert({
        id: paymentId,
        reference,
        client_id: body.client_id,
        dossier_id: body.dossier_id,
        service: body.service,
        method: body.method,
        status: "pending",
        amount: body.amount,
        amount_xaf: body.amount_xaf,
        currency: body.currency,
        description: body.description ?? null,
        metadata: body.metadata ?? {},
        created_by: ctx.userId,
        // Champs legacy pour compat 26 consumers (en attendant cleanup)
        demande_id: body.dossier_id,
        montant_total: body.amount,
        devise: body.currency,
        mode_paiement: legacyModeFromMethod(body.method as PaymentMethod),
        statut: "non_paye",
      })
      .select("*")
      .single();

    if (insertErr || !inserted) {
      throw errors.badRequest(
        insertErr?.message ?? "Failed to create payment",
        "INSERT_FAILED"
      );
    }

    // Si method=stripe, créer la Checkout Session et la lier au paiement
    let checkout_url: string | null = null;

    if (body.method === "stripe") {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const session = await createCheckoutSession({
        reference,
        amount: body.amount,
        currency: body.currency,
        description: body.description ?? `Paiement Nexus RCA — ${body.service}`,
        client_email: client.email,
        success_url: `${baseUrl}/payer/${reference}/success`,
        cancel_url: `${baseUrl}/payer/${reference}/cancelled`,
        payment_id: paymentId,
        client_id: body.client_id,
        dossier_id: body.dossier_id,
      });

      // Stocker session_id sur la ligne ; bypass nécessaire de la policy
      // payments_update (qui impose admin) → on utilise la même service-side
      // par created_by = self (l'agent vient de la créer). Le trigger SQL
      // empêchera tout changement de statut interdit.
      const { error: updateErr } = await supabase
        .from("payments")
        .update({
          stripe_session_id: session.session_id,
          metadata: {
            ...(inserted.metadata as Record<string, unknown> | null ?? {}),
            stripe_session_url: session.url,
          },
        })
        .eq("id", paymentId);

      if (updateErr) {
        console.error("[payments/create] Failed to attach stripe_session_id:", updateErr);
        // Non-fatal : le paiement existe, juste sans session_id stocké.
      }
      checkout_url = session.url;
    }

    return jsonOk({
      payment_id: paymentId,
      reference,
      status: "pending",
      method: body.method,
      checkout_url,
    }, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}

// ─── Helper : mapping méthode unifiée → enum legacy mode_paiement ─────────
// Conservé pour compat ascendante (les 26 consumers actuels lisent toujours
// `mode_paiement`). À retirer après refactor (migration 005).

function legacyModeFromMethod(method: PaymentMethod): string {
  switch (method) {
    case "cash":          return "especes";
    case "bank_transfer": return "virement";
    case "orange_money":
    case "mtn_money":     return "mobile_money";
    case "stripe":        return "carte";
  }
}
