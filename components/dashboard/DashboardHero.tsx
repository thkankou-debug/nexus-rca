import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── DashboardHero ──────────────────────────────────────────────────────────
// Hero card Premium réutilisable sur les 3 dashboards (super-admin, admin, agent).
// Pattern : navy gradient + 2 blobs orange + avatar initiales + badge rôle
// + titre + sublabel + 3 mini-stats inline (slots).
// ────────────────────────────────────────────────────────────────────────────

export type HeroStatAccent = "white" | "orange" | "rose" | "emerald";

export interface HeroStat {
  label: string;
  value: string;
  accent?: HeroStatAccent;
  icon?: LucideIcon;
}

const STAT_VALUE_CLASS: Record<HeroStatAccent, string> = {
  white: "text-white",
  orange: "text-nexus-orange-300",
  rose: "text-rose-300",
  emerald: "text-emerald-300",
};

interface Props {
  /** Initiales sur l'avatar (2 lettres max) */
  initials: string;
  /** Pré-titre (ex: "Espace Super Admin") */
  roleLabel: string;
  /** Titre principal (ex: "Bonjour, Thierry") */
  title: string;
  /** Sublabel discret (ex: "Vue d'agence — pilotage opérationnel") */
  subtitle?: string;
  /** Mini-stats inline (3 max recommandé) */
  stats?: HeroStat[];
  /** Slot pour badge à droite (ex: rang leaderboard, alerte) */
  rightSlot?: React.ReactNode;
  /** Classe CSS supplémentaire pour le wrapper */
  className?: string;
}

export function DashboardHero({
  initials,
  roleLabel,
  title,
  subtitle,
  stats,
  rightSlot,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-7 shadow-lg sm:p-9",
        className
      )}
    >
      {/* Blob orange unique, ultra discret */}
      <div
        aria-hidden
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-nexus-orange-500/10 blur-3xl"
      />

      {/* Header — avatar + identité + slot droite */}
      <div className="relative flex flex-wrap items-center gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-base font-bold text-white shadow-md sm:h-16 sm:w-16 sm:text-lg">
          {initials || "U"}
        </div>

        <div className="min-w-0 flex-1">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-nexus-orange-300">
            {roleLabel}
          </span>
          <h1 className="mt-1.5 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-300/90">{subtitle}</p>
          )}
        </div>

        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>

      {/* Mini-stats inline — pas de hover, pas de borders, juste de l'info */}
      {stats && stats.length > 0 && (
        <div
          className={cn(
            "relative mt-8 grid gap-px overflow-hidden rounded-xl bg-white/[0.06]",
            stats.length === 1 && "sm:grid-cols-1",
            stats.length === 2 && "sm:grid-cols-2",
            stats.length === 3 && "sm:grid-cols-3",
            stats.length >= 4 && "sm:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {stats.map((s, i) => {
            const Icon = s.icon;
            const valueClass = STAT_VALUE_CLASS[s.accent ?? "white"];
            return (
              <div key={i} className="bg-nexus-blue-950/60 px-4 py-3.5">
                <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">
                  {Icon && <Icon className="h-3 w-3" />}
                  {s.label}
                </p>
                <p
                  className={cn(
                    "mt-1.5 font-display text-lg font-bold tabular-nums sm:text-xl",
                    valueClass
                  )}
                >
                  {s.value}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
