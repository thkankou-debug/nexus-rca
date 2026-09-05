import { cn } from "@/lib/utils";

interface SidebarGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarGroup({ label, children, className }: SidebarGroupProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      {label && (
        <p className="px-3 pb-1.5 pt-4 text-caption font-semibold uppercase tracking-wide text-ink-subtle first:pt-0">
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
        "flex items-center gap-2.5 rounded-xs px-3 py-2 text-body-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        active
          ? "bg-brand-subtle/50 text-brand"
          : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
      )}
    >
      {icon && <span className="h-4 w-4 shrink-0">{icon}</span>}
      <span className="flex-1 truncate">{label}</span>
      {badge}
    </a>
  );
}
