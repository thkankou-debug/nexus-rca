import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "block w-full rounded-xs border bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle transition-colors [font-variant-numeric:tabular-nums]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        error ? "border-status-failure" : "border-line",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
