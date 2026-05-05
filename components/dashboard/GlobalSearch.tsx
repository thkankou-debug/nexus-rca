"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  Search,
  UserCircle,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Hit = {
  id: string;
  title: string;
  subtitle: string | null;
  reference: string | null;
  url: string;
};

type SearchResponse = {
  clients: Hit[];
  demandes: Hit[];
  appointments: Hit[];
  payments: Hit[];
};

type SectionKey = keyof SearchResponse;

type Section = {
  key: SectionKey;
  label: string;
  icon: LucideIcon;
  hits: Hit[];
};

const EMPTY: SearchResponse = {
  clients: [],
  demandes: [],
  appointments: [],
  payments: [],
};

const DEBOUNCE_MS = 300;
const MIN_QUERY = 2;

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset état + focus input à chaque ouverture
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults(EMPTY);
    setLoading(false);
    setActiveIdx(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open]);

  // Fetch debounced (300 ms) avec AbortController pour annuler les requêtes obsolètes
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < MIN_QUERY) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) {
          setResults(EMPTY);
          return;
        }
        const data = (await res.json()) as SearchResponse;
        setResults(data);
        setActiveIdx(0);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("[GLOBAL_SEARCH] fetch error:", err);
          setResults(EMPTY);
        }
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      ctrl.abort();
      clearTimeout(timer);
    };
  }, [query, open]);

  const sections = useMemo<Section[]>(
    () => [
      {
        key: "clients",
        label: "Clients",
        icon: UserCircle,
        hits: results.clients,
      },
      {
        key: "demandes",
        label: "Demandes",
        icon: FileText,
        hits: results.demandes,
      },
      {
        key: "appointments",
        label: "Rendez-vous",
        icon: Calendar,
        hits: results.appointments,
      },
      {
        key: "payments",
        label: "Paiements",
        icon: Wallet,
        hits: results.payments,
      },
    ],
    [results]
  );

  const flatHits = useMemo(
    () => sections.flatMap((s) => s.hits),
    [sections]
  );

  // Reset l'index actif si la liste change
  useEffect(() => {
    setActiveIdx(0);
  }, [flatHits.length]);

  // Scroll l'item actif dans la vue
  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${activeIdx}"]`
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const select = (hit: Hit) => {
    onOpenChange(false);
    router.push(hit.url);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatHits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = flatHits[activeIdx];
      if (hit) select(hit);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  const trimmed = query.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_QUERY;
  const hasResults = flatHits.length > 0;

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
        aria-label="Recherche globale"
      >
        {/* Champ de recherche */}
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 text-ink-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client, une demande, un RDV, un paiement…"
            className="flex-1 bg-transparent py-4 text-body text-ink placeholder:text-ink-subtle outline-none"
          />
          {loading && (
            <span className="text-caption text-ink-subtle">…</span>
          )}
          <Kbd>esc</Kbd>
        </div>

        {/* Résultats */}
        <div
          ref={listRef}
          className="max-h-[55vh] overflow-y-auto py-2"
          role="listbox"
        >
          {trimmed.length === 0 && (
            <div className="px-6 py-12 text-center text-body-sm text-ink-muted">
              Tapez pour rechercher dans clients, demandes, rendez-vous et paiements.
            </div>
          )}

          {tooShort && (
            <div className="px-6 py-12 text-center text-body-sm text-ink-muted">
              Saisissez au moins{" "}
              <span className="font-semibold text-ink">{MIN_QUERY} caractères</span>.
            </div>
          )}

          {trimmed.length >= MIN_QUERY && !loading && !hasResults && (
            <div className="px-6 py-12 text-center text-body-sm text-ink-muted">
              Aucun résultat pour{" "}
              <span className="font-semibold text-ink">{`"${trimmed}"`}</span>
            </div>
          )}

          {hasResults &&
            sections
              .filter((s) => s.hits.length > 0)
              .map((section) => {
                const SecIcon = section.icon;
                return (
                  <div key={section.key} className="px-2 py-1">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-overline text-ink-subtle">
                      <SecIcon className="h-3 w-3" />
                      {section.label}
                    </div>
                    {section.hits.map((hit) => {
                      const myIdx = flatIdx++;
                      const active = myIdx === activeIdx;
                      return (
                        <button
                          key={`${section.key}-${hit.id}`}
                          data-idx={myIdx}
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveIdx(myIdx)}
                          onClick={() => select(hit)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors",
                            active
                              ? "bg-surface-sunken text-ink"
                              : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
                          )}
                        >
                          <SecIcon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              active && "text-brand"
                            )}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-body-sm font-semibold text-ink">
                              {hit.title}
                            </span>
                            {hit.subtitle && (
                              <span className="block truncate text-caption text-ink-muted">
                                {hit.subtitle}
                              </span>
                            )}
                          </span>
                          {hit.reference && (
                            <span className="shrink-0 font-mono text-caption text-ink-subtle">
                              {hit.reference}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
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
              <span className="ml-1">ouvrir</span>
            </span>
          </div>
          <span className="font-semibold tracking-wide text-ink-muted">
            Recherche Nexus
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
