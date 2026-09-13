import { cn } from "@/lib/utils";

interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-body-sm font-medium text-ink">
          {label}
          {required && <span className="ml-0.5 text-status-failure">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-caption text-ink-muted">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-caption font-medium text-status-failure">{error}</p>
      )}
    </div>
  );
}
