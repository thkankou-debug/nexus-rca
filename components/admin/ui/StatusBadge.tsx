import { cn } from "@/lib/utils";

export type StatusTone =
  | "neutral"
  | "waiting"
  | "progress"
  | "success"
  | "failure"
  | "inert";

const DOT_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-status-neutral",
  waiting: "bg-status-waiting",
  progress: "bg-status-progress",
  success: "bg-status-success",
  failure: "bg-status-failure",
  inert: "bg-status-inert",
};

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
  className?: string;
}

// Point coloré + libellé sur fond neutre — jamais une pastille pleine (A1/A2).
export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs border border-line bg-surface-sunken px-2 py-1 text-caption font-medium text-ink",
        className
      )}
    >
      <span
        aria-hidden
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASSES[tone])}
      />
      {label}
    </span>
  );
}
