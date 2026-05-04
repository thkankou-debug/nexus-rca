// ============================================================================
// lib/payments/rules.ts — State machine + validation des transitions
//
// Source de vérité côté code, miroir du trigger SQL `payments_check_transition`.
// Toute transition refusée ici DOIT aussi être refusée par le trigger DB.
// ============================================================================

import type {
  PaymentMethod,
  PaymentStatus,
  Payment,
} from "@/types/payments";
import {
  isTerminalStatus,
  isOfflineMethod,
} from "./types";

// ─── Transitions autorisées (matrice fixe) ─────────────────────────────────

/**
 * Pour chaque état source, liste des états cibles autorisés.
 * Ne pas modifier sans mettre à jour le trigger SQL en synchro.
 */
const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  pending: ["paid", "failed", "voided"],
  paid: ["validated", "refunded", "voided"],
  failed: ["pending"], // retry possible
  validated: ["refunded", "voided"], // états posts-validation rares
  refunded: [], // terminal
  voided: [],   // terminal
};

export class TransitionError extends Error {
  status = 400;
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "TransitionError";
    this.code = code;
  }
}

/**
 * Vérifie qu'une transition de statut est autorisée par le state machine.
 * Throw TransitionError si interdite.
 */
export function validateTransition(
  from: PaymentStatus,
  to: PaymentStatus
): void {
  if (from === to) return; // pas de changement, OK
  const allowed = ALLOWED_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new TransitionError(
      `Transition ${from} → ${to} forbidden. Allowed: ${allowed.join(", ") || "(none, terminal state)"}`,
      "INVALID_TRANSITION"
    );
  }
}

/**
 * Renvoie les transitions autorisées depuis un statut donné (utile pour l'UI).
 */
export function getAllowedTransitions(from: PaymentStatus): PaymentStatus[] {
  return ALLOWED_TRANSITIONS[from] ?? [];
}

// ─── Règles d'invariant à la création ──────────────────────────────────────

export interface ValidatePaymentForCreate {
  client_id: string;
  dossier_id: string;
  service: string;
  method: PaymentMethod;
  amount: number;
  amount_xaf: number;
  currency: string;
  created_by: string;
}

/**
 * Validate input avant INSERT. Throw TransitionError si invalide.
 */
export function validateCreateInput(input: ValidatePaymentForCreate): void {
  if (!input.client_id) {
    throw new TransitionError("client_id is required", "MISSING_CLIENT_ID");
  }
  if (!input.dossier_id) {
    throw new TransitionError("dossier_id is required", "MISSING_DOSSIER_ID");
  }
  if (!input.service?.trim()) {
    throw new TransitionError("service is required", "MISSING_SERVICE");
  }
  if (!input.method) {
    throw new TransitionError("method is required", "MISSING_METHOD");
  }
  if (!input.created_by) {
    throw new TransitionError("created_by is required", "MISSING_CREATOR");
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new TransitionError("amount must be positive", "INVALID_AMOUNT");
  }
  if (!Number.isFinite(input.amount_xaf) || input.amount_xaf <= 0) {
    throw new TransitionError(
      "amount_xaf must be positive",
      "INVALID_AMOUNT_XAF"
    );
  }
  if (!input.currency?.trim()) {
    throw new TransitionError("currency is required", "MISSING_CURRENCY");
  }
}

// ─── Règles d'invariant à la validation ────────────────────────────────────

/**
 * Vérifie qu'un paiement peut être validé (status: paid → validated).
 * - Le paiement doit être en status='paid'
 * - L'opération exige une méthode offline (cash, OM, virement, MTN)
 *   → les paiements stripe sont déjà "validés" automatiquement par le webhook
 *     et n'ont pas besoin de cette étape. On rejette l'appel pour éviter
 *     toute confusion d'audit.
 * - Le validateur doit être ≠ du créateur (séparation des pouvoirs)
 */
export function validateValidationStep(args: {
  payment: Pick<Payment, "status" | "method" | "created_by">;
  validator_id: string;
}): void {
  const { payment, validator_id } = args;

  if (payment.status !== "paid") {
    throw new TransitionError(
      `Cannot validate payment in status '${payment.status}'. Only 'paid' is validatable.`,
      "INVALID_STATUS_FOR_VALIDATION"
    );
  }
  if (!payment.method) {
    throw new TransitionError(
      "Payment has no method set; refuse validation",
      "MISSING_METHOD"
    );
  }
  if (!isOfflineMethod(payment.method)) {
    throw new TransitionError(
      `Validation step is only required for offline methods. '${payment.method}' is online and is auto-validated by webhook.`,
      "STRIPE_NEEDS_NO_VALIDATION"
    );
  }
  if (validator_id === payment.created_by) {
    throw new TransitionError(
      "Self-validation forbidden: validator must differ from creator",
      "SELF_VALIDATION_FORBIDDEN"
    );
  }
}

// ─── Règles d'invariant pour le void ───────────────────────────────────────

export function validateVoidStep(args: {
  payment: Pick<Payment, "status">;
}): void {
  const { payment } = args;
  if (payment.status === null) {
    // legacy row sans status ; OK on autorise le void
    return;
  }
  if (isTerminalStatus(payment.status)) {
    throw new TransitionError(
      `Cannot void payment in terminal status '${payment.status}'`,
      "ALREADY_TERMINAL"
    );
  }
}

// ─── Helpers UI : actions disponibles selon le statut ──────────────────────

export interface AvailableActions {
  canPay: boolean;        // bouton "Payer maintenant" (Stripe checkout)
  canValidate: boolean;   // bouton "Valider" (admin pour cash/OM)
  canRefund: boolean;     // bouton "Rembourser" (super_admin)
  canVoid: boolean;       // bouton "Annuler"
  canRetry: boolean;      // bouton "Réessayer" (failed → pending)
}

export function getAvailableActions(payment: {
  status: PaymentStatus | null;
  method: PaymentMethod | null;
}): AvailableActions {
  const status = payment.status ?? "pending";
  const method = payment.method;

  return {
    canPay: status === "pending" && method === "stripe",
    canValidate:
      status === "paid" && method !== null && isOfflineMethod(method),
    canRefund: status === "paid" || status === "validated",
    canVoid: !isTerminalStatus(status) && status !== null,
    canRetry: status === "failed",
  };
}
