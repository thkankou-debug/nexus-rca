// ============================================================================
// PERMISSIONS — P2 (RBAC 9 rôles)
//
// Complète lib/rbac.ts (règles pures, sans dépendance Supabase) pour les
// vérifications qui nécessitent une requête : la permission effective d'un
// rôle vit dans la table role_permissions (éditable sans déploiement), pas
// dans le code. `has_permission(perm)` côté base fait autorité ; ce fichier
// n'en est qu'un appelant côté serveur.
//
// Usage dans une route handler / server component :
//   import { assertPermission } from "@/lib/permissions";
//   await assertPermission("facture.validate");
// ============================================================================

import { createClient } from "@/lib/supabase/server";

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Interroge has_permission(perm) en base pour l'utilisateur de la session
 * courante. `super_admin` passe toujours (court-circuit côté fonction SQL).
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("has_permission", {
    perm: permission,
  });

  if (error) {
    console.error("[PERMISSIONS] has_permission RPC error:", error.message);
    return false;
  }

  return data === true;
}

/**
 * Lance une ForbiddenError (403) si la permission n'est pas accordée.
 * À appeler en première ligne d'une action mutante côté serveur — c'est la
 * garantie applicative, la RLS reste la garantie ultime.
 */
export async function assertPermission(permission: string): Promise<void> {
  if (!(await hasPermission(permission))) {
    throw new ForbiddenError(`Permission '${permission}' requise`);
  }
}
