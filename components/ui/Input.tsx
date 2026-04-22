import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & FieldProps;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-nexus-blue-900"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all",
            "focus:border-nexus-orange-500 focus:outline-none focus:ring-4 focus:ring-nexus-orange-100",
            error && "border-red-500 focus:border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-nexus-blue-900"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all min-h-[120px] resize-y",
            "focus:border-nexus-orange-500 focus:outline-none focus:ring-4 focus:ring-nexus-orange-100",
            error && "border-red-500 focus:border-red-500 focus:ring-red-100",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & FieldProps;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, children, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-nexus-blue-900"
          >
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 transition-all appearance-none bg-no-repeat pr-10",
            "focus:border-nexus-orange-500 focus:outline-none focus:ring-4 focus:ring-nexus-orange-100",
            error && "border-red-500 focus:border-red-500 focus:ring-red-100",
            className
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23050f3d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
            backgroundPosition: "right 1rem center",
          }}
          {...props}
        >
          {children}
        </select>
        {hint && !error && (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
