// ============================================================================
// LIB SERVER — Factures (cahier §8-§9, 12/09/2026).
// Helpers partagés par les routes /api/factures/* : contexte authentifié,
// lecture d'une facture, total des avoirs émis, statut recalculé depuis les
// montants (jamais décrété à la main).
// ============================================================================

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const FACTURE_SUPERVISION_ROLES = ["admin", "super_admin", "daf", "comptable"];

export interface InvoiceLine {
  designation: string;
  /** Précision facultative affichée sous la désignation (facture complète). */
  description?: string;
  quantite: number;
  unite?: string;
  prix_unitaire: number;
}

export interface InvoiceRow {
  id: string;
  reference: string;
  type: "facture" | "avoir";
  parent_id: string | null;
  motif: string | null;
  client_record_id: string | null;
  client_nom: string;
  client_coordonnees: string | null;
  demande_id: string | null;
  ticket_key: string | null;
  lignes: InvoiceLine[];
  total: number;
  total_regle: number;
  echeance: string | null;
  conditions: string | null;
  status: string;
  emitted_at: string | null;
  created_by: string;
  created_at: string;
  is_test: boolean;
}

export const INVOICE_FIELDS =
  "id, reference, type, parent_id, motif, client_record_id, client_nom, client_coordonnees, demande_id, ticket_key, lignes, total, total_regle, echeance, conditions, status, emitted_at, created_by, created_at, is_test";

export function getFactureAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getFactureActor(): Promise<
  { id: string; role: string; isTest: boolean } | null
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, is_test")
    .eq("id", user.id)
    .single();
  if (!profile) return null;
  const p = profile as { id: string; role: string; is_test?: boolean };
  return { id: p.id, role: p.role, isTest: Boolean(p.is_test) };
}

/** Total des avoirs ÉMIS rattachés à une facture — ils réduisent le dû. */
export async function sumAvoirs(admin: SupabaseClient, invoiceId: string): Promise<number> {
  const { data } = await admin
    .from("invoices")
    .select("total")
    .eq("parent_id", invoiceId)
    .eq("type", "avoir")
    .not("emitted_at", "is", null);
  return (data || []).reduce((s, r) => s + Number((r as { total: number }).total), 0);
}

/** Reste dû = total − réglé − avoirs émis (jamais négatif). */
export function resteDu(total: number, totalRegle: number, avoirs: number): number {
  return Math.max(0, total - totalRegle - avoirs);
}

/**
 * Statut recalculé depuis les montants (§9 : une facture n'est « réglée »
 * que si les paiements — ou avoirs tracés — le justifient).
 */
export function statusFromAmounts(total: number, totalRegle: number, avoirs: number): string {
  if (totalRegle + avoirs >= total) {
    return totalRegle === 0 ? "annulee" : "reglee";
  }
  return totalRegle > 0 ? "partiellement_reglee" : "emise";
}
