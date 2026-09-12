import { cn } from "@/lib/utils";

interface SidebarGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

// Variante bleu nuit (tokens --sidebar-*) — voir Sidebar.tsx.
export function SidebarGroup({ label, children, className }: SidebarGroupProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      {label && (
        <p className="px-3 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-ink-subtle first:pt-1">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

interface SidebarItemProps {
  icon?: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  badge?: React.ReactNode;
}

export function SidebarItem({ icon, label, href, active, badge }: SidebarItemProps) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-2.5 rounded-xs px-3 py-2 text-body-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        active
          ? "bg-sidebar-raised text-white before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-brand"
          : "text-sidebar-ink-muted hover:bg-sidebar-raised hover:text-sidebar-ink"
      )}
    >
      {icon && (
        <span className={cn("h-4 w-4 shrink-0", active ? "text-brand" : "")}>{icon}</span>
      )}
      <span className="flex-1 truncate">{label}</span>
      {badge}
    </a>
  );
}
