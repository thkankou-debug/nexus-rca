import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── DashboardQuickActions ──────────────────────────────────────────────────
// Grid de quick actions cards uniformes pour les dashboards.
// Pattern : icône carrée gradient + label + flèche au hover + badge optionnel.
// ────────────────────────────────────────────────────────────────────────────

export type QuickActionColor =
  | "orange"
  | "blue"
  | "emerald"
  | "purple"
  | "amber"
  | "rose"
  | "indigo"
  | "slate";

export interface QuickActionItem {
  href: string;
  icon: LucideIcon;
  label: string;
  color?: QuickActionColor;
  /** Badge numérique (ex: nombre d'éléments en attente) */
  badge?: number;
}

const COLOR_CLASS: Record<QuickActionColor, string> = {
  orange: "from-nexus-orange-500 to-nexus-orange-700",
  blue: "from-blue-500 to-blue-700",
  emerald: "from-emerald-500 to-emerald-700",
  purple: "from-purple-500 to-purple-700",
  amber: "from-amber-500 to-amber-700",
  rose: "from-rose-500 to-rose-700",
  indigo: "from-indigo-500 to-indigo-700",
  slate: "from-slate-500 to-slate-700",
};

interface Props {
  actions: QuickActionItem[];
  /** Titre de section (optionnel) */
  title?: string;
  className?: string;
}

export function DashboardQuickActions({ actions, title, className }: Props) {
  return (
    <section className={cn("mb-8", className)}>
      {title && (
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {title}
        </p>
      )}
      <div
        className={cn(
          "grid gap-3",
          actions.length <= 2 && "sm:grid-cols-2",
          actions.length === 3 && "sm:grid-cols-3",
          actions.length === 4 && "sm:grid-cols-2 lg:grid-cols-4",
          actions.length >= 5 && "sm:grid-cols-3 lg:grid-cols-6"
        )}
      >
        {actions.map((a) => {
          const Icon = a.icon;
          const color = a.color ?? "orange";
          return (
            <Link
              key={a.href}
              href={a.href}
              className="group relative flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-nexus-orange-300/60 hover:bg-slate-50/60"
            >
              <div
                className={cn(
                  "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white",
                  COLOR_CLASS[color]
                )}
              >
                <Icon className="h-5 w-5" />
                {a.badge !== undefined && a.badge > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-nexus-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {a.badge > 99 ? "99+" : a.badge}
                  </span>
                )}
              </div>
              <p className="min-w-0 flex-1 text-sm font-semibold text-nexus-blue-950">
                {a.label}
              </p>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-nexus-orange-600" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
