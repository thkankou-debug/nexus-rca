import Link from "next/link";
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Wallet,
  UserCircle,
  Receipt,
  Plus,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { DemandesManager } from "@/components/dashboard/DemandesManager";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

function formatMoney(amount: number, currency = "XAF"): string {
  return `${amount.toLocaleString("fr-FR")} ${currency}`;
}

export default async function AgentDashboardPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  // ============================================================
  // Demandes
  // ============================================================
  const { data: demandesData } = await supabase
    .from("demandes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  const list = (demandesData || []) as Demande[];

  const { count: totalCount } = await supabase
    .from("demandes")
    .select("*", { count: "exact", head: true });
  const { count: enCoursCount } = await supabase
    .from("demandes")
    .select("*", { count: "exact", head: true })
    .eq("statut", "en_cours");
  const { count: urgentCount } = await supabase
    .from("demandes")
    .select("*", { count: "exact", head: true })
    .in("urgence", ["elevee", "critique"])
    .neq("statut", "complete");

  // ============================================================
  // Paiements encaisses ce mois (par cet agent)
  // ============================================================
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: paymentsThisMonth } = await supabase
    .from("payments")
    .select("montant_recu")
    .eq("agent_id", profile.id)
    .gte("date_paiement", startOfMonth.toISOString());

  const totalPaiementsMois = (paymentsThisMonth || []).reduce(
    (sum, p) => sum + Number(p.montant_recu || 0),
    0
  );

  // ============================================================
  // Clients crees par cet agent (total)
  // ============================================================
  const { count: clientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("created_by", profile.id);

  // ============================================================
  // Depenses en attente (de cet agent)
  // ============================================================
  const { count: depensesEnAttenteCount } = await supabase
    .from("expenses")
    .select("*", { count: "exact", head: true })
    .eq("created_by", profile.id)
    .eq("statut", "en_attente");

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
          Espace agent
        </h1>
        <p className="mt-1 text-slate-600">
          Traitez les demandes clients, encaissez les paiements et suivez votre activité.
        </p>
      </div>

      {/* ============================================================ */}
      {/* STATS DEMANDES */}
      {/* ============================================================ */}
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
        Demandes
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Demandes totales"
          value={totalCount ?? 0}
          icon={FileText}
          accent="blue"
          href="/dashboard/agent/demandes"
        />
        <StatCard
          label="En cours"
          value={enCoursCount ?? 0}
          icon={Clock}
          accent="orange"
          href="/dashboard/agent/demandes"
        />
        <StatCard
          label="Urgentes"
          value={urgentCount ?? 0}
          icon={AlertTriangle}
          accent="red"
          href="/dashboard/agent/demandes"
        />
        <StatCard
          label="Récentes"
          value={list.length}
          icon={CheckCircle2}
          accent="green"
        />
      </div>

      {/* ============================================================ */}
      {/* STATS ACTIVITE PERSO */}
      {/* ============================================================ */}
      <h2 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wider text-nexus-orange-600">
        Mon activité
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Encaissé ce mois"
          value={formatMoney(totalPaiementsMois)}
          icon={Wallet}
          accent="green"
          href="/dashboard/agent/paiements"
        />
        <StatCard
          label="Clients créés"
          value={clientsCount ?? 0}
          icon={UserCircle}
          accent="blue"
          href="/dashboard/agent/clients"
        />
        <StatCard
          label="Dépenses en attente"
          value={depensesEnAttenteCount ?? 0}
          icon={Receipt}
          accent="orange"
          href="/dashboard/agent/depenses"
        />
      </div>

      {/* ============================================================ */}
      {/* ACTIONS RAPIDES */}
      {/* ============================================================ */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-nexus-blue-50 to-nexus-orange-50 p-5 shadow-sm">
        <h2 className="font-display text-base font-bold text-nexus-blue-950">
          Actions rapides
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/dashboard/agent/clients"
            label="Nouveau client"
            icon={UserCircle}
            color="blue"
          />
          <QuickAction
            href="/dashboard/agent/paiements"
            label="Enregistrer paiement"
            icon={Wallet}
            color="orange"
          />
          <QuickAction
            href="/dashboard/agent/depenses"
            label="Déclarer dépense"
            icon={Receipt}
            color="purple"
          />
          <QuickAction
            href="/dashboard/agent/demandes"
            label="Voir demandes"
            icon={FileText}
            color="green"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* DEMANDES RECENTES */}
      {/* ============================================================ */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-nexus-blue-950">
          Demandes récentes
        </h2>
        <DemandesManager initialDemandes={list} />
      </div>
    </DashboardShell>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================
function QuickAction({
  href,
  label,
  icon: Icon,
  color,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "orange" | "purple" | "green";
}) {
  const colorMap = {
    blue: "bg-nexus-blue-100 text-nexus-blue-700",
    orange: "bg-nexus-orange-100 text-nexus-orange-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-emerald-100 text-emerald-700",
  };

  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-nexus-blue-950">{label}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-nexus-blue-950" />
    </Link>
  );
}
