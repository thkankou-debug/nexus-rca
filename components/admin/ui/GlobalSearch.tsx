"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  href: string;
}

interface GlobalSearchProps {
  value: string;
  onValueChange: (value: string) => void;
  results: GlobalSearchResult[];
  onSelect: (result: GlobalSearchResult) => void;
  placeholder?: string;
  className?: string;
}

// Recherche transverse : le composant gère l'ouverture/fermeture et l'affichage,
// la page hôte fournit `results` déjà filtrés (recherche côté serveur/parent).
export function GlobalSearch({
  value,
  onValueChange,
  results,
  onSelect,
  placeholder = "Rechercher partout…",
  className,
}: GlobalSearchProps) {
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
    <div ref={ref} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
          aria-hidden
        />
        <input
          type="search"
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onValueChange(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-xs border border-line bg-surface py-2 pl-9 pr-9 text-body-sm text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        />
        {value && (
          <button
            type="button"
            onClick={() => onValueChange("")}
            aria-label="Effacer"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && value && (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-96 overflow-y-auto rounded-xs border border-line bg-surface-elevated shadow-elev-2">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-body-sm text-ink-subtle">
              Aucun résultat
            </p>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onSelect(r);
                  setOpen(false);
                }}
                className="flex w-full flex-col gap-0.5 border-b border-line px-3 py-2.5 text-left last:border-b-0 hover:bg-surface-sunken"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-body-sm font-medium text-ink">{r.title}</p>
                  {r.category && (
                    <span className="text-caption text-ink-subtle">{r.category}</span>
                  )}
                </div>
                {r.subtitle && (
                  <p className="text-caption text-ink-muted">{r.subtitle}</p>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
