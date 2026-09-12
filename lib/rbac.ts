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

// P2 (RBAC 9 rôles) : ROLE_RANK/roleAtLeast restent en doublon (voir MATRIX
// plus bas) mais ne décrivent plus un ordre réel au-delà des 4 rôles
// d'origine — un daf ou un chef_service n'est ordonné par rapport à rien de
// significatif ici, la valeur est posée uniquement pour que le type compile.
// Ne pas utiliser roleAtLeast() pour comparer un rôle "nouveau" à un autre :
// utiliser has_permission()/assertPermission() (lib/permissions.ts).
const ROLE_RANK: Record<UserRole, number> = {
  client: 0,
  agent: 1,
  admin: 2,
  super_admin: 3,
  comptable: 1,
  moderateur: 1,
  chef_service: 2,
  partenaire: 0,
  daf: 2,
  dg: 2,
  accueil_caisse: 1,
};

export const ROLES: UserRole[] = [
  "super_admin",
  "admin",
  "dg",
  "daf",
  "chef_service",
  "agent",
  "comptable",
  "moderateur",
  "partenaire",
  "accueil_caisse",
  "client",
];

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

// P2 (RBAC 9 rôles) + accueil_caisse (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md) :
// aucun de ces rôles n'a d'entrée dans cette MATRIX (conservée en doublon,
// non modifiée dans son contenu d'origine) — leurs permissions vivent
// exclusivement dans la table role_permissions (has_permission()/
// assertPermission(), voir lib/permissions.ts).
const NO_NEW_ROLE_ACCESS: Record<
  "dg" | "daf" | "chef_service" | "comptable" | "moderateur" | "partenaire" | "accueil_caisse",
  Action[]
> = {
  dg: [],
  daf: [],
  chef_service: [],
  comptable: [],
  moderateur: [],
  partenaire: [],
  accueil_caisse: [],
};

const MATRIX: Record<Resource, Record<UserRole, Action[]>> = {
  profiles: {
    super_admin: ["manage"],
    admin: ["read.all", "update.all"], // sauf rôle admin/super_admin (validation côté code)
    agent: ["read.team", "read.own", "update.own"],
    client: ["read.own", "update.own"],
    ...NO_NEW_ROLE_ACCESS,
  },
  roles: {
    super_admin: ["manage"],
    admin: [],
    agent: [],
    client: [],
    ...NO_NEW_ROLE_ACCESS,
  },
  demandes: {
    super_admin: ["manage"],
    admin: ["read.all", "create", "update.all", "assign", "void"],
    agent: ["read.assigned", "update.assigned"],
    client: ["read.own", "create"],
    ...NO_NEW_ROLE_ACCESS,
  },
  clients: {
    super_admin: ["manage"],
    admin: ["manage"],
    agent: ["read.assigned", "update.assigned"],
    client: ["read.own", "update.own"],
    ...NO_NEW_ROLE_ACCESS,
  },
  paiements: {
    super_admin: ["manage"],
    admin: ["read.all", "create", "update.all", "void"], // pas delete
    agent: ["create", "read.assigned"], // saisie immutable après save
    client: ["read.own"],
    ...NO_NEW_ROLE_ACCESS,
  },
  rendez_vous: {
    super_admin: ["manage"],
    admin: ["manage"],
    agent: ["read.assigned", "update.assigned", "create"],
    client: ["read.own", "create"],
    ...NO_NEW_ROLE_ACCESS,
  },
  documents: {
    super_admin: ["manage"],
    admin: ["manage"],
    agent: ["read.assigned", "create"],
    client: ["read.own", "create"],
    ...NO_NEW_ROLE_ACCESS,
  },
  services_config: {
    super_admin: ["manage"],
    admin: ["read.all"],
    agent: ["read.all"],
    client: ["read.all"],
    ...NO_NEW_ROLE_ACCESS,
  },
  analytics: {
    super_admin: ["read.all"],
    admin: ["read.team"],
    agent: ["read.own"],
    client: [],
    ...NO_NEW_ROLE_ACCESS,
  },
  caisse: {
    super_admin: ["manage"],
    admin: ["read.all", "create", "update.all"],
    agent: ["create", "read.own"],
    client: [],
    ...NO_NEW_ROLE_ACCESS,
  },
  rapports_mensuels: {
    super_admin: ["manage"],
    admin: ["read.all"],
    agent: ["read.own"],
    client: [],
    ...NO_NEW_ROLE_ACCESS,
  },
  messagerie: {
    super_admin: ["manage"],
    admin: ["read.team", "create", "update.assigned"],
    agent: ["read.assigned", "create", "update.assigned"],
    client: ["read.assigned", "create"],
    ...NO_NEW_ROLE_ACCESS,
  },
  i18n_config: {
    super_admin: ["manage"],
    admin: ["read.all"],
    agent: ["read.all"],
    client: ["read.all"],
    ...NO_NEW_ROLE_ACCESS,
  },
  audit_log: {
    super_admin: ["read.all"],
    admin: ["read.team"],
    agent: [],
    client: [],
    ...NO_NEW_ROLE_ACCESS,
  },
  agence_settings: {
    super_admin: ["manage"],
    admin: ["read.all"],
    agent: ["read.all"],
    client: [],
    ...NO_NEW_ROLE_ACCESS,
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

// ─── Routing : ensemble de rôles autorisés depuis un pathname ──────────────
// P2 (RBAC 9 rôles) : remplace l'ancien minRoleForPath/roleAtLeast (rang
// linéaire) par un ensemble explicite de rôles autorisés par préfixe. Un
// classement linéaire ne peut pas dire qu'un daf n'est « ni au-dessus ni en
// dessous » d'un agent ; un ensemble le peut nativement, sans ordre à définir.
// Section volontairement identique aux 4 préfixes déjà gardés (aucune page
// pour les 5 nouveaux rôles n'existe encore — elles arrivent avec A3) ; la
// vérification granulaire par action (ressource.action[.portée]) vit dans
// has_permission()/assertPermission() (voir lib/permissions.ts), pas ici.

const ROUTE_ALLOWED_ROLES: Array<{ prefix: string; roles: UserRole[] }> = [
  // Espace Accueil & Caisse (NEXUS_RCA_DASHBOARD_ADMINISTRATION.md, Partie 3) :
  // le poste physique, supervision admin/super_admin. Les actions sensibles
  // restent gardées une à une par assertPermission() côté serveur.
  { prefix: "/dashboard/accueil", roles: ["accueil_caisse", "admin", "super_admin"] },
  { prefix: "/api/accueil", roles: ["accueil_caisse", "admin", "super_admin"] },
  // Étape 5 — Espaces DAF et Comptable (chaîne §4.3). Les actions restent
  // gardées une à une par assertPermission() côté serveur.
  { prefix: "/dashboard/tresorerie", roles: ["daf", "admin", "super_admin"] },
  { prefix: "/dashboard/compta", roles: ["comptable", "daf", "admin", "super_admin"] },
  // Étape 6 — écrans d'accueil DG et Responsable de service (§2.3/§2.7).
  { prefix: "/dashboard/pilotage", roles: ["dg", "super_admin"] },
  { prefix: "/dashboard/mon-service", roles: ["chef_service", "super_admin"] },
  // §5.9/§5.10 — espaces Modérateur et Partenaire.
  { prefix: "/dashboard/moderation", roles: ["moderateur", "admin", "super_admin"] },
  { prefix: "/dashboard/partenaire", roles: ["partenaire", "super_admin"] },
  { prefix: "/api/partenaire", roles: ["partenaire", "super_admin"] },
  // §10 — instructions : tout le staff (émission gardée par permission).
  {
    prefix: "/dashboard/instructions",
    roles: ["super_admin", "admin", "dg", "daf", "chef_service", "agent", "comptable", "moderateur", "accueil_caisse"],
  },
  {
    prefix: "/api/instructions",
    roles: ["super_admin", "admin", "dg", "daf", "chef_service", "agent", "comptable", "moderateur", "accueil_caisse"],
  },
  { prefix: "/api/paiements", roles: ["comptable", "daf", "admin", "super_admin"] },
  { prefix: "/api/depenses", roles: ["daf", "admin", "super_admin"] },
  { prefix: "/dashboard/super-admin", roles: ["super_admin"] },
  { prefix: "/dashboard/admin", roles: ["admin", "super_admin"] },
  { prefix: "/dashboard/agent", roles: ["agent", "admin", "super_admin"] },
  // Les 6 pages sous /dashboard/client autorisent toutes explicitement le
  // staff (vérifié via requireProfile) — comportement identique à l'ancien
  // roleAtLeast(role, "client"), vrai pour tout rôle puisque client était le
  // rang plancher. Repris tel quel, pas une extension nouvelle.
  { prefix: "/dashboard/client", roles: ["client", "agent", "admin", "super_admin"] },
  { prefix: "/api/super-admin", roles: ["super_admin"] },
  { prefix: "/api/admin", roles: ["admin", "super_admin"] },
  { prefix: "/api/agent", roles: ["agent", "admin", "super_admin"] },
];

/**
 * Renvoie l'ensemble des rôles autorisés pour un pathname dashboard, ou null
 * si le path n'est pas guarded par RBAC (public ou auth-only).
 */
export function requiredPermissionForPath(pathname: string): UserRole[] | null {
  for (const { prefix, roles } of ROUTE_ALLOWED_ROLES) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return roles;
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
    // §1.2 Dashboard Administration : la Vue d'ensemble est l'écran
    // d'accueil de super_admin et admin (l'ancien tableau de bord reste
    // accessible par URL directe et par le lien « espace classique »).
    case "super_admin":
      return "/dashboard/vue-ensemble";
    case "admin":
      return "/dashboard/vue-ensemble";
    case "agent":
      return "/dashboard/agent";
    case "client":
      return "/dashboard/client";
    case "accueil_caisse":
      // Page d'arrivée = Encaissement libre (instruction 12/09/2026).
      return "/dashboard/accueil/caisse";
    // Étape 5 (§1.2) : le DAF arrive sur la Trésorerie, le comptable sur
    // la Saisie du jour.
    case "daf":
      return "/dashboard/tresorerie";
    case "comptable":
      return "/dashboard/compta";
    // Étape 6 (§1.2) : DG → Pilotage, chef de service → Mon service.
    case "dg":
      return "/dashboard/pilotage";
    case "chef_service":
      return "/dashboard/mon-service";
    // §5.9/§5.10 : modérateur → contenus, partenaire → dossiers partagés.
    case "moderateur":
      return "/dashboard/moderation";
    case "partenaire":
      return "/dashboard/partenaire";
    // aucune
    // section dédiée pour l'instant (arrive avec A3). "/dashboard" n'est
    // gardé par aucun préfixe RBAC (voir ROUTE_ALLOWED_ROLES) — sûr comme
    // cible de redirection, pas de boucle possible.
    default:
      return "/dashboard";
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
  dg: "Directeur général",
  daf: "Directeur administratif et financier",
  chef_service: "Chef de service",
  agent: "Conseiller",
  comptable: "Comptable",
  moderateur: "Modérateur",
  partenaire: "Partenaire",
  accueil_caisse: "Accueil et caisse",
  client: "Client",
};

export const ROLE_LABELS_SHORT: Record<UserRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  dg: "DG",
  daf: "DAF",
  chef_service: "Chef de service",
  agent: "Agent",
  comptable: "Comptable",
  moderateur: "Modérateur",
  partenaire: "Partenaire",
  accueil_caisse: "Accueil & caisse",
  client: "Client",
};
