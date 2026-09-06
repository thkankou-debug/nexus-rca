"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Calendar,
  CheckCheck,
  FileText,
  Info,
  UserCog,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType =
  | "rdv_new"
  | "demande_assigned"
  | "payment_declared"
  | "demande_urgent"
  | "rh_period_essai_end"
  | "info";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

type ApiResponse = {
  notifications: Notification[];
  unread_count: number;
};

const POLL_INTERVAL_MS = 3000;
const MAX_BADGE = 99;

export const NOTIFICATION_TYPE_ICON: Record<NotificationType, LucideIcon> = {
  rdv_new: Calendar,
  demande_assigned: FileText,
  payment_declared: Wallet,
  demande_urgent: FileText,
  rh_period_essai_end: UserCog,
  info: Info,
};

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function NotificationBell({ className }: { className?: string }) {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchNotifications = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch("/api/notifications", { signal });
      if (!res.ok) return;
      const data = (await res.json()) as ApiResponse;
      setItems(data.notifications || []);
      setUnread(data.unread_count || 0);
      lastFetchRef.current = Date.now();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("[NOTIF BELL] fetch error:", err);
      }
    }
  }, []);

  // Polling 3s — lit en boucle pendant que le composant est monté.
  useEffect(() => {
    const ctrl = new AbortController();
    fetchNotifications(ctrl.signal);
    const id = setInterval(() => {
      fetchNotifications(ctrl.signal);
    }, POLL_INTERVAL_MS);
    return () => {
      ctrl.abort();
      clearInterval(id);
    };
  }, [fetchNotifications]);

  // Click outside → ferme le dropdown
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSelect = async (n: Notification) => {
    // Optimiste : marque lu localement immédiatement
    if (!n.read_at) {
      setItems((list) =>
        list.map((it) =>
          it.id === n.id ? { ...it, read_at: new Date().toISOString() } : it
        )
      );
      setUnread((c) => Math.max(0, c - 1));
      // PATCH best-effort, on ne bloque pas la navigation
      fetch(`/api/notifications/${n.id}`, { method: "PATCH" }).catch((err) =>
        console.error("[NOTIF BELL] patch one error:", err)
      );
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  const handleMarkAll = async () => {
    if (unread === 0) return;
    const nowIso = new Date().toISOString();
    setItems((list) =>
      list.map((it) => (it.read_at ? it : { ...it, read_at: nowIso }))
    );
    setUnread(0);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
    } catch (err) {
      console.error("[NOTIF BELL] mark all error:", err);
    }
  };

  const badge =
    unread > 0 ? (unread > MAX_BADGE ? `${MAX_BADGE}+` : String(unread)) : null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unread > 0
            ? `Notifications (${unread} non lues)`
            : "Notifications"
        }
        aria-expanded={open}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink transition-colors hover:bg-surface-sunken"
      >
        <Bell className="h-5 w-5" />
        {badge && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-nexus-orange-500 px-1 text-[10px] font-bold text-white shadow-elev-2">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Liste des notifications"
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-surface-overlay shadow-elev-5 sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-display text-sm font-bold text-ink">
              Notifications
            </span>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={unread === 0}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
                unread === 0
                  ? "cursor-not-allowed text-ink-subtle"
                  : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
              )}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tout marquer lu
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <div className="px-6 py-10 text-center text-body-sm text-ink-muted">
                Aucune notification pour le moment.
              </div>
            )}
            {items.map((n) => {
              const Icon = NOTIFICATION_TYPE_ICON[n.type] || Info;
              const isUnread = !n.read_at;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleSelect(n)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-sunken",
                    isUnread && "bg-brand-subtle/40"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                      isUnread
                        ? "bg-nexus-orange-500/15 text-nexus-orange-600 dark:text-brand"
                        : "bg-surface-sunken text-ink-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "block truncate text-body-sm font-semibold",
                          isUnread ? "text-ink" : "text-ink-muted"
                        )}
                      >
                        {n.title}
                      </span>
                      {isUnread && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-nexus-orange-500" />
                      )}
                    </span>
                    {n.message && (
                      <span className="mt-0.5 block line-clamp-2 text-caption text-ink-muted">
                        {n.message}
                      </span>
                    )}
                    <span className="mt-1 block text-[10px] text-ink-subtle">
                      {relativeTime(n.created_at)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
