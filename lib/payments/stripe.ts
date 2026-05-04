// ============================================================================
// lib/payments/stripe.ts — Wrapper Stripe (server-only)
//
// ⚠ Ne JAMAIS importer ce fichier depuis un Client Component.
// Il utilise STRIPE_SECRET_KEY (côté serveur uniquement).
// ============================================================================

import Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Lazy-init du SDK Stripe. Throw une erreur explicite si STRIPE_SECRET_KEY
 * est manquant — utile pour distinguer "Stripe non configuré" d'autres erreurs.
 */
export function getStripeClient(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new StripeNotConfiguredError(
      "STRIPE_SECRET_KEY is not set. Configure it in .env.local (see .env.example)."
    );
  }

  _stripe = new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
    appInfo: {
      name: "Nexus RCA",
      version: "1.0.0",
    },
  });

  return _stripe;
}

export class StripeNotConfiguredError extends Error {
  status = 503;
  code = "STRIPE_NOT_CONFIGURED";

  constructor(message: string) {
    super(message);
    this.name = "StripeNotConfiguredError";
  }
}

export class StripeWebhookError extends Error {
  status = 400;
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "StripeWebhookError";
    this.code = code;
  }
}

// ─── Checkout Session ──────────────────────────────────────────────────────

export interface CreateCheckoutSessionInput {
  reference: string;            // NX-PAY-XXXXXXXX, sera la metadata + client_reference_id
  amount: number;               // dans la devise affichée
  currency: string;             // ISO 4217 (XAF, EUR, USD, CAD)
  description: string;          // libellé visible côté Stripe Checkout
  client_email: string;
  success_url: string;
  cancel_url: string;
  /** Identifiants internes propagés en metadata pour le webhook */
  payment_id: string;
  client_id: string;
  dossier_id: string;
}

/**
 * Crée une Stripe Checkout Session et retourne (session_id, url).
 *
 * Notes :
 * - Stripe attend les montants en plus petite unité (cents pour USD/EUR/CAD).
 *   XAF n'a pas de subdivision (BCEAO), donc on envoie le montant entier.
 * - On expose `payment_id`, `client_id`, `dossier_id` en metadata pour que
 *   le webhook puisse retrouver l'enregistrement DB sans race condition.
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<{ session_id: string; url: string }> {
  const stripe = getStripeClient();

  const unitAmount = toStripeAmount(input.amount, input.currency);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.client_email,
    client_reference_id: input.reference,
    line_items: [
      {
        price_data: {
          currency: input.currency.toLowerCase(),
          product_data: {
            name: input.description,
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    success_url: input.success_url,
    cancel_url: input.cancel_url,
    metadata: {
      reference: input.reference,
      payment_id: input.payment_id,
      client_id: input.client_id,
      dossier_id: input.dossier_id,
    },
    payment_intent_data: {
      metadata: {
        reference: input.reference,
        payment_id: input.payment_id,
      },
    },
  });

  if (!session.url) {
    throw new Error("Stripe returned a session without a checkout URL");
  }

  return { session_id: session.id, url: session.url };
}

/**
 * Convertit un montant "humain" en plus petite unité attendue par Stripe.
 *
 *   toStripeAmount(150000, "XAF") → 150000  (pas de subdivision)
 *   toStripeAmount(99.50, "EUR")  → 9950    (centimes)
 *   toStripeAmount(100, "USD")    → 10000   (cents)
 */
function toStripeAmount(amount: number, currency: string): number {
  const noSubdivisionCurrencies = ["XAF", "XOF", "JPY", "KRW", "VND"];
  if (noSubdivisionCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

// ─── Refund ────────────────────────────────────────────────────────────────

/**
 * Effectue un remboursement Stripe sur un payment_intent.
 * `amount` optionnel : remboursement partiel possible.
 */
export async function refundStripePayment(args: {
  payment_intent_id: string;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  amount?: number;       // dans la devise originale (humain)
  currency?: string;     // requis si amount fourni
  metadata?: Record<string, string>;
}): Promise<Stripe.Refund> {
  const stripe = getStripeClient();

  const params: Stripe.RefundCreateParams = {
    payment_intent: args.payment_intent_id,
    reason: args.reason,
    metadata: args.metadata,
  };

  if (args.amount !== undefined && args.currency) {
    params.amount = toStripeAmount(args.amount, args.currency);
  }

  return await stripe.refunds.create(params);
}

// ─── Webhook signature verification ────────────────────────────────────────

/**
 * Vérifie la signature d'un webhook Stripe et retourne l'événement parsé.
 * Throw StripeWebhookError si la signature est invalide ou STRIPE_WEBHOOK_SECRET
 * n'est pas configuré.
 *
 * @param rawBody - Le corps brut de la requête (avant parsing JSON). Critical:
 *                  ne JAMAIS passer un objet déjà parsé, la signature dépend
 *                  des bytes exacts.
 * @param signature - Header `stripe-signature` de la requête.
 */
export function verifyWebhookSignature(args: {
  rawBody: string;
  signature: string | null;
}): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new StripeNotConfiguredError(
      "STRIPE_WEBHOOK_SECRET is not set. Configure it from https://dashboard.stripe.com/webhooks"
    );
  }
  if (!args.signature) {
    throw new StripeWebhookError(
      "Missing 'stripe-signature' header",
      "MISSING_SIGNATURE"
    );
  }

  const stripe = getStripeClient();
  try {
    return stripe.webhooks.constructEvent(args.rawBody, args.signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    throw new StripeWebhookError(
      `Invalid webhook signature: ${message}`,
      "INVALID_SIGNATURE"
    );
  }
}

// ─── Helper : extraire le payment_id depuis la metadata d'un événement ────

/**
 * Extrait le `payment_id` (UUID interne) depuis la metadata d'un événement
 * Stripe (checkout session ou payment intent). Utilisé par le webhook pour
 * retrouver la ligne DB à mettre à jour.
 */
export function getPaymentIdFromEvent(event: Stripe.Event): string | null {
  const obj = event.data.object as unknown as Record<string, unknown>;
  const meta = obj.metadata as Record<string, string> | null | undefined;
  return meta?.payment_id ?? null;
}

/**
 * Extrait l'ID Stripe (charge ou payment_intent) selon le type d'événement,
 * pour le stocker dans payments.stripe_payment_id.
 */
export function getStripeChargeId(event: Stripe.Event): string | null {
  const obj = event.data.object as unknown as Record<string, unknown>;
  if (event.type === "checkout.session.completed") {
    return (obj.payment_intent as string) ?? null;
  }
  if (event.type.startsWith("charge.")) {
    return (obj.id as string) ?? null;
  }
  if (event.type.startsWith("payment_intent.")) {
    return (obj.id as string) ?? null;
  }
  return null;
}
