import { cn } from "@/lib/utils";

interface ServiceSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "muted" | "dark";
}

export function ServiceSection({
  eyebrow,
  title,
  description,
  children,
  className,
  variant = "light",
}: ServiceSectionProps) {
  const bgClasses = {
    light: "bg-white",
    muted: "bg-slate-50",
    dark: "bg-nexus-blue-950 text-white",
  };

  return (
    <section className={cn("py-16 sm:py-24", bgClasses[variant], className)}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {eyebrow && (
            <p
              className={cn(
                "mb-3 text-xs font-bold uppercase tracking-widest",
                variant === "dark"
                  ? "text-nexus-orange-300"
                  : "text-nexus-orange-600"
              )}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className={cn(
              "font-display text-3xl font-bold leading-tight sm:text-4xl",
              variant === "dark" ? "text-white" : "text-nexus-blue-950"
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "mt-4 text-lg leading-relaxed",
                variant === "dark" ? "text-slate-300" : "text-slate-600"
              )}
            >
              {description}
            </p>
          )}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}