import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── AlertCard ─────────────────────────────────────────────────────────────
// Card opérationnelle pour alertes (fiches paie, transferts, dépenses, etc.)
// Pas de longues lignes plates — vraie card avec icône, type, montant, action.
// Niveau d'urgence : haute (rouge) / moyenne (orange) / basse (jaune) / info (slate).
// ────────────────────────────────────────────────────────────────────────────

export type AlertUrgency = "haute" | "moyenne" | "basse" | "info";

export interface AlertCardProps {
  type: string; // "Fiche de paie", "Transfert", "Dépense", "Demande"
  title: string; // Nom client/employé/référence
  subtitle?: string; // Détails secondaires
  amount?: string; // Montant formaté (FCFA)
  metaLabel?: string; // Petit label en haut à droite (ex: "Mai 2026", "il y a 2h")
  urgency: AlertUrgency;
  icon: LucideIcon;
  href: string;
  actionLabel?: string; // Défaut : "Traiter"
}

const URGENCY_STYLES: Record<
  AlertUrgency,
  {
    border: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    badgeLabel: string;
    glow: string;
  }
> = {
  haute: {
    border: "border-rose-200 ring-rose-100/60",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
    badgeLabel: "Urgent",
    glow: "group-hover:bg-rose-500/15",
  },
  moyenne: {
    border: "border-orange-200 ring-orange-100/60",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
    badgeLabel: "Prioritaire",
    glow: "group-hover:bg-orange-500/15",
  },
  basse: {
    border: "border-amber-200 ring-amber-100/60",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    badgeLabel: "À traiter",
    glow: "group-hover:bg-amber-500/15",
  },
  info: {
    border: "border-slate-200 ring-slate-100/80",
    iconBg: "bg-slate-50",
    iconColor: "text-slate-600",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    badgeLabel: "À voir",
    glow: "group-hover:bg-nexus-orange-500/10",
  },
};

export function AlertCard({
  type,
  title,
  subtitle,
  amount,
  metaLabel,
  urgency,
  icon: Icon,
  href,
  actionLabel = "Traiter",
}: AlertCardProps) {
  const s = URGENCY_STYLES[urgency];

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white p-4 ring-1 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl sm:p-5",
        s.border
      )}
    >
      {/* Glow blob top-right au hover */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-transparent blur-2xl transition-all duration-500",
          s.glow
        )}
      />

      <div className="relative flex flex-1 flex-col gap-3">
        {/* Header — icône + type + urgency badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105 sm:h-11 sm:w-11",
                s.iconBg
              )}
            >
              <Icon className={cn("h-5 w-5", s.iconColor)} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {type}
              </p>
              <p className="truncate font-display text-sm font-bold leading-tight text-nexus-blue-950 sm:text-base">
                {title}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              s.badgeBg,
              s.badgeText
            )}
          >
            {s.badgeLabel}
          </span>
        </div>

        {/* Body — montant + sub */}
        {(amount || subtitle) && (
          <div className="space-y-1">
            {amount && (
              <p className="font-display text-xl font-bold tabular-nums text-nexus-blue-950 sm:text-2xl">
                {amount}
              </p>
            )}
            {subtitle && (
              <p className="line-clamp-2 text-xs text-slate-500 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Footer — meta + action */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <span className="truncate text-[11px] text-slate-500">
            {metaLabel ?? ""}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-nexus-orange-600 transition-all duration-200 group-hover:gap-2">
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
