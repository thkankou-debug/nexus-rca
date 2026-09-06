"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Info, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  NOTIFICATION_TYPE_ICON,
  relativeTime,
  type Notification,
} from "@/components/dashboard/NotificationBell";

const FETCH_LIMIT = 100;

type Filter = "all" | "unread";

export function NotificationsManager() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/notifications?limit=${FETCH_LIMIT}`);
        if (!res.ok) throw new Error("Erreur de chargement");
        const data = (await res.json()) as { notifications: Notification[] };
        if (!cancelled) setItems(data.notifications || []);
      } catch (err) {
        console.error("[NOTIFICATIONS PAGE] fetch error:", err);
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    return filter === "unread" ? items.filter((n) => !n.read_at) : items;
  }, [items, filter]);

  const unreadCount = items?.filter((n) => !n.read_at).length ?? 0;

  const markOne = async (n: Notification) => {
    if (n.read_at) {
      if (n.link) router.push(n.link);
      return;
    }
    setItems((list) =>
      (list || []).map((it) =>
        it.id === n.id ? { ...it, read_at: new Date().toISOString() } : it
      )
    );
    try {
      const res = await fetch(`/api/notifications/${n.id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("Erreur");
    } catch (err) {
      console.error("[NOTIFICATIONS PAGE] mark one error:", err);
      toast.error("Impossible de marquer comme lu");
    }
    if (n.link) router.push(n.link);
  };

  const markAll = async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    const nowIso = new Date().toISOString();
    setItems((list) =>
      (list || []).map((it) => (it.read_at ? it : { ...it, read_at: nowIso }))
    );
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Toutes les notifications sont marquées lues");
    } catch (err) {
      console.error("[NOTIFICATIONS PAGE] mark all error:", err);
      toast.error("Impossible de tout marquer lu");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === "all"
                ? "bg-nexus-blue-950 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Toutes {items ? `(${items.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              filter === "unread"
                ? "bg-nexus-blue-950 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Non lues ({unreadCount})
          </button>
        </div>
        <button
          type="button"
          onClick={markAll}
          disabled={unreadCount === 0 || markingAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {markingAll ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCheck className="h-3.5 w-3.5" />
          )}
          Tout marquer lu
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {items === null ? (
          <div className="flex items-center gap-2 p-8 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              {filter === "unread"
                ? "Aucune notification non lue."
                : "Aucune notification pour le moment."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((n) => {
              const Icon = NOTIFICATION_TYPE_ICON[n.type] || Info;
              const isUnread = !n.read_at;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markOne(n)}
                    className={cn(
                      "flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50",
                      isUnread && "bg-nexus-orange-50/40"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        isUnread
                          ? "bg-nexus-orange-100 text-nexus-orange-600"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            "block text-sm font-semibold",
                            isUnread ? "text-nexus-blue-950" : "text-slate-600"
                          )}
                        >
                          {n.title}
                        </span>
                        {isUnread && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-nexus-orange-500" />
                        )}
                      </span>
                      {n.message && (
                        <span className="mt-0.5 block text-sm text-slate-500">
                          {n.message}
                        </span>
                      )}
                      <span className="mt-1 block text-[11px] text-slate-400">
                        {relativeTime(n.created_at)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
