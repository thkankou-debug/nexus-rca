// ============================================================================
// lib/supabase/service.ts — Client Supabase avec service_role
//
// ⚠ Ne JAMAIS importer depuis un Client Component.
// Bypasse RLS — réservé aux contextes système : webhooks, jobs CRON,
// migrations programmatiques, scripts admin.
// ============================================================================

import { createClient as createBaseClient, type SupabaseClient } from "@supabase/supabase-js";

// Pas de Database type généré dans ce projet → on type le client en `any`
// pour permettre les `.from()` arbitraires depuis les webhooks/jobs.
// Le typage stricte des lignes vient des types métier (lib/payments/types.ts)
// qui sont appliqués manuellement à la sortie des queries.
type ServiceClient = SupabaseClient<any, "public", any>;

let _serviceClient: ServiceClient | null = null;

/**
 * Crée (ou retourne le singleton) un client Supabase avec service_role.
 * Bypass total des RLS policies.
 *
 * Throw si SUPABASE_SERVICE_ROLE_KEY est manquant.
 */
export function createServiceClient(): ServiceClient {
  if (_serviceClient) return _serviceClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase service client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  _serviceClient = createBaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "x-supabase-context": "service-role",
      },
    },
  });

  return _serviceClient;
}
