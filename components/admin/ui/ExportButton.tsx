import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExportButtonProps {
  onExport: () => void;
  label?: string;
  className?: string;
}

export function ExportButton({
  onExport,
  label = "Exporter",
  className,
}: ExportButtonProps) {
  return (
    <button
      type="button"
      onClick={onExport}
      className={cn(
        "flex items-center gap-1.5 rounded-xs border border-line bg-surface px-3 py-2 text-body-sm font-medium text-ink hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        className
      )}
    >
      <Download className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
