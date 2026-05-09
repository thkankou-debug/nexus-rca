"use client";

// ============================================================================
// COMPOSANT — Bandeau staff au-dessus du détail dossier
// Permet de : changer l'étape, demander un document, assigner un agent (admin+).
// ============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronUp, FileQuestion, Loader2, UserPlus } from "lucide-react";
import { getCategorieSteps } from "@/lib/demande-status";
import type { CategorieDossierSlug, UserRole } from "@/types";
import { cn } from "@/lib/utils";

export interface DossierStaffBannerProps {
  demandeId: string;
  reference: string;
  currentStep: number;
  currentStepLabel: string | null;
  categorieSlug: CategorieDossierSlug;
  role: UserRole;
  onRequestDocument: () => void;
  onAssignAgent: () => void;
}

export function DossierStaffBanner({
  demandeId,
  currentStep,
  categorieSlug,
  role,
  onRequestDocument,
  onAssignAgent,
}: DossierStaffBannerProps) {
  const router = useRouter();
  const steps = getCategorieSteps(categorieSlug);
  const [isPending, startTransition] = useTransition();
  const [savingStep, setSavingStep] = useState(false);

  const canAssign = role === "admin" || role === "super_admin";

  const updateStep = async (newStep: number) => {
    if (newStep === currentStep) return;
    setSavingStep(true);
    try {
      const res = await fetch(`/api/demandes/${demandeId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_step: newStep }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Mise à jour impossible");
      }
      toast.success(`Étape ${newStep}/6 enregistrée`);
      startTransition(() => router.refresh());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSavingStep(false);
    }
  };

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-nexus-orange-200 bg-gradient-to-br from-nexus-orange-50/60 via-white to-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-nexus-orange-500 text-white shadow-sm">
          <ChevronUp className="h-4 w-4" />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-nexus-orange-700">
          Espace conseiller
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Sélecteur d'étape */}
        <div>
          <label
            htmlFor="step-select"
            className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500"
          >
            Étape du dossier
          </label>
          <div className="relative">
            <select
              id="step-select"
              value={currentStep}
              disabled={savingStep || isPending}
              onChange={(e) => updateStep(Number(e.target.value))}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm font-semibold text-nexus-blue-950 focus:border-nexus-orange-400 focus:outline-none focus:ring-2 focus:ring-nexus-orange-300/40 disabled:opacity-50"
            >
              {steps.map((label, i) => (
                <option key={i + 1} value={i + 1}>
                  Étape {i + 1}/6 — {label}
                </option>
              ))}
            </select>
            {(savingStep || isPending) && (
              <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-nexus-orange-500" />
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Le client recevra un email à chaque changement d&rsquo;étape.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onRequestDocument}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-nexus-blue-950 transition hover:border-nexus-orange-300 hover:bg-nexus-orange-50"
            )}
          >
            <FileQuestion className="h-4 w-4 text-nexus-orange-500" />
            Demander un document
          </button>
          {canAssign && (
            <button
              type="button"
              onClick={onAssignAgent}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-nexus-blue-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-nexus-blue-900"
            >
              <UserPlus className="h-4 w-4" />
              Assigner un agent
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
