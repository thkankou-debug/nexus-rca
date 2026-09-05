import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// Sobre, institutionnel : pas de halo flou, pas de carré teinté décoratif,
// pas de dégradé (interdits A1). Icône neutre, contenu centré.
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center rounded-sm border border-line bg-surface-elevated px-6 py-10 text-center",
        className
      )}
    >
      <Icon className="h-8 w-8 text-ink-subtle" aria-hidden />
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
