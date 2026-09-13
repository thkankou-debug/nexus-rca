"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "right";
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (key: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: T) => void;
  density?: "comfortable" | "compact";
  className?: string;
}

// Desktop uniquement — coupler avec DataCardList en dessous du breakpoint
// mobile (règle CLAUDE.md : jamais de défilement horizontal sur mobile).
// overflow-x-auto ici est un filet de sécurité pour les cas limites
// desktop (fenêtre réduite), pas la stratégie mobile.
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  selectedIds = [],
  onSelectionChange,
  sortKey,
  sortDirection = "asc",
  onSortChange,
  onRowClick,
  density = "comfortable",
  className,
}: DataTableProps<T>) {
  const rowHeight = density === "compact" ? "h-9" : "h-11";
  const allSelected = rows.length > 0 && selectedIds.length === rows.length;

  function toggleAll() {
    if (!onSelectionChange) return;
    onSelectionChange(allSelected ? [] : rows.map(getRowId));
  }

  function toggleOne(id: string) {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id]
    );
  }

  function handleSort(col: DataTableColumn<T>) {
    if (!col.sortable || !onSortChange) return;
    const nextDirection =
      sortKey === col.key && sortDirection === "asc" ? "desc" : "asc";
    onSortChange(col.key, nextDirection);
  }

  return (
    <div className={cn("overflow-x-auto rounded-sm border border-line", className)}>
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b border-line bg-surface-sunken">
            {onSelectionChange && (
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label="Tout sélectionner"
                  className="h-3.5 w-3.5 rounded-sm border-line-strong text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                className={cn(
                  "px-3 py-2 text-left text-caption font-semibold uppercase tracking-wide text-ink-muted",
                  col.align === "right" && "text-right",
                  col.sortable && "cursor-pointer select-none hover:text-ink"
                )}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable &&
                    (sortKey === col.key ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="h-3 w-3" aria-hidden />
                      ) : (
                        <ArrowDown className="h-3 w-3" aria-hidden />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden />
                    ))}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = getRowId(row);
            const isSelected = selectedIds.includes(id);
            return (
              <tr
                key={id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  rowHeight,
                  "border-b border-line last:border-b-0",
                  onRowClick && "cursor-pointer hover:bg-surface-sunken",
                  isSelected && "bg-brand-subtle/30"
                )}
              >
                {onSelectionChange && (
                  <td className="px-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(id)}
                      aria-label="Sélectionner la ligne"
                      className="h-3.5 w-3.5 rounded-sm border-line-strong text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 text-ink [font-variant-numeric:tabular-nums]",
                      col.align === "right" && "text-right"
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
