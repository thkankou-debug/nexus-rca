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

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-nexus-orange-500 hover:bg-nexus-orange-600 text-white shadow-lg shadow-nexus-orange-500/30 hover:shadow-nexus-orange-500/50 hover:-translate-y-0.5",
  secondary:
    "bg-nexus-blue-800 hover:bg-nexus-blue-900 text-white shadow-lg shadow-nexus-blue-800/30 hover:-translate-y-0.5",
  outline:
    "border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm",
  ghost: "text-nexus-blue-800 hover:bg-nexus-blue-50",
  white:
    "bg-white text-nexus-blue-900 hover:bg-nexus-orange-50 shadow-lg hover:-translate-y-0.5",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
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
      "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus-nexus disabled:opacity-50 disabled:cursor-not-allowed",
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
