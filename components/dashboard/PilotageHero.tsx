import { ArrowUpRight, ArrowDownRight, AlertTriangle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/ui/Sparkline";
import { cn } from "@/lib/utils";

// ─── PilotageHero ──────────────────────────────────────────────────────────
// Hero ÉTENDU pour le centre de pilotage super-admin.
// Pattern : navy gradient + dot grid + blobs + grand chiffre central + chart
//           inline + 3 stats secondaires + actions rapides chips.
// Mobile : compact mais conserve le grand chiffre.
// ────────────────────────────────────────────────────────────────────────────

export interface PilotageStat {
  label: string;
  value: string;
  accent?: "white" | "orange" | "rose" | "emerald" | "amber";
}

export interface PilotageQuickAction {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface Props {
  initials: string;
  greeting: string; // "Bonjour Thierry"
  todayLabel: string; // "mardi 6 mai 2026"
  lastActivity?: string; // "Il y a 5 min"

  // KPI principal
  mainKpiLabel: string; // "Encaissé ce mois"
  mainKpiValue: string; // "12 850 000 FCFA"
  mainKpiDelta?: number; // % vs période précédente
  mainKpiSubLabel?: string; // "vs mois dernier"
  trend7d?: number[];

  // Stats secondaires (3 max)
  secondaryStats?: PilotageStat[];

  // Actions rapides chips (4-6)
  quickActions?: PilotageQuickAction[];

  // Badge alertes
  alertCount?: number;
  alertHref?: string;
}

const STAT_VALUE_CLASS: Record<NonNullable<PilotageStat["accent"]>, string> = {
  white: "text-white",
  orange: "text-nexus-orange-300",
  rose: "text-rose-300",
  emerald: "text-emerald-300",
  amber: "text-amber-300",
};

const DOT_GRID: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

export function PilotageHero({
  initials,
  greeting,
  todayLabel,
  lastActivity,
  mainKpiLabel,
  mainKpiValue,
  mainKpiDelta,
  mainKpiSubLabel,
  trend7d,
  secondaryStats,
  quickActions,
  alertCount,
  alertHref,
}: Props) {
  const showDelta =
    typeof mainKpiDelta === "number" && Number.isFinite(mainKpiDelta);
  const deltaUp = showDelta && mainKpiDelta! > 0;
  const deltaDown = showDelta && mainKpiDelta! < 0;

  const showSpark =
    Array.isArray(trend7d) && trend7d.length >= 2 && trend7d.some((v) => v > 0);

  return (
    <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 px-6 py-8 shadow-lg sm:mb-8 sm:px-9 sm:py-10 lg:px-12 lg:py-14">
      {/* Dot grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={DOT_GRID}
      />

      {/* Blobs glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-nexus-orange-500/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-nexus-blue-500/20 blur-[120px]"
      />

      {/* Bottom orange line */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-nexus-orange-500/40 to-transparent"
      />

      <div className="relative">
        {/* TOP BAR — avatar + greeting + alertes badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-base font-bold text-white shadow-md sm:h-14 sm:w-14 sm:text-lg">
              {initials || "U"}
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300 backdrop-blur-md">
                <span className="relative flex h-1 w-1">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-nexus-orange-400 opacity-75" />
                  <span className="relative inline-flex h-1 w-1 rounded-full bg-nexus-orange-400" />
                </span>
                Centre de pilotage
              </span>
              <h1 className="mt-1.5 font-display text-xl font-bold leading-tight text-white sm:text-2xl">
                {greeting}
              </h1>
              <p className="text-xs text-slate-300/90 sm:text-sm">
                {todayLabel}
                {lastActivity && (
                  <span className="text-slate-400">
                    {" · Dernière activité "}
                    {lastActivity}
                  </span>
                )}
              </p>
            </div>
          </div>

          {alertCount !== undefined && alertCount > 0 && alertHref && (
            <Link
              href={alertHref}
              className="hidden shrink-0 items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-200 backdrop-blur transition hover:bg-amber-500/25 sm:inline-flex"
            >
              <AlertTriangle className="h-4 w-4" />
              {alertCount} à traiter
            </Link>
          )}
        </div>

        {/* KPI HERO + secondary stats grid */}
        <div className="mt-7 grid gap-6 sm:mt-9 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
          {/* Main KPI géant */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-nexus-orange-300">
              {mainKpiLabel}
            </p>
            <p className="mt-2 font-display text-4xl font-bold leading-none tabular-nums text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="bg-gradient-to-br from-nexus-orange-300 via-nexus-orange-400 to-nexus-orange-600 bg-clip-text text-transparent">
                {mainKpiValue}
              </span>
            </p>

            {(showDelta || mainKpiSubLabel) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {showDelta && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums backdrop-blur-md",
                      deltaUp &&
                        "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
                      deltaDown &&
                        "border-rose-400/40 bg-rose-500/15 text-rose-300",
                      !deltaUp &&
                        !deltaDown &&
                        "border-white/15 bg-white/5 text-slate-300"
                    )}
                  >
                    {deltaUp && <ArrowUpRight className="h-3.5 w-3.5" />}
                    {deltaDown && <ArrowDownRight className="h-3.5 w-3.5" />}
                    {Math.abs(mainKpiDelta!).toFixed(1)}%
                  </span>
                )}
                {mainKpiSubLabel && (
                  <p className="text-xs text-slate-300/90 sm:text-sm">
                    {mainKpiSubLabel}
                  </p>
                )}
              </div>
            )}

            {showSpark && (
              <div className="mt-5 text-nexus-orange-300/80 sm:mt-6">
                <Sparkline
                  data={trend7d!}
                  height={64}
                  strokeWidth={2.5}
                  showDot
                />
              </div>
            )}
          </div>

          {/* Secondary stats — glass cards */}
          {secondaryStats && secondaryStats.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {secondaryStats.map((s, i) => {
                const valueClass = STAT_VALUE_CLASS[s.accent ?? "white"];
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {s.label}
                    </p>
                    <p
                      className={cn(
                        "mt-1.5 font-display text-xl font-bold tabular-nums sm:text-2xl",
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

        {/* Quick actions chips (mobile + desktop) */}
        {quickActions && quickActions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5 sm:mt-8 sm:gap-3">
            {alertCount !== undefined && alertCount > 0 && alertHref && (
              <Link
                href={alertHref}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur transition hover:bg-amber-500/25 sm:hidden"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {alertCount} à traiter
              </Link>
            )}
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.href}
                  href={a.href}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-nexus-orange-400/40 hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-nexus-orange-300 transition group-hover:text-nexus-orange-200 sm:h-4 sm:w-4" />
                  {a.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
