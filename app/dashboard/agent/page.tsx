import { FileText, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { DemandesManager } from "@/components/dashboard/DemandesManager";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

export default async function AgentDashboardPage() {
  const profile = await requireProfile(["agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data } = await supabase
    .from("demandes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  const list = (data || []) as Demande[];

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
  const { count: doneCount } = await supabase
    .from("demandes")
    .select("*", { count: "exact", head: true })
    .eq("statut", "complete");

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
          Espace agent
        </h1>
        <p className="mt-1 text-slate-600">
          Traitez les demandes clients et suivez leur avancement.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Demandes totales" value={totalCount ?? 0} icon={FileText} accent="blue" />
        <StatCard label="En cours" value={enCoursCount ?? 0} icon={Clock} accent="orange" />
        <StatCard label="Urgentes" value={urgentCount ?? 0} icon={AlertTriangle} accent="red" />
        <StatCard label="Complétées" value={doneCount ?? 0} icon={CheckCircle2} accent="green" />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-bold text-nexus-blue-950">
          Demandes récentes
        </h2>
        <DemandesManager initialDemandes={list} />
      </div>
    </DashboardShell>
  );
}
