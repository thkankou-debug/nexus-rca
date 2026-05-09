// ============================================================================
// COMPOSANT — Carte catégorie (dashboard staff)
// Affiche : icône, label, compteurs, badge "Votre spécialité" si applicable.
// ============================================================================

import Link from "next/link";
import { ArrowRight, Star, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryCard({
  href,
  icon: Icon,
  iconBg,
  iconColor,
  label,
  totalActifs,
  nouveaux,
  urgents,
  isSpecialite,
}: {
  href: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  totalActifs: number;
  nouveaux: number;
  urgents: number;
  isSpecialite?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        isSpecialite
          ? "border-nexus-orange-300 ring-1 ring-nexus-orange-200/60"
          : "border-slate-200 hover:border-nexus-orange-300/60"
      )}
    >
      {isSpecialite && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-nexus-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
          <Star className="h-2.5 w-2.5" />
          Votre spécialité
        </span>
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-bold text-nexus-blue-950">
            {label}
          </h3>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Counter label="Actifs" value={totalActifs} accent="blue" />
        <Counter label="Nouveaux" value={nouveaux} accent="orange" />
        <Counter label="Urgents" value={urgents} accent="rose" />
      </div>

      <div className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 transition group-hover:text-nexus-orange-600">
        Voir les dossiers
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

function Counter({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "blue" | "orange" | "rose";
}) {
  const colorMap = {
    blue: "text-nexus-blue-950",
    orange: value > 0 ? "text-nexus-orange-600" : "text-slate-400",
    rose: value > 0 ? "text-rose-600" : "text-slate-400",
  };
  return (
    <div className="rounded-lg bg-slate-50 p-2 text-center">
      <p className={cn("font-display text-lg font-bold tabular-nums", colorMap[accent])}>
        {value}
      </p>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </div>
  );
}
