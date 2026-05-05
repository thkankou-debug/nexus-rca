import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

// Tokens sémantiques (compatibles dark/light) pour cohérence design system.
// Variante "elevated" (par défaut) = card sur surface, pour la majorité des contextes.
// Variante "sunken" = card sur fond enfoncé (bg de section sombre).
type CardVariant = "elevated" | "sunken";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  elevated: "bg-surface-elevated border-line shadow-elev-1",
  sunken: "bg-surface-sunken border-line",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "elevated", interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border transition-colors duration-200",
        variantClasses[variant],
        interactive && "hover:border-line-strong",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";
