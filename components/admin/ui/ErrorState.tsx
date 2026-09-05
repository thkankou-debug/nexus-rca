import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// Erreur avec cause et remède (règle CLAUDE.md) — jamais un message vague.
export function ErrorState({
  title = "Une erreur est survenue",
  description,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-sm border border-status-failure/30 bg-status-failure/5 px-6 py-10 text-center",
        className
      )}
    >
      <AlertTriangle className="h-8 w-8 text-status-failure" aria-hidden />
      <h3 className="mt-4 font-display text-title text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-body-sm text-ink-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
