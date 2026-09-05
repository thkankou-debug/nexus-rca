import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick?: () => void;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function Topbar({ onMenuClick, left, center, right, className }: TopbarProps) {
  return (
    <div
      className={cn(
        "flex h-16 items-center gap-3 border-b border-line bg-surface-elevated px-4",
        className
      )}
    >
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          className="rounded-xs p-2 text-ink-muted hover:bg-surface-sunken lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      {left}
      <div className="flex-1">{center}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}
