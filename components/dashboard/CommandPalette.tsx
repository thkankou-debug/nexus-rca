"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Clock,
  Search,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CommandItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
  /** Mots-clés supplémentaires pour la recherche (synonymes, raccourcis) */
  keywords?: string;
  href?: string;
  onSelect?: () => void;
  /** Si true, l'item ne sera pas mémorisé dans les récents (ex: thème) */
  excludeFromRecent?: boolean;
};

const RECENT_KEY = "nexus-palette-recent";
const RECENT_MAX = 5;
const RECENT_GROUP = "Récents";

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = localStorage.getItem(RECENT_KEY);
    if (!v) return [];
    const arr = JSON.parse(v);
    return Array.isArray(arr)
      ? arr.filter((x): x is string => typeof x === "string").slice(0, RECENT_MAX)
      : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  try {
    const cur = readRecent().filter((x) => x !== id);
    const next = [id, ...cur].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

function clearRecent() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {}
}

export function CommandPalette({
  items,
  open,
  onOpenChange,
}: {
  items: CommandItem[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filtrage : recherche dans label + group + keywords (case-insensitive)
  const baseFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      `${it.label} ${it.group} ${it.keywords ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [query, items]);

  // Liste ordonnée : Récents promus en haut quand pas de query.
  // En cas de recherche, les récents sont fondus dans leur groupe d'origine.
  const orderedItems = useMemo(() => {
    if (query.trim()) return baseFiltered;
    if (recentIds.length === 0) return baseFiltered;
    const recentItems: CommandItem[] = [];
    const recentSet = new Set<string>();
    for (const id of recentIds) {
      const it = items.find(
        (x) => x.id === id && !x.excludeFromRecent
      );
      if (it) {
        recentItems.push({ ...it, group: RECENT_GROUP });
        recentSet.add(id);
      }
    }
    if (recentItems.length === 0) return baseFiltered;
    const remaining = baseFiltered.filter((it) => !recentSet.has(it.id));
    return [...recentItems, ...remaining];
  }, [baseFiltered, recentIds, query, items]);

  // Regroupement par section (ordre d'insertion préservé)
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const it of orderedItems) {
      const arr = map.get(it.group) ?? [];
      arr.push(it);
      map.set(it.group, arr);
    }
    return Array.from(map.entries());
  }, [orderedItems]);

  // Reset état + hydrate les récents à chaque ouverture
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIdx(0);
    setRecentIds(readRecent());
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Reset l'index actif si la liste ordonnée change
  useEffect(() => {
    setActiveIdx(0);
  }, [orderedItems.length]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  // Scroll l'item actif dans la vue
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${activeIdx}"]`
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const select = (item: CommandItem) => {
    if (!item.excludeFromRecent) pushRecent(item.id);
    onOpenChange(false);
    if (item.href) router.push(item.href);
    else item.onSelect?.();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, orderedItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = orderedItems[activeIdx];
      if (item) select(item);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  // Compteur d'index plat pour mapper grouped → activeIdx
  let flatIdx = 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/55 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface-overlay shadow-elev-5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKey}
        role="dialog"
        aria-modal="true"
        aria-label="Palette de commandes"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 text-ink-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une page, une action…"
            className="flex-1 bg-transparent py-4 text-body text-ink placeholder:text-ink-subtle outline-none"
          />
          <Kbd>esc</Kbd>
        </div>

        {/* Liste */}
        <div
          ref={listRef}
          className="max-h-[55vh] overflow-y-auto py-2"
          role="listbox"
        >
          {grouped.length === 0 && (
            <div className="px-6 py-12 text-center text-body-sm text-ink-muted">
              Aucun résultat pour{" "}
              <span className="font-semibold text-ink">{`"${query}"`}</span>
            </div>
          )}

          {grouped.map(([group, groupItems]) => (
            <div key={group} className="px-2 py-1">
              <div className="flex items-center justify-between gap-2 px-2 py-1">
                <div className="flex items-center gap-1.5 text-overline text-ink-subtle">
                  {group === RECENT_GROUP && <Clock className="h-3 w-3" />}
                  {group}
                </div>
                {group === RECENT_GROUP && (
                  <button
                    type="button"
                    onClick={() => {
                      clearRecent();
                      setRecentIds([]);
                      setActiveIdx(0);
                      inputRef.current?.focus();
                    }}
                    aria-label="Effacer l'historique récent"
                    className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" />
                    Effacer
                  </button>
                )}
              </div>
              {groupItems.map((item) => {
                const myIdx = flatIdx++;
                const Icon = item.icon;
                const active = myIdx === activeIdx;
                return (
                  <button
                    key={item.id}
                    data-idx={myIdx}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIdx(myIdx)}
                    onClick={() => select(item)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-body-sm transition-colors",
                      active
                        ? "bg-surface-sunken text-ink"
                        : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active && "text-brand"
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {active && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-brand" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-caption text-ink-subtle">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <span className="ml-1">naviguer</span>
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd>
              <span className="ml-1">sélectionner</span>
            </span>
          </div>
          <span className="font-semibold tracking-wide text-ink-muted">
            Nexus Connect
          </span>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-line bg-surface-sunken px-1.5 font-mono text-[10px] text-ink-muted">
      {children}
    </kbd>
  );
}
