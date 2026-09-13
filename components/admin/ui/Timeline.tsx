import { cn } from "@/lib/utils";
import type { StatusTone } from "./StatusBadge";

export interface TimelineItem {
  id: string;
  label: string;
  description?: string;
  timestamp: string;
  tone?: StatusTone;
}

const DOT_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-status-neutral",
  waiting: "bg-status-waiting",
  progress: "bg-status-progress",
  success: "bg-status-success",
  failure: "bg-status-failure",
  inert: "bg-status-inert",
};

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 pb-6 last:pb-0">
          {index < items.length - 1 && (
            <span
              aria-hidden
              className="absolute left-[5px] top-4 h-full w-px bg-line"
            />
          )}
          <span
            aria-hidden
            className={cn(
              "relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
              DOT_CLASSES[item.tone ?? "neutral"]
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-body-sm font-medium text-ink">{item.label}</p>
              <time className="shrink-0 text-caption text-ink-subtle [font-variant-numeric:tabular-nums]">
                {item.timestamp}
              </time>
            </div>
            {item.description && (
              <p className="mt-0.5 text-body-sm text-ink-muted">
                {item.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
