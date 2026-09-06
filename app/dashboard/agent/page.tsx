import Link from "next/link";
import {
  Trophy,
  Calendar,
  FileText,
  Wallet,
  TrendingUp,
  Target,
  Sparkles,
  ShoppingCart,
  ArrowRight,
  Star,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { AgentAvatar } from "@/components/dashboard/AgentAvatar";
import { Sparkline } from "@/components/ui/Sparkline";
import { cn } from "@/lib/utils";

// ─── DEMO TREND HELPERS ────────────────────────────────────────────────────
// TODO: remplacer par des queries Supabase groupées par jour
function fakeTrend(
  current: number,
  direction: "up" | "down" | "flat",
  seed: number,
  points = 7
): number[] {
  if (current <= 0) return Array(points).fill(0);
  const dirFactor = direction === "up" ? 0.55 : direction === "down" ? 1.4 : 1;
  const start = current * dirFactor;
  const out: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const base = start + (current - start) * t;
    const noise =
      (Math.sin(seed + i * 1.7) + Math.sin(seed * 2.3 + i * 0.9)) *
      (current * 0.08);
    out.push(Math.max(0, base + noise));
  }
  out[points - 1] = current;
  return out;
}

function trendDelta(series: number[]): number {
  if (series.length < 2) return 0;
  const first = series[0];
  const last = series[series.length - 1];
  if (first === 0) return last > 0 ? 100 : 0;
  return ((last - first) / first) * 100;
}

export const metadata = {
  title: "Tableau de bord - Agent",
};

export const dynamic = "force-dynamic";

const MONTHLY_GOALS = {
  rdv: 20,
  paiements_xaf: 5_000_000,
  dossiers: 15,
};

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

function getStartOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function getStartOfYear(): string {
  return new Date(new Date().getFullYear(), 0, 1).toISOString();
}

interface AgentScore {
  id: string;
  name: string;
  poste: string;
  rdvCount: number;
  paiementsXAF: number;
  score: number;
  isCurrent: boolean;
}

export default async function AgentDashboardPage() {
  const profile = await requireProfile(["agent"]);
  const supabase = createClient();

  // CAST pour accéder à la colonne 'poste' qui existe en DB mais pas dans le type Profile
  const profileAny = profile as unknown as Record<string, unknown>;
  const profilePoste = (profileAny.poste as string) || "Agent Nexus";

  const startOfMonth = getStartOfMonth();
  const startOfYear = getStartOfYear();

  // Stats personnelles
  const { count: rdvThisMonth } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", profile.id)
    .gte("created_at", startOfMonth);

  const { count: rdvCompleted } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", profile.id)
    .eq("statut", "termine")
    .gte("created_at", startOfMonth);

  const { data: paymentsThisMonth } = await supabase
    .from("payments")
    .select("montant_recu, devise")
    .eq("created_by", profile.id)
    .gte("created_at", startOfMonth);

  const totalPaiementsXAF = (paymentsThisMonth || [])
    .filter((p) => p.devise === "XAF")
    .reduce((sum, p) => sum + Number(p.montant_recu || 0), 0);

  const totalPaiementsCount = paymentsThisMonth?.length || 0;

  const { count: demandesThisMonth } = await supabase
    .from("demandes")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", profile.id)
    .gte("created_at", startOfMonth);

  const { count: rdvThisYear } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", profile.id)
    .gte("created_at", startOfYear);

  const { data: paymentsThisYear } = await supabase
    .from("payments")
    .select("montant_recu, devise")
    .eq("created_by", profile.id)
    .gte("created_at", startOfYear);

  const totalPaiementsYearXAF = (paymentsThisYear || [])
    .filter((p) => p.devise === "XAF")
    .reduce((sum, p) => sum + Number(p.montant_recu || 0), 0);

  // Leaderboard
  const { data: allAgents } = await supabase
    .from("profiles")
    .select("id, prenom, nom, poste, role")
    .in("role", ["agent", "admin", "super_admin"]);

  const agents = (allAgents || []) as Array<{
    id: string;
    prenom: string | null;
    nom: string | null;
    poste: string | null;
    role: string;
  }>;

  const leaderboardData: AgentScore[] = await Promise.all(
    agents.map(async (agent) => {
      const { count: agentRdvCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("agent_id", agent.id)
        .eq("statut", "termine")
        .gte("created_at", startOfMonth);

      const { data: agentPayments } = await supabase
        .from("payments")
        .select("montant_recu, devise")
        .eq("created_by", agent.id)
        .gte("created_at", startOfMonth);

      const agentPaiementsXAF = (agentPayments || [])
        .filter((p) => p.devise === "XAF")
        .reduce((sum, p) => sum + Number(p.montant_recu || 0), 0);

      const score =
        (agentRdvCount || 0) * 100 + Math.floor(agentPaiementsXAF / 1000);

      return {
        id: agent.id,
        name: [agent.prenom, agent.nom].filter(Boolean).join(" ") || "Agent",
        poste: agent.poste || (agent.role === "agent" ? "Agent" : agent.role),
        rdvCount: agentRdvCount || 0,
        paiementsXAF: agentPaiementsXAF,
        score,
        isCurrent: agent.id === profile.id,
      };
    })
  );

  const leaderboard = leaderboardData
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const myRank = leaderboard.findIndex((a) => a.isCurrent) + 1;

  // Progression
  const progressRdv = Math.min(((rdvCompleted || 0) / MONTHLY_GOALS.rdv) * 100, 100);
  const progressPaiements = Math.min(
    (totalPaiementsXAF / MONTHLY_GOALS.paiements_xaf) * 100,
    100
  );
  const progressDossiers = Math.min(
    ((demandesThisMonth || 0) / MONTHLY_GOALS.dossiers) * 100,
    100
  );

  const overallProgress = Math.round(
    (progressRdv + progressPaiements + progressDossiers) / 3
  );

  const fullName =
    [profile.prenom, profile.nom].filter(Boolean).join(" ") || "Agent";
  const initials = (profile.prenom?.[0] ?? "") + (profile.nom?.[0] ?? "");

  return (
    <DashboardShell profile={profile}>
      {/* HERO PREMIUM (composant partagé) */}
      <DashboardHero
        initials={initials.toUpperCase() || "A"}
        roleLabel="Espace Agent Premium"
        title={`Bonjour, ${profile.prenom || fullName}`}
        subtitle={
          myRank > 0
            ? `${profilePoste} · ${myRank}ème dans le classement`
            : profilePoste
        }
        stats={[
          {
            label: "Performance ce mois",
            value: `${overallProgress}%`,
            accent: "white",
          },
          {
            label: "Encaisse ce mois",
            value: formatMoney(totalPaiementsXAF, "XAF"),
            accent: "orange",
          },
          {
            label: "Encaisse cette année",
            value: formatMoney(totalPaiementsYearXAF, "XAF"),
            accent: "emerald",
          },
        ]}
        rightSlot={
          myRank > 0 && myRank <= 3 ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/20 backdrop-blur">
              <span className="text-2xl">
                {myRank === 1 ? "🥇" : myRank === 2 ? "🥈" : "🥉"}
              </span>
            </div>
          ) : undefined
        }
      />

      {/* ACTIONS RAPIDES */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/dashboard/agent/caisse"
          icon={ShoppingCart}
          label="Caisse"
          color="from-green-500 to-green-700"
        />
        <QuickAction
          href="/dashboard/agent/rdv"
          icon={Calendar}
          label="Mon agenda"
          color="from-nexus-orange-500 to-nexus-orange-700"
        />
        <QuickAction
          href="/dashboard/agent/clients"
          icon={Sparkles}
          label="Mes clients"
          color="from-purple-500 to-purple-700"
        />
        <QuickAction
          href="/dashboard/agent/demandes"
          icon={FileText}
          label="Mes dossiers"
          color="from-blue-500 to-blue-700"
        />
      </div>

      {/* STATS */}
      <div className="mb-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-nexus-blue-950">
          <Zap className="h-5 w-5 text-nexus-orange-600" />
          Mes performances ce mois
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(() => {
            const t1 = fakeTrend(rdvThisMonth || 0, "up", 11);
            const t2 = fakeTrend(totalPaiementsCount, "up", 12);
            const t3 = fakeTrend(demandesThisMonth || 0, "up", 13);
            const t4 = fakeTrend(rdvThisYear || 0, "up", 14);
            return (
              <>
                <StatCard
                  icon={Calendar}
                  label="RDV ce mois"
                  value={String(rdvThisMonth || 0)}
                  sublabel={`${rdvCompleted || 0} terminés`}
                  accent="orange"
                  trend={t1}
                  delta={trendDelta(t1)}
                />
                <StatCard
                  icon={Wallet}
                  label="Paiements encaissés"
                  value={String(totalPaiementsCount)}
                  sublabel={formatMoney(totalPaiementsXAF, "XAF")}
                  accent="green"
                  trend={t2}
                  delta={trendDelta(t2)}
                />
                <StatCard
                  icon={FileText}
                  label="Dossiers traités"
                  value={String(demandesThisMonth || 0)}
                  sublabel="ce mois"
                  accent="blue"
                  trend={t3}
                  delta={trendDelta(t3)}
                />
                <StatCard
                  icon={TrendingUp}
                  label="RDV cette année"
                  value={String(rdvThisYear || 0)}
                  sublabel="cumul annuel"
                  accent="purple"
                  trend={t4}
                  delta={trendDelta(t4)}
                />
              </>
            );
          })()}
        </div>
      </div>

      {/* OBJECTIFS */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white shadow">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-nexus-blue-950">
                Objectifs du mois
              </h2>
              <p className="text-xs text-slate-500">
                Progression globale : <strong>{overallProgress}%</strong>
              </p>
            </div>
          </div>
          {overallProgress >= 100 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              <CheckCircle2 className="h-3 w-3" />
              Objectifs atteints
            </span>
          )}
        </div>

        <div className="space-y-4">
          <ProgressBar
            label="RDV termines"
            current={rdvCompleted || 0}
            target={MONTHLY_GOALS.rdv}
            unit="RDV"
            progress={progressRdv}
            accent="orange"
          />
          <ProgressBar
            label="Paiements encaisses"
            current={totalPaiementsXAF}
            target={MONTHLY_GOALS.paiements_xaf}
            unit="XAF"
            progress={progressPaiements}
            accent="green"
            isMoney
          />
          <ProgressBar
            label="Dossiers traites"
            current={demandesThisMonth || 0}
            target={MONTHLY_GOALS.dossiers}
            unit="dossiers"
            progress={progressDossiers}
            accent="blue"
          />
        </div>
      </div>

      {/* LEADERBOARD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 text-white shadow">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-nexus-blue-950">
              Classement equipe
            </h2>
            <p className="text-xs text-slate-500">
              Score = RDV termines x 100 + paiements (milliers XAF)
            </p>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">Aucune activite ce mois</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((agent, index) => {
              const rank = index + 1;
              let rankBadge = "";
              let rankColor = "bg-slate-300";

              if (rank === 1) {
                rankBadge = "🥇";
                rankColor = "bg-gradient-to-br from-yellow-400 to-yellow-600";
              } else if (rank === 2) {
                rankBadge = "🥈";
                rankColor = "bg-gradient-to-br from-slate-300 to-slate-500";
              } else if (rank === 3) {
                rankBadge = "🥉";
                rankColor = "bg-gradient-to-br from-orange-400 to-orange-600";
              }

              return (
                <div
                  key={agent.id}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-4 transition-colors",
                    agent.isCurrent
                      ? "border-nexus-orange-300 bg-nexus-orange-50/40"
                      : "border-slate-200 bg-white hover:bg-slate-50/60"
                  )}
                >
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm",
                        rankColor
                      )}
                      aria-label={`Rang ${rank}`}
                    >
                      {rankBadge || rank}
                    </span>
                    <AgentAvatar name={agent.name} size="md" highlight={agent.isCurrent} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={cn(
                          "font-semibold",
                          agent.isCurrent
                            ? "text-nexus-orange-700"
                            : "text-nexus-blue-950"
                        )}
                      >
                        {agent.name}
                      </p>
                      {agent.isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-nexus-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          <Star className="h-2.5 w-2.5" />
                          Vous
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{agent.poste}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-nexus-orange-600" />
                        {agent.rdvCount} RDV
                      </span>
                      <span className="flex items-center gap-1">
                        <Wallet className="h-3 w-3 text-green-600" />
                        {formatMoney(agent.paiementsXAF, "XAF")}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Score
                    </p>
                    <p className="font-display text-xl font-bold text-nexus-blue-950">
                      {agent.score.toLocaleString("fr-FR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow transition group-hover:scale-110",
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-nexus-blue-950">{label}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-nexus-orange-600" />
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
  trend,
  delta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel: string;
  accent: "orange" | "green" | "blue" | "purple";
  trend?: number[];
  delta?: number;
}) {
  const gradientMap: Record<string, string> = {
    orange: "from-nexus-orange-500 to-nexus-orange-700",
    green: "from-emerald-500 to-emerald-700",
    blue: "from-blue-500 to-blue-700",
    purple: "from-purple-500 to-purple-700",
  };
  const sparkColorMap: Record<string, string> = {
    orange: "text-nexus-orange-500",
    green: "text-emerald-500",
    blue: "text-blue-500",
    purple: "text-purple-500",
  };

  const showSpark = trend && trend.length >= 2;
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const deltaUp = showDelta && delta! > 0;
  const deltaDown = showDelta && delta! < 0;

  return (
    <div className="rounded-2xl border border-line bg-surface-elevated p-5 shadow-elev-2">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-caption font-medium text-ink-muted">{label}</p>
          <p className="mt-1 font-display text-display-sm text-ink">{value}</p>
          <p className="mt-0.5 text-caption text-ink-muted">{sublabel}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-elev-2",
            gradientMap[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(showSpark || showDelta) && (
        <div className="mt-3 flex items-center gap-2">
          {showDelta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                deltaUp &&
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                deltaDown &&
                  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
                !deltaUp &&
                  !deltaDown &&
                  "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300"
              )}
            >
              {deltaUp && <ArrowUpRight className="h-3 w-3" />}
              {deltaDown && <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta!).toFixed(1)}%
            </span>
          )}
          {showSpark && (
            <div className={cn("min-w-0 flex-1", sparkColorMap[accent])}>
              <Sparkline data={trend!} height={22} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProgressBar({
  label,
  current,
  target,
  unit,
  progress,
  accent,
  isMoney = false,
}: {
  label: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  accent: "orange" | "green" | "blue";
  isMoney?: boolean;
}) {
  const colorMap: Record<string, string> = {
    orange: "bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600",
    green: "bg-gradient-to-r from-green-500 to-green-600",
    blue: "bg-gradient-to-r from-blue-500 to-blue-600",
  };

  const isAchieved = progress >= 100;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-sm font-semibold text-nexus-blue-950">{label}</p>
        <p className="text-xs text-slate-600">
          <strong className={isAchieved ? "text-green-600" : "text-nexus-blue-950"}>
            {isMoney ? formatMoney(current, "XAF") : current.toLocaleString("fr-FR")}
          </strong>
          {" / "}
          {isMoney
            ? formatMoney(target, "XAF")
            : `${target.toLocaleString("fr-FR")} ${unit}`}
        </p>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isAchieved
              ? "bg-gradient-to-r from-green-500 to-green-600"
              : colorMap[accent]
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className="mt-1 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {Math.round(progress)}% {isAchieved && "OK"}
      </p>
    </div>
  );
}
