import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: React.ReactNode;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  actions,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-sm border border-line bg-surface-elevated px-4 py-2.5 text-body-sm",
        className
      )}
    >
      <button
        type="button"
        onClick={onClear}
        aria-label="Désélectionner"
        className="rounded-xs p-1 text-ink-muted hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <X className="h-4 w-4" />
      </button>
      <span className="font-medium text-ink [font-variant-numeric:tabular-nums]">
        {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
      </span>
      <div className="ml-auto flex items-center gap-2">{actions}</div>
    </div>
  );
}
