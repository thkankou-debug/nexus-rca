// ============================================================================
// lib/payments/index.ts — API publique du module paiement unifié
// ============================================================================

// Types
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

// Constantes & catégories
export {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  TERMINAL_STATUSES,
  isOnlineMethod,
  isOfflineMethod,
  isTerminalStatus,
  isCollected,
  requiresAdminValidation,
} from "./types";

// State machine + validation
export {
  TransitionError,
  validateTransition,
  getAllowedTransitions,
  validateCreateInput,
  validateValidationStep,
  validateVoidStep,
  getAvailableActions,
  type AvailableActions,
  type ValidatePaymentForCreate,
} from "./rules";

// RBAC
export {
  canCreatePayment,
  canValidatePayment,
  canRefundPayment,
  canVoidPayment,
  canReadPayment,
  canEditPaymentNotes,
  canPayPayment,
} from "./rbac";

// ─── Helpers de conversion référence ───────────────────────────────────────

/**
 * Génère une référence paiement : NX-PAY-XXXXXXXX (basé sur les 8 premiers
 * caractères d'un UUID v4).
 */
export function generatePaymentReference(uuid: string): string {
  return `NX-PAY-${uuid.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

// ─── Helpers de format (UI) ────────────────────────────────────────────────

/**
 * Formate un montant en chaîne lisible avec devise.
 *   formatPaymentAmount(150000, "XAF") → "150 000 XAF"
 *   formatPaymentAmount(99.5, "EUR")   → "99,50 EUR"
 */
export function formatPaymentAmount(amount: number, currency: string): string {
  const isInteger = Number.isInteger(amount);
  const formatted = amount.toLocaleString("fr-FR", {
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}
