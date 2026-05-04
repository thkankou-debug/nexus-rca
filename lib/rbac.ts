// ============================================================================
// RBAC — Source unique de vérité pour les permissions Nexus RCA
// Hiérarchie : super_admin > admin > agent > client
//
// Usage côté serveur (server components, route handlers, middleware) :
//   import { can, roleAtLeast, assertRole } from "@/lib/rbac";
// Usage côté client (composants UI) :
//   import { useRole, RequireRole } from "@/components/rbac/RoleGate";
//
// Le but de ce fichier : règles pures, zéro dépendance React/Next/Supabase.
// ============================================================================

import type { UserRole } from "@/types";

// ─── Hiérarchie des rôles ──────────────────────────────────────────────────

const ROLE_RANK: Record<UserRole, number> = {
  client: 0,
  agent: 1,
  admin: 2,
  super_admin: 3,
};

export const ROLES: UserRole[] = ["super_admin", "admin", "agent", "client"];

export function rankOf(role: UserRole): number {
  return ROLE_RANK[role];
}

export function roleAtLeast(role: UserRole, min: UserRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

// ─── Ressources & actions ──────────────────────────────────────────────────

export type Resource =
  | "profiles"
  | "roles"
  | "demandes"
  | "clients"
  | "paiements"
  | "rendez_vous"
  | "documents"
  | "services_config"
  | "analytics"
  | "caisse"
  | "rapports_mensuels"
  | "messagerie"
  | "i18n_config"
  | "audit_log"
  | "agence_settings";

/**
 * Actions verbe-style. `*.own` = lié à l'utilisateur lui-même.
 * `*.assigned` = lié via assignation (agent_id, client_id).
 */
export type Action =
  | "read.own"
  | "read.assigned"
  | "read.team"
  | "read.all"
  | "create"
  | "update.own"
  | "update.assigned"
  | "update.all"
  | "delete"
  | "assign"
  | "void"
  | "manage";

// ─── Matrice de permissions ────────────────────────────────────────────────
// Chaque cellule = liste des actions autorisées pour ce rôle sur cette ressource.
// Convention : `manage` ≡ tous droits (lecture/écriture/suppression). On le résout
// dans `can()` plutôt que de l'expanser ici, pour rester lisible.

const MATRIX: Record<Resource, Record<UserRole, Action[]>> = {
  profiles: {
    super_admin: ["manage"],
    admin: ["read.all", "update.all"], // sauf rôle admin/super_admin (validation côté code)
    agent: ["read.team", "read.own", "update.own"],
    client: ["read.own", "update.own"],
  },
  roles: {
    super_admin: ["manage"],
    admin: [],
    agent: [],
    client: [],
  },
  demandes: {
    super_admin: ["manage"],
    admin: ["read.all", "create", "update.all", "assign", "void"],
    agent: ["read.assigned", "update.assigned"],
    client: ["read.own", "create"],
  },
  clients: {
    super_admin: ["manage"],
    admin: ["manage"],
    agent: ["read.assigned", "update.assigned"],
    client: ["read.own", "update.own"],
  },
  paiements: {
    super_admin: ["manage"],
    admin: ["read.all", "create", "update.all", "void"], // pas delete
    agent: ["create", "read.assigned"], // saisie immutable après save
    client: ["read.own"],
  },
  rendez_vous: {
    super_admin: ["manage"],
    admin: ["manage"],
    agent: ["read.assigned", "update.assigned", "create"],
    client: ["read.own", "create"],
  },
  documents: {
    super_admin: ["manage"],
    admin: ["manage"],
    agent: ["read.assigned", "create"],
    client: ["read.own", "create"],
  },
  services_config: {
    super_admin: ["manage"],
    admin: ["read.all"],
    agent: ["read.all"],
    client: ["read.all"],
  },
  analytics: {
    super_admin: ["read.all"],
    admin: ["read.team"],
    agent: ["read.own"],
    client: [],
  },
  caisse: {
    super_admin: ["manage"],
    admin: ["read.all", "create", "update.all"],
    agent: ["create", "read.own"],
    client: [],
  },
  rapports_mensuels: {
    super_admin: ["manage"],
    admin: ["read.all"],
    agent: ["read.own"],
    client: [],
  },
  messagerie: {
    super_admin: ["manage"],
    admin: ["read.team", "create", "update.assigned"],
    agent: ["read.assigned", "create", "update.assigned"],
    client: ["read.assigned", "create"],
  },
  i18n_config: {
    super_admin: ["manage"],
    admin: ["read.all"],
    agent: ["read.all"],
    client: ["read.all"],
  },
  audit_log: {
    super_admin: ["read.all"],
    admin: ["read.team"],
    agent: [],
    client: [],
  },
  agence_settings: {
    super_admin: ["manage"],
    admin: ["read.all"],
    agent: ["read.all"],
    client: [],
  },
};

// ─── API publique ──────────────────────────────────────────────────────────

/**
 * Renvoie true si le rôle a la permission d'effectuer l'action sur la ressource.
 * `manage` couvre toutes les actions read/create/update/delete/assign/void.
 *
 * @example
 *   can("admin", "read.all", "demandes") // true
 *   can("agent", "delete", "paiements")  // false
 */
export function can(role: UserRole, action: Action, resource: Resource): boolean {
  const actions = MATRIX[resource]?.[role] ?? [];
  if (actions.includes("manage")) return true;
  if (actions.includes(action)) return true;
  // `read.all` couvre `read.own`, `read.assigned`, `read.team`
  if (action === "read.own" || action === "read.assigned" || action === "read.team") {
    if (actions.includes("read.all")) return true;
  }
  // `update.all` couvre `update.own`, `update.assigned`
  if (action === "update.own" || action === "update.assigned") {
    if (actions.includes("update.all")) return true;
  }
  return false;
}

/**
 * Vérifie le rôle minimum requis. Utilisé en début de route handler / page server :
 *   await assertRole(profile.role, "admin");
 *
 * Lance une erreur 403 si insuffisant. Côté Next, gérer cette erreur dans un
 * try/catch et redirect vers /dashboard.
 */
export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertRole(role: UserRole, min: UserRole): void {
  if (!roleAtLeast(role, min)) {
    throw new ForbiddenError(
      `Role '${role}' insufficient — requires '${min}' or higher`
    );
  }
}

// ─── Routing : extraction du rôle minimum requis depuis un pathname ────────

const ROUTE_MIN_ROLE: Array<{ prefix: string; min: UserRole }> = [
  { prefix: "/dashboard/super-admin", min: "super_admin" },
  { prefix: "/dashboard/admin", min: "admin" },
  { prefix: "/dashboard/agent", min: "agent" },
  { prefix: "/dashboard/client", min: "client" },
  { prefix: "/api/super-admin", min: "super_admin" },
  { prefix: "/api/admin", min: "admin" },
  { prefix: "/api/agent", min: "agent" },
];

/**
 * Renvoie le rôle minimum requis pour accéder à un pathname dashboard, ou null
 * si le path n'est pas guarded par RBAC (public ou auth-only).
 */
export function minRoleForPath(pathname: string): UserRole | null {
  for (const { prefix, min } of ROUTE_MIN_ROLE) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return min;
    }
  }
  return null;
}

/**
 * Renvoie l'URL d'accueil dashboard correspondant au rôle.
 * Utilisé pour rediriger après login ou en cas d'accès refusé.
 */
export function homeForRole(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/dashboard/super-admin";
    case "admin":
      return "/dashboard/admin";
    case "agent":
      return "/dashboard/agent";
    case "client":
      return "/dashboard/client";
  }
}

// ─── Helpers métier (assignation) ──────────────────────────────────────────

/**
 * Pour un dossier ou paiement donné, vérifie si l'utilisateur a accès via
 * son rôle ou son assignation.
 */
export function hasAccessToRecord(args: {
  role: UserRole;
  userId: string;
  record: { client_id?: string | null; agent_id?: string | null };
}): boolean {
  const { role, userId, record } = args;
  // staff ≥ admin voit tout
  if (roleAtLeast(role, "admin")) return true;
  // agent : assigné
  if (role === "agent" && record.agent_id === userId) return true;
  // client : propriétaire
  if (role === "client" && record.client_id === userId) return true;
  return false;
}

// ─── Constantes utiles côté UI ─────────────────────────────────────────────

export const ROLE_LABELS_FR: Record<UserRole, string> = {
  super_admin: "Super administrateur",
  admin: "Administrateur",
  agent: "Conseiller",
  client: "Client",
};

export const ROLE_LABELS_SHORT: Record<UserRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  agent: "Agent",
  client: "Client",
};
