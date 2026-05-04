// ============================================================================
// lib/payments/types.ts — Re-exports + constantes
// ============================================================================

export type {
  PaymentMethod,
  PaymentStatus,
  Payment,
  PaymentEvent,
  PaymentEventType,
  StripeWebhookLog,
  CreatePaymentInput,
  ValidatePaymentInput,
} from "@/types/payments";

import type { PaymentMethod, PaymentStatus } from "@/types/payments";

// ─── Méthodes de paiement : labels & catégories ────────────────────────────

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: "Carte bancaire (Stripe)",
  orange_money: "Orange Money",
  mtn_money: "MTN Mobile Money",
  cash: "Espèces",
  bank_transfer: "Virement bancaire",
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  "stripe",
  "orange_money",
  "mtn_money",
  "cash",
  "bank_transfer",
];

/**
 * Catégorie d'une méthode :
 *  - "online"  = paiement effectué hors agence, status passe directement à 'paid' via webhook
 *  - "offline" = paiement physique/manuel, exige validation admin (status=paid → validated)
 */
export type PaymentMethodCategory = "online" | "offline";

export const METHOD_CATEGORY: Record<PaymentMethod, PaymentMethodCategory> = {
  stripe: "online",
  orange_money: "offline",  // OM intégration future = online ; pour l'instant offline
  mtn_money: "offline",
  cash: "offline",
  bank_transfer: "offline",
};

export function isOnlineMethod(method: PaymentMethod): boolean {
  return METHOD_CATEGORY[method] === "online";
}

export function isOfflineMethod(method: PaymentMethod): boolean {
  return METHOD_CATEGORY[method] === "offline";
}

/**
 * Méthodes qui exigent une validation admin avant d'être considérées
 * comme définitivement encaissées. Utilisé par l'UI pour afficher la
 * file "à valider".
 */
export function requiresAdminValidation(method: PaymentMethod): boolean {
  return isOfflineMethod(method);
}

// ─── Statuts : labels & catégories ─────────────────────────────────────────

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "En attente",
  paid: "Payé",
  failed: "Échec",
  validated: "Validé",
  refunded: "Remboursé",
  voided: "Annulé",
};

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "validated",
  "refunded",
  "voided",
];

/**
 * Statuts terminaux : aucune transition n'est plus possible.
 */
export const TERMINAL_STATUSES: PaymentStatus[] = ["refunded", "voided"];

export function isTerminalStatus(status: PaymentStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

/**
 * Statuts considérés comme "encaissé effectif" (cash/OM validé OU stripe paid).
 * Utilisé pour le calcul des KPIs financiers.
 */
export function isCollected(status: PaymentStatus): boolean {
  return status === "paid" || status === "validated";
}
