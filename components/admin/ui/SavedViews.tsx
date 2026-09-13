import { cn } from "@/lib/utils";

export interface SavedView {
  id: string;
  label: string;
  count?: number;
}

interface SavedViewsProps {
  views: SavedView[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SavedViews({ views, activeId, onChange, className }: SavedViewsProps) {
  return (
    <div role="tablist" className={cn("flex flex-wrap gap-1", className)}>
      {views.map((view) => {
        const isActive = view.id === activeId;
        return (
          <button
            key={view.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(view.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-xs px-3 py-1.5 text-body-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              isActive
                ? "bg-surface-sunken text-ink"
                : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
            )}
          >
            {view.label}
            {typeof view.count === "number" && (
              <span className="text-caption text-ink-subtle [font-variant-numeric:tabular-nums]">
                {view.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
