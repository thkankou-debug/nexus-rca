import { ArrowUpRight, ArrowDownRight, AlertTriangle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Sparkline } from "@/components/ui/Sparkline";
import { cn } from "@/lib/utils";

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
  greeting: string;
  todayLabel: string;
  lastActivity?: string;
  mainKpiLabel: string;
  mainKpiValue: string;
  mainKpiDelta?: number;
  mainKpiSubLabel?: string;
  trend7d?: number[];
  secondaryStats?: PilotageStat[];
  quickActions?: PilotageQuickAction[];
  alertCount?: number;
  alertHref?: string;
}

const BUBBLE = ["bg-emerald-500", "bg-violet-600", "bg-blue-500", "bg-teal-500"];

export function PilotageHero({
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
  const showDelta = typeof mainKpiDelta === "number" && Number.isFinite(mainKpiDelta);
  const deltaUp = showDelta && mainKpiDelta! > 0;
  const deltaDown = showDelta && mainKpiDelta! < 0;
  const showSpark = Array.isArray(trend7d) && trend7d.length >= 2 && trend7d.some((v) => v > 0);

  return (
    <section className="mb-6 space-y-4">
      <div className="flex items-start justify-between gap-3 lg:hidden">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#1c2033]">{greeting}</h1>
          <p className="text-xs text-[#8b93a7]">
            {todayLabel}
            {lastActivity ? ` · Dernière activité ${lastActivity}` : ""}
          </p>
        </div>
        {alertCount !== undefined && alertCount > 0 && alertHref && (
          <Link href={alertHref} className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white">
            <AlertTriangle className="h-3.5 w-3.5" />
            {alertCount}
          </Link>
        )}
      </div>

      <div className="grid items-center gap-2 rounded-2xl border border-[#eceef6] bg-white px-5 py-4 shadow-sm lg:grid-cols-[minmax(0,18rem)_1fr]">
        <div>
          <p className="text-sm text-[#8b93a7]">{mainKpiLabel}</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-tight text-[#1c2033] sm:text-4xl">{mainKpiValue}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {showDelta && (
              <span className={cn("inline-flex items-center gap-1 font-semibold", deltaUp && "text-emerald-600", deltaDown && "text-rose-600", !deltaUp && !deltaDown && "text-[#8b93a7]")}>
                {deltaUp && <ArrowUpRight className="h-4 w-4" />}
                {deltaDown && <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(mainKpiDelta!).toFixed(1)} %
              </span>
            )}
            {mainKpiSubLabel && <span className="text-[#8b93a7]">{mainKpiSubLabel}</span>}
          </div>
          <p className="mt-1 text-xs text-[#8b93a7]">Paiements vérifiés et caisse rapide. Les devis ne sont pas inclus. Pas un bénéfice.</p>
        </div>
        {showSpark ? (
          <div className="h-28 text-violet-600">
            <Sparkline data={trend7d!} width={640} height={112} strokeWidth={2.5} showDot color="#7c5cfc" className="h-28 w-full" />
          </div>
        ) : (
          <p className="text-sm text-[#8b93a7]">Courbe indisponible : moins de deux jours avec un encaissement sur 7 jours.</p>
        )}
      </div>

      {secondaryStats && secondaryStats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {secondaryStats.map((s, i) => (
            <div key={s.label} className="rounded-2xl border border-[#eceef6] bg-white p-4 shadow-sm">
              <span className="flex items-center gap-2">
                <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white", BUBBLE[i % BUBBLE.length])}>{i + 1}</span>
                <span className="text-sm text-[#8b93a7]">{s.label}</span>
              </span>
              <p className="mt-3 text-lg font-bold text-[#1c2033]">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {quickActions && quickActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {alertCount !== undefined && alertCount > 0 && alertHref && (
            <Link href={alertHref} className="hidden items-center gap-2 rounded-full bg-violet-600 px-3 py-2 text-sm font-semibold text-white lg:inline-flex">
              <AlertTriangle className="h-4 w-4" />
              {alertCount} à traiter
            </Link>
          )}
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.href} href={a.href} className="inline-flex items-center gap-1.5 rounded-full border border-[#eceef6] bg-white px-3 py-2 text-sm font-semibold text-[#1c2033]">
                <Icon className="h-4 w-4 text-violet-600" />
                {a.label}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
