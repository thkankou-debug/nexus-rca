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
  // Tokens sémantiques — light/muted suivent le thème, dark reste forcé.
  const bgClasses = {
    light: "bg-surface text-ink",
    muted: "bg-surface-sunken text-ink",
    dark: "bg-nexus-blue-950 text-white",
  };

  const eyebrowColor =
    variant === "dark" ? "text-nexus-orange-300" : "text-brand";

  const titleColor = variant === "dark" ? "text-white" : "text-ink";

  const descColor = variant === "dark" ? "text-slate-300" : "text-ink-muted";

  return (
    <section className={cn("py-16 sm:py-24", bgClasses[variant], className)}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {eyebrow && (
            <p className={cn("mb-3 text-overline", eyebrowColor)}>
              {eyebrow}
            </p>
          )}
          <h2
            className={cn(
              "font-display text-display-md sm:text-display-lg",
              titleColor
            )}
          >
            {title}
          </h2>
          {description && (
            <p className={cn("mt-4 text-body-lg", descColor)}>{description}</p>
          )}
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
