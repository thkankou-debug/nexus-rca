import { cn } from "@/lib/utils";

export type PriorityLevel = "low" | "normal" | "high" | "urgent";

const DOT_CLASSES: Record<PriorityLevel, string> = {
  low: "bg-status-inert",
  normal: "bg-status-neutral",
  high: "bg-status-waiting",
  urgent: "bg-status-failure",
};

const LABELS: Record<PriorityLevel, string> = {
  low: "Basse",
  normal: "Normale",
  high: "Haute",
  urgent: "Urgente",
};

interface PriorityBadgeProps {
  level: PriorityLevel;
  className?: string;
}

export function PriorityBadge({ level, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs border border-line bg-surface-sunken px-2 py-1 text-caption font-medium text-ink",
        className
      )}
    >
      <span
        aria-hidden
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASSES[level])}
      />
      {LABELS[level]}
    </span>
  );
}
