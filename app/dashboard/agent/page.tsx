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
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { cn } from "@/lib/utils";

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
    .select("montant, devise")
    .eq("created_by", profile.id)
    .gte("created_at", startOfMonth);

  const totalPaiementsXAF = (paymentsThisMonth || [])
    .filter((p) => p.devise === "XAF")
    .reduce((sum, p) => sum + Number(p.montant || 0), 0);

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
    .select("montant, devise")
    .eq("created_by", profile.id)
    .gte("created_at", startOfYear);

  const totalPaiementsYearXAF = (paymentsThisYear || [])
    .filter((p) => p.devise === "XAF")
    .reduce((sum, p) => sum + Number(p.montant || 0), 0);

  // Leaderboard
  const { data: allAgents } = await supabase
    .from("profiles")
    .select("id, prenom, nom, poste, role")
    .in("role", ["agent", "admin", "super_admin"]);

  const agents = allAgents || [];

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
        .select("montant, devise")
        .eq("created_by", agent.id)
        .gte("created_at", startOfMonth);

      const agentPaiementsXAF = (agentPayments || [])
        .filter((p) => p.devise === "XAF")
        .reduce((sum, p) => sum + Number(p.montant || 0), 0);

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
      {/* HERO */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-nexus-blue-950 via-nexus-blue-900 to-nexus-blue-950 p-6 shadow-xl sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-nexus-orange-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-nexus-orange-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-2xl font-bold text-white shadow-2xl">
            {initials.toUpperCase() || "A"}
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-full bg-nexus-orange-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-nexus-orange-300">
              Espace Agent Premium
            </span>
            <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
              Bonjour, {profile.prenom || fullName}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {profile.poste || "Agent Nexus"}
              {myRank > 0 && (
                <>
                  {" - "}
                  <span className="text-nexus-orange-300">
                    {myRank}eme dans le classement
                  </span>
                </>
              )}
            </p>
          </div>

          {myRank > 0 && myRank <= 3 && (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500/20 backdrop-blur">
              <span className="text-3xl">
                {myRank === 1 ? "🥇" : myRank === 2 ? "🥈" : "🥉"}
              </span>
            </div>
          )}
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Performance ce mois
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-white">
              {overallProgress}%
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Encaisse ce mois
            </p>
            <p className="mt-1 font-display text-xl font-bold text-white">
              {formatMoney(totalPaiementsXAF, "XAF")}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Encaisse cette annee
            </p>
            <p className="mt-1 font-display text-xl font-bold text-white">
              {formatMoney(totalPaiementsYearXAF, "XAF")}
            </p>
          </div>
        </div>
      </div>

      {/* ACTIONS RAPIDES */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction
          href="/dashboard/agent/caisse"
          icon={ShoppingCart}
          label="Caisse rapide"
          color="from-green-500 to-green-700"
        />
        <QuickAction
          href="/dashboard/agent/rdv"
          icon={Calendar}
          label="Mes RDV"
          color="from-nexus-orange-500 to-nexus-orange-700"
        />
        <QuickAction
          href="/dashboard/super-admin/paiements/nouveau-lien"
          icon={Sparkles}
          label="Nouveau lien paiement"
          color="from-purple-500 to-purple-700"
        />
        <QuickAction
          href="/dashboard/agent/demandes"
          icon={FileText}
          label="Demandes clients"
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
          <StatCard
            icon={Calendar}
            label="RDV ce mois"
            value={String(rdvThisMonth || 0)}
            sublabel={`${rdvCompleted || 0} termines`}
            accent="orange"
          />
          <StatCard
            icon={Wallet}
            label="Paiements encaisses"
            value={String(totalPaiementsCount)}
            sublabel={formatMoney(totalPaiementsXAF, "XAF")}
            accent="green"
          />
          <StatCard
            icon={FileText}
            label="Dossiers traites"
            value={String(demandesThisMonth || 0)}
            sublabel="ce mois"
            accent="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="RDV cette annee"
            value={String(rdvThisYear || 0)}
            sublabel="cumul annuel"
            accent="purple"
          />
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
                    "flex items-center gap-4 rounded-2xl border p-4 transition",
                    agent.isCurrent
                      ? "border-nexus-orange-300 bg-gradient-to-r from-nexus-orange-50 to-white shadow"
                      : "border-slate-100 bg-white hover:bg-slate-50"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow",
                      rankColor
                    )}
                  >
                    {rankBadge ? (
                      <span className="text-2xl">{rankBadge}</span>
                    ) : (
                      <span className="text-lg">{rank}</span>
                    )}
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel: string;
  accent: "orange" | "green" | "blue" | "purple";
}) {
  const colorMap: Record<string, string> = {
    orange: "from-nexus-orange-500 to-nexus-orange-700",
    green: "from-green-500 to-green-700",
    blue: "from-blue-500 to-blue-700",
    purple: "from-purple-500 to-purple-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-nexus-blue-950">
            {value}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{sublabel}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
            colorMap[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
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
