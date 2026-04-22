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
          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-nexus-orange-300 hover:shadow-md"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nexus-orange-100 text-nexus-orange-600">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span className="text-sm leading-relaxed text-slate-700">{item}</span>
        </li>
      ))}
    </ul>
  );
}