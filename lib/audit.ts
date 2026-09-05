// ============================================================================
// AUDIT — P3
//
// Écrit dans audit_log (aucune policy UPDATE/DELETE pour aucun rôle, écriture
// service_role uniquement — voir migration 048). Best-effort : une écriture
// d'audit qui échoue ne doit jamais faire échouer l'action métier qu'elle
// journalise (même logique que l'envoi d'e-mail ailleurs dans le dépôt).
//
// Complète, ne remplace pas, les triggers DB sur tables sensibles : cet appel
// explicite capture l'intention métier (l'action), le trigger capture le
// fait brut (la ligne modifiée). Les deux sont nécessaires (§P3 audit_log).
// ============================================================================

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars manquantes");
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface AuditEntry {
  userId: string | null;
  userRole: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    const admin = getAdminClient();
    const { error } = await admin.from("audit_log").insert({
      user_id: entry.userId,
      user_role: entry.userRole,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      old_value: (entry.oldValue ?? null) as never,
      new_value: (entry.newValue ?? null) as never,
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
    });
    if (error) {
      console.error("[AUDIT] echec ecriture:", error.message);
    }
  } catch (e) {
    console.error("[AUDIT] exception:", e instanceof Error ? e.message : e);
  }
}
