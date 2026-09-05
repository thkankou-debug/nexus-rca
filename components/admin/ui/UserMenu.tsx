"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";

interface UserMenuProps {
  name: string;
  email?: string;
  avatarUrl?: string;
  onSettings?: () => void;
  onLogout: () => void;
  className?: string;
}

export function UserMenu({
  name,
  email,
  avatarUrl,
  onSettings,
  onLogout,
  className,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-2 rounded-xs p-1.5 hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Avatar name={name} src={avatarUrl} size="sm" />
        <ChevronDown className="h-3.5 w-3.5 text-ink-muted" aria-hidden />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-56 rounded-xs border border-line bg-surface-elevated p-1 shadow-elev-2">
          <div className="px-3 py-2">
            <p className="truncate text-body-sm font-medium text-ink">{name}</p>
            {email && <p className="truncate text-caption text-ink-subtle">{email}</p>}
          </div>
          <div className="my-1 border-t border-line" />
          {onSettings && (
            <button
              type="button"
              onClick={onSettings}
              className="flex w-full items-center gap-2 rounded-xs px-3 py-2 text-left text-body-sm text-ink hover:bg-surface-sunken"
            >
              <Settings className="h-4 w-4" aria-hidden />
              Paramètres
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-xs px-3 py-2 text-left text-body-sm text-status-failure hover:bg-status-failure/10"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}

export { User as UserMenuIcon };
