"use client";

import { cn } from "@/lib/utils";
import { useSidebarCollapsed } from "./Sidebar";

interface SidebarGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

// Variante bleu nuit (tokens --sidebar-*) — voir Sidebar.tsx. En mode
// replié (§4.1, 64 px), les libellés de groupes deviennent un simple
// séparateur.
export function SidebarGroup({ label, children, className }: SidebarGroupProps) {
  const collapsed = useSidebarCollapsed();
  return (
    <div className={cn("space-y-0.5", className)}>
      {label &&
        (collapsed ? (
          <div className="mx-2 mb-1.5 mt-4 border-t border-sidebar-line first:mt-1 first:border-0" aria-hidden />
        ) : (
          <p className="px-3 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-ink-subtle first:pt-1">
            {label}
          </p>
        ))}
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
  const collapsed = useSidebarCollapsed();
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "relative flex items-center gap-2.5 rounded-xs py-2 text-body-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "bg-sidebar-raised text-white before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-brand"
          : "text-sidebar-ink-muted hover:bg-sidebar-raised hover:text-sidebar-ink"
      )}
    >
      {icon && (
        <span className={cn("h-4 w-4 shrink-0", active ? "text-brand" : "")}>{icon}</span>
      )}
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge}
    </a>
  );
}
