"use client";

import { Check, Loader2, Sparkles, Mail } from "lucide-react";
import {
  PUBLIC_STATUSES,
  STATUS_LABELS,
  type QuoteStatus,
} from "@/lib/insurance/types";

/**
 * Visualisation du statut workflow d'un devis assurance.
 *
 * Affiche les 4 étapes publiques (Reçu → Analyse → Validation → Devis prêt)
 * avec ligne de progression, glow orange sur étape active, étapes
 * complétées en check, étapes futures grisées.
 *
 * Mode :
 * - "horizontal" : barre horizontale desktop (page confirmation)
 * - "vertical" : timeline verticale (résumé sticky)
 */

type Props = {
  current: QuoteStatus;
  orientation?: "horizontal" | "vertical";
};

const ICONS: Record<QuoteStatus, typeof Check> = {
  recu: Mail,
  analyse: Loader2,
  validation_agent: Sparkles,
  devis_pret: Check,
  envoye: Check,
  archive: Check,
};

const STATUS_DESCRIPTIONS: Record<QuoteStatus, string> = {
  recu: "Votre dossier vient d'être enregistré dans notre système",
  analyse: "Nos experts analysent votre profil et vos besoins",
  validation_agent: "Un courtier valide la sélection des assureurs",
  devis_pret: "Votre devis personnalisé est prêt à être envoyé",
  envoye: "Devis envoyé par email — en attente de votre retour",
  archive: "Dossier archivé",
};

function getStepState(
  step: QuoteStatus,
  current: QuoteStatus
): "done" | "active" | "todo" {
  const order = PUBLIC_STATUSES.indexOf(step);
  const currentOrder = PUBLIC_STATUSES.indexOf(
    current === "envoye" || current === "archive" ? "devis_pret" : current
  );
  if (order < currentOrder) return "done";
  if (order === currentOrder) return "active";
  return "todo";
}

export function AssuranceStatusTracker({
  current,
  orientation = "horizontal",
}: Props) {
  if (orientation === "vertical") {
    return (
      <ol className="space-y-4">
        {PUBLIC_STATUSES.map((step) => {
          const state = getStepState(step, current);
          const Icon = ICONS[step];
          return (
            <li key={step} className="flex items-start gap-3">
              <div
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2 transition-all duration-500 ${
                  state === "done"
                    ? "bg-nexus-orange-500 text-white ring-nexus-orange-400/40 shadow-[0_0_18px_-4px_rgba(255,102,0,0.6)]"
                    : state === "active"
                      ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-nexus-orange-400/60 shadow-[0_0_24px_-4px_rgba(255,102,0,0.8)]"
                      : "bg-white/[0.04] text-white/40 ring-white/10"
                }`}
              >
                {state === "active" && step === "analyse" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
                {state === "active" && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-nexus-orange-500/40 animate-ping"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={`text-xs font-bold uppercase tracking-[0.18em] ${
                    state === "todo" ? "text-white/40" : "text-nexus-orange-300"
                  }`}
                >
                  {STATUS_LABELS[step]}
                </p>
                {state !== "todo" && (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
                    {STATUS_DESCRIPTIONS[step]}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  // ─── Mode horizontal (desktop primaire) ────────────────────────────────
  return (
    <div className="relative">
      {/* Ligne de progression background */}
      <div
        aria-hidden
        className="absolute left-4 right-4 top-5 h-0.5 bg-white/10 sm:left-6 sm:right-6"
      />
      {/* Ligne de progression remplie */}
      <div
        aria-hidden
        className="absolute left-4 top-5 h-0.5 bg-gradient-to-r from-nexus-orange-500 via-nexus-orange-400 to-nexus-orange-300 transition-all duration-700 ease-out sm:left-6"
        style={{
          width: `calc(${(PUBLIC_STATUSES.indexOf(current === "envoye" || current === "archive" ? "devis_pret" : current) / (PUBLIC_STATUSES.length - 1)) * 100}% - 1.5rem)`,
        }}
      />

      <ol className="relative grid grid-cols-4 gap-2 sm:gap-4">
        {PUBLIC_STATUSES.map((step) => {
          const state = getStepState(step, current);
          const Icon = ICONS[step];
          return (
            <li key={step} className="flex flex-col items-center text-center">
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full ring-2 transition-all duration-500 sm:h-12 sm:w-12 ${
                  state === "done"
                    ? "bg-nexus-orange-500 text-white ring-nexus-orange-400/40 shadow-[0_0_24px_-4px_rgba(255,102,0,0.6)]"
                    : state === "active"
                      ? "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white ring-nexus-orange-400/70 shadow-[0_0_32px_-4px_rgba(255,102,0,0.9)]"
                      : "bg-nexus-blue-950 text-white/40 ring-white/10 backdrop-blur-md"
                }`}
              >
                {state === "active" && step === "analyse" ? (
                  <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                ) : (
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                {state === "active" && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-nexus-orange-500/40 animate-ping"
                  />
                )}
              </div>
              <p
                className={`mt-3 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs ${
                  state === "todo" ? "text-white/40" : "text-white/85"
                }`}
              >
                {STATUS_LABELS[step]}
              </p>
              {state === "active" && (
                <p className="mt-1 hidden max-w-[160px] text-[11px] leading-tight text-slate-400 sm:block">
                  {STATUS_DESCRIPTIONS[step]}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
