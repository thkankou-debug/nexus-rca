import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "block min-h-[100px] w-full resize-y rounded-xs border bg-surface px-3 py-2 text-body-sm text-ink placeholder:text-ink-subtle transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        error ? "border-status-failure" : "border-line",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
