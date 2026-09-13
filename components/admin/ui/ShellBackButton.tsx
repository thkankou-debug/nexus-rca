"use client";

// ============================================================================
// RETOUR — bouton global du shell d'administration (exigence Thierry,
// 13/09/2026 : « il n'y a pas de bouton retour sur les pages des comptes »).
// Rendu par ModuleAdminShell et AccueilShell sur la ligne du fil d'Ariane,
// masqué sur l'écran d'accueil du rôle (revenir en arrière depuis son
// poste de travail mènerait hors de l'espace). router.back() si un
// historique existe, sinon repli sur l'écran d'accueil du rôle.
// Action secondaire : style neutre, pas d'or (A1), transition 150 ms.
// ============================================================================

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function ShellBackButton({ home }: { home: string }) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === home) return null;

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(home);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-line bg-surface px-2.5 py-1 text-caption font-semibold text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-ink focus-visible:ring-2 focus-visible:ring-focus"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Retour
    </button>
  );
}
