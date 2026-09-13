import { cn } from "@/lib/utils";

export interface DataCardField {
  label: string;
  value: React.ReactNode;
}

export interface DataCardItem {
  id: string;
  title: React.ReactNode;
  fields: DataCardField[];
  onClick?: () => void;
}

interface DataCardListProps {
  items: DataCardItem[];
  className?: string;
}

// Contrepartie mobile de DataTable — "jamais de défilement horizontal"
// (règle CLAUDE.md). La page consommatrice choisit DataTable ou
// DataCardList selon le viewport (ex. `hidden md:block` / `md:hidden`).
export function DataCardList({ items, className }: DataCardListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={item.onClick}
          className={cn(
            "rounded-sm border border-line bg-surface-elevated p-4",
            item.onClick && "cursor-pointer hover:border-line-strong"
          )}
        >
          <p className="font-medium text-ink">{item.title}</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
            {item.fields.map((field, i) => (
              <div key={i}>
                <dt className="text-caption text-ink-subtle">{field.label}</dt>
                <dd className="text-body-sm text-ink [font-variant-numeric:tabular-nums]">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
