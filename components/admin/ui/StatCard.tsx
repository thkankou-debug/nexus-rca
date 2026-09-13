import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  href?: string;
  className?: string;
}

// Pas d'icône décorative dans un carré teinté (interdit A1) : le libellé
// porte déjà l'information. Pas de variation en % ici — voir règle du
// chiffre honnête (§I.6 de la feuille de route) : géré par l'appelant.
export function StatCard({ label, value, icon: Icon, href, className }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-caption font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-ink-subtle" aria-hidden />}
      </div>
      <p className="mt-2 font-display text-display-sm text-ink [font-variant-numeric:tabular-nums]">
        {value}
      </p>
    </>
  );

  const baseClasses = cn(
    "block rounded-sm border border-line bg-surface-elevated p-4",
    href && "transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
    className
  );

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {content}
      </a>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
