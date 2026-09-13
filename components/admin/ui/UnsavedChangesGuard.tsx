"use client";

import { useEffect } from "react";

/**
 * Avertit avant fermeture d'onglet/rechargement si des modifications non
 * enregistrées existent. Next.js App Router n'expose pas d'interception
 * native de la navigation interne (Link/router.push) comme le faisait
 * l'ancien Pages Router — cette garde couvre beforeunload (fermeture,
 * rechargement, navigation externe), pas les clics sur un <Link> interne.
 */
export function useUnsavedChangesGuard(hasUnsavedChanges: boolean) {
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);
}

export function UnsavedChangesGuard({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }) {
  useUnsavedChangesGuard(hasUnsavedChanges);
  return null;
}
