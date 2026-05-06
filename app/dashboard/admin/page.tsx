import Link from "next/link";
import {
  Users,
  FileText,
  CalendarCheck,
  Wallet,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserCircle,
  Plane,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { StatCard, StatusBadge, UrgenceBadge } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, cn } from "@/lib/utils";
import type { Demande, DemandeStatus } from "@/types";

export const metadata = {
  title: "Tableau de bord | Admin",
};

export const dynamic = "force-dynamic";

const STATUSES_PIPELINE: { key: DemandeStatus; label: string; tone: string }[] = [
  { key: "nouveau", label: "Nouveau", tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  { key: "en_cours", label: "En cours", tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  { key: "en_attente", label: "En attente", tone: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  { key: "incomplet", label: "Incomplet", tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  { key: "en_traitement", label: "En traitement", tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { key: "complete", label: "Complétée", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { key: "annule", label: "Annulée", tone: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300" },
];

function formatMoney(amount: number, currency = "XAF"): string {
  return `${Math.round(amount).toLocaleString("fr-FR")} ${currency}`;
}

export default async function AdminDashboardPage() {
  const profile = await requireProfile(["admin", "super_admin"]);
  const supabase = createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 7);
  const weekStartISO = weekStart.toISOString();

  // ─── Chargement parallèle ────────────────────────────────────────────────
  const [
    pipelineRes,
    nonAssigneesRes,
    rdvTodayRes,
    paymentsTodayRes,
    paymentsWeekRes,
    activeAgentsRes,
    recentActivityRes,
  ] = await Promise.all([
    // Comptage par statut (pipeline)
    supabase.from("demandes").select("statut"),
    // Demandes non-assignées (à dispatcher)
    supabase
      .from("demandes")
      .select("*")
      .is("agent_id", null)
      .neq("statut", "annule")
      .neq("statut", "complete")
      .order("created_at", { ascending: false })
      .limit(5),
    // RDV aujourd'hui
    supabase
      .from("rendez_vous")
      .select("id, date_rdv, sujet, statut, client_id")
      .gte("date_rdv", todayISO)
      .lt("date_rdv", tomorrowISO)
      .order("date_rdv", { ascending: true }),
    // Paiements aujourd'hui
    supabase
      .from("payments")
      .select("montant_recu, agent_id, created_at")
      .gte("created_at", todayISO),
    // Paiements 7 derniers jours par agent
    supabase
      .from("payments")
      .select("montant_recu, agent_id, created_at")
      .gte("created_at", weekStartISO),
    // Agents actifs
    supabase
      .from("profiles")
      .select("id, nom, prenom, role")
      .in("role", ["agent", "admin"])
      .eq("actif", true),
    // 8 dernières demandes
    supabase
      .from("demandes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  // ─── Aggrégations ────────────────────────────────────────────────────────
  const allStatuts = (pipelineRes.data || []) as { statut: DemandeStatus }[];
  const pipelineCounts: Record<DemandeStatus, number> = {
    nouveau: 0,
    en_cours: 0,
    en_attente: 0,
    incomplet: 0,
    en_traitement: 0,
    complete: 0,
    annule: 0,
  };
  for (const d of allStatuts) pipelineCounts[d.statut] = (pipelineCounts[d.statut] ?? 0) + 1;
  const totalDemandes = allStatuts.length;
  const aTraiter = pipelineCounts.nouveau + pipelineCounts.en_cours + pipelineCounts.en_attente + pipelineCounts.incomplet + pipelineCounts.en_traitement;

  const nonAssignees = (nonAssigneesRes.data || []) as Demande[];
  const rdvToday = rdvTodayRes.data || [];

  const paymentsToday = (paymentsTodayRes.data || []) as Array<{ montant_recu: number; agent_id: string | null }>;
  const totalToday = paymentsToday.reduce((s, p) => s + Number(p.montant_recu || 0), 0);

  const paymentsWeek = (paymentsWeekRes.data || []) as Array<{ montant_recu: number; agent_id: string | null }>;
  const agents = (activeAgentsRes.data || []) as Array<{ id: string; nom: string; prenom: string | null; role: string }>;
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  // Top 3 agents par encaissement semaine
  const totalsByAgent = new Map<string, number>();
  for (const p of paymentsWeek) {
    if (!p.agent_id) continue;
    totalsByAgent.set(p.agent_id, (totalsByAgent.get(p.agent_id) ?? 0) + Number(p.montant_recu || 0));
  }
  const topAgents = Array.from(totalsByAgent.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, total]) => ({
      id,
      nom: agentMap.get(id)
        ? `${agentMap.get(id)?.prenom ?? ""} ${agentMap.get(id)?.nom ?? ""}`.trim() || "Agent"
        : "Agent",
      total,
    }));

  const recentActivity = (recentActivityRes.data || []) as Demande[];

  const initials = (
    (profile.prenom?.[0] ?? "") + (profile.nom?.[0] ?? "")
  ).toUpperCase();
  const todayLabel = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <DashboardShell profile={profile}>
      {/* ─── Hero Premium ─────────────────────────────────────────────── */}
      <DashboardHero
        initials={initials}
        roleLabel="Espace administrateur"
        title={`Bonjour ${profile.prenom || profile.nom}`}
        subtitle={`${todayLabel} · Vue opérationnelle de l'agence`}
        stats={[
          {
            label: "À traiter",
            value: String(aTraiter),
            accent: aTraiter > 0 ? "orange" : "white",
          },
          {
            label: "Non-assignées",
            value: String(nonAssignees.length),
            accent: nonAssignees.length > 0 ? "rose" : "white",
          },
          {
            label: "Encaissé aujourd'hui",
            value: formatMoney(totalToday),
            accent: "emerald",
          },
        ]}
        rightSlot={
          <Link
            href="/dashboard/admin/demandes"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            Toutes demandes
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {/* ─── Quick Actions ─────────────────────────────────────────────── */}
      <DashboardQuickActions
        title="Actions rapides"
        actions={[
          {
            href: "/dashboard/admin/demandes",
            icon: FileText,
            label: "Demandes",
            color: "orange",
            badge: aTraiter,
          },
          {
            href: "/dashboard/admin/demandes-visa",
            icon: Plane,
            label: "Demandes visa",
            color: "indigo",
          },
          {
            href: "/dashboard/admin/clients",
            icon: UserCircle,
            label: "Clients",
            color: "blue",
          },
          {
            href: "/dashboard/admin/agents",
            icon: Briefcase,
            label: "Agents",
            color: "purple",
          },
          {
            href: "/dashboard/admin/rdv",
            icon: CalendarCheck,
            label: "Rendez-vous",
            color: "emerald",
          },
          {
            href: "/dashboard/admin/paiements",
            icon: Wallet,
            label: "Paiements",
            color: "amber",
          },
        ]}
      />

      {/* ─── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="À traiter"
          value={aTraiter}
          icon={FileText}
          accent="orange"
          href="/dashboard/admin/demandes"
        />
        <StatCard
          label="Non-assignées"
          value={nonAssignees.length}
          icon={AlertTriangle}
          accent={nonAssignees.length > 0 ? "red" : "blue"}
          href="/dashboard/admin/demandes"
        />
        <StatCard
          label="RDV aujourd'hui"
          value={rdvToday.length}
          icon={CalendarCheck}
          accent="blue"
          href="/dashboard/admin/rdv"
        />
        <StatCard
          label="Encaissé aujourd'hui"
          value={formatMoney(totalToday)}
          icon={Wallet}
          accent="green"
          href="/dashboard/admin/paiements"
        />
      </div>

      {/* ─── Pipeline demandes ──────────────────────────────────────────── */}
      <section className="mt-10 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-headline text-ink">Pipeline demandes</h2>
              <p className="text-caption text-ink-muted">
                Répartition par statut sur l'ensemble des dossiers ({totalDemandes})
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATUSES_PIPELINE.map((s) => {
            const count = pipelineCounts[s.key] ?? 0;
            const pct = totalDemandes > 0 ? Math.round((count / totalDemandes) * 100) : 0;
            return (
              <div
                key={s.key}
                className="rounded-2xl border border-line bg-surface-sunken p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-overline", s.tone)}>
                    {s.label}
                  </span>
                  <span className="text-caption text-ink-muted">{pct}%</span>
                </div>
                <p className="mt-3 font-display text-display-sm text-ink">{count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── 2 colonnes : non-assignées + RDV jour ──────────────────────── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Non-assignées */}
        <section className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-headline text-ink">À dispatcher</h2>
                <p className="text-caption text-ink-muted">
                  Demandes sans agent assigné
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/admin/demandes"
              className="text-caption font-semibold text-brand hover:underline"
            >
              Tout voir
            </Link>
          </div>
          {nonAssignees.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="File vide"
              description="Toutes les demandes sont assignées."
            />
          ) : (
            <ul className="space-y-2">
              {nonAssignees.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-sunken px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-semibold text-ink">
                      {d.nom_complet}
                    </p>
                    <p className="truncate text-caption text-ink-muted">
                      {d.service} · {formatDate(d.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <UrgenceBadge level={d.urgence} />
                    <StatusBadge status={d.statut} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* RDV aujourd'hui */}
        <section className="rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-nexus-blue-100 text-nexus-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-headline text-ink">RDV aujourd'hui</h2>
                <p className="text-caption text-ink-muted">
                  {rdvToday.length} rendez-vous prévus
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/admin/rdv"
              className="text-caption font-semibold text-brand hover:underline"
            >
              Calendrier complet
            </Link>
          </div>
          {rdvToday.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Aucun RDV"
              description="Aucun rendez-vous prévu aujourd'hui."
            />
          ) : (
            <ul className="space-y-2">
              {rdvToday.map((r) => {
                const date = new Date(r.date_rdv);
                const heure = date.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-sunken px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="rounded-lg bg-brand-subtle px-2 py-1 text-overline text-brand">
                        {heure}
                      </span>
                      <p className="truncate text-body-sm font-semibold text-ink">
                        {r.sujet || "RDV"}
                      </p>
                    </div>
                    <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-overline text-ink-muted">
                      {r.statut}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* ─── Top agents semaine ─────────────────────────────────────────── */}
      <section className="mt-8 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-headline text-ink">Top agents — 7 derniers jours</h2>
              <p className="text-caption text-ink-muted">
                Performance par encaissements
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/admin/agents"
            className="text-caption font-semibold text-brand hover:underline"
          >
            Voir tous les agents
          </Link>
        </div>
        {topAgents.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Pas d'encaissement cette semaine"
            description="Aucun paiement enregistré sur les 7 derniers jours."
          />
        ) : (
          <ol className="space-y-2">
            {topAgents.map((a, i) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-sunken px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-nexus-blue-700 to-nexus-orange-500 text-caption font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="truncate text-body-sm font-semibold text-ink">
                    {a.nom}
                  </p>
                </div>
                <p className="font-display text-body-sm text-brand">
                  {formatMoney(a.total)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ─── Activité récente ───────────────────────────────────────────── */}
      <section className="mt-8 rounded-3xl border border-line bg-surface-elevated p-6 shadow-elev-2 sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-subtle text-brand">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-headline text-ink">Activité récente</h2>
              <p className="text-caption text-ink-muted">
                8 dernières demandes reçues
              </p>
            </div>
          </div>
        </div>
        {recentActivity.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Pas d'activité"
            description="Aucune demande pour le moment."
          />
        ) : (
          <ul className="space-y-2">
            {recentActivity.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-sunken px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-semibold text-ink">
                    {d.nom_complet}
                  </p>
                  <p className="truncate text-caption text-ink-muted">
                    {d.service} · {formatDate(d.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <UrgenceBadge level={d.urgence} />
                  <StatusBadge status={d.statut} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardShell>
  );
}
