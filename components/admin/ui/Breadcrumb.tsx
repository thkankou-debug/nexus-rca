import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'ariane" className={cn("flex items-center text-body-sm", className)}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-subtle" aria-hidden />}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus rounded-xs"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(isLast ? "font-medium text-ink" : "text-ink-muted")}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
