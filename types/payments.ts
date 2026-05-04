// ============================================================================
// Types unifiés du système de paiement
// Mirror exact du schéma DB après migration 003_payments_unified.sql
// ============================================================================

/**
 * Méthodes de paiement supportées dans le système unifié.
 *
 * Note : l'enum DB `payment_method` contient aussi des valeurs legacy
 * (especes, virement, mobile_money, carte, western_union, moneygram, cheque,
 * autre) conservées pour compat ascendante. Le nouveau code n'utilise QUE
 * les 5 valeurs canoniques ci-dessous.
 */
export type PaymentMethod =
  | "stripe"          // Carte internationale via Stripe Checkout
  | "orange_money"    // Mobile money local
  | "mtn_money"       // Mobile money local (alternatif)
  | "cash"            // Espèces en agence
  | "bank_transfer";  // Virement bancaire (cas exceptionnels)

/**
 * Statuts du cycle de vie unifié.
 *
 * Transitions autorisées (cf. lib/payments/rules.ts) :
 *   pending → paid                      (Stripe webhook OU admin valide cash/OM)
 *   pending → failed                    (Stripe failure)
 *   pending → voided                    (admin annule un paiement jamais payé)
 *   paid    → validated                 (admin valide cash/OM offline)
 *   paid    → refunded                  (super_admin via Stripe API)
 *   paid    → voided                    (super_admin uniquement)
 *   failed  → pending                   (retry possible)
 *
 * États terminaux : refunded, voided. Pas de retour possible.
 */
export type PaymentStatus =
  | "pending"     // Créé, attente de paiement
  | "paid"        // Payé (Stripe confirmé OU agent a déclaré OM/cash)
  | "failed"      // Échec côté processeur
  | "validated"   // Validé par admin (obligatoire pour cash/OM, optionnel pour stripe)
  | "refunded"    // Remboursé via Stripe ou registre
  | "voided";     // Annulé administrativement

/**
 * Modèle métier d'un paiement, mirror direct de la table `payments`
 * post-migration 003.
 */
export interface Payment {
  id: string;
  reference: string;             // ex : NX-PAY-A1B2C3D4

  // Liens fonctionnels (NOT NULL pour nouveaux paiements)
  client_id: string | null;      // legacy rows peuvent être null
  dossier_id: string | null;     // legacy rows peuvent être null (= demande_id)
  service: string;

  // Assignation
  created_by: string;            // agent / admin / super_admin qui a créé
  validated_by: string | null;   // admin+ qui a validé cash/OM (≠ created_by)
  validated_at: string | null;

  // Cycle de vie
  method: PaymentMethod | null;  // legacy rows : null possible
  status: PaymentStatus | null;  // legacy rows : null possible

  // Montants
  amount: number | null;         // legacy : null
  currency: string | null;       // ISO 4217, ex 'XAF', 'EUR', 'USD'
  amount_xaf: number | null;     // équivalent FCFA gelé à la création

  // Références externes (UNIQUE quand non-null)
  stripe_session_id: string | null;
  stripe_payment_id: string | null;
  om_transaction_id: string | null;
  cash_receipt_no: string | null;

  // Description & contexte
  description: string | null;
  notes_internes: string | null;
  metadata: Record<string, unknown>;

  // Timestamps
  created_at: string;
  paid_at: string | null;
  voided_at: string | null;
  updated_at: string;

  // ─── Champs legacy (conservés pour compat 26 fichiers consumers) ────────
  // À retirer après refactor des consumers (migration 004).
  client_nom?: string | null;
  client_email?: string | null;
  client_telephone?: string | null;
  agent_id?: string | null;
  demande_id?: string | null;
  client_record_id?: string | null;
  montant_total?: number | null;
  montant_recu?: number | null;
  devise?: string | null;
  mode_paiement?: string | null;
  statut?: string | null;
  date_paiement?: string | null;
  preuve_path?: string | null;
  preuve_nom?: string | null;
}

/**
 * Événement du cycle de vie d'un paiement (audit log immuable).
 */
export type PaymentEventType =
  | "created"
  | "paid"
  | "failed"
  | "validated"
  | "refunded"
  | "voided"
  | "note_updated";

export interface PaymentEvent {
  id: string;
  payment_id: string;
  event_type: PaymentEventType;
  from_status: PaymentStatus | null;
  to_status: PaymentStatus | null;
  actor_id: string | null;       // null si webhook/system
  actor_kind: "user" | "webhook" | "system";
  payload: Record<string, unknown>;
  created_at: string;
}

/**
 * Log d'idempotence des webhooks Stripe.
 */
export interface StripeWebhookLog {
  id: string;                    // = stripe event id (evt_xxx)
  event_type: string;            // ex : checkout.session.completed
  payload: Record<string, unknown>;
  processed: boolean;
  processed_at: string | null;
  error: string | null;
  created_at: string;
}

// ─── Helpers de saisie (DTO pour create) ───────────────────────────────────

/**
 * Payload accepté par la route POST /api/payments/create.
 * Tous les champs sont obligatoires sauf description et metadata.
 */
export interface CreatePaymentInput {
  client_id: string;
  dossier_id: string;
  service: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  amount_xaf: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Payload pour POST /api/payments/[id]/validate.
 * Utilisé pour cash + orange_money (validation admin offline).
 */
export interface ValidatePaymentInput {
  payment_id: string;
  notes?: string;
}
