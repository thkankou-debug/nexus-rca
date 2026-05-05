import { cn } from "@/lib/utils";
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "white";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  external?: boolean;
}

// Cabinet/institutional variants — sobres, sans translate ni glow agressif.
// Hover = changement de teinte uniquement (pas de mouvement, pas de halo orange).
const variantClasses: Record<Variant, string> = {
  // CTA primaire — orange réservé à l'action principale
  primary:
    "bg-brand hover:bg-brand-hover text-white shadow-elev-2",
  // CTA secondaire — dark, neutre, jamais orange
  secondary:
    "bg-nexus-blue-900 hover:bg-nexus-blue-950 text-white shadow-elev-2",
  // Outline pour fonds sombres
  outline:
    "border border-white/25 text-white hover:bg-white/10 hover:border-white/40",
  // Ghost pour actions tertiaires (lien dans une page claire)
  ghost:
    "text-ink hover:bg-surface-sunken",
  // Sur fond sombre — bouton clair
  white:
    "bg-surface-elevated text-ink hover:bg-surface-sunken shadow-elev-1",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-body-sm",
  md: "px-6 py-3 text-body-sm",
  lg: "px-7 py-3.5 text-body",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      href,
      external,
      children,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 focus-nexus disabled:opacity-50 disabled:cursor-not-allowed",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (href) {
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={classes}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
