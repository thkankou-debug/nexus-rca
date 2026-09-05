"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

// Filtre côté client sur une liste fournie — pas de chargement asynchrone,
// pas de virtualisation. Suffisant pour les listes de référence de
// l'admin (agents, services, statuts...), pas pour des milliers d'options.
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Rechercher…",
  error,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? null;
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = filtered[activeIndex];
      if (option) {
        onChange(option.value);
        setQuery("");
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls="combobox-listbox"
          value={open ? query : selected?.label ?? ""}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "block w-full rounded-xs border bg-surface px-3 py-2 pr-9 text-body-sm text-ink placeholder:text-ink-subtle transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
            error ? "border-status-failure" : "border-line"
          )}
        />
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
        />
      </div>
      {open && (
        <ul
          id="combobox-listbox"
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xs border border-line bg-surface-elevated py-1 shadow-elev-2"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-body-sm text-ink-muted">Aucun résultat</li>
          )}
          {filtered.map((option, index) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                onChange(option.value);
                setQuery("");
                setOpen(false);
              }}
              className={cn(
                "flex cursor-pointer items-center justify-between px-3 py-2 text-body-sm text-ink",
                index === activeIndex && "bg-surface-sunken"
              )}
            >
              {option.label}
              {option.value === value && (
                <Check className="h-4 w-4 text-brand" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
