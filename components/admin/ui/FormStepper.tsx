import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormStep {
  id: string;
  label: string;
}

interface FormStepperProps {
  steps: FormStep[];
  currentStepId: string;
  className?: string;
}

export function FormStepper({ steps, currentStepId, className }: FormStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <ol className={cn("flex items-center", className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-caption font-semibold [font-variant-numeric:tabular-nums]",
                  isComplete && "bg-status-success text-white",
                  isCurrent && "bg-brand text-white",
                  !isComplete && !isCurrent && "bg-surface-sunken text-ink-muted"
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
              </span>
              <span
                className={cn(
                  "text-body-sm",
                  isCurrent ? "font-semibold text-ink" : "text-ink-muted"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span aria-hidden className="mx-3 h-px flex-1 bg-line" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
