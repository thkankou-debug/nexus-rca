"use client";

import { useEffect, useRef, useState } from "react";
import { Columns3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ColumnOption {
  key: string;
  label: string;
}

interface ColumnPickerProps {
  columns: ColumnOption[];
  visibleKeys: string[];
  onChange: (keys: string[]) => void;
  className?: string;
}

export function ColumnPicker({
  columns,
  visibleKeys,
  onChange,
  className,
}: ColumnPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(key: string) {
    onChange(
      visibleKeys.includes(key)
        ? visibleKeys.filter((k) => k !== key)
        : [...visibleKeys, key]
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-xs border border-line bg-surface px-3 py-2 text-body-sm text-ink hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Columns3 className="h-4 w-4" aria-hidden />
        Colonnes
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-56 rounded-xs border border-line bg-surface-elevated p-2 shadow-elev-2">
          {columns.map((col) => (
            <label
              key={col.key}
              className="flex items-center gap-2 rounded-xs px-2 py-1.5 text-body-sm text-ink hover:bg-surface-sunken"
            >
              <input
                type="checkbox"
                checked={visibleKeys.includes(col.key)}
                onChange={() => toggle(col.key)}
                className="h-3.5 w-3.5 rounded-sm border-line-strong text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              />
              {col.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
