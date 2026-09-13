import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section className={cn("border-b border-line pb-6 last:border-b-0 last:pb-0", className)}>
      <h3 className="font-display text-title text-ink">{title}</h3>
      {description && <p className="mt-1 text-body-sm text-ink-muted">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
