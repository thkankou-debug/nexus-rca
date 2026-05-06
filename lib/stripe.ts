import Stripe from "stripe";

// ────────────────────────────────────────────────────────────────────────────
// Stripe SDK helper.
// Variables d'env requises (Vercel Settings → Environment Variables) :
//   - STRIPE_SECRET_KEY      (sk_test_... ou sk_live_...)
//   - STRIPE_WEBHOOK_SECRET  (whsec_... pour vérifier les webhooks)
// ────────────────────────────────────────────────────────────────────────────

let cachedStripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cachedStripe) return cachedStripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY n'est pas configurée");
  }
  cachedStripe = new Stripe(key);
  return cachedStripe;
}

// ─── Devises zero-decimal (pas de centimes côté Stripe) ────────────────────
// https://stripe.com/docs/currencies#zero-decimal
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF",
  "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

/** Convertit un montant en unités Stripe selon la devise.
 *  XAF/XOF = entier (pas de centimes), EUR/USD/CAD = centimes.
 */
export function toStripeAmount(amount: number, currency: string): number {
  const upper = currency.toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(upper)) {
    return Math.round(amount);
  }
  return Math.round(amount * 100);
}

/** Vérifie qu'une devise est supportée par Stripe (filtre liste interne Nexus). */
export const SUPPORTED_CURRENCIES = ["XAF", "EUR", "USD", "CAD"];

export function isSupportedCurrency(currency: string): boolean {
  return SUPPORTED_CURRENCIES.includes(currency.toUpperCase());
}
