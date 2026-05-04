// ============================================================================
// lib/payments/rbac.ts — Permissions paiement par rôle
//
// Source de vérité côté code, miroir des RLS policies SQL `payments_*`.
// Chaque helper renvoie un boolean — pas de side effects, pas d'I/O.
// ============================================================================

import type { UserRole } from "@/types";
import type { Payment } from "@/types/payments";
import { roleAtLeast } from "@/lib/rbac";

// ─── Création ──────────────────────────────────────────────────────────────

/**
 * Qui peut créer un paiement : staff ≥ agent.
 */
export function canCreatePayment(role: UserRole): boolean {
  return roleAtLeast(role, "agent");
}

// ─── Validation (cash + OM uniquement, séparation des pouvoirs) ────────────

/**
 * Qui peut valider un paiement offline (cash, OM, MTN, virement).
 * Règles :
 *  - Rôle ≥ admin
 *  - validator ≠ creator (un agent ne valide jamais ses propres encaissements,
 *    même si promu admin entre temps)
 */
export function canValidatePayment(args: {
  role: UserRole;
  userId: string;
  payment: Pick<Payment, "created_by">;
}): boolean {
  const { role, userId, payment } = args;
  if (!roleAtLeast(role, "admin")) return false;
  if (payment.created_by === userId) return false; // self-validation interdite
  return true;
}

// ─── Refund (Stripe) ───────────────────────────────────────────────────────

/**
 * Qui peut initier un remboursement Stripe : super_admin uniquement.
 * Le refund est une action sensible : impact financier irréversible.
 */
export function canRefundPayment(role: UserRole): boolean {
  return role === "super_admin";
}

// ─── Void (annulation administrative) ──────────────────────────────────────

/**
 * Qui peut annuler administrativement un paiement : super_admin uniquement.
 * Différent du refund : pas d'opération côté processeur, juste un état DB.
 */
export function canVoidPayment(role: UserRole): boolean {
  return role === "super_admin";
}

// ─── Lecture ───────────────────────────────────────────────────────────────

/**
 * Qui peut lire un paiement donné, en miroir de la RLS policy `payments_select`.
 * Utilisé côté API pour 403 explicite avant query (perf + UX).
 */
export function canReadPayment(args: {
  role: UserRole;
  userId: string;
  payment: Pick<Payment, "client_id" | "created_by"> & {
    dossier_agent_id?: string | null;
  };
}): boolean {
  const { role, userId, payment } = args;

  // Staff ≥ admin : tout
  if (roleAtLeast(role, "admin")) return true;

  // Agent : ses créations OU paiements de ses dossiers
  if (role === "agent") {
    if (payment.created_by === userId) return true;
    if (payment.dossier_agent_id === userId) return true;
    return false;
  }

  // Client : ses propres paiements
  if (role === "client") {
    return payment.client_id === userId;
  }

  return false;
}

// ─── Édition de notes (champ libre, pas le statut) ─────────────────────────

/**
 * Qui peut modifier le champ `notes_internes` d'un paiement.
 * - L'agent qui a créé peut éditer ses notes
 * - Admin/super_admin peuvent éditer toutes les notes
 * - Le client ne peut JAMAIS éditer
 */
export function canEditPaymentNotes(args: {
  role: UserRole;
  userId: string;
  payment: Pick<Payment, "created_by">;
}): boolean {
  const { role, userId, payment } = args;
  if (roleAtLeast(role, "admin")) return true;
  if (role === "agent" && payment.created_by === userId) return true;
  return false;
}

// ─── Paiement par le client (Stripe checkout) ──────────────────────────────

/**
 * Qui peut "payer" un paiement (déclencher le checkout Stripe) :
 * uniquement le client à qui ce paiement est rattaché, et seulement s'il
 * est encore en status='pending'.
 */
export function canPayPayment(args: {
  role: UserRole;
  userId: string;
  payment: Pick<Payment, "client_id" | "status" | "method">;
}): boolean {
  const { role, userId, payment } = args;
  if (role !== "client") return false;
  if (payment.client_id !== userId) return false;
  if (payment.status !== "pending") return false;
  if (payment.method !== "stripe") return false;
  return true;
}
