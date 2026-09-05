"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge, type StatusTone } from "./StatusBadge";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  tone?: StatusTone;
  read?: boolean;
  href?: string;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAllRead?: () => void;
  onItemClick?: (item: NotificationItem) => void;
  className?: string;
}

export function NotificationCenter({
  notifications,
  onMarkAllRead,
  onItemClick,
  className,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative rounded-xs p-2 text-ink-muted hover:bg-surface-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-status-failure" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-80 rounded-xs border border-line bg-surface-elevated shadow-elev-2">
          <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
            <p className="text-body-sm font-semibold text-ink">Notifications</p>
            {onMarkAllRead && unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-caption font-medium text-brand hover:text-brand-hover"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-body-sm text-ink-subtle">
                Aucune notification
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onItemClick?.(n)}
                  className={cn(
                    "flex w-full flex-col gap-1 border-b border-line px-3 py-2.5 text-left last:border-b-0 hover:bg-surface-sunken",
                    !n.read && "bg-brand-subtle/20"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-body-sm font-medium text-ink">{n.title}</p>
                    {n.tone && <StatusBadge tone={n.tone} label="" className="px-0" />}
                  </div>
                  {n.description && (
                    <p className="text-caption text-ink-muted">{n.description}</p>
                  )}
                  <p className="text-caption text-ink-subtle [font-variant-numeric:tabular-nums]">
                    {n.timestamp}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
