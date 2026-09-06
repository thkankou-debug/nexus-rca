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
import { AgentAvatar } from "@/components/dashboard/AgentAvatar";
import { StatCard, StatusBadge, UrgenceBadge } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, cn } from "@/lib/utils";
import type { Demande, DemandeStatus } from "@/types";

export const metadata = {
  title: "Tableau de bord | Admin",
};

export const dynamic = "force-dynamic";

// P3 (migration 049a/049b) : machine à états à 15 valeurs remplace les 7
// valeurs 2026-04 — les 16 dossiers réels ont été réassignés, ces libellés
// doivent suivre sous peine d'afficher des zéros partout. Panneau simple,
// pas redessiné : la vraie refonte du pipeline (étapes cliquables) est A4.
const STATUSES_PIPELINE: { key: DemandeStatus; label: string; tone: string }[] = [
  { key: "nouvelle_demande", label: "Nouvelle demande", tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  { key: "qualification", label: "Qualification", tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  { key: "documents_demandes", label: "Documents demandés", tone: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  { key: "dossier_incomplet", label: "Dossier incomplet", tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  { key: "etude_faisabilite", label: "Étude de faisabilité", tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { key: "devis_envoye", label: "Devis envoyé", tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { key: "devis_accepte", label: "Devis accepté", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { key: "paiement_attente", label: "Paiement en attente", tone: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  { key: "traitement", label: "Traitement", tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  { key: "transmis_partenaire", label: "Transmis partenaire", tone: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  { key: "decision_recue", label: "Décision reçue", tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  { key: "termine", label: "Terminée", tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { key: "refuse", label: "Refusée", tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  { key: "annule", label: "Annulée", tone: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300" },
  { key: "archive", label: "Archivée", tone: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300" },
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
    // RDV aujourd'hui (D3 : appointments est la table canonique, rendez_vous
    // est obsolète — voir migration 054)
    supabase
      .from("appointments")
      .select("id, rdv_date, rdv_heure, service_type, statut, client_id")
      .eq("rdv_date", todayISO.split("T")[0])
      .order("rdv_heure", { ascending: true }),
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
    // Valeurs 2026-04 : conservees pour le typage (l'enum ne les retire
    // jamais), plus aucun dossier reel ne les porte depuis la reassignation
    // P3 (migration 049b) — voir docs/AUDIT_CRM.md.
    nouveau: 0,
    en_cours: 0,
    en_attente: 0,
    incomplet: 0,
    en_traitement: 0,
    complete: 0,
    annule: 0,
    nouvelle_demande: 0,
    qualification: 0,
    documents_demandes: 0,
    dossier_incomplet: 0,
    etude_faisabilite: 0,
    devis_envoye: 0,
    devis_accepte: 0,
    paiement_attente: 0,
    traitement: 0,
    transmis_partenaire: 0,
    decision_recue: 0,
    termine: 0,
    refuse: 0,
    archive: 0,
  };
  for (const d of allStatuts) pipelineCounts[d.statut] = (pipelineCounts[d.statut] ?? 0) + 1;
  const totalDemandes = allStatuts.length;
  // "À traiter" = tout dossier qui n'est pas dans un état final — plus
  // robuste qu'une liste d'états actifs a maintenir a la main (P3).
  const aTraiter =
    totalDemandes -
    (pipelineCounts.termine +
      pipelineCounts.refuse +
      pipelineCounts.annule +
      pipelineCounts.archive +
      pipelineCounts.complete);

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
      <SectionPanel
        title="Pipeline demandes"
        subtitle={`Répartition par statut sur l'ensemble des dossiers (${totalDemandes})`}
        icon={Activity}
        className="mt-10"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATUSES_PIPELINE.map((s) => {
            const count = pipelineCounts[s.key] ?? 0;
            const pct = totalDemandes > 0 ? Math.round((count / totalDemandes) * 100) : 0;
            return (
              <div
                key={s.key}
                className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", s.tone)}>
                    {s.label}
                  </span>
                  <span className="text-xs text-slate-500">{pct}%</span>
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-nexus-blue-950 tabular-nums">{count}</p>
              </div>
            );
          })}
        </div>
      </SectionPanel>

      {/* ─── 2 colonnes : non-assignées + RDV jour ──────────────────────── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionPanel
          title="À dispatcher"
          subtitle="Demandes sans agent assigné"
          icon={AlertTriangle}
          iconAccent="rose"
          link={{ href: "/dashboard/admin/demandes", label: "Tout voir" }}
        >
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
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-nexus-blue-950">
                      {d.nom_complet}
                    </p>
                    <p className="truncate text-xs text-slate-500">
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
        </SectionPanel>

        <SectionPanel
          title="RDV aujourd'hui"
          subtitle={`${rdvToday.length} rendez-vous prévus`}
          icon={CalendarCheck}
          iconAccent="blue"
          link={{ href: "/dashboard/admin/rdv", label: "Calendrier complet" }}
        >
          {rdvToday.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Aucun RDV"
              description="Aucun rendez-vous prévu aujourd'hui."
            />
          ) : (
            <ul className="space-y-2">
              {rdvToday.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="rounded-lg bg-nexus-orange-100 px-2 py-1 text-[10px] font-bold text-nexus-orange-700 tabular-nums">
                      {r.rdv_heure}
                    </span>
                    <p className="truncate text-sm font-semibold text-nexus-blue-950">
                      {r.service_type || "RDV"}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {r.statut}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionPanel>
      </div>

      {/* ─── Top agents semaine ─────────────────────────────────────────── */}
      <SectionPanel
        title="Top agents — 7 derniers jours"
        subtitle="Performance par encaissements"
        icon={TrendingUp}
        link={{ href: "/dashboard/admin/agents", label: "Voir tous les agents" }}
        className="mt-8"
      >
        {topAgents.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Pas d'encaissement cette semaine"
            description="Aucun paiement enregistré sur les 7 derniers jours."
          />
        ) : (
          <ol className="space-y-2">
            {topAgents.map((a, i) => {
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
              return (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AgentAvatar
                      name={a.nom}
                      size="md"
                      badge={medal ? <span className="text-xs">{medal}</span> : undefined}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-nexus-blue-950">
                        {a.nom}
                      </p>
                      <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Rang #{i + 1}
                      </p>
                    </div>
                  </div>
                  <p className="font-display text-sm font-bold text-nexus-orange-600 tabular-nums">
                    {formatMoney(a.total)}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </SectionPanel>

      {/* ─── Activité récente ───────────────────────────────────────────── */}
      <SectionPanel
        title="Activité récente"
        subtitle="8 dernières demandes reçues"
        icon={Users}
        className="mt-8"
      >
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
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-nexus-blue-950">
                    {d.nom_complet}
                  </p>
                  <p className="truncate text-xs text-slate-500">
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
      </SectionPanel>
    </DashboardShell>
  );
}

// ─── Section partagée locale (header harmonisé + card uniforme) ─────────────
function SectionPanel({
  title,
  subtitle,
  icon: Icon,
  iconAccent = "orange",
  link,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: typeof Activity;
  iconAccent?: "orange" | "rose" | "blue" | "emerald";
  link?: { href: string; label: string };
  className?: string;
  children: React.ReactNode;
}) {
  const accentClass = {
    orange:
      "bg-gradient-to-br from-nexus-orange-500 to-nexus-orange-700 text-white",
    rose: "bg-gradient-to-br from-rose-500 to-rose-700 text-white",
    blue: "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
    emerald:
      "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white",
  }[iconAccent];

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7",
        className
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm",
              accentClass
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold text-nexus-blue-950 sm:text-lg">
              {title}
            </h2>
            {subtitle && (
              <p className="truncate text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
        {link && (
          <Link
            href={link.href}
            className="shrink-0 text-xs font-semibold text-nexus-orange-600 hover:underline"
          >
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
