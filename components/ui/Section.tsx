import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// Wrapper de section avec padding vertical standardisé et variantes de fond.
// Usage : <Section variant="elevated" size="lg">…</Section>
type SectionVariant = "default" | "elevated" | "sunken" | "dark" | "institutional";
type SectionSize = "sm" | "md" | "lg" | "xl";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
  size?: SectionSize;
  /** Si true, ajoute un container max-w-7xl mx-auto à l'intérieur */
  contained?: boolean;
}

const variantClasses: Record<SectionVariant, string> = {
  default: "bg-surface text-ink",
  elevated: "bg-surface-elevated text-ink",
  sunken: "bg-surface-sunken text-ink",
  // Fond sombre simple (cabinet) — pas de mesh ni gradient orange
  dark: "bg-nexus-blue-950 text-white",
  // Fond institutionnel : dark + mesh très subtil
  institutional: "bg-nexus-hero-institutional text-white",
};

const sizeClasses: Record<SectionSize, string> = {
  sm: "py-12 lg:py-16",
  md: "py-16 lg:py-20",
  lg: "py-20 lg:py-28",
  xl: "py-24 lg:py-32",
};

export function Section({
  className,
  variant = "default",
  size = "lg",
  contained = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {contained ? (
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

/**
 * Header d'une section — eyebrow + titre + sous-titre, centré ou aligné gauche.
 * Usage standardisé pour ouvrir chaque section.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-12 lg:mb-16",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-3 text-overline text-brand">{eyebrow}</p>
      )}
      <h2 className="font-display text-display-md text-ink lg:text-display-lg">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-body-lg text-ink-muted">{description}</p>
      )}
    </div>
  );
}
