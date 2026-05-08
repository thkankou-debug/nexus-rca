import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServiceSteps, isCancelled } from "@/lib/demande-status";

/**
 * Timeline visuelle 6 étapes — horizontale desktop, verticale mobile.
 * Server component (pas d'interactivité).
 */
export function Timeline({
  service,
  currentStep,
  statut,
  history,
}: {
  service: string;
  currentStep: number;
  statut: string;
  history?: Array<{ step: number; created_at: string }>;
}) {
  const steps = getServiceSteps(service);
  const cancelled = isCancelled(statut);

  // Map step → date (depuis history)
  const stepDates = new Map<number, string>();
  (history || []).forEach((h) => {
    if (!stepDates.has(h.step)) stepDates.set(h.step, h.created_at);
  });

  const formatDate = (s?: string) => {
    if (!s) return null;
    try {
      return new Date(s).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="relative">
      {/* === Horizontal desktop === */}
      <div className="hidden sm:block">
        <div className="relative">
          {/* Ligne de connexion background */}
          <div
            aria-hidden
            className="absolute left-6 right-6 top-5 h-0.5 rounded-full bg-slate-200"
          />
          {/* Ligne de progression remplie */}
          <div
            aria-hidden
            className={cn(
              "absolute left-6 top-5 h-0.5 rounded-full transition-all duration-700",
              cancelled ? "bg-red-500" : "bg-nexus-orange-500"
            )}
            style={{
              width: `calc(${((currentStep - 1) / 5) * 100}% - 0.75rem)`,
            }}
          />
          <ol className="relative grid grid-cols-6 gap-2">
            {steps.map((label, i) => {
              const stepNum = i + 1;
              const state =
                cancelled && stepNum === currentStep
                  ? "cancelled"
                  : stepNum < currentStep
                    ? "done"
                    : stepNum === currentStep
                      ? "active"
                      : "todo";
              const date = formatDate(stepDates.get(stepNum));
              return (
                <li
                  key={stepNum}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className={cn(
                      "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 transition-all",
                      state === "done" &&
                        "bg-green-600 text-white ring-green-100",
                      state === "active" &&
                        "bg-nexus-orange-500 text-white ring-nexus-orange-100 shadow-lg shadow-nexus-orange-500/40",
                      state === "cancelled" &&
                        "bg-red-600 text-white ring-red-100 shadow-lg",
                      state === "todo" &&
                        "bg-white text-slate-300 ring-slate-100 border-2 border-slate-200"
                    )}
                  >
                    {state === "done" && <Check className="h-5 w-5" />}
                    {state === "active" && (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    )}
                    {state === "cancelled" && <X className="h-5 w-5" />}
                    {state === "todo" && (
                      <span className="text-xs font-bold">{stepNum}</span>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-3 text-[11px] font-semibold leading-tight",
                      state === "active" && "text-nexus-blue-950",
                      state === "done" && "text-slate-700",
                      state === "cancelled" && "text-red-700",
                      state === "todo" && "text-slate-400"
                    )}
                  >
                    {label}
                  </p>
                  {date && (
                    <p className="mt-1 text-[10px] text-slate-500">{date}</p>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* === Vertical mobile === */}
      <ol className="space-y-4 sm:hidden">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const state =
            cancelled && stepNum === currentStep
              ? "cancelled"
              : stepNum < currentStep
                ? "done"
                : stepNum === currentStep
                  ? "active"
                  : "todo";
          const date = formatDate(stepDates.get(stepNum));
          return (
            <li key={stepNum} className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-2",
                  state === "done" && "bg-green-600 text-white ring-green-200",
                  state === "active" &&
                    "bg-nexus-orange-500 text-white ring-nexus-orange-200",
                  state === "cancelled" &&
                    "bg-red-600 text-white ring-red-200",
                  state === "todo" &&
                    "bg-white text-slate-400 ring-slate-200 border border-slate-200"
                )}
              >
                {state === "done" && <Check className="h-4 w-4" />}
                {state === "active" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {state === "cancelled" && <X className="h-4 w-4" />}
                {state === "todo" && (
                  <span className="text-[10px] font-bold">{stepNum}</span>
                )}
              </div>
              <div className="flex-1 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    state === "active" && "text-nexus-blue-950",
                    state === "done" && "text-slate-700",
                    state === "cancelled" && "text-red-700",
                    state === "todo" && "text-slate-400"
                  )}
                >
                  {label}
                </p>
                {date && (
                  <p className="mt-0.5 text-xs text-slate-500">{date}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
