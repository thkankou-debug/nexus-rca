// ============================================================================
// lib/payments.ts — Système de paiement unifié simple
//
// Modèle :
//   - 1 table `payments` (DB existante, étendue avec les colonnes new)
//   - 3 méthodes : stripe / orange_money / cash
//   - 3 statuts  : pending / paid / validated
//   - Permissions : agent crée · admin valide · super_admin tout
//
// Pas de state machine, pas d'audit log app-level, pas d'idempotency
// avancée. Le strict minimum pour un système qui marche.
// ============================================================================

import Stripe from "stripe";
import type { UserRole } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────

export type PaymentMethod = "stripe" | "orange_money" | "cash";
export type PaymentStatus = "pending" | "paid" | "validated";

export interface CreatePaymentInput {
  client_id: string;
  dossier_id: string;
  service: string;
  method: PaymentMethod;
  amount: number;
  currency?: string;
  description?: string;
}

// ─── Permissions ──────────────────────────────────────────────────────────

export function canCreate(role: UserRole): boolean {
  return role === "agent" || role === "admin" || role === "super_admin";
}

export function canValidate(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

// ─── Référence ────────────────────────────────────────────────────────────

export function generateReference(uuid: string): string {
  return `NX-PAY-${uuid.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

// ─── Stripe ───────────────────────────────────────────────────────────────

let _stripe: Stripe | null = null;

function stripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  return _stripe;
}

/**
 * Crée une Checkout Session Stripe et retourne l'URL.
 * Le payment_id est passé en metadata pour que le webhook puisse retrouver
 * la ligne DB.
 */
export async function createStripeCheckout(args: {
  payment_id: string;
  reference: string;
  amount: number;          // dans la devise affichée
  currency: string;        // ISO 4217 (XAF, EUR, USD)
  description: string;
  client_email: string;
  app_url: string;
}): Promise<string> {
  // Stripe veut le montant en plus petite unité ; XAF n'a pas de subdivision
  const noSub = ["XAF", "XOF", "JPY", "KRW", "VND"];
  const unitAmount = noSub.includes(args.currency.toUpperCase())
    ? Math.round(args.amount)
    : Math.round(args.amount * 100);

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: args.client_email,
    client_reference_id: args.reference,
    line_items: [
      {
        price_data: {
          currency: args.currency.toLowerCase(),
          product_data: { name: args.description },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    success_url: `${args.app_url}/payer/${args.reference}/success`,
    cancel_url: `${args.app_url}/payer/${args.reference}/cancelled`,
    metadata: { payment_id: args.payment_id },
  });

  if (!session.url) throw new Error("Stripe returned no checkout URL");
  return session.url;
}

/**
 * Vérifie la signature d'un webhook Stripe et renvoie l'événement parsé.
 * Throw si signature invalide ou STRIPE_WEBHOOK_SECRET manquant.
 */
export function verifyStripeWebhook(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET missing");
  return stripe().webhooks.constructEvent(rawBody, signature, secret);
}
