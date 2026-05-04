import { Check } from "lucide-react";

interface ServiceChecklistProps {
  items: string[];
}

export function ServiceChecklist({ items }: ServiceChecklistProps) {
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-2xl border border-line bg-surface-elevated p-4 shadow-elev-1 transition hover:border-brand/40 hover:shadow-elev-2"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span className="text-body-sm text-ink">{item}</span>
        </li>
      ))}
    </ul>
  );
}
