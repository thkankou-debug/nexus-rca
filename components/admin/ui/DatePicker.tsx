import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// Input date natif stylé, plutôt qu'un calendrier custom : accessible,
// fonctionne partout, aucune librairie tierce (règle CLAUDE.md).
interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      type="date"
      className={cn(
        "block w-full rounded-xs border bg-surface px-3 py-2 text-body-sm text-ink transition-colors [font-variant-numeric:tabular-nums]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        error ? "border-status-failure" : "border-line",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
DatePicker.displayName = "DatePicker";
