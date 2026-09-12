import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 border-b border-line pb-6", className)}>
      {breadcrumb}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h1 className="font-display text-display-sm text-ink">{title}</h1>
          {description && (
            <p className="mt-1.5 text-body text-ink-muted">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
