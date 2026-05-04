"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  can as canFn,
  roleAtLeast,
  type Action,
  type Resource,
} from "@/lib/rbac";
import type { UserRole } from "@/types";

// ─── Context ────────────────────────────────────────────────────────────────

interface RoleContextValue {
  role: UserRole;
  userId: string;
}

const RoleContext = createContext<RoleContextValue | null>(null);

/**
 * À placer haut dans l'arbre des dashboards (typiquement dans DashboardShell).
 * Source de vérité côté client pour le rôle. Le rôle est figé pour la session
 * (rechargement complet sur changement de rôle).
 */
export function RoleProvider({
  role,
  userId,
  children,
}: {
  role: UserRole;
  userId: string;
  children: ReactNode;
}) {
  return (
    <RoleContext.Provider value={{ role, userId }}>
      {children}
    </RoleContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Renvoie le rôle + userId courant. Throw si appelé hors RoleProvider.
 */
export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error(
      "useRole() must be used within a <RoleProvider>. Wrap your dashboard tree."
    );
  }
  return ctx;
}

/**
 * Variante non-throw pour les composants qui peuvent être rendus hors d'un
 * dashboard (ex : un composant partagé public + privé).
 */
export function useRoleOptional(): RoleContextValue | null {
  return useContext(RoleContext);
}

// ─── Wrappers de rendu conditionnel ─────────────────────────────────────────

/**
 * Affiche les enfants seulement si le rôle courant ≥ `min`.
 * Pour un fallback différent du masquage simple, passer `fallback`.
 *
 * @example
 *   <RequireRole min="admin">
 *     <DangerousButton />
 *   </RequireRole>
 */
export function RequireRole({
  min,
  children,
  fallback = null,
}: {
  min: UserRole;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { role } = useRole();
  if (!roleAtLeast(role, min)) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * Affiche les enfants si la combinaison action × ressource est autorisée
 * pour le rôle courant. Plus granulaire que RequireRole.
 *
 * @example
 *   <Can action="delete" resource="paiements">
 *     <DeleteButton />
 *   </Can>
 */
export function Can({
  action,
  resource,
  children,
  fallback = null,
}: {
  action: Action;
  resource: Resource;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { role } = useRole();
  if (!canFn(role, action, resource)) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * Hook utilitaire : retourne true si autorisé.
 * Pour les cas où on doit disabler/styliser plutôt que masquer.
 *
 * @example
 *   const canEdit = useCan("update.assigned", "demandes");
 *   <button disabled={!canEdit}>Modifier</button>
 */
export function useCan(action: Action, resource: Resource): boolean {
  const { role } = useRole();
  return canFn(role, action, resource);
}
