// ============================================================================
// ACCÈS REFUSÉ — état uniforme §4.2 (lot G7, 13/09/2026)
// À utiliser par tout écran/bloc qui constate un droit manquant : même
// message, même ton, jamais de page blanche ni de jargon. Server-safe
// (aucun hook) — utilisable dans les server components comme en client.
// ============================================================================

import { ShieldOff } from "lucide-react";

export function AccessDenied({
  message = "Votre rôle ne donne pas accès à cette section.",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-sm border border-line bg-surface-elevated p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm bg-surface-sunken">
          <ShieldOff className="h-6 w-6 text-ink-muted" aria-hidden />
        </div>
        <h2 className="mt-4 font-display text-title font-bold text-ink">Accès refusé</h2>
        <p className="mt-2 text-body-sm text-ink-muted">
          {message} Si vous pensez qu&rsquo;il s&rsquo;agit d&rsquo;une erreur, contactez un
          administrateur.
        </p>
      </div>
    </div>
  );
}
