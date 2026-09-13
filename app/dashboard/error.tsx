"use client";

// ============================================================================
// ERREUR RÉCUPÉRABLE — état uniforme §4.2 (lot G7, 13/09/2026)
// Boundary Next.js couvrant TOUT /dashboard : toute erreur de rendu d'un
// écran admin affiche le même état honnête (pas de page blanche), avec
// « Réessayer » (reset du segment) et retour au tableau de bord. Le détail
// technique n'est pas exposé — il part dans la console pour le diagnostic.
// ============================================================================

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DASHBOARD_ERROR]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-nexus-blue-950">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          L&rsquo;écran n&rsquo;a pas pu se charger. Vos données n&rsquo;ont pas été perdues —
          réessayez, ou revenez au tableau de bord.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-slate-400">réf. {error.digest}</p>
        )}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <a
            href="/dashboard"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Tableau de bord
          </a>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-nexus-orange-600"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
