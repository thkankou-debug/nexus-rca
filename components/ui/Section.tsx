import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// Wrapper de section avec padding vertical standardisé et variantes de fond.
// Premium tech : dot grid + glows subtils selon variant.
// Usage : <Section variant="elevated" size="lg">…</Section>
type SectionVariant = "default" | "elevated" | "sunken" | "dark" | "institutional";
type SectionSize = "sm" | "md" | "lg" | "xl";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: SectionVariant;
  size?: SectionSize;
  /** Si true, ajoute un container max-w-7xl mx-auto à l'intérieur */
  contained?: boolean;
}

// ─── Patterns dot grid ─────────────────────────────────────────────────────
const DOT_GRID_LIGHT_SUBTLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.04) 1px, transparent 1px)",
  backgroundSize: "32px 32px",
};
const DOT_GRID_LIGHT: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(12,28,64,0.05) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};
const DOT_GRID_DARK: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

const variantClasses: Record<SectionVariant, string> = {
  default: "bg-gradient-to-b from-white via-slate-50/40 to-white text-ink",
  elevated: "bg-white text-ink",
  sunken: "bg-slate-50 text-ink",
  dark: "bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 text-white",
  institutional: "bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 text-white",
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
  const isDark = variant === "dark" || variant === "institutional";
  const isLight = !isDark;

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {/* Texture dot grid + glows subtils selon variant */}
      {isDark && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={DOT_GRID_DARK}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/12 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/15 blur-[120px]"
          />
        </>
      )}

      {variant === "default" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={DOT_GRID_LIGHT_SUBTLE}
        />
      )}

      {variant === "elevated" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25"
          style={DOT_GRID_LIGHT_SUBTLE}
        />
      )}

      {variant === "sunken" && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-50"
            style={DOT_GRID_LIGHT}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-32 h-96 w-96 rounded-full bg-nexus-orange-500/8 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-32 h-96 w-96 rounded-full bg-nexus-blue-500/8 blur-[100px]"
          />
        </>
      )}

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
 * Premium tech : eyebrow text-[10px] uppercase tracking-wide orange, h2 réduit.
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
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-600">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-nexus-blue-950 sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600">
          {description}
        </p>
      )}
    </div>
  );
}
