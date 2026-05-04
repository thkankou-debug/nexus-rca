import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "blue" | "orange";

const ACCENT_STYLES: Record<Accent, string> = {
  blue:
    "bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  orange: "bg-brand-subtle text-brand",
};

/**
 * InfoBlock — carte avec icône + titre + contenu, utilisée pour les
 * blocs "À préparer" / "Délais indicatifs" / "Documents utiles", etc.
 *
 * `children` peut être un paragraphe ou une liste structurée.
 */
export function InfoBlock({
  icon: Icon,
  title,
  accent = "blue",
  children,
}: {
  icon: LucideIcon;
  title: string;
  accent?: Accent;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface-elevated p-8 shadow-elev-2 transition hover:shadow-elev-3">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            ACCENT_STYLES[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-display text-display-sm text-ink">{title}</h3>
      </div>
      <div className="text-body-sm text-ink-muted">{children}</div>
    </div>
  );
}
