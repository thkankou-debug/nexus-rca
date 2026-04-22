import Link from "next/link";
import { FileText, Clock, CheckCircle2, Plus, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard, StatusBadge, UrgenceBadge } from "@/components/dashboard/StatCard";
import { formatDate, whatsappLink } from "@/lib/utils";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const profile = await requireProfile(["client", "agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data: demandes } = await supabase
    .from("demandes")
    .select("*")
    .eq("client_id", profile.id)
    .order("created_at", { ascending: false });

  const list = (demandes || []) as Demande[];
  const totalCount = list.length;
  const inProgress = list.filter((d) => d.statut === "en_cours").length;
  const completed = list.filter((d) => d.statut === "complete").length;

  return (
    <DashboardShell profile={profile}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Bonjour {profile.prenom || profile.nom} 👋
          </h1>
          <p className="mt-1 text-slate-600">
            Voici un aperçu de votre activité Nexus RCA.
          </p>
        </div>
        <Link
          href="/demande"
          className="inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-nexus-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouvelle demande
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Demandes totales" value={totalCount} icon={FileText} accent="blue" />
        <StatCard label="En cours" value={inProgress} icon={Clock} accent="orange" />
        <StatCard label="Complétées" value={completed} icon={CheckCircle2} accent="green" />
      </div>

      {/* Recent demandes */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="font-display text-xl font-bold text-nexus-blue-950">
            Mes demandes récentes
          </h2>
          {totalCount > 5 && (
            <Link
              href="/dashboard/client/demandes"
              className="text-sm font-semibold text-nexus-orange-600 hover:text-nexus-orange-700"
            >
              Voir tout →
            </Link>
          )}
        </div>

        {list.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-600">Vous n'avez pas encore de demande.</p>
            <Link
              href="/demande"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-nexus-blue-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-nexus-blue-900"
            >
              <Plus className="h-4 w-4" />
              Faire ma première demande
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.slice(0, 5).map((d) => (
              <div key={d.id} className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-nexus-blue-950">{d.service}</h3>
                    <StatusBadge status={d.statut} />
                    <UrgenceBadge level={d.urgence} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {d.description}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Envoyée le {formatDate(d.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick contact */}
      <div className="mt-8 rounded-2xl bg-gradient-to-br from-nexus-blue-900 to-nexus-blue-950 p-8 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-xl font-bold">Besoin d'aide rapide ?</h3>
            <p className="mt-1 text-white/75">
              Nos conseillers répondent en moyenne sous 15 min sur WhatsApp.
            </p>
          </div>
          <a
            href={whatsappLink("Bonjour, je suis un client Nexus RCA et j'ai une question.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-green-600"
          >
            <MessageCircle className="h-4 w-4" />
            Contacter sur WhatsApp
          </a>
        </div>
      </div>
    </DashboardShell>
  );
}
