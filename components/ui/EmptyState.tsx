import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "brand";

const TONE_STYLES: Record<
  Tone,
  { container: string; icon: string; iconBg: string; halo: string }
> = {
  neutral: {
    container: "border-line bg-surface-elevated",
    icon: "text-ink-muted",
    iconBg:
      "bg-surface-sunken border border-line",
    halo: "bg-ink-subtle/30",
  },
  success: {
    container:
      "border-emerald-200/60 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5",
    icon: "text-emerald-600 dark:text-emerald-300",
    iconBg:
      "bg-emerald-100 border border-emerald-200/80 dark:bg-emerald-500/15 dark:border-emerald-500/30",
    halo: "bg-emerald-400/40",
  },
  warning: {
    container:
      "border-amber-200/60 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/5",
    icon: "text-amber-600 dark:text-amber-300",
    iconBg:
      "bg-amber-100 border border-amber-200/80 dark:bg-amber-500/15 dark:border-amber-500/30",
    halo: "bg-amber-400/40",
  },
  brand: {
    container: "border-line bg-surface-elevated",
    icon: "text-brand",
    iconBg:
      "bg-brand-subtle border border-brand/20 dark:border-brand/30",
    halo: "bg-brand/40",
  },
};

/**
 * EmptyState — placeholder illustré pour listes vides ou états de succès.
 *
 *   <EmptyState
 *     icon={Inbox}
 *     title="Aucune demande pour le moment"
 *     description="Les nouvelles demandes apparaîtront ici."
 *     action={<Button href="/demandes/nouveau">Créer une demande</Button>}
 *   />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
  compact = false,
  variant = "card",
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: Tone;
  className?: string;
  /** Padding réduit pour usage embarqué (dans une card) */
  compact?: boolean;
  /**
   * `"card"` (défaut) : conteneur autonome avec border + bg + mesh + grain.
   * `"embedded"` : juste le contenu centré, sans cadre — pour s'imbriquer
   *                proprement dans une Section ou un wrapper existant.
   */
  variant?: "card" | "embedded";
}) {
  const styles = TONE_STYLES[tone];
  const isCard = variant === "card";
  return (
    <div
      role="status"
      className={cn(
        "relative overflow-hidden text-center",
        isCard && "rounded-3xl border",
        compact ? "p-6" : "p-10",
        isCard && styles.container,
        className
      )}
    >
      {/* Décor visible uniquement en variant card */}
      {isCard && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-30" />
          <div className="grain pointer-events-none absolute inset-0 opacity-30" />
        </>
      )}

      <div className="relative">
        {/* Icône avec halo flou (signal premium) */}
        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <div
            aria-hidden
            className={cn(
              "absolute h-14 w-14 rounded-3xl blur-2xl",
              styles.halo
            )}
          />
          <div
            className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-elev-2",
              styles.iconBg
            )}
          >
            <Icon className={cn("h-7 w-7", styles.icon)} />
          </div>
        </div>

        <h3 className="font-display text-headline text-ink">{title}</h3>
        {description && (
          <p className="mx-auto mt-2 max-w-md text-body-sm text-ink-muted">
            {description}
          </p>
        )}
        {action && (
          <div className="mt-6 flex justify-center">{action}</div>
        )}
      </div>
    </div>
  );
}
