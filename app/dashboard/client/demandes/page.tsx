import Link from "next/link";
import { Plus, FileText, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatusBadge, UrgenceBadge } from "@/components/dashboard/StatCard";
import { DemandeDocumentsList } from "@/components/dashboard/DemandeDocumentsList";
import { formatDate } from "@/lib/utils";
import type { Demande } from "@/types";

export const dynamic = "force-dynamic";

export default async function ClientDemandesPage() {
  const profile = await requireProfile(["client", "agent", "admin", "super_admin"]);
  const supabase = createClient();

  const { data: demandes } = await supabase
    .from("demandes")
    .select("*")
    .eq("client_id", profile.id)
    .order("created_at", { ascending: false });

  const list = (demandes || []) as Demande[];

  return (
    <DashboardShell profile={profile}>
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-nexus-blue-950">
            Mes demandes
          </h1>
          <p className="mt-1 text-slate-600">Suivez l'état de tous vos dossiers.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/demande"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-nexus-blue-950 shadow-sm hover:border-slate-300"
          >
            <Plus className="h-4 w-4" />
            Rapide
          </Link>
          <Link
            href="/demande/complet"
            className="inline-flex items-center gap-2 rounded-full bg-nexus-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-nexus-orange-600"
          >
            <FileText className="h-4 w-4" />
            Dossier complet
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-600">Aucune demande pour le moment.</p>
          <Link
            href="/demande/complet"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-nexus-blue-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-nexus-blue-900"
          >
            <Plus className="h-4 w-4" />
            Démarrer mon premier dossier
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:shadow-card-hover"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-nexus-blue-950">{d.service}</h3>
                <StatusBadge status={d.statut} />
                <UrgenceBadge level={d.urgence} />
                {d.traitement_prioritaire && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-nexus-orange-500 to-nexus-orange-600 px-2 py-0.5 text-xs font-semibold text-white">
                    <Zap className="h-3 w-3" />
                    Prioritaire
                  </span>
                )}
              </div>
              {d.objet && (
                <p className="mt-2 font-medium text-nexus-blue-900">{d.objet}</p>
              )}
              <p className="mt-1 text-sm text-slate-600">{d.description}</p>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <DemandeDocumentsList demandeId={d.id} />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Envoyée le {formatDate(d.created_at)} · Réf. {d.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
